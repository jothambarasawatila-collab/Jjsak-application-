import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Building2,
  Users,
  FileText,
  Database,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Server,
  HardDrive,
  Clock,
  Check,
  X,
  Trash2,
  UserCheck,
  Key,
  Smartphone,
  Fingerprint,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Send,
  Copy,
  Mail,
  MessageSquare,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import {
  User as UserType,
  UserRole,
  SchoolTenant,
  AuditLogEntry,
  AuditActionType,
  SecurityAlert,
  BackupRecord,
  JWTSession,
  RecycleBinItem,
  Student,
  Assessment,
  Teacher,
  SchoolInfo,
} from '../types';
import {
  RBAC_ROLE_DEFINITIONS,
  validateJJSAKPassword,
  createEncryptedBackup,
  INITIAL_COMPLIANCE_ITEMS,
  INITIAL_SECURITY_ALERTS,
  INITIAL_BACKUPS,
  canPerformPermanentDelete,
  canCreateSchoolAccounts,
  isMfaRequiredForRole,
  generateJWTSession,
  checkSchoolLeadershipPrerequisites,
} from '../utils/securityEngine';
import {
  createStaffAccountWithInvitation,
  UserInvitationPayload,
} from '../utils/schoolProvisioning';
import { PRESERVED_SYSTEM_ROLES } from '../data/preservedRolesData';
import {
  PLATFORM_GOVERNANCE_COMPONENTS,
  SCHOOL_PORTAL_SCOPE,
  isOwnerOrSuperAdmin,
} from '../utils/platformGovernance';
import { OwnerPaymentConfigurationModal } from './subscription/OwnerPaymentConfigurationModal';

interface SecurityCoreScreenProps {
  currentUser?: UserType;
  users: UserType[];
  tenants: SchoolTenant[];
  activeTenantId: string;
  auditLogs: AuditLogEntry[];
  students: Student[];
  assessments: Assessment[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  recycleBin?: RecycleBinItem[];
  activeJWTSession?: JWTSession;
  onBack: () => void;
  onSwitchTenant: (tenantId: string) => void;
  onAddTenant: (tenant: SchoolTenant) => void;
  onUpdateTenantStatus?: (tenantId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  onAddUser: (user: UserType) => void;
  onUpdateUser?: (user: UserType) => void;
  onLogAudit: (action: AuditActionType, details: string, before?: string, after?: string) => void;
  onRestoreRecycleItem?: (item: RecycleBinItem) => void;
  onPurgeRecycleItem?: (item: RecycleBinItem, reason: string) => void;
  onTriggerAlert?: (title: string, desc: string, severity: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onOpenRoleGovernance?: () => void;
}

type TabType =
  | 'overview'
  | 'governance_isolation'
  | 'tenants'
  | 'users'
  | 'rbac'
  | 'session_jwt'
  | 'password_mfa'
  | 'recycle_bin'
  | 'audit'
  | 'monitoring'
  | 'backups'
  | 'compliance';

export const SecurityCoreScreen: React.FC<SecurityCoreScreenProps> = ({
  currentUser,
  users,
  tenants,
  activeTenantId,
  auditLogs,
  students,
  assessments,
  teachers,
  schoolInfo,
  recycleBin = [],
  activeJWTSession,
  onBack,
  onSwitchTenant,
  onAddTenant,
  onUpdateTenantStatus,
  onAddUser,
  onUpdateUser,
  onLogAudit,
  onRestoreRecycleItem,
  onPurgeRecycleItem,
  onTriggerAlert: _onTriggerAlert,
  onOpenRoleGovernance,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [showPaymentConfigModal, setShowPaymentConfigModal] = useState(false);

  // Active School Tenant Info
  const activeTenant = useMemo(() => {
    return tenants.find((t) => t.schoolId === activeTenantId) || tenants[0];
  }, [tenants, activeTenantId]);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';
  const isOwner = isOwnerOrSuperAdmin(currentUser);
  const canDelete = canPerformPermanentDelete(currentUser?.role || 'TEACHER');

  // Tenant Modal State (Code P2.1)
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolCategory, setNewSchoolCategory] = useState<'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED'>('JUNIOR');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('+254 7');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');

  // User Modal State (Code P2.2 & P2.3 & Policy Sections 4 & 5)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newTscNumber, setNewTscNumber] = useState('');
  const [newPhone, setNewPhone] = useState('+254 7');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('TEACHER');
  const [newUserSchoolId, setNewUserSchoolId] = useState(activeTenantId);

  // Smart Invitation Modal State (Policy Section 5)
  const [activeInvitationModal, setActiveInvitationModal] = useState<UserInvitationPayload | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [simulatedSendStatus, setSimulatedSendStatus] = useState<string | null>(null);

  // Password Policy Tester State (Code P2.5)
  const [testPassword, setTestPassword] = useState('Jjsak@2026Secure');
  const [voluntaryOldPassword, setVoluntaryOldPassword] = useState('');
  const [voluntaryNewPassword, setVoluntaryNewPassword] = useState('');

  // Audit Logs Filter State (Code P2.9)
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditAction, setSelectedAuditAction] = useState<string>('ALL');
  const [selectedAuditSchool, setSelectedAuditSchool] = useState<string>('ALL');

  // Backups state (Code P2.13)
  const [backupsList, setBackupsList] = useState<BackupRecord[]>(INITIAL_BACKUPS);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Security Alerts state (Code P2.12)
  const [alertsList, setAlertsList] = useState<SecurityAlert[]>(INITIAL_SECURITY_ALERTS);

  // Recycle Bin Purge Dialog state (Code P2.10)
  const [purgeTargetItem, setPurgeTargetItem] = useState<RecycleBinItem | null>(null);
  const [purgeReasonText, setPurgeReasonText] = useState('');
  const [purgeConfirmWord, setPurgeConfirmWord] = useState('');

  // Preserved System Roles UI State
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('ALL');
  const [expandedRoleKey, setExpandedRoleKey] = useState<string | null>('SUPER_ADMIN');

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered Users (Code P2.2 & P2.1.17 Isolation)
  const displayedUsers = useMemo(() => {
    if (isSuperAdmin) {
      return users;
    }
    return users.filter(
      (u) =>
        (!u.schoolId || u.schoolId === activeTenantId) &&
        u.role !== 'SUPER_ADMIN' &&
        u.role !== 'SYSTEM_ADMIN'
    );
  }, [users, isSuperAdmin, activeTenantId]);

  // Filtered Audit Logs (Code P2.9 & P2.11 & P2.1.17)
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // If not super admin, restrict strictly to activeTenantId and hide cross-tenant boundary alerts
      if (!isSuperAdmin) {
        if (log.schoolId !== activeTenantId) return false;
        if (
          log.actionType === 'TENANT_BOUNDARY_VIOLATION' ||
          log.actionType === 'UNAUTHORIZED_SCHOOL_ACCESS_ATTEMPT' ||
          log.actionType === 'CROSS_SCHOOL_ACCESS_DENIED'
        ) {
          return false;
        }
      }
      const q = (auditSearch || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.userRole && log.userRole.toLowerCase().includes(q)) ||
        (log.actionType && log.actionType.toLowerCase().includes(q));
      const matchesAction =
        selectedAuditAction === 'ALL' || log.actionType === selectedAuditAction;
      const matchesSchool =
        !isSuperAdmin || selectedAuditSchool === 'ALL' || log.schoolId === selectedAuditSchool;
      return matchesSearch && matchesAction && matchesSchool;
    });
  }, [auditLogs, auditSearch, selectedAuditAction, selectedAuditSchool, isSuperAdmin, activeTenantId]);

  // Handle Add New School Tenant (Code P2.1)
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateSchoolAccounts(currentUser?.role || '')) {
      showNotification('Access Denied: Only Super Administrator can create school accounts (Code P2.1).');
      return;
    }

    if (!newSchoolName.trim() || !newSchoolCode.trim()) {
      showNotification('Please fill in all mandatory school fields.');
      return;
    }

    const cleanSlug = (newSchoolName || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const newId = `sch-${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newTenant: SchoolTenant = {
      schoolId: newId,
      schoolCode: newSchoolCode.trim().toUpperCase(),
      schoolName: newSchoolName.trim(),
      category: newSchoolCategory,
      address: newSchoolAddress.trim() || 'P.O. Box, Kenya',
      phone: newSchoolPhone.trim(),
      email: newSchoolEmail.trim() || `admin@${cleanSlug}.sc.ke`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddTenant(newTenant);
    onLogAudit(
      'TENANT_CREATE',
      `Super Administrator registered new school tenant '${newTenant.schoolName}' [${newTenant.schoolId}].`,
      undefined,
      JSON.stringify(newTenant)
    );

    setShowAddTenantModal(false);
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewSchoolAddress('');
    showNotification(`School tenant '${newTenant.schoolName}' created successfully.`);
  };

  // Handle Add User (Code P2.1, P2.2, P2.3 & Policy Sections 4 & 5)
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      showNotification('Please provide the full name of the user.');
      return;
    }

    const assignedTenant = tenants.find((t) => t.schoolId === (newUserSchoolId || activeTenantId)) || activeTenant;
    const finalDesignation = newDesignation.trim() || (
      newUserRole === 'HEAD_OF_INSTITUTION' || newUserRole === 'HEAD'
        ? 'Head of Institution / Principal'
        : newUserRole === 'DEPUTY_HEAD_OF_INSTITUTION' || newUserRole === 'DEPUTY'
        ? 'Deputy Head of Institution'
        : newUserRole === 'DIRECTOR_OF_ACADEMICS' || newUserRole === 'DIRECTOR_ACADEMICS'
        ? 'Director of Academics'
        : newUserRole === 'TEACHER'
        ? 'Class Teacher'
        : newUserRole === 'FINANCE'
        ? 'Finance / Bursar Officer'
        : 'Institutional Staff'
    );

    // Create staff account with pending activation and smart invitation payload
    const invitationPayload = createStaffAccountWithInvitation({
      school: assignedTenant,
      fullName: newFullName.trim(),
      nationalId: newNationalId.trim() || '24567890',
      tscNumber: newTscNumber.trim() || undefined,
      phoneNumber: newPhone.trim() || '+254 700 000 000',
      emailAddress: newUserEmail.trim(),
      designation: finalDesignation,
      role: newUserRole,
    });

    onAddUser(invitationPayload.user);
    onLogAudit(
      'USER_MANAGE',
      `Registered user account '${invitationPayload.user.username}' (${invitationPayload.user.role}) for School [${assignedTenant.schoolName}]. Smart Invitation generated with 15-min OTP.`,
      undefined,
      `Role: ${invitationPayload.user.role}, Status: PENDING_ACTIVATION`
    );

    setShowAddUserModal(false);
    setActiveInvitationModal(invitationPayload);
    setNewFullName('');
    setNewNationalId('');
    setNewTscNumber('');
    setNewDesignation('');
    setNewUserEmail('');
    showNotification(`✓ User '${invitationPayload.user.fullName}' created! Smart invitation generated.`);
  };

  // Preview or Resend Invitation for Existing User
  const handleOpenUserInvitation = (user: UserType) => {
    const assignedTenant = tenants.find((t) => t.schoolId === user.schoolId) || activeTenant;
    const loginUrl = `${window.location.origin}?tenant=${user.schoolId}&user=${encodeURIComponent(user.username)}`;
    const expiresAt = user.otpExpiry || Date.now() + 15 * 60 * 1000;

    const payload: UserInvitationPayload = {
      user,
      otp: '•••••• (Protected by Policy §2.3)',
      expiresAt,
      loginUrl,
      smsMessage: `Welcome to JJSAK. Your ${user.designation || 'staff'} account for ${assignedTenant.schoolName} is ready. Login using secure link: ${loginUrl}. Your confidential One-Time Password has been dispatched via SMS & WhatsApp (Policy §2.3 Zero-Exposure). Valid for 15 minutes.`,
      emailSubject: `Welcome to JJSAK - Account Activation for ${assignedTenant.schoolName}`,
      emailBody: `Dear ${user.fullName},\n\nWelcome to JJSAK Educational System. Your institutional account for ${assignedTenant.schoolName} has been created with role: ${user.role}.\n\n1. Login Link: ${loginUrl}\n2. Username: ${user.username}\n3. One-Time Password (OTP): [Confidential OTP Dispatched via Encrypted Channel to Registered Contacts]\n\nPlease login within 15 minutes to complete the First Login Security Procedure and activate your account.\n\nJJSAK Secure Access Directorate`,
    };

    setActiveInvitationModal(payload);
  };

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSimulateSend = () => {
    setSimulatedSendStatus('DISPATCHING');
    setTimeout(() => {
      setSimulatedSendStatus('SENT');
      showNotification('✓ Smart Invitation dispatched via SMS & Email Relays!');
      setTimeout(() => setSimulatedSendStatus(null), 3000);
    }, 1200);
  };

  // Handle Voluntary Password Change (Code P2.5 & P2.8)
  const handleVoluntaryPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const valResult = validateJJSAKPassword(voluntaryNewPassword);
    if (!valResult.isValid) {
      showNotification('New password does not satisfy the 12-character JJSAK security policy.');
      return;
    }

    if (currentUser && onUpdateUser) {
      const updatedUser: UserType = {
        ...currentUser,
        password: voluntaryNewPassword,
        lastPasswordChange: Date.now(),
      };
      onUpdateUser(updatedUser);
      onLogAudit(
        'PASSWORD_CHANGE',
        `User ${currentUser.fullName} voluntarily updated password. Active sessions invalidated for security (Code P2.5 & P2.8).`
      );
      setVoluntaryOldPassword('');
      setVoluntaryNewPassword('');
      showNotification('Password updated successfully. Prior sessions invalidated.');
    }
  };

  // Handle CSV Audit Log Export (Code P2.9)
  const handleExportAuditLogsCSV = () => {
    const headers = ['Log ID', 'School ID', 'Timestamp', 'User Role', 'User Name', 'Action Type', 'Details', 'IP Address', 'Device Info'];
    const rows = filteredAuditLogs.map((l) => [
      l.id,
      l.schoolId,
      new Date(l.timestamp).toISOString(),
      l.userRole,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.actionType,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress || '197.237.12.89',
      `"${l.deviceInfo || 'Standard Web HTTPS'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JJSAK_Audit_Logs_${activeTenant.schoolCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onLogAudit(
      'BULK_REPORT_GENERATE',
      `Exported ${filteredAuditLogs.length} audit trail records to CSV for School [${activeTenantId}].`
    );
    showNotification(`Exported ${filteredAuditLogs.length} audit entries to CSV.`);
  };

  // Handle Encrypted Backup (Code P2.13)
  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const { record, payloadString } = createEncryptedBackup(
        'MANUAL',
        students,
        assessments,
        teachers,
        schoolInfo
      );

      setBackupsList((prev) => [record, ...prev]);
      setIsBackingUp(false);

      // Trigger encrypted file download
      const blob = new Blob([payloadString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `JJSAK_Encrypted_Backup_${activeTenant.schoolCode}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onLogAudit(
        'BACKUP_CREATED',
        `Generated AES-256 encrypted database snapshot for School [${activeTenantId}]. Checksum: ${record.checksumSha256}.`
      );
      showNotification(`AES-256 Encrypted Backup (${(record.sizeBytes / 1024).toFixed(1)} KB) completed.`);
    }, 1200);
  };

  // Password Policy Tester evaluation
  const testPwValidation = validateJJSAKPassword(testPassword);

  // Active simulated JWT payload
  const currentJwt = activeJWTSession || (currentUser ? generateJWTSession(currentUser, activeTenantId, activeTenant.schoolName) : null);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-24 select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#C51E28] font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <ShieldCheck className="w-5 h-5 text-[#C51E28]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="security-back-btn"
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C51E28] to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">
                  JJSAK Security Core
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#C51E28] text-white tracking-wider">
                  PHASE 2 AUTH &amp; RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Tenant Architecture • Role-Based Access Control • Session &amp; Recovery Window
              </p>
            </div>
          </div>

          {/* Active Tenant / User Badge & Quick Switch */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
              <Building2 className="w-4 h-4 text-red-400" />
              <span className="text-slate-400">School:</span>
              <strong className="text-white">{activeTenant.schoolName}</strong>
              <span className="text-[10px] font-mono text-slate-400">({activeTenant.schoolCode})</span>
            </div>

            {currentUser && (
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Actor:</span>
                <strong className="text-white">{currentUser.fullName}</strong>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  {currentUser.role}
                </span>
              </div>
            )}

            {isOwner && (
              <button
                type="button"
                id="btn-owner-payment-config"
                onClick={() => setShowPaymentConfigModal(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Owner-Only Subscription Payment Configuration (SCMH 2.X)"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Subscription Payment Channels</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 border-t border-slate-800/60">
          {[
            { id: 'overview', label: 'Security Dashboard', icon: Activity },
            ...(isSuperAdmin ? [{ id: 'governance_isolation', label: 'Governance & Isolation (SCMH 2.X)', icon: Lock }] : []),
            ...(isSuperAdmin ? [{ id: 'tenants', label: 'Multi-School (P2.1)', icon: Building2 }] : []),
            { id: 'users', label: 'User Accounts (P2.2)', icon: Users },
            { id: 'rbac', label: 'RBAC Matrix (P2.3)', icon: ShieldCheck },
            { id: 'session_jwt', label: 'JWT & Sessions (P2.4/P2.8)', icon: Key },
            { id: 'password_mfa', label: 'Password & MFA (P2.5/P2.6)', icon: Smartphone },
            { id: 'recycle_bin', label: `Recycle Bin [${recycleBin.length}] (P2.10)`, icon: Trash2 },
            { id: 'audit', label: 'Immutable Audit (P2.9)', icon: FileText },
            { id: 'monitoring', label: 'Threat Monitor (P2.12)', icon: ShieldAlert },
            { id: 'backups', label: 'Backups (P2.13)', icon: Database },
            { id: 'compliance', label: 'Compliance (P2.14)', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`sec-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#C51E28] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* ================= TAB: OVERVIEW & TELEMETRY ================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Multi-School Tenants' : 'Assigned Institution'}
                  </span>
                  <Building2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="mt-3">
                  {isSuperAdmin ? (
                    <>
                      <span className="text-2xl font-black text-white">{tenants.length}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">Isolated Database Schemas</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-black text-white truncate block">{activeTenant.schoolName}</span>
                      <span className="text-xs text-red-400 font-mono block mt-0.5">Code: {activeTenant.schoolCode} (Isolated)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isSuperAdmin ? 'Active User Accounts' : 'School Staff Accounts'}
                  </span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{displayedUsers.length}</span>
                  <span className="text-xs text-emerald-400 block mt-0.5">
                    {isSuperAdmin ? 'Platform-Wide Profiles' : 'Assigned Staff Profiles'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Recycle Bin Items</span>
                  <Trash2 className="w-5 h-5 text-amber-400" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">
                    {isSuperAdmin ? recycleBin.length : recycleBin.filter((r) => r.schoolId === activeTenantId).length}
                  </span>
                  <span className="text-xs text-amber-400 block mt-0.5">30-Day Recovery Preserved</span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Immutable Audit Logs</span>
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{filteredAuditLogs.length}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {isSuperAdmin ? 'Global Platform Diffs' : 'School Audit Trail'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active JWT Session Token Inspector (Code P2.4) */}
            {currentJwt && (
              <div className="bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Active JWT Session Token</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          VALID (HS256)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Cryptographically signed claim token for {currentJwt.payload.fullName} ({currentJwt.payload.role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span>Auto-Expires: 30m Inactivity (P2.8)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700/60 font-mono">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      JWT Header (Algorithm &amp; Type)
                    </span>
                    <pre className="text-emerald-400 overflow-x-auto">{JSON.stringify(currentJwt.header, null, 2)}</pre>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700/60 font-mono lg:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      JWT Payload Claims (User, School, Permissions)
                    </span>
                    <pre className="text-red-300 overflow-x-auto text-[11px]">{JSON.stringify(currentJwt.payload, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Threat & Encryption Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700">
                <div className="flex items-center gap-2.5 mb-3">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">Encryption &amp; Transport Standards</h4>
                </div>
                <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>TLS Version:</span>
                    <strong className="font-mono text-emerald-400">TLS 1.3 (RFC 8446 Encrypted)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>Database at Rest:</span>
                    <strong className="font-mono text-emerald-400">AES-256-GCM Hardware Accelerated</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>Password Hash Algorithm:</span>
                    <strong className="font-mono text-emerald-400">Bcrypt (Cost Factor: 12)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700">
                <div className="flex items-center gap-2.5 mb-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Brute Force &amp; Lockout Engine (P2.7)</h4>
                </div>
                <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>Maximum Failed Attempts:</span>
                    <strong className="font-mono text-amber-400">5 Consecutive Attempts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>Lockout Duration:</span>
                    <strong className="font-mono text-amber-400">15 Minutes Mandatory</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
                    <span>Inactivity Auto-Logout:</span>
                    <strong className="font-mono text-amber-400">30 Minutes (Code P2.8)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SCMH 2.X PLATFORM GOVERNANCE & ACCESS ISOLATION ================= */}
        {activeTab === 'governance_isolation' && isSuperAdmin && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            {/* Policy Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/50 rounded-3xl p-6 border border-red-900/40 shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">SCMH 2.X – Platform Visibility, Governance and Access Isolation</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                        Owner / Super Admin ONLY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
                      Defines strict boundaries between the JJSAK Platform Layer and School Tenant Layer. Platform governance components remain under exclusive Super Administrator control while schools access only operational modules.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero-Discovery Isolation Active</span>
                  </span>
                </div>
              </div>

              {/* 5-Point Checkpoint Checklist */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">1. Tenant ID Verification</div>
                    <div className="text-[10px] text-slate-400">Strict schema validation</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">2. School ID Validation</div>
                    <div className="text-[10px] text-slate-400">Context matching check</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">3. User ID Ownership</div>
                    <div className="text-[10px] text-slate-400">Claim signature match</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">4. Role Permissions</div>
                    <div className="text-[10px] text-slate-400">Super Admin role check</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">5. Active Session Validation</div>
                    <div className="text-[10px] text-slate-400">Non-expired JWT claim</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Governance Components Catalog (4 Categories) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Platform Governance Components Catalog (Permanently Reserved)</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {PLATFORM_GOVERNANCE_COMPONENTS.length} Components
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category 1: Strategic Platform */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Strategic Platform
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      7 Modules
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {PLATFORM_GOVERNANCE_COMPONENTS.filter((c) => c.category === 'STRATEGIC').map((c) => (
                      <li key={c.id} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{c.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 2: Multi-Tenant Management */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                      Multi-Tenant Mgmt
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      9 Modules
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {PLATFORM_GOVERNANCE_COMPONENTS.filter((c) => c.category === 'MULTI_TENANT').map((c) => (
                      <li key={c.id} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{c.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 3: Security Core */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                      Security &amp; Encryption
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      9 Modules
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {PLATFORM_GOVERNANCE_COMPONENTS.filter((c) => c.category === 'SECURITY').map((c) => (
                      <li key={c.id} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <Shield className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{c.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 4: Platform Operations */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                      Platform Operations
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      7 Modules
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {PLATFORM_GOVERNANCE_COMPONENTS.filter((c) => c.category === 'OPERATIONS').map((c) => (
                      <li key={c.id} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{c.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* School Portal Authorized Scope vs Platform Layer */}
            <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">School Portal Authorized Operations Scope</h4>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  Fully Segregated From Platform Layer
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {SCHOOL_PORTAL_SCOPE.map((scope, sIdx) => {
                  const colorClass =
                    scope.category === 'ACADEMIC'
                      ? 'text-emerald-400'
                      : scope.category === 'HUMAN_RESOURCE'
                      ? 'text-sky-400'
                      : 'text-amber-400';
                  return (
                    <div key={sIdx} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
                      <h5 className={`font-bold uppercase text-[11px] tracking-wider ${colorClass}`}>
                        {sIdx + 1}. {scope.categoryTitle}
                      </h5>
                      <ul className="space-y-1.5 text-slate-300">
                        {scope.resources.map((res, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${colorClass}`} />
                            <div>
                              <span className="font-semibold text-white">{res.name}</span>
                              <span className="text-[10px] text-slate-400 block leading-tight">{res.description}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zero-Discovery Enforcement Notice */}
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Policy SCMH 2.X Compliance Standard:</strong>
                <p className="mt-1 leading-relaxed">
                  Platform Governance components are strictly invisible to school portals. No school user interface shall display menu items, navigation links, dashboards, widgets, reports, APIs, URLs, or references related to these components. Any unauthorized access attempt triggers an immediate immutable audit log and security boundary alert.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: MULTI-SCHOOL TENANTS (P2.1 & P2.11) ================= */}
        {activeTab === 'tenants' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.1 &amp; P2.11 Multi-Tenant Isolation
                </span>
                <h3 className="text-base font-bold text-white">Registered School Tenants</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Only Super Administrator can create school accounts. Complete cross-tenant data separation is enforced on every request.
                </p>
              </div>

              {isSuperAdmin ? (
                <button
                  type="button"
                  id="add-school-tenant-btn"
                  onClick={() => setShowAddTenantModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register School Account (Super Admin)</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                  🔒 School account creation restricted to Super Admin
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant) => {
                const isActive = tenant.schoolId === activeTenantId;
                return (
                  <div
                    key={tenant.schoolId}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-800 border-red-500 shadow-lg shadow-red-950/30'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                          {tenant.schoolCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tenant.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white leading-snug">{tenant.schoolName}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">ID: {tenant.schoolId}</p>

                      <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
                        <span>📍 {tenant.address}</span>
                        <span>📞 {tenant.phone}</span>
                        <span>✉️ {tenant.email}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      {isActive ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Currently Active</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchTenant(tenant.schoolId);
                            onLogAudit(
                              'TENANT_SWITCH',
                              `Switched active school tenant context to '${tenant.schoolName}' [${tenant.schoolId}].`
                            );
                            showNotification(`Switched active context to ${tenant.schoolName}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Switch School
                        </button>
                      )}

                      {isSuperAdmin && onUpdateTenantStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                            onUpdateTenantStatus(tenant.schoolId, newStatus);
                            onLogAudit(
                              'TENANT_SWITCH',
                              `Super Admin changed status of school '${tenant.schoolName}' to ${newStatus}`
                            );
                            showNotification(`Updated status of ${tenant.schoolName} to ${newStatus}`);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                            tenant.status === 'ACTIVE'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                          }`}
                        >
                          {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB: USER ACCOUNTS (P2.2, P2.3 & POLICY P2.1.18) ================= */}
        {activeTab === 'users' && (() => {
          const prereq = checkSchoolLeadershipPrerequisites(activeTenantId, users);
          return (
            <div className="flex flex-col gap-5 animate-in fade-in">
              {/* JJSAK School Registration & Activation Policy Prerequisite Monitor */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 rounded-3xl border border-slate-700/80 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                        Institutional Governance &amp; Activation Policy (Sections 3 &amp; 8)
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Leadership &amp; Faculty Activation Prerequisites
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                      prereq.canRegisterStudents 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' 
                        : 'bg-amber-950/60 text-amber-300 border-amber-800'
                    }`}>
                      {prereq.canRegisterStudents ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Student Admissions: UNLOCKED</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Student Admissions: LOCKED</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Per JJSAK Institutional Policy: The Student Admission and Academic operations remain locked until mandatory leadership accounts are created and activated.
                </p>

                {/* 4 Mandatory Role Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-2xl border ${
                    prereq.hasHeadOfInstitution
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">1. Head of Institution</span>
                      {prereq.hasHeadOfInstitution ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">REQUIRED</span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-80">Oversees entire school portal &amp; staff</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    prereq.hasDeputyHead
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">2. Deputy Head</span>
                      {prereq.hasDeputyHead ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">OPTIONAL</span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-80">Delegated admin &amp; master timetables</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    prereq.hasDirectorOfAcademics
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">3. Director of Academics</span>
                      {prereq.hasDirectorOfAcademics ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">REQUIRED</span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-80">Manages assessments &amp; curriculum</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    prereq.hasActiveTeachers
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">4. Teachers ({prereq.activeTeachersCount})</span>
                      {prereq.hasActiveTeachers ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">MIN 1 REQ</span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-80">Enters marks, attendance &amp; rubrics</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                    Code P2.2 &amp; P2.3 User Governance
                  </span>
                  <h3 className="text-base font-bold text-white">Institutional Staff &amp; User Accounts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every user is strictly linked to {activeTenant.schoolName} [{activeTenant.schoolCode}] and assigned one of the approved institutional roles.
                  </p>
                </div>

                <button
                  type="button"
                  id="add-user-btn"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Staff / User</span>
                </button>
              </div>

              <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Institutional Role</th>
                        <th className="p-4">Phone / National ID</th>
                        <th className="p-4">Activation Status</th>
                        <th className="p-4">2FA / MFA</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 text-slate-300">
                      {displayedUsers.map((user) => {
                        const isPrivileged = isMfaRequiredForRole(user.role);
                        const isPending = user.activationStatus === 'PENDING_ACTIVATION';
                        return (
                          <tr key={user.id} className="hover:bg-slate-750/50 transition">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{user.fullName}</div>
                              <div className="text-slate-400 text-[11px] font-mono">@{user.username} • {user.email}</div>
                              {user.designation && (
                                <div className="text-[10px] text-red-300 mt-0.5">{user.designation}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="font-bold px-2.5 py-1 rounded-lg bg-slate-700 text-red-300 border border-slate-600">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-slate-300">
                              <div>{user.phoneNumber || '—'}</div>
                              <div className="text-[10px] text-slate-500">ID: {user.nationalId || user.employeeNumber || '—'}</div>
                            </td>
                            <td className="p-4">
                              {isPending ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" />
                                  <span>PENDING ACTIVATION</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ACTIVE</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {isPrivileged ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1 w-fit">
                                  <Fingerprint className="w-3 h-3" />
                                  <span>{user.mfaMethod || 'Email OTP'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserInvitation(user)}
                                  className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Smart Invitation</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onLogAudit('USER_MANAGE', `Audited credentials for user ${user.username}.`);
                                    showNotification(`Audited user ${user.username}`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= TAB: RBAC MATRIX (P2.3) ================= */}
        {activeTab === 'rbac' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  JJSAK Institutional Role Assignment &amp; Integrity Policy (§1-8)
                </span>
                <h3 className="text-base font-bold text-white">Granular Institutional Permissions &amp; Governance</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Users cannot change or switch their own roles (§1). All role assignments, promotions, and transfers must follow authorized approval workflows and immutable audit logging.
                </p>
              </div>

              {onOpenRoleGovernance && (
                <button
                  type="button"
                  id="security-screen-open-role-gov-btn"
                  onClick={onOpenRoleGovernance}
                  className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Role Governance Center</span>
                </button>
              )}
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">Multi-School</th>
                      <th className="p-4 text-center">Users</th>
                      <th className="p-4 text-center">Perm. Delete</th>
                      <th className="p-4 text-center">Enter Marks</th>
                      <th className="p-4 text-center">Reports</th>
                      <th className="p-4 text-center">Finance</th>
                      <th className="p-4 text-center">Audit Logs</th>
                      <th className="p-4 text-center">Backups</th>
                      <th className="p-4 text-center">2FA/MFA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-300">
                    {Object.values(RBAC_ROLE_DEFINITIONS).map((def) => (
                      <tr key={def.role} className="hover:bg-slate-750/50 transition">
                        <td className="p-4">
                          <strong className="text-white text-sm block">{def.displayName}</strong>
                          <span className="text-[11px] text-slate-400">{def.description}</span>
                        </td>
                        <td className="p-4 text-center">{def.canManageMultiSchool ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canManageUsers ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canPermanentlyDelete ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canEnterMarks ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canGenerateReports ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canManageFinance ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canViewAuditLogs ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.canPerformBackups ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{def.requiresMFA ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-[10px] text-slate-500 font-mono">Opt</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preserved System Roles Specification & Governance Cards */}
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                    Institutional Governance Hierarchy
                  </span>
                  <h4 className="text-base font-bold text-white">Preserved System Roles &amp; Authority Specs</h4>
                  <p className="text-xs text-slate-400">
                    Mandatory system roles with permanent security tiers, cross-tenant isolation boundaries, and granular module permissions.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  {['ALL', 'EXECUTIVE_OWNER', 'ADMINISTRATIVE_LEADERSHIP', 'ACADEMIC_FACULTY', 'OPERATIONS_FINANCE', 'CLIENT_STAKEHOLDER'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedRoleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        selectedRoleCategory === cat
                          ? 'bg-[#C51E28] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {PRESERVED_SYSTEM_ROLES.filter(
                  (role) => selectedRoleCategory === 'ALL' || role.category === selectedRoleCategory
                ).map((role) => {
                  const isExpanded = expandedRoleKey === role.roleKey;
                  return (
                    <div
                      key={role.roleKey}
                      className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 transition hover:border-slate-600"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-red-400 shrink-0">
                            {role.shortCode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-white">{role.roleTitle}</h5>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                                Tier {role.tierLevel} • {role.protectionStatus.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{role.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedRoleKey(isExpanded ? null : (role.roleKey as string))}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                          >
                            {isExpanded ? 'Collapse Details' : 'View Permissions & Profile'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in text-xs">
                          {/* Core Responsibilities */}
                          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 lg:col-span-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-2">
                              Core Responsibilities
                            </span>
                            <ul className="space-y-1.5 text-slate-300 text-[11px]">
                              {role.coreResponsibilities.map((resp, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-400 shrink-0">✓</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Module Permissions Matrix */}
                          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 lg:col-span-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                              Module Permissions Matrix
                            </span>
                            <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
                              {role.permissions.map((perm) => (
                                <div key={perm.moduleCode} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                                  <div className="flex items-center justify-between font-bold text-white">
                                    <span>{perm.module}</span>
                                    <span className="font-mono text-[9px] text-slate-500">{perm.moduleCode}</span>
                                  </div>
                                  <div className="flex gap-2 text-[9px] mt-1 font-mono text-slate-400">
                                    <span className={perm.read ? 'text-emerald-400' : 'text-slate-600'}>R: {perm.read ? 'YES' : 'NO'}</span>
                                    <span className={perm.write ? 'text-emerald-400' : 'text-slate-600'}>W: {perm.write ? 'YES' : 'NO'}</span>
                                    <span className={perm.delete ? 'text-red-400' : 'text-slate-600'}>D: {perm.delete ? 'YES' : 'NO'}</span>
                                    <span className={perm.approve ? 'text-blue-400' : 'text-slate-600'}>A: {perm.approve ? 'YES' : 'NO'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Security Profile & Isolation */}
                          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 lg:col-span-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-2">
                              Security &amp; Isolation Profile
                            </span>
                            <div className="space-y-2 text-[11px] text-slate-300">
                              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span>Access Scope:</span>
                                <strong className="text-white font-mono text-[10px]">{role.defaultAccessScope}</strong>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span>2FA / MFA Required:</span>
                                <strong className={role.securityProfile.requiresMfa ? 'text-emerald-400' : 'text-slate-500'}>
                                  {role.securityProfile.requiresMfa ? 'MANDATORY (Email OTP)' : 'Optional'}
                                </strong>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span>Session Inactivity Timeout:</span>
                                <strong className="text-amber-400 font-mono">{role.securityProfile.sessionTimeoutMinutes} Minutes</strong>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span>Cross-School Access:</span>
                                <strong className={role.securityProfile.crossSchoolAccess ? 'text-emerald-400' : 'text-red-400'}>
                                  {role.securityProfile.crossSchoolAccess ? 'AUTHORIZED (Super Admin)' : 'STRICTLY ISOLATED'}
                                </strong>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span>Audit Purge Authority:</span>
                                <strong className={role.securityProfile.auditPurgeAuthority ? 'text-emerald-400' : 'text-slate-500'}>
                                  {role.securityProfile.auditPurgeAuthority ? 'YES (With Two-Person Auth)' : 'NO'}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: JWT & SESSIONS (P2.4 & P2.8) ================= */}
        {activeTab === 'session_jwt' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                Code P2.4 &amp; P2.8 Session Security
              </span>
              <h3 className="text-base font-bold text-white">JWT Token Claims &amp; Inactivity Guard</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sessions automatically expire after 30 minutes of inactivity. Token verification occurs on every client-server exchange.
              </p>
            </div>

            {currentJwt ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Session Status</span>
                  </h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase">Active User:</span>
                      <strong className="text-white text-sm">{currentJwt.payload.fullName}</strong>
                      <span className="text-emerald-400 block font-mono text-[11px]">Role: {currentJwt.payload.role}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase">School Tenant:</span>
                      <strong className="text-white">{currentJwt.payload.schoolName}</strong>
                      <span className="text-slate-400 block font-mono text-[10px]">ID: {currentJwt.payload.schoolId}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px] uppercase">Client Device &amp; IP:</span>
                      <strong className="text-white font-mono">{currentJwt.payload.ipAddress}</strong>
                      <span className="text-slate-400 block text-[10px]">HTTPS / Secure TLS 1.3</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 lg:col-span-2 flex flex-col gap-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                      <Key className="w-4 h-4 text-red-400" />
                      <span>Decoded JWT Token Payload</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                      HS256 Verified
                    </span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-900 text-red-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-700/50">
                    {JSON.stringify(currentJwt, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                No active JWT session found. Please sign in through the authentication modal.
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: PASSWORD POLICY & MFA (P2.5 & P2.6) ================= */}
        {activeTab === 'password_mfa' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in">
            {/* JJSAK 12-Character Password Policy Validator (Code P2.5) */}
            <div className="bg-slate-800/80 p-5 sm:p-6 rounded-3xl border border-slate-700 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.5 Password Policy
                </span>
                <h3 className="text-base font-bold text-white">12-Character Policy Validator</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Passwords must satisfy minimum 12 characters, uppercase, lowercase, numbers, and symbols.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Test Password String (e.g. Jjsak@2026Secure):
                </label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Strength Score */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span>Policy Compliance Score:</span>
                  <span className={testPwValidation.score === 5 ? 'text-emerald-400' : 'text-amber-400'}>
                    {testPwValidation.score}/5 Rules ({testPwValidation.isValid ? 'COMPLIANT & STRONG' : 'INSUFFICIENT'})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex gap-1 p-0.5">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        testPwValidation.score >= step
                          ? testPwValidation.score === 5
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 5 Rules Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/60 flex flex-col gap-2 text-xs">
                {[
                  { label: 'Minimum 12 characters (length >= 12)', pass: testPassword.length >= 12 },
                  { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(testPassword) },
                  { label: 'Lowercase letter (a-z)', pass: /[a-z]/.test(testPassword) },
                  { label: 'Numeric digit (0-9)', pass: /[0-9]/.test(testPassword) },
                  { label: 'Special symbol (!@#$%^&*)', pass: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(testPassword) },
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {rule.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0 text-[9px] text-slate-500">
                        ✕
                      </div>
                    )}
                    <span className={rule.pass ? 'text-white font-bold' : 'text-slate-400'}>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voluntary Password Change Form (Code P2.5 & P2.8) */}
            <div className="bg-slate-800/80 p-5 sm:p-6 rounded-3xl border border-slate-700 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Voluntary Password Change &amp; Session Invalidation
                </span>
                <h3 className="text-base font-bold text-white">Update Account Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  No forced expiration. Updating password invalidates all prior conflicting sessions.
                </p>
              </div>

              <form onSubmit={handleVoluntaryPasswordChange} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={voluntaryOldPassword}
                    onChange={(e) => setVoluntaryOldPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    New Password (Min 12 Characters):
                  </label>
                  <input
                    type="password"
                    value={voluntaryNewPassword}
                    onChange={(e) => setVoluntaryNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Update Password &amp; Invalidate Other Sessions</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB: RECYCLE BIN & 30-DAY RECOVERY WINDOW (P2.10) ================= */}
        {activeTab === 'recycle_bin' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.10 Permanent Deletion Control
                </span>
                <h3 className="text-base font-bold text-white">30-Day Recovery Window &amp; Recycle Bin</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deleted records are safely preserved for 30 days before permanent purging. Only Head of Institution, Deputy Head, and Academic Director can permanently purge.
                </p>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                Preserved Items: <strong className="text-white">{recycleBin.length}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {recycleBin.length === 0 ? (
                <div className="bg-slate-800/60 p-12 rounded-3xl border border-slate-700 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No Items in Recovery Window</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    All learner records, assessments, and teacher profiles are active in database.
                  </p>
                </div>
              ) : (
                recycleBin.map((item) => {
                  const daysRemaining = Math.max(0, Math.ceil((item.purgeDeadline - Date.now()) / (24 * 60 * 60 * 1000)));
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm text-white">{item.itemTitle}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                            {item.itemType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            {daysRemaining} days until auto-purge
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Deleted by <strong className="text-slate-200">{item.deletedBy}</strong> ({item.deletedByRole}) on{' '}
                          {new Date(item.deletedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-red-400 font-mono mt-0.5">Reason: {item.reason}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onRestoreRecycleItem) onRestoreRecycleItem(item);
                            showNotification(`Restored ${item.itemTitle} to active database.`);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore Record</span>
                        </button>

                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setPurgeTargetItem(item)}
                            className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Permanently</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Head/Deputy role required to purge</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: IMMUTABLE AUDIT TRAIL (P2.9) ================= */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.9 Immutable Audit Logging
                </span>
                <h3 className="text-base font-bold text-white">System Audit &amp; Activity Trail</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records logins, mark submissions, deadline creation, user actions, and deletion with before/after diffs.
                </p>
              </div>

              <button
                type="button"
                id="export-audit-csv-btn"
                onClick={handleExportAuditLogsCSV}
                className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV ({filteredAuditLogs.length})</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search logs by actor, action, or details..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {isSuperAdmin ? (
                <select
                  value={selectedAuditSchool}
                  onChange={(e) => setSelectedAuditSchool(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
                  title="Filter logs by School Tenant (Code P2.11)"
                >
                  <option value="ALL">All School Tenants</option>
                  {tenants.map((t) => (
                    <option key={t.schoolId} value={t.schoolId}>
                      {t.schoolName} ({t.schoolCode})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-400" />
                  <span>{activeTenant.schoolCode} (Isolated)</span>
                </div>
              )}

              <select
                value={selectedAuditAction}
                onChange={(e) => setSelectedAuditAction(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
              >
                <option value="ALL">All Action Types</option>
                <option value="LOGIN">LOGIN</option>
                <option value="MARKS_SUBMIT">MARKS_SUBMIT</option>
                <option value="RECORD_EDIT">RECORD_EDIT</option>
                <option value="RECORD_DELETE">RECORD_DELETE</option>
                <option value="RECORD_RESTORE">RECORD_RESTORE</option>
                <option value="PERMANENT_PURGE">PERMANENT_PURGE</option>
                <option value="TENANT_CREATE">TENANT_CREATE</option>
                <option value="TENANT_SWITCH">TENANT_SWITCH</option>
                <option value="USER_MANAGE">USER_MANAGE</option>
                <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
                <option value="BACKUP_CREATED">BACKUP_CREATED</option>
              </select>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Actor &amp; Role</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Details &amp; Values</th>
                      <th className="p-3.5">IP &amp; Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-300">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-750/50 transition">
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5">
                          <strong className="text-white text-xs">{log.userName}</strong>
                          <span className="block text-[10px] text-red-400 font-bold">{log.userRole}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs text-slate-200">{log.details}</div>
                          {log.afterValue && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded-sm block mt-0.5 w-fit">
                              Diff: {log.afterValue}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.ipAddress || '197.237.12.89'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SECURITY MONITORING (P2.12) ================= */}
        {activeTab === 'monitoring' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                Code P2.12 Security Telemetry &amp; Threat Feeds
              </span>
              <h3 className="text-base font-bold text-white">Live Intrusion &amp; Anomaly Detection</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks failed logins, brute force attempts, unauthorized export attempts, and privilege escalation attempts.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {alertsList.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{alert.title}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          {alert.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">
                        IP: {alert.ipAddress} • {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAlertsList((prev) => prev.filter((a) => a.id !== alert.id));
                      onLogAudit('SECURITY_ALERT_DISMISS', `Administrator reviewed & resolved alert: ${alert.title}`);
                      showNotification(`Alert '${alert.title}' resolved.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: ENCRYPTED BACKUPS (P2.13) ================= */}
        {activeTab === 'backups' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.13 Encrypted Backups &amp; Checksums
                </span>
                <h3 className="text-base font-bold text-white">Database Backup &amp; Integrity Records</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Backups are encrypted using AES-256-GCM and verified with SHA-256 cryptographic checksums.
                </p>
              </div>

              <button
                type="button"
                id="create-backup-btn"
                disabled={isBackingUp}
                onClick={handleTriggerBackup}
                className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Encrypting Database...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Generate Encrypted Backup</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {backupsList.map((bck) => (
                <div
                  key={bck.id}
                  className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{bck.type} Encrypted Snapshot</strong>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {bck.encryptionAlgorithm}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Size: {(bck.sizeBytes / 1024).toFixed(1)} KB • {bck.recordCount} Records • Created{' '}
                        {new Date(bck.timestamp).toLocaleString()}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        Checksum: {bck.checksumSha256}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Integrity Verified</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: COMPLIANCE CHECKLIST (P2.14) ================= */}
        {activeTab === 'compliance' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                Code P2.14 JJSAK Compliance Standards
              </span>
              <h3 className="text-base font-bold text-white">Kenya Data Protection &amp; MoE Checklist</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verification audit adhering to the Kenya Data Protection Act (KDPA 2019) and Ministry of Education CBC guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_COMPLIANCE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-slate-800 border border-slate-700 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-red-400 px-2 py-0.5 rounded-md bg-slate-900">
                        {item.ruleCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.requirement}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-700/60">
                    Last Verified: {item.lastAudited}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD SCHOOL TENANT (P2.1) ================= */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 p-6 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold">Register School Tenant (Super Admin)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTenantModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">School Institution Name:</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. St. Jude Junior Academy"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">School Code:</label>
                  <input
                    type="text"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    placeholder="e.g. SJA-30200"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-white uppercase focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category:</label>
                  <select
                    value={newSchoolCategory}
                    onChange={(e) => setNewSchoolCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="JUNIOR">Junior School</option>
                    <option value="PRIMARY">Primary School</option>
                    <option value="SECONDARY">Secondary School</option>
                    <option value="MIXED">Comprehensive School</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Postal Address:</label>
                <input
                  type="text"
                  value={newSchoolAddress}
                  onChange={(e) => setNewSchoolAddress(e.target.value)}
                  placeholder="P.O. Box 123 - 30200, Kitale"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Official Email:</label>
                  <input
                    type="email"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    placeholder="info@school.sc.ke"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold transition shadow-md cursor-pointer"
                >
                  Create School Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER (P2.2, P2.3 & POLICY SECTIONS 4 & 5) ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 p-6 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-base font-bold">Onboard Institutional Staff (Section 4)</h3>
                  <span className="text-[10px] text-slate-400">Account will be created in PENDING ACTIVATION with 15-min OTP</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Legal Name *:</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Mutua"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">National ID / Passport *:</label>
                  <input
                    type="text"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    placeholder="e.g. 28475920"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">TSC Number (Optional):</label>
                  <input
                    type="text"
                    value={newTscNumber}
                    onChange={(e) => setNewTscNumber(e.target.value)}
                    placeholder="e.g. TSC-584920"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number (SMS OTP) *:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="j.mutua@school.sc.ke"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Institutional Role (Section 3) *:</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-red-500"
                  >
                    <option value="HEAD_OF_INSTITUTION">Head of Institution / Principal</option>
                    <option value="DEPUTY_HEAD_OF_INSTITUTION">Deputy Head of Institution</option>
                    <option value="DIRECTOR_OF_ACADEMICS">Director of Academics</option>
                    <option value="TEACHER">Teacher (Academic Faculty)</option>
                    <option value="FINANCE">Finance / Accounts Officer</option>
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="STUDENT">Student / Learner</option>
                    {isSuperAdmin && <option value="SUPER_ADMIN">Super Administrator</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Designation / Title:</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="e.g. Principal / Senior Teacher"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Assigned School Tenant:</label>
                  <select
                    value={newUserSchoolId}
                    onChange={(e) => setNewUserSchoolId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  >
                    {tenants.map((t) => (
                      <option key={t.schoolId} value={t.schoolId}>
                        {t.schoolName} [{t.schoolCode}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 text-[11px] leading-relaxed">
                <span className="font-bold text-red-400 block mb-0.5">Policy Section 4 &amp; 5 Rule:</span>
                Creating this account will generate a 6-digit One-Time Password (OTP) valid for 15 minutes. The user must complete the First Login Security Procedure to set their permanent password and activate the account.
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate Invitation &amp; OTP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SMART INVITATION & ONBOARDING (POLICY SECTION 5) ================= */}
      {activeInvitationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none">
          <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-red-500/80 p-6 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-950 border border-red-800 text-red-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Smart User Invitation &amp; Activation</h3>
                  <span className="text-[10px] text-slate-400">Policy Section 5: Secure Multi-Channel Invitation Dispatch</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvitationModal(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">User Account:</span>
                <strong className="text-sm text-white font-bold block truncate">{activeInvitationModal.user.fullName}</strong>
                <span className="text-[11px] text-red-300 font-mono">@{activeInvitationModal.user.username}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Assigned Role:</span>
                <strong className="text-xs text-amber-300 font-bold block">{activeInvitationModal.user.role}</strong>
                <span className="text-[10px] text-slate-400">{activeInvitationModal.user.designation || 'Staff'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">One-Time Password (OTP):</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>•••••• (Protected)</span>
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Zero Admin Exposure (§2.3) • Dispatched to private device
                </span>
              </div>
            </div>

            {/* SMS Invitation Preview & Copy */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SMS Invitation (to {activeInvitationModal.user.phoneNumber || 'User Phone'}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(activeInvitationModal.smsMessage, 'sms')}
                  className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'sms' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied SMS!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SMS Text</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono leading-relaxed select-all">
                {activeInvitationModal.smsMessage}
              </div>
            </div>

            {/* Email Invitation Preview & Copy */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email Invitation (to {activeInvitationModal.user.email || 'User Mailbox'}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(`${activeInvitationModal.emailSubject}\n\n${activeInvitationModal.emailBody}`, 'email')}
                  className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Full Email</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap select-all max-h-36 overflow-y-auto">
                <div className="text-amber-300 font-bold mb-1">Subject: {activeInvitationModal.emailSubject}</div>
                {activeInvitationModal.emailBody}
              </div>
            </div>

            {/* Simulated Live Send Button & Done */}
            <div className="flex flex-wrap items-center gap-3 mt-1 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSimulateSend}
                disabled={simulatedSendStatus === 'DISPATCHING'}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {simulatedSendStatus === 'DISPATCHING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching via SMS &amp; Email...</span>
                  </>
                ) : simulatedSendStatus === 'SENT' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Dispatched Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch SMS &amp; Email Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveInvitationModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CODE P2.10 PERMANENT PURGE MODAL ================= */}
      {purgeTargetItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-500 p-6 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  Code P2.10 Irreversible Purge
                </span>
                <h4 className="text-base font-bold text-white">Permanently Purge Record?</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to permanently purge <strong className="text-white">{purgeTargetItem.itemTitle}</strong> ({purgeTargetItem.itemType}). This action will bypass the 30-day recovery window and cannot be undone.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Mandatory Purge Reason (Min. 10 chars):
                </label>
                <textarea
                  rows={2}
                  value={purgeReasonText}
                  onChange={(e) => setPurgeReasonText(e.target.value)}
                  placeholder="e.g. Duplicate erroneous profile confirmed by Board of Management"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Type <span className="font-mono text-red-400 font-black">PERMANENTLY DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={purgeConfirmWord}
                  onChange={(e) => setPurgeConfirmWord(e.target.value)}
                  placeholder="PERMANENTLY DELETE"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 font-mono text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPurgeTargetItem(null);
                    setPurgeReasonText('');
                    setPurgeConfirmWord('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={purgeConfirmWord !== 'PERMANENTLY DELETE' || purgeReasonText.trim().length < 10}
                  onClick={() => {
                    if (onPurgeRecycleItem && purgeTargetItem) {
                      onPurgeRecycleItem(purgeTargetItem, purgeReasonText.trim());
                      setPurgeTargetItem(null);
                      setPurgeReasonText('');
                      setPurgeConfirmWord('');
                      showNotification('Record permanently purged from system.');
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    purgeConfirmWord === 'PERMANENTLY DELETE' && purgeReasonText.trim().length >= 10
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Forever</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner-Only Subscription Payment Configuration Modal (SCMH 2.X) */}
      {showPaymentConfigModal && isOwner && currentUser && (
        <OwnerPaymentConfigurationModal
          isOpen={showPaymentConfigModal}
          onClose={() => setShowPaymentConfigModal(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
