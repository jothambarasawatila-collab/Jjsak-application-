import React, { useState } from 'react';
import {
  ArrowLeft,
  School,
  Award,
  Save,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  RotateCcw,
  Building2,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Download,
  ChevronRight as ChevronRightIcon,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { SchoolInfo, User, ActiveScreen } from '../types';
import {
  CBC_GRADING_SCHEME,
  AVAILABLE_YEARS,
  INITIAL_USERS,
  getDefaultNextTermDate,
  getDefaultTermOpeningDate,
  getDefaultTermClosingDate,
} from '../data/mockData';
import { isOwnerOrSuperAdmin } from '../utils/platformGovernance';
import {
  ROLE_ASSIGNMENT_RULES,
  institutionalRoleGovernanceService,
} from '../services/institutionalRoleGovernanceService';

interface SettingsScreenProps {
  schoolInfo: SchoolInfo;
  currentUser?: User;
  users?: User[];
  onSwitchUser?: (user: User) => void;
  onNavigate?: (screen: ActiveScreen) => void;
  onOpenDownloadApp?: () => void;
  onOpenRoleGovernance?: () => void;
  onUpdateSchoolInfo: (info: SchoolInfo, syncToStudents?: boolean) => void;
  onBack: () => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  schoolInfo,
  currentUser = INITIAL_USERS[0],
  users = INITIAL_USERS,
  onSwitchUser,
  onNavigate,
  onOpenDownloadApp,
  onOpenRoleGovernance,
  onUpdateSchoolInfo,
  onBack,
  onResetData,
}) => {
  const [name, setName] = useState(schoolInfo.name);
  const [motto, setMotto] = useState(schoolInfo.motto || 'Smart. Simple. Accurate. Assessment reporting made easy.');
  const [year, setYear] = useState<number>(schoolInfo.year || 2026);
  const [term, setTerm] = useState(schoolInfo.term || 'Term 2, 2026');
  const [termStartDate, setTermStartDate] = useState(
    schoolInfo.termStartDate || getDefaultTermOpeningDate(schoolInfo.term, schoolInfo.year || 2026)
  );
  const [termEndDate, setTermEndDate] = useState(
    schoolInfo.termEndDate || getDefaultTermClosingDate(schoolInfo.term, schoolInfo.year || 2026)
  );
  const [nextTermOpenDate, setNextTermOpenDate] = useState(
    schoolInfo.nextTermOpenDate || getDefaultNextTermDate(schoolInfo.term, schoolInfo.year || 2026)
  );
  const [headOfInstitution, setHeadOfInstitution] = useState(
    schoolInfo.headOfInstitution || schoolInfo.headTeacher || 'Mrs. J. Barasa'
  );
  const [syncToStudents, setSyncToStudents] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Extract term number (Term 1, Term 2, Term 3)
  const currentTermNumber = term.includes('Term 1') ? 'Term 1' : term.includes('Term 3') ? 'Term 3' : 'Term 2';

  const handleSelectYear = (newYear: number) => {
    setYear(newYear);
    const newTerm = `${currentTermNumber}, ${newYear}`;
    setTerm(newTerm);
    setTermStartDate(getDefaultTermOpeningDate(newTerm, newYear));
    setTermEndDate(getDefaultTermClosingDate(newTerm, newYear));
    setNextTermOpenDate(getDefaultNextTermDate(newTerm, newYear));
  };

  const handleSelectTermNumber = (tNum: 'Term 1' | 'Term 2' | 'Term 3') => {
    const newTerm = `${tNum}, ${year}`;
    setTerm(newTerm);
    setTermStartDate(getDefaultTermOpeningDate(newTerm, year));
    setTermEndDate(getDefaultTermClosingDate(newTerm, year));
    setNextTermOpenDate(getDefaultNextTermDate(newTerm, year));
  };

  const handleAutoFillDates = () => {
    setTermStartDate(getDefaultTermOpeningDate(term, year));
    setTermEndDate(getDefaultTermClosingDate(term, year));
    setNextTermOpenDate(getDefaultNextTermDate(term, year));
    setToast('Dates auto-calculated for Kenya CBC academic calendar!');
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(
      {
        ...schoolInfo,
        name,
        motto,
        year: Number(year) || 2026,
        term,
        termStartDate,
        termEndDate,
        nextTermOpenDate,
        headOfInstitution,
        headTeacher: headOfInstitution,
      },
      syncToStudents
    );
    setToast(
      syncToStudents
        ? `Configuration & term dates updated and synced to all students!`
        : `School configuration saved!`
    );
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-bold text-white tracking-tight">Academic Settings</h1>
        <div className="w-9" />
      </div>

      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Card 1: Academic Year & Term Dates Configuration */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C51E28]" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Academic Year & Term Dates
                </h2>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-[#C51E28] border border-red-100">
                {year} • {currentTermNumber}
              </span>
            </div>

            {/* Academic Year Selector with Stepper & Auto Year Pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Academic Year
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Select year or use stepper
                </span>
              </div>

              {/* Year Stepper & Input */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSelectYear(Math.max(2020, year - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                  title="Previous Year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="2020"
                    max="2040"
                    value={year}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        handleSelectYear(val);
                      }
                    }}
                    className="w-full text-center font-mono font-black text-base py-2 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C51E28]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">
                    Year
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectYear(Math.min(2040, year + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                  title="Next Year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Year Pill Selector (2024 to 2032) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {AVAILABLE_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                      year === y
                        ? 'bg-[#C51E28] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Term Selector Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Current Term
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['Term 1', 'Term 2', 'Term 3'] as const).map((tNum) => (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() => handleSelectTermNumber(tNum)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                      currentTermNumber === tNum
                        ? 'bg-[#C51E28] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tNum}</span>
                    <span className={`text-[10px] font-medium ${currentTermNumber === tNum ? 'text-red-100' : 'text-slate-400'}`}>
                      {year}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Term Label Override */}
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Term 2, 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
              />
            </div>

            {/* Term Dates Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C51E28]" />
                  <span className="text-[11px] font-bold text-slate-800">
                    Term Calendar Dates
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDates}
                  className="text-[10px] font-bold text-[#C51E28] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-calculate Dates</span>
                </button>
              </div>

              {/* Term Start and End Dates Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Term Opening Date
                  </label>
                  <input
                    type="text"
                    value={termStartDate}
                    onChange={(e) => setTermStartDate(e.target.value)}
                    placeholder="e.g. 6th May 2026"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C51E28]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Term Closing Date
                  </label>
                  <input
                    type="text"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                    placeholder="e.g. 1st August 2026"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C51E28]"
                  />
                </div>
              </div>

              {/* Next Term Opening Date (Displayed on Report Cards) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-700">
                    Next Term Opening Date <span className="text-[#C51E28] font-bold">*Printed on Report Card</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={nextTermOpenDate}
                  onChange={(e) => setNextTermOpenDate(e.target.value)}
                  placeholder="e.g. 5th August 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                />
              </div>
            </div>

            {/* Sync checkbox */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToStudents}
                onChange={(e) => setSyncToStudents(e.target.checked)}
                className="mt-0.5 rounded text-[#C51E28] focus:ring-[#C51E28] cursor-pointer"
              />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-800 block">
                  Automatically sync to all student report cards
                </span>
                <span className="text-[10px] text-slate-500">
                  Updates academic term, year ({year}), and next term opening date across all active student profiles.
                </span>
              </div>
            </label>
          </div>

          {/* Card 2: School Profile & Institutional Signatory */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <School className="w-4 h-4 text-[#C51E28]" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                School Profile & Endorsement
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                School Motto / Tagline
              </label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Head of Institution Name
              </label>
              <input
                type="text"
                value={headOfInstitution}
                onChange={(e) => setHeadOfInstitution(e.target.value)}
                placeholder="e.g. Mrs. J. Barasa (Head of Institution)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-[#C51E28] hover:bg-[#B31821] active:scale-[0.99] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save & Apply Academic Settings</span>
            </button>
          </div>
        </form>

        {/* Card 3: Institutional Management & Licensing */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#C51E28]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Institutional Profile & Subscription
            </h2>
          </div>

          {/* Security Core & Foundation Card (Phase 1) - SCMH 2.X: Super Admin / Owner ONLY */}
          {onNavigate && isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => onNavigate('security_core')}
              className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white transition text-left flex items-center justify-between gap-3 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C51E28] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition">
                      Security Core &amp; Multi-Tenant Hub
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800">
                      Platform Layer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Multi-school tenancy (P1.1), RBAC matrix, immutable audit trail &amp; AES-256 backup
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
            </button>
          )}

          {/* School Profile & Portal Theme Card */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('school_profile')}
              className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 hover:from-blue-50 hover:to-blue-100/60 border border-slate-200 hover:border-blue-300 transition text-left flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                      School Profile, Theme &amp; Branding Center
                    </h4>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      Multi-Tenant Isolated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Customize background colours, institutional logos, welcome/motto banners &amp; digital rubber stamps.
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </button>
          )}

          {/* Subscription & Licensing Card */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('subscription')}
              className="p-3.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 transition text-left flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-emerald-950">
                      Subscriptions
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
                      Approved Framework
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    1-Term Free Trial &amp; KES 60 / Learner / Year Approved Model
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          )}
        </div>

        {/* Card 4: Institutional Identity & Role Integrity (JJSAK Policy §1) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C51E28]" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Institutional Identity &amp; Role Integrity
              </h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
              JJSAK Policy §1 Enforced
            </span>
          </div>

          {currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'SYSTEM_ADMIN' ? (
            /* Institutional Staff View: Self-Service Role Switching Prohibited (§1) */
            <div className="space-y-3">
              {/* Authenticated User Status Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>Institutional Role:</span>
                      <span className="font-bold px-1.5 py-0.2 rounded bg-red-100 text-[#C51E28]">
                        {currentUser.role}
                      </span>
                      <span>• {currentUser.employeeNumber || currentUser.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>Role Locked by Governance</span>
                </div>
              </div>

              {/* Policy Enforcement Statement */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Institutional Role Integrity Rule (§1)</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Users within a school institution shall not have the ability to change, upgrade, downgrade, assign, or switch their own roles from one position to another. All role modifications require authorized approver verification, permission validation, and immutable audit logging.
                </p>
                <div className="pt-1.5 border-t border-red-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Authorized Approver for Your Role:</span>
                  <strong className="text-red-900 font-bold">
                    {ROLE_ASSIGNMENT_RULES[currentUser.role]?.authorizedApproverDescription ||
                      'Head of Institution / Super Admin'}
                  </strong>
                </div>
              </div>

              {/* Authorized Management Officer Action */}
              {institutionalRoleGovernanceService.canUserManageRoleAssignment(currentUser) && onOpenRoleGovernance && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    You hold institutional role governance authority:
                  </span>
                  <button
                    type="button"
                    id="settings-open-role-governance-btn"
                    onClick={onOpenRoleGovernance}
                    className="px-3.5 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Open Role Governance Center</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Super Administrator / Platform Owner View */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Super Administrator Diagnostic View Switcher. Platform owners may simulate school personnel views for testing. All formal role modifications must be routed through the Governance Center.
                </p>
                {onOpenRoleGovernance && (
                  <button
                    type="button"
                    onClick={onOpenRoleGovernance}
                    className="px-3 py-1.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Role Governance Center</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map((u) => {
                  const isSelected = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSwitchUser && onSwitchUser(u)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-50/80 border-[#C51E28] ring-1 ring-[#C51E28]'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {u.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                          <span className="font-semibold px-1 py-0.2 rounded bg-slate-200 text-slate-800">
                            {u.role}
                          </span>
                          <span>{u.employeeNumber || u.username}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <UserCheck className="w-4 h-4 text-[#C51E28] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* School Standalone Offline App & Login Kit */}
        {onOpenDownloadApp && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  School Offline App & Login Pack
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Authorized Institution
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Download the standalone self-contained offline application runner and staff login credentials sheet configured specifically for <strong>{schoolInfo.name}</strong>.
            </p>
            <button
              type="button"
              onClick={onOpenDownloadApp}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Standalone App & Staff Login Kit</span>
            </button>
          </div>
        )}

        {/* Grading Scale Standards */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C51E28]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                CBC Assessment Grading Scheme
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#C51E28]">
              8 Levels
            </span>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            {CBC_GRADING_SCHEME.map((band) => (
              <div
                key={band.grade}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-red-50/40 border border-slate-100 text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-10 text-center font-black text-xs py-0.5 px-1.5 rounded-lg bg-[#C51E28] text-white">
                    {band.grade}
                  </span>
                  <span className="font-bold text-slate-700 text-xs">
                    {band.level}
                  </span>
                </div>
                <span className="font-bold text-slate-900 font-mono text-xs">
                  {band.min}% – {band.max}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Database option */}
        <button
          type="button"
          onClick={onResetData}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Portal Data to Defaults</span>
        </button>
      </div>
    </div>
  );
};
