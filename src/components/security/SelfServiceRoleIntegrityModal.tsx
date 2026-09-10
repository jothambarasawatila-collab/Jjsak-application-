import React from 'react';
import {
  X,
  Lock,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Calendar,
  Layers,
  Building2,
} from 'lucide-react';
import { User as UserType, SchoolInfo } from '../../types';
import {
  ROLE_ASSIGNMENT_RULES,
  institutionalRoleGovernanceService,
} from '../../services/institutionalRoleGovernanceService';
import { masterAuthorizationService } from '../../services/masterAuthorizationService';

interface SelfServiceRoleIntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  schoolInfo: SchoolInfo;
  onOpenGovernanceCenter?: () => void;
}

export const SelfServiceRoleIntegrityModal: React.FC<
  SelfServiceRoleIntegrityModalProps
> = ({
  isOpen,
  onClose,
  currentUser,
  schoolInfo,
  onOpenGovernanceCenter,
}) => {
  if (!isOpen) return null;

  const currentRule = ROLE_ASSIGNMENT_RULES[currentUser.role];
  const canManageRoles = institutionalRoleGovernanceService.canUserManageRoleAssignment(
    currentUser
  );

  const activeRoles = masterAuthorizationService.getActiveRoles(currentUser);
  const isDoA = masterAuthorizationService.isDirectorOfAcademics(currentUser);
  const isLeadership = masterAuthorizationService.hasAnyRole(currentUser, [
    'HEAD_OF_INSTITUTION',
    'HEAD',
    'DEPUTY_HEAD_OF_INSTITUTION',
    'DEPUTY',
    'DIRECTOR_OF_ACADEMICS',
    'DIRECTOR_ACADEMICS',
  ]);

  const assignedSubjects = currentUser.assignedSubjects || [];
  const assignedClasses = currentUser.assignedClasses || [];
  const assignedStreams = currentUser.assignedStreams || [];

  return (
    <div
      id="self-service-role-integrity-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800/80 flex items-center justify-center text-red-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Authorization &amp; Role Integrity Dossier
                </h3>
                <span className="px-2 py-0.2 rounded text-[9px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  JJSAK-AUTHZ-002
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Role Architecture &bull; Assignment-Based Scope &bull; Tenant Isolation
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-role-integrity-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>{schoolInfo.name}</span>
                  <span className="text-slate-600">[{currentUser.schoolId || 'SCH-001'}]</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Primary:</span>
                  <span className="font-bold text-amber-300 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px]">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Tenant Perimeter</div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Isolated (§28)
              </span>
            </div>
          </div>

          {/* Multi-Role User Architecture (§10 & §11) */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-400" />
                <span>Multi-Role Profile (§10)</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">
                {activeRoles.length} Active Role{activeRoles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRoles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-900 text-amber-300 border border-slate-750 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{r}</span>
                </span>
              ))}
            </div>
            {isLeadership && assignedSubjects.length > 0 && (
              <p className="text-[10px] text-emerald-400 mt-1">
                ✓ Leadership User functioning as Subject Teacher under Section 11.
              </p>
            )}
          </div>

          {/* Assignment-Based Teaching Scope (§13, §14 & §15) */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Teaching Assignment Scope (§13)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Scope: {currentUser.academicYearScope || 2026} / {currentUser.termScope || 'Term 3'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-750">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Subjects:</div>
                <div className="font-bold text-slate-200 mt-0.5">
                  {assignedSubjects.length > 0 ? assignedSubjects.join(', ') : 'Social Studies, CRE (Default)'}
                </div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-750">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Classes:</div>
                <div className="font-bold text-slate-200 mt-0.5">
                  {assignedClasses.length > 0 ? assignedClasses.join(', ') : 'Grade 8 S (Default)'}
                </div>
              </div>
            </div>

            {assignedStreams.length > 0 && (
              <div className="text-[10px] text-slate-400">
                <span>Streams: </span>
                <span className="font-bold text-slate-200">{assignedStreams.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Timetable Governance Authority (§16) */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">Timetable Governance Rule (§16)</span>
                <span className="text-slate-400 text-[10px]">
                  {isDoA
                    ? 'Director of Academics authority active: Full Create & Edit permissions.'
                    : 'View-Only access enforced. Only Director of Academics can modify timetables.'}
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                isDoA
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isDoA ? 'Manager' : 'View Only'}
            </span>
          </div>

          {/* Statutory Policy Notice (§17 No Self-Escalation) */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>No Self-Privilege Escalation (§17)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Users within an institution cannot alter, upgrade, downgrade, assign, or switch their own roles or tenant bindings. All assignment adjustments require official administrative authorization.
            </p>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Authorized Approver:</span>
              <strong className="text-amber-300">
                {currentRule?.authorizedApproverDescription || 'Head of Institution / Super Admin'}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {canManageRoles && onOpenGovernanceCenter ? (
            <button
              type="button"
              id="open-governance-center-btn"
              onClick={() => {
                onClose();
                onOpenGovernanceCenter();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role Governance Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              Need assignment changes? Contact your Head of Institution.
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
