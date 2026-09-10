import React, { useState } from 'react';
import {
  Building2,
} from 'lucide-react';
import { FacilityResource, TimetableLesson, DayOfWeek } from '../../types/timetable';
import { DAYS_OF_WEEK, DAILY_PERIODS, SUBJECT_COLOR_MAP } from '../../data/timetableData';

interface RoomTimetableViewProps {
  facilities: FacilityResource[];
  lessons: TimetableLesson[];
  onOpenEditLesson?: (lesson: TimetableLesson) => void;
}

export const RoomTimetableView: React.FC<RoomTimetableViewProps> = ({
  facilities,
  lessons,
  onOpenEditLesson,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    facilities.length > 0 ? facilities[0].id : 'fac-01'
  );
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('All');

  const activeFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  // Helper to map subject/practical to relevant facility
  const getFacilityLesson = (day: DayOfWeek, periodNumber: number) => {
    return lessons.find((l) => {
      if (l.day !== day || l.periodNumber !== periodNumber) return false;

      // Match based on facility type and practicals
      if (activeFacility.type === 'Science Lab') {
        return l.subject === 'Integrated Science' && l.isDouble;
      }
      if (activeFacility.type === 'Computer Lab') {
        return l.subject === 'Pretechnical Studies' && l.notes?.includes('ICT');
      }
      if (activeFacility.type === 'Workshop') {
        return l.subject === 'Pretechnical Studies' && (l.notes?.includes('Workshop') || l.notes?.includes('Drafting'));
      }
      if (activeFacility.type === 'Agriculture Field') {
        return l.subject === 'Agriculture' && l.isDouble;
      }
      if (activeFacility.type === 'Auditorium') {
        return l.activityType === 'assembly' || l.notes?.includes('Hall');
      }
      if (activeFacility.type === 'Sports Facility') {
        return l.activityType === 'games';
      }
      if (activeFacility.type === 'Classroom') {
        if (activeFacility.name.includes('Room 8')) return l.className === 'G8 S';
        if (activeFacility.name.includes('Room 7')) return l.className === 'G8 N';
        if (activeFacility.name.includes('Room 6')) return l.className === 'G7 S';
        if (activeFacility.name.includes('Room 5')) return l.className === 'G7 N';
      }
      return false;
    });
  };

  const daysToRender = selectedDay === 'All' ? DAYS_OF_WEEK : [selectedDay];

  return (
    <div className="space-y-4">
      {/* Facility Selector Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Facility & Room Timetable Allocation</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                Rule P11.9
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live occupancy monitoring, double-booking prevention, and equipment readiness.
            </p>
          </div>
        </div>

        {/* Facility Dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:border-cyan-500 focus:outline-none"
          >
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.type} • Cap: {fac.capacity})
              </option>
            ))}
          </select>

          {/* Day Filter */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDay('All')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedDay === 'All' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Days
            </button>
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedDay === d ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Facility Information Card */}
      {activeFacility && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Facility Location</span>
            <span className="text-white font-semibold">{activeFacility.location}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Capacity & Spec</span>
            <span className="text-cyan-300 font-semibold">{activeFacility.capacity} Student Stations ({activeFacility.type})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Specialized Equipment</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {activeFacility.specialEquipment?.map((eq, i) => (
                <span key={i} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {eq}
                </span>
              )) || <span className="text-slate-500">Standard Setup</span>}
            </div>
          </div>
        </div>
      )}

      {/* Room Timetable Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-3 w-28">Day</th>
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
              {daysToRender.map((day) => (
                <tr key={day} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-bold text-white bg-slate-950/40 border-r border-slate-800">
                    {day}
                  </td>
                  {DAILY_PERIODS.map((period) => {
                    if (period.isBreak) {
                      return (
                        <td
                          key={period.periodNumber}
                          className="p-1 text-center bg-slate-950/50 border-l border-slate-800/80 text-[10px] text-slate-500"
                        >
                          {period.breakType === 'lunch_break' ? 'Lunch' : 'Break'}
                        </td>
                      );
                    }

                    const lesson = getFacilityLesson(day, period.periodNumber);
                    const colorDef = lesson
                      ? SUBJECT_COLOR_MAP[lesson.subject] || SUBJECT_COLOR_MAP['Free']
                      : SUBJECT_COLOR_MAP['Free'];

                    return (
                      <td
                        key={period.periodNumber}
                        onClick={() => lesson && onOpenEditLesson && onOpenEditLesson(lesson)}
                        className={`p-1.5 border-l border-slate-800/80 text-center align-top ${
                          lesson ? 'cursor-pointer hover:opacity-90' : ''
                        }`}
                      >
                        {lesson ? (
                          <div
                            className={`p-2 rounded-xl border ${colorDef.bg} ${colorDef.border} shadow-sm flex flex-col justify-between min-h-[70px] text-left`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black ${colorDef.text} truncate`}>
                                  {lesson.subject}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-white/80 text-[9px] font-bold text-slate-800">
                                  {lesson.className}
                                </span>
                              </div>
                              {lesson.notes && (
                                <p className="text-[9px] text-slate-600 line-clamp-1 mt-0.5">
                                  {lesson.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-1 text-[9px] font-semibold text-slate-700">
                              <span>{lesson.teacherInitials}</span>
                              {lesson.isDouble && (
                                <span className="px-1 py-0.2 rounded bg-amber-500 text-white font-bold text-[8px]">
                                  2x
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-slate-600 text-[10px] flex items-center justify-center min-h-[70px]">
                            Available
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
