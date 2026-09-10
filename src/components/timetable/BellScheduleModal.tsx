import React, { useState } from 'react';
import {
  X,
  Clock,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { OfficialBellSchedule } from '../../types/streamTimetableGovernance';
import {
  streamTimetableGovernanceService,
  INITIAL_OFFICIAL_BELL_SCHEDULE,
} from '../../services/streamTimetableGovernanceService';

interface BellScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdated?: (schedule: OfficialBellSchedule) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const BellScheduleModal: React.FC<BellScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleUpdated,
  onLogAudit,
}) => {
  const [schedule, setSchedule] = useState<OfficialBellSchedule>(() =>
    streamTimetableGovernanceService.getBellSchedule()
  );

  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleSlotTimeChange = (
    slotId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updatedSlots = schedule.slots.map((s) => {
      if (s.id === slotId) {
        return { ...s, [field]: value };
      }
      return s;
    });

    setSchedule({ ...schedule, slots: updatedSlots });
    setHasChanges(true);
  };

  const handleOpeningClosingChange = (
    field: 'schoolOpeningTime' | 'schoolClosingTime',
    value: string
  ) => {
    setSchedule({ ...schedule, [field]: value });
    setHasChanges(true);
  };

  const handleToggleSaturday = () => {
    setSchedule({ ...schedule, includesSaturday: !schedule.includesSaturday });
    setHasChanges(true);
  };

  const handleResetToDefault = () => {
    if (confirm('Reset bell schedule to the standard JJSAK 10-lesson framework?')) {
      setSchedule(INITIAL_OFFICIAL_BELL_SCHEDULE);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    const finalSchedule = {
      ...schedule,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Director of Academics',
    };
    streamTimetableGovernanceService.saveBellSchedule(finalSchedule);
    setSchedule(finalSchedule);
    setHasChanges(false);
    if (onScheduleUpdated) onScheduleUpdated(finalSchedule);

    if (onLogAudit) {
      onLogAudit(
        'BELL_SCHEDULE_UPDATED',
        `Director of Academics updated institutional bell schedule (${finalSchedule.slots.length} periods, ${finalSchedule.schoolOpeningTime}–${finalSchedule.schoolClosingTime}).`
      );
    }
    alert('Official bell schedule saved and propagated across all stream timetables.');
  };

  return (
    <div
      id="bell-schedule-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Official Bell Schedule Management Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Requirement §4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintain official opening, lesson periods, short/long breaks, lunch break, and closing times
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Schedule Parameters Card */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">School Opening Time</label>
              <input
                type="text"
                value={schedule.schoolOpeningTime}
                onChange={(e) => handleOpeningClosingChange('schoolOpeningTime', e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">School Closing Time</label>
              <input
                type="text"
                value={schedule.schoolClosingTime}
                onChange={(e) => handleOpeningClosingChange('schoolClosingTime', e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Active Days</label>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-750 text-slate-300 text-xs font-semibold">
                Monday – Friday
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={schedule.includesSaturday}
                  onChange={handleToggleSaturday}
                  className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                />
                <span>Include Saturday Timetable</span>
              </label>
              <span className="text-[10px] text-slate-500 mt-1">For remedial &amp; boarding programs</span>
            </div>
          </div>

          {/* Quick Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-750 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                10 Dedicated Teaching Lessons + 3 Standard Interval Breaks (Short, Long, Lunch).
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standard 10-Lesson Preset</span>
            </button>
          </div>

          {/* Slots Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-850">
            <div className="grid grid-cols-12 p-3 bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <div className="col-span-2">Slot Type</div>
              <div className="col-span-4">Label &amp; Designation</div>
              <div className="col-span-3">Start Time</div>
              <div className="col-span-3">End Time</div>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {schedule.slots.map((slot) => {
                const isBreak = slot.isBreak;
                return (
                  <div
                    key={slot.id}
                    className={`grid grid-cols-12 p-3 items-center ${
                      isBreak ? 'bg-slate-900/90 font-medium' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          slot.breakType === 'short_break'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : slot.breakType === 'long_break'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : slot.breakType === 'lunch_break'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {slot.isBreak ? 'Break' : `Period ${slot.academicPeriodNumber || slot.periodNumber}`}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <strong className={`text-xs ${isBreak ? 'text-amber-300' : 'text-white'}`}>
                        {slot.label}
                      </strong>
                      <span className="text-[10px] text-slate-500 ml-2">({slot.durationMinutes} mins)</span>
                    </div>

                    <div className="col-span-3 pr-2">
                      <input
                        type="text"
                        value={slot.startTime}
                        onChange={(e) => handleSlotTimeChange(slot.id, 'startTime', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        value={slot.endTime}
                        onChange={(e) => handleSlotTimeChange(slot.id, 'endTime', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Director of Academics maintains the official bell schedule. Overlaps are detected automatically (§4 &amp; §5).
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50"
            >
              <Save className="w-4 h-4" />
              <span>{hasChanges ? 'Save Modified Bell Schedule' : 'Save Official Bell Schedule'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
