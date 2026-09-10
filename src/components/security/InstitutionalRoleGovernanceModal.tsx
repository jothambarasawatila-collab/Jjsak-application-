import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  FileCheck,
  Clock,
  Building2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Download,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { User, SchoolInfo } from '../../types';
import {
  RoleChangeAuditRecord,
  RoleChangeRequest,
  RoleChangeActionType,
  UserRoleNotification,
} from '../../types/roleGovernance';
import {
  institutionalRoleGovernanceService,
  ROLE_ASSIGNMENT_RULES,
} from '../../services/institutionalRoleGovernanceService';

interface InstitutionalRoleGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  schoolInfo: SchoolInfo;
  users: User[];
  onUserUpdated?: (updatedUser: User) => void;
  onLogAudit?: (action: any, details: string, before?: string, after?: string) => void;
}

export const InstitutionalRoleGovernanceModal: React.FC<
  InstitutionalRoleGovernanceModalProps
> = ({
  isOpen,
  onClose,
  currentUser,
  schoolInfo,
  users,
  onUserUpdated,
  onLogAudit,
}) => {
  const schoolId = (schoolInfo as any).id || (schoolInfo as any).schoolId || 'sch-ngonyek-001';

  const [activeTab, setActiveTab] = useState<
    'execute' | 'pending' | 'audit' | 'policy' | 'notifications'
  >('execute');

  // Form State for Direct Execution or Submission
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>('');
  const [proposedRole, setProposedRole] = useState<string>('TEACHER');
  const [actionType, setActionType] = useState<RoleChangeActionType>('ASSIGNMENT');
  const [changeReason, setChangeReason] = useState<string>('');
  const [workflowMode, setWorkflowMode] = useState<'DIRECT' | 'WORKFLOW'>('DIRECT');

  // Audit Search & Filter
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');

  // Feedback Notification
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Filtered target users: excluding current user to enforce self-service restriction
  const availableTargetUsers = useMemo(() => {
    return users.filter((u) => u.id !== currentUser.id);
  }, [users, currentUser.id]);

  const targetUser = useMemo(() => {
    return users.find((u) => u.id === selectedTargetUserId) || null;
  }, [users, selectedTargetUserId]);

  // Real-time permission check
  const permissionValidation = useMemo(() => {
    if (!targetUser) {
      return { allowed: false, reason: 'Please select an institutional user to modify.' };
    }
    return institutionalRoleGovernanceService.validateRoleChange(
      currentUser,
      targetUser,
      proposedRole,
      changeReason || 'Placeholder validation check'
    );
  }, [currentUser, targetUser, proposedRole, changeReason]);

  // Load audit records and pending requests
  const [auditRecords, setAuditRecords] = useState<RoleChangeAuditRecord[]>(() =>
    institutionalRoleGovernanceService.getRoleChangeAuditRecords(schoolId)
  );
  const [pendingRequests, setPendingRequests] = useState<RoleChangeRequest[]>(() =>
    institutionalRoleGovernanceService.getPendingChangeRequests(schoolId)
  );
  const [notifications, setNotifications] = useState<UserRoleNotification[]>(() =>
    institutionalRoleGovernanceService.getUserNotifications(currentUser.id)
  );

  const refreshData = () => {
    setAuditRecords(
      institutionalRoleGovernanceService.getRoleChangeAuditRecords(schoolId)
    );
    setPendingRequests(
      institutionalRoleGovernanceService.getPendingChangeRequests(schoolId)
    );
    setNotifications(
      institutionalRoleGovernanceService.getUserNotifications(currentUser.id)
    );
  };

  // Filtered Audit Records
  const filteredAuditRecords = useMemo(() => {
    return auditRecords.filter((rec) => {
      const matchesSearch =
        rec.affectedUserName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        rec.previousRole.toLowerCase().includes(auditSearch.toLowerCase()) ||
        rec.newRole.toLowerCase().includes(auditSearch.toLowerCase()) ||
        rec.initiatorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        rec.approverName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        rec.reason.toLowerCase().includes(auditSearch.toLowerCase());

      const matchesAction =
        auditActionFilter === 'ALL' || rec.actionType === auditActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditRecords, auditSearch, auditActionFilter]);

  if (!isOpen) return null;

  // Handler: Execute Authorized Role Change
  const handleExecuteChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetUser) {
      showFeedback('error', 'Please select an institutional personnel to modify.');
      return;
    }

    if (currentUser.id === targetUser.id) {
      showFeedback(
        'error',
        'INSTITUTIONAL ROLE INTEGRITY RULE: You cannot change or assign your own role.'
      );
      return;
    }

    if (!changeReason || changeReason.trim().length < 10) {
      showFeedback(
        'error',
        'Mandatory justification required: Please provide a detailed official reason (minimum 10 characters).'
      );
      return;
    }

    const rule = ROLE_ASSIGNMENT_RULES[proposedRole];
    if (!rule) {
      showFeedback('error', `Unknown institutional role: ${proposedRole}`);
      return;
    }

    // Check if workflow routing is required or requested
    if (workflowMode === 'WORKFLOW' || rule.requiresWorkflowApproval) {
      // Submit for multi-step approval workflow
      const result = institutionalRoleGovernanceService.submitRoleChangeRequest(
        currentUser,
        targetUser,
        proposedRole,
        changeReason,
        schoolId,
        schoolInfo.name
      );

      if (!result.success) {
        showFeedback('error', result.error || 'Failed to submit role change request.');
        return;
      }

      showFeedback(
        'success',
        `✓ Role change request submitted for statutory approval by: ${rule.authorizedApproverDescription}`
      );
      refreshData();
      setChangeReason('');
      setActiveTab('pending');
      return;
    }

    // Direct Authorized Execution
    const result = institutionalRoleGovernanceService.executeAuthorizedRoleChange(
      currentUser,
      targetUser,
      proposedRole,
      changeReason,
      {
        actionType,
        institutionId: schoolId,
        institutionName: schoolInfo.name,
      }
    );

    if (!result.success || !result.auditRecord) {
      showFeedback('error', result.error || 'Failed to execute role change.');
      return;
    }

    // Update target user in parent state
    const updatedUser: User = {
      ...targetUser,
      role: proposedRole as any,
    };
    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }

    if (onLogAudit) {
      onLogAudit(
        'PERMISSION_CHANGE' as any,
        `Role for ${targetUser.fullName} officially modified from ${targetUser.role} to ${proposedRole} by ${currentUser.fullName}. Reason: ${changeReason}`,
        targetUser.role,
        proposedRole
      );
    }

    showFeedback(
      'success',
      `✓ Official role for ${targetUser.fullName} changed to '${proposedRole}'. Immutable audit record generated.`
    );
    refreshData();
    setChangeReason('');
    setActiveTab('audit');
  };

  // Handler: Approve pending request
  const handleApproveRequest = (req: RoleChangeRequest) => {
    const result = institutionalRoleGovernanceService.approveRoleChangeRequest(
      currentUser,
      req.id,
      `Authorized sign-off by ${currentUser.fullName} (${currentUser.role})`
    );

    if (!result.success || !result.auditRecord) {
      showFeedback('error', result.error || 'Approval failed.');
      return;
    }

    const tUser = users.find((u) => u.id === req.targetUserId);
    if (tUser && onUserUpdated) {
      onUserUpdated({ ...tUser, role: req.proposedRole as any });
    }

    showFeedback(
      'success',
      `✓ Request approved. ${req.targetUserName} promoted to '${req.proposedRole}'.`
    );
    refreshData();
  };

  // Handler: Reject pending request
  const handleRejectRequest = (req: RoleChangeRequest) => {
    const reason = window.prompt(
      `Enter reason for rejecting role change for ${req.targetUserName}:`,
      'Non-compliant with institutional staffing guidelines'
    );
    if (!reason) return;

    const result = institutionalRoleGovernanceService.rejectRoleChangeRequest(
      currentUser,
      req.id,
      reason
    );

    if (!result.success) {
      showFeedback('error', result.error || 'Rejection failed.');
      return;
    }

    showFeedback('success', `✓ Role change request rejected.`);
    refreshData();
  };

  // Export audit records as printable report / JSON
  const handleExportAudit = () => {
    const content = JSON.stringify(auditRecords, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JJSAK_Role_Change_Immutable_Audit_${schoolId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', '✓ Immutable role audit records exported successfully.');
  };

  return (
    <div
      id="institutional-role-governance-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-[#C51E28] shadow-inner">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  JJSAK Institutional Role Governance &amp; Change Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800/80 uppercase">
                  Statutory Rule
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{schoolInfo.name}</span>
                <span>•</span>
                <span className="text-slate-300">
                  Officer: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-role-governance-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between transition ${
              feedback.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-b border-emerald-800'
                : 'bg-red-950 text-red-200 border-b border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Governance Navigation Tabs */}
        <div className="px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="tab-execute-role-change"
              onClick={() => setActiveTab('execute')}
              className={`px-3.5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'execute'
                  ? 'border-[#C51E28] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-red-400" />
              <span>Assign / Modify Role</span>
            </button>

            <button
              type="button"
              id="tab-pending-workflows"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'border-[#C51E28] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Approvals</span>
              {pendingRequests.filter((r) => r.status === 'PENDING_APPROVAL').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {pendingRequests.filter((r) => r.status === 'PENDING_APPROVAL').length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab-immutable-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-[#C51E28] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Trail</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                {auditRecords.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-governance-policy"
              onClick={() => setActiveTab('policy')}
              className={`px-3.5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'policy'
                  ? 'border-[#C51E28] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Role Assignment Policy (§1–8)</span>
            </button>

            <button
              type="button"
              id="tab-role-notifications"
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-[#C51E28] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Staff Notifications</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500 text-white font-black">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={refreshData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1 shrink-0"
            title="Refresh records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* ======================================================== */}
          {/* TAB 1: EXECUTE AUTHORIZED ROLE CHANGE                    */}
          {/* ======================================================== */}
          {activeTab === 'execute' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Institutional Role Integrity Rule Alert Banner */}
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-200 uppercase tracking-wide">
                    Institutional Role Integrity Rule (§1)
                  </h4>
                  <p className="text-xs text-red-300 leading-relaxed">
                    Users within a school institution shall not have the ability to change, upgrade, downgrade, assign, or switch their own roles. All role modifications require authorized approver verification, permission validation, and immutable audit logging.
                  </p>
                </div>
              </div>

              <form onSubmit={handleExecuteChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Target User Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>1. Select Institutional Personnel to Modify</span>
                      <span className="text-[10px] text-red-400 font-normal">
                        (Self-selection blocked by policy)
                      </span>
                    </label>
                    <select
                      id="role-change-target-user"
                      value={selectedTargetUserId}
                      onChange={(e) => setSelectedTargetUserId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-[#C51E28]"
                      required
                    >
                      <option value="">-- Choose School Staff Member --</option>
                      {availableTargetUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} — Current Role: {u.role} ({u.employeeNumber || u.username})
                        </option>
                      ))}
                    </select>
                    {targetUser && (
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Current Role:</span>
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-700">
                          {targetUser.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Proposed New Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>2. Proposed Institutional Role</span>
                      <span className="text-[10px] text-slate-400">Approver Matrix Enforced</span>
                    </label>
                    <select
                      id="role-change-proposed-role"
                      value={proposedRole}
                      onChange={(e) => setProposedRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-[#C51E28]"
                      required
                    >
                      <optgroup label="Instructional &amp; Class Staff">
                        <option value="TEACHER">Teacher (Subject Instruction)</option>
                        <option value="CLASS_TEACHER">Class Teacher (Stream Custodian)</option>
                        <option value="SUBJECT_TEACHER">Subject Teacher (Curriculum Allocations)</option>
                      </optgroup>
                      <optgroup label="Academic &amp; School Leadership">
                        <option value="DIRECTOR_ACADEMICS">Director of Academics (Sole Academic Admin)</option>
                        <option value="DEPUTY">Deputy Head of Institution</option>
                        <option value="HEAD">Head of Institution (Principal)</option>
                      </optgroup>
                      <optgroup label="Operations &amp; Administration">
                        <option value="ADMIN">School Administrator (Records / Support)</option>
                        <option value="FINANCE">Finance Officer / Bursar</option>
                      </optgroup>
                    </select>

                    {/* Approver Requirements Card */}
                    {ROLE_ASSIGNMENT_RULES[proposedRole] && (
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Authorized Approver:</span>
                          <span className="font-bold text-amber-300">
                            {ROLE_ASSIGNMENT_RULES[proposedRole].authorizedApproverDescription}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Workflow Type:</span>
                          <span className="text-slate-300">
                            {ROLE_ASSIGNMENT_RULES[proposedRole].requiresWorkflowApproval
                              ? 'Executive Workflow Approval Required'
                              : 'Direct Authorized Assignment'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Type & Workflow Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      3. Action Classification
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as RoleChangeActionType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold"
                    >
                      <option value="ASSIGNMENT">Assignment (Class / Subject / Department)</option>
                      <option value="PROMOTION">Promotion (Elevation to Higher Responsibilities)</option>
                      <option value="TRANSFER">Transfer (Lateral Institutional Realignment)</option>
                      <option value="ACTIVATION">Activation (Onboarding / Reinstatement)</option>
                      <option value="DEMOTION">Demotion (Disciplinary or Re-assignment)</option>
                      <option value="SUSPENSION">Suspension (Temporary Duty Cease)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      4. Execution Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkflowMode('DIRECT')}
                        className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          workflowMode === 'DIRECT'
                            ? 'bg-[#C51E28] border-red-600 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Direct Execution</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkflowMode('WORKFLOW')}
                        className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          workflowMode === 'WORKFLOW'
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submit for Sign-Off</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mandatory Reason Justification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <label htmlFor="role-change-reason">
                      5. Mandatory Reason &amp; Statutory Justification (§4.6)
                    </label>
                    <span className={`text-[10px] ${changeReason.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {changeReason.trim().length}/10 chars minimum
                    </span>
                  </div>
                  <textarea
                    id="role-change-reason"
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Enter official institutional reason (e.g. 'Assigned as Grade 7 Stream A Class Teacher following academic board allocation for 2026 Term 3.')..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-[#C51E28]"
                    required
                  />
                </div>

                {/* Live Permission Validation Feedback Box */}
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    permissionValidation.allowed
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                  }`}
                >
                  {permissionValidation.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold">
                      {permissionValidation.allowed
                        ? 'Authority Validated'
                        : 'Permission Validation Notice'}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {permissionValidation.reason}
                    </p>
                  </div>
                </div>

                {/* Submit / Execute Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-role-change-btn"
                    disabled={!targetUser || !permissionValidation.allowed || changeReason.trim().length < 10}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                      targetUser && permissionValidation.allowed && changeReason.trim().length >= 10
                        ? 'bg-[#C51E28] hover:bg-red-700 text-white shadow-red-900/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {workflowMode === 'WORKFLOW'
                        ? 'Submit for Authorized Approval'
                        : 'Sign & Execute Role Modification'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PENDING APPROVAL WORKFLOWS                        */}
          {/* ======================================================== */}
          {activeTab === 'pending' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Mandatory Role Change Approval Workflows (§4)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Requests initiated by authorized officers awaiting Head of Institution or Owner sign-off.
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-400">
                    No Pending Role Approval Workflows
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    All submitted institutional appointments and promotions have been processed or directly signed off.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => {
                    const rule = ROLE_ASSIGNMENT_RULES[req.proposedRole];
                    const isApproverAuthorized = rule?.authorizedApproverRoles.includes(
                      currentUser.role as any
                    );

                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-3 hover:border-slate-600 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {req.targetUserName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-slate-300">
                                {req.currentRole}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-950 text-red-300 border border-red-800">
                                {req.proposedRole}
                              </span>
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                {req.actionType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Initiated by <strong className="text-slate-200">{req.initiatorName}</strong> ({req.initiatorRole}) on{' '}
                              {new Date(req.createdAt).toLocaleDateString()} at{' '}
                              {new Date(req.createdAt).toLocaleTimeString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {req.status === 'PENDING_APPROVAL' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRejectRequest(req)}
                                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleApproveRequest(req)}
                                  disabled={!isApproverAuthorized}
                                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    isApproverAuthorized
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                  }`}
                                  title={
                                    isApproverAuthorized
                                      ? 'Sign and approve'
                                      : `Requires: ${rule?.authorizedApproverDescription}`
                                  }
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Sign &amp; Approve</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reason / Notes */}
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <strong className="text-slate-400 block text-[10px] uppercase font-mono">
                            Reason for Change:
                          </strong>
                          {req.reason}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Request ID: {req.id}</span>
                          <span>
                            Required Approver:{' '}
                            <strong className="text-amber-400">
                              {rule?.authorizedApproverDescription}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: IMMUTABLE ROLE AUDIT TRAIL (§5)                   */}
          {/* ======================================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      Immutable Role Change Audit Records
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Tamper-Evident SHA-256
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Under statutory policy, audit records shall not be editable or deletable by school users.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportAudit}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Audit</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search by personnel name, role, initiator, or reason..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C51E28]"
                  />
                </div>

                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-semibold focus:outline-none"
                >
                  <option value="ALL">All Action Types</option>
                  <option value="ASSIGNMENT">Assignments</option>
                  <option value="PROMOTION">Promotions</option>
                  <option value="TRANSFER">Transfers</option>
                  <option value="DEMOTION">Demotions</option>
                  <option value="ACTIVATION">Activations</option>
                  <option value="SUSPENSION">Suspensions</option>
                </select>
              </div>

              {/* Table of Audit Records */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-850 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">User Affected</th>
                      <th className="py-2.5 px-3">Role Transition</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Initiator &amp; Approver</th>
                      <th className="py-2.5 px-3">Reason / Justification</th>
                      <th className="py-2.5 px-3">Integrity Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-sans">
                    {filteredAuditRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          No audit records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-white">{rec.date}</div>
                            <div className="text-[10px] text-slate-500">{rec.time}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-white">{rec.affectedUserName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {rec.affectedUserId}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">
                                {rec.previousRole}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                                {rec.newRole}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {rec.actionType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="text-slate-300">
                              Init: <strong className="text-white">{rec.initiatorName}</strong>
                            </div>
                            <div className="text-[10px] text-emerald-400">
                              Appr: {rec.approverName} ({rec.approverRole})
                            </div>
                          </td>
                          <td className="py-2.5 px-3 min-w-[200px] max-w-xs truncate text-[11px] text-slate-300">
                            {rec.reason}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono text-[9px] text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[90px]" title={rec.recordHash}>
                                {rec.recordHash}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-500">
                              IP: {rec.ipAddress}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: STATUTORY ROLE ASSIGNMENT POLICY (§1–§8)          */}
          {/* ======================================================== */}
          {activeTab === 'policy' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    JJSAK Institutional Role Assignment and Role Change Policy
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Institutional governance framework defining statutory role integrity, assignment authority matrices, self-service prohibitions, and mandatory approval workflows.
                </p>
              </div>

              {/* Statutory Approver Matrix Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Role Assignment Authority Matrix</span>
                </h5>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-850 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Role Being Assigned / Changed</th>
                        <th className="py-2.5 px-4">Authorized Approver</th>
                        <th className="py-2.5 px-4">Approval Workflow Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/70">
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Teacher Roles</td>
                        <td className="py-3 px-4 text-emerald-300 font-semibold">
                          Head of Institution or School Administrator
                        </td>
                        <td className="py-3 px-4 text-slate-400">Direct Assignment or Registration</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Class Teacher Assignment</td>
                        <td className="py-3 px-4 text-emerald-300 font-semibold">
                          Head of Institution, Deputy Head, or Director of Academics
                        </td>
                        <td className="py-3 px-4 text-slate-400">Class Arm Allocation Authority</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Subject Teacher Assignment</td>
                        <td className="py-3 px-4 text-emerald-300 font-semibold">
                          Head of Institution, Deputy Head, or Director of Academics
                        </td>
                        <td className="py-3 px-4 text-slate-400">Curriculum Allocation Authority</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Deputy Head of Institution</td>
                        <td className="py-3 px-4 text-amber-300 font-semibold">
                          Head of Institution with required approval workflow
                        </td>
                        <td className="py-3 px-4 text-amber-400 font-bold">Two-Step Approval Workflow</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Director of Academics</td>
                        <td className="py-3 px-4 text-amber-300 font-semibold">
                          Head of Institution with required approval workflow
                        </td>
                        <td className="py-3 px-4 text-amber-400 font-bold">Two-Step Approval Workflow</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">School Administrator</td>
                        <td className="py-3 px-4 text-purple-300 font-semibold">
                          Owner / Super Administrator or authorized onboarding workflow
                        </td>
                        <td className="py-3 px-4 text-purple-400 font-bold">System Owner Onboarding</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Head of Institution</td>
                        <td className="py-3 px-4 text-purple-300 font-semibold">
                          Owner / Super Administrator only
                        </td>
                        <td className="py-3 px-4 text-purple-400 font-bold">Super Admin Exclusive</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Owner / Super Administrator</td>
                        <td className="py-3 px-4 text-red-400 font-bold">
                          System Owner governance process only
                        </td>
                        <td className="py-3 px-4 text-red-400 font-bold">Root Platform Governance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prohibited Actions Matrix */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Prohibited Self-Service Actions (Institutional Role Integrity Rule)</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Teacher → Class Teacher</strong>
                      <span className="text-slate-400 text-[11px]">
                        Teachers are strictly prohibited from changing their own role to Class Teacher.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Teacher → Deputy Head</strong>
                      <span className="text-slate-400 text-[11px]">
                        Teachers are strictly prohibited from elevating own role to Deputy Head.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Teacher → Head of Institution</strong>
                      <span className="text-slate-400 text-[11px]">
                        Teachers cannot change own role to Head of Institution.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Deputy Head → Head of Institution</strong>
                      <span className="text-slate-400 text-[11px]">
                        Deputy Head cannot elevate own role to Head of Institution.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Head → Owner / Super Administrator</strong>
                      <span className="text-slate-400 text-[11px]">
                        Head of Institution cannot elevate own role to Owner or Super Administrator.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/60 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 block">Self-Assigned Privileges</strong>
                      <span className="text-slate-400 text-[11px]">
                        Any user assigning themselves additional privileges or higher-level roles is blocked.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Approval Workflow Steps */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Mandatory Approval Workflow Steps (§4)</span>
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-700/70 text-xs space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <span>Be initiated by an authorized officer according to the governance hierarchy.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <span>Pass automated permission validation checks (self-service &amp; privilege elevation blocks).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <span>Be recorded in the immutable audit trail with cryptographic hash verification.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <span>Capture the previous role and new role permanently.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      5
                    </span>
                    <span>Record who officially approved the change and authorized the assignment.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      6
                    </span>
                    <span>Record date, time, reason, and affected institution name and code.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      7
                    </span>
                    <span>Notify affected users of the change through encrypted in-app dispatches.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: STAFF ROLE NOTIFICATIONS                         */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Official Role Assignment &amp; Security Notices
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dispatched notices regarding appointments, assignment updates, and security logs.
                  </p>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-400">
                    No Notifications Received
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    When an authorized officer updates your institutional role or assigns you to a class arm, official notices will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border space-y-2 transition ${
                        notif.read
                          ? 'bg-slate-850/60 border-slate-800 text-slate-300'
                          : 'bg-slate-800 border-[#C51E28]/60 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-red-400" />
                          <strong className="text-xs">{notif.title}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => {
                            institutionalRoleGovernanceService.markNotificationAsRead(
                              currentUser.id,
                              notif.id
                            );
                            refreshData();
                          }}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>JJSAK Central Governance Framework</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold transition cursor-pointer"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
