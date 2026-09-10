import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  X,
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import {
  Assessment,
  Student,
  User,
  OcrExtractionResult,
} from '../../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
} from '../../data/mockData';
import {
  generateSimulatedOcrScan,
  gradeFromScheme,
  DEFAULT_CBC_GRADING_SCHEME,
} from '../../data/academicData';

interface AssessmentMarksMatrixTabProps {
  assessments: Assessment[];
  students: Student[];
  currentUser?: User;
  onUpdateAssessment: (assessment: Assessment) => void;
  onUpdateStudent: (student: Student) => void;
  onBatchUpdateStudents: (updater: (s: Student) => Student) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const AssessmentMarksMatrixTab: React.FC<AssessmentMarksMatrixTabProps> = ({
  assessments,
  students,
  currentUser,
  onUpdateAssessment,
  onBatchUpdateStudents,
  onLogAudit,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('G8 S');
  const [selectedSubject, setSelectedSubject] = useState<string>('Social Studies');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('Mid Term Exam');
  const [maxPossibleScore, setMaxPossibleScore] = useState<number>(100);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find or determine active assessment record
  const currentAssessment = assessments.find(
    (a) =>
      a.className === selectedClass &&
      a.subject === selectedSubject &&
      a.assessmentType.toLowerCase().includes(selectedAssessmentType.toLowerCase())
  );

  const isExamFinalized = currentAssessment?.isFinalized ?? false;

  // Filter students by selected class
  const classStudents = students.filter((s) => s.classArm === selectedClass);

  // Local state for mark sheet edits
  const [editingScores, setEditingScores] = useState<Record<string, string>>({});
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});

  // OCR Assisted Scan State
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);

  // Offline buffer simulator
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [offlinePendingSync, setOfflinePendingSync] = useState<number>(0);

  const handleScoreChange = (studentId: string, val: string) => {
    if (isExamFinalized) return;
    setEditingScores((prev) => ({ ...prev, [studentId]: val }));
    if (isOfflineSimulated) {
      setOfflinePendingSync((prev) => prev + 1);
    }
  };

  const handleRemarksChange = (studentId: string, val: string) => {
    if (isExamFinalized) return;
    setEditingRemarks((prev) => ({ ...prev, [studentId]: val }));
  };

  // Save all entered marks
  const handleSaveMarks = () => {
    if (isExamFinalized) {
      alert('This examination has been finalized and locked by academic authorities. Unauthorized alterations are strictly prohibited.');
      return;
    }

    let countSaved = 0;
    onBatchUpdateStudents((student) => {
      if (student.classArm !== selectedClass) return student;

      const rawVal = editingScores[student.id];
      const existingSub = student.subjects.find((s) => s.subject === selectedSubject);
      const existingScore = existingSub?.score;

      let finalScore = existingScore;
      if (rawVal !== undefined && rawVal !== '') {
        const num = parseFloat(rawVal);
        if (!isNaN(num) && num >= 0 && num <= maxPossibleScore) {
          finalScore = Math.round(num);
          countSaved++;
        }
      }

      const remarksVal = editingRemarks[student.id] || existingSub?.remarks || '';
      const evalGrade = gradeFromScheme(finalScore, DEFAULT_CBC_GRADING_SCHEME);

      const updatedSubjects = student.subjects.map((sub) => {
        if (sub.subject === selectedSubject) {
          return {
            ...sub,
            score: finalScore as number,
            grade: evalGrade.grade,
            remarks: remarksVal || evalGrade.remarks,
          };
        }
        return sub;
      });

      return {
        ...student,
        subjects: updatedSubjects,
      };
    });

    if (onLogAudit) {
      onLogAudit(
        'MARKS_SUBMIT',
        `Committed marks sheet for ${selectedClass} - ${selectedSubject} (${selectedAssessmentType}). Total entries processed: ${countSaved}.`
      );
    }

    setOfflinePendingSync(0);
    showToast(`✓ Committed mark sheet for ${selectedClass} - ${selectedSubject}`);
  };

  // Finalize / Lock Examination
  const handleToggleFinalization = () => {
    const targetAssessment = currentAssessment || {
      id: `ass-${Date.now()}`,
      name: `${selectedClass} ${selectedSubject} ${selectedAssessmentType}`,
      className: selectedClass,
      subject: selectedSubject,
      assessmentType: selectedAssessmentType,
      term: 'Term 2',
      year: 2026,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed' as const,
      totalMarks: maxPossibleScore,
    };

    const newFinalized = !isExamFinalized;
    const updated: Assessment = {
      ...targetAssessment,
      isFinalized: newFinalized,
      finalizedBy: newFinalized ? currentUser?.fullName || 'Director of Academics' : undefined,
      finalizedAt: newFinalized ? new Date().toISOString() : undefined,
      integrityHash: newFinalized ? `SHA256-${Date.now().toString(16).toUpperCase()}` : undefined,
    };

    onUpdateAssessment(updated);

    if (onLogAudit) {
      onLogAudit(
        newFinalized ? 'EXAM_FINALIZED' : 'EXAM_UNFINALIZED',
        newFinalized
          ? `Finalized and locked assessment ${updated.name}. Tamper-evident lock activated.`
          : `Unlocked assessment ${updated.name} for official grade amendments.`
      );
    }

    showToast(newFinalized ? '🔒 Examination officially finalized & locked' : '🔓 Examination unlocked for editing');
  };

  // OCR Scan Simulation Trigger
  const handleTriggerOcrScan = () => {
    setIsScanningOcr(true);
    setTimeout(() => {
      const result = generateSimulatedOcrScan(selectedClass, selectedSubject, classStudents);
      setOcrResult(result);
      setIsScanningOcr(false);
      showToast(`✓ Scanned mark sheet: ${result.totalRowsDetected} rows recognized via OCR`);
    }, 1200);
  };

  const handleApplyOcrMarks = () => {
    if (!ocrResult || isExamFinalized) return;
    const newScores: Record<string, string> = { ...editingScores };

    ocrResult.rows.forEach((row) => {
      const match = classStudents.find((s) => s.admNo === row.admNo);
      if (match) {
        newScores[match.id] = row.extractedScore.toString();
      }
    });

    setEditingScores(newScores);
    if (onLogAudit) {
      onLogAudit(
        'OCR_MARKS_EXTRACTED',
        `Applied OCR extracted marks for ${selectedClass} - ${selectedSubject}. Matched: ${ocrResult.highConfidenceCount}, Reviewed: ${ocrResult.manualReviewCount}.`
      );
    }
    showToast(`✓ Applied ${ocrResult.rows.length} OCR scores to mark sheet`);
    setOcrResult(null);
  };

  // Calculation of completion metrics
  const totalStudentsInClass = classStudents.length;
  const scoredCount = classStudents.filter((s) => {
    const editVal = editingScores[s.id];
    if (editVal !== undefined && editVal !== '') return true;
    const sub = s.subjects.find((item) => item.subject === selectedSubject);
    return sub && sub.score !== null && sub.score !== undefined;
  }).length;

  const completionPct =
    totalStudentsInClass > 0 ? Math.round((scoredCount / totalStudentsInClass) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Class / Stream</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-emerald-600"
            >
              {AVAILABLE_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Learning Area / Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-emerald-600"
            >
              {AVAILABLE_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Assessment Instrument</label>
            <select
              value={selectedAssessmentType}
              onChange={(e) => setSelectedAssessmentType(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-emerald-600"
            >
              <option value="Continuous Assessment Test (CAT)">Continuous Assessment Test (CAT)</option>
              <option value="Mid Term Exam">Mid-Term Examination</option>
              <option value="End Term Exam">End-Term Examination</option>
              <option value="Practical Assessment">Practical Assessment</option>
              <option value="Project">Project / Capstone</option>
              <option value="Teacher Observation Record">Observation Rubric</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Maximum Score</label>
            <input
              type="number"
              min={10}
              max={100}
              value={maxPossibleScore}
              onChange={(e) => setMaxPossibleScore(parseInt(e.target.value) || 100)}
              className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white text-center"
            />
          </div>
        </div>

        {/* Offline Simulator & OCR Triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              isOfflineSimulated
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Simulate offline marks capture with local caching"
          >
            {isOfflineSimulated ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isOfflineSimulated ? 'Offline Mode Active' : 'Online Sync'}</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerOcrScan}
            disabled={isScanningOcr || isExamFinalized}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isScanningOcr ? 'Scanning...' : 'OCR Scan Mark Sheet'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lock / Integrity Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isExamFinalized
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isExamFinalized
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-600 text-white shadow-xs'
            }`}
          >
            {isExamFinalized ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold">
                {isExamFinalized
                  ? 'Official Examination Finalized & Locked (Read-Only)'
                  : 'Open Entry Window Active'}
              </h4>
              {isExamFinalized && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {currentAssessment?.integrityHash || 'SHA256-VERIFIED'}
                </span>
              )}
            </div>
            <p className={`text-[11px] ${isExamFinalized ? 'text-slate-400' : 'text-emerald-800'}`}>
              {isExamFinalized
                ? `Locked by ${currentAssessment?.finalizedBy || 'Director of Academics'}. Alterations require formal unfinalization.`
                : `Progress: ${scoredCount} of ${totalStudentsInClass} scored (${completionPct}% complete). Automatic missing marks detection enabled.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFinalization}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isExamFinalized
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isExamFinalized ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isExamFinalized ? 'Request Unlock for Edits' : 'Finalize & Lock Examination'}</span>
          </button>
        </div>
      </div>

      {/* OCR Extraction Result Drawer (if active) */}
      {ocrResult && (
        <div className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">OCR Assisted Optical Recognition Matcher</h4>
            </div>
            <button
              type="button"
              onClick={() => setOcrResult(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-emerald-200">
            Detected <strong>{ocrResult.totalRowsDetected} learners</strong> from physical scanned mark sheet. {ocrResult.highConfidenceCount} matched with high confidence ({'>'}85%), {ocrResult.manualReviewCount} require verification.
          </p>

          <div className="max-h-44 overflow-y-auto divide-y divide-emerald-900/60 bg-emerald-900/30 rounded-xl p-2 text-xs">
            {ocrResult.rows.map((row, idx) => (
              <div key={idx} className="py-1.5 px-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-300">{row.admNo}</span>
                  <span className="text-slate-200">{row.studentName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">Score: {row.extractedScore}%</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{(row.confidence * 100).toFixed(0)}% conf</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row.status === 'Conflict' ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'}`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOcrResult(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-emerald-900 cursor-pointer"
            >
              Discard Scan
            </button>
            <button
              type="button"
              onClick={handleApplyOcrMarks}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Extracted Marks to Matrix</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Tabular Mark Sheet */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Official Mark List: {selectedClass} • {selectedSubject}
            </span>
            <span className="text-[11px] text-slate-500">
              ({selectedAssessmentType})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              Assigned Teacher: <strong>{currentAssessment?.assignedTeacherName || 'Subject Teacher'}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Admission No</th>
                <th className="py-2.5 px-3">Learner Full Name</th>
                <th className="py-2.5 px-3 text-center">Score / {maxPossibleScore}</th>
                <th className="py-2.5 px-3 text-center">CBC Competency</th>
                <th className="py-2.5 px-3">Teacher Observational Remarks</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No learners found in class {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const existingSub = student.subjects.find((s) => s.subject === selectedSubject);
                  const currentScoreRaw = editingScores[student.id] ?? (existingSub?.score?.toString() || '');
                  const currentScoreNum = parseFloat(currentScoreRaw);
                  const isMissing = currentScoreRaw === '' || isNaN(currentScoreNum);
                  const isInvalid = !isMissing && (currentScoreNum < 0 || currentScoreNum > maxPossibleScore);

                  const evalResult = !isMissing && !isInvalid
                    ? gradeFromScheme(currentScoreNum, DEFAULT_CBC_GRADING_SCHEME)
                    : null;

                  const currentRemarks = editingRemarks[student.id] ?? (existingSub?.remarks || '');

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isMissing ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {student.admNo}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {student.name}
                        {student.specialNeeds?.hasSpecialNeeds && (
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                            SEN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={maxPossibleScore}
                          disabled={isExamFinalized}
                          value={currentScoreRaw}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          placeholder="—"
                          className={`w-16 px-2 py-1 text-center font-bold text-xs border rounded-lg transition ${
                            isExamFinalized
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                              : isInvalid
                              ? 'bg-red-50 text-red-700 border-red-500 focus:outline-red-500'
                              : isMissing
                              ? 'bg-amber-50/60 text-slate-700 border-amber-300 focus:outline-emerald-600'
                              : 'bg-white text-slate-800 border-slate-300 focus:outline-emerald-600'
                          }`}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {evalResult ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              evalResult.grade === 'EE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : evalResult.grade === 'ME'
                                ? 'bg-blue-100 text-blue-800'
                                : evalResult.grade === 'AE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {evalResult.grade}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          disabled={isExamFinalized}
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="e.g. Good mastery of concepts..."
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isInvalid ? (
                          <span className="text-[10px] font-bold text-red-600 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Invalid</span>
                          </span>
                        ) : isMissing ? (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Missing</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Recorded</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer commit action bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {offlinePendingSync > 0 && (
              <span className="text-amber-700 font-bold mr-3">
                ⚠️ {offlinePendingSync} local offline edits cached in memory.
              </span>
            )}
            <span>Audit trail timestamp: <strong className="text-slate-700 font-mono">{new Date().toLocaleTimeString()}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExamFinalized}
              onClick={handleSaveMarks}
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                isExamFinalized
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Commit & Save Mark Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
