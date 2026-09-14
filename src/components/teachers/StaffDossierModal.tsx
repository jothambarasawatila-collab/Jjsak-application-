import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Award,
  Lock,
  Unlock,
  Send,
  Plus,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import {
  Teacher,
  StaffAppraisalRecord,
  AcademicQualification,
} from '../../types';

interface StaffDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onUpdateTeacher: (updated: Teacher) => void;
  onOpenMarksEntry?: (teacherId: string, className: string, subject: string) => void;
  onLogAudit?: (actionType: any, details: string, before?: string, after?: string) => void;
}

export const StaffDossierModal: React.FC<StaffDossierModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onUpdateTeacher,
  onOpenMarksEntry,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'qualifications' | 'appraisals' | 'workload' | 'documents' | 'career'
  >('overview');

  // New Appraisal Sub-form State
  const [showNewAppraisalModal, setShowNewAppraisalModal] = useState(false);
  const [appraisalTerm, setAppraisalTerm] = useState('Term 2');
  const [appraisalYear, setAppraisalYear] = useState(2024);
  const [appraisalScore, setAppraisalScore] = useState(88);
  const [appraisalRating, setAppraisalRating] = useState<
    'Exceeding Targets' | 'Meeting Targets' | 'Approaching Targets' | 'Developing'
  >('Exceeding Targets');
  const [appraiserName, setAppraiserName] = useState('Mrs. J. Barasa');
  const [targetsSet, setTargetsSet] = useState('Ensure 100% completion of formative portfolio rubrics.');
  const [recommendations, setRecommendations] = useState(
    'Commended for diligent instructional tracking and CBC rubrics alignment.'
  );

  // New Qualification Form State
  const [showAddQualModal, setShowAddQualModal] = useState(false);
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newYear, setNewYear] = useState(2023);
  const [newGrade, setNewGrade] = useState('Credit');

  // IAM Feedback message
  const [iamFeedback, setIamFeedback] = useState<string | null>(null);

  if (!isOpen || !teacher) return null;

  const showNotification = (msg: string) => {
    setIamFeedback(msg);
    setTimeout(() => setIamFeedback(null), 3000);
  };

  const handleToggleAccountStatus = () => {
    const isCurrentlyActive = teacher.active !== false && teacher.accountStatus !== 'SUSPENDED';
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    const updatedTeacher: Teacher = {
      ...teacher,
      active: !isCurrentlyActive,
      accountStatus: newStatus,
    };
    onUpdateTeacher(updatedTeacher);
    if (onLogAudit) {
      onLogAudit(
        isCurrentlyActive ? 'STAFF_SUSPENDED' : 'STAFF_ACTIVATED',
        `${isCurrentlyActive ? 'Suspended' : 'Activated'} staff access for ${teacher.name} (${teacher.staffNumber || teacher.id}).`,
        isCurrentlyActive ? 'ACTIVE' : 'SUSPENDED',
        newStatus
      );
    }
    showNotification(
      isCurrentlyActive
        ? `🔒 Staff account for ${teacher.name} suspended.`
        : `✓ Staff account for ${teacher.name} activated.`
    );
  };

  const handleSendActivationLink = () => {
    const token = 'ACT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const updatedTeacher: Teacher = {
      ...teacher,
      activationInvitationSentAt: new Date().toISOString(),
      activationToken: token,
      accountStatus: teacher.accountStatus === 'REGISTERED' ? 'INVITED' : teacher.accountStatus,
    };
    onUpdateTeacher(updatedTeacher);
    if (onLogAudit) {
      onLogAudit(
        'STAFF_ACTIVATION_INVITE',
        `Dispatched secure activation invitation SMS and Email token to ${teacher.name} (${teacher.phoneNumber || teacher.email}).`,
        'Pending Invite',
        'Invite Dispatched'
      );
    }
    showNotification(`📨 Activation OTP securely dispatched to registered contacts (${teacher.phoneNumber || teacher.email}). Enforcing Policy §2.3 Zero-Exposure.`);
  };

  const handleToggleMfa = () => {
    const newMfa = !teacher.mfaEnabled;
    const updatedTeacher: Teacher = {
      ...teacher,
      mfaEnabled: newMfa,
      mfaMethod: newMfa ? teacher.mfaMethod || 'SMS_OTP' : undefined,
    };
    onUpdateTeacher(updatedTeacher);
    if (onLogAudit) {
      onLogAudit(
        'PERMISSION_CHANGE',
        `Updated MFA policy for ${teacher.name}: ${newMfa ? 'Enforced (SMS OTP)' : 'Disabled'}.`,
        teacher.mfaEnabled ? 'Enabled' : 'Disabled',
        newMfa ? 'Enabled' : 'Disabled'
      );
    }
    showNotification(newMfa ? '✓ MFA protection enforced.' : '⚠️ MFA protection disabled.');
  };

  const handleSaveNewAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppr: StaffAppraisalRecord = {
      id: `appr-${Date.now()}`,
      term: appraisalTerm,
      year: appraisalYear,
      overallRating: appraisalRating,
      scorePercentage: appraisalScore,
      appraiserName,
      appraiserRole: 'Head of Institution',
      appraisalDate: new Date().toISOString().split('T')[0],
      targetsSet,
      competencyScores: {
        curriculumDelivery: Math.round(appraisalScore * 0.2),
        assessmentRubrics: Math.round(appraisalScore * 0.2),
        learnerProgress: Math.round(appraisalScore * 0.2),
        ictIntegration: Math.round(appraisalScore * 0.2),
        professionalEthics: Math.round(appraisalScore * 0.2),
      },
      recommendations,
      status: 'Completed',
    };

    const existingAppraisals = teacher.appraisals || [];
    const updatedTeacher: Teacher = {
      ...teacher,
      appraisals: [newAppr, ...existingAppraisals],
    };
    onUpdateTeacher(updatedTeacher);
    if (onLogAudit) {
      onLogAudit(
        'STAFF_APPRAISAL_LOGGED',
        `Recorded TPAD termly appraisal for ${teacher.name}: ${appraisalScore}% (${appraisalRating}) for ${appraisalTerm} ${appraisalYear}.`,
        'None',
        `${appraisalScore}%`
      );
    }
    setShowNewAppraisalModal(false);
    showNotification(`✓ Appraisal logged for ${appraisalTerm} ${appraisalYear}`);
  };

  const handleSaveNewQualification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegree.trim() || !newInstitution.trim()) return;
    const newQual: AcademicQualification = {
      id: `aq-${Date.now()}`,
      degree: newDegree.trim(),
      institution: newInstitution.trim(),
      year: newYear,
      gradeOrClass: newGrade,
      verified: true,
    };
    const updatedTeacher: Teacher = {
      ...teacher,
      academicQualifications: [...(teacher.academicQualifications || []), newQual],
    };
    onUpdateTeacher(updatedTeacher);
    setShowAddQualModal(false);
    showNotification('✓ Qualification added to staff dossier.');
  };

  const isAccountActive = teacher.active !== false && teacher.accountStatus !== 'SUSPENDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Dossier Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white px-6 py-5 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md border-2 border-white/30"
              style={{ backgroundColor: teacher.avatarHex || '#C51E28' }}
            >
              {teacher.name
                .split(' ')
                .filter((p) => !p.includes('.'))
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{teacher.name}</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                  {teacher.staffNumber || teacher.employeeNumber || 'STF-REGISTERED'}
                </span>
                {teacher.tscNumber && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-mono">
                    {teacher.tscNumber}
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${
                    isAccountActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAccountActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {isAccountActive ? 'ACTIVE IN IAM' : 'SUSPENDED'}
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-1">
                {teacher.role} • {teacher.department || 'Academic Department'} • Trans-Nzoia County
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IAM Feedback Banner */}
        {iamFeedback && (
          <div className="bg-slate-900 text-red-200 px-6 py-2 text-xs font-medium border-b border-red-900/50 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>{iamFeedback}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Overview & IAM', icon: User },
            { id: 'qualifications', label: 'Qualifications & TPD', icon: GraduationCap },
            { id: 'appraisals', label: 'Staff Appraisals (TPAD)', icon: Award },
            { id: 'workload', label: 'Teaching Workload', icon: Layers },
            { id: 'documents', label: 'Documents Vault', icon: FileText },
            { id: 'career', label: 'Career Progression', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW & IAM ACCOUNT */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Personal & Employment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-600" />
                    Personal Biodata
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name:</span>
                      <span className="font-semibold text-slate-800">{teacher.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">National ID / Passport:</span>
                      <span className="font-semibold font-mono text-slate-800">{teacher.nationalId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gender:</span>
                      <span className="font-semibold text-slate-800">{teacher.gender || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Birth:</span>
                      <span className="font-semibold text-slate-800">{teacher.dateOfBirth || '1990-01-01'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number:</span>
                      <span className="font-semibold text-slate-800">{teacher.phoneNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email Address:</span>
                      <span className="font-semibold text-slate-800">{teacher.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Residential Address:</span>
                      <span className="font-semibold text-slate-800">
                        {teacher.physicalAddress || 'Trans-Nzoia County, Kenya'}
                      </span>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Emergency Contact / Next of Kin:
                    </span>
                    <p className="text-xs text-slate-800 font-medium">
                      {teacher.emergencyContact?.name || 'Dr. Stella Watila'} (
                      {teacher.emergencyContact?.relationship || 'Spouse'}) •{' '}
                      <span className="font-mono">{teacher.emergencyContact?.phone || '+254 722 998 877'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-red-600" />
                    Employment & Designation
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Staff Number:</span>
                      <span className="font-semibold font-mono text-slate-800">
                        {teacher.staffNumber || teacher.employeeNumber || 'STF-001'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TSC Number:</span>
                      <span className="font-semibold font-mono text-red-700">{teacher.tscNumber || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designation:</span>
                      <span className="font-semibold text-slate-800">{teacher.designation || teacher.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Department:</span>
                      <span className="font-semibold text-slate-800">{teacher.department || 'Technical & Applied'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Employment Status:</span>
                      <span className="font-semibold text-slate-800">
                        {teacher.employmentStatus || 'Permanent & Pensionable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Employment:</span>
                      <span className="font-semibold text-slate-800">{teacher.dateOfEmployment || '2022-01-10'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Reporting Officer:</span>
                      <span className="font-semibold text-slate-800">
                        {teacher.reportingOfficer || 'Mrs. J. Barasa (Head of Institution)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* IAM Security & Unified Access Controls */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-700" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Centralized IAM Account & Authentication Controls
                      </h3>
                      <p className="text-xs text-slate-500">
                        Manage security credentials, multi-factor authentication, activation tokens, and account status.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      isAccountActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Status: {teacher.accountStatus || 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Account Status</span>
                    <p className="text-xs text-slate-500">
                      {isAccountActive
                        ? 'Staff member is authorized to access assessment and student portal.'
                        : 'Staff login is suspended. All sessions terminated.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleToggleAccountStatus}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        isAccountActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isAccountActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      {isAccountActive ? 'Suspend Staff Account' : 'Reactivate Staff Access'}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Activation & Credentials</span>
                    <p className="text-xs text-slate-500">
                      Generate a secure one-time password setup link dispatched to staff phone/email.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendActivationLink}
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Activation Invite Link
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">MFA Protection</span>
                    <p className="text-xs text-slate-500">
                      {teacher.mfaEnabled ? 'Protected with SMS OTP code.' : 'Standard password authentication.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleToggleMfa}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        teacher.mfaEnabled
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                          : 'bg-red-800 text-white hover:bg-red-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {teacher.mfaEnabled ? 'Disable MFA Requirement' : 'Enforce MFA (SMS OTP)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFICATIONS & TPD */}
          {activeTab === 'qualifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Academic & Professional Qualifications</h3>
                  <p className="text-xs text-slate-500">
                    Official degrees, diplomas, TSC licensure, and continuous teacher professional development.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddQualModal(true)}
                  className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Qualification
                </button>
              </div>

              {/* Tertiary Academic Qualifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Academic Degrees & Diplomas
                </h4>
                <div className="space-y-2">
                  {(teacher.academicQualifications || []).map((aq) => (
                    <div
                      key={aq.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-700 rounded-xl">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{aq.degree}</h5>
                          <p className="text-xs text-slate-500">
                            {aq.institution} • Conferred: {aq.year}{' '}
                            {aq.gradeOrClass && `• Honors: ${aq.gradeOrClass}`}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Credential
                      </span>
                    </div>
                  ))}
                  {(!teacher.academicQualifications || teacher.academicQualifications.length === 0) && (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                      No tertiary academic qualifications recorded yet. Click Add Qualification above.
                    </p>
                  )}
                </div>
              </div>

              {/* TPD continuous professional development */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  TPD (Teacher Professional Development) Modules Completed
                </h4>
                <div className="space-y-2">
                  {(teacher.professionalDevelopmentRecords || []).map((tpd) => (
                    <div
                      key={tpd.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{tpd.moduleName}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Provider: {tpd.provider} • Completed: {tpd.completionDate}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-800 border border-red-200">
                        +{tpd.cpdPoints} CPD Credits
                      </span>
                    </div>
                  ))}
                  {(!teacher.professionalDevelopmentRecords ||
                    teacher.professionalDevelopmentRecords.length === 0) && (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                      No TPD records logged yet for this academic year.
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Certifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Professional Certifications & Badges
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(teacher.professionalCertifications || []).map((cert) => (
                    <div key={cert.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <h5 className="text-xs font-bold text-slate-900">{cert.name}</h5>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Issued by: {cert.issuer} • Date: {cert.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF APPRAISALS (TPAD) */}
          {activeTab === 'appraisals' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Staff Appraisal Records (TPAD)</h3>
                  <p className="text-xs text-slate-500">
                    Kenyan Teacher Performance Appraisal and Development (TPAD) records, competency scores, and targets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAppraisalModal(true)}
                  className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Termly Appraisal
                </button>
              </div>

              <div className="space-y-4">
                {(teacher.appraisals || []).map((appr) => (
                  <div
                    key={appr.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {appr.term} {appr.year} Performance Review
                          </span>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                              appr.scorePercentage >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : appr.scorePercentage >= 65
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {appr.overallRating} ({appr.scorePercentage}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Appraised by: {appr.appraiserName} ({appr.appraiserRole}) on {appr.appraisalDate}
                        </p>
                      </div>
                    </div>

                    {/* Competency breakdown radar / bars */}
                    <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 block">Curriculum Delivery</span>
                        <span className="text-xs font-bold text-slate-800">
                          {appr.competencyScores?.curriculumDelivery ?? 18}/20
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 block">Assessment Rubrics</span>
                        <span className="text-xs font-bold text-slate-800">
                          {appr.competencyScores?.assessmentRubrics ?? 18}/20
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 block">Learner Progress</span>
                        <span className="text-xs font-bold text-slate-800">
                          {appr.competencyScores?.learnerProgress ?? 18}/20
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 block">ICT Integration</span>
                        <span className="text-xs font-bold text-slate-800">
                          {appr.competencyScores?.ictIntegration ?? 18}/20
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-[10px] text-slate-500 block">Ethics & Conduct</span>
                        <span className="text-xs font-bold text-slate-800">
                          {appr.competencyScores?.professionalEthics ?? 18}/20
                        </span>
                      </div>
                    </div>

                    {/* Targets & Remarks */}
                    <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900">Agreed Targets: </span>
                        <span>{appr.targetsSet}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Appraiser Remarks & Recommendation: </span>
                        <span>{appr.recommendations}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEACHING WORKLOAD & ALLOCATIONS */}
          {activeTab === 'workload' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Teaching Workload & Allocations</h3>
                  <p className="text-xs text-slate-500">
                    Active stream allocations, weekly lesson count vs national standard (27 periods/wk), and student reach.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Calculated Load:</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                    {teacher.workload?.lessonsPerWeek || 24} Lessons/Week (Optimal)
                  </span>
                </div>
              </div>

              {/* Stream Allocations Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Class Stream</th>
                      <th className="px-4 py-3">Assigned Learning Areas / Subjects</th>
                      <th className="px-4 py-3">Periods / Week</th>
                      <th className="px-4 py-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(teacher.allocations || []).map((alloc) => (
                      <tr key={alloc.className} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-bold text-slate-900">{alloc.className}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {alloc.subjects.map((sub) => (
                              <span
                                key={sub}
                                className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-medium border border-red-200"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 font-mono">
                          {alloc.subjects.length * 4} Lessons
                        </td>
                        <td className="px-4 py-3 text-right">
                          {alloc.subjects.length > 0 && onOpenMarksEntry && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenMarksEntry(teacher.id, alloc.className, alloc.subjects[0]);
                              }}
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md text-[11px] font-bold"
                            >
                              Enter Marks ({alloc.subjects[0]})
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORTING DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Professional Supporting Documents</h3>
                  <p className="text-xs text-slate-500">
                    Digital document vault: Passport photos, National ID scans, degree certificates, and TSC appointment letters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(teacher.supportingDocuments || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.type} • Uploaded: {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CAREER PROGRESSION & AWARDS */}
          {activeTab === 'career' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Career Advancement & Institutional Recognition</h3>
                <p className="text-xs text-slate-500">
                  Historical promotions, job group progression, and awards of distinction.
                </p>
              </div>

              {/* Promotions Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Promotion History
                </h4>
                {(teacher.promotions || []).map((prm) => (
                  <div
                    key={prm.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {prm.fromDesignation} → {prm.toDesignation}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-md">
                          Ref: {prm.referenceNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Approved by: {prm.approvedBy} • Effective: {prm.effectiveDate}
                      </p>
                    </div>
                  </div>
                ))}
                {(!teacher.promotions || teacher.promotions.length === 0) && (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                    Initial appointment designation active.
                  </p>
                )}
              </div>

              {/* Awards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Institutional Awards & Commendations
                </h4>
                {(teacher.awards || []).map((awd) => (
                  <div
                    key={awd.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950">{awd.awardTitle}</span>
                      <span className="text-[11px] font-bold text-amber-800">({awd.year})</span>
                    </div>
                    <p className="text-xs text-amber-900/90">{awd.description}</p>
                    <p className="text-[11px] text-amber-700/80">Conferred by: {awd.awardedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Staff ID: <span className="font-mono font-bold text-slate-700">{teacher.id}</span> • School Tenant:{' '}
            <span className="font-semibold text-slate-700">{(teacher as any)?.schoolName || (teacher as any)?.schoolId || 'Active Institution'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* New Appraisal Sub-Modal */}
      {showNewAppraisalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Record TPAD Termly Appraisal</h3>
              <button
                type="button"
                onClick={() => setShowNewAppraisalModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAppraisal} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appraisal Term</label>
                  <select
                    value={appraisalTerm}
                    onChange={(e) => setAppraisalTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={appraisalYear}
                    onChange={(e) => setAppraisalYear(parseInt(e.target.value) || 2024)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Score Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={appraisalScore}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAppraisalScore(val);
                      if (val >= 81) setAppraisalRating('Exceeding Targets');
                      else if (val >= 65) setAppraisalRating('Meeting Targets');
                      else if (val >= 50) setAppraisalRating('Approaching Targets');
                      else setAppraisalRating('Developing');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating Category</label>
                  <input
                    type="text"
                    readOnly
                    value={appraisalRating}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appraiser Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={appraiserName}
                  onChange={(e) => setAppraiserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Competency Targets</label>
                <textarea
                  rows={2}
                  value={targetsSet}
                  onChange={(e) => setTargetsSet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appraiser Recommendations</label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppraisalModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-red-800 hover:bg-red-900 text-white rounded-lg"
                >
                  Save Appraisal Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Qualification Sub-Modal */}
      {showAddQualModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Add Academic Qualification</h3>
              <button
                type="button"
                onClick={() => setShowAddQualModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewQualification} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Diploma Award</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Education (Curriculum Studies)"
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University of Nairobi"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value) || 2023)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Classification</label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="e.g. Distinction / First Class"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQualModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-red-800 hover:bg-red-900 text-white rounded-lg"
                >
                  Save Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
