import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  GraduationCap,
  FileText,
  BarChart3,
  Users,
  Calendar,
  X,
  Calculator,
  Share2,
  Edit2,
  Compass,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Download,
  Sparkles,
  Building2,
  CreditCard,
  Phone,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  User,
  Save,
  Layers,
  Database,
  Send,
  HeartHandshake,
  School,
  Lock,
  LogOut,
} from 'lucide-react';
import { SchoolInfo, Student, Teacher, DashboardRole, ActiveScreen, User as UserType, SchoolTenant } from '../types';
import { ScoreConverterModal } from './ScoreConverterModal';
import { computeAnalytics } from '../data/analyticsUtils';
import { checkSchoolLeadershipPrerequisites } from '../utils/securityEngine';
import { resolveSchoolTheme } from '../utils/brandingEngine';
import { isOwnerOrSuperAdmin } from '../utils/platformGovernance';
import { LearnerPortalDashboard } from './learnerPortal/LearnerPortalDashboard';
import { LearnerReconciliationModal } from './learnerPortal/LearnerReconciliationModal';
import { OwnerPlatformDashboard } from './ownerDashboard/OwnerPlatformDashboard';

interface HomeScreenProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  currentUser?: UserType;
  users?: UserType[];
  activeTenantId?: string;
  tenants?: SchoolTenant[];
  onNavigate: (screen: ActiveScreen) => void;
  onOpenNotifications?: () => void;
  onOpenMarksEntry?: () => void;
  onOpenShareModal?: () => void;
  onOpenDownloadAppModal?: () => void;
  onOpenBulkUpload?: () => void;
  onOpenDataEntryHub?: (mode?: 'individual' | 'register' | 'marks' | 'bulk' | 'photo') => void;
  onOpenCommunicationHub?: (tab?: 'teachers' | 'parents' | 'reports') => void;
  onSelectStudent?: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
  onAddUser?: (newUser: UserType) => void;
  onLogAudit?: (action: any, details: string) => void;
  onLogout?: () => void;
  onIdentitySwitched?: (mode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL', account?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  schoolInfo,
  students,
  teachers,
  currentUser,
  users = [],
  activeTenantId,
  tenants = [],
  onNavigate,
  onOpenMarksEntry,
  onOpenShareModal,
  onOpenDownloadAppModal,
  onOpenBulkUpload,
  onOpenDataEntryHub,
  onOpenCommunicationHub,
  onSelectStudent,
  onUpdateStudent,
  onUpdateUser,
  onAddUser,
  onLogAudit,
  onLogout,
  onIdentitySwitched,
}) => {
  const [activeRole, setActiveRole] = useState<DashboardRole>('admin');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScoreConverter, setShowScoreConverter] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);

  // Tenant Isolation Protocol: Owner is not attached to any school tenant
  const isOwner = isOwnerOrSuperAdmin(currentUser);
  const [schoolAuditSession, setSchoolAuditSession] = useState<{
    tenant: SchoolTenant;
    reason: string;
  } | null>(null);

  // Leadership & Staff Account Prerequisites Check (JJSAK Policy Sections 2, 3, 8)
  const currentSchoolId = schoolAuditSession
    ? schoolAuditSession.tenant.schoolId
    : activeTenantId || currentUser?.schoolId || schoolInfo.address || '';
  const prerequisites = checkSchoolLeadershipPrerequisites(currentSchoolId, users);
  const currentTenant = schoolAuditSession
    ? schoolAuditSession.tenant
    : tenants.find((t) => t.schoolId === currentSchoolId);

  // Selected teacher for Teacher view
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  // Selected student for Learner & Parent view
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // Parent Information Editing State
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [parentSuccessMsg, setParentSuccessMsg] = useState<string | null>(null);

  const analytics = computeAnalytics(students, teachers, 'All', 'All');
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  const currentTheme = resolveSchoolTheme(
    currentTenant || {
      schoolId: currentSchoolId,
      schoolCode: 'JJSAK-001',
      schoolName: schoolInfo.name || 'JJSAK Educational Institution',
      address: schoolInfo.address || 'P.O. Box 100 - 00100, Nairobi, Kenya',
      phone: schoolInfo.phone || '+254 700 000 000',
      email: schoolInfo.email || 'info@jjsak.ac.ke',
      motto: schoolInfo.motto || 'Striving for Holistic Excellence and Integrity',
      category: 'JUNIOR',
      status: 'ACTIVE',
    }
  );

  // Synchronize parent edit inputs whenever selected student changes
  useEffect(() => {
    if (currentStudent) {
      setParentNameInput(
        currentStudent.parentName ||
        currentStudent.fatherName ||
        currentStudent.guardianName ||
        currentStudent.motherName ||
        'Mr. David Mwangi'
      );
      setParentPhoneInput(
        currentStudent.parentPhone ||
        currentStudent.parentPhone1 ||
        '+254 722 345 678'
      );
      setIsEditingParent(false);
      setParentSuccessMsg(null);
    }
  }, [currentStudent?.id]);

  const handleSaveParentInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentStudent) return;

    const trimmedName = parentNameInput.trim() || 'Parent / Guardian';
    const trimmedPhone = parentPhoneInput.trim() || '+254 7';

    const updatedStudent: Student = {
      ...currentStudent,
      parentName: trimmedName,
      parentPhone: trimmedPhone,
      fatherName: trimmedName,
      parentPhone1: trimmedPhone,
      parents: (currentStudent.parents && currentStudent.parents.length > 0)
        ? [
            {
              ...currentStudent.parents[0],
              name: trimmedName,
              phoneNumber: trimmedPhone,
            },
            ...currentStudent.parents.slice(1),
          ]
        : [
            {
              id: `p-${Date.now()}`,
              name: trimmedName,
              phoneNumber: trimmedPhone,
              relation: 'Father / Guardian',
            },
          ],
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setIsEditingParent(false);
    setParentSuccessMsg('✓ Parent contact info updated and saved!');
    setTimeout(() => {
      setParentSuccessMsg(null);
    }, 3000);
  };

  const getTeacherInitials = (name?: string) => {
    if (!name) return 'TR';
    return name
      .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // 1. OWNER / SUPER ADMINISTRATOR DATA VISIBILITY ENFORCEMENT
  // Tenant Isolation Policy: The Owner manages the platform, while schools manage their own school data.
  // The Owner dashboard reflects platform-level governance and aggregated statistics only — never school membership.
  if (isOwner && !schoolAuditSession && currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col pb-24 select-none">
        {/* Top Platform Header Bar */}
        <div className="relative text-white pt-3 pb-3 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 shadow-md">
          <div className="flex items-center justify-between py-1">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer text-white"
              title="Menu & Platform Settings"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  JJSAK Platform Governance Core
                </h1>
              </div>
              <span className="text-[10px] text-amber-400/90 font-medium">
                Root Supervision • Multi-Tenant Education Infrastructure
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 transition cursor-pointer text-white"
                  title="Share App to Phone or PC"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 transition cursor-pointer text-white"
                  title="Platform Notifications"
                >
                  <Bell className="w-4 h-4 text-white" />
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] font-black flex items-center justify-center text-slate-950 shadow-xs">
                    2
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-400">Platform Alerts</span>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="font-bold text-amber-300 block">System Backup Verified</span>
                        <span className="text-slate-400 text-[11px]">Daily AES-256 cloud snapshot completed at 02:00 UTC.</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="font-bold text-emerald-400 block">Tenant Schemas 100% Isolated</span>
                        <span className="text-slate-400 text-[11px]">Zero cross-tenant boundary leaks detected.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Dashboard Body */}
        <div className="max-w-3xl w-full mx-auto px-4 pt-4">
          <OwnerPlatformDashboard
            currentUser={currentUser}
            tenants={tenants}
            onNavigate={onNavigate}
            onInitiateSchoolAudit={(tenant, reason) => setSchoolAuditSession({ tenant, reason })}
            onLogAudit={onLogAudit}
            onIdentitySwitched={onIdentitySwitched}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Authorized School Audit Mode Persistent Banner */}
      {isOwner && schoolAuditSession && (
        <div className="bg-amber-950 text-amber-100 p-3.5 border-b-2 border-amber-500 shadow-xl sticky top-0 z-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Tenant Isolation Protocol: Authorized Support &amp; Audit Mode
              </span>
            </div>
            <p className="text-xs text-amber-100 font-medium">
              Inspecting Tenant: <strong>{schoolAuditSession.tenant.schoolName}</strong> ({schoolAuditSession.tenant.schoolCode}) • Purpose: <em>{schoolAuditSession.reason}</em>
            </p>
            <p className="text-[10px] text-amber-400/90 font-mono">
              Notice: The Owner is not a member of this school. All actions are logged to the platform immutable audit trail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onLogAudit?.(
                'CROSS_TENANT_AUDIT_EXIT',
                `Owner concluded authorized inspection of ${schoolAuditSession.tenant.schoolName}.`
              );
              setSchoolAuditSession(null);
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <span>Exit Audit Mode &amp; Return to Owner Dashboard</span>
          </button>
        </div>
      )}

      {/* Top Header Section (School Branded) */}
      <div
        className="relative text-white pt-3 pb-7 px-4 sm:px-6 rounded-b-[28px] shadow-md transition-all duration-300"
        style={currentTheme.headerInlineStyle}
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between py-1.5">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Menu & Settings"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* App Title */}
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">
              JJSAK
            </h1>
            <span className="text-[10px] text-white/90 font-medium">
              Junior School Assessment & Pathway System
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 transition cursor-pointer text-white"
                title="Share App to Phone or PC"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-white" />
                <span
                  className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-[9px] font-black flex items-center justify-center shadow-xs"
                  style={{ color: currentTheme.primaryColor }}
                >
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 mt-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block">G8 Marks Due</span>
                      <span className="text-slate-600 text-[11px]">Term 2 Social Studies & Math test scores are ready for entry.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-800 block">Assessments Active</span>
                      <span className="text-slate-600 text-[11px]">Term 2 exams synced across teacher devices.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-800 block">Report Cards Ready</span>
                      <span className="text-slate-600 text-[11px]">Pathway profiles generated for all Grade 7 & 8 learners.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lock / Sign Out Button (JJSAK-AUTH-SEC-001) */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer text-white"
                title="Lock Session & Sign Out"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* STEP 4 PORTAL LOADING: User Greeting, School Name, Logo & Motto (JJSAK-AUTH-SEC-001) */}
        <div className="mt-3 flex items-start justify-between gap-3 bg-black/15 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/80 block">
              Welcome
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {currentTheme.schoolName}
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-xs text-white/90 font-medium">
                Logged in as:
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 tracking-tight">
                {currentUser?.role === 'HEAD'
                  ? 'Head of Institution'
                  : currentUser?.designation || currentUser?.role || 'Staff'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-black/25 text-white/90">
                {currentTheme.schoolCode}
              </span>
            </div>

            {currentTheme.motto && (
              <p className="text-[11px] text-white/80 italic mt-1 font-serif line-clamp-1">
                "{currentTheme.motto}"
              </p>
            )}
          </div>

          {/* School Crest / Logo */}
          <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-white/40">
            {currentTheme.logoUrl ? (
              <img
                src={currentTheme.logoUrl}
                alt={currentTheme.schoolName}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center text-white font-black"
                style={{ backgroundColor: currentTheme.primaryColor }}
              >
                <span className="text-xs">{currentTheme.monogram}</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Level Role Switcher Pills */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'admin', label: 'Admin', icon: ShieldCheck },
            { id: 'teacher', label: 'Teacher', icon: Users },
            { id: 'learner', label: 'Learner', icon: GraduationCap },
            { id: 'parent', label: 'Parent / Guardian', icon: UserCheck },
          ].map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id as DashboardRole)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                style={isActive ? { color: currentTheme.primaryColor } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Body */}
      <div className="max-w-xl w-full mx-auto px-4 -mt-2 flex flex-col gap-3.5 z-10">
        
        {/* ======================================================== */}
        {/* 1. ADMINISTRATOR DASHBOARD VIEW */}
        {/* ======================================================== */}
        {activeRole === 'admin' && (
          <div className="space-y-3.5">
            {/* JJSAK Policy Sections 2, 3, 8: Mandatory Account Prerequisites Banner */}
            {!prerequisites.canRegisterStudents && (
              <div className="bg-amber-950/90 text-amber-100 rounded-2xl p-4 border border-amber-600/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wide text-amber-300">
                        School Activation &amp; Prerequisites Policy Notice
                      </h4>
                      <span className="text-[10px] text-amber-200/80 block">
                        JJSAK Application Master Security &amp; Access Control Framework
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
                    Policy Enforced
                  </span>
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed">
                  As mandated by the JJSAK Access Control Policy, <strong>Student Admission &amp; Academic Ingestion</strong> remain locked until the required leadership accounts (Head of Institution &amp; Director of Academics) and at least one teacher account are created and activated.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${prerequisites.isHeadActive ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/80 border-amber-500/30 text-slate-300'}`}>
                    <div>
                      <span className="font-bold block">Head of Institution</span>
                      <span className="text-[10px] opacity-80">{prerequisites.isHeadActive ? 'Active' : 'Activation Required'}</span>
                    </div>
                    {prerequisites.isHeadActive ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${prerequisites.isDirectorAcademicsActive ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/80 border-amber-500/30 text-slate-300'}`}>
                    <div>
                      <span className="font-bold block">Director of Academics</span>
                      <span className="text-[10px] opacity-80">{prerequisites.isDirectorAcademicsActive ? 'Active' : 'Activation Required'}</span>
                    </div>
                    {prerequisites.isDirectorAcademicsActive ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${prerequisites.hasActiveTeacher ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/80 border-amber-500/30 text-slate-300'}`}>
                    <div>
                      <span className="font-bold block">Active Teacher ({prerequisites.activeTeacherCount})</span>
                      <span className="text-[10px] opacity-80">{prerequisites.hasActiveTeacher ? 'Active' : 'At least 1 Required'}</span>
                    </div>
                    {prerequisites.hasActiveTeacher ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-amber-300 font-semibold">
                    Missing Action: {prerequisites.missingMandatoryRequirements.join(' • ') || 'None'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('security_core')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Open User Management</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* School-Specific Welcome/Announcement Banner (Isolated per tenant) */}
            {currentTheme.banners?.showWelcomeBanner && (
              <div
                className="rounded-2xl p-3.5 shadow-xs text-white flex items-center justify-between gap-3 animate-in fade-in"
                style={{ backgroundColor: currentTheme.primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-white/80 tracking-wider">
                      {currentTheme.schoolName} Announcement
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {currentTheme.banners.welcomeBannerText || currentTheme.motto}
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold shrink-0 text-white">
                  {currentTheme.schoolCode}
                </span>
              </div>
            )}

            {/* Quick KPI Stats Bar */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Learners</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{analytics.totalLearners}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Enrolled</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">School Mean</span>
                <div
                  className="text-xl font-black mt-0.5"
                  style={{ color: currentTheme.primaryColor }}
                >
                  {analytics.schoolMean}%
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  {analytics.schoolOverallGrade} (ME)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</span>
                <div className="text-xl font-black text-sky-700 mt-0.5">{analytics.passRate}%</div>
                <span className="text-[10px] text-slate-500 font-medium">ME + EE Bands</span>
              </div>
            </div>

            {/* Official JJSAK Installable Application & Staff Distribution Banner (Rules §1-17) */}
            {onOpenDownloadAppModal && (
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-red-300 uppercase tracking-wider">
                        Official Application Distribution
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Windows • Android • Tablet
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      Install {currentTheme.schoolName} JJSAK App
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      Standalone offline-ready app for teachers and school staff. Includes official school installation link &amp; staff onboarding credentials dossier.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenDownloadAppModal}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get App &amp; Staff Links</span>
                </button>
              </div>
            )}

            {/* Final JJSAK Master Architecture & Governance Blueprint Banner - SCMH 2.X: Super Admin / Owner ONLY */}
            {isOwnerOrSuperAdmin(currentUser) && (
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-lg border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        27-Phase Master Architecture
                      </h4>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800">
                        Owner Platform Layer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">
                      Owner &amp; Governance • 5 Data Entry Channels • Dual Timetable • Communication Hub
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('master_architecture')}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shrink-0 shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1"
                >
                  <span>View Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Teacher Assessment Marks Entry Banner */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-white">Enter Assessment Marks</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900">
                      Mobile & PC
                    </span>
                  </div>
                  <p className="text-[11px] text-red-100 font-medium leading-snug">
                    Record raw scores, auto-convert & submit results
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenMarksEntry) onOpenMarksEntry();
                  else onNavigate('assessments');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-[#C51E28] hover:bg-red-50 text-xs font-black shrink-0 shadow-md active:scale-95 transition cursor-pointer"
              >
                Start Entry
              </button>
            </div>

            {/* Core Administrator Functional Grid Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Results & Performance Analytics */}
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-red-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#C51E28] flex items-center justify-center group-hover:bg-[#C51E28] group-hover:text-white transition">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-[#C51E28] bg-red-50 px-1.5 py-0.5 rounded-md">
                    Analytics
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Results & Analytics</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    CBE Means & Champions
                  </p>
                </div>
              </button>

              {/* Card 2: Pathway Finder */}
              <button
                type="button"
                onClick={() => onNavigate('pathways')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                    CBE Senior
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Pathway Finder</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    STEM, Arts & Social Tracks
                  </p>
                </div>
              </button>

              {/* Card 3: Intelligent Timetabling */}
              <button
                type="button"
                onClick={() => onNavigate('timetabling')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-amber-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    Zero Clashes
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Intelligent Timetable</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Master, class & teacher loads
                  </p>
                </div>
              </button>

              {/* Card 4: Free Assessment Generator */}
              <button
                type="button"
                onClick={() => onNavigate('assessment_generator')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-purple-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                    Free Maker
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Assessment Generator</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Test papers, schemes & rubrics
                  </p>
                </div>
              </button>

              {/* Card 5: Core Data Entry Hub (5 Ingestion Modes) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenDataEntryHub) onOpenDataEntryHub();
                  else if (onOpenBulkUpload) onOpenBulkUpload();
                  else onNavigate('import_export');
                }}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-emerald-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    5 Modes
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Data Entry Hub</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Individual, Register, Marks, Bulk, Photo
                  </p>
                </div>
              </button>

              {/* Card 6: Official Reports & Broadsheets (Phase 8 Master Suite) */}
              <button
                type="button"
                onClick={() => onNavigate('reports_hub')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-red-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#C51E28] flex items-center justify-center group-hover:bg-[#C51E28] group-hover:text-white transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md">
                    Phase 8 Hub
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Reports &amp; Analytics Hub</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Report Cards, Broadsheets &amp; AI Intelligence
                  </p>
                </div>
              </button>

              {/* Card 6B: Phase 5 Academic Operations Hub */}
              <button
                type="button"
                onClick={() => onNavigate('academic_hub')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    Phase 5 Hub
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Academic Operations</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Grading Engine, Assessment Matrix &amp; Deadlines
                  </p>
                </div>
              </button>

              {/* Card 6C: Phase 6 Learner Welfare & Student Management Hub */}
              <button
                type="button"
                onClick={() => onNavigate('learner_welfare_hub')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    Phase 6 Hub
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Learner Welfare &amp; Roll</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Attendance, Discipline, Clinic, OVC &amp; Transfers
                  </p>
                </div>
              </button>

              {/* Card 6C-2: Phase 7 Academic Structure Hub */}
              <button
                type="button"
                onClick={() => onNavigate('academic_structure_hub')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    Phase 7 Hub
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Academic Structure Hub</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Curriculum, Streams, Allocations &amp; Validation
                  </p>
                </div>
              </button>

              {/* Card 6D: Communication & Distribution Hub */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenCommunicationHub) onOpenCommunicationHub();
                  else onNavigate('communication_hub');
                }}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-purple-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                    SMS &amp; Alerts
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Communication Hub</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Parent SMS Broadcasts &amp; Staff Notices
                  </p>
                </div>
              </button>

              {/* Card 7: Students Management */}
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-red-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Learner Records</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    {students.length} Registered Learners
                  </p>
                </div>
              </button>

              {/* Card 8: Teachers & Staff */}
              <button
                type="button"
                onClick={() => onNavigate('teachers')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-red-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Teacher Allocations</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    {teachers.length} Active Staff Members
                  </p>
                </div>
              </button>

              {/* Card 9: School Profile */}
              <button
                type="button"
                onClick={() => onNavigate('school_profile')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-red-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#C51E28] flex items-center justify-center group-hover:bg-[#C51E28] group-hover:text-white transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    Official
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">School Profile</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Logo, Stamp & Info
                  </p>
                </div>
              </button>

              {/* Card 10: School Subscription */}
              <button
                type="button"
                onClick={() => onNavigate('subscription')}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-emerald-300 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    License
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Subscription & Trial</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    1-Term Trial & Licensing
                  </p>
                </div>
              </button>

              {/* Card 11B: Learner Identity & Portal Reconciliation */}
              <button
                type="button"
                onClick={() => setIsReconciliationOpen(true)}
                className="bg-white text-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200 hover:border-cyan-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-700 group-hover:text-white transition">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                    Identity &amp; Profile Link
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition leading-tight">
                    Learner Identity &amp; Portal Reconciliation
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                    Fix orphaned accounts, link learnerId to official admission records &amp; audit security tokens
                  </p>
                </div>
              </button>

              {/* Card 11: Security Core & Foundation (Phase 1) - SCMH 2.X: Super Admin / Owner ONLY */}
              {isOwnerOrSuperAdmin(currentUser) && (
                <button
                  type="button"
                  onClick={() => onNavigate('security_core')}
                  className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-xs border border-slate-800 hover:border-red-400 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer min-h-[115px] group col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#C51E28] text-white flex items-center justify-center group-hover:scale-105 transition">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black text-red-300 bg-red-950 px-2 py-0.5 rounded-md border border-red-800">
                      Platform Governance • Super Admin ONLY
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-300 transition leading-tight">
                      Security Core &amp; Multi-Tenant Hub
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5 leading-snug">
                      Multi-School Tenants, RBAC Matrix, Immutable Audit Logs, AES-256 Backups &amp; KDPA Compliance
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Quick Tool: Score Converter */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-3 border border-red-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C51E28] text-white flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Score to 100% Converter</h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Convert raw scores (/30, /50, /80) to CBE % & Sublevel Grades
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreConverter(true)}
                className="px-3 py-1 bg-white text-[#C51E28] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition cursor-pointer shadow-xs"
              >
                Convert
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. TEACHER DASHBOARD VIEW */}
        {/* ======================================================== */}
        {activeRole === 'teacher' && (
          <div className="space-y-3.5">
            {/* Teacher Profile Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#C51E28] font-black text-sm flex items-center justify-center border border-red-200">
                  {getTeacherInitials(currentTeacher?.name)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentTeacher?.name || 'Teacher'}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {currentTeacher?.role || 'Staff'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Subjects: {currentTeacher?.subjects.join(', ')}
                  </div>
                </div>
              </div>

              {/* Switch Teacher Dropdown */}
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({getTeacherInitials(t.name)})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action: Enter Marks for My Subjects */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-[#C51E28]" />
                  <span>My Allocated Subjects & Quick Entry</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">Term 2 Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentTeacher?.subjects.map((sub) => (
                  <div
                    key={sub}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sub}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        All G7 & G8 Streams
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onOpenMarksEntry) onOpenMarksEntry();
                        else onNavigate('assessments');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#C51E28] hover:bg-red-700 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                    >
                      Enter Marks →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Quick Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onNavigate('timetabling')}
                className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-amber-400 transition cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-amber-600 mb-1.5" />
                <div className="font-bold text-xs text-slate-900">My Timetable</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Weekly lessons & free slots</div>
              </button>

              <button
                onClick={() => onNavigate('assessment_generator')}
                className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-purple-300 transition cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-purple-600 mb-1.5" />
                <div className="font-bold text-xs text-slate-900">Make Test Paper</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Questions & KICD rubrics</div>
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-red-300 transition cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 text-red-600 mb-1.5" />
                <div className="font-bold text-xs text-slate-900">Subject Analytics</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">View means & best learners</div>
              </button>

              <button
                onClick={() => onNavigate('pathways')}
                className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-blue-300 transition cursor-pointer"
              >
                <Compass className="w-5 h-5 text-blue-600 mb-1.5" />
                <div className="font-bold text-xs text-slate-900">Pathway Advisor</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Senior school guidance</div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. LEARNER / STUDENT DASHBOARD VIEW */}
        {/* ======================================================== */}
        {activeRole === 'learner' && (
          <LearnerPortalDashboard
            currentUser={currentUser || {
              id: 'usr-student-001',
              username: 'student.preview',
              fullName: currentStudent?.name || 'Jane Wanjiku',
              email: 'jane.wanjiku@school.sc.ke',
              role: 'STUDENT',
              schoolId: currentSchoolId,
              learnerId: currentStudent?.id || students[0]?.id || 'st-001',
              active: true,
            }}
            activeTenantId={currentSchoolId}
            students={students}
            teachers={teachers}
            users={users}
            onOpenReportCard={(st) => {
              if (onSelectStudent) onSelectStudent(st);
              onNavigate('student_report');
            }}
            onOpenReconciliation={() => setIsReconciliationOpen(true)}
          />
        )}

        {/* ======================================================== */}
        {/* 4. PARENT DASHBOARD VIEW */}
        {/* ======================================================== */}
        {activeRole === 'parent' && currentStudent && (
          <div className="space-y-3.5">
            {/* Ward Selector Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200">
                  {currentStudent.avatarInitials}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentStudent.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Child / Ward
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {currentStudent.classArm} • Adm: <span className="font-bold text-slate-700">{currentStudent.admNo}</span>
                  </div>
                </div>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.classArm})
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Information Card (EDITABLE) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C51E28] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Parent / Guardian Information</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Contact details for SMS alerts & report cards</p>
                  </div>
                </div>

                {!isEditingParent ? (
                  <button
                    type="button"
                    onClick={() => {
                      setParentNameInput(
                        currentStudent.parentName ||
                        currentStudent.fatherName ||
                        currentStudent.guardianName ||
                        currentStudent.motherName ||
                        'Mr. David Mwangi'
                      );
                      setParentPhoneInput(
                        currentStudent.parentPhone ||
                        currentStudent.parentPhone1 ||
                        '+254 722 345 678'
                      );
                      setIsEditingParent(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-[#C51E28] text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-red-200"
                    title="Edit Parent Name and Phone Number"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Info</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingParent(false)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Success Alert Banner */}
              {parentSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{parentSuccessMsg}</span>
                </div>
              )}

              {/* Editable Form vs View Mode */}
              {isEditingParent ? (
                <form onSubmit={handleSaveParentInfo} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Parent / Guardian Name</span>
                    </label>
                    <input
                      type="text"
                      value={parentNameInput}
                      onChange={(e) => setParentNameInput(e.target.value)}
                      placeholder="e.g. Mr. David Mwangi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Parent Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={parentPhoneInput}
                      onChange={(e) => setParentPhoneInput(e.target.value)}
                      placeholder="e.g. +254 722 345 678"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition font-mono"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Used for SMS result dispatch, official notices and term reports.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Parent Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingParent(false)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Parent / Guardian Name</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">
                        {currentStudent.parentName || currentStudent.fatherName || currentStudent.guardianName || currentStudent.motherName || 'Mr. David Mwangi'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Parent Phone Number</span>
                      <span className="font-bold text-slate-900 text-sm font-mono block mt-0.5">
                        {currentStudent.parentPhone || currentStudent.parentPhone1 || '+254 722 345 678'}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Links */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href={`tel:${currentStudent.parentPhone || currentStudent.parentPhone1 || '+254722345678'}`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Parent</span>
                    </a>
                    <a
                      href={`sms:${currentStudent.parentPhone || currentStudent.parentPhone1 || '+254722345678'}`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send SMS</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Ward Academic Summary Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-900">Ward Performance Summary ({currentStudent.name})</h3>
                <span className="text-xs font-bold text-[#C51E28]">{currentStudent.avgScore}% ({currentStudent.overallGrade})</span>
              </div>

              <div className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                &ldquo;{currentStudent.classTeacherComment}&rdquo;
                <div className="text-[10px] font-bold text-slate-500 not-italic mt-1 text-right">
                  — {currentStudent.classTeacherName} (Class Teacher)
                </div>
              </div>

              {/* Next Term Opening */}
              <div className="flex items-center justify-between bg-red-50 border border-red-100 p-2.5 rounded-xl text-xs">
                <span className="font-bold text-[#C51E28] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Next Term Resumes:</span>
                </span>
                <span className="font-bold text-slate-800">{currentStudent.nextTermDate}</span>
              </div>
            </div>

            {/* Direct Report Download & Pathway */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onSelectStudent) onSelectStudent(currentStudent);
                  onNavigate('student_report');
                }}
                className="p-3 bg-[#C51E28] text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-red-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectStudent) onSelectStudent(currentStudent);
                  onNavigate('pathways');
                }}
                className="p-3 bg-blue-900 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-blue-950"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Pathway Guidance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Learner Reconciliation Modal */}
      {isReconciliationOpen && (
        <LearnerReconciliationModal
          isOpen={isReconciliationOpen}
          onClose={() => setIsReconciliationOpen(false)}
          users={users}
          students={students}
          tenants={tenants}
          activeTenantId={currentSchoolId}
          currentUser={currentUser || {
            id: 'usr-admin-001',
            username: 'admin',
            fullName: 'School Administrator',
            role: 'SUPER_ADMIN',
            schoolId: currentSchoolId,
            active: true,
          }}
          onUpdateUser={onUpdateUser || (() => {})}
          onAddUser={onAddUser}
        />
      )}

      {/* Score Converter Modal */}
      {showScoreConverter && (
        <ScoreConverterModal
          isOpen={showScoreConverter}
          onClose={() => setShowScoreConverter(false)}
        />
      )}
    </div>
  );
};
