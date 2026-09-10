import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Award,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  SchoolCalendarConfig,
  TimetableSettings,
  TeacherAvailability,
} from '../../types/timetable';
import { Teacher } from '../../types';

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarConfig: SchoolCalendarConfig;
  timetableSettings: TimetableSettings;
  teacherAvailabilities: TeacherAvailability[];
  teachers: Teacher[];
  onSaveConfig: (
    cal: SchoolCalendarConfig,
    settings: TimetableSettings,
    availabilities: TeacherAvailability[]
  ) => void;
  onNotifyToast: (msg: string) => void;
  isAuthorized?: boolean;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({
  isOpen,
  onClose,
  calendarConfig: initialCal,
  timetableSettings: initialSettings,
  teacherAvailabilities: initialAvail,
  teachers: _teachers,
  onSaveConfig,
  onNotifyToast,
  isAuthorized = true,
}) => {
  const [calendar, setCalendar] = useState<SchoolCalendarConfig>(initialCal);
  const [settings, setSettings] = useState<TimetableSettings>(initialSettings);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>(initialAvail);
  const [activeTab, setActiveTab] = useState<'calendar' | 'periods' | 'teachers' | 'priorities'>(
    'calendar'
  );

  if (!isOpen) return null;

  const handleSaveAll = () => {
    if (!isAuthorized) {
      onNotifyToast('Permission Denied: Only Director of Academics can modify calendar structures or scheduling rules.');
      return;
    }
    onSaveConfig(calendar, settings, availabilities);
    onNotifyToast('Academic Structure & Scheduling Configuration saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Academic Calendar & Structure Configuration</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
                  Rules P11.3 - P11.7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure term dates, period bell schedules, teacher workload limits, and morning subject priorities.
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
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. School Calendar (P11.4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('periods')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'periods'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Bell Periods (P11.5)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teachers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Teacher Availability (P11.6)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('priorities')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'priorities'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Subject Priorities (P11.7)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: School Calendar Config (P11.4) */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    value={calendar.academicYear}
                    onChange={(e) =>
                      setCalendar({ ...calendar, academicYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Academic Term
                  </label>
                  <input
                    type="text"
                    value={calendar.academicTerm}
                    onChange={(e) => setCalendar({ ...calendar, academicTerm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    School Opening Date
                  </label>
                  <input
                    type="date"
                    value={calendar.schoolOpeningDate}
                    onChange={(e) =>
                      setCalendar({ ...calendar, schoolOpeningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    School Closing Date
                  </label>
                  <input
                    type="date"
                    value={calendar.schoolClosingDate}
                    onChange={(e) =>
                      setCalendar({ ...calendar, schoolClosingDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Public Holidays & Mid-Term Breaks */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Non-Learning Dates & Exclusions (Engine Auto-Avoids)</span>
                  <span className="text-[10px] text-indigo-400 font-normal">P11.4 Constraint</span>
                </div>
                <div className="space-y-2">
                  {calendar.publicHolidays.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span className="font-semibold text-slate-200">{h.name}</span>
                      <span className="font-mono text-slate-400">{h.date}</span>
                    </div>
                  ))}
                  {calendar.midTermBreaks.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span className="font-semibold text-amber-300">{b.title}</span>
                      <span className="font-mono text-slate-400">
                        {b.startDate} to {b.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Period Duration & Bell Structure (P11.5) */}
          {activeTab === 'periods' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Lesson Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.periodDurationMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, periodDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Total Slots / Day
                  </label>
                  <input
                    type="number"
                    value={settings.periodsPerDay}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Max Consecutive Lessons
                  </label>
                  <input
                    type="number"
                    value={settings.maxConsecutivePeriodsPerTeacher || 2}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxConsecutivePeriodsPerTeacher: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Period Timeline Preview */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Bell Timetable Structure
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 1:</strong> 08:20 – 09:00 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 2:</strong> 09:00 – 09:40 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 3:</strong> 09:40 – 10:20 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                    <strong className="block">Short Break:</strong> 10:20 – 10:30 (10m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 4:</strong> 10:30 – 11:10 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 5:</strong> 11:10 – 11:50 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 6:</strong> 11:50 – 12:30 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                    <strong className="block">Long Break:</strong> 12:30 – 12:50 (20m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 7:</strong> 12:50 – 13:30 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white block">Period 8:</strong> 13:30 – 14:10 (40m)
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 col-span-2">
                    <strong className="block">Lunch & Activities:</strong> 14:10 – 15:20 (70m)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Teacher Availability Engine (P11.6) */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Teacher Workload Quotas & Teaching Preferences
                </h4>
                <span className="text-[10px] text-slate-400">Strict allocation boundaries</span>
              </div>

              <div className="space-y-2.5">
                {availabilities.map((avail) => (
                  <div
                    key={avail.teacherId}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{avail.teacherName}</div>
                      <div className="text-[11px] text-slate-400">
                        Subjects: {avail.subjectsTaught.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Max Lessons/Day</span>
                        <input
                          type="number"
                          value={avail.maxLessonsPerDay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAvailabilities(
                              availabilities.map((a) =>
                                a.teacherId === avail.teacherId
                                  ? { ...a, maxLessonsPerDay: val }
                                  : a
                              )
                            );
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-center text-xs font-bold"
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Max Lessons/Wk</span>
                        <input
                          type="number"
                          value={avail.maxLessonsPerWeek}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAvailabilities(
                              availabilities.map((a) =>
                                a.teacherId === avail.teacherId
                                  ? { ...a, maxLessonsPerWeek: val }
                                  : a
                              )
                            );
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-center text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Subject Priority Engine (P11.7) */}
          {activeTab === 'priorities' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Rule P11.7 — Automatic Morning Priority Allocation</span>
                </div>
                <p className="text-[11px] text-indigo-200/80">
                  High-priority subjects receive preferred morning slots (Periods 1 to 4) to maximize learner cognition and concentration efficiency.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.prioritizeMorningCoreSubjects}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        prioritizeMorningCoreSubjects: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Prioritize Morning Core Subjects (Mathematics, English, Kiswahili, Integrated Science)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Engine allocates 85%+ of core lessons before the 12:30 PM long break.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDoubleLessonsForPracticals}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowDoubleLessonsForPracticals: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Automatic Double Lesson Pairing for Practicals (Rule P11.8)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Allocates consecutive periods for Science Labs, ICT hands-on, Workshop Drafting, and Agriculture field demos.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition cursor-pointer ${
              isAuthorized
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-950/50'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700'
            }`}
            title={isAuthorized ? 'Save Configuration' : 'Director of Academics authority required'}
          >
            <Save className="w-4 h-4" />
            <span>{isAuthorized ? 'Save Configuration' : 'Save (Director Authority Required)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
