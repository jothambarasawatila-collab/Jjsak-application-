import { UserRole } from './index';

// =========================================================================
// JJSAK Owner / Super Administrator Master Governance Types
// =========================================================================

/**
 * §3 & §7: Platform Owner & Dual Identity Structure
 */
export interface OwnerGovernanceIdentity {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SYSTEM_ADMIN';
  systemRole?: 'SUPER_ADMIN' | 'SYSTEM_ADMIN';
  domain: string; // 'platform-governance.jjsak.internal'
  designation: string;
  phoneNumber?: string;
  mfaActive: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface SchoolUserIdentity {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  schoolId: string;
  schoolName: string;
  schoolDomain: string;
  designation: string;
  isDesignatedStaff: boolean;
  password?: string;
  lastLogin?: string;
}

export interface DualIdentityProfile {
  ownerAccount: OwnerGovernanceIdentity;
  schoolAccounts: SchoolUserIdentity[];
  activeMode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL';
  activeSchoolAccountId?: string;
  activeSchoolTenantId?: string;
  lastSwitchedAt: string;
}

/**
 * §9: Approved Exceptions
 */
export type ExceptionCategory =
  | 'TECHNICAL_SUPPORT'
  | 'SECURITY_INVESTIGATION'
  | 'COMPLIANCE_REVIEW'
  | 'DISASTER_RECOVERY'
  | 'SCHOOL_AUTHORIZED_ASSISTANCE'
  | 'LEGAL_REQUIREMENT';

export interface ApprovedExceptionRecord {
  id: string; // e.g. EXP-2026-001
  category: ExceptionCategory;
  categoryLabel: string;
  schoolId: string;
  schoolName: string;
  ticketOrIncidentRef: string;
  justification: string;
  scope: string[];
  authorizedBy: string;
  requestedBy: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'COMPLETED';
  createdAt: string;
  expiresAt: string;
  actionsPerformed: string[];
  auditSignature: string;
}

/**
 * §10 & §11: 12-Phase Emergency Access Approval & Break-Glass Workflow
 */
export type EmergencySeverityLevel =
  | 'LEVEL_1_CRITICAL' // Data breach, cyberattack, platform outage
  | 'LEVEL_2_HIGH'     // Major service degradation, tenant-wide auth failure
  | 'LEVEL_3_MEDIUM';   // Significant operational disruption

export type EmergencyCategory =
  | 'CRITICAL_SYSTEM_FAILURE'
  | 'CYBERSECURITY_INCIDENT'
  | 'DATA_INTEGRITY_INCIDENT'
  | 'LEGAL_REGULATORY_EMERGENCY'
  | 'HUMAN_SAFETY_INCIDENT';

export type EmergencyWorkflowPhase =
  | 1  // Phase 1 - Incident Detection
  | 2  // Phase 2 - Access Request
  | 3  // Phase 3 - Approval
  | 4  // Phase 4 - Break-Glass Activation
  | 5  // Phase 5 - Session Activation
  | 6  // Phase 6 - School Context Entry
  | 7  // Phase 7 - Active Monitoring
  | 8  // Phase 8 - Resolution
  | 9  // Phase 9 - Automatic Revocation
  | 10 // Phase 10 - School Notification
  | 11 // Phase 11 - Post-Incident Review
  | 12; // Phase 12 - Closure

export interface EmergencyIncident {
  id: string; // e.g. INC-2026-9041
  severity: EmergencySeverityLevel;
  category: EmergencyCategory;
  title: string;
  description: string;
  detectedAt: string;
  detectedBy: string;
  affectedSchoolId: string;
  affectedSchoolName: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  currentPhase: EmergencyWorkflowPhase;
}

export interface EmergencyAccessRequest {
  requestId: string; // EAR-2026-XXXX
  incidentId: string;
  schoolId: string;
  schoolName: string;
  category: EmergencyCategory;
  justification: string;
  requestedScope: string[];
  expectedDurationHours: number; // Max 4 for critical, max 24 for DR
  requestedBy: string;
  requesterRole: string;
  createdAt: string;
  isBreakGlass: boolean;
}

export interface EmergencyAccessApproval {
  approvalId: string;
  requestId: string;
  incidentId: string;
  approverName: string;
  approverRole: 'PLATFORM_OWNER' | 'SECURITY_ADMIN' | 'COMPLIANCE_OFFICER' | 'CTO';
  decision: 'APPROVED' | 'APPROVED_WITH_RESTRICTIONS' | 'REJECTED';
  restrictions?: string;
  selfApproved: boolean;
  reviewDeadline: string; // 72h for self-approval, 24h for break-glass
  approvedAt: string;
}

export interface EmergencyAccessSession {
  sessionId: string; // EAS-SESSION-XXXX
  incidentId: string;
  requestId: string;
  schoolId: string;
  schoolName: string;
  operatorName: string;
  operatorRole: string;
  deviceDetails: string;
  ipAddress: string;
  scope: string[];
  activatedAt: string;
  expiresAt: string;
  isActive: boolean;
  isBreakGlass: boolean;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
}

export interface EmergencyMonitoringLog {
  id: string;
  sessionId: string;
  incidentId: string;
  schoolId: string;
  timestamp: string;
  eventType:
    | 'VIEW_RECORD'
    | 'SEARCH'
    | 'DOWNLOAD'
    | 'EXPORT'
    | 'CONFIG_CHANGE'
    | 'PERMISSION_CHANGE'
    | 'SCOPE_VIOLATION_ATTEMPT';
  resource: string;
  details: string;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL_ALERT';
}

export interface EmergencyResolution {
  incidentId: string;
  resolvedAt: string;
  resolvedBy: string;
  actionsTaken: string;
  findings: string;
  correctiveActions: string;
  outcomeStatus: 'RESOLVED' | 'PARTIALLY_RESOLVED' | 'ESCALATED' | 'MONITORING_REQUIRED';
}

export interface EmergencySchoolNotification {
  id: string;
  schoolId: string;
  incidentRef: string;
  accessReason: string;
  accessDates: string;
  resolutionSummary: string;
  dispatchedAt: string;
  delivered: boolean;
}

export interface EmergencyPostIncidentReview {
  id: string;
  incidentId: string;
  reviewType: 'BREAK_GLASS_24H' | 'CRITICAL_72H' | 'GENERAL_7D';
  reviewerName: string;
  justificationVerified: boolean;
  scopeComplianceVerified: boolean;
  auditCompletenessVerified: boolean;
  policyComplianceVerified: boolean;
  reviewNotes: string;
  completedAt: string;
}

export interface IncidentClosure {
  incidentId: string;
  accessRevoked: boolean;
  auditCompleted: boolean;
  reviewCompleted: boolean;
  findingsDocumented: boolean;
  closedAt: string;
  closedBy: string;
}

export interface FullEmergencyIncidentLifecycle {
  incident: EmergencyIncident;
  request?: EmergencyAccessRequest;
  approval?: EmergencyAccessApproval;
  session?: EmergencyAccessSession;
  monitoringLogs: EmergencyMonitoringLog[];
  resolution?: EmergencyResolution;
  schoolNotification?: EmergencySchoolNotification;
  postIncidentReview?: EmergencyPostIncidentReview;
  closure?: IncidentClosure;
}
