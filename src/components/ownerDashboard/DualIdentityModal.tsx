import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRightLeft,
  X,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  UserCheck,
  AlertTriangle,
  LogIn,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { DualIdentityProfile, SchoolUserIdentity } from '../../types/ownerGovernance';
import { ownerGovernanceService } from '../../services/ownerGovernanceService';
import { SchoolTenant, User, UserRole } from '../../types';

interface DualIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdentitySwitched: (mode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL', account?: SchoolUserIdentity) => void;
  onLogAudit?: (action: string, details: string) => void;
  tenants?: SchoolTenant[];
  onAddUser?: (user: User) => void;
  onLogoutToSchoolLogin?: (schoolUsername: string) => void;
}

export const DualIdentityModal: React.FC<DualIdentityModalProps> = ({
  isOpen,
  onClose,
  onIdentitySwitched,
  onLogAudit,
  tenants = [],
  onAddUser,
  onLogoutToSchoolLogin,
}) => {
  const [profile, setProfile] = useState<DualIdentityProfile>(() =>
    ownerGovernanceService.getDualIdentityProfile()
  );
  const [selectedSchoolAccountId, setSelectedSchoolAccountId] = useState<string>(() => {
    const prof = ownerGovernanceService.getDualIdentityProfile();
    return prof.activeSchoolAccountId || prof.schoolAccounts[0]?.id || '';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegisteringSchoolMode, setIsRegisteringSchoolMode] = useState<boolean>(false);

  // Credential verification state for entering school portal
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // School Registration Form State
  const defaultTenant = tenants[0] || {
    schoolId: 'sch-central-001',
    schoolName: 'Central Primary School',
    tenantDomain: 'central-primary.jjsak.internal',
  };

  const [regSchoolId, setRegSchoolId] = useState<string>(defaultTenant.schoolId);
  const [regRole, setRegRole] = useState<UserRole>('TEACHER');
  const [regUsername, setRegUsername] = useState<string>('jotham.teacher');
  const [regPassword, setRegPassword] = useState<string>('SchoolPass@2026!');
  const [regDesignation, setRegDesignation] = useState<string>('Senior Teacher - Social Studies & CBC Lead');
  const [regStaffNumber, setRegStaffNumber] = useState<string>('TSC-741478');
  const [regFullName, setRegFullName] = useState<string>('Jotham Barasa Watila');
  const [regEmail, setRegEmail] = useState<string>('jotham.watila@centralprimary.sc.ke');

  if (!isOpen) return null;

  const handleSwitchToPlatformOwner = () => {
    const res = ownerGovernanceService.switchIdentity('PLATFORM_GOVERNANCE');
    setProfile(res.profile);
    onLogAudit?.(
      'DUAL_IDENTITY_SWITCH',
      `Individual switched authentication session to Platform Governance Identity [${res.profile.ownerAccount.fullName}] (${res.profile.ownerAccount.role}). School privileges terminated.`
    );
    setToastMessage('Switched to Platform Governance Domain as Platform Owner / Super Administrator.');
    setTimeout(() => {
      onIdentitySwitched('PLATFORM_GOVERNANCE');
      onClose();
    }, 700);
  };

  const handleSwitchToSchoolAccountWithVerification = (account: SchoolUserIdentity) => {
    setAuthError(null);
    setIsVerifying(true);

    setTimeout(() => {
      const isValid = ownerGovernanceService.verifySchoolCredentials(account.id, enteredPassword);
      if (!isValid) {
        setIsVerifying(false);
        setAuthError(
          `Invalid School Password. You must enter the separate credentials registered by ${account.schoolName} to access this school portal.`
        );
        return;
      }

      const res = ownerGovernanceService.switchIdentity('SCHOOL_OPERATIONAL', account.id);
      setProfile(res.profile);
      onLogAudit?.(
        'DUAL_IDENTITY_SWITCH',
        `Individual authenticated with separate school credentials for [${account.fullName}] with role '${account.role}' at '${account.schoolName}'. Platform Owner governance rights suspended.`
      );
      setToastMessage(`✓ Verified credentials: Accessing ${account.schoolName} Portal as ${account.role}.`);
      setIsVerifying(false);
      setTimeout(() => {
        onIdentitySwitched('SCHOOL_OPERATIONAL', account);
        onClose();
      }, 700);
    }, 400);
  };

  const handleRegisterBySchool = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTenant = tenants.find((t) => t.schoolId === regSchoolId) || {
      schoolId: regSchoolId,
      schoolName: 'Central Primary School',
      tenantDomain: 'central.jjsak.internal',
    };

    const newSchoolIdentity: SchoolUserIdentity = {
      id: `sch-usr-${Date.now()}`,
      username: regUsername.trim(),
      fullName: regFullName.trim(),
      role: regRole,
      schoolId: targetTenant.schoolId,
      schoolName: targetTenant.schoolName,
      schoolDomain: (targetTenant as any).tenantDomain || `${targetTenant.schoolId}.jjsak.internal`,
      designation: regDesignation.trim(),
      isDesignatedStaff: true,
      password: regPassword.trim(),
      lastLogin: new Date().toISOString(),
    };

    // Register into owner governance service
    const { profile: updatedProfile } = ownerGovernanceService.registerSchoolIdentity(newSchoolIdentity);
    setProfile(updatedProfile);
    setSelectedSchoolAccountId(newSchoolIdentity.id);

    // Also register user into IAM state so login screen can resolve them
    const newIamUser: User = {
      id: newSchoolIdentity.id,
      schoolId: targetTenant.schoolId,
      username: newSchoolIdentity.username,
      fullName: newSchoolIdentity.fullName,
      email: regEmail.trim(),
      role: newSchoolIdentity.role,
      designation: newSchoolIdentity.designation,
      employeeNumber: regStaffNumber.trim(),
      phoneNumber: '+254 741 478 813',
      active: true,
      password: newSchoolIdentity.password || 'SchoolPass@2026!',
      mfaEnabled: true,
      activationStatus: 'ACTIVE',
      firstLoginCompleted: true,
    };

    if (onAddUser) {
      onAddUser(newIamUser);
    }

    onLogAudit?.(
      'STAFF_REGISTER',
      `School registration completed: Jotham Barasa Watila registered by ${targetTenant.schoolName} as ${regRole} (${newSchoolIdentity.username}). Separate school credentials provisioned.`
    );

    setToastMessage(
      `✓ Registered by ${targetTenant.schoolName}! Separate credentials created: ${newSchoolIdentity.username}`
    );
    setIsRegisteringSchoolMode(false);
  };

  const handleDeregisterSchoolAccount = (accountId: string) => {
    const res = ownerGovernanceService.removeSchoolIdentity(accountId);
    setProfile(res.profile);
    setSelectedSchoolAccountId(res.profile.schoolAccounts[0]?.id || '');
    setToastMessage('School operational identity removed. Returned to Owner-Only state.');
  };

  const activeSchoolAccount =
    profile.schoolAccounts.find((s) => s.id === selectedSchoolAccountId) || profile.schoolAccounts[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Dual-Identity Governance &amp; Access Control
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                  Section 7 Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Strict separation between Application Owner credentials and School-Registered credentials.
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

        {/* User Identity Policy Banner */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Dual-Identity Separation Rule (§7):</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            The owner has a dual identity, but <strong>as per now he is the owner of the application and can only login as the owner</strong>, until registered by the school as per the roles of that school. The owner must have <strong>separate details registered by the school</strong> and use those registered credentials to access the school portal.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Owner Credentials</span>
              <strong className="text-amber-400">Owner Portal Only</strong>
            </div>
            <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">School Portal Access</span>
              <strong className="text-blue-400">Requires School Reg.</strong>
            </div>
            <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">School Credentials</span>
              <strong className="text-emerald-400">Separate &amp; Unique</strong>
            </div>
            <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 text-[10px]">
              <span className="text-slate-400 block">Privilege Inheritance</span>
              <strong className="text-red-400">Strictly Forbidden</strong>
            </div>
          </div>
        </div>

        {/* Identities Display & Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Platform Governance Identity (Application Owner) */}
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
                      Application Owner
                    </h3>
                  </div>
                </div>
                {profile.activeMode === 'PLATFORM_GOVERNANCE' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    Active Context
                  </span>
                )}
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-1 font-mono">
                <div className="text-slate-900 font-bold">{profile.ownerAccount.fullName}</div>
                <div className="text-[11px] text-slate-600">Username: <strong className="text-slate-900">{profile.ownerAccount.username}</strong></div>
                <div className="text-[11px] text-slate-500">{profile.ownerAccount.email}</div>
                <div className="text-[10px] text-amber-600 font-bold">Domain: {profile.ownerAccount.domain}</div>
                <div className="text-[10px] text-slate-400">Role: SUPER_ADMIN (Platform Owner)</div>
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                Scope: Platform administration, school tenant provisioning, licensing, security core, and system health.
                <div className="mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[10px]">
                  <strong>Current Rule:</strong> The owner can only log in as the owner. He cannot access the school portal with these owner credentials.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              {profile.activeMode === 'PLATFORM_GOVERNANCE' ? (
                <div className="text-center py-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Currently Logged In as Owner</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSwitchToPlatformOwner}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Owner Identity</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. School Operational Identity */}
          <div
            className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
              profile.activeMode === 'SCHOOL_OPERATIONAL'
                ? 'bg-emerald-500/5 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200'
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
                      School-Registered Account
                    </h3>
                  </div>
                </div>
                {profile.activeMode === 'SCHOOL_OPERATIONAL' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                    Active Context
                  </span>
                ) : profile.schoolAccounts.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    Registered by School
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                    Not Registered
                  </span>
                )}
              </div>

              {/* Case A: No Registered School Account */}
              {profile.schoolAccounts.length === 0 ? (
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2 text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 text-xs">Unregistered by School</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        The owner does not have a school identity yet. Until registered by a school under that school's roles, he cannot access the school portal.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      School Registration Protocol:
                    </span>
                    <p className="text-[10px] text-blue-700 leading-normal">
                      The school must register him with separate details (separate username, role, and password) which he will use to access the school portal.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRegisteringSchoolMode(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Owner in School Staff Registry</span>
                  </button>
                </div>
              ) : (
                /* Case B: Registered by School */
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Select registered school account to access:
                  </div>

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
                        <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                          School Username: <strong>{acc.username}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                          <span>{acc.designation}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeregisterSchoolAccount(acc.id);
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] font-medium flex items-center gap-0.5 cursor-pointer"
                            title="De-register school account"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Credential Verification Entry */}
                  {activeSchoolAccount && (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enter Registered School Password:</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Use the separate password registered for <strong>{activeSchoolAccount.username}</strong> at {activeSchoolAccount.schoolName}.
                      </p>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={enteredPassword}
                          onChange={(e) => {
                            setEnteredPassword(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          placeholder="Registered School Password"
                          className="w-full pl-3 pr-16 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEnteredPassword(activeSchoolAccount.password || 'SchoolPass@2026!')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                          title="Fill registered credential"
                        >
                          Fill
                        </button>
                      </div>

                      {authError && (
                        <div className="text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                          {authError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isVerifying || !enteredPassword}
                          onClick={() => handleSwitchToSchoolAccountWithVerification(activeSchoolAccount)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {isVerifying ? (
                            <span>Verifying...</span>
                          ) : (
                            <>
                              <LogIn className="w-3.5 h-3.5" />
                              <span>Verify &amp; Enter School Portal</span>
                            </>
                          )}
                        </button>

                        {onLogoutToSchoolLogin && (
                          <button
                            type="button"
                            onClick={() => onLogoutToSchoolLogin(activeSchoolAccount.username)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            title="Sign out and log in directly with these school credentials"
                          >
                            Sign In via Lockscreen
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Want to register at another school?</span>
                    <button
                      type="button"
                      onClick={() => setIsRegisteringSchoolMode(true)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      + Register in Another School
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal-within-Modal: School Registration Form */}
        {isRegisteringSchoolMode && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-blue-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Register Owner Under School Operational Role
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Assign separate school details and separate credentials for school portal access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisteringSchoolMode(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleRegisterBySchool} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* School Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select School Tenant:
                  </label>
                  <select
                    value={regSchoolId}
                    onChange={(e) => setRegSchoolId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    {tenants.map((t) => (
                      <option key={t.schoolId} value={t.schoolId}>
                        {t.schoolName} ({t.schoolCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned School Role */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned School Role:
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="TEACHER">Teacher (Subject &amp; Class Teacher)</option>
                    <option value="DEPUTY_HEAD_TEACHER">Deputy Head Teacher</option>
                    <option value="HEAD">Head of Institution / Principal</option>
                    <option value="DIRECTOR_ACADEMICS">Director of Academics</option>
                    <option value="EXAM_OFFICER">Examinations Officer</option>
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Staff Full Name:
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Separate School Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Separate School Username:
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. jotham.teacher"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Separate School Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Separate School Password:
                  </label>
                  <input
                    type="text"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="e.g. SchoolPass@2026!"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Staff Designation:
                  </label>
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Employee / TSC Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TSC / Staff Number:
                  </label>
                  <input
                    type="text"
                    value={regStaffNumber}
                    onChange={(e) => setRegStaffNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* School Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School Email:
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisteringSchoolMode(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Complete School Registration</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-400 text-[11px]">
            Dual-Identity Protocol: <strong className="text-slate-700">Owner Access Separated by School Registration</strong>
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
