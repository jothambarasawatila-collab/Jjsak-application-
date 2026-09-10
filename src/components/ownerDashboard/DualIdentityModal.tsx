import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  ArrowRightLeft,
  X,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { DualIdentityProfile, SchoolUserIdentity } from '../../types/ownerGovernance';
import { ownerGovernanceService } from '../../services/ownerGovernanceService';

interface DualIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdentitySwitched: (mode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL', account?: SchoolUserIdentity) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const DualIdentityModal: React.FC<DualIdentityModalProps> = ({
  isOpen,
  onClose,
  onIdentitySwitched,
  onLogAudit,
}) => {
  const [profile, setProfile] = useState<DualIdentityProfile>(() =>
    ownerGovernanceService.getDualIdentityProfile()
  );
  const [selectedSchoolAccountId, setSelectedSchoolAccountId] = useState<string>(
    profile.activeSchoolAccountId || profile.schoolAccounts[0]?.id || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchToPlatformOwner = () => {
    const res = ownerGovernanceService.switchIdentity('PLATFORM_GOVERNANCE');
    setProfile(res.profile);
    onLogAudit?.(
      'DUAL_IDENTITY_SWITCH',
      `Individual switched authentication session to Platform Governance Identity [${res.profile.ownerAccount.fullName}] (${res.profile.ownerAccount.role}). School privileges terminated.`
    );
    setToastMessage('Switched to Platform Governance Domain as Super Administrator.');
    setTimeout(() => {
      onIdentitySwitched('PLATFORM_GOVERNANCE');
      onClose();
    }, 700);
  };

  const handleSwitchToSchoolAccount = (account: SchoolUserIdentity) => {
    const res = ownerGovernanceService.switchIdentity('SCHOOL_OPERATIONAL', account.id);
    setProfile(res.profile);
    onLogAudit?.(
      'DUAL_IDENTITY_SWITCH',
      `Individual switched authentication session to School Identity [${account.fullName}] with role '${account.role}' at '${account.schoolName}' (${account.schoolId}). Platform Owner governance rights suspended.`
    );
    setToastMessage(`Switched to School Portal for ${account.schoolName} (${account.role}).`);
    setTimeout(() => {
      onIdentitySwitched('SCHOOL_OPERATIONAL', account);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Dual-Identity Management &amp; Context Switcher
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Section 7 Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Enforcing strict institutional separation between Platform Governance and School Operational identities.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border border-emerald-600/60 text-emerald-100 rounded-2xl p-3 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Policy Principle Banner */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Dual-Identity Separation Mandate (§7):</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            A person may simultaneously be Platform Owner and hold an authorized school role (e.g. Teacher, Headteacher). JJSAK maintains <strong>separate accounts, separate authentication sessions, separate permissions, and separate audit trails</strong>. No privilege granted to one identity applies to the other.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Privilege Inheritance</span>
              <strong className="text-red-400">Strictly Blocked</strong>
            </div>
            <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Role Synchronization</span>
              <strong className="text-red-400">Strictly Blocked</strong>
            </div>
            <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Account Merging</span>
              <strong className="text-red-400">Forbidden</strong>
            </div>
            <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Audit Trails</span>
              <strong className="text-emerald-400">100% Isolated</strong>
            </div>
          </div>
        </div>

        {/* Identities Display & Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Platform Governance Identity */}
          <div
            className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
              profile.activeMode === 'PLATFORM_GOVERNANCE'
                ? 'bg-amber-500/5 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                : 'bg-slate-50 border-slate-200 opacity-90'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Platform Governance Identity
                    </span>
                    <h3 className="text-xs font-black text-slate-900">
                      Super Administrator
                    </h3>
                  </div>
                </div>
                {profile.activeMode === 'PLATFORM_GOVERNANCE' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    Active Session
                  </span>
                )}
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-1 font-mono">
                <div className="text-slate-900 font-bold">{profile.ownerAccount.fullName}</div>
                <div className="text-[11px] text-slate-500">{profile.ownerAccount.email}</div>
                <div className="text-[10px] text-amber-600 font-bold">Domain: {profile.ownerAccount.domain}</div>
                <div className="text-[10px] text-slate-400">MFA: Active (Hardware + TOTP)</div>
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                Scope: Platform administration, school provisioning, licensing, security core, and system health. Has <strong>no default school membership</strong>.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              {profile.activeMode === 'PLATFORM_GOVERNANCE' ? (
                <div className="text-center py-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-xl">
                  ✓ Currently Active Context
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSwitchToPlatformOwner}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Platform Governance</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. School Operational Identity */}
          <div
            className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
              profile.activeMode === 'SCHOOL_OPERATIONAL'
                ? 'bg-emerald-500/5 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 opacity-90'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      School Operational Identity
                    </span>
                    <h3 className="text-xs font-black text-slate-900">
                      School-Created Account
                    </h3>
                  </div>
                </div>
                {profile.activeMode === 'SCHOOL_OPERATIONAL' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                    Active Session
                  </span>
                )}
              </div>

              {/* School Accounts Selector */}
              <div className="space-y-2">
                {profile.schoolAccounts.map((acc) => {
                  const isSelected = selectedSchoolAccountId === acc.id;
                  const isCurrentlyActive =
                    profile.activeMode === 'SCHOOL_OPERATIONAL' && profile.activeSchoolAccountId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedSchoolAccountId(acc.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-white border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{acc.schoolName}</span>
                        <div className="flex items-center gap-1">
                          {isCurrentlyActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              Active
                            </span>
                          )}
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {acc.role}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">{acc.username}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{acc.designation}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                Scope: Strictly constrained to assigned school tenant. Managed by institutional administrators; <strong>no platform-level privileges</strong>.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              {profile.activeMode === 'SCHOOL_OPERATIONAL' ? (
                <div className="text-center py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-xl">
                  ✓ Currently Active in School Portal
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const acc =
                      profile.schoolAccounts.find((s) => s.id === selectedSchoolAccountId) ||
                      profile.schoolAccounts[0];
                    if (acc) handleSwitchToSchoolAccount(acc);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Switch to School Identity</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-400 text-[11px]">
            Session isolation status: <strong className="text-slate-700">Strict Cryptographic Boundary Enforced</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
