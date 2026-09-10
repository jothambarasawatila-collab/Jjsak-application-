import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Award,
  Info,
  Users,
  FileCheck,
} from 'lucide-react';
import { User } from '../../types';
import { isDirectorOfAcademics } from '../../utils/securityEngine';

interface TimetableAccessPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  blockedAction?: string | null;
  blockedActionTitle?: string | null;
  onSelectSimulatedRole?: (user: User) => void;
  availableSimulatedUsers?: User[];
}

export const TimetableAccessPolicyModal: React.FC<TimetableAccessPolicyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  blockedAction,
  blockedActionTitle,
  onSelectSimulatedRole,
  availableSimulatedUsers = [],
}) => {
  if (!isOpen) return null;

  const effectiveBlockedAction = blockedAction || blockedActionTitle;
  const isAuthorized = currentUser ? isDirectorOfAcademics(currentUser) : false;
  const accessLevelLabel = isAuthorized
    ? 'Academic Timetable Administrator (Full Timetable Authority)'
    : 'Read Access User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            effectiveBlockedAction && !isAuthorized
              ? 'bg-rose-950/40 border-rose-900/60'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                effectiveBlockedAction && !isAuthorized
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {effectiveBlockedAction && !isAuthorized ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  {effectiveBlockedAction && !isAuthorized
                    ? 'Access Restricted — Academic Timetable Administrator Required'
                    : 'JJSAK Timetable Access Control Policy'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                  JJSAK-TIMETABLE-ACCESS-002
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isAuthorized
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isAuthorized
                    ? 'Director of Academics (Full Authority)'
                    : 'Read Access Policy Enforced'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Corrected Director of Academics Authority • Academic Timetable Administrator Governance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Blocked Action Banner (if triggered by blocked action for read-only user) */}
          {effectiveBlockedAction && !isAuthorized && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">
                  Restricted Timetable Operation:{' '}
                  <span className="text-rose-300 underline underline-offset-2">
                    {effectiveBlockedAction}
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  Under Policy <strong className="text-white">JJSAK-TIMETABLE-ACCESS-002</strong>, the{' '}
                  <strong className="text-emerald-400">Director of Academics</strong> serves as the
                  Institution&apos;s Academic Timetable Administrator with full management authority.
                  Your current active profile (
                  <strong className="text-amber-300">{currentUser?.fullName || 'User'}</strong> — Role:{' '}
                  <strong className="text-amber-300">{currentUser?.role || 'READ_ACCESS'}</strong>) is
                  classified under Read Access Users and cannot perform this action.
                </p>
                <div className="text-[11px] text-rose-300/80 font-mono mt-1">
                  Security Event recorded in JJSAK Immutable Audit Trail with user stamp and UTC timestamp.
                </div>
              </div>
            </div>
          )}

          {/* Current Active Session Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Session Details</div>
              <div className="text-sm font-black text-white mt-0.5 flex items-center gap-2">
                <span>{currentUser?.fullName || 'Guest User'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentUser?.role || 'User'}
                </span>
                {currentUser?.designation && (
                  <span className="text-[10px] font-medium text-slate-400 italic">
                    ({currentUser.designation})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Designated Timetable Status:{' '}
                <strong className={isAuthorized ? 'text-emerald-400' : 'text-amber-400'}>
                  {accessLevelLabel}
                </strong>
              </div>
            </div>

            {/* Quick Role Tester / Switcher */}
            {availableSimulatedUsers.length > 0 && onSelectSimulatedRole && (
              <div className="space-y-1 sm:text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Simulate Role in System:
                </div>
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    const found = availableSimulatedUsers.find((u) => u.id === e.target.value);
                    if (found) onSelectSimulatedRole(found);
                  }}
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {availableSimulatedUsers.map((u) => {
                    const userIsDoA = isDirectorOfAcademics(u);
                    return (
                      <option key={u.id} value={u.id}>
                        {u.fullName} —{' '}
                        {userIsDoA
                          ? 'Director of Academics (Academic Timetable Administrator — Full Authority)'
                          : `${u.role} (Read Access User)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Policy Objective */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-slate-300 leading-relaxed text-xs">
            <span className="text-indigo-400 font-bold uppercase tracking-wider block mb-1">
              Policy Objective (JJSAK-TIMETABLE-ACCESS-002)
            </span>
            To ensure proper academic governance, the Director of Academics shall not be classified as a Read-Only User
            within the JJSAK Timetable Management System. The Director of Academics shall serve as the
            Institution&apos;s Academic Timetable Administrator with full timetable management authority.
          </div>

          {/* Section 1: Director of Academics – Full Timetable Authority */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  Director of Academics — Full Timetable Authority
                </h4>
              </div>
              {isAuthorized && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Active for Current User
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs">
              The Director of Academics is designated as the <strong className="text-white">Academic Timetable Administrator</strong> and possesses full permission to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {[
                'Create class timetables',
                'Create assessment and examination timetables',
                'Edit timetable entries',
                'Modify subjects and lesson allocations',
                'Adjust periods, bells, and lesson durations',
                'Assign and reassign teachers',
                'Allocate examination rooms and venues',
                'Assign and modify invigilators',
                'Resolve timetable conflicts and scheduling clashes',
                'Regenerate timetable schedules',
                'Publish timetables',
                'Unpublish timetables',
                'Update published timetables',
                'Approve timetable revisions',
                'Configure timetable constraints',
                'Manage academic calendar scheduling rules',
                'Trigger timetable notifications and alerts',
                'Generate, export, and print timetable reports',
                'Maintain timetable compliance with institutional academic policies',
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-900/30 flex items-start gap-2 text-slate-200 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Read Access Users & Permissions */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                Read Access Users & Permissions (JJSAK-TIMETABLE-ACCESS-002)
              </h4>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300">
                Designated Read Access Users:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {[
                  'Head of Institution',
                  'Deputy Head of Institution',
                  'Class Teachers',
                  'Subject Teachers',
                  'Learners',
                  'Parents / Guardians',
                  'Finance Department',
                  'Guidance & Counselling',
                ].map((roleName, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 font-medium text-center"
                  >
                    {roleName}
                  </div>
                ))}
              </div>
            </div>

            {/* Read Access vs Restricted Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Permitted for Read Access Users */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-black">
                  <FileCheck className="w-4 h-4" />
                  <span>Read Access Permissions</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> View published class timetables
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> View examination and assessment schedules
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> Download timetable PDF copies
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> Print timetable reports
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> Receive timetable updates and notifications
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">✓</span> View personal teaching assignments and schedules
                  </li>
                </ul>
              </div>

              {/* Strictly Forbidden for Read Access Users */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-black">
                    <Lock className="w-4 h-4" />
                    <span>Strictly Forbidden for Read Access Users</span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-300/90 font-medium bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  Governance Rule: These restrictions do NOT apply to the Director of Academics.
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {[
                    'Create timetables',
                    'Create examination schedules',
                    'Edit timetable entries',
                    'Modify subjects or lesson allocations',
                    'Change periods, bells, or lesson durations',
                    'Change teacher assignments',
                    'Change room allocations',
                    'Assign or modify invigilators',
                    'Publish or unpublish timetables',
                    'Delete timetables',
                    'Regenerate timetable schedules',
                    'Modify examination schedules',
                    'Override timetable constraints',
                    'Alter academic scheduling rules',
                    'Approve timetable revisions',
                  ].map((action, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span> {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Audit and Security Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-slate-300 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Immutable Audit & Security Controls (JJSAK-TIMETABLE-ACCESS-002)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All timetable actions performed by the Director of Academics or any authorized user are automatically
              recorded in the immutable JJSAK Audit Log, capturing:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 font-mono">
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• User Identity</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• User Role</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• Timestamp</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• Device Information</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• Previous Values</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• New Values</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• Modification Reason</span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">• Approval Records</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-mono">
            Policy JJSAK-TIMETABLE-ACCESS-002 • Director of Academics Timetable Governance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
