import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  GraduationCap,
  Archive,
  RotateCcw,
  TrendingUp,
  Search,
  CheckCircle2,
  Lock,
  FileCheck,
} from 'lucide-react';
import {
  Student,
  User,
  InterClassTransferRecord,
  PromotionRecord,
  AcademicYearArchive,
} from '../../types';
import { AVAILABLE_CLASSES } from '../../data/mockData';

interface LearnerLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'transfers' | 'promotion' | 'archives' | 'history';
  students: Student[];
  currentUser?: User;
  transfers: InterClassTransferRecord[];
  promotions?: PromotionRecord[];
  archives: AcademicYearArchive[];
  onExecuteTransfer: (record: InterClassTransferRecord) => void;
  onExecutePromotion: (record: PromotionRecord, updatedStudents: Student[]) => void;
  onArchiveYear: (archive: AcademicYearArchive) => void;
  onRestoreArchive: (archiveId: string) => void;
  onSelectStudent?: (student: Student) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const LearnerLifecycleModal: React.FC<LearnerLifecycleModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'transfers',
  students,
  currentUser,
  transfers,
  archives,
  onExecuteTransfer,
  onExecutePromotion,
  onArchiveYear,
  onRestoreArchive,
  onLogAudit,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'transfers' | 'promotion' | 'archives' | 'history'>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Transfer Wizard State
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<string>(students[0]?.id || '');
  const [targetClass, setTargetClass] = useState<string>('G8 N');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transferReason, setTransferReason] = useState<string>('Stream Load Equalization');
  const [customReason, setCustomReason] = useState<string>('');

  const currentTransferStudent = students.find((s) => s.id === selectedStudentForTransfer) || students[0];

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransferStudent) return;

    if (currentTransferStudent.classArm === targetClass) {
      alert('Target class must be different from current class.');
      return;
    }

    const finalReason = transferReason === 'Other' ? customReason || 'Administrative realign' : transferReason;
    const newTransfer: InterClassTransferRecord = {
      id: `trans-${Date.now()}`,
      studentId: currentTransferStudent.id,
      studentName: currentTransferStudent.name,
      admNo: currentTransferStudent.admNo,
      fromClass: currentTransferStudent.classArm,
      toClass: targetClass,
      transferDate,
      reason: finalReason,
      authorizedBy: currentUser?.fullName || 'Director of Academics',
      status: 'Completed',
    };

    onExecuteTransfer(newTransfer);
    if (onLogAudit) {
      onLogAudit(
        'LEARNER_TRANSFER',
        `Transferred learner ${currentTransferStudent.name} (${currentTransferStudent.admNo}) from ${currentTransferStudent.classArm} to ${targetClass}. Reason: ${finalReason}`,
        currentTransferStudent.classArm,
        targetClass
      );
    }
    showToast(`✓ Transfer completed: ${currentTransferStudent.name} moved to ${targetClass}`);
  };

  // 2. Promotion Engine State
  const [selectedCohortGrade, setSelectedCohortGrade] = useState<'G7' | 'G8' | 'G9'>('G7');
  const [promotionTargetYear, setPromotionTargetYear] = useState<number>(2027);
  const [minPassScore, setMinPassScore] = useState<number>(50);
  const [minAttendance, setMinAttendance] = useState<number>(75);

  // Derive promotion candidates from active students in the selected grade
  const cohortStudents = students.filter((s) => s.grade === selectedCohortGrade);
  const [candidateActions, setCandidateActions] = useState<Record<string, 'Promote' | 'Retain' | 'Graduate'>>({});

  const getCandidateAction = (student: Student): 'Promote' | 'Retain' | 'Graduate' => {
    if (candidateActions[student.id]) return candidateActions[student.id];
    if (selectedCohortGrade === 'G9') return 'Graduate';
    const avg = student.avgScore ?? 0;
    const att = student.attendance ?? 90;
    return avg >= minPassScore && att >= minAttendance ? 'Promote' : 'Retain';
  };

  const handleToggleCandidateAction = (studentId: string, action: 'Promote' | 'Retain' | 'Graduate') => {
    setCandidateActions((prev) => ({ ...prev, [studentId]: action }));
  };

  const handleExecuteCohortPromotion = () => {
    if (cohortStudents.length === 0) {
      alert('No students found in the selected cohort grade.');
      return;
    }

    const nextGradeMap: Record<string, string> = {
      G7: 'G8',
      G8: 'G9',
      G9: 'Graduated',
    };

    let promoted = 0;
    let retained = 0;
    let graduated = 0;

    const updatedStudentsList = students.map((s) => {
      if (s.grade !== selectedCohortGrade) return s;
      const action = getCandidateAction(s);
      if (action === 'Promote') {
        promoted++;
        const nextGrade = nextGradeMap[s.grade] || s.grade;
        const nextStream = s.stream || s.classArm.split(' ')[1] || 'S';
        return {
          ...s,
          grade: nextGrade,
          classArm: `${nextGrade} ${nextStream}`,
          year: promotionTargetYear,
          promotionStatus: 'Promoted' as const,
        };
      }
      if (action === 'Graduate') {
        graduated++;
        return {
          ...s,
          status: 'Inactive',
          promotionStatus: 'Graduated' as const,
        };
      }
      retained++;
      return {
        ...s,
        promotionStatus: 'Retained' as const,
        year: promotionTargetYear,
      };
    });

    const newPromotionRecord: PromotionRecord = {
      id: `prom-${Date.now()}`,
      academicYearFrom: promotionTargetYear - 1,
      academicYearTo: promotionTargetYear,
      executionDate: new Date().toISOString().split('T')[0],
      executedBy: currentUser?.fullName || 'Director of Academics (Mr. Jotham Watila)',
      totalEligible: cohortStudents.length,
      promotedCount: promoted,
      retainedCount: retained,
      graduatedCount: graduated,
      notes: `Automated cohort promotion executed for ${selectedCohortGrade}. Thresholds: Avg >= ${minPassScore}%, Attendance >= ${minAttendance}%.`,
      rollbackAvailable: true,
    };

    onExecutePromotion(newPromotionRecord, updatedStudentsList);
    if (onLogAudit) {
      onLogAudit(
        'LEARNER_PROMOTE',
        `Automated cohort promotion executed: ${promoted} promoted, ${retained} retained, ${graduated} graduated for ${selectedCohortGrade} into academic year ${promotionTargetYear}.`
      );
    }
    showToast(`✓ Promotion executed: ${promoted} Promoted, ${retained} Retained`);
  };

  // 3. Academic Year Archiving State
  const [archiveYearInput, setArchiveYearInput] = useState<number>(2025);
  const [archiveTermInput, setArchiveTermInput] = useState<string>('Term 3');
  const [archiveNotes, setArchiveNotes] = useState<string>('');

  const handleArchiveCurrentYear = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = archives.find((a) => a.academicYear === archiveYearInput);
    if (existing) {
      alert(`Academic year ${archiveYearInput} is already archived.`);
      return;
    }

    const activeScores = students
      .map((s) => s.avgScore)
      .filter((score): score is number => score !== null && score !== undefined);
    const meanPerf =
      activeScores.length > 0
        ? parseFloat((activeScores.reduce((a, b) => a + b, 0) / activeScores.length).toFixed(1))
        : 75.0;

    const newArchive: AcademicYearArchive = {
      id: `arch-${archiveYearInput}`,
      academicYear: archiveYearInput,
      term: archiveTermInput,
      archivedAt: Date.now(),
      archivedBy: currentUser?.fullName || 'Head of Institution',
      totalLearners: students.length,
      totalAssessments: 28,
      meanPerformance: meanPerf,
      isLocked: true,
      snapshotNotes: archiveNotes || `Official archive snapshot for ${archiveYearInput} ${archiveTermInput} with digitally verified marks.`,
    };

    onArchiveYear(newArchive);
    if (onLogAudit) {
      onLogAudit(
        'ACADEMIC_YEAR_ARCHIVE',
        `Archived academic year ${archiveYearInput} (${archiveTermInput}) with ${students.length} learners and ${meanPerf}% institutional mean score.`
      );
    }
    showToast(`✓ Academic Year ${archiveYearInput} successfully archived and locked`);
  };

  // 4. Performance History State
  const [historyStudentId, setHistoryStudentId] = useState<string>(students[0]?.id || '');
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');
  const historyStudent = students.find((s) => s.id === historyStudentId) || students[0];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      s.admNo.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  // Simulated multi-term trajectory for selected history student
  const sampleTrajectory = [
    { term: '2024 Term 1', grade: 'G7', avg: Math.max(50, (historyStudent?.avgScore || 75) - 8), att: 92, rank: '4/42', gradeBand: 'ME' },
    { term: '2024 Term 2', grade: 'G7', avg: Math.max(55, (historyStudent?.avgScore || 75) - 4), att: 95, rank: '3/42', gradeBand: 'ME' },
    { term: '2024 Term 3', grade: 'G7', avg: Math.max(58, (historyStudent?.avgScore || 75) - 2), att: 94, rank: '2/42', gradeBand: 'EE' },
    { term: '2025 Term 1', grade: 'G8', avg: historyStudent?.avgScore || 78, att: 96, rank: '2/40', gradeBand: 'EE' },
    { term: '2026 Term 2 (Current)', grade: historyStudent?.classArm || 'G8 S', avg: historyStudent?.avgScore || 80, att: historyStudent?.attendance || 95, rank: historyStudent?.position || '1/40', gradeBand: historyStudent?.overallGrade || 'EE' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Learner Academic Lifecycle & Progression
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Phase 5.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inter-class transfers, automated grade promotions, historical performance trajectories & year archiving.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('transfers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'transfers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Inter-Class Transfer ({transfers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promotion')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'promotion'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Automatic Promotion Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archives')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'archives'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Academic Year Archive ({archives.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Performance History & Trajectory</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: INTER-CLASS TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Transfer Creation Form */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                    <span>Initiate Inter-Class Transfer Wizard</span>
                  </h3>
                  <form onSubmit={handleCreateTransfer} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Learner
                      </label>
                      <select
                        value={selectedStudentForTransfer}
                        onChange={(e) => setSelectedStudentForTransfer(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-semibold"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.admNo}) — Currently in {s.classArm}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Current Class / Stream
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentTransferStudent?.classArm || 'G8 S'}
                          className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-xl text-slate-600 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Target Destination Stream
                        </label>
                        <select
                          value={targetClass}
                          onChange={(e) => setTargetClass(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-semibold"
                        >
                          {AVAILABLE_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Effective Date of Transfer
                        </label>
                        <input
                          type="date"
                          value={transferDate}
                          onChange={(e) => setTransferDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Transfer Justification / Reason
                        </label>
                        <select
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                        >
                          <option value="Stream Load Equalization">Stream Load Equalization</option>
                          <option value="Special Needs & Mobility Accommodation">Special Needs & Mobility Accommodation</option>
                          <option value="Senior Pathway Elective Realignment">Senior Pathway Elective Realignment</option>
                          <option value="Parental Relocation Request">Parental Relocation Request</option>
                          <option value="Disciplinary & Pastoral Rebalancing">Disciplinary & Pastoral Rebalancing</option>
                          <option value="Other">Other (Specify Custom Reason)</option>
                        </select>
                      </div>
                    </div>

                    {transferReason === 'Other' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Custom Reason Notes
                        </label>
                        <input
                          type="text"
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Provide specific administrative notes..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Authorized by: <strong className="text-slate-700">{currentUser?.fullName || 'Director of Academics'}</strong>
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Execute & Log Transfer</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Transfer Rules & Guidelines Card */}
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 flex flex-col justify-between border border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>JJSAK Transfer Protocol</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All inter-class reallocations maintain historical grade records in original streams while automatically synchronizing active attendance sheets and marks submissions.
                    </p>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 mt-3 list-disc pl-4">
                      <li>Maintains past assessment results intact.</li>
                      <li>Notifies receiving stream class teacher.</li>
                      <li>Generates unalterable security audit entry.</li>
                    </ul>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-emerald-300 font-mono mt-3">
                    COMPLIANCE: Section 5.1 Learner Records
                  </div>
                </div>
              </div>

              {/* Historical Transfers Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Historical Inter-Class Transfers Log</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{transfers.length} Total Executed</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {transfers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No inter-class transfers recorded yet.
                    </div>
                  ) : (
                    transfers.map((t) => (
                      <div key={t.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{t.studentName}</span>
                            <span className="text-slate-400 font-normal">({t.admNo})</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {t.fromClass} → {t.toClass}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{t.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">{t.transferDate}</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.authorizedBy}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATIC PROMOTION ENGINE */}
          {activeTab === 'promotion' && (
            <div className="space-y-6">
              {/* Cohort Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Cohort Promotion Engine (CBC Stage Progression)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Promote eligible learners to the next academic grade based on performance cutoffs and attendance requirements.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Cohort:</span>
                    {(['G7', 'G8', 'G9'] as const).map((grd) => (
                      <button
                        key={grd}
                        type="button"
                        onClick={() => setSelectedCohortGrade(grd)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition ${
                          selectedCohortGrade === grd
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Grade {grd.replace('G', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threshold Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Academic Year
                    </label>
                    <input
                      type="number"
                      value={promotionTargetYear}
                      onChange={(e) => setPromotionTargetYear(parseInt(e.target.value) || 2027)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Minimum Mean Score Cutoff: <span className="text-emerald-600 font-bold">{minPassScore}%</span>
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={70}
                      value={minPassScore}
                      onChange={(e) => setMinPassScore(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Minimum Attendance Cutoff: <span className="text-emerald-600 font-bold">{minAttendance}%</span>
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={95}
                      value={minAttendance}
                      onChange={(e) => setMinAttendance(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Candidate Preview Grid */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Candidates in Grade {selectedCohortGrade.replace('G', '')} ({cohortStudents.length} Learners)
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-700 font-bold">
                      Promote: {cohortStudents.filter((s) => getCandidateAction(s) === 'Promote').length}
                    </span>
                    <span className="text-amber-700 font-bold">
                      Retain: {cohortStudents.filter((s) => getCandidateAction(s) === 'Retain').length}
                    </span>
                    {selectedCohortGrade === 'G9' && (
                      <span className="text-purple-700 font-bold">
                        Graduate: {cohortStudents.filter((s) => getCandidateAction(s) === 'Graduate').length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {cohortStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No learners currently registered in Grade {selectedCohortGrade}.
                    </div>
                  ) : (
                    cohortStudents.map((s) => {
                      const action = getCandidateAction(s);
                      return (
                        <div key={s.id} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{s.name}</span>
                              <span className="text-slate-400 font-normal">({s.admNo})</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {s.classArm}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              <span>Mean Score: <strong className="text-slate-800">{s.avgScore ?? 'N/A'}%</strong></span>
                              <span>Attendance: <strong className="text-slate-800">{s.attendance || 90}%</strong></span>
                              <span>Overall: <strong className="text-emerald-600">{s.overallGrade}</strong></span>
                            </div>
                          </div>

                          {/* Action Selector */}
                          <div className="flex items-center gap-1.5">
                            {selectedCohortGrade !== 'G9' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCandidateAction(s.id, 'Promote')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                    action === 'Promote'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Promote to {selectedCohortGrade === 'G7' ? 'G8' : 'G9'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCandidateAction(s.id, 'Retain')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                    action === 'Retain'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Retain
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleCandidateAction(s.id, 'Graduate')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white cursor-pointer"
                              >
                                Graduate to Senior School
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Execution Action Bar */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Confirm Cohort Transition for Grade {selectedCohortGrade}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Promoted learners will advance automatically, and historical term results will be archived into their longitudinal dossier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExecuteCohortPromotion}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition shrink-0 flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Execute Automated Promotion</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC YEAR ARCHIVES */}
          {activeTab === 'archives' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Archive Form */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Archive className="w-4 h-4 text-emerald-600" />
                    <span>Archive Current Academic Year (Tamper-Evident Lock)</span>
                  </h3>
                  <form onSubmit={handleArchiveCurrentYear} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Academic Year to Archive
                        </label>
                        <input
                          type="number"
                          value={archiveYearInput}
                          onChange={(e) => setArchiveYearInput(parseInt(e.target.value) || 2025)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Term Snapshot
                        </label>
                        <select
                          value={archiveTermInput}
                          onChange={(e) => setArchiveTermInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                        >
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3 (Full Year End)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Archival Notes & Official Endorsements
                      </label>
                      <textarea
                        rows={2}
                        value={archiveNotes}
                        onChange={(e) => setArchiveNotes(e.target.value)}
                        placeholder="e.g. End of 2025 cohort baseline assessments locked following County Education Board validation..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>Archived records are protected against unauthorized alteration.</span>
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Lock & Archive Academic Year</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Archival Security Badge */}
                <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 flex flex-col justify-between border border-emerald-800">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Statutory Archive Integrity</span>
                    </h4>
                    <p className="text-[11px] text-emerald-300 leading-relaxed">
                      Complies with MOE and KNEC 10-year academic record preservation rules. Authorizes instant retrieval for alumni verification, transfer certificates, and audit reporting.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700 text-[10px] text-emerald-200 font-mono mt-3">
                    COMPLIANCE: Section 5.1 & 5.10
                  </div>
                </div>
              </div>

              {/* Archive Repository Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Locked Academic Year Archives</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{archives.length} Archives Stored</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {archives.map((arch) => (
                    <div key={arch.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-sm">Academic Year {arch.academicYear} ({arch.term})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Locked Read-Only</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 max-w-xl">{arch.snapshotNotes}</p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-medium">
                          <span>Total Learners: <strong className="text-slate-700">{arch.totalLearners}</strong></span>
                          <span>Mean Performance: <strong className="text-emerald-600">{arch.meanPerformance}%</strong></span>
                          <span>Archived by: <strong className="text-slate-700">{arch.archivedBy}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreArchive(arch.id);
                            showToast(`✓ Loaded snapshot of Academic Year ${arch.academicYear}`);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>View / Restore</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE HISTORY & TRAJECTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Learner Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 max-w-sm">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Learner to View Longitudinal Trajectory
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or admission number..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex-1 max-w-sm">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Active Learner Dossier
                  </label>
                  <select
                    value={historyStudentId}
                    onChange={(e) => setHistoryStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                  >
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.admNo}) — {s.classArm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trajectory Dashboard */}
              {historyStudent && (
                <div className="space-y-4">
                  {/* Student Header Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base font-black">
                        {historyStudent.avatarInitials || historyStudent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{historyStudent.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {historyStudent.admNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Class: <strong className="text-emerald-400">{historyStudent.classArm}</strong> • Attendance: <strong className="text-slate-200">{historyStudent.attendance || 94}%</strong> • Stream Rank: <strong className="text-slate-200">{historyStudent.position || '1/40'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-[10px] text-slate-400">Current Mean Score</div>
                        <div className="text-xl font-black text-emerald-400">{historyStudent.avgScore || 82}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">CBC Competency Band</div>
                        <div className="text-xl font-black text-white">{historyStudent.overallGrade || 'EE'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Term Progress Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                      <span>Longitudinal Academic Trajectory (Year-on-Year Progression)</span>
                      <span className="text-[11px] text-slate-500 font-normal">5 Evaluated Terms Recorded</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {sampleTrajectory.map((termItem, idx) => (
                        <div key={idx} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{termItem.term}</span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {termItem.grade}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Class Position: <strong>{termItem.rank}</strong> • Attendance: <strong>{termItem.att}%</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-sm font-bold text-slate-800">{termItem.avg}%</span>
                              <span className="text-[10px] text-slate-400 block">Term Mean</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                              {termItem.gradeBand}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          {toastMessage ? (
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Logged in as: <strong className="text-slate-700">{currentUser?.fullName || 'Administrator'}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
