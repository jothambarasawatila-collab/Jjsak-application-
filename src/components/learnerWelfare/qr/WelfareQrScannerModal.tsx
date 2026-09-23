import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Zap,
  ZapOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Thermometer,
  ShieldCheck,
  Phone,
  Droplet,
  Send,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Student, User as CurrentUser } from '../../../types';
import {
  LearnerHealthProfile,
  WelfareEventCheckInRecord,
  WelfareEventType,
  WelfareCheckInStatus,
  HealthIncidentRecord,
  CounselingSession,
} from '../../../types/learnerWelfare';
import { parseScannedQrData, playScanSound, triggerHapticFeedback } from '../../../utils/qrPassUtils';

interface WelfareQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  healthProfiles: Record<string, LearnerHealthProfile>;
  currentUser?: CurrentUser;
  defaultEventType?: WelfareEventType;
  onCheckInCompleted: (record: WelfareEventCheckInRecord) => void;
  onAddHealthIncident?: (incident: HealthIncidentRecord) => void;
  onAddCounselingSession?: (session: CounselingSession) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const WelfareQrScannerModal: React.FC<WelfareQrScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  healthProfiles,
  currentUser,
  defaultEventType = 'Sickbay Visit & Triage',
  onCheckInCompleted,
  onAddHealthIncident,
  onAddCounselingSession,
  onLogAudit,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera & Scan State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [isPausedScanning, setIsPausedScanning] = useState(false);

  // Active Scanned Student & Check-in Form
  const [detectedStudent, setDetectedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [eventType, setEventType] = useState<WelfareEventType>(defaultEventType);
  const [temperature, setTemperature] = useState('36.8');
  const [symptoms, setSymptoms] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [medication, setMedication] = useState('');
  const [status, setStatus] = useState<WelfareCheckInStatus>('Completed');
  const [parentNotification, setParentNotification] = useState(true);
  const [notes, setNotes] = useState('');
  const [lastCheckInResult, setLastCheckInResult] = useState<WelfareEventCheckInRecord | null>(null);

  // Sync default event type when prop changes
  useEffect(() => {
    if (defaultEventType) {
      setEventType(defaultEventType);
    }
  }, [defaultEventType]);

  // Stop camera media tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Frame scanner loop
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data && !isPausedScanning) {
      handleQrFound(code.data);
      return;
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [isPausedScanning]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Webcam not supported on this browser. Use photo upload or manual search.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setCameraActive(true);

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));
      }

      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings, or upload an image.'
          : 'Unable to start camera stream. You can upload a QR pass image or search by Admission Number.'
      );
      setCameraActive(false);
    }
  }, [facingMode, scanVideoFrame, stopCamera]);

  // Start/Stop on Open/Close
  useEffect(() => {
    if (isOpen) {
      setLastCheckInResult(null);
      setDetectedStudent(null);
      setIsPausedScanning(false);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Toggle Torch
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Could not toggle torch:', err);
      }
    }
  };

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle successful QR detection
  const handleQrFound = (qrText: string) => {
    setIsPausedScanning(true);
    const parsed = parseScannedQrData(qrText, students);

    if (parsed.student) {
      playScanSound('success');
      triggerHapticFeedback([80, 50, 80]);
      setDetectedStudent(parsed.student);
      setScanMessage(`Verified: ${parsed.student.name} (${parsed.student.admNo})`);

      // Pre-fill symptoms / action based on event type
      if (eventType === 'Sickbay Visit & Triage') {
        setStatus('Admitted to Sickbay');
        setSymptoms('Student presented at sickbay reporting indisposition.');
        setActionTaken('Temperature and vitals recorded. Rest in resting bay.');
      } else if (eventType === 'Routine Health Screening') {
        setStatus('Completed');
        setSymptoms('Annual routine wellness, dental & eyesight checkup.');
        setActionTaken('Normal general health examination completed. Cleared.');
      } else if (eventType === 'Deworming & Immunization') {
        setStatus('Completed');
        setSymptoms('Routine public health deworming protocol.');
        setActionTaken('Mebendazole 500mg chewable tablet administered with water.');
        setMedication('Mebendazole 500mg');
      } else if (eventType === 'Guidance & Counseling Intake') {
        setStatus('Completed');
        setSymptoms('Guidance counseling intake check-in.');
        setActionTaken('Support session conducted by school counselor.');
      } else if (eventType === 'Nutrition & Feeding Program') {
        setStatus('Completed');
        setSymptoms('Nutritional support program check-in.');
        setActionTaken('Nutrient-rich lunch/breakfast ration dispensed.');
      }
    } else {
      playScanSound('warning');
      triggerHapticFeedback([200]);
      setScanMessage(`QR Scanned, but no matching learner record found in registry: "${qrText.slice(0, 30)}..."`);
      setTimeout(() => {
        setIsPausedScanning(false);
      }, 2000);
    }
  };

  // Handle File Upload Scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQrFound(code.data);
          } else {
            playScanSound('error');
            setScanMessage('No legible QR code found in uploaded image. Please try another angle.');
          }
        }
        setIsProcessingFile(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Manual Selection from Dropdown / Search
  const handleSelectManualStudent = (s: Student) => {
    playScanSound('success');
    setDetectedStudent(s);
    setScanMessage(`Manually Selected: ${s.name} (${s.admNo})`);
    setIsPausedScanning(true);
  };

  // Filtered students for manual search
  const manualFilteredStudents = students.filter((s) => {
    if (!manualSearch.trim()) return false;
    const term = manualSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.admNo.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term)
    );
  }).slice(0, 5);

  // Selected Student Health Profile
  const activeProfile = detectedStudent ? healthProfiles[detectedStudent.id] : undefined;

  // Confirm Check-In
  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedStudent) return;

    const checkInRecord: WelfareEventCheckInRecord = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: detectedStudent.id,
      admNo: detectedStudent.admNo,
      studentName: detectedStudent.name,
      className: `${detectedStudent.grade} ${detectedStudent.stream || detectedStudent.classArm || ''}`.trim(),
      gender: detectedStudent.gender,
      eventType,
      timestamp: new Date().toISOString(),
      temperatureCelsius: parseFloat(temperature) || 36.8,
      symptomsOrReason: symptoms || `${eventType} check-in`,
      bloodGroup: activeProfile?.bloodGroup || 'Unknown',
      allergies: activeProfile?.allergies || [],
      firstAidOrAction: actionTaken,
      medicationGiven: medication || undefined,
      checkedInBy: currentUser?.fullName || 'Welfare & Health Officer',
      parentNotified: parentNotification,
      status,
      notes,
      station: 'Health Clinic & Welfare Hub Kiosk',
    };

    // 1. Dispatch Check-in record
    onCheckInCompleted(checkInRecord);

    // 2. If it's a sickbay or medical check-in, also log into health incidents
    if (
      (eventType === 'Sickbay Visit & Triage' || eventType === 'Emergency Medical Check-in') &&
      onAddHealthIncident
    ) {
      const incident: HealthIncidentRecord = {
        id: `h-inc-${Date.now()}`,
        studentId: detectedStudent.id,
        studentName: detectedStudent.name,
        admNo: detectedStudent.admNo,
        className: checkInRecord.className,
        dateTime: new Date().toISOString(),
        incidentType: eventType === 'Emergency Medical Check-in' ? 'Medical Emergency' : 'Sickbay Visit',
        symptoms: symptoms || 'Attended via QR event check-in.',
        temperatureCelsius: checkInRecord.temperatureCelsius,
        firstAidGiven: actionTaken || 'Basic triage care.',
        medicationAdministered: medication || undefined,
        nurseOrAttendant: checkInRecord.checkedInBy,
        parentInformed: parentNotification,
        referredToHospital: status === 'Referred to Hospital',
        hospitalName: status === 'Referred to Hospital' ? 'Kitale County Referral Hospital' : undefined,
        outcome: status === 'Admitted to Sickbay' ? 'Admitted to resting bay for observation.' : 'Treated and cleared.',
        followUpRequired: status === 'Under Observation' || status === 'Referred to Hospital',
      };
      onAddHealthIncident(incident);
    }

    // 3. If guidance & counseling intake, log counseling session
    if (eventType === 'Guidance & Counseling Intake' && onAddCounselingSession) {
      const session: CounselingSession = {
        id: `coun-${Date.now()}`,
        studentId: detectedStudent.id,
        studentName: detectedStudent.name,
        admNo: detectedStudent.admNo,
        className: checkInRecord.className,
        date: new Date().toISOString().split('T')[0],
        counselorName: checkInRecord.checkedInBy,
        category: 'Emotional Well-being',
        sessionSummary: symptoms || 'Counseling intake logged via QR Welfare Hub.',
        supportPlan: actionTaken || 'Follow-up intake scheduled.',
        confidentialityLevel: 'Standard Welfare Team',
        status: 'Ongoing',
      };
      onAddCounselingSession(session);
    }

    // 4. Log Audit
    if (onLogAudit) {
      onLogAudit(
        'HEALTH_WELFARE_QR_CHECKIN',
        `Student ${detectedStudent.name} (${detectedStudent.admNo}) checked in for ${eventType} by ${checkInRecord.checkedInBy}. Temp: ${temperature}°C. Status: ${status}. Parent Notified: ${parentNotification}`
      );
    }

    playScanSound('success');
    triggerHapticFeedback([100, 100, 200]);
    setLastCheckInResult(checkInRecord);
    setDetectedStudent(null);
    setSymptoms('');
    setActionTaken('');
    setMedication('');
    setNotes('');
  };

  // Reset to scan next student
  const handleScanNext = () => {
    setLastCheckInResult(null);
    setDetectedStudent(null);
    setScanMessage(null);
    setManualSearch('');
    setIsPausedScanning(false);
    if (!cameraActive) {
      startCamera();
    } else {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Student Health &amp; Welfare QR Scanner
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Event Kiosk
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Point camera at student health pass QR code or upload card photo for automated triage and check-in.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Success Check-in Notification Banner */}
          {lastCheckInResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Check-in Recorded: {lastCheckInResult.studentName} ({lastCheckInResult.admNo})
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    {lastCheckInResult.eventType} • Temp: {lastCheckInResult.temperatureCelsius}°C • Status:{' '}
                    <span className="font-semibold text-white">{lastCheckInResult.status}</span>
                    {lastCheckInResult.parentNotified && ' • Parent SMS/WhatsApp Alert Dispatched'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleScanNext}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Scan Next Student
              </button>
            </div>
          )}

          {/* Grid Layout: Scanner on Left, Student Details & Form on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Live Camera & Scanner Interface (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Video Viewport Container */}
              <div className="relative aspect-[4/3] sm:aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center group">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser scan line overlay */}
                {cameraActive && !isPausedScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    {/* Bounding box guide */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(99,102,241,0.25)] animate-pulse">
                      {/* Corner markers */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />

                      {/* Moving laser sweep */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-[bounce_2s_infinite]" />
                    </div>

                    <span className="mt-3 px-3 py-1 rounded-full bg-slate-950/80 text-[11px] font-bold text-slate-300 border border-slate-700/60 backdrop-blur-sm">
                      Align QR code inside box
                    </span>
                  </div>
                )}

                {/* Camera Inactive / Error Overlay */}
                {(!cameraActive || cameraError) && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-xs text-slate-400 max-w-xs mb-3">
                      {cameraError || 'Camera is currently stopped.'}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restart Camera
                    </button>
                  </div>
                )}

                {/* Paused state overlay */}
                {cameraActive && isPausedScanning && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="px-4 py-2 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs font-bold flex items-center gap-2 shadow-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Code Captured! Complete Check-in</span>
                    </div>
                  </div>
                )}

                {/* Camera Control Toolbar (Top Right Overlay) */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={handleToggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition ${
                          torchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-white hover:bg-slate-800'
                        }`}
                        title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
                      >
                        {torchOn ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition"
                      title="Flip Camera (Front/Rear)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Toolbar below video */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  {isProcessingFile ? 'Analyzing Image...' : 'Upload QR Image'}
                </button>

                {isPausedScanning && (
                  <button
                    type="button"
                    onClick={handleScanNext}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resume Scan
                  </button>
                )}
              </div>

              {/* Manual Search & Fallback Selector */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Emergency Manual Student Lookup
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Type name, ADM no (e.g. ADM-2024-001)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Dropdown search results */}
                {manualFilteredStudents.length > 0 && (
                  <div className="mt-1.5 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl divide-y divide-slate-700/60">
                    {manualFilteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectManualStudent(s)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/70 transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {s.admNo} • {s.grade} {s.stream || s.classArm}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                          Select <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {scanMessage && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{scanMessage}</span>
                </div>
              )}
            </div>

            {/* Right Column: Verified Student Card & Check-in Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {detectedStudent ? (
                <form onSubmit={handleConfirmCheckIn} className="space-y-4">
                  {/* Verified Student Header Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-lg font-black text-white shrink-0">
                          {detectedStudent.avatarInitials || detectedStudent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">{detectedStudent.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {detectedStudent.gender || 'Learner'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono mt-0.5">
                            Adm: {detectedStudent.admNo} • {detectedStudent.grade} {detectedStudent.stream || detectedStudent.classArm}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleScanNext}
                        className="text-xs text-slate-400 hover:text-white p-1"
                        title="Clear and scan different student"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Medical Quick Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-indigo-500/20 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                        <Droplet className="w-3.5 h-3.5 text-red-400" />
                        <span>Blood: {activeProfile?.bloodGroup || 'Unknown'}</span>
                      </div>

                      {activeProfile?.allergies && activeProfile.allergies.length > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Allergies: {activeProfile.allergies.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>No known allergies</span>
                        </div>
                      )}

                      {(detectedStudent.emergencyPhone || detectedStudent.parentPhone) && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          <Phone className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Emergency: {detectedStudent.emergencyPhone || detectedStudent.parentPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Check-in Form Inputs */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-indigo-400" />
                      Check-in Event &amp; Triage Details
                    </h4>

                    {/* Event Type & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Health / Welfare Event Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value as WelfareEventType)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Sickbay Visit & Triage">Sickbay Visit &amp; Triage</option>
                          <option value="Routine Health Screening">Routine Health Screening</option>
                          <option value="Deworming & Immunization">Deworming &amp; Immunization</option>
                          <option value="Guidance & Counseling Intake">Guidance &amp; Counseling Intake</option>
                          <option value="Nutrition & Feeding Program">Nutrition &amp; Feeding Program</option>
                          <option value="Sports & Physical Health Clearance">Sports &amp; Physical Health Clearance</option>
                          <option value="Emergency Medical Check-in">Emergency Medical Check-in</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Disposition / Status <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as WelfareCheckInStatus)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Completed">Completed / Cleared</option>
                          <option value="Admitted to Sickbay">Admitted to Sickbay (Resting)</option>
                          <option value="Under Observation">Under Observation (Monitored)</option>
                          <option value="Treated & Returned to Class">Treated &amp; Returned to Class</option>
                          <option value="Referred to Hospital">Referred to Referral Hospital</option>
                          <option value="Follow-up Required">Follow-up Required</option>
                        </select>
                      </div>
                    </div>

                    {/* Vitals & Temperature */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Body Temp (°C)
                        </label>
                        <div className="relative">
                          <Thermometer className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="number"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500"
                            placeholder="36.8"
                          />
                        </div>
                        {parseFloat(temperature) > 37.5 && (
                          <span className="text-[10px] text-amber-400 font-bold mt-1 block">
                            ⚠ Elevated Temperature (Fever)
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Attendant / Officer
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentUser?.fullName || 'Nurse Mary Chepkoech'}
                          className="w-full px-3 py-1.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Symptoms / Chief Complaint */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Reason / Symptoms / Notes
                      </label>
                      <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. Headache, sports scrape, annual vision screening..."
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* First Aid / Action Taken & Medication */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Action / First Aid Given
                        </label>
                        <input
                          type="text"
                          value={actionTaken}
                          onChange={(e) => setActionTaken(e.target.value)}
                          placeholder="e.g. Cleansed wound, rested in bed, vision test passed..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Medication Dispensed (If any)
                        </label>
                        <input
                          type="text"
                          value={medication}
                          onChange={(e) => setMedication(e.target.value)}
                          placeholder="e.g. Paracetamol 500mg, ORS..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Parent Notification Checkbox */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={parentNotification}
                          onChange={(e) => setParentNotification(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                        />
                        <Send className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Send instant alert to parent ({detectedStudent.emergencyPhone || detectedStudent.parentPhone || 'SMS/WhatsApp'})</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      Cancel / Rescan
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Save &amp; Check In Learner
                    </button>
                  </div>
                </form>
              ) : (
                /* Empty Waiting State */
                <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-900/30">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                    <HeartPulse className="w-8 h-8 text-indigo-400/80 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Waiting for Student QR Code Scan...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                    Position the student&apos;s physical or digital health pass in front of the camera, or choose a learner using the manual lookup on the left.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                      ✓ Instant Allergies Check
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                      ✓ Auto Blood Group Display
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                      ✓ One-Click Parent Alert
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">Station Active:</span>
            <span>Health Clinic &amp; Welfare Kiosk</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-500">
              Total Enrolled Learners: {students.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
