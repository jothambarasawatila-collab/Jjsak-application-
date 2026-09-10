import React, { useState } from 'react';
import {
  X,
  FileEdit,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { User, Teacher } from '../../types';
import { TimetableChangeRequest } from '../../types/timetableGovernance';
import { DayOfWeek } from '../../types/timetable';
import { timetableGovernanceService } from '../../services/timetableGovernanceService';
import { DAYS_OF_WEEK } from '../../data/timetableData';

interface TimetableChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  teachers: Teacher[];
  availableClasses: string[];
  onRequestSubmitted: (newReq: TimetableChangeRequest) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const TimetableChangeRequestModal: React.FC<TimetableChangeRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  teachers,
  availableClasses,
  onRequestSubmitted,
  onLogAudit,
}) => {
  const [targetClass, setTargetClass] = useState<string>(availableClasses[0] || 'Grade 8 South');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [currentSubject, setCurrentSubject] = useState<string>('Mathematics');
  const [currentTeacher, setCurrentTeacher] = useState<string>(teachers[0]?.name || 'Mr. David Kiprop');
  const [proposedSubject, setProposedSubject] = useState<string>('Integrated Science Practical');
  const [proposedTeacherName, setProposedTeacherName] = useState<string>(teachers[1]?.name || 'Mrs. Grace Kimani');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a valid academic justification for this timetable change request.');
      return;
    }

    const requesterRole =
      (currentUser?.designation || '').toUpperCase().includes('CLASS TEACHER') || (currentUser as any)?.assignedClass
        ? 'CLASS_TEACHER'
        : 'TEACHER';

    const newRequest = timetableGovernanceService.submitChangeRequest({
      requestedBy: currentUser?.fullName || 'Teaching Staff Member',
      requesterRole,
      requesterTeacherId: currentUser?.id,
      className: targetClass,
      day,
      periodNumber,
      currentSubject,
      currentTeacher,
      proposedSubject,
      proposedTeacherName,
      reason,
    });

    onRequestSubmitted(newRequest);
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_CHANGE_REQUEST_SUBMITTED',
        `Change request submitted by ${currentUser?.fullName} for ${targetClass} on ${day} Period ${periodNumber}: "${reason}".`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Submit Timetable Change Request
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                  §12 Change Workflow
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Submitted to Director of Academics • Formal Approval Required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>JJSAK Governance Policy (§12):</strong> Submitting this request records your proposal in the
              permanent audit log and alerts the Director of Academics. No request directly modifies the active
              timetable until officially reviewed and approved.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Class / Stream</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Period Number</label>
              <select
                value={periodNumber}
                onChange={(e) => setPeriodNumber(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Current Timetable Slot</span>
              <div>
                <label className="block text-[10px] font-bold text-slate-600">Current Subject</label>
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600">Current Assigned Teacher</label>
                <input
                  type="text"
                  value={currentTeacher}
                  onChange={(e) => setCurrentTeacher(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 block">Proposed Modification</span>
              <div>
                <label className="block text-[10px] font-bold text-indigo-900">Proposed Subject / Activity</label>
                <input
                  type="text"
                  value={proposedSubject}
                  onChange={(e) => setProposedSubject(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-900">Proposed Teacher</label>
                <input
                  type="text"
                  value={proposedTeacherName}
                  onChange={(e) => setProposedTeacherName(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Academic Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="State reason (e.g. CBC practical project block, remedial lesson arrangement, teacher clinic attendance)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
            {errorMsg && <p className="text-[11px] font-bold text-rose-600 mt-1">{errorMsg}</p>}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <div className="text-[10px] text-slate-500">
              Submitted as: <strong>{currentUser?.fullName || 'Teacher'}</strong> ({currentUser?.role || 'TEACHER'})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Director</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
