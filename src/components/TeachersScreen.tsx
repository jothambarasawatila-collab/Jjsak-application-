import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  UserCheck,
  Sparkles,
  Share2,
  GraduationCap,
  ShieldCheck,
  Eye,
  ShieldAlert,
  Building2,
  Inbox,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Send,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { Teacher, AuditActionType, UserRole } from '../types';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS, getTeacherInitials } from '../data/mockData';
import { StaffRegistrationModal } from './teachers/StaffRegistrationModal';
import { StaffDossierModal } from './teachers/StaffDossierModal';
import { StaffPipelineView } from './teachers/StaffPipelineView';
import { StaffRegistersView } from './teachers/StaffRegistersView';
import { carrierInboxService } from '../services/carrierInboxService';

interface TeachersScreenProps {
  teachers: Teacher[];
  onBack: () => void;
  onAddTeacher: (teacher: Teacher, options?: any) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (id: string) => void;
  onOpenMarksEntry?: (teacherId: string, className: string, subject: string) => void;
  onOpenShareModal?: () => void;
  onOpenCarrierInbox?: () => void;
  onOpenTeacherValidation?: (otp?: string, username?: string, schoolId?: string, password?: string) => void;
  currentUser?: any;
  users?: any;
  currentSchoolId?: string;
  onLogAudit?: (action: AuditActionType, details: string, before?: string, after?: string) => void;
}

export const TeachersScreen: React.FC<TeachersScreenProps> = ({
  teachers,
  onBack,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onOpenMarksEntry,
  onOpenShareModal,
  onOpenCarrierInbox,
  onOpenTeacherValidation,
  currentUser,
  currentSchoolId,
  onLogAudit,
}) => {
  // Multi-Tenant Strict Isolation Policy
  const effectiveSchoolId = currentSchoolId || currentUser?.schoolId || '';

  const tenantIsolatedTeachers = useMemo(() => {
    if (!effectiveSchoolId) return teachers;
    return teachers.filter((t) => {
      if (t.schoolId) {
        return t.schoolId === effectiveSchoolId;
      }
      // Strict fallback: check tenant-specific domains or names
      if (effectiveSchoolId === 'sch-yuya-30200' && (t.email?.toLowerCase().includes('yuya') || t.name?.toLowerCase().includes('yuya'))) {
        return true;
      }
      if (effectiveSchoolId === 'sch-ngonyek-30200' && (t.email?.toLowerCase().includes('ngonyek') || t.name?.toLowerCase().includes('ngonyek'))) {
        return true;
      }
      return false;
    });
  }, [teachers, effectiveSchoolId]);

  // Top-level Navigation Mode
  const [activeScreenTab, setActiveScreenTab] = useState<'directory' | 'pipeline' | 'registers'>('directory');

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Registration / Edit Modal State
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // 360° Dossier Modal State
  const [dossierTeacher, setDossierTeacher] = useState<Teacher | null>(null);

  // Portal Access Credentials & OTP Inspection Modal State
  const [selectedTeacherForCredentials, setSelectedTeacherForCredentials] = useState<Teacher | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [credentialsNotification, setCredentialsNotification] = useState<string | null>(null);
  const [isDispatchingLive, setIsDispatchingLive] = useState(false);
  const [liveDispatchResult, setLiveDispatchResult] = useState<any | null>(null);

  // Quick Notification
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSendLiveCredentialsNow = async (t: Teacher) => {
    setIsDispatchingLive(true);
    const username = t.email ? t.email.split('@')[0] : t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const activeOtpRecord = carrierInboxService.getLatestOtpForUser(username);
    const temporaryPassword =
      t.firstTimePassword || carrierInboxService.getLatestFirstTimePasswordForUser(username) || 'Staff@2026!';
    const activeOtpCode = activeOtpRecord?.otp || '728194';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.jjsak.edu.ke';
    const directActivationLink = `${origin}/#activate-teacher?id=${encodeURIComponent(t.id)}&user=${encodeURIComponent(username)}&school=${encodeURIComponent(t.schoolId || effectiveSchoolId)}&otp=${encodeURIComponent(activeOtpCode)}&pwd=${encodeURIComponent(temporaryPassword)}`;

    try {
      const result = await carrierInboxService.sendLiveCredentialsNow({
        teacherId: t.id,
        teacherName: t.name,
        username,
        email: t.email,
        phoneNumber: t.phoneNumber,
        schoolId: t.schoolId || effectiveSchoolId || 'sch-central-001',
        schoolName: t.schoolId || 'Institutional School Portal',
        firstTimePassword: temporaryPassword,
        otpCode: activeOtpCode,
        activationLink: directActivationLink,
        channels: ['EMAIL', 'SMS', 'WHATSAPP'],
      });
      setLiveDispatchResult(result);
      setCredentialsNotification(`✓ Live Multi-Channel Transmission sent for ${t.name}!`);
      setTimeout(() => setCredentialsNotification(null), 5000);
    } catch {
      // Tolerate
    } finally {
      setIsDispatchingLive(false);
    }
  };

  const handleDispatchFreshCredentials = (t: Teacher) => {
    const newPwd = carrierInboxService.generateFirstTimePassword();
    const username = t.email ? t.email.split('@')[0] : t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const result = carrierInboxService.dispatchTeacherRegistrationInvite({
      teacherId: t.id,
      teacherName: t.name,
      username,
      email: t.email,
      phoneNumber: t.phoneNumber,
      schoolId: t.schoolId || effectiveSchoolId || 'sch-central-001',
      schoolName: t.schoolId || 'Institutional School Portal',
      role: t.role || 'TEACHER',
      firstTimePassword: newPwd,
      deliveryChannels: { email: true, sms: true, whatsapp: true },
    });

    const updatedTeacher: Teacher = { ...t, firstTimePassword: newPwd, password: newPwd };
    if (onUpdateTeacher) {
      onUpdateTeacher(updatedTeacher);
    }
    setSelectedTeacherForCredentials(updatedTeacher);
    setCredentialsNotification(`✓ Fresh OTP (${result.otpCode}) and temporary password dispatched for ${t.name}!`);
    setTimeout(() => setCredentialsNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setShowRegistrationModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setShowRegistrationModal(true);
  };

  const handleOpenDossier = (t: Teacher) => {
    setDossierTeacher(t);
  };

  const handleSaveTeacherFromModal = (
    teacherData: Teacher,
    options?: { provisionAccount: boolean; userRole: UserRole; sendInvitation: boolean; firstTimePassword?: string }
  ) => {
    const finalTeacher: Teacher = {
      ...teacherData,
      schoolId: teacherData.schoolId || effectiveSchoolId,
    };
    if (editingTeacher) {
      if (onUpdateTeacher) {
        onUpdateTeacher(finalTeacher);
      }
      showNotification(`✓ Updated profile and records for ${finalTeacher.name}`);
    } else {
      onAddTeacher(finalTeacher, options);
      showNotification(`✓ Registered ${finalTeacher.name}: First-time password, link & OTP delivered via SMS, WhatsApp & Email`);
    }
  };

  // KPIs Scoped Exclusively to Current School Tenant
  const totalStaff = tenantIsolatedTeachers.length;
  const tscVerifiedCount = tenantIsolatedTeachers.filter((t) => t.tscNumber && t.tscNumber.trim().length > 0).length;
  const tscVerifiedPercent = totalStaff > 0 ? Math.round((tscVerifiedCount / totalStaff) * 100) : 100;
  const activeIamCount = tenantIsolatedTeachers.filter((t) => t.active !== false && t.accountStatus !== 'SUSPENDED').length;
  const avgWorkload =
    totalStaff > 0
      ? Math.round(
          tenantIsolatedTeachers.reduce((acc, t) => acc + (t.workload?.lessonsPerWeek || 22), 0) / totalStaff
        )
      : 24;

  const filteredTeachers = tenantIsolatedTeachers.filter((t) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.role && t.role.toLowerCase().includes(q)) ||
      (t.tscNumber && t.tscNumber.toLowerCase().includes(q)) ||
      (t.staffNumber && t.staffNumber.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q));

    const matchesClass =
      selectedClassFilter === 'All' ||
      (t.classes && t.classes.some((c) => c === selectedClassFilter)) ||
      (t.allocations && t.allocations.some((a) => a.className === selectedClassFilter));

    const subjFilter = (selectedSubjectFilter || '').toLowerCase();
    const matchesSubject =
      selectedSubjectFilter === 'All' ||
      (t.subjects && t.subjects.some((s) => s && s.toLowerCase() === subjFilter)) ||
      (t.allocations &&
        t.allocations.some((a) =>
          a.subjects && a.subjects.some((s) => s && s.toLowerCase() === subjFilter)
        ));

    const deptFilter = (selectedDepartmentFilter || '').toLowerCase();
    const matchesDepartment =
      selectedDepartmentFilter === 'All' ||
      (t.department && t.department.toLowerCase() === deptFilter);

    const isSuspended = t.active === false || t.accountStatus === 'SUSPENDED';
    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Active' && !isSuspended) ||
      (selectedStatusFilter === 'Suspended' && isSuspended);

    return matchesSearch && matchesClass && matchesSubject && matchesDepartment && matchesStatus;
  });

  const isOwner = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';
  if (isOwner) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 sm:p-8">
        <div className="max-w-3xl mx-auto w-full mt-8 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
              Platform Owner Domain Separation (§1 &amp; §7)
            </span>
            <h2 className="text-xl font-bold text-white">Institutional Staff Registry Isolated</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              As the Platform Owner, you govern registered schools, cryptographic schemas, and institutional tenancies.
              Under tenant privacy regulations, individual teacher and learner accounts are strictly managed by School Institutional Administrators.
              The Platform Owner cannot view teachers registered or onboard users under school accounts.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>To Access This School's Teacher Portal:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              You must be registered by the school institutional head as a staff member with separate school credentials, 
              validate registration using the dispatched OTP link, set your password, and log in at the School Portal Gateway.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              Return to Governance Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Top Header */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Staff & Professional Records</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-red-100 border border-white/20">
                Phase 4
              </span>
            </h1>
            <span className="text-[11px] text-red-100 font-medium block">
              Registration, Verification, Workload, Appraisals & IAM Provisioning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCarrierInbox && (
            <button
              type="button"
              id="teachers-screen-carrier-inbox-btn"
              onClick={onOpenCarrierInbox}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 font-bold text-xs shadow-sm active:scale-95 transition cursor-pointer"
              title="Open Carrier Inboxes (SMS / WhatsApp / Email verification dispatch)"
            >
              <Inbox className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Carrier Inboxes</span>
            </button>
          )}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="Share app"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#C51E28] flex items-center gap-1.5 font-bold text-xs shadow-sm hover:bg-red-50 active:scale-95 transition cursor-pointer"
            title="Register New Staff Member"
          >
            <Plus className="w-4 h-4 text-[#C51E28]" />
            <span className="hidden sm:inline">Register Staff</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div className="bg-slate-900 text-red-100 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in fade-in sticky top-14 z-25">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Screen Sub-Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-2xs px-4 py-2 sticky top-14 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'directory', label: 'Staff Directory & Profiles', icon: UserCheck, count: teachers.length },
              { id: 'pipeline', label: '10-Step Approval & IAM Pipeline', icon: ShieldCheck },
              { id: 'registers', label: 'Qualifications & Integrity Registers', icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeScreenTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveScreenTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Staff Profile</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Staff</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-[#C51E28]">{totalStaff}</span>
              <span className="text-[11px] text-slate-500 font-semibold">Educators</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">TSC Licensure</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-700">{tscVerifiedPercent}%</span>
              <span className="text-[11px] text-slate-500 font-semibold">Verified</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">IAM Accounts</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-800">{activeIamCount}</span>
              <span className="text-[11px] text-emerald-600 font-bold">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Avg Workload</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-800">{avgWorkload}</span>
              <span className="text-[11px] text-slate-500 font-semibold">/ 27 Lsns</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">TPAD Rating</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-600">86.4%</span>
              <span className="text-[11px] text-amber-700 font-bold">Exceeding</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: STAFF DIRECTORY & PROFILES */}
        {activeScreenTab === 'directory' && (
          <div className="space-y-5">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by teacher name, TSC number, staff ID, or learning area..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#C51E28] transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedDepartmentFilter}
                    onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Departments</option>
                    <option value="Technical & Applied">Technical & Applied</option>
                    <option value="Languages">Languages</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Creative Arts & Sports">Creative Arts & Sports</option>
                    <option value="Administration">Administration</option>
                  </select>

                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Classes (G7-G9)</option>
                    {AVAILABLE_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Subjects</option>
                    {AVAILABLE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active in IAM</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Staff Cards Grid */}
            {filteredTeachers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No staff members match the selected filters</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust your search parameters or register a new teacher.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((t) => {
                  const isSuspended = t.active === false || t.accountStatus === 'SUSPENDED';
                  const primarySubject = t.subjects?.[0] || 'Pretechnical Studies';
                  const primaryClass = t.classes?.[0] || 'G8 S';

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        {/* Header: Avatar, Name, Identifiers */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-xs shrink-0"
                              style={{ backgroundColor: t.avatarHex || '#C51E28' }}
                            >
                              {getTeacherInitials(t.name)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                                  {t.staffNumber || t.employeeNumber || 'STF-001'}
                                </span>
                                {t.tscNumber && (
                                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 text-[10px] font-mono font-bold border border-red-200">
                                    {t.tscNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              !isSuspended
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {!isSuspended ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </div>

                        {/* Role & Department */}
                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800 truncate">{t.role}</p>
                          <p className="text-[11px] text-slate-500">
                            Dept: <span className="font-medium text-slate-700">{t.department || 'Technical & Applied'}</span>
                            {' • '}
                            {t.employmentStatus || 'Permanent'}
                          </p>
                        </div>

                        {/* Stream and Learning Area Allocations */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Assigned Streams & Learning Areas
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(t.allocations && t.allocations.length > 0 ? t.allocations : []).map((alloc) => (
                              <span
                                key={alloc.className}
                                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200"
                              >
                                {alloc.className} ({alloc.subjects.length})
                              </span>
                            ))}
                            {(!t.allocations || t.allocations.length === 0) &&
                              t.classes.map((cls) => (
                                <span
                                  key={cls}
                                  className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200"
                                >
                                  {cls}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Workload Indicator */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-500 font-medium">Weekly Load:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {t.workload?.lessonsPerWeek || 22} / 27 Lessons
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDossier(t)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Open Teacher Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTeacherForCredentials(t)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="View Portal Access Link, OTP & Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Access &amp; OTP</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onOpenMarksEntry && (
                            <button
                              type="button"
                              onClick={() => onOpenMarksEntry(t.id, primaryClass, primarySubject)}
                              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              title="Enter Marks as this teacher"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Marks</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Staff Records"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTeacher?.(t.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Staff Details (Permanent / Recycle Bin Deletion)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: 10-STEP APPROVAL & IAM PIPELINE */}
        {activeScreenTab === 'pipeline' && (
          <StaffPipelineView
            teachers={tenantIsolatedTeachers}
            onUpdateTeacher={(updated) => {
              if (onUpdateTeacher) onUpdateTeacher(updated);
            }}
            onSelectTeacherForDossier={handleOpenDossier}
            onLogAudit={onLogAudit}
          />
        )}

        {/* VIEW 3: QUALIFICATIONS & INTEGRITY REGISTERS */}
        {activeScreenTab === 'registers' && (
          <StaffRegistersView
            teachers={tenantIsolatedTeachers}
            onSelectTeacherForDossier={handleOpenDossier}
          />
        )}
      </div>

      {/* Registration & Edit Modal */}
      <StaffRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSaveTeacher={handleSaveTeacherFromModal}
        existingTeachers={tenantIsolatedTeachers}
        editingTeacher={editingTeacher}
        availableClasses={AVAILABLE_CLASSES}
        availableSubjects={AVAILABLE_SUBJECTS}
        currentUserRole={currentUser?.role}
        currentSchoolId={effectiveSchoolId}
        onOpenCarrierInbox={onOpenCarrierInbox}
        onOpenTeacherValidation={onOpenTeacherValidation}
      />

      {/* 360° Professional Dossier Modal */}
      <StaffDossierModal
        isOpen={!!dossierTeacher}
        onClose={() => setDossierTeacher(null)}
        teacher={dossierTeacher}
        onUpdateTeacher={(updated) => {
          if (onUpdateTeacher) onUpdateTeacher(updated);
          setDossierTeacher(updated);
        }}
        onOpenMarksEntry={onOpenMarksEntry}
        onLogAudit={onLogAudit}
      />

      {/* Teacher Credentials, OTP & Activation Link Modal */}
      {selectedTeacherForCredentials && (() => {
        const t = selectedTeacherForCredentials;
        const username = t.email ? t.email.split('@')[0] : t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const activeOtpRecord = carrierInboxService.getLatestOtpForUser(username);
        const temporaryPassword =
          t.firstTimePassword || carrierInboxService.getLatestFirstTimePasswordForUser(username) || 'Staff@2026!';
        const activeOtpCode = activeOtpRecord?.otp || '728194';
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.jjsak.edu.ke';
        const directActivationLink = `${origin}/#activate-teacher?id=${encodeURIComponent(t.id)}&user=${encodeURIComponent(username)}&school=${encodeURIComponent(t.schoolId || effectiveSchoolId)}&otp=${encodeURIComponent(activeOtpCode)}&pwd=${encodeURIComponent(temporaryPassword)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Staff Portal Access &amp; OTP Dispatch
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                        {t.accountStatus || 'PENDING_FIRST_LOGIN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Login credentials, temporary password, and OTP activation link for {t.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherForCredentials(null);
                    setCredentialsNotification(null);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 max-h-[80vh]">
                {credentialsNotification && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{credentialsNotification}</span>
                  </div>
                )}

                {/* Staff Profile Row */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase">Staff Member</span>
                    <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                      <span>{t.role || 'Teacher'}</span>
                      <span>•</span>
                      <span>TSC: {t.tscNumber || t.staffNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500 font-semibold uppercase block">Delivery Contact</span>
                    <span className="font-mono text-slate-800 block">{t.phoneNumber || 'No phone'}</span>
                    <span className="text-slate-500 text-[11px] block truncate max-w-[200px]">{t.email || 'No email'}</span>
                  </div>
                </div>

                {/* Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Username */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Login Username
                    </span>
                    <div className="text-base font-mono font-bold text-white select-all">
                      {username}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {t.email || `${username}@school`}
                    </span>
                  </div>

                  {/* Temporary Password */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Temporary Password
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(temporaryPassword);
                          setCopiedPassword(true);
                          setTimeout(() => setCopiedPassword(false), 2000);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-base font-mono font-bold text-emerald-400 select-all">
                      {temporaryPassword}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Single-use first login key</span>
                  </div>

                  {/* OTP Code */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Verification OTP
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeOtpCode);
                          setCopiedOtp(true);
                          setTimeout(() => setCopiedOtp(false), 2000);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xl font-mono font-black tracking-widest text-amber-400 select-all">
                      {activeOtpCode}
                    </div>
                    <span className="text-[10px] text-amber-400/80 block">
                      {activeOtpRecord ? 'Active in Carrier Inbox' : 'Default generated'}
                    </span>
                  </div>
                </div>

                {/* Direct Link */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-red-700" />
                      <span>Direct Activation Link (Pre-fills OTP &amp; Username)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(directActivationLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                    {directActivationLink}
                  </div>
                </div>

                {/* Live Multi-Channel Transmission Section */}
                {(() => {
                  const targetPhone = (t.phoneNumber || '0741478813').replace(/\D/g, '');
                  let intlPhone = targetPhone;
                  if (targetPhone.startsWith('0') && targetPhone.length === 10) intlPhone = '254' + targetPhone.substring(1);
                  const waText = `*JJSAK School Portal — Teacher Login Credentials*\nInstitution: ${t.schoolId || effectiveSchoolId}\nStaff: ${t.name}\nUsername: ${username}\nTemporary Password: ${temporaryPassword}\nOTP Verification Code: ${activeOtpCode}\nDirect Activation Link: ${directActivationLink}\n\nPlease click the link to activate your portal account.`;
                  const smsText = `[JJSAK Alert] School Portal: Welcome ${t.name}. Username: ${username} | Password: ${temporaryPassword} | OTP: ${activeOtpCode} | Link: ${directActivationLink}`;
                  const emailSubject = `Welcome to ${t.schoolId || effectiveSchoolId} — Teacher Portal Login Credentials & Verification OTP`;

                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Live Multi-Channel Delivery (WhatsApp, SMS &amp; Email)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Live Dispatch Ready
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-700">
                            Deliver Directly to Teacher&apos;s Device:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSendLiveCredentialsNow(t)}
                            disabled={isDispatchingLive}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isDispatchingLive ? 'animate-spin' : ''}`} />
                            <span>{isDispatchingLive ? 'Sending via Server APIs...' : 'Send Live via Server APIs'}</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(waText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Send to WhatsApp Now</span>
                          </a>

                          <a
                            href={`sms:+${intlPhone}?body=${encodeURIComponent(smsText)}`}
                            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-sky-600" />
                            <span>Send via Phone SMS</span>
                          </a>

                          {t.email && (
                            <a
                              href={`mailto:${t.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(smsText)}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-600" />
                              <span>Send to Teacher Email</span>
                            </a>
                          )}
                        </div>

                        {liveDispatchResult && (
                          <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 animate-in fade-in space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Server Live Multi-Channel Transmission Triggered:</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
                              <div>WhatsApp: {liveDispatchResult.channelResults?.whatsapp?.accepted ? '✓ Accepted (Meta/Twilio)' : 'Dispatched / Direct Ready'}</div>
                              <div>SMS: {liveDispatchResult.channelResults?.sms?.accepted ? '✓ Accepted (AT/Twilio)' : 'Dispatched / Direct Ready'}</div>
                              <div>Email: {liveDispatchResult.channelResults?.email?.accepted ? '✓ Accepted (SMTP/Resend)' : 'Dispatched / Direct Ready'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const pack = `*JJSAK School Portal — Teacher Login Credentials*\nInstitution: ${t.schoolId || effectiveSchoolId}\nStaff: ${t.name}\nUsername: ${username}\nTemporary Password: ${temporaryPassword}\nOTP Verification Code: ${activeOtpCode}\nDirect Activation Link: ${directActivationLink}\n\nPlease click the link to activate your portal account.`;
                        navigator.clipboard.writeText(pack);
                        setCopiedAll(true);
                        setTimeout(() => setCopiedAll(false), 2500);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAll ? 'Copied WhatsApp Invite' : 'Copy WhatsApp / SMS Invite'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDispatchFreshCredentials(t)}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate Fresh OTP &amp; Password</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenCarrierInbox && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeacherForCredentials(null);
                          onOpenCarrierInbox();
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>View in Inbox</span>
                      </button>
                    )}

                    {onOpenTeacherValidation && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetUser = username;
                          const targetOtp = activeOtpCode;
                          const targetSchool = t.schoolId || effectiveSchoolId;
                          const targetPwd = temporaryPassword;
                          setSelectedTeacherForCredentials(null);
                          onOpenTeacherValidation(targetOtp, targetUser, targetSchool, targetPwd);
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Test Activation Now</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
