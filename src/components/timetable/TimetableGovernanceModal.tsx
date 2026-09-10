import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  Sliders,
  RefreshCw,
  Send,
  FileCheck,
  FileEdit,
  Lock,
  AlertOctagon,
  CalendarCheck,
  Activity,
} from 'lucide-react';
import { User, Teacher, SchoolInfo } from '../../types';
import { TimetableLesson, TimetableClash, DayOfWeek } from '../../types/timetable';
import {
  TimetableWorkflowState,
  TimetableDelegation,
  EmergencyTimetableRecord,
  EmergencyCategory,
  TimetableChangeRequest,
  ImmutableActivationRecord,
  PrePublicationValidationReport,
  TimetableConstraintsConfig,
  TeacherTimeOffRecord,
  FourEyesGovernanceConfig,
  EligibleDelegateRole,
} from '../../types/timetableGovernance';
import { timetableGovernanceService } from '../../services/timetableGovernanceService';
import { DAYS_OF_WEEK } from '../../data/timetableData';

interface TimetableGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  schoolInfo: SchoolInfo;
  teachers: Teacher[];
  lessons: TimetableLesson[];
  clashes: TimetableClash[];
  availableClasses: string[];
  onLessonsUpdated?: (newLessons: TimetableLesson[]) => void;
  onLogAudit?: (action: string, details: string) => void;
  onRequestChangeClick?: () => void;
}

export const TimetableGovernanceModal: React.FC<TimetableGovernanceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  schoolInfo,
  teachers,
  lessons,
  clashes,
  availableClasses,
  onLessonsUpdated: _onLessonsUpdated,
  onLogAudit,
  onRequestChangeClick,
}) => {
  // Tabs: 'WORKFLOW' | 'DELEGATION' | 'EMERGENCY' | 'CHANGE_REQUESTS' | 'CONSTRAINTS' | 'TIME_OFF' | 'VALIDATION'
  const [activeTab, setActiveTab] = useState<
    'WORKFLOW' | 'DELEGATION' | 'EMERGENCY' | 'CHANGE_REQUESTS' | 'CONSTRAINTS' | 'TIME_OFF' | 'VALIDATION'
  >('WORKFLOW');

  // Governance Permissions Check (§18, §19)
  const perms = timetableGovernanceService.checkPermissions(currentUser);

  // States
  const [workflowState, setWorkflowState] = useState<TimetableWorkflowState>(() =>
    timetableGovernanceService.getWorkflowState()
  );
  const [fourEyes, setFourEyes] = useState<FourEyesGovernanceConfig>(() =>
    timetableGovernanceService.getFourEyesConfig()
  );
  const [delegations, setDelegations] = useState<TimetableDelegation[]>(() =>
    timetableGovernanceService.getDelegations()
  );
  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyTimetableRecord[]>(() =>
    timetableGovernanceService.getEmergencyRecords()
  );
  const [changeRequests, setChangeRequests] = useState<TimetableChangeRequest[]>(() =>
    timetableGovernanceService.getChangeRequests()
  );
  const [constraints, setConstraints] = useState<TimetableConstraintsConfig>(() =>
    timetableGovernanceService.getConstraints()
  );
  const [timeOffRecords, setTimeOffRecords] = useState<TeacherTimeOffRecord[]>(() =>
    timetableGovernanceService.getTimeOffRecords()
  );
  const [activationRecords, setActivationRecords] = useState<ImmutableActivationRecord[]>(() =>
    timetableGovernanceService.getActivationRecords()
  );
  const [validationReport, setValidationReport] = useState<PrePublicationValidationReport | null>(null);

  // Status feedback toast
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Delegation form states
  const [delLevel, setDelLevel] = useState<'Operational' | 'Full Governance'>('Operational');
  const [delRole, setDelRole] = useState<EligibleDelegateRole>('DEPUTY_DIRECTOR_OF_ACADEMICS');
  const [delName, setDelName] = useState('Mr. David Kiprop');
  const [delStart, setDelStart] = useState('2026-09-08T08:00');
  const [delEnd, setDelEnd] = useState('2026-09-22T17:00');
  const [delReason, setDelReason] = useState('Preparation of Term 3 Draft Timetable during official leave');

  // Emergency form states
  const [emgCategory, setEmgCategory] = useState<EmergencyCategory>('Category 1 – Immediate Emergency');
  const [emgTitle, setEmgTitle] = useState('');
  const [emgReason, setEmgReason] = useState('');
  const [emgTargetClass, setEmgTargetClass] = useState(availableClasses[0] || 'Grade 8 South');

  // Time-off form states
  const [newToffTeacherId, setNewToffTeacherId] = useState(teachers[0]?.id || '');
  const [newToffType, setNewToffType] = useState<TeacherTimeOffRecord['type']>('Leave');
  const [newToffDay, setNewToffDay] = useState<DayOfWeek | 'All'>('All');
  const [newToffPeriod, setNewToffPeriod] = useState<number>(1);
  const [newToffReason, setNewToffReason] = useState('');

  // Conflict Override form states
  const [overrideClashId, setOverrideClashId] = useState<string | null>(null);
  const [overrideJustification, setOverrideJustification] = useState<string>('');

  if (!isOpen) return null;

  // Handler: Run Pre-Publication Validation (§16)
  const handleRunValidation = () => {
    const report = timetableGovernanceService.runPrePublicationValidation(
      lessons,
      teachers,
      clashes,
      currentUser || { id: 'usr-doa', fullName: 'Director of Academics', role: 'DIRECTOR_ACADEMICS' } as any
    );
    setValidationReport(report);
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_PRE_PUBLICATION_VALIDATION',
        `Pre-publication validation executed by ${report.validatedBy}. Passed: ${report.passed}. Critical Failures: ${report.criticalFailuresCount}.`
      );
    }
    showFeedback(
      report.passed
        ? 'Pre-publication validation passed! All 8 critical statutory checks verified.'
        : `Validation failed: ${report.criticalFailuresCount} critical failure(s) must be resolved.`
    );
  };

  // Handler: Transition to Under Review
  const handleTransitionToUnderReview = () => {
    if (!perms.canGovern) {
      showFeedback('Only the Director of Academics or Full Governance Delegate may transition states.');
      return;
    }
    timetableGovernanceService.setWorkflowState('Under Review');
    setWorkflowState('Under Review');
    if (onLogAudit) {
      onLogAudit('TIMETABLE_STATE_UNDER_REVIEW', 'Timetable transitioned to "Under Review" stage for formal audit.');
    }
    showFeedback('Timetable transitioned to "Under Review". Ready for pre-publication validation.');
  };

  // Handler: Approve Timetable (§13)
  const handleApproveTimetable = () => {
    if (!perms.canApprove) {
      showFeedback('Only Director of Academics or Active Full Governance Delegate may approve timetables (§13).');
      return;
    }
    if (!validationReport || !validationReport.passed) {
      showFeedback('Pre-publication validation must pass before approval can be granted (§16).');
      return;
    }

    timetableGovernanceService.setWorkflowState('Approved');
    setWorkflowState('Approved');
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_APPROVED',
        `Timetable approved by ${currentUser?.fullName} (${currentUser?.role}). Ready for publication.`
      );
    }
    showFeedback('Timetable officially approved. Note: Approval does not activate the timetable (§13).');
  };

  // Handler: Publish Timetable (§14)
  const handlePublishTimetable = () => {
    if (fourEyes.isEnabled) {
      if (!perms.isHead) {
        showFeedback('Under Four-Eyes Mode (§14), only the Head of Institution may publish approved timetables.');
        return;
      }
    } else {
      if (!perms.canPublish) {
        showFeedback('Only Director of Academics or Active Full Governance Delegate may publish timetables (§14).');
        return;
      }
    }

    timetableGovernanceService.setWorkflowState('Published');
    setWorkflowState('Published');
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_PUBLISHED',
        `Timetable officially published by ${currentUser?.fullName} (${currentUser?.role}). Effective activation pending.`
      );
    }
    showFeedback('Timetable published officially! Activation will occur automatically on effective date/time (§15).');
  };

  // Handler: Simulate System Auto-Activation (§15)
  const handleSimulateSystemActivation = () => {
    const actRecord = timetableGovernanceService.recordSystemActivation(
      'ver-2026-t2',
      'Term 2 Master Timetable v3.2',
      'Mr. Jotham Watila',
      'Director of Academics',
      fourEyes.isEnabled ? 'Dr. Sarah Rotich (Head)' : 'Mr. Jotham Watila (Director)',
      fourEyes.isEnabled ? 'HEAD_OF_INSTITUTION' : 'DIRECTOR_OF_ACADEMICS',
      new Date().toISOString().split('T')[0],
      '08:00',
      fourEyes.isEnabled
    );
    setWorkflowState('Active');
    setActivationRecords([actRecord, ...activationRecords]);
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_SYSTEM_ACTIVATION',
        `System automatically activated timetable v3.2 upon effective date/time. Verification Hash: ${actRecord.systemVerificationHash}.`
      );
    }
    showFeedback('System auto-activation executed! Timetable is now the official active schedule (§15).');
  };

  // Handler: Request Delegation (§20-23)
  const handleRequestDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.isDirector) {
      showFeedback('Only the Director of Academics can initiate governance delegation requests (§23).');
      return;
    }

    const priority: 1 | 2 | 3 =
      delRole === 'DEPUTY_DIRECTOR_OF_ACADEMICS' ? 1 : delRole === 'HEAD_OF_INSTITUTION' ? 2 : 3;

    const newDel = timetableGovernanceService.requestDelegation({
      delegationLevel: delLevel,
      delegateId: `usr-${delRole.toLowerCase()}`,
      delegateName: delName,
      delegateRole: delRole,
      delegatePriority: priority,
      eligibility: {
        isActive: true,
        holdsAcademicLeadership: true,
        trainingCompleted: true,
        noSuspension: true,
        noDisciplinaryRestrictions: true,
        activeSystemAccount: true,
      },
      requestedBy: `${currentUser?.fullName || 'Director of Academics'} (Director of Academics)`,
      startDateTime: new Date(delStart).toISOString(),
      endDateTime: new Date(delEnd).toISOString(),
      reason: delReason,
    });

    setDelegations([newDel, ...delegations]);
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_DELEGATION_REQUESTED',
        `Delegation requested for ${delName} (${delRole}, Priority ${priority}) at level ${delLevel}. Awaiting Head of Institution approval.`
      );
    }
    showFeedback(`Delegation request created for ${delName}. Pending approval by Head of Institution.`);
  };

  // Handler: Approve Delegation (§23)
  const handleApproveDelegation = (id: string) => {
    if (!perms.isHead) {
      showFeedback('Only the Head of Institution may approve timetable delegations (§23).');
      return;
    }

    const res = timetableGovernanceService.approveDelegation(
      id,
      `${currentUser?.fullName || 'Head of Institution'} (Head of Institution)`
    );
    if (res.success) {
      setDelegations(timetableGovernanceService.getDelegations());
      if (onLogAudit) {
        onLogAudit(
          'TIMETABLE_DELEGATION_APPROVED',
          `Head of Institution approved timetable delegation ID ${id}. Status: Active.`
        );
      }
      showFeedback(res.message);
    } else {
      showFeedback(res.message);
    }
  };

  // Handler: Revoke Delegation (§24)
  const handleRevokeDelegation = (id: string) => {
    if (!perms.isHead && !perms.isDirector) {
      showFeedback('Delegation may only be revoked by Head of Institution or returning Director of Academics (§24).');
      return;
    }

    const reason = prompt('Please enter the formal justification for delegation revocation:');
    if (!reason) return;

    const res = timetableGovernanceService.revokeDelegation(
      id,
      currentUser?.fullName || 'Academic Leadership',
      reason
    );
    if (res.success) {
      setDelegations(timetableGovernanceService.getDelegations());
      if (onLogAudit) {
        onLogAudit('TIMETABLE_DELEGATION_REVOKED', `Delegation ID ${id} revoked. Reason: ${reason}`);
      }
      showFeedback(res.message);
    }
  };

  // Handler: Initiate Emergency Schedule (§25-28)
  const handleInitiateEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canInitiateEmergency) {
      showFeedback('Only Director of Academics, Head, Deputy Head, or Active Delegate may initiate emergencies (§25).');
      return;
    }
    if (!emgTitle.trim() || !emgReason.trim()) {
      showFeedback('Please provide both an emergency title and clear justification reason.');
      return;
    }

    const newRecord = timetableGovernanceService.initiateEmergency({
      title: emgTitle,
      category: emgCategory,
      reason: emgReason,
      initiatedBy: currentUser?.fullName || 'Director of Academics',
      initiatorRole: currentUser?.role || 'DIRECTOR_OF_ACADEMICS',
      approvalType: perms.isDirector
        ? 'Normal Operations (Director of Academics)'
        : perms.isHead
        ? 'Emergency Continuity Fallback (Head of Institution)'
        : 'Full Governance Delegation',
      affectedClasses: [emgTargetClass],
      affectedTeachers: [teachers[0]?.name || 'Teaching Staff'],
      recipients: {
        affectedTeachersCount: 4,
        classTeachersCount: 2,
        invigilatorsCount: 0,
        affectedLearnersCount: 90,
        parentsNotified: emgCategory === 'Category 4 – Long-Term Emergency Arrangement',
        leadershipNotified: true,
      },
      dispatchChannels: ['In-App', 'Push', 'Email', 'SMS'],
      maxActivationDelayMinutes: emgCategory === 'Category 1 – Immediate Emergency' ? 15 : undefined,
      publicationDeadlineTime: emgCategory === 'Category 2 – Next-Day Emergency' ? '22:00' : undefined,
      maxSchedulingDays:
        emgCategory === 'Category 3 – Temporary Emergency Schedule'
          ? 30
          : emgCategory === 'Category 4 – Long-Term Emergency Arrangement'
          ? 90
          : undefined,
      mandatoryReviewDays: emgCategory === 'Category 4 – Long-Term Emergency Arrangement' ? 30 : undefined,
      mandatoryEndDate: '2026-10-15',
    });

    setEmergencyRecords([newRecord, ...emergencyRecords]);
    setEmgTitle('');
    setEmgReason('');
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_EMERGENCY_INITIATED',
        `Emergency timetable schedule initiated under ${emgCategory}: "${emgTitle}". Reason: ${emgReason}.`
      );
    }
    showFeedback(`Emergency timetable adjustment initiated (${emgCategory}). Pending formal approval & publication.`);
  };

  // Handler: Approve & Publish Emergency (§26, §27, §30)
  const handleApproveAndPublishEmergency = (emgId: string) => {
    const approverName = currentUser?.fullName || 'Director of Academics';
    const approverRole = currentUser?.role || 'DIRECTOR_OF_ACADEMICS';

    const success = timetableGovernanceService.approveAndPublishEmergency(
      emgId,
      approverName,
      approverRole,
      approverName,
      approverRole
    );

    if (success) {
      setEmergencyRecords(timetableGovernanceService.getEmergencyRecords());
      if (onLogAudit) {
        onLogAudit(
          'TIMETABLE_EMERGENCY_PUBLISHED',
          `Emergency schedule ID ${emgId} approved and published with multi-channel dispatch (In-App, Push, Email, SMS).`
        );
      }
      showFeedback('Emergency schedule published! Multi-channel notifications delivered with automatic fallback (§30).');
    }
  };

  // Handler: Review Change Request (§12)
  const handleReviewChangeRequest = (id: string, action: 'Approved' | 'Rejected') => {
    if (!perms.canGovern) {
      showFeedback('Only the Director of Academics or Full Governance Delegate may review change requests (§12).');
      return;
    }

    const comment = prompt(`Enter comments for ${action.toLowerCase()} decision:`) || 'Reviewed by Director of Academics';
    const success = timetableGovernanceService.reviewChangeRequest(
      id,
      action,
      currentUser?.fullName || 'Director of Academics',
      comment
    );

    if (success) {
      setChangeRequests(timetableGovernanceService.getChangeRequests());
      if (onLogAudit) {
        onLogAudit(
          `TIMETABLE_CHANGE_REQUEST_${action.toUpperCase()}`,
          `Change request ID ${id} ${action.toLowerCase()} by ${currentUser?.fullName}. Remarks: ${comment}.`
        );
      }
      showFeedback(`Change request marked as ${action}.`);
    }
  };

  // Handler: Save Constraints Config (§5 & §7)
  const handleSaveConstraints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canGovern) {
      showFeedback('Only Director of Academics or Full Delegate can modify timetable constraints (§5).');
      return;
    }

    timetableGovernanceService.saveConstraints(constraints);
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_CONSTRAINTS_UPDATED',
        `Timetable constraints updated: Max ${constraints.maxLessonsPerTeacherPerDay} lessons/teacher/day, Weekly workload limit ${constraints.teacherWorkloadLimitWeekly}.`
      );
    }
    showFeedback('Constraints engine settings updated successfully.');
  };

  // Handler: Add Teacher Time-Off (§6)
  const handleAddTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canGovern) {
      showFeedback('Only Director of Academics or Full Delegate can configure teacher time-off (§6).');
      return;
    }
    if (!newToffReason.trim()) {
      showFeedback('Please provide a reason for the teacher time-off reservation.');
      return;
    }

    const teacherObj = teachers.find((t) => t.id === newToffTeacherId) || teachers[0];
    const newRecord = timetableGovernanceService.addTimeOffRecord({
      teacherId: teacherObj.id,
      teacherName: teacherObj.name,
      type: newToffType,
      day: newToffDay,
      periodNumbers: [newToffPeriod],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-11-30',
      reason: newToffReason,
      approvedBy: currentUser?.fullName || 'Director of Academics',
    });

    setTimeOffRecords([newRecord, ...timeOffRecords]);
    setNewToffReason('');
    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_TIME_OFF_ADDED',
        `Time-off reservation added for ${teacherObj.name} (${newToffType} on ${newToffDay} Period ${newToffPeriod}): "${newToffReason}".`
      );
    }
    showFeedback(`Time-off reservation created for ${teacherObj.name}. Engine will prevent lesson allocations.`);
  };

  // Handler: Remove Teacher Time-Off (§6)
  const handleRemoveTimeOff = (id: string) => {
    if (!perms.canGovern) {
      showFeedback('Only Director of Academics can modify time-off records.');
      return;
    }
    timetableGovernanceService.removeTimeOffRecord(id);
    setTimeOffRecords(timeOffRecords.filter((r) => r.id !== id));
    if (onLogAudit) {
      onLogAudit('TIMETABLE_TIME_OFF_REMOVED', `Time-off record ID ${id} removed.`);
    }
    showFeedback('Time-off record removed.');
  };

  // Handler: Conflict Override (§8)
  const handleApproveConflictOverride = (clash: TimetableClash) => {
    if (!perms.canGovern) {
      showFeedback('Only Director of Academics or Full Governance Delegate can approve conflict overrides (§8).');
      return;
    }
    if (!overrideJustification.trim()) {
      showFeedback('Mandatory academic justification required for conflict override.');
      return;
    }

    timetableGovernanceService.addConflictOverride({
      clashId: clash.id,
      clashType: clash.type,
      clashDescription: clash.description,
      authorizedBy: currentUser?.fullName || 'Director of Academics',
      authorizedRole: currentUser?.role || 'DIRECTOR_OF_ACADEMICS',
      justification: overrideJustification,
    });

    if (onLogAudit) {
      onLogAudit(
        'TIMETABLE_CONFLICT_OVERRIDE',
        `Conflict override approved for "${clash.description}". Reason: ${overrideJustification}.`
      );
    }
    setOverrideClashId(null);
    setOverrideJustification('');
    showFeedback('Conflict override recorded in permanent audit trail (§8).');
  };

  const activeDelegation = timetableGovernanceService.getActiveDelegation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C51E28] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight text-white">
                  JJSAK Master Timetable Governance Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LOCKED VERSION
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  State: {workflowState.toUpperCase()}
                </span>
                {fourEyes.isEnabled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Four-Eyes Mode ON
                  </span>
                )}
                {activeDelegation && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Delegation: {activeDelegation.delegateName} ({activeDelegation.delegationLevel})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Sole Authority: Director of Academics • {schoolInfo.name} ({schoolInfo.term}) • Approval, Publication, Delegation &amp; Emergency Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity & Authority Bar */}
        <div className="px-6 py-2.5 bg-slate-950 text-slate-300 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current User:</span>
            <strong className="text-white">{currentUser?.fullName || 'User'}</strong>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-[10px]">
              {currentUser?.role || 'READ_ONLY'}
            </span>
            <span className="text-slate-400 text-[11px]">— {perms.accessDescription}</span>
          </div>

          {statusMsg && (
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'WORKFLOW', label: '1. Workflow & Lifecycle', icon: Activity },
            { id: 'DELEGATION', label: '2. Delegation Center (§20-24)', icon: Users },
            { id: 'EMERGENCY', label: '3. Emergency Management (§25-30)', icon: Zap },
            { id: 'CHANGE_REQUESTS', label: `4. Change Requests (${changeRequests.filter((c) => c.status === 'Pending Review').length})`, icon: FileEdit },
            { id: 'CONSTRAINTS', label: '5. Constraints Engine (§5 & §7)', icon: Sliders },
            { id: 'TIME_OFF', label: `6. Teacher Time-Off (${timeOffRecords.filter((t) => t.isActive).length})`, icon: CalendarCheck },
            { id: 'VALIDATION', label: '7. Validation & Conflicts', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 border-t-2 border-x border-slate-200 border-t-[#C51E28] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C51E28]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: WORKFLOW & LIFECYCLE */}
          {activeTab === 'WORKFLOW' && (
            <div className="space-y-6">
              {/* 7-Stage Workflow Visualizer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Timetable 7-State Statutory Workflow Engine (§11)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Current Operational Status: <strong className="text-slate-900">{workflowState}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { state: 'Draft', desc: 'Creation & Edits', num: 1 },
                    { state: 'Under Review', desc: 'Pre-Validation', num: 2 },
                    { state: 'Approved', desc: 'Validated & Signed', num: 3 },
                    { state: 'Published', desc: 'Authorized Release', num: 4 },
                    { state: 'Active', desc: 'Operational Schedule', num: 5 },
                    { state: 'Superseded', desc: 'Replaced by New Ver', num: 6 },
                    { state: 'Archived', desc: 'Immutable Historical', num: 7 },
                  ].map((st) => {
                    const isCurrent = workflowState === st.state;
                    return (
                      <div
                        key={st.state}
                        className={`p-3 rounded-xl border text-center transition ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-black uppercase mb-0.5 ${
                            isCurrent ? 'text-indigo-400' : 'text-slate-400'
                          }`}
                        >
                          Stage {st.num}
                        </div>
                        <div className="font-black text-xs">{st.state}</div>
                        <div
                          className={`text-[9px] mt-0.5 ${
                            isCurrent ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {st.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls based on State */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Lifecycle Governance Actions for Term 2 Master Schedule
                    </h4>
                    <p className="text-xs text-slate-500">
                      Executed strictly by Director of Academics or authorized Full Governance Delegate (§13, §14, §15).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={fourEyes.isEnabled}
                        onChange={(e) => {
                          if (!perms.canGovern) {
                            showFeedback('Only Director of Academics can toggle Four-Eyes mode.');
                            return;
                          }
                          const updated = { ...fourEyes, isEnabled: e.target.checked };
                          setFourEyes(updated);
                          timetableGovernanceService.setFourEyesConfig(updated);
                          if (onLogAudit) {
                            onLogAudit(
                              'TIMETABLE_FOUR_EYES_TOGGLE',
                              `Four-Eyes Governance Mode set to ${e.target.checked ? 'ENABLED' : 'DISABLED'}.`
                            );
                          }
                          showFeedback(
                            e.target.checked
                              ? 'Four-Eyes Governance Mode enabled (Director approves, Head publishes).'
                              : 'Four-Eyes Governance Mode disabled.'
                          );
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Optional Four-Eyes Mode (§14)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1: Pre-Validation */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      1. Statutory Validation (§16)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Runs all 8 mandatory pre-publication checks (teacher, class, room, labs, subject quotas, time-off).
                    </p>
                    <button
                      type="button"
                      onClick={handleRunValidation}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Run Pre-Validation</span>
                    </button>
                    {workflowState === 'Draft' && (
                      <button
                        type="button"
                        onClick={handleTransitionToUnderReview}
                        disabled={!perms.canGovern}
                        className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 border border-slate-300 ${
                          perms.canGovern
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Move to "Under Review"</span>
                      </button>
                    )}
                  </div>

                  {/* Step 2: Approval */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      2. Formal Approval (§13)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Confirms validation passed and signs off schedule. Does NOT activate or notify learners.
                    </p>
                    <button
                      type="button"
                      onClick={handleApproveTimetable}
                      disabled={!perms.canApprove}
                      className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                        perms.canApprove
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Approve Timetable</span>
                    </button>
                  </div>

                  {/* Step 3: Publication */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      3. Official Publication (§14)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      {fourEyes.isEnabled
                        ? 'Under Four-Eyes Mode, Head of Institution executes final publication release.'
                        : 'Releases schedule and prepares multi-channel notification dispatch.'}
                    </p>
                    <button
                      type="button"
                      onClick={handlePublishTimetable}
                      disabled={fourEyes.isEnabled ? !perms.isHead : !perms.canPublish}
                      className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                        (fourEyes.isEnabled ? perms.isHead : perms.canPublish)
                          ? 'bg-[#C51E28] hover:bg-[#B31821] text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{fourEyes.isEnabled ? 'Head of Inst. Publish' : 'Publish Timetable'}</span>
                    </button>
                  </div>
                </div>

                {/* Step 4: System Activation Notice (§15) */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Automatic System Activation Rule (§15)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      "No human user activates timetables. The system automatically activates published timetables based
                      on effective date and time with immutable cryptographic records."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateSystemActivation}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Simulate System Auto-Activation</span>
                  </button>
                </div>
              </div>

              {/* Immutable Activation Records Log (§15) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Immutable Activation Records Log (§15 &amp; §31)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {activationRecords.length} Official Activation(s) Recorded
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Timetable Version</th>
                        <th className="py-2.5 px-3">Approval Authority</th>
                        <th className="py-2.5 px-3">Publication Authority</th>
                        <th className="py-2.5 px-3">Effective Date / Time</th>
                        <th className="py-2.5 px-3">Cryptographic Stamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activationRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                            {new Date(rec.activationTimestamp).toLocaleDateString()} {new Date(rec.activationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{rec.timetableVersionName}</td>
                          <td className="py-2 px-3">{rec.approvalAuthority}</td>
                          <td className="py-2 px-3">{rec.publicationAuthority}</td>
                          <td className="py-2 px-3 font-semibold text-indigo-700">
                            {rec.effectiveDate} @ {rec.effectiveTime}
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-emerald-800 bg-emerald-50/40">
                            {rec.systemVerificationHash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DELEGATION CENTER */}
          {activeTab === 'DELEGATION' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-indigo-950 flex items-start gap-3">
                <Award className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs">
                    JJSAK Timetable Delegation Charter (§20 - §24)
                  </div>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    Governance delegation is strictly limited to 3 statutory priority roles:
                    <strong> Priority 1: Deputy Director of Academics</strong>,
                    <strong> Priority 2: Head of Institution</strong>, and
                    <strong> Priority 3: Deputy Head of Institution</strong>.
                    Approved exclusively by the <strong>Head of Institution</strong> with automatic time-based activation and revocation.
                  </p>
                </div>
              </div>

              {/* Active Delegation Banner */}
              {activeDelegation ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                      ACTIVE
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-950">
                        {activeDelegation.delegateName} ({activeDelegation.delegateRole})
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        Level: <strong>{activeDelegation.delegationLevel} Delegation</strong> • Priority: {activeDelegation.delegatePriority}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Active Period: {new Date(activeDelegation.startDateTime).toLocaleDateString()} to {new Date(activeDelegation.endDateTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {(perms.isHead || perms.isDirector) && (
                    <button
                      type="button"
                      onClick={() => handleRevokeDelegation(activeDelegation.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Revoke Delegation (§24)
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-center text-xs">
                  No active timetable governance delegation is currently operational. All permanent authority resides with the Director of Academics.
                </div>
              )}

              {/* Request New Delegation Form (Director of Academics Only) */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Initiate New Governance Delegation Request (§23)</h4>
                    <p className="text-xs text-slate-500">Initiated by Director of Academics • Approved by Head of Institution</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                    Authority: Director of Academics Only
                  </span>
                </div>

                <form onSubmit={handleRequestDelegation} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Delegation Level (§20)
                      </label>
                      <select
                        value={delLevel}
                        onChange={(e) => setDelLevel(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Operational">Operational Delegation (Drafts, Periods, Constraints)</option>
                        <option value="Full Governance">Full Governance Delegation (Includes Approval &amp; Publication)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Eligible Delegate (§21 Priority Order)
                      </label>
                      <select
                        value={delRole}
                        onChange={(e) => {
                          const r = e.target.value as EligibleDelegateRole;
                          setDelRole(r);
                          if (r === 'DEPUTY_DIRECTOR_OF_ACADEMICS') setDelName('Mr. David Kiprop');
                          else if (r === 'HEAD_OF_INSTITUTION') setDelName('Dr. Sarah Rotich');
                          else setDelName('Mr. James Koech');
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="DEPUTY_DIRECTOR_OF_ACADEMICS">Priority 1: Deputy Director of Academics</option>
                        <option value="HEAD_OF_INSTITUTION">Priority 2: Head of Institution</option>
                        <option value="DEPUTY_HEAD_OF_INSTITUTION">Priority 3: Deputy Head of Institution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Delegate Full Name</label>
                      <input
                        type="text"
                        value={delName}
                        onChange={(e) => setDelName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={delStart}
                        onChange={(e) => setDelStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={delEnd}
                        onChange={(e) => setDelEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Statutory Eligibility Checklist (§22) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-600 block mb-1.5">
                      Statutory Eligibility Requirements (§22)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active System Account
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Academic Leadership Role
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Timetable Training Certified
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Disciplinary Restrictions
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Academic Suspension
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Legal Standing
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Academic Reason &amp; Handover Justification
                    </label>
                    <textarea
                      rows={2}
                      value={delReason}
                      onChange={(e) => setDelReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!perms.isDirector}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs ${
                        perms.isDirector
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Delegation Request to Head of Institution</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Historical / Pending Delegations Table */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Delegation History &amp; Records (§31)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Delegate</th>
                        <th className="py-2.5 px-3">Role &amp; Priority</th>
                        <th className="py-2.5 px-3">Level</th>
                        <th className="py-2.5 px-3">Active Period</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Approval / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {delegations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900">{d.delegateName}</td>
                          <td className="py-2 px-3">
                            {d.delegateRole} <span className="text-[10px] text-slate-500">(P{d.delegatePriority})</span>
                          </td>
                          <td className="py-2 px-3 font-semibold">{d.delegationLevel}</td>
                          <td className="py-2 px-3 text-[11px] text-slate-500">
                            {new Date(d.startDateTime).toLocaleDateString()} - {new Date(d.endDateTime).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                d.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : d.status === 'Requested'
                                  ? 'bg-amber-100 text-amber-800'
                                  : d.status === 'Revoked'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {d.status === 'Requested' && perms.isHead && (
                              <button
                                type="button"
                                onClick={() => handleApproveDelegation(d.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Approve as Head (§23)
                              </button>
                            )}
                            {d.status === 'Active' && (perms.isHead || perms.isDirector) && (
                              <button
                                type="button"
                                onClick={() => handleRevokeDelegation(d.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Revoke (§24)
                              </button>
                            )}
                            {d.approvedBy && (
                              <div className="text-[10px] text-slate-400">Approved by: {d.approvedBy}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY MANAGEMENT */}
          {activeTab === 'EMERGENCY' && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs">
                    JJSAK Emergency Timetable Management Framework (§25 - §30)
                  </div>
                  <p className="text-[11px] text-rose-900 leading-relaxed">
                    Covers 4 strict emergency categories with time limits, fallback approvers, and multi-channel notifications
                    (In-App &rarr; Push &rarr; Email &rarr; SMS).
                    In Category 1 (Immediate), activation occurs within 15 minutes of publication.
                    In Category 2 (Next-Day), publication must occur before 10:00 PM.
                  </p>
                </div>
              </div>

              {/* Emergency Initiation Form */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-900">Initiate Emergency Schedule Adjustment (§25)</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Authorized Initiators: Director, Head, Deputy, Active Delegate
                  </span>
                </div>

                <form onSubmit={handleInitiateEmergency} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emergency Category (§28)
                      </label>
                      <select
                        value={emgCategory}
                        onChange={(e) => setEmgCategory(e.target.value as EmergencyCategory)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500"
                      >
                        <option value="Category 1 – Immediate Emergency">
                          Category 1 – Immediate Emergency (15-min activation limit)
                        </option>
                        <option value="Category 2 – Next-Day Emergency">
                          Category 2 – Next-Day Emergency (Publish before 10:00 PM)
                        </option>
                        <option value="Category 3 – Temporary Emergency Schedule">
                          Category 3 – Temporary Emergency Schedule (Max 30 days)
                        </option>
                        <option value="Category 4 – Long-Term Emergency Arrangement">
                          Category 4 – Long-Term Emergency Arrangement (Max 90 days, 30-day review)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Target Class / Affected Streams
                      </label>
                      <select
                        value={emgTargetClass}
                        onChange={(e) => setEmgTargetClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Emergency Incident Title
                    </label>
                    <input
                      type="text"
                      value={emgTitle}
                      onChange={(e) => setEmgTitle(e.target.value)}
                      placeholder="e.g. Science Laboratory Emergency Power Outage Re-Routing"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Emergency Justification &amp; Remedial Action
                    </label>
                    <textarea
                      rows={2}
                      value={emgReason}
                      onChange={(e) => setEmgReason(e.target.value)}
                      placeholder="Specify the operational necessity, facilities affected, and continuity arrangements..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
                    />
                  </div>

                  {/* Emergency Notification Delivery Simulation Preview (§30) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-600 block">
                      Automatic Multi-Channel Notification Dispatch (§30)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                        1. In-App Notification (Primary)
                      </span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                        2. Push Notification
                      </span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                        3. Email Dispatch
                      </span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                        4. SMS Gateway (Fallback)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!perms.canInitiateEmergency}
                      className={`px-5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs ${
                        perms.canInitiateEmergency
                          ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Initiate Emergency Schedule (§25)</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active & Past Emergency Schedules */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Emergency Schedules Log &amp; Notification Status
                </h4>

                <div className="space-y-3">
                  {emergencyRecords.map((emg) => (
                    <div
                      key={emg.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">
                            {emg.category}
                          </span>
                          <strong className="text-slate-900 text-sm">{emg.title}</strong>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            emg.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : emg.status === 'Published'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {emg.status}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px]">{emg.reason}</p>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <div>
                          Initiated by: <strong>{emg.initiatedBy}</strong> ({emg.initiatorRole}) on{' '}
                          {new Date(emg.initiatedAt).toLocaleDateString()}
                        </div>
                        {emg.approvedBy && (
                          <div>
                            Approved by: <strong>{emg.approvedBy}</strong> ({emg.approvalType})
                          </div>
                        )}
                      </div>

                      {emg.status === 'Initiated' && (perms.canGovern || perms.isHead) && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleApproveAndPublishEmergency(emg.id)}
                            className="px-4 py-1.5 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Approve &amp; Dispatch Notifications (§26, §27)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHANGE REQUESTS */}
          {activeTab === 'CHANGE_REQUESTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800">
                    Timetable Change Request Queue (§12)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Teachers and Class Teachers submit requests; Director of Academics holds sole approval authority.
                  </p>
                </div>
                {onRequestChangeClick && (
                  <button
                    type="button"
                    onClick={onRequestChangeClick}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Submit New Change Request</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {changeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {req.className} — {req.day} Period {req.periodNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Requested by <strong>{req.requestedBy}</strong> ({req.requesterRole})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">Current Slot:</span>
                        <span className="font-semibold text-slate-800">
                          {req.currentSubject} with {req.currentTeacher}
                        </span>
                      </div>
                      <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-200">
                        <span className="text-[10px] text-indigo-700 font-bold block">Proposed Modification:</span>
                        <span className="font-semibold text-indigo-950">
                          {req.proposedSubject || 'Special Session'} with {req.proposedTeacherName || 'Same Teacher'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Reason:</strong> {req.reason}
                    </div>

                    {req.reviewedBy && (
                      <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>Reviewed by: {req.reviewedBy}</span>
                        {req.reviewComment && <span>Remarks: {req.reviewComment}</span>}
                      </div>
                    )}

                    {req.status === 'Pending Review' && perms.canGovern && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleReviewChangeRequest(req.id, 'Rejected')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewChangeRequest(req.id, 'Approved')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Approve Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CONSTRAINTS & DOUBLE LESSONS */}
          {activeTab === 'CONSTRAINTS' && (
            <form onSubmit={handleSaveConstraints} className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800">
                    Statutory Timetable Constraints Engine (§5 &amp; §7)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Controls workload caps, period distributions, and CBC practical double lesson requirements.
                  </p>
                </div>
                {perms.canGovern && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Save Constraints Config
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Workload Limits (§5)</span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Max Lessons / Teacher / Day</label>
                    <input
                      type="number"
                      value={constraints.maxLessonsPerTeacherPerDay}
                      onChange={(e) =>
                        setConstraints({ ...constraints, maxLessonsPerTeacherPerDay: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Max Lessons / Class / Day</label>
                    <input
                      type="number"
                      value={constraints.maxLessonsPerClassPerDay}
                      onChange={(e) =>
                        setConstraints({ ...constraints, maxLessonsPerClassPerDay: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Max Consecutive Lessons</label>
                    <input
                      type="number"
                      value={constraints.maxConsecutiveLessons}
                      onChange={(e) =>
                        setConstraints({ ...constraints, maxConsecutiveLessons: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Weekly Teacher Workload Cap</label>
                    <input
                      type="number"
                      value={constraints.teacherWorkloadLimitWeekly}
                      onChange={(e) =>
                        setConstraints({ ...constraints, teacherWorkloadLimitWeekly: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-700 block">
                    Double Lesson Management (§7)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={constraints.doubleLessonsEnabled}
                      onChange={(e) =>
                        setConstraints({ ...constraints, doubleLessonsEnabled: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-700">Enable Double Lessons</span>
                  </label>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Min Double Lessons / Week</label>
                    <input
                      type="number"
                      value={constraints.minDoubleLessonsPerWeek}
                      onChange={(e) =>
                        setConstraints({ ...constraints, minDoubleLessonsPerWeek: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Max Double Lessons / Week</label>
                    <input
                      type="number"
                      value={constraints.maxDoubleLessonsPerWeek}
                      onChange={(e) =>
                        setConstraints({ ...constraints, maxDoubleLessonsPerWeek: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={constraints.laboratorySessionsConfigured}
                        onChange={(e) =>
                          setConstraints({ ...constraints, laboratorySessionsConfigured: e.target.checked })
                        }
                        className="rounded text-indigo-600"
                      />
                      <span>Laboratory Practical Sessions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={constraints.computerPracticalSessionsConfigured}
                        onChange={(e) =>
                          setConstraints({ ...constraints, computerPracticalSessionsConfigured: e.target.checked })
                        }
                        className="rounded text-indigo-600"
                      />
                      <span>Computer Practical Sessions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={constraints.projectBasedLearningBlocksConfigured}
                        onChange={(e) =>
                          setConstraints({ ...constraints, projectBasedLearningBlocksConfigured: e.target.checked })
                        }
                        className="rounded text-indigo-600"
                      />
                      <span>Project-Based Learning (PBL) Blocks</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    Specialized Constraints (§5)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={constraints.roomAvailabilityConstraints}
                      onChange={(e) =>
                        setConstraints({ ...constraints, roomAvailabilityConstraints: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Room Availability Constraints</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={constraints.laboratoryAvailabilityConstraints}
                      onChange={(e) =>
                        setConstraints({ ...constraints, laboratoryAvailabilityConstraints: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Science Lab Allocation Constraints</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={constraints.cbcPracticalLessonRequirements}
                      onChange={(e) =>
                        setConstraints({ ...constraints, cbcPracticalLessonRequirements: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>CBC Practical Lesson Quota Enforcement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={constraints.gradeSpecificScheduling}
                      onChange={(e) =>
                        setConstraints({ ...constraints, gradeSpecificScheduling: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Grade-Specific Scheduling Requirements</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={constraints.examinationPreparationPeriods}
                      onChange={(e) =>
                        setConstraints({ ...constraints, examinationPreparationPeriods: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Examination Preparation Periods Protected</span>
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* TAB 6: TEACHER TIME-OFF & PERIODS */}
          {activeTab === 'TIME_OFF' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black uppercase text-slate-800">
                  Teacher Time-Off &amp; Duty Protection (§6)
                </h4>
                <p className="text-[11px] text-slate-500">
                  "The timetable engine shall automatically prevent lesson allocation during approved time-off periods."
                </p>
              </div>

              {/* Add Time-Off Form */}
              <form onSubmit={handleAddTimeOff} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-700 block pb-2 border-b border-slate-100">
                  Add Approved Teacher Time-Off / Protected Duty Period
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Teacher</label>
                    <select
                      value={newToffTeacherId}
                      onChange={(e) => setNewToffTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Time-Off Type</label>
                    <select
                      value={newToffType}
                      onChange={(e) => setNewToffType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Leave">Leave Period</option>
                      <option value="Unavailable">Unavailable Period</option>
                      <option value="Blocked Day">Blocked Day</option>
                      <option value="Blocked Period">Blocked Period</option>
                      <option value="Meeting">Meeting Period</option>
                      <option value="Training">Training Period</option>
                      <option value="School Event">School Event Period</option>
                      <option value="Administrative Duty">Administrative Duty Period</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Day</label>
                    <select
                      value={newToffDay}
                      onChange={(e) => setNewToffDay(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="All">All Days (Recurring)</option>
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Period Number</label>
                    <select
                      value={newToffPeriod}
                      onChange={(e) => setNewToffPeriod(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                        <option key={p} value={p}>
                          Period {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason / Duty Mandate</label>
                  <input
                    type="text"
                    value={newToffReason}
                    onChange={(e) => setNewToffReason(e.target.value)}
                    placeholder="e.g. County In-Service CBC Workshop or Morning Assembly Duty"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!perms.canGovern}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs ${
                      perms.canGovern
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Register Time-Off Reservation</span>
                  </button>
                </div>
              </form>

              {/* Time-Off Records List */}
              <div className="space-y-2">
                {timeOffRecords.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{t.teacherName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
                          {t.type}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {t.day} — Period(s) {t.periodNumbers.join(', ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{t.reason}</p>
                    </div>

                    {perms.canGovern && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeOff(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: VALIDATION & CONFLICTS */}
          {activeTab === 'VALIDATION' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800">
                    Conflict Detection &amp; Statutory Overrides (§8 &amp; §16)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    "Only the Director of Academics or an authorized Full Governance Delegate may approve conflict overrides."
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunValidation}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Re-Run Validation Scan</span>
                </button>
              </div>

              {/* Validation Report Card */}
              {validationReport && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    validationReport.passed
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {validationReport.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-rose-600" />
                      )}
                      <span className="font-black text-xs text-slate-900">
                        {validationReport.passed
                          ? 'Pre-Publication Validation PASSED — Approved for Publication'
                          : `Validation FAILED (${validationReport.criticalFailuresCount} Critical Issue(s))`}{' '}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Validated by: {validationReport.validatedBy} ({validationReport.validatedRole})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {validationReport.checks.map((chk) => (
                      <div
                        key={chk.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{chk.name}</span>
                            <span className="text-[10px] text-slate-400">({chk.category})</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{chk.details}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            chk.status === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : chk.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Clashes with Authorized Override Option (§8) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Detected Timetable Collisions ({clashes.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {clashes.length === 0 ? 'Zero collisions detected.' : 'Formal override requires Director authorization.'}
                  </span>
                </div>

                {clashes.length === 0 ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-900 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Clean Schedule! 100% Conflict-Free Lesson Matrix across all streams and facilities.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clashes.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>{c.description}</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                            {c.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {c.day} Period {c.periodNumber} ({c.periodTime}) • Streams: {c.conflictingClasses.join(', ')}
                        </div>

                        {perms.canGovern && (
                          <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">
                              Suggested: {c.suggestedFix || 'Reallocate to another period'}
                            </span>
                            {overrideClashId === c.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={overrideJustification}
                                  onChange={(e) => setOverrideJustification(e.target.value)}
                                  placeholder="Enter override justification..."
                                  className="bg-white border border-rose-300 rounded-lg px-2.5 py-1 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApproveConflictOverride(c)}
                                  className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
                                >
                                  Confirm Override (§8)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOverrideClashId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setOverrideClashId(c.id)}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold"
                              >
                                Authorize Conflict Override (§8)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-medium">
            JJSAK Final Timetable Governance Framework • Locked Version
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
          >
            Close Governance Center
          </button>
        </div>
      </div>
    </div>
  );
};
