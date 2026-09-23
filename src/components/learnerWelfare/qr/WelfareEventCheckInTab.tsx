import React, { useState, useMemo } from 'react';
import {
  QrCode,
  Camera,
  Printer,
  Search,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Activity,
  Send,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../../types';
import {
  LearnerHealthProfile,
  WelfareEventCheckInRecord,
  WelfareEventType,
  WelfareCheckInStatus,
  HealthIncidentRecord,
  CounselingSession,
} from '../../../types/learnerWelfare';
import { WelfareQrScannerModal } from './WelfareQrScannerModal';
import { StudentHealthQrPassModal } from './StudentHealthQrPassModal';
import { WelfareQrHistoryModal } from './WelfareQrHistoryModal';
import { AVAILABLE_CLASSES } from '../../../data/mockData';

interface WelfareEventCheckInTabProps {
  students: Student[];
  healthProfiles: Record<string, LearnerHealthProfile>;
  checkIns: WelfareEventCheckInRecord[];
  currentUser?: CurrentUser;
  onAddCheckIn: (record: WelfareEventCheckInRecord) => void;
  onUpdateCheckIn?: (record: WelfareEventCheckInRecord) => void;
  onAddHealthIncident?: (incident: HealthIncidentRecord) => void;
  onAddCounselingSession?: (session: CounselingSession) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const EVENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'All', label: 'All Event Types' },
  { value: 'Sickbay Visit & Triage', label: 'Sickbay Visit & Triage' },
  { value: 'Routine Health Screening', label: 'Routine Health Screening' },
  { value: 'Deworming & Immunization', label: 'Deworming & Immunization' },
  { value: 'Guidance & Counseling Intake', label: 'Guidance & Counseling' },
  { value: 'Nutrition & Feeding Program', label: 'Nutrition & Feeding' },
  { value: 'Sports & Physical Health Clearance', label: 'Sports Health Clearance' },
  { value: 'Emergency Medical Check-in', label: 'Emergency Medical' },
];

export const WelfareEventCheckInTab: React.FC<WelfareEventCheckInTabProps> = ({
  students,
  healthProfiles,
  checkIns,
  currentUser,
  onAddCheckIn,
  onUpdateCheckIn,
  onAddHealthIncident,
  onAddCounselingSession,
  onLogAudit,
}) => {
  // Modal states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPassStudentId, setSelectedPassStudentId] = useState<string | undefined>(undefined);
  const [scannerDefaultEvent, setScannerDefaultEvent] = useState<WelfareEventType>('Sickbay Visit & Triage');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'student_passes'>('roster');

  // Compute Statistics
  const stats = useMemo(() => {
    const totalToday = checkIns.length;
    const sickbayAdmissions = checkIns.filter(
      (c) => c.status === 'Admitted to Sickbay' || c.status === 'Under Observation'
    ).length;
    const routineScreenings = checkIns.filter(
      (c) => c.eventType === 'Routine Health Screening' || c.eventType === 'Sports & Physical Health Clearance'
    ).length;
    const dewormingNutrition = checkIns.filter(
      (c) => c.eventType === 'Deworming & Immunization' || c.eventType === 'Nutrition & Feeding Program'
    ).length;
    const emergencyReferrals = checkIns.filter(
      (c) => c.eventType === 'Emergency Medical Check-in' || c.status === 'Referred to Hospital'
    ).length;

    return {
      totalToday,
      sickbayAdmissions,
      routineScreenings,
      dewormingNutrition,
      emergencyReferrals,
    };
  }, [checkIns]);

  // Filtered check-in records
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((record) => {
      const matchesSearch =
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.admNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.symptomsOrReason && record.symptomsOrReason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEvent =
        selectedEventType === 'All' || record.eventType === selectedEventType;

      const matchesClass =
        selectedClass === 'All' || record.className.includes(selectedClass);

      const matchesStatus =
        selectedStatus === 'All' || record.status === selectedStatus;

      return matchesSearch && matchesEvent && matchesClass && matchesStatus;
    });
  }, [checkIns, searchTerm, selectedEventType, selectedClass, selectedStatus]);

  // Launch Scanner with specific preset
  const handleLaunchScanner = (preset: WelfareEventType = 'Sickbay Visit & Triage') => {
    setScannerDefaultEvent(preset);
    setShowScannerModal(true);
  };

  // Launch Single Student Pass Modal
  const handleOpenStudentPass = (studentId: string) => {
    setSelectedPassStudentId(studentId);
    setShowPassModal(true);
  };

  // Update Check-in Status (e.g. Discharge student back to class)
  const handleStatusChange = (record: WelfareEventCheckInRecord, newStatus: WelfareCheckInStatus) => {
    if (onUpdateCheckIn) {
      const updated: WelfareEventCheckInRecord = {
        ...record,
        status: newStatus,
        notes: `${record.notes || ''} [Updated to ${newStatus} at ${new Date().toLocaleTimeString()}]`.trim(),
      };
      onUpdateCheckIn(updated);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Admission No',
      'Student Name',
      'Class',
      'Event Type',
      'Timestamp',
      'Temperature C',
      'Blood Group',
      'Allergies',
      'Reason / Symptoms',
      'Action Taken',
      'Status',
      'Attendant',
      'Parent Notified',
    ];

    const rows = filteredCheckIns.map((c) => [
      c.id,
      c.admNo,
      `"${(c.studentName || '').replace(/"/g, '""')}"`,
      `"${(c.className || '').replace(/"/g, '""')}"`,
      `"${(c.eventType || '').replace(/"/g, '""')}"`,
      c.timestamp,
      c.temperatureCelsius ?? '',
      c.bloodGroup ?? '',
      `"${(c.allergies || []).join('; ').replace(/"/g, '""')}"`,
      `"${(c.symptomsOrReason || '').replace(/"/g, '""')}"`,
      `"${(c.firstAidOrAction || '').replace(/"/g, '""')}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      `"${(c.checkedInBy || '').replace(/"/g, '""')}"`,
      c.parentNotified ? 'Yes' : 'No',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const eventSlug =
      selectedEventType === 'All'
        ? 'All_Events'
        : selectedEventType.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `JJSAK_QR_CheckIn_${eventSlug}_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Action Launchers */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-900/60 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                P6.X Automated Health &amp; Welfare Verification
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live QR Station
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Student Health &amp; Welfare Event Check-In Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Automated QR verification for school clinic arrivals, routine health screenings,
              immunization camps, guidance sessions, feeding programmes, and instant guardian alert dispatch.
            </p>
          </div>

          {/* Master Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleLaunchScanner('Sickbay Visit & Triage')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Launch QR Scanner Station</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Student Health Passes</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-3 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 font-bold text-xs transition flex items-center gap-2 shadow-sm"
              title="Open Full Sorted QR Welfare Check-In History Ledger"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Sorted History Ledger ({checkIns.length})</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-indigo-900/40">
          
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Check-ins</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-xl font-black text-white font-mono">{stats.totalToday}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Recorded encounters</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Sickbay Active</span>
              <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xl font-black text-amber-400 font-mono">{stats.sickbayAdmissions}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Resting / In observation</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Screenings Done</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-emerald-400 font-mono">{stats.routineScreenings}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Dental, eyes, wellness</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Deworm &amp; Feeding</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xl font-black text-purple-400 font-mono">{stats.dewormingNutrition}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Campaign verified</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Referrals / Emergency</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-xl font-black text-red-400 font-mono">{stats.emergencyReferrals}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hospital escalations</span>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'roster'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Check-in Encounters Log ({filteredCheckIns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('student_passes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'student_passes'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span>Student QR Passes Directory ({students.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={
              selectedEventType === 'All'
                ? 'Download CSV of all check-in records'
                : `Download CSV records for selected event: ${selectedEventType}`
            }
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CHECK-IN ENCOUNTERS LOG */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name or ADM..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Event Type Filter */}
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Classes</option>
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed / Cleared</option>
                <option value="Admitted to Sickbay">Admitted to Sickbay</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Treated & Returned to Class">Treated &amp; Returned to Class</option>
                <option value="Referred to Hospital">Referred to Hospital</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong>{filteredCheckIns.length}</strong> of {checkIns.length} encounters
              </span>
            </div>
          </div>

          {/* Encounters Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Learner Details</th>
                    <th className="py-3 px-3">Event Type</th>
                    <th className="py-3 px-3">Time &amp; Station</th>
                    <th className="py-3 px-3">Temp / Vitals</th>
                    <th className="py-3 px-3">Symptoms / Chief Note</th>
                    <th className="py-3 px-3">Action / Medication</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCheckIns.length > 0 ? (
                    filteredCheckIns.map((item) => {
                      const isFever = item.temperatureCelsius && item.temperatureCelsius > 37.5;
                      const hasAllergies = item.allergies && item.allergies.length > 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                          
                          {/* Learner Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                                {item.studentName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {item.studentName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {item.admNo} • {item.className}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Event Type Badge */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                              {item.eventType}
                            </span>
                          </td>

                          {/* Time & Station */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                              {item.station || 'Health Kiosk'}
                            </span>
                          </td>

                          {/* Temperature & Vitals */}
                          <td className="py-3 px-3">
                            {item.temperatureCelsius ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                    isFever
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {item.temperatureCelsius}°C
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                            {item.bloodGroup && (
                              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                                Blood: <strong>{item.bloodGroup}</strong>
                              </span>
                            )}
                          </td>

                          {/* Symptoms / Chief Complaint */}
                          <td className="py-3 px-3">
                            <p className="text-xs text-slate-800 font-medium line-clamp-2 max-w-[180px]">
                              {item.symptomsOrReason || 'Standard triage check-in'}
                            </p>
                            {hasAllergies && (
                              <span className="text-[9px] text-amber-700 font-bold block mt-0.5">
                                ⚠ Allergy: {item.allergies?.join(', ')}
                              </span>
                            )}
                          </td>

                          {/* Action / Medication */}
                          <td className="py-3 px-3">
                            <span className="text-xs text-slate-700 line-clamp-1 max-w-[160px] block">
                              {item.firstAidOrAction || 'Assessed & documented'}
                            </span>
                            {item.medicationGiven && (
                              <span className="text-[10px] text-indigo-600 font-semibold block">
                                Rx: {item.medicationGiven}
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'Completed' || item.status === 'Treated & Returned to Class'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'Admitted to Sickbay'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.status === 'Referred to Hospital'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {item.status}
                            </span>
                            {item.parentNotified && (
                              <span className="text-[9px] text-indigo-600 font-semibold flex items-center gap-0.5 mt-0.5">
                                <Send className="w-2.5 h-2.5" />
                                Parent Notified
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status === 'Admitted to Sickbay' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item, 'Treated & Returned to Class')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition border border-emerald-200"
                                  title="Discharge student back to class"
                                >
                                  Discharge
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenStudentPass(item.studentId)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                title="View / Print Student Health QR Pass"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <HeartPulse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-slate-700">No Check-in Encounters Found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                          {searchTerm || selectedEventType !== 'All'
                            ? 'No encounters match the active filter criteria.'
                            : 'No student health or welfare check-ins have been recorded today yet.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleLaunchScanner()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Launch QR Scanner Now
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: STUDENT QR PASSES DIRECTORY */}
      {activeSubTab === 'student_passes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter student by name or ADM..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
              >
                <option value="All">All Classes</option>
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Batch Print Class Passes
            </button>
          </div>

          {/* Cards Grid of Students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students
              .filter((s) => {
                const matchesSearch =
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.admNo.toLowerCase().includes(searchTerm.toLowerCase());
                const studentClass = `${s.grade} ${s.stream || s.classArm || ''}`.trim();
                const matchesClass = selectedClass === 'All' || studentClass.includes(selectedClass);
                return matchesSearch && matchesClass;
              })
              .map((student) => {
                const profile = healthProfiles[student.id];
                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                            {student.avatarInitials || student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              {student.name}
                            </h4>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold block">
                              {student.admNo}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                          {student.grade} {student.stream || student.classArm}
                        </span>
                      </div>

                      {/* Medical snapshot */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Blood Group:</span>
                          <span className="font-bold text-red-700 flex items-center gap-1">
                            <Droplet className="w-2.5 h-2.5 fill-red-600" />
                            {profile?.bloodGroup || 'Unknown'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Allergies:</span>
                          <span className="font-semibold text-amber-700 truncate max-w-[130px]">
                            {profile?.allergies?.length ? profile.allergies.join(', ') : 'None'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Emergency:</span>
                          <span className="font-mono text-slate-700">
                            {student.emergencyPhone || student.parentPhone || 'On File'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLaunchScanner()}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        Check In
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenStudentPass(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View / Print Pass
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <WelfareQrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        students={students}
        healthProfiles={healthProfiles}
        currentUser={currentUser}
        defaultEventType={scannerDefaultEvent}
        onCheckInCompleted={(record) => {
          onAddCheckIn(record);
        }}
        onAddHealthIncident={onAddHealthIncident}
        onAddCounselingSession={onAddCounselingSession}
        onLogAudit={onLogAudit}
      />

      {/* Student Health QR Pass Generator Modal */}
      <StudentHealthQrPassModal
        isOpen={showPassModal}
        onClose={() => {
          setShowPassModal(false);
          setSelectedPassStudentId(undefined);
        }}
        students={students}
        healthProfiles={healthProfiles}
        initialStudentId={selectedPassStudentId}
      />

      {/* Sorted History & Audit Ledger Modal */}
      <WelfareQrHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        checkIns={checkIns}
        students={students}
        healthProfiles={healthProfiles}
        onOpenStudentPass={(studentId) => {
          setSelectedPassStudentId(studentId);
          setShowPassModal(true);
        }}
        onUpdateStatus={(record, newStatus) => {
          if (onUpdateCheckIn) {
            onUpdateCheckIn({
              ...record,
              status: newStatus,
            });
          }
        }}
      />

    </div>
  );
};
