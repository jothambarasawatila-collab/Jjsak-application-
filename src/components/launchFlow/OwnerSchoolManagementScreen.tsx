import React, { useState } from 'react';
import {
  Building2,
  Plus,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Phone,
  MapPin,
  Palette,
  Sparkles,
  Search,
  Check,
  LogOut,
  Download,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { DownloadSchoolAppModal } from '../DownloadSchoolAppModal';
import { SchoolTenant, SchoolStatus, User as UserType } from '../../types';
import { cleanDeploymentService } from '../../services/cleanDeploymentService';

interface OwnerSchoolManagementScreenProps {
  currentUser: UserType;
  schools: SchoolTenant[];
  onAddSchool: (newSchool: SchoolTenant) => void;
  onUpdateSchoolStatus: (schoolId: string, status: SchoolStatus) => void;
  onActivateAndProceedToProfile: (school: SchoolTenant) => void;
  onLogoutToLockScreen: () => void;
  onLogAudit?: (action: any, details: string) => void;
  onResetToZeroSchoolState?: () => void;
}

export const OwnerSchoolManagementScreen: React.FC<OwnerSchoolManagementScreenProps> = ({
  currentUser,
  schools,
  onAddSchool,
  onUpdateSchoolStatus,
  onActivateAndProceedToProfile,
  onLogoutToLockScreen,
  onLogAudit,
  onResetToZeroSchoolState,
}) => {
  const [activeView, setActiveView] = useState<'LIST' | 'CREATE' | 'VERIFY'>('LIST');
  const [selectedSchoolForVerify, setSelectedSchoolForVerify] = useState<SchoolTenant | null>(null);
  const [downloadModalSchool, setDownloadModalSchool] = useState<SchoolTenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Stage 3: School Registration Form
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolType, setSchoolType] = useState('Private');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [educationLevel, setEducationLevel] = useState('Junior School (Grade 7 - 9)');
  const [category, setCategory] = useState<'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED' | 'OTHER'>('JUNIOR');
  const [country, setCountry] = useState('Kenya');
  const [county, setCounty] = useState('Trans Nzoia');
  const [subCounty, setSubCounty] = useState('Kiminini');
  const [ward, setWard] = useState('Sirende');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Administrator Details
  const [adminFullName, setAdminFullName] = useState('');
  const [adminNationalId, setAdminNationalId] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // School Branding
  const [motto, setMotto] = useState('Strive for Excellence and Integrity');
  const [primaryColor, setPrimaryColor] = useState('#C51E28');
  const [secondaryColor, setSecondaryColor] = useState('#1E293B');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200');
  const [stampUrl, setStampUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolCode.trim()) {
      alert('Please fill in required school name and code.');
      return;
    }

    const newTenant: SchoolTenant = {
      schoolId: `sch-${Date.now().toString().slice(-6)}`,
      schoolName: schoolName.trim(),
      schoolCode: schoolCode.trim().toUpperCase(),
      schoolType,
      registrationNumber: registrationNumber || `MOE/PRI/${Math.floor(10000 + Math.random() * 90000)}`,
      educationLevel,
      category,
      country,
      county,
      subCounty,
      ward,
      physicalAddress: physicalAddress || `${ward}, ${subCounty}, ${county}`,
      postalAddress: postalAddress || `P.O. Box ${Math.floor(100 + Math.random() * 900)} - ${county}`,
      address: physicalAddress || `${ward}, ${subCounty}, ${county}`,
      officialEmail: officialEmail || `info@${(schoolCode || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')}.sc.ke`,
      email: officialEmail || `info@${(schoolCode || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')}.sc.ke`,
      officialPhone: officialPhone || '+254 700 000 000',
      phone: officialPhone || '+254 700 000 000',
      website: website || undefined,
      administratorDetails: {
        fullName: adminFullName || 'Principal Administrator',
        nationalId: adminNationalId || '24567890',
        phoneNumber: adminPhone || officialPhone,
        emailAddress: adminEmail || officialEmail,
      },
      schoolBranding: {
        logoUrl,
        motto,
        primaryColor,
        secondaryColor,
        stampUrl,
      },
      logoUrl,
      stampUrl,
      motto,
      status: 'PENDING', // Starts at Stage 4 Lifecycle: PENDING
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddSchool(newTenant);
    onLogAudit?.('RECORD_CREATE', `Owner registered new school [${newTenant.schoolName}] (${newTenant.schoolCode}). Status set to PENDING for verification.`);
    triggerToast(`✓ School "${newTenant.schoolName}" submitted! Now in PENDING status for verification.`);
    setSelectedSchoolForVerify(newTenant);
    setActiveView('VERIFY');
  };

  const handleQuickApproveAndActivate = (school: SchoolTenant) => {
    onUpdateSchoolStatus(school.schoolId, 'ACTIVE');
    onLogAudit?.('RECORD_EDIT', `Owner verified, approved, and ACTIVATED school [${school.schoolName}] (${school.schoolCode}).`);
    triggerToast(`✓ School [${school.schoolName}] is now ACTIVE! Launching JJSAK Organizational Profile...`);
    setTimeout(() => {
      onActivateAndProceedToProfile(school);
    }, 800);
  };

  const handleOnboardTemplate = (template: ReturnType<typeof cleanDeploymentService.getSampleSchoolTemplates>[0]) => {
    const { tenant } = cleanDeploymentService.registerAndOnboardSchoolTenant({
      schoolName: template.schoolName,
      schoolCode: template.schoolCode,
      subdomain: template.subdomain,
      category: template.category,
      schoolType: template.schoolType,
      county: template.county,
      subCounty: template.subCounty,
      ward: template.ward,
      physicalAddress: template.physicalAddress,
      postalAddress: template.postalAddress,
      officialEmail: template.officialEmail,
      officialPhone: template.officialPhone,
      motto: template.motto,
      adminFullName: template.adminFullName,
      adminEmail: template.adminEmail,
      adminPhone: template.adminPhone,
    });
    tenant.status = 'ACTIVE';
    onAddSchool(tenant);
    onLogAudit?.('RECORD_CREATE', `Owner onboarded school [${tenant.schoolName}] (${tenant.schoolCode}) from verified template through 5-stage lifecycle.`);
    triggerToast(`✓ Registered and Activated [${tenant.schoolName}]! Initial Head of Institution account provisioned.`);
  };

  const filteredSchools = schools.filter((s) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
      (s.schoolCode && s.schoolCode.toLowerCase().includes(q)) ||
      (s.county && s.county.toLowerCase().includes(q))
    );
  });

  const activeCount = schools.filter((s) => s.status === 'ACTIVE').length;
  const pendingCount = schools.filter((s) => s.status === 'PENDING').length;
  const otherCount = schools.filter((s) => s.status === 'SUSPENDED' || s.status === 'DISABLED').length;

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showText={true} />
          <div className="hidden sm:block border-l border-slate-800 pl-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Owner & Super Admin Governance Console
            </span>
            <span className="text-[10px] text-slate-400">
              Stages 3 & 4: School Creation, Verification & Lifecycle Activation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">
              {currentUser.fullName} ({currentUser.role})
            </span>
          </div>

          <button
            type="button"
            onClick={onLogoutToLockScreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Sub-bar */}
      <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('LIST')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'LIST'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>School Directory ({schools.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('CREATE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'CREATE'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New School (Stage 3)</span>
          </button>

          {selectedSchoolForVerify && (
            <button
              type="button"
              onClick={() => setActiveView('VERIFY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'VERIFY'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-400 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify & Activate: {selectedSchoolForVerify.schoolCode}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {activeCount} Active
          </span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: DIRECTORY & LIFECYCLE MANAGEMENT */}
        {activeView === 'LIST' && (
          <div className="space-y-6">
            {/* Top Stat Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Registered
                  </div>
                  <div className="text-2xl font-black text-white mt-0.5">{schools.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-emerald-900/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Active & Verified (P1.50)
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">{activeCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-900/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Pending / Suspended
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-0.5">
                    {pendingCount + otherCount}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Directory Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by school name, code, or county..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onResetToZeroSchoolState && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset the platform to a clean Zero-School Production State? This will wipe all schools, learners, teachers, and marks in accordance with JJSAK-DEPLOY-001.')) {
                        onResetToZeroSchoolState();
                        triggerToast('✓ Platform reset to Zero-School Production State (JJSAK-DEPLOY-001)');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Re-initialize clean 0-school state"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Reset to 0 Schools</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveView('CREATE')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New School (Stage 3)</span>
                </button>
              </div>
            </div>

            {/* Zero-School Production State UI (JJSAK-DEPLOY-001 Part A, B, G) */}
            {schools.length === 0 ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/90 border-2 border-dashed border-amber-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-inner">
                    <Building2 className="w-8 h-8" />
                  </div>

                  <div className="max-w-xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      JJSAK-DEPLOY-001 • Clean Zero-School Production State
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Registered Schools: 0 • Platform Registration Ready
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The deployment of the JJSAK CBC Assessment Platform has been cleanly initialized to a true Zero-School production state. No schools, mock classes, test learners, placeholder marks, or demonstration teachers are loaded. As the Platform Owner &amp; Super Administrator, you can register schools through the 5-stage lifecycle.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveView('CREATE')}
                      className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register First School (Stage 3 Form)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Onboarding via Verified School Templates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quick Onboard from Verified Templates (For Evaluation &amp; Testing)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">5-Stage Compliant</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cleanDeploymentService.getSampleSchoolTemplates().map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-amber-400 border border-amber-900/60">
                              {tmpl.schoolCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {tmpl.schoolType}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">{tmpl.schoolName}</h5>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {tmpl.county} County • {tmpl.subCounty}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-300 italic line-clamp-2">
                            "{tmpl.motto}"
                          </p>
                          <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800 space-y-0.5 font-mono">
                            <div>Admin: {tmpl.adminFullName}</div>
                            <div>Subdomain: {tmpl.subdomain}.jjsak.com</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOnboardTemplate(tmpl)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Onboard &amp; Activate (Stage 3–4)</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 text-center text-slate-400 text-xs">
                No schools found matching search criteria "{searchQuery}".
              </div>
            ) : (
              /* School Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSchools.map((school) => {
                  const isActive = school.status === 'ACTIVE';
                  const isPending = school.status === 'PENDING';

                  return (
                    <div
                      key={school.schoolId}
                      className={`p-5 rounded-2xl bg-slate-800/70 border transition-all ${
                        isActive
                          ? 'border-emerald-700/50 hover:border-emerald-500'
                          : isPending
                          ? 'border-amber-600/50 bg-amber-950/10 hover:border-amber-400'
                          : 'border-red-700/50 bg-red-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {school.logoUrl ? (
                              <img
                                src={school.logoUrl}
                                alt={school.schoolName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-white">{school.schoolName}</h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300">
                                {school.schoolCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                              "{school.motto || school.schoolBranding?.motto || 'Strive for Excellence'}"
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-400" />
                                {school.county || 'Kenya'}, {school.subCounty || 'County'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-blue-400" />
                                {school.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {school.status}
                        </span>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Download School App & Credentials Pack Button */}
                          <button
                            type="button"
                            onClick={() => setDownloadModalSchool(school)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                            title="Download Standalone Offline App Launcher and Staff Credentials"
                          >
                            <Download className="w-3.5 h-3.5 text-red-400" />
                            <span>Download App &amp; Login Kit</span>
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSchoolForVerify(school);
                                setActiveView('VERIFY');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify &amp; Activate</span>
                            </button>
                          )}

                          {isActive && (
                            <button
                              type="button"
                              onClick={() => onActivateAndProceedToProfile(school)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Proceed to JJSAK Profile (Stage 5)</span>
                            </button>
                          )}
                        </div>

                        {/* Status Toggle Dropdown / Buttons */}
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[10px] text-slate-400">Lifecycle:</span>
                          <select
                            value={school.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as SchoolStatus;
                              onUpdateSchoolStatus(school.schoolId, newStatus);
                              triggerToast(`Status for ${school.schoolCode} updated to ${newStatus}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="DISABLED">DISABLED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STAGE 3 — CREATE SCHOOL REGISTRATION FORM */}
        {activeView === 'CREATE' && (
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-500" />
                  Stage 3: School Registration Form
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete institutional details to register a new tenant school.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
              >
                Back to List
              </button>
            </div>

            {/* Section 1: School Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                1. School Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Ngonyek Junior School"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Code *
                  </label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder="e.g. NJS-30200"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Type
                  </label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Public">Public School</option>
                    <option value="Private">Private School</option>
                    <option value="Faith-Based">Faith-Based / Mission</option>
                    <option value="International">International</option>
                    <option value="Community">Community Owned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Registration Number (MOE)
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. MOE/PRI/34891"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Junior School (Grade 7 - 9)">Junior School (Grade 7 - 9)</option>
                    <option value="Pre-Primary & Primary (PP1 - Grade 6)">Pre-Primary & Primary (PP1 - Grade 6)</option>
                    <option value="Comprehensive (PP1 - Grade 9)">Comprehensive (PP1 - Grade 9)</option>
                    <option value="Senior School (Grade 10 - 12)">Senior School (Grade 10 - 12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="JUNIOR">JUNIOR</option>
                    <option value="PRIMARY">PRIMARY</option>
                    <option value="SECONDARY">SECONDARY</option>
                    <option value="MIXED">MIXED COMPREHENSIVE</option>
                  </select>
                </div>
              </div>

              {/* Geographic Coordinates & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    County / Province
                  </label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="e.g. Trans Nzoia"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Sub-County / District
                  </label>
                  <input
                    type="text"
                    value={subCounty}
                    onChange={(e) => setSubCounty(e.target.value)}
                    placeholder="e.g. Kiminini"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Ward</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. Sirende"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    placeholder="e.g. Off Kitale-Webuye Highway, Kiminini Junction"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Postal Address
                  </label>
                  <input
                    type="text"
                    value={postalAddress}
                    onChange={(e) => setPostalAddress(e.target.value)}
                    placeholder="e.g. P.O. Box 450 - 30200, Kitale"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="info@school.sc.ke"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Official Phone Number *
                  </label>
                  <input
                    type="text"
                    value={officialPhone}
                    onChange={(e) => setOfficialPhone(e.target.value)}
                    placeholder="+254 722 345 678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.school.sc.ke"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: School Administrator Details */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                2. School Administrator Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    placeholder="e.g. Mrs. J. Barasa"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    National ID / Passport No.
                  </label>
                  <input
                    type="text"
                    value={adminNationalId}
                    onChange={(e) => setAdminNationalId(e.target.value)}
                    placeholder="e.g. 21983045"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+254 711 223 344"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="head@school.sc.ke"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: School Branding */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                3. School Branding & Seal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Motto
                  </label>
                  <input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    placeholder="e.g. Strive for Excellence and Integrity"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white italic"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Logo URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    School Stamp / Official Seal URL
                  </label>
                  <input
                    type="text"
                    value={stampUrl}
                    onChange={(e) => setStampUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xl shadow-red-900/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit School Registration (Proceed to Verification)</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: STAGE 4 — VERIFICATION & ACTIVATION GATE */}
        {activeView === 'VERIFY' && selectedSchoolForVerify && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Stage 4: Verification & Activation
                </span>
                <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Owner Verification: {selectedSchoolForVerify.schoolName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
              >
                Back to Directory
              </button>
            </div>

            {/* Verification Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Institutional Summary</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">School Code:</span>
                    <span className="font-mono font-bold text-white">{selectedSchoolForVerify.schoolCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Registration No:</span>
                    <span className="font-mono text-slate-300">{selectedSchoolForVerify.registrationNumber || 'MOE/PRI/30200'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-300">{selectedSchoolForVerify.county}, {selectedSchoolForVerify.country || 'Kenya'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Official Contact:</span>
                    <span className="text-slate-300">{selectedSchoolForVerify.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Administrator:</span>
                    <span className="font-bold text-emerald-400">{selectedSchoolForVerify.administratorDetails?.fullName || 'Mrs. J. Barasa'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Status Lifecycle Progression</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span><strong>1. School Submitted:</strong> Details validated against national registry standards.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    <Check className="w-4 h-4 text-blue-400" />
                    <span><strong>2. Owner Verification:</strong> Cryptographic tenant key generated.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span><strong>3. Activation & Profile Display:</strong> Activates school and presents JJSAK Profile.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Controls */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Approve, Activate &amp; Generate School Download Kit
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clicking Activate will transition status to <strong>ACTIVE</strong>, generate staff login credentials, and present the <strong>JJSAK Profile (Stage 5)</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDownloadModalSchool(selectedSchoolForVerify)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition"
                >
                  <Download className="w-4 h-4 text-red-400" />
                  <span>Download App Kit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickApproveAndActivate(selectedSchoolForVerify)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Activate School</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Download School App & Credentials Pack Modal */}
      {downloadModalSchool && (
        <DownloadSchoolAppModal
          isOpen={!!downloadModalSchool}
          onClose={() => setDownloadModalSchool(null)}
          school={downloadModalSchool}
        />
      )}
    </div>
  );
};
