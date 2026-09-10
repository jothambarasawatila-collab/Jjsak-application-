import React, { useState } from 'react';
import {
  BookOpen,
} from 'lucide-react';
import { TimetableLesson } from '../../types/timetable';
import { DAYS_OF_WEEK, DAILY_PERIODS, SUBJECT_COLOR_MAP } from '../../data/timetableData';
import { AVAILABLE_SUBJECTS } from '../../data/mockData';

interface SubjectTimetableViewProps {
  lessons: TimetableLesson[];
  onOpenEditLesson?: (lesson: TimetableLesson) => void;
}

export const SubjectTimetableView: React.FC<SubjectTimetableViewProps> = ({
  lessons,
  onOpenEditLesson,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  const subjectColorDef = SUBJECT_COLOR_MAP[selectedSubject] || SUBJECT_COLOR_MAP['Free'];

  // Filter lessons for this subject across all streams
  const subjectLessons = lessons.filter((l) => l.subject === selectedSubject);

  const availableStreams = Array.from(new Set(lessons.map((l) => l.className))).sort();

  // Calculate morning vs afternoon distribution (Rule P11.7)
  const morningLessons = subjectLessons.filter((l) => l.periodNumber <= 4).length;
  const morningPercentage = subjectLessons.length > 0
    ? Math.round((morningLessons / subjectLessons.length) * 100)
    : 0;

  const assignedTeachers = Array.from(
    new Set(subjectLessons.map((l) => l.teacherName))
  );

  return (
    <div className="space-y-4">
      {/* Subject Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Subject-Wise Timetable Distribution</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                Rule P11.1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-stream curriculum pacing, morning slot weighting, and teacher assignment analysis.
            </p>
          </div>
        </div>

        {/* Dropdown */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
        >
          {AVAILABLE_SUBJECTS.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
          <option value="Pastoral (PPI)">Pastoral (PPI)</option>
          <option value="Life Skills">Life Skills / Clubs</option>
        </select>
      </div>

      {/* Subject KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Total Lessons / Wk</span>
          <div className="text-xl font-black text-white">{subjectLessons.length} Periods</div>
          <span className="text-[10px] text-slate-400">Across {availableStreams.length} streams</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Morning Priority (P11.7)</span>
          <div className="text-xl font-black text-emerald-400">{morningPercentage}% Morning</div>
          <span className="text-[10px] text-slate-400">{morningLessons} of {subjectLessons.length} in P1-P4</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Practicals / Double Pds</span>
          <div className="text-xl font-black text-amber-300">
            {subjectLessons.filter((l) => l.isDouble).length} Doubles
          </div>
          <span className="text-[10px] text-slate-400">Hands-on lab/field sessions</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Assigned Teachers</span>
          <div className="text-xs font-bold text-white truncate">
            {assignedTeachers.join(', ') || 'Staff Allocated'}
          </div>
          <span className="text-[10px] text-slate-400">{assignedTeachers.length} Subject Specialist(s)</span>
        </div>
      </div>

      {/* Stream Distribution Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-3 w-24">Class</th>
                <th className="p-3 w-28 border-l border-slate-800/80">Day</th>
                {DAILY_PERIODS.map((period) => (
                  <th
                    key={period.periodNumber}
                    className={`p-2.5 text-center border-l border-slate-800/80 ${
                      period.isBreak ? 'bg-slate-950/60 text-slate-500' : ''
                    }`}
                  >
                    <div>{period.academicPeriodNumber ? `P${period.academicPeriodNumber}` : 'Break'}</div>
                    <div className="text-[9px] font-mono text-slate-500 font-normal">
                      {period.startTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {availableStreams.map((cls) => {
                return DAYS_OF_WEEK.map((day, dIdx) => {
                  const lesson = lessons.find(
                    (l) => l.className === cls && l.day === day && l.subject === selectedSubject
                  );

                  return (
                    <tr key={`${cls}_${day}`} className="hover:bg-slate-800/30 transition">
                      {dIdx === 0 && (
                        <td
                          rowSpan={5}
                          className="p-3 font-black text-white bg-slate-950/60 border-r border-slate-800 align-middle text-center"
                        >
                          {cls}
                        </td>
                      )}
                      <td className="p-2.5 font-semibold text-slate-300 border-r border-slate-800/80 bg-slate-950/30">
                        {day}
                      </td>

                      {DAILY_PERIODS.map((period) => {
                        if (period.isBreak) {
                          return (
                            <td
                              key={period.periodNumber}
                              className="p-1 text-center bg-slate-950/50 border-l border-slate-800/80 text-[10px] text-slate-500"
                            >
                              -
                            </td>
                          );
                        }

                        const isSlot =
                          lesson && lesson.periodNumber === period.periodNumber;

                        return (
                          <td
                            key={period.periodNumber}
                            onClick={() => isSlot && onOpenEditLesson && onOpenEditLesson(lesson)}
                            className={`p-1 border-l border-slate-800/80 text-center align-middle ${
                              isSlot ? 'cursor-pointer' : ''
                            }`}
                          >
                            {isSlot ? (
                              <div
                                className={`p-1.5 rounded-lg border ${subjectColorDef.bg} ${subjectColorDef.border} shadow-sm text-left`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold ${subjectColorDef.text}`}>
                                    {lesson.teacherInitials}
                                  </span>
                                  {lesson.isDouble && (
                                    <span className="px-1 py-0.2 rounded bg-amber-500 text-white font-black text-[8px]">
                                      2x
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-700">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
