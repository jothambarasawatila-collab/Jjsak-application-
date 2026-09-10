import React, { useState } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Teacher } from '../../types';
import {
  DayOfWeek,
  TimetableLesson,
  TeacherSubstitutionRecord,
} from '../../types/timetable';
import { DAYS_OF_WEEK, DAILY_PERIODS, findEligibleSubstitutes } from '../../data/timetableData';

interface TeacherSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: TimetableLesson[];
  teachers: Teacher[];
  substitutions: TeacherSubstitutionRecord[];
  onAddSubstitution: (record: TeacherSubstitutionRecord) => void;
  onNotifyToast: (msg: string) => void;
  isAuthorized?: boolean;
}

export const TeacherSubstitutionModal: React.FC<TeacherSubstitutionModalProps> = ({
  isOpen,
  onClose,
  lessons,
  teachers,
  substitutions,
  onAddSubstitution,
  onNotifyToast,
  isAuthorized = true,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>('G8 S');
  const [absentTeacherId, setAbsentTeacherId] = useState<string>(teachers[0]?.id || 'tch-04');
  const [absentReason, setAbsentReason] = useState<string>('Medical Leave / TSC Clinic Attendance');
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [handoverNotes, setHandoverNotes] = useState<string>(
    'Oversee classroom exercises and syllabus progress as scheduled in lesson plan.'
  );
  const [channels, setChannels] = useState<('In-App' | 'SMS' | 'Email' | 'WhatsApp')[]>([
    'In-App',
    'SMS',
    'WhatsApp',
  ]);

  const [activeTab, setActiveTab] = useState<'create' | 'history'>(() => (isAuthorized ? 'create' : 'history'));

  if (!isOpen) return null;

  // Find targeted lesson based on Day, Period, and Class
  const currentLesson = lessons.find(
    (l) => l.day === selectedDay && l.periodNumber === selectedPeriod && l.className === selectedClass
  );

  const subjectTaught = currentLesson?.subject || 'Mathematics';

  // Run Availability Engine: Find qualified free teachers
  const eligibleSubstitutes = findEligibleSubstitutes(
    selectedDay,
    selectedPeriod,
    subjectTaught,
    absentTeacherId,
    lessons,
    teachers
  );

  const absentTeacherObj = teachers.find((t) => t.id === absentTeacherId);
  const chosenSubstituteObj = teachers.find((t) => t.id === selectedSubstituteId);

  const handleToggleChannel = (ch: 'In-App' | 'SMS' | 'Email' | 'WhatsApp') => {
    if (channels.includes(ch)) {
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleConfirmSubstitution = () => {
    if (!isAuthorized) {
      onNotifyToast('Permission Denied: Only Director of Academics is authorized to assign substitute teachers.');
      return;
    }

    if (!chosenSubstituteObj || !absentTeacherObj) {
      alert('Please select a substitute teacher from the qualified list.');
      return;
    }

    const timeSlot = DAILY_PERIODS.find((p) => p.periodNumber === selectedPeriod);
    const periodTimeStr = timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : `Period ${selectedPeriod}`;

    const newRecord: TeacherSubstitutionRecord = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      day: selectedDay,
      periodNumber: selectedPeriod,
      periodTime: periodTimeStr,
      className: selectedClass,
      subject: subjectTaught,
      absentTeacherId,
      absentTeacherName: absentTeacherObj.name,
      absentReason,
      substituteTeacherId: chosenSubstituteObj.id,
      substituteTeacherName: chosenSubstituteObj.name,
      status: 'Confirmed',
      assignedBy: 'Dean of Studies / Academic Admin',
      assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notifiedChannels: channels,
      lessonPlanHandover: handoverNotes,
    };

    onAddSubstitution(newRecord);
    onNotifyToast(
      `Assigned ${chosenSubstituteObj.name} to substitute for ${absentTeacherObj.name} in ${selectedClass} (${subjectTaught}). Alerts dispatched via ${channels.join(
        ', '
      )}.`
    );
    setActiveTab('history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Intelligent Teacher Substitution Engine</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  Rule P11.15
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated substitute discovery, qualification matching, and multi-channel notification dispatch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/50 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'create'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Allocate New Substitute
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Substitution Log & Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {substitutions.length}
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              {/* 7-Step Workflow Visual Breadcrumb */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 font-bold">
                  1. Teacher Absent
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  2. Identify Lesson
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  3. Search Qualified
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  4. Availability
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  5. Allocate
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  6. Dispatch Alerts
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-bold">
                  7. Update & Audit
                </div>
              </div>

              {/* Step 1 & 2: Select Absent Teacher & Lesson Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Lesson Identification</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Absent Teacher
                      </label>
                      <select
                        value={absentTeacherId}
                        onChange={(e) => setAbsentTeacherId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-red-500 focus:outline-none font-medium"
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.subjects?.join(', ') || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Reason for Absence
                      </label>
                      <input
                        type="text"
                        value={absentReason}
                        onChange={(e) => setAbsentReason(e.target.value)}
                        placeholder="e.g. Official Duty, Sick Leave, Workshop"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Slot Coordinates</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Day</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Period</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        {[1, 2, 3, 5, 6, 7, 9, 10].map((p) => {
                          const slot = DAILY_PERIODS.find((s) => s.periodNumber === p);
                          return (
                            <option key={p} value={p}>
                              P{p} ({slot?.startTime})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Class</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        {['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Target Subject:</span>{' '}
                      <strong className="text-white">{subjectTaught}</strong>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold">
                      {currentLesson?.isDouble ? 'Double Practical' : 'Single Period'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 & 4: Search Qualified & Available Teachers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Recommended Free & Qualified Substitutes ({eligibleSubstitutes.length} Available)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ranked by Subject Qualification & Workload Balance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {eligibleSubstitutes.length === 0 ? (
                    <div className="col-span-2 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 text-center">
                      No free teachers available during Period {selectedPeriod} on {selectedDay}. Please adjust periods or consult administration.
                    </div>
                  ) : (
                    eligibleSubstitutes.map(({ teacher, isSpecialist, lessonsToday }) => {
                      const isSelected = selectedSubstituteId === teacher.id;
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => setSelectedSubstituteId(teacher.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{teacher.name}</span>
                                {isSpecialist && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                    Specialist
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Subjects: {teacher.subjects?.join(', ') || 'N/A'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-medium text-slate-400 block">
                              {lessonsToday} lessons today
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isSelected ? 'SELECTED' : 'FREE'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Handover Notes & Notification Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Lesson Plan & Handover Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Instructions for the substitute teacher..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Notification & Alert Channels (Rule P11.18)
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {(['In-App', 'SMS', 'Email', 'WhatsApp'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleToggleChannel(ch)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition cursor-pointer ${
                          channels.includes(ch)
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{ch}</span>
                        {channels.includes(ch) && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubstitution}
                  disabled={!selectedSubstituteId}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                    isAuthorized
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-950/50'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700'
                  }`}
                  title={isAuthorized ? 'Allocate & Send Notifications' : 'Director of Academics authority required'}
                >
                  <Send className="w-4 h-4" />
                  <span>{isAuthorized ? 'Allocate & Send Notifications' : 'Allocate (Director Authority Required)'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sub Tab 2: Substitution Audit History */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recorded Substitution Audit Trails ({substitutions.length})
                </h4>
                <span className="text-[10px] text-slate-500">Immutable Audit Trail (Rule P11.20)</span>
              </div>

              {substitutions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No substitution records currently logged.
                </div>
              ) : (
                <div className="space-y-3">
                  {substitutions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            {sub.day} • {sub.periodTime}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {sub.className} — {sub.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Logged: {sub.date} {sub.assignedAt}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Absent Teacher:</span>{' '}
                          <strong className="text-red-300">{sub.absentTeacherName}</strong>
                          <p className="text-[11px] text-slate-400 italic">Reason: {sub.absentReason}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Allocated Substitute:</span>{' '}
                          <strong className="text-emerald-300">{sub.substituteTeacherName}</strong>
                          <p className="text-[11px] text-slate-400">Assigned by: {sub.assignedBy}</p>
                        </div>
                      </div>

                      {sub.lessonPlanHandover && (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-300">
                          <strong className="text-slate-400">Handover Notes:</strong> {sub.lessonPlanHandover}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                        <span>Dispatched via:</span>
                        {sub.notifiedChannels.map((ch) => (
                          <span key={ch} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
