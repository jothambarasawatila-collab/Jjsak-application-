import { DayOfWeek } from './timetable';

export type TimetableWorkflowState =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Active'
  | 'Superseded'
  | 'Archived';

export type DelegationLevel = 'Operational' | 'Full Governance';

export type EligibleDelegateRole =
  | 'DEPUTY_DIRECTOR_OF_ACADEMICS'
  | 'HEAD_OF_INSTITUTION'
  | 'DEPUTY_HEAD_OF_INSTITUTION';

export interface DelegateEligibility {
  isActive: boolean;
  holdsAcademicLeadership: boolean;
  trainingCompleted: boolean;
  noSuspension: boolean;
  noDisciplinaryRestrictions: boolean;
  activeSystemAccount: boolean;
}

export interface TimetableDelegation {
  id: string;
  delegationLevel: DelegationLevel;
  delegateId: string;
  delegateName: string;
  delegateRole: EligibleDelegateRole;
  delegatePriority: 1 | 2 | 3;
  eligibility: DelegateEligibility;
  requestedBy: string; // Director of Academics
  requestedAt: string;
  approvedBy?: string; // Head of Institution
  approvedAt?: string;
  startDateTime: string;
  endDateTime: string;
  status: 'Requested' | 'Approved' | 'Active' | 'Revoked' | 'Expired';
  reason: string;
  revokedBy?: string;
  revokedAt?: string;
  revocationReason?: string;
}

export type EmergencyCategory =
  | 'Category 1 – Immediate Emergency'
  | 'Category 2 – Next-Day Emergency'
  | 'Category 3 – Temporary Emergency Schedule'
  | 'Category 4 – Long-Term Emergency Arrangement';

export type EmergencyApprovalType =
  | 'Normal Operations (Director of Academics)'
  | 'Full Governance Delegation'
  | 'Emergency Continuity Fallback (Head of Institution)';

export interface EmergencyNotificationRecipients {
  affectedTeachersCount: number;
  classTeachersCount: number;
  invigilatorsCount: number;
  affectedLearnersCount: number;
  parentsNotified: boolean;
  leadershipNotified: boolean;
}

export type NotificationChannel = 'In-App' | 'Push' | 'Email' | 'SMS';

export interface EmergencyTimetableRecord {
  id: string;
  title: string;
  category: EmergencyCategory;
  reason: string;
  initiatedBy: string;
  initiatorRole: string;
  initiatedAt: string;
  approvedBy?: string;
  approverRole?: string;
  approvedAt?: string;
  approvalType: EmergencyApprovalType;
  publishedBy?: string;
  publisherRole?: string;
  publishedAt?: string;
  publicationDeadlineTime?: string; // e.g., "22:00" for Category 2
  maxActivationDelayMinutes?: number; // 15 for Category 1
  maxSchedulingDays?: number; // 30 for Cat 3, 90 for Cat 4
  mandatoryReviewDays?: number; // 30 for Cat 4
  mandatoryEndDate?: string;
  status: 'Initiated' | 'Approved' | 'Published' | 'Active' | 'Superseded' | 'Resolved';
  activatedAt?: string;
  affectedClasses: string[];
  affectedTeachers: string[];
  recipients: EmergencyNotificationRecipients;
  dispatchChannels: NotificationChannel[];
  channelDeliveryStatus: Record<NotificationChannel, 'Delivered' | 'Failed' | 'Pending' | 'Fallback Initiated'>;
  fallbackTriggered: boolean;
}

export interface TimetableChangeRequest {
  id: string;
  requestedBy: string;
  requesterRole: 'TEACHER' | 'CLASS_TEACHER' | string;
  requesterTeacherId?: string;
  requestedAt: string;
  className: string;
  day: DayOfWeek;
  periodNumber: number;
  currentSubject: string;
  currentTeacher: string;
  proposedSubject?: string;
  proposedTeacherId?: string;
  proposedTeacherName?: string;
  reason: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ImmutableActivationRecord {
  id: string;
  activationTimestamp: string;
  timetableVersionId: string;
  timetableVersionName: string;
  approvalAuthority: string;
  approvalRole: string;
  publicationAuthority: string;
  publicationRole: string;
  effectiveDate: string;
  effectiveTime: string;
  isFourEyesMode: boolean;
  activatedAutomaticallyBySystem: boolean;
  systemVerificationHash: string;
}

export interface PrePublicationCheckItem {
  id: string;
  name: string;
  category:
    | 'Teacher Availability'
    | 'Class Availability'
    | 'Room Availability'
    | 'Laboratory Availability'
    | 'Subject Allocations'
    | 'Double Lesson Requirements'
    | 'Time-Off Requirements'
    | 'Assessment Conflicts';
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
}

export interface PrePublicationValidationReport {
  timestamp: string;
  validatedBy: string;
  validatedRole: string;
  passed: boolean;
  criticalFailuresCount: number;
  warningsCount: number;
  checks: PrePublicationCheckItem[];
}

export interface TimetableConstraintsConfig {
  maxLessonsPerTeacherPerDay: number; // e.g. 6
  maxLessonsPerClassPerDay: number; // e.g. 8
  maxConsecutiveLessons: number; // e.g. 3
  subjectDistributionRules: string;
  teacherWorkloadLimitWeekly: number; // e.g. 26
  roomAvailabilityConstraints: boolean;
  laboratoryAvailabilityConstraints: boolean;
  cbcPracticalLessonRequirements: boolean;
  resourceAllocationRules: boolean;
  gradeSpecificScheduling: boolean;
  examinationPreparationPeriods: boolean;
  institutionSpecificPolicies: string;
  // Double Lesson Management
  doubleLessonsEnabled: boolean;
  minDoubleLessonsPerWeek: number;
  maxDoubleLessonsPerWeek: number;
  laboratorySessionsConfigured: boolean;
  computerPracticalSessionsConfigured: boolean;
  projectBasedLearningBlocksConfigured: boolean;
}

export interface TeacherTimeOffRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  type:
    | 'Leave'
    | 'Unavailable'
    | 'Blocked Day'
    | 'Blocked Period'
    | 'Meeting'
    | 'Training'
    | 'School Event'
    | 'Administrative Duty';
  day: DayOfWeek | 'All';
  periodNumbers: number[]; // e.g. [1, 2]
  startDate: string;
  endDate: string;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  isActive: boolean;
}

export interface ConflictOverrideRecord {
  id: string;
  clashId: string;
  clashType: string;
  clashDescription: string;
  authorizedBy: string;
  authorizedRole: string;
  justification: string;
  timestamp: string;
}

export interface FourEyesGovernanceConfig {
  isEnabled: boolean;
  approverRole: 'DIRECTOR_OF_ACADEMICS';
  publisherRole: 'HEAD_OF_INSTITUTION';
}

export interface TimetablePermissions {
  canAccess: boolean;
  canGovern: boolean;
  canOperateDrafts: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canUnpublish: boolean;
  canSubmitChangeRequest: boolean;
  canInitiateEmergency: boolean;
  canApproveDelegation: boolean;
  isClassTeacher: boolean;
  isTeacher: boolean;
  isHead: boolean;
  isDeputy: boolean;
  isDirector: boolean;
  isLearner: boolean;
  isParent: boolean;
  isFinance: boolean;
  isGuidance: boolean;
  accessDescription: string;
}
