import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  FileText,
  Bell,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';
import { User as UserType, Student, Teacher, JWTSession } from '../../types';
import {
  fetchAuthorizedLearnerData,
} from '../../services/learnerPortalService';
import { LearnerPortalData, LearnerPortalAccessResult } from '../../types/learnerPortal';

interface LearnerPortalDashboardProps {
  currentUser: UserType;
  jwtSession?: JWTSession | null;
  activeTenantId: string;
  students: Student[];
  teachers?: Teacher[];
  users?: UserType[];
  onOpenReportCard?: (student: Student) => void;
  onOpenReconciliation?: () => void;
  onLogAudit?: (actionType: any, details: string) => void;
}

export const LearnerPortalDashboard: React.FC<LearnerPortalDashboardProps> = ({
  currentUser,
  jwtSession,
  activeTenantId,
  students,
  teachers = [],
  users: _users = [],
  onOpenReportCard,
  onOpenReconciliation,
  onLogAudit: _onLogAudit,
}) => {
  const isStudentUser = currentUser.role === 'STUDENT';
  const isAdminOrTeacher = !isStudentUser;

  // Administrative Preview Mode selection (ONLY available to Admin/Faculty)
  const [adminPreviewStudentId, setAdminPreviewStudentId] = useState<string>(
    currentUser.learnerId || students[0]?.id || ''
  );

  // Partial widget failure simulation state (for testing Section 8 & Acceptance Test 10)
  const [simulateFailures, setSimulateFailures] = useState<{
    attendance?: boolean;
    timetable?: boolean;
    academicResults?: boolean;
    assignments?: boolean;
    announcements?: boolean;
  }>({});
  const [showSimControls, setShowSimControls] = useState(false);

  // Loading & Data States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [portalData, setPortalData] = useState<LearnerPortalData | null>(null);
  const [accessResult, setAccessResult] = useState<LearnerPortalAccessResult | null>(null);
  const [widgetErrors, setWidgetErrors] = useState<Record<string, string>>({});

  // Active Tab within Learner Portal
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'timetable' | 'assignments' | 'notices'>('overview');

  // Load Data with Authorization
  const loadData = () => {
    setIsLoading(true);

    // Simulate network latency (250ms) to ensure clean loading state rendering
    setTimeout(() => {
      try {
        const result = fetchAuthorizedLearnerData(
          currentUser,
          jwtSession || null,
          activeTenantId,
          students,
          teachers,
          {
            previewStudentId: isStudentUser ? undefined : adminPreviewStudentId,
            simulatedWidgetFailures: simulateFailures,
          }
        );

        setPortalData(result.data);
        setAccessResult(result.accessResult);
        setWidgetErrors(result.widgetErrors);
      } catch (err: any) {
        setAccessResult({
          authorized: false,
          errorType: 'API_FETCH_FAILURE',
          message: 'We could not load your learner information. Please try again or contact the school administrator.',
          technicalDetails: err?.message || 'Unknown internal service exception.',
        });
        setPortalData(null);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  useEffect(() => {
    loadData();
  }, [currentUser, activeTenantId, adminPreviewStudentId, students, teachers, simulateFailures]);

  // Current matched student record for Report Card export
  const activeStudent = useMemo(() => {
    if (!portalData) return null;
    return students.find((s) => s.id === portalData.profile.learnerId) || null;
  }, [portalData, students]);

  // -------------------------------------------------------------
  // 1. LOADING STATE (Section 7)
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#C51E28] flex items-center justify-center mx-auto border border-red-100">
          <GraduationCap className="w-8 h-8 animate-bounce" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-slate-900">Loading your learner profile...</h3>
          <p className="text-xs text-slate-500">
            Authorizing session identity and loading your official CBC academic records...
          </p>
        </div>
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="h-28 bg-slate-100 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. NO PROFILE LINK STATE (Section 7 & Acceptance Test 7)
  // -------------------------------------------------------------
  if (accessResult?.errorType === 'NO_PROFILE_LINK') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 md:p-8 shadow-xs text-left space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  Account Verification Notice
                </span>
                <span className="text-[10px] text-amber-700 font-mono">Code: JJSAK-ERR-LINK-01</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-amber-950">
                Your learner profile has not yet been linked to your learner account. Please contact the school administrator.
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl pt-1">
                Your login credential is valid, but it has not been bound to an official student admission profile in the school registry. To protect student data privacy and maintain academic integrity, access to grades, timetables, and assessments requires an authorized profile link.
              </p>
            </div>
          </div>

          {/* Account Diagnostics Card */}
          <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Logged-in User</span>
              <strong className="text-slate-900">{currentUser.fullName}</strong>
              <div className="text-[10px] text-slate-500 font-mono">@{currentUser.username}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Role</span>
              <strong className="text-amber-800 font-bold">{currentUser.role}</strong>
              <div className="text-[10px] text-slate-500">Learner Portal Gateway</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">School / Tenant</span>
              <strong className="text-slate-900">Ngonyek Junior School</strong>
              <div className="text-[10px] text-slate-500 font-mono">{currentUser.schoolId || activeTenantId}</div>
            </div>
          </div>

          {/* Actions & Next Steps */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-amber-800">
              Need assistance? Visit the Academic Registry or contact the Head of Institution.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Status Again</span>
              </button>

              {isAdminOrTeacher && onOpenReconciliation && (
                <button
                  type="button"
                  onClick={onOpenReconciliation}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Admin: Link This Account Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. API / TENANT / PERMISSION ERROR STATE (Section 7 & 9)
  // -------------------------------------------------------------
  if (!accessResult?.authorized || !portalData) {
    const isTenantError = accessResult?.errorType === 'TENANT_MISMATCH';

    return (
      <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 md:p-8 shadow-xs text-left space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#C51E28] flex items-center justify-center shrink-0 border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              {isTenantError ? 'Tenant Security Boundary' : 'System Notice'}
            </span>
            <h3 className="text-base font-bold text-red-950">
              {accessResult?.message || 'We could not load your learner information. Please try again or contact the school administrator.'}
            </h3>
            {accessResult?.technicalDetails && (
              <p className="text-xs text-red-700/90 font-mono bg-white/70 p-2.5 rounded-xl border border-red-200 mt-2">
                Diagnostic: {accessResult.technicalDetails}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
          {isAdminOrTeacher && onOpenReconciliation && (
            <button
              type="button"
              onClick={onOpenReconciliation}
              className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-900 font-bold text-xs hover:bg-red-50 transition cursor-pointer"
            >
              Open Reconciliation Tool
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. SUCCESSFUL DASHBOARD STATE (Section 5 & Acceptance Tests 1-6)
  // -------------------------------------------------------------
  const { profile, attendance, academicResults, timetable, assignments, announcements } = portalData;

  return (
    <div className="space-y-4">
      {/* Administrative Inspection Banner (Visible ONLY to Staff previewing the portal) */}
      {isAdminOrTeacher && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Staff Inspection Mode</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Previewing official Learner Portal for: <strong className="text-slate-200">{profile.name}</strong> ({profile.admissionNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={adminPreviewStudentId}
              onChange={(e) => setAdminPreviewStudentId(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              title="Inspect another learner profile"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.admNo} - {st.classArm})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowSimControls(!showSimControls)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
              title="Toggle Widget Failure Simulator (Test 10)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Faults</span>
            </button>
          </div>
        </div>
      )}

      {/* Widget Failure Simulator Controls (Test 10 Testing Drawer) */}
      {isAdminOrTeacher && showSimControls && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>Acceptance Test 10: Partial Widget Failure Isolation Engine</span>
            </div>
            <button
              type="button"
              onClick={() => setSimulateFailures({})}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reset All to Normal
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulate offline microservices to verify that individual widget failures do NOT blank or crash the Learner Portal:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { key: 'attendance', label: 'Fail Attendance Service' },
              { key: 'timetable', label: 'Fail Timetable Service' },
              { key: 'academicResults', label: 'Fail Results Service' },
              { key: 'assignments', label: 'Fail Assignments Service' },
              { key: 'announcements', label: 'Fail Noticeboard Service' },
            ].map((item) => {
              const isFailed = (simulateFailures as any)[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSimulateFailures((prev) => ({
                      ...prev,
                      [item.key]: !isFailed,
                    }))
                  }
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                    isFailed
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isFailed ? 'bg-white' : 'bg-emerald-400'}`}></span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* WIDGET 1: LEARNER BIODATA & OFFICIAL PROFILE HEADER     */}
      {/* ------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-[#C51E28] font-black text-xl flex items-center justify-center border-2 border-red-200 shadow-xs shrink-0">
              {profile.avatarInitials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {profile.status} Learner
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {profile.grade} • {profile.classArm}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                <div>
                  Adm No: <strong className="text-slate-900 font-mono">{profile.admissionNumber}</strong>
                </div>
                <div className="hidden sm:inline">•</div>
                <div>
                  UPI: <strong className="text-slate-900 font-mono">{profile.upi}</strong>
                </div>
                <div className="hidden sm:inline">•</div>
                <div>
                  Class Teacher: <strong className="text-slate-900">{profile.classTeacherName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Report Card) */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {activeStudent && onOpenReportCard && (
              <button
                type="button"
                onClick={() => onOpenReportCard(activeStudent)}
                className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-[#C51E28] font-bold text-xs flex items-center gap-2 transition border border-red-200 cursor-pointer shadow-xs"
                title="View and download official Term 2 Report Card"
              >
                <FileText className="w-4 h-4" />
                <span>Download Report Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Learner Portal Navigation Tabs */}
        <div className="flex items-center gap-1 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: GraduationCap },
            { id: 'results', label: 'Academic Assessment', icon: Award },
            { id: 'timetable', label: 'Class Timetable', icon: Calendar },
            { id: 'assignments', label: 'Homework & Tasks', icon: BookOpen },
            { id: 'notices', label: 'Notices & Teachers', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C51E28] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW (Key Summary Metrics & Cards)          */}
      {/* ------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Top 3 KPI Cards with Fault Isolation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Academic Standing */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs relative">
              {widgetErrors.academicResults ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Results Service Error</span>
                    <span className="text-[11px]">{widgetErrors.academicResults}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Grade</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{academicResults.overallGrade}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {academicResults.avgScore}% Average
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Stream Rank: <strong className="text-slate-900">#{academicResults.streamRank || 1}</strong> • Grade Rank: <strong className="text-slate-900">#{academicResults.gradeRank || 2}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Attendance Register */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs relative">
              {widgetErrors.attendance ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Attendance Offline</span>
                    <span className="text-[11px]">{widgetErrors.attendance}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{attendance.overallPercentage}%</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {attendance.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Present: <strong className="text-slate-900">{attendance.presentDays}</strong> of {attendance.totalDays} academic days
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Today's Schedule */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs relative">
              {widgetErrors.timetable ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Timetable Offline</span>
                    <span className="text-[11px]">{widgetErrors.timetable}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{timetable.todayDay}'s Schedule</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{timetable.totalPeriodsToday} Periods</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    Next: <strong className="text-slate-900">{timetable.daySchedule[0]?.subject || 'Morning Assembly'}</strong> ({timetable.daySchedule[0]?.room || 'Hall'})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Quick Timetable Peek + Learning Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Performance List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C51E28]" />
                  <h3 className="font-bold text-xs text-slate-900">Junior Secondary Learning Areas</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className="text-xs text-[#C51E28] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View All Marks</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {academicResults.subjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No assessment results available.</div>
              ) : (
                <div className="space-y-2">
                  {academicResults.subjects.slice(0, 5).map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="font-bold text-slate-800">{sub.subject}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{sub.score}%</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            sub.grade.includes('EE')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Daily Timetable Peek */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs text-slate-900">Today's Timetable Schedule</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Full Week</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {timetable.daySchedule.slice(0, 4).map((p) => (
                  <div
                    key={p.period}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-black text-[10px] flex items-center justify-center">
                        P{p.period}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{p.subject}</div>
                        <div className="text-[10px] text-slate-500">{p.teacher} • {p.room}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class Teacher Remark Quote */}
          {profile.classTeacherComment && (
            <div className="p-4 rounded-3xl bg-red-50/70 border border-red-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-[#C51E28] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#C51E28] uppercase tracking-wider">
                  Class Teacher's Remark ({profile.classTeacherName})
                </span>
                <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                  "{profile.classTeacherComment}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* TAB 2: ACADEMIC RESULTS (Section 5 & Acceptance Test 3) */}
      {/* ------------------------------------------------------- */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C51E28]" />
                <span>Junior School CBC Assessment Results ({profile.term})</span>
              </h3>
              <p className="text-xs text-slate-500">Official Summative &amp; Formative Learning Area Marks</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                Average: {academicResults.avgScore}% ({academicResults.overallGrade})
              </span>
            </div>
          </div>

          {widgetErrors.academicResults ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
              {widgetErrors.academicResults}
            </div>
          ) : academicResults.subjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No results available for this term yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Subject / Learning Area</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Performance Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {academicResults.subjects.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.subject}</td>
                      <td className="py-3 px-3 text-center font-black text-slate-800">{sub.score}%</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            sub.grade.includes('EE')
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade.includes('ME')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{sub.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* TAB 3: CLASS TIMETABLE (Section 5 & Acceptance Test 4)  */}
      {/* ------------------------------------------------------- */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Authorized Class Timetable ({profile.grade} • {profile.classArm})</span>
              </h3>
              <p className="text-xs text-slate-500">Official scheduled instructional periods for today</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              {timetable.todayDay}
            </span>
          </div>

          {widgetErrors.timetable ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
              {widgetErrors.timetable}
            </div>
          ) : (
            <div className="space-y-2">
              {timetable.daySchedule.map((item) => (
                <div
                  key={item.period}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition ${
                    item.isDouble
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                      P{item.period}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{item.subject}</span>
                        {item.isDouble && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                            Double Lesson
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Instructor: <strong className="text-slate-700">{item.teacher}</strong> • Venue: <strong className="text-slate-700">{item.room}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* TAB 4: HOMEWORK & TASKS (Section 5)                     */}
      {/* ------------------------------------------------------- */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Homework, Projects &amp; CBE Tasks</span>
            </h3>
            <p className="text-xs text-slate-500">Assigned coursework for your active curriculum pathway</p>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm">{asg.title}</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      asg.status === 'GRADED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : asg.status === 'SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {asg.status} {asg.score !== undefined && `(${asg.score}/${asg.maxScore})`}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{asg.instructions}</p>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Subject: <strong className="text-slate-700">{asg.subject}</strong></span>
                  <span>Due: <strong className="text-slate-700">{asg.dueDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* TAB 5: NOTICES & FACULTY (Section 5)                    */}
      {/* ------------------------------------------------------- */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Announcements */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900">Official School Announcements</h3>
            </div>
            <div className="space-y-3">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{anc.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                      {anc.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{anc.content}</p>
                  <div className="text-[10px] text-slate-400 pt-1">
                    {anc.author} • {anc.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Faculty */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Assigned Faculty &amp; Subject Teachers</h3>
            </div>
            <div className="space-y-2">
              {portalData.assignedTeachers.map((tch) => (
                <div key={tch.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{tch.name}</div>
                    <div className="text-[10px] text-slate-500">{tch.role}</div>
                  </div>
                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[10px]">
                    {tch.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
