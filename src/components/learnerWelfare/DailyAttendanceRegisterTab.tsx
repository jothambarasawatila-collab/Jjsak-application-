import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Activity,
  AlertTriangle,
  Send,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { Student, User } from '../../types';
import {
  AttendanceStatus,
  ClassAttendanceRegister,
  DailyAttendanceEntry,
  ParentCommunicationRecord,
} from '../../types/learnerWelfare';
import { AVAILABLE_CLASSES } from '../../data/mockData';

interface DailyAttendanceRegisterTabProps {
  students: Student[];
  currentUser?: User;
  attendanceRegisters: ClassAttendanceRegister[];
  onSaveRegister: (register: ClassAttendanceRegister) => void;
  onSendParentNotice?: (record: ParentCommunicationRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  Present: {
    label: 'Present',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  Absent: {
    label: 'Absent',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
  },
  Late: {
    label: 'Late',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  Excused: {
    label: 'Excused',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: HelpCircle,
  },
  Sick: {
    label: 'Sickbay / Medical',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Activity,
  },
  'School Activity': {
    label: 'Co-Curricular / Activity',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: Sparkles,
  },
};

export const DailyAttendanceRegisterTab: React.FC<DailyAttendanceRegisterTabProps> = ({
  students,
  currentUser,
  attendanceRegisters,
  onSaveRegister,
  onSendParentNotice,
  onLogAudit,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('G8 S');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-28');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [chronicFilterOnly, setChronicFilterOnly] = useState<boolean>(false);
  const [unlockReasonModal, setUnlockReasonModal] = useState<boolean>(false);
  const [unlockReasonInput, setUnlockReasonInput] = useState<string>('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Active students in selected class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        `${s.grade} ${s.stream || s.classArm || ''}`.trim() === selectedClass ||
        s.grade === selectedClass
    );
  }, [students, selectedClass]);

  // Current register or synthesized register for date & class
  const currentRegister = useMemo(() => {
    const existing = attendanceRegisters.find(
      (r) => r.className === selectedClass && r.date === selectedDate
    );

    if (existing) {
      return existing;
    }

    // Default synthesized initial register
    const parts = selectedClass.split(' ');
    const entries: DailyAttendanceEntry[] = classStudents.map((s, idx) => ({
      id: `att-syn-${s.id}-${selectedDate}`,
      studentId: s.id,
      admNo: s.admNo,
      studentName: s.name,
      grade: s.grade,
      stream: s.stream || parts[1] || 'S',
      className: selectedClass,
      date: selectedDate,
      status: (idx === 3 ? 'Sick' : idx === 1 ? 'Late' : 'Present') as AttendanceStatus,
      minutesLate: idx === 1 ? 15 : undefined,
      recordedBy: currentUser?.fullName || 'Class Teacher',
      recordedAt: `${selectedDate}T08:00:00`,
    }));

    return {
      id: `reg-${selectedClass}-${selectedDate}`,
      className: selectedClass,
      grade: parts[0] || 'G8',
      stream: parts[1] || 'S',
      date: selectedDate,
      academicYear: 2026,
      term: 'Term 2',
      isLocked: false,
      entries,
    };
  }, [attendanceRegisters, selectedClass, selectedDate, classStudents, currentUser]);

  // Attendance stats for current register
  const registerStats = useMemo(() => {
    const total = currentRegister.entries.length;
    const present = currentRegister.entries.filter((e) => e.status === 'Present').length;
    const absent = currentRegister.entries.filter((e) => e.status === 'Absent').length;
    const late = currentRegister.entries.filter((e) => e.status === 'Late').length;
    const excused = currentRegister.entries.filter((e) => e.status === 'Excused').length;
    const sick = currentRegister.entries.filter((e) => e.status === 'Sick').length;
    const activity = currentRegister.entries.filter((e) => e.status === 'School Activity').length;
    const effectivePresent = present + late + activity + excused;
    const rate = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

    return { total, present, absent, late, excused, sick, activity, rate };
  }, [currentRegister]);

  // Chronic Absenteeism checks (< 80% attendance rate in student record)
  const chronicAbsentStudentIds = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.attendance < 80) {
        set.add(s.id);
      }
    });
    return set;
  }, [students]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return currentRegister.entries.filter((entry) => {
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.admNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;

      const isChronic = chronicAbsentStudentIds.has(entry.studentId);
      const matchesChronic = !chronicFilterOnly || isChronic;

      return matchesSearch && matchesStatus && matchesChronic;
    });
  }, [currentRegister, searchTerm, filterStatus, chronicFilterOnly, chronicAbsentStudentIds]);

  const handleUpdateEntryStatus = (
    entryId: string,
    newStatus: AttendanceStatus,
    minutesLate?: number,
    remarks?: string
  ) => {
    if (currentRegister.isLocked) return;

    const updatedEntries = currentRegister.entries.map((e) => {
      if (e.id === entryId) {
        return {
          ...e,
          status: newStatus,
          minutesLate: newStatus === 'Late' ? minutesLate ?? e.minutesLate ?? 10 : undefined,
          remarks: remarks ?? e.remarks,
          recordedAt: new Date().toISOString(),
        };
      }
      return e;
    });

    const updatedRegister: ClassAttendanceRegister = {
      ...currentRegister,
      entries: updatedEntries,
    };

    onSaveRegister(updatedRegister);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (currentRegister.isLocked) return;

    const updatedEntries = currentRegister.entries.map((e) => ({
      ...e,
      status: status,
      recordedAt: new Date().toISOString(),
    }));

    const updatedRegister: ClassAttendanceRegister = {
      ...currentRegister,
      entries: updatedEntries,
    };

    onSaveRegister(updatedRegister);
    triggerNotice(`✓ Marked all ${updatedEntries.length} learners as ${status}`);
  };

  const handleLockRegister = () => {
    const updatedRegister: ClassAttendanceRegister = {
      ...currentRegister,
      isLocked: true,
      lockedBy: currentUser?.fullName || 'Class Teacher',
      lockedAt: new Date().toISOString(),
    };

    onSaveRegister(updatedRegister);
    if (onLogAudit) {
      onLogAudit(
        'ATTENDANCE_REGISTER_LOCKED' as any,
        `Locked and approved Daily Attendance Register for ${selectedClass} on ${selectedDate}. Total learners: ${currentRegister.entries.length}. Attendance rate: ${registerStats.rate}%.`
      );
    }
    triggerNotice(`🔒 Attendance Register for ${selectedClass} is now approved and locked.`);
  };

  const handleUnlockRegister = () => {
    if (!unlockReasonInput.trim()) return;

    const updatedRegister: ClassAttendanceRegister = {
      ...currentRegister,
      isLocked: false,
      unlockedBy: currentUser?.fullName || 'Administrator',
      unlockReason: unlockReasonInput.trim(),
    };

    onSaveRegister(updatedRegister);
    if (onLogAudit) {
      onLogAudit(
        'ATTENDANCE_REGISTER_UNLOCKED' as any,
        `Reopened locked Attendance Register for ${selectedClass} on ${selectedDate}. Reason: "${unlockReasonInput.trim()}". Authorized by ${currentUser?.fullName}.`
      );
    }
    setUnlockReasonModal(false);
    setUnlockReasonInput('');
    triggerNotice(`🔓 Register reopened for authorized edits.`);
  };

  const handleDispatchAbsenteeAlert = (entry: DailyAttendanceEntry) => {
    const student = students.find((s) => s.id === entry.studentId);
    const parentPhone = student?.parentPhone || student?.parents?.[0]?.phoneNumber || '+254 700 000 000';
    const parentName = student?.parentName || student?.parents?.[0]?.name || 'Parent/Guardian';

    const pComm: ParentCommunicationRecord = {
      id: `pcomm-att-${Date.now()}`,
      studentId: entry.studentId,
      studentName: entry.studentName,
      admNo: entry.admNo,
      parentName: parentName,
      parentPhone: parentPhone,
      date: new Date().toISOString(),
      channel: 'SMS',
      purpose: 'Attendance Alert',
      subject: `Attendance Alert: ${entry.studentName}`,
      details: `Dear ${parentName}, learner ${entry.studentName} (${entry.admNo}) has been marked as ${entry.status.toUpperCase()} today (${selectedDate}) at JJSAK Junior School. Please notify the class teacher if you are aware of this absence.`,
      staffName: currentUser?.fullName || 'Class Teacher',
      status: 'Delivered',
    };

    if (onSendParentNotice) {
      onSendParentNotice(pComm);
    }
    if (onLogAudit) {
      onLogAudit(
        'PARENT_COMMUNICATION_SENT' as any,
        `Dispatched automated attendance SMS alert to parent ${parentName} (${parentPhone}) for ${entry.studentName}.`
      );
    }
    triggerNotice(`📲 SMS Attendance Notice dispatched to ${parentName} (${parentPhone})`);
  };

  const triggerNotice = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="p-3 rounded-2xl bg-indigo-900 text-indigo-100 text-xs font-bold shadow-lg border border-indigo-700 flex items-center justify-between animate-fadeIn">
          <span>{notificationToast}</span>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-indigo-300 hover:text-white ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Register Control Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Class Register
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white"
              >
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c} (Roll Register)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Attendance Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-1.5">
              {currentRegister.isLocked ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Locked by {currentRegister.lockedBy || 'Teacher'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Register Open for Entries</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!currentRegister.isLocked ? (
              <>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Present')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockRegister}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                  title="P6.3.4 Lock Approved Register"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Approve &amp; Lock Register</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setUnlockReasonModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                title="P6.3.4 Authorized Reopening"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reopen Register (Audit)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Attendance Breakdown Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Roll</span>
            <div className="text-base font-black text-slate-800 mt-0.5">{registerStats.total}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] text-emerald-700 font-bold uppercase">Present</span>
            <div className="text-base font-black text-emerald-700 mt-0.5">{registerStats.present}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] text-rose-700 font-bold uppercase">Absent</span>
            <div className="text-base font-black text-rose-700 mt-0.5">{registerStats.absent}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] text-amber-700 font-bold uppercase">Late</span>
            <div className="text-base font-black text-amber-700 mt-0.5">{registerStats.late}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] text-blue-700 font-bold uppercase">Excused</span>
            <div className="text-base font-black text-blue-700 mt-0.5">{registerStats.excused}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[10px] text-purple-700 font-bold uppercase">Sickbay</span>
            <div className="text-base font-black text-purple-700 mt-0.5">{registerStats.sick}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-700 font-bold uppercase">Daily Rate</span>
            <div className="text-base font-black text-indigo-700 mt-0.5">{registerStats.rate}%</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter learners in this register..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            {(['All', 'Present', 'Absent', 'Late', 'Sick'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Chronic Absenteeism Toggle Filter */}
          <button
            type="button"
            onClick={() => setChronicFilterOnly(!chronicFilterOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
              chronicFilterOnly
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title="P6.4.2 Chronic Absenteeism Flag (<80%)"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Chronic Absent (&lt;80%)</span>
          </button>
        </div>
      </div>

      {/* Attendance Register Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Learner &amp; Adm No</th>
                <th className="py-3 px-3">Cumulative Rate</th>
                <th className="py-3 px-3">Status for {selectedDate}</th>
                <th className="py-3 px-3">Late Min / Remarks</th>
                <th className="py-3 px-4 text-right">Instant Comms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                    No records found in this register matching filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const student = students.find((s) => s.id === entry.studentId);
                  const cumRate = student?.attendance ?? 95;
                  const isChronic = cumRate < 80;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/80 transition ${
                        entry.status === 'Absent'
                          ? 'bg-rose-50/20'
                          : entry.status === 'Sick'
                          ? 'bg-purple-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {student?.avatarInitials || entry.studentName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{entry.studentName}</span>
                              {isChronic && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  Chronic Flag
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">{entry.admNo}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cumRate >= 90
                                  ? 'bg-emerald-500'
                                  : cumRate >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${cumRate}%` }}
                            />
                          </div>
                          <span
                            className={`font-bold font-mono text-[11px] ${
                              cumRate >= 90
                                ? 'text-emerald-700'
                                : cumRate >= 80
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {cumRate}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {(
                            [
                              'Present',
                              'Absent',
                              'Late',
                              'Excused',
                              'Sick',
                              'School Activity',
                            ] as AttendanceStatus[]
                          ).map((statusKey) => {
                            const config = ATTENDANCE_STATUS_CONFIG[statusKey];
                            const isSelected = entry.status === statusKey;

                            return (
                              <button
                                key={statusKey}
                                type="button"
                                disabled={currentRegister.isLocked}
                                onClick={() => handleUpdateEntryStatus(entry.id, statusKey)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border cursor-pointer ${
                                  isSelected
                                    ? `${config.bg} ${config.text} ${config.border} shadow-xs ring-1 ring-offset-0 ring-indigo-400`
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 opacity-60 hover:opacity-100'
                                } ${currentRegister.isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                              >
                                <span>{config.label.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {entry.status === 'Late' && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              disabled={currentRegister.isLocked}
                              value={entry.minutesLate || 15}
                              onChange={(e) =>
                                handleUpdateEntryStatus(
                                  entry.id,
                                  'Late',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-14 px-1.5 py-0.5 border border-amber-300 rounded bg-amber-50 font-bold text-amber-900 text-xs"
                            />
                            <span className="text-[10px] text-slate-500 font-medium">min late</span>
                          </div>
                        )}

                        {entry.status !== 'Late' && (
                          <input
                            type="text"
                            disabled={currentRegister.isLocked}
                            value={entry.remarks || ''}
                            placeholder="Add reason/note..."
                            onChange={(e) =>
                              handleUpdateEntryStatus(
                                entry.id,
                                entry.status,
                                entry.minutesLate,
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-0.5 border border-slate-200 rounded bg-slate-50 text-[11px] focus:bg-white"
                          />
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(entry.status === 'Absent' || entry.status === 'Late' || isChronic) && (
                          <button
                            type="button"
                            onClick={() => handleDispatchAbsenteeAlert(entry)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition flex items-center gap-1 ml-auto border border-indigo-200 cursor-pointer"
                            title="P6.4.3 Dispatch Automated SMS Notice to Parent"
                          >
                            <Send className="w-3 h-3" />
                            <span>Notify Parent</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlock Reason Modal (Audit Compliance) */}
      {unlockReasonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Authorize Register Reopening</h3>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              In accordance with <strong>P6.3.4 Attendance Locking Rule</strong>, reopening a locked
              register requires an explicit authorization note and will be recorded in the permanent
              audit trail.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Reason for Reopening <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={unlockReasonInput}
                onChange={(e) => setUnlockReasonInput(e.target.value)}
                placeholder="e.g. Correcting mistaken absence for learner participating in County Drama Festival..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUnlockReasonModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!unlockReasonInput.trim()}
                onClick={handleUnlockRegister}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Authorize &amp; Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
