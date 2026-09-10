import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
  Save,
} from 'lucide-react';
import { ComprehensiveValidationReport } from '../../types/streamTimetableGovernance';
import { streamTimetableGovernanceService } from '../../services/streamTimetableGovernanceService';
import { TimetableLesson } from '../../types/timetable';
import { Teacher, User } from '../../types';
import { isDirectorOfAcademics } from '../../utils/securityEngine';

interface ComprehensiveValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: TimetableLesson[];
  teachers: Teacher[];
  currentUser?: User;
  onPublishConfirmed?: (report: ComprehensiveValidationReport, reason: string, activationDate?: string) => void;
  onSaveDraft?: () => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const ComprehensiveValidationModal: React.FC<ComprehensiveValidationModalProps> = ({
  isOpen,
  onClose,
  lessons,
  teachers,
  currentUser,
  onPublishConfirmed,
  onSaveDraft,
  onLogAudit,
}) => {
  const isAuthorized = currentUser ? isDirectorOfAcademics(currentUser) : false;

  // Run real-time pre-publication validation
  const report: ComprehensiveValidationReport = streamTimetableGovernanceService.validateComprehensiveTimetable(
    lessons,
    teachers,
    currentUser || {
      id: 'usr-doa',
      username: 'academic.director',
      fullName: 'Mr. Jotham Watila',
      role: 'DIRECTOR_ACADEMICS',
      email: 'academics@jjsak.edu',
      active: true,
    }
  );

  const [publishReason, setPublishReason] = useState(
    'Term 2 Academic Stream Timetable Official Release – Complete curriculum & room compliance verified.'
  );
  const [activationDate, setActivationDate] = useState('2026-07-06');
  const [isScheduled, setIsScheduled] = useState(false);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!report.passed) {
      alert('PUBLICATION BLOCKED: All critical teacher, room, and bell conflicts must be resolved first.');
      return;
    }

    if (!isAuthorized) {
      alert('ACCESS DENIED: Only the Director of Academics has authority to publish institutional timetables (§1 & §10).');
      return;
    }

    if (!publishReason.trim()) {
      alert('Mandatory audit requirement: Please state the reason for publication (§9).');
      return;
    }

    if (onPublishConfirmed) {
      onPublishConfirmed(report, publishReason, isScheduled ? activationDate : undefined);
    }

    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_PUBLISHED',
        `Director of Academics published official stream timetable (${lessons.length} lessons). Reason: ${publishReason}. Scheduled activation: ${isScheduled ? activationDate : 'Immediate'}.`
      );
    }

    alert('Timetable published successfully! Changes are now active for teachers and learners.');
    onClose();
  };

  return (
    <div
      id="comprehensive-validation-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Pre-Publication Validation &amp; Publishing Gate
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Final Rule (§5, §6, §11)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validate: Teacher + Subject + Stream + Bell Time + Room + Workload + Availability
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
          {/* Main Status Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              report.passed
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : 'bg-red-950/50 border-red-800/80 text-red-300'
            }`}
          >
            {report.passed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h4 className="text-sm font-black text-white tracking-tight">
                {report.passed
                  ? 'FINAL VALIDATION PASSED – READY FOR OFFICIAL PUBLICATION'
                  : `PUBLICATION LOCKED – ${report.criticalFailuresCount} CRITICAL CONFLICT(S) FOUND`}
              </h4>
              <p className="text-xs">{report.summaryNote}</p>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Teacher Clashes</div>
              <div className="text-lg font-black mt-0.5 text-white">
                {report.teacherClashes.length === 0 ? (
                  <span className="text-emerald-400">0 Double-Bookings</span>
                ) : (
                  <span className="text-red-400">{report.teacherClashes.length} Clashes</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Room Conflicts (§11)</div>
              <div className="text-lg font-black mt-0.5 text-white">
                {report.roomClashes.length === 0 ? (
                  <span className="text-emerald-400">0 Collisions</span>
                ) : (
                  <span className="text-red-400">{report.roomClashes.length} Collisions</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Teacher Workload Violations</div>
              <div className="text-lg font-black mt-0.5 text-white">
                {report.teacherWorkloadConflicts.length === 0 ? (
                  <span className="text-emerald-400">All within 26/wk cap</span>
                ) : (
                  <span className="text-amber-400">{report.teacherWorkloadConflicts.length} Overloaded</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Bell Time Overlaps</div>
              <div className="text-lg font-black mt-0.5 text-white">
                {report.bellScheduleOverlaps.length === 0 ? (
                  <span className="text-emerald-400">0 Overlaps</span>
                ) : (
                  <span className="text-red-400">{report.bellScheduleOverlaps.length} Overlaps</span>
                )}
              </div>
            </div>
          </div>

          {/* Conflict Details (if any) */}
          {!report.passed && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Conflicts Requiring Resolution Before Publication:
              </h5>

              {report.teacherClashes.map((tc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-red-800/70 text-xs text-slate-300">
                  <strong className="text-red-400">Teacher Conflict: </strong>
                  {tc.description}
                  <div className="text-[11px] text-amber-400 mt-1">Suggested Fix: {tc.suggestedFix}</div>
                </div>
              ))}

              {report.roomClashes.map((rc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-red-800/70 text-xs text-slate-300">
                  <strong className="text-red-400">Room Conflict (§11): </strong>
                  {rc.description}
                </div>
              ))}

              {report.teacherWorkloadConflicts.map((wc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-amber-800/70 text-xs text-slate-300">
                  <strong className="text-amber-400">Workload Violation: </strong>
                  {wc.description}
                </div>
              ))}

              {report.bellScheduleOverlaps.map((bo, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-red-800/70 text-xs text-slate-300">
                  <strong className="text-red-400">Bell Schedule Overlap: </strong>
                  {bo.description}
                </div>
              ))}
            </div>
          )}

          {/* Publishing Controls Form (§6) */}
          <div className="p-5 rounded-xl bg-slate-850 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Send className="w-4 h-4 text-red-400" />
                <span>Timetable Publication Settings (§6)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Authorized Officer: <strong>{currentUser?.fullName || 'Academic Director'}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Publication / Modification (Mandatory Audit Trail §9)
              </label>
              <textarea
                rows={2}
                required
                value={publishReason}
                onChange={(e) => setPublishReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs text-white"
                placeholder="State curriculum rationale, version release, or adjustment reason..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                />
                <span>Schedule future timetable activation date</span>
              </label>

              {isScheduled && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Activation Date:</span>
                  <input
                    type="date"
                    value={activationDate}
                    onChange={(e) => setActivationDate(e.target.value)}
                    className="bg-slate-900 border border-slate-750 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Director of Academics is the primary authorized officer to publish and maintain timetables (§1 &amp; §6).
          </div>

          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <button
                type="button"
                onClick={() => {
                  onSaveDraft();
                  alert('Timetable saved as draft successfully.');
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={!report.passed}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                report.passed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isScheduled ? 'Schedule Activation' : 'Publish Approved Timetable'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
