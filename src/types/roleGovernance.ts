import { UserRole } from './index';

export type InstitutionalRoleCategory =
  | 'PLATFORM_OWNER'
  | 'INSTITUTIONAL_LEADERSHIP'
  | 'ACADEMIC_ADMINISTRATION'
  | 'INSTRUCTIONAL_STAFF'
  | 'OPERATIONAL_STAFF'
  | 'STAKEHOLDER';

export type RoleChangeActionType =
  | 'PROMOTION'
  | 'DEMOTION'
  | 'TRANSFER'
  | 'ASSIGNMENT'
  | 'ACTIVATION'
  | 'SUSPENSION'
  | 'REMOVAL';

export interface RoleAssignmentRule {
  targetRoleKey: string;
  targetRoleTitle: string;
  category: InstitutionalRoleCategory;
  authorizedApproverRoles: UserRole[];
  authorizedApproverDescription: string;
  requiresWorkflowApproval: boolean;
  tierLevel: number;
  description: string;
  prohibitedSelfActions: string[];
}

/**
 * Immutable Role Change Audit Record (§7-8)
 * All role changes shall generate immutable audit records.
 * Audit records shall not be editable or deletable by school users.
 */
export interface RoleChangeAuditRecord {
  id: string;
  recordHash: string; // Cryptographic SHA/HMAC representation
  institutionId: string;
  institutionName: string;
  affectedUserId: string;
  affectedUserName: string;
  previousRole: string;
  newRole: string;
  actionType: RoleChangeActionType;
  initiatorId: string;
  initiatorName: string;
  initiatorRole: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string; // ISO 8601
  deviceInfo: string;
  ipAddress: string;
  reason: string; // Mandatory justification
  isImmutable: true;
  notificationDispatched: boolean;
}

/**
 * Role Change Request for multi-step approval workflows (§4)
 */
export interface RoleChangeRequest {
  id: string;
  institutionId: string;
  institutionName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail?: string;
  currentRole: string;
  proposedRole: string;
  actionType: RoleChangeActionType;
  reason: string;
  initiatorId: string;
  initiatorName: string;
  initiatorRole: string;
  requiredApproverRoles: UserRole[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  deviceInfo: string;
  ipAddress: string;
  approvedBy?: {
    id: string;
    name: string;
    role: string;
    timestamp: string;
    notes?: string;
  };
  rejectedBy?: {
    id: string;
    name: string;
    role: string;
    timestamp: string;
    reason: string;
  };
}

/**
 * User In-App Notification (§4.7)
 */
export interface UserRoleNotification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'ROLE_CHANGE_NOTICE' | 'SECURITY_VIOLATION' | 'APPROVAL_REQUEST';
  timestamp: string;
  read: boolean;
  metadata?: {
    previousRole?: string;
    newRole?: string;
    approverName?: string;
    reason?: string;
    institutionName?: string;
  };
}

/**
 * Validation result when checking role change authority
 */
export interface RoleChangeValidationResult {
  allowed: boolean;
  errorCode?:
    | 'SELF_SERVICE_PROHIBITED'
    | 'UNAUTHORIZED_APPROVER'
    | 'PRIVILEGE_ELEVATION_PROHIBITED'
    | 'CROSS_TENANT_VIOLATION'
    | 'REASON_REQUIRED'
    | 'SAME_ROLE_SPECIFIED';
  reason: string;
  requiresWorkflow?: boolean;
  requiredApproverDescription?: string;
}
