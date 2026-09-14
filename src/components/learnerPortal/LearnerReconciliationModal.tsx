import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Link as LinkIcon,
  Unlink,
  UserPlus,
  Search,
  RefreshCw,
  X,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { User as UserType, Student, SchoolTenant } from '../../types';
import {
  reconcileLearnerAccounts,
  validateLearnerAccountCreation,
} from '../../services/learnerPortalService';
import { LearnerReconciliationStatus } from '../../types/learnerPortal';
import { generateSecureOtpDigits } from '../../utils/cryptoUtils';

interface LearnerReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  students: Student[];
  tenants: SchoolTenant[];
  activeTenantId: string;
  currentUser: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onAddUser?: (newUser: UserType) => void;
  onLogAudit?: (actionType: any, details: string) => void;
}

export const LearnerReconciliationModal: React.FC<LearnerReconciliationModalProps> = ({
  isOpen,
  onClose,
  users,
  students,
  tenants,
  activeTenantId,
  currentUser,
  onUpdateUser,
  onAddUser,
  onLogAudit,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | LearnerReconciliationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Link Dialog State
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [linkingTargetUser, setLinkingTargetUser] = useState<UserType | null>(null);
  const [selectedStudentIdToLink, setSelectedStudentIdToLink] = useState('');
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [linkingSuccess, setLinkingSuccess] = useState<string | null>(null);

  // Create Account Dialog State
  const [isCreatingAccountOpen, setIsCreatingAccountOpen] = useState(false);
  const [creatingTargetStudent, setCreatingTargetStudent] = useState<Student | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password@2026!');
  const [creationErrors, setCreationErrors] = useState<string[]>([]);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);

  // Reconcile
  const reconciliation = useMemo(() => {
    return reconcileLearnerAccounts(users, students, activeTenantId);
  }, [users, students, activeTenantId]);

  const filteredRecords = useMemo(() => {
    return reconciliation.records.filter((rec) => {
      if (selectedFilter !== 'ALL' && rec.status !== selectedFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const accountMatch =
          rec.account?.fullName.toLowerCase().includes(q) ||
          rec.account?.username.toLowerCase().includes(q) ||
          rec.account?.admissionNumber?.toLowerCase().includes(q);
        const profileMatch =
          rec.profile?.name.toLowerCase().includes(q) ||
          rec.profile?.admNo.toLowerCase().includes(q);
        return Boolean(accountMatch || profileMatch);
      }
      return true;
    });
  }, [reconciliation, selectedFilter, searchQuery]);

  if (!isOpen) return null;

  // Handler: Open Link Dialog
  const handleOpenLinkModal = (user: UserType) => {
    setLinkingTargetUser(user);
    setSelectedStudentIdToLink('');
    setLinkingError(null);
    setLinkingSuccess(null);
    setIsLinkingOpen(true);
  };

  // Handler: Execute Link
  const handleExecuteLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingTargetUser || !selectedStudentIdToLink) {
      setLinkingError('Please select an active learner profile to link.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentIdToLink);
    if (!student) {
      setLinkingError('Selected student record was not found.');
      return;
    }

    // Check duplicate
    const duplicate = users.find(
      (u) => u.id !== linkingTargetUser.id && u.role === 'STUDENT' && u.learnerId === student.id
    );
    if (duplicate) {
      setLinkingError(
        `Duplicate Link: Learner '${student.name}' (${student.admNo}) is already linked to account '@${duplicate.username}'.`
      );
      return;
    }

    const updatedUser: UserType = {
      ...linkingTargetUser,
      learnerId: student.id,
      admissionNumber: student.admNo,
      fullName: `${student.name} (${student.classArm || student.grade})`,
    };

    onUpdateUser(updatedUser);
    onLogAudit?.(
      'LEARNER_LINK_RECONCILED' as any,
      `Administrator ${currentUser.fullName} linked account @${linkingTargetUser.username} to student profile ${student.name} (${student.admNo}).`
    );

    setLinkingSuccess(`Successfully linked account @${linkingTargetUser.username} to ${student.name} (${student.admNo})`);
    setTimeout(() => {
      setIsLinkingOpen(false);
      setLinkingTargetUser(null);
      setLinkingSuccess(null);
    }, 1500);
  };

  // Handler: Unlink
  const handleUnlink = (user: UserType) => {
    if (!window.confirm(`Are you sure you want to unlink learner account @${user.username} from profile?`)) {
      return;
    }

    const updatedUser: UserType = {
      ...user,
      learnerId: undefined,
      admissionNumber: undefined,
    };

    onUpdateUser(updatedUser);
    onLogAudit?.(
      'LEARNER_ACCOUNT_UNLINKED' as any,
      `Administrator ${currentUser.fullName} unlinked learner account @${user.username} (previous learnerId: ${user.learnerId}).`
    );
  };

  // Handler: Open Create Account Dialog for an Unlinked Profile
  const handleOpenCreateAccountModal = (student: Student) => {
    setCreatingTargetStudent(student);
    const suggestedUser = `${student.name.split(' ')[0].toLowerCase()}.${student.admNo.split('-').pop() || 'std'}`;
    setNewUsername(suggestedUser);
    setNewEmail(`${suggestedUser}@student.jjsak.ac.ke`);
    setNewPassword('Password@2026!');
    setCreationErrors([]);
    setCreationSuccess(null);
    setIsCreatingAccountOpen(true);
  };

  // Handler: Execute Create Account
  const handleExecuteCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingTargetStudent) return;

    // Strict validation via validation engine
    const validation = validateLearnerAccountCreation({
      username: newUsername.trim(),
      learnerId: creatingTargetStudent.id,
      admissionNumber: creatingTargetStudent.admNo,
      schoolId: activeTenantId,
      existingUsers: users,
      students,
    });

    if (!validation.valid) {
      setCreationErrors(validation.errors);
      return;
    }

    const newUser: UserType = {
      id: `usr-std-${Date.now()}`,
      schoolId: activeTenantId,
      username: newUsername.trim(),
      email: newEmail.trim() || undefined,
      password: newPassword,
      fullName: `${creatingTargetStudent.name} (${creatingTargetStudent.classArm || creatingTargetStudent.grade})`,
      role: 'STUDENT',
      learnerId: creatingTargetStudent.id,
      admissionNumber: creatingTargetStudent.admNo,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      tempOtp: generateSecureOtpDigits(),
      activationStatus: 'ACTIVE',
      activatedAt: Date.now(),
      activatedBy: currentUser.fullName,
    };

    if (onAddUser) {
      onAddUser(newUser);
    } else {
      onUpdateUser(newUser);
    }

    onLogAudit?.(
      'LEARNER_ACCOUNT_CREATED' as any,
      `Administrator ${currentUser.fullName} provisioned new learner account @${newUser.username} linked to ${creatingTargetStudent.name} (${creatingTargetStudent.admNo}).`
    );

    setCreationSuccess(`Created and linked account @${newUser.username} for ${creatingTargetStudent.name}`);
    setTimeout(() => {
      setIsCreatingAccountOpen(false);
      setCreatingTargetStudent(null);
      setCreationSuccess(null);
    }, 1500);
  };

  const currentTenant = tenants.find((t) => t.schoolId === activeTenantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Learner Account &amp; Profile Reconciliation</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative verification of Learner Account ↔ Learner Profile database relationships for {currentTenant?.schoolName || 'Active Institution'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-4 bg-slate-900/60 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Checked</div>
            <div className="text-lg font-black text-white mt-0.5">{reconciliation.summary.totalAccounts + reconciliation.summary.unlinkedProfilesCount}</div>
            <div className="text-[9px] text-slate-400">Accounts + Profiles</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('LINKED')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'LINKED'
                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span>Linked</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{reconciliation.summary.linkedCount}</div>
            <div className="text-[9px] text-slate-400">1:1 Healthy Links</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('UNLINKED_ACCOUNT')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'UNLINKED_ACCOUNT'
                ? 'bg-amber-950/30 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>Unlinked Acc</span>
              <Unlink className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{reconciliation.summary.unlinkedAccountsCount}</div>
            <div className="text-[9px] text-slate-400">Missing learnerId</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('UNLINKED_PROFILE')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'UNLINKED_PROFILE'
                ? 'bg-blue-950/30 border-blue-500 text-blue-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-between">
              <span>Unlinked Prof</span>
              <GraduationCap className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{reconciliation.summary.unlinkedProfilesCount}</div>
            <div className="text-[9px] text-slate-400">No login account</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('INVALID_LINK')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'INVALID_LINK'
                ? 'bg-red-950/30 border-red-500 text-red-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
              <span>Invalid Link</span>
              <ShieldAlert className="w-3 h-3 text-red-400" />
            </div>
            <div className="text-lg font-black text-red-400 mt-0.5">{reconciliation.summary.invalidLinksCount}</div>
            <div className="text-[9px] text-slate-400">Dead reference</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('DUPLICATE')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedFilter === 'DUPLICATE'
                ? 'bg-purple-950/30 border-purple-500 text-purple-300 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>Duplicate</span>
              <AlertTriangle className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-lg font-black text-purple-400 mt-0.5">{reconciliation.summary.duplicatesCount}</div>
            <div className="text-[9px] text-slate-400">Multiple accounts</div>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by learner name, admission number, or username..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Showing <span className="text-white font-bold">{filteredRecords.length}</span> records
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No Issues Matching Filter</div>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                All records matching the current criteria adhere to the strict School → Learner Profile → learnerId → Learner Account policy.
              </p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isLinked = rec.status === 'LINKED';
              const isUnlinkedAcc = rec.status === 'UNLINKED_ACCOUNT';
              const isUnlinkedProf = rec.status === 'UNLINKED_PROFILE';
              const isInvalid = rec.status === 'INVALID_LINK';
              const isDuplicate = rec.status === 'DUPLICATE';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isLinked
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : isUnlinkedAcc
                      ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/50'
                      : isUnlinkedProf
                      ? 'bg-blue-950/10 border-blue-500/30 hover:border-blue-500/50'
                      : isDuplicate
                      ? 'bg-purple-950/10 border-purple-500/30'
                      : 'bg-red-950/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isLinked
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isUnlinkedAcc
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : isUnlinkedProf
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : isDuplicate
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {isLinked && <CheckCircle2 className="w-5 h-5" />}
                      {isUnlinkedAcc && <Unlink className="w-5 h-5" />}
                      {isUnlinkedProf && <GraduationCap className="w-5 h-5" />}
                      {isInvalid && <ShieldAlert className="w-5 h-5" />}
                      {isDuplicate && <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">
                          {rec.account ? rec.account.fullName : rec.profile?.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isLinked
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isUnlinkedAcc
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isUnlinkedProf
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : isDuplicate
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {rec.statusLabel}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {rec.account && (
                          <span className="font-mono text-slate-300">
                            User: @{rec.account.username}
                          </span>
                        )}
                        {rec.account?.learnerId && (
                          <span className="font-mono text-slate-400">
                            Link ID: {rec.account.learnerId}
                          </span>
                        )}
                        {rec.profile && (
                          <span className="text-slate-300">
                            Official Adm: <strong className="text-white">{rec.profile.admNo}</strong> ({rec.profile.classArm || rec.profile.grade})
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <span className="text-slate-300 font-medium">{rec.issueDescription}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isUnlinkedAcc && rec.account && (
                      <button
                        type="button"
                        onClick={() => handleOpenLinkModal(rec.account as UserType)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Link to Profile</span>
                      </button>
                    )}

                    {isUnlinkedProf && rec.profile && (
                      <button
                        type="button"
                        onClick={() => handleOpenCreateAccountModal(rec.profile as Student)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Learner Account</span>
                      </button>
                    )}

                    {(isInvalid || isDuplicate) && rec.account && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLinkModal(rec.account as UserType)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnlink(rec.account as UserType)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs flex items-center gap-1 transition border border-red-800/40 cursor-pointer"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Unlink</span>
                        </button>
                      </div>
                    )}

                    {isLinked && rec.account && (
                      <button
                        type="button"
                        onClick={() => handleUnlink(rec.account as UserType)}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                        title="Unlink this account if reassignment is needed"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Sever Link</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JJSAK Section 2 &amp; 14 Policy: No learner account may exist without an authoritative profile link.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>

      {/* MODAL 1: LINK ACCOUNT TO STUDENT PROFILE */}
      {isLinkingOpen && linkingTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <LinkIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Link Account to Learner Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkingOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="text-slate-400">Account Target:</div>
              <div className="font-bold text-white text-sm mt-0.5">{linkingTargetUser.fullName}</div>
              <div className="font-mono text-amber-400 text-[11px]">@{linkingTargetUser.username} • Role: {linkingTargetUser.role}</div>
            </div>

            {linkingError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-bold">
                {linkingError}
              </div>
            )}

            {linkingSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{linkingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Official Learner Record (Admission Number &amp; Name):
                </label>
                <select
                  value={selectedStudentIdToLink}
                  onChange={(e) => setSelectedStudentIdToLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Choose Learner Profile --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.admNo} - {st.name} ({st.classArm || st.grade})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Linking binds the permanent <code>learnerId</code> to this login credential.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkingOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Confirm Link Relationship</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE LEARNER ACCOUNT FOR UNLINKED PROFILE */}
      {isCreatingAccountOpen && creatingTargetStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Generate Learner Portal Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingAccountOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-800/60 text-xs">
              <div className="text-blue-300 font-medium">Target Learner Profile:</div>
              <div className="font-bold text-white text-sm mt-0.5">{creatingTargetStudent.name}</div>
              <div className="text-slate-400 text-[11px]">
                Admission No: <span className="font-mono text-white font-bold">{creatingTargetStudent.admNo}</span> • Class: {creatingTargetStudent.classArm || creatingTargetStudent.grade}
              </div>
            </div>

            {creationErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs space-y-1 font-medium">
                {creationErrors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {creationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{creationSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Portal Username (Unique identifier):
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  School Notification Email (Optional):
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Initial Temporary Password:
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Section 6 Policy: Learner will be prompted to reset password on first login.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingAccountOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
