import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Eye,
  Search,
  Filter,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Teacher } from '../../types';

interface StaffPipelineViewProps {
  teachers: Teacher[];
  onUpdateTeacher: (updated: Teacher) => void;
  onSelectTeacherForDossier: (teacher: Teacher) => void;
  onLogAudit?: (actionType: any, details: string, before?: string, after?: string) => void;
}

const PIPELINE_STAGES = [
  { id: 1, label: '1. Registered', code: 'REG', description: 'Personal & employment biodata captured' },
  { id: 2, label: '2. Records Validated', code: 'VAL', description: 'Academic degrees & TSC registration checked' },
  { id: 3, label: '3. Duplicate Check', code: 'DUP', description: 'Verified unique ID, TSC, and Staff Number' },
  { id: 4, label: '4. Admin Approval', code: 'APP', description: 'Authorized Administrator signs off' },
  { id: 5, label: '5. Role & Allocated', code: 'ALL', description: 'Class streams & CBE learning areas assigned' },
  { id: 6, label: '6. IAM Provisioned', code: 'PRV', description: 'Single user account created in tenant' },
  { id: 7, label: '7. Invite Sent', code: 'INV', description: 'SMS / Email token dispatched to phone' },
  { id: 8, label: '8. Password Set', code: 'PWD', description: 'Staff configured secure access password' },
  { id: 9, label: '9. MFA Setup', code: 'MFA', description: 'Multi-factor OTP verification enabled' },
  { id: 10, label: '10. Fully Active', code: 'ACT', description: 'Active in Marks Entry, Timetable, & Portal' },
];

export const StaffPipelineView: React.FC<StaffPipelineViewProps> = ({
  teachers,
  onUpdateTeacher,
  onSelectTeacherForDossier,
  onLogAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<number | 'ALL'>('ALL');
  const [pipelineFeedback, setPipelineFeedback] = useState<string | null>(null);

  const notify = (msg: string) => {
    setPipelineFeedback(msg);
    setTimeout(() => setPipelineFeedback(null), 3200);
  };

  // Helper to determine stage (1-10) for any teacher
  const getTeacherStage = (t: Teacher): number => {
    if (t.active && t.accountStatus === 'ACTIVE' && t.mfaEnabled) return 10;
    if (t.active && t.accountStatus === 'ACTIVE') return 9;
    if (t.passwordCreated) return 8;
    if (t.activationInvitationSentAt) return 7;
    if (t.accountStatus === 'PROVISIONED' || t.userId) return 6;
    if (t.allocations && t.allocations.length > 0) return 5;
    if (t.accountStatus === 'APPROVED') return 4;
    if (t.nationalId && t.tscNumber) return 3;
    if (t.academicQualifications && t.academicQualifications.length > 0) return 2;
    return 1;
  };

  const handleAdvanceTeacher = (t: Teacher, nextStage: number) => {
    let updated: Teacher = { ...t };
    let auditAction = 'SYSTEM_EVENT';
    let auditMsg = '';

    if (nextStage === 2) {
      // Mark qualifications validated
      updated.academicQualifications = (t.academicQualifications || []).map((aq) => ({
        ...aq,
        verified: true,
      }));
      auditAction = 'STAFF_VERIFIED';
      auditMsg = `Validated academic qualifications & TSC certificates for ${t.name}.`;
    } else if (nextStage === 3) {
      // Run duplicate check
      auditAction = 'SYSTEM_EVENT';
      auditMsg = `Executed duplicate check on ID ${t.nationalId || 'N/A'} and TSC ${t.tscNumber || 'N/A'}: Clear.`;
    } else if (nextStage === 4) {
      // Admin approval
      updated.accountStatus = 'APPROVED';
      auditAction = 'STAFF_APPROVED';
      auditMsg = `Administrator approved staff profile for ${t.name}.`;
    } else if (nextStage === 6) {
      // Provision IAM account
      updated.accountStatus = 'PROVISIONED';
      updated.userId = `usr-${Date.now()}`;
      auditAction = 'STAFF_ACCOUNT_PROVISIONED';
      auditMsg = `Provisioned unified IAM account for ${t.name} in authorized tenant.`;
    } else if (nextStage === 7) {
      // Send invite
      const token = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      updated.activationInvitationSentAt = new Date().toISOString();
      updated.activationToken = token;
      updated.accountStatus = 'INVITED';
      auditAction = 'STAFF_ACTIVATION_INVITE';
      auditMsg = `Dispatched activation invite token (${token}) to ${t.name}.`;
    } else if (nextStage >= 9) {
      // Enable MFA & Activate
      updated.mfaEnabled = true;
      updated.mfaMethod = 'SMS_OTP';
      updated.accountStatus = 'ACTIVE';
      updated.active = true;
      auditAction = 'STAFF_ACTIVATED';
      auditMsg = `Completed full onboarding & security activation for ${t.name}.`;
    }

    onUpdateTeacher(updated);
    if (onLogAudit) {
      onLogAudit(auditAction, auditMsg, `Stage ${getTeacherStage(t)}`, `Stage ${nextStage}`);
    }
    notify(`✓ ${t.name} progressed to Stage ${nextStage}: ${PIPELINE_STAGES[nextStage - 1].label}`);
  };

  const filteredTeachers = teachers.filter((t) => {
    const stage = getTeacherStage(t);
    if (filterStage !== 'ALL' && stage !== filterStage) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.tscNumber && t.tscNumber.toLowerCase().includes(q)) ||
        (t.staffNumber && t.staffNumber.toLowerCase().includes(q)) ||
        t.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Stage Explanation */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-bold tracking-tight">
                Recommended 10-Step Staff Registration & Approval Workflow
              </h3>
            </div>
            <p className="text-xs text-red-200/90 mt-1 max-w-3xl leading-relaxed">
              Every staff member must progress through validation, duplicate detection, administrator approval,
              and secure IAM account provisioning before gaining active access to marks entry and institutional records.
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-[10px] text-red-200 font-bold uppercase tracking-wider block">Active Rate</span>
              <span className="text-lg font-black text-emerald-300">
                {teachers.filter((t) => getTeacherStage(t) === 10).length} / {teachers.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {pipelineFeedback && (
        <div className="p-3 bg-slate-900 text-red-200 rounded-xl border border-red-800/40 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>{pipelineFeedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff in pipeline by name, TSC No, or staff ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter by Stage:</span>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="ALL">All Stages (1 - 10)</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Pipeline Cards */}
      <div className="space-y-4">
        {filteredTeachers.map((t) => {
          const currentStage = getTeacherStage(t);
          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-4 transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white"
                    style={{ backgroundColor: t.avatarHex || '#C51E28' }}
                  >
                    {t.name
                      .split(' ')
                      .filter((p) => !p.includes('.'))
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-md">
                        {t.staffNumber || t.employeeNumber || 'STF'}
                      </span>
                      {t.tscNumber && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-50 text-red-800 rounded-md border border-red-200">
                          {t.tscNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t.role} • {t.department || 'Academic'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      currentStage === 10
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Stage {currentStage} of 10: {PIPELINE_STAGES[currentStage - 1]?.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectTeacherForDossier(t)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Dossier
                  </button>
                </div>
              </div>

              {/* 10-Step Progress Bar Visualization */}
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 pt-2 border-t border-slate-100">
                {PIPELINE_STAGES.map((stage) => {
                  const isCompleted = currentStage >= stage.id;
                  const isCurrent = currentStage === stage.id;
                  return (
                    <div
                      key={stage.id}
                      className={`p-2 rounded-lg text-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-50 border border-amber-300 text-amber-800 font-bold'
                          : 'bg-slate-50 border border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        <span className="text-[10px] font-mono font-bold">{stage.code}</span>
                      </div>
                      <span className="text-[9px] font-medium leading-tight block truncate">
                        {stage.label.split('. ')[1]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar based on current stage */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Next Step:{' '}
                  <span className="font-semibold text-slate-700">
                    {currentStage < 10
                      ? PIPELINE_STAGES[currentStage]?.description
                      : 'All requirements satisfied. Active in system.'}
                  </span>
                </span>

                {currentStage < 10 && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceTeacher(t, currentStage + 1)}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Advance to Stage {currentStage + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
