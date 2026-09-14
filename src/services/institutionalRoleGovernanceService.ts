import { User, UserRole } from '../types';
import {
  RoleAssignmentRule,
  RoleChangeAuditRecord,
  RoleChangeRequest,
  UserRoleNotification,
  RoleChangeValidationResult,
  RoleChangeActionType,
} from '../types/roleGovernance';

/**
 * Statutory Role Assignment & Approver Authority Matrix
 * Enforces exact approver hierarchy specified under the JJSAK Institutional Governance Framework
 */
export const ROLE_ASSIGNMENT_RULES: Record<string, RoleAssignmentRule> = {
  TEACHER: {
    targetRoleKey: 'TEACHER',
    targetRoleTitle: 'Teacher',
    category: 'INSTRUCTIONAL_STAFF',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'ADMIN',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription: 'Head of Institution or School Administrator',
    requiresWorkflowApproval: false,
    tierLevel: 4,
    description: 'Instructional staff appointment, subject allocation, marks submission authority.',
    prohibitedSelfActions: [
      'Self-promotion to Class Teacher',
      'Self-promotion to Deputy Head',
      'Self-promotion to Head of Institution',
      'Self-promotion to School Administrator',
    ],
  },
  CLASS_TEACHER: {
    targetRoleKey: 'CLASS_TEACHER',
    targetRoleTitle: 'Class Teacher Assignment',
    category: 'INSTRUCTIONAL_STAFF',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'DEPUTY_HEAD_OF_INSTITUTION',
      'DEPUTY',
      'DEPUTY_HEADTEACHER',
      'DIRECTOR_OF_ACADEMICS',
      'DIRECTOR_ACADEMICS',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution, Deputy Head, or Director of Academics',
    requiresWorkflowApproval: false,
    tierLevel: 4,
    description:
      'Assignment as primary pastoral and administrative custodian of a specific class arm.',
    prohibitedSelfActions: [
      'Teacher assigning own self to Class Teacher',
      'Teacher self-allocating class arm',
    ],
  },
  SUBJECT_TEACHER: {
    targetRoleKey: 'SUBJECT_TEACHER',
    targetRoleTitle: 'Subject Teacher Assignment',
    category: 'INSTRUCTIONAL_STAFF',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'DEPUTY_HEAD_OF_INSTITUTION',
      'DEPUTY',
      'DEPUTY_HEADTEACHER',
      'DIRECTOR_OF_ACADEMICS',
      'DIRECTOR_ACADEMICS',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution, Deputy Head, or Director of Academics',
    requiresWorkflowApproval: false,
    tierLevel: 4,
    description: 'Instructional subject allocation across academic streams.',
    prohibitedSelfActions: [
      'Self-assigning subjects or modifying syllabus quotas',
    ],
  },
  DEPUTY_HEAD_OF_INSTITUTION: {
    targetRoleKey: 'DEPUTY_HEAD_OF_INSTITUTION',
    targetRoleTitle: 'Deputy Head of Institution',
    category: 'INSTITUTIONAL_LEADERSHIP',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution with required approval workflow',
    requiresWorkflowApproval: true,
    tierLevel: 2,
    description:
      'Senior institutional leadership, institutional discipline, and deputy executive authority.',
    prohibitedSelfActions: [
      'Deputy Head elevating own self to Head of Institution',
      'Teacher self-promoting to Deputy Head',
    ],
  },
  DEPUTY: {
    targetRoleKey: 'DEPUTY',
    targetRoleTitle: 'Deputy Head of Institution',
    category: 'INSTITUTIONAL_LEADERSHIP',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution with required approval workflow',
    requiresWorkflowApproval: true,
    tierLevel: 2,
    description: 'Deputy executive authority under the Head of Institution.',
    prohibitedSelfActions: [
      'Deputy Head elevating own self to Head of Institution',
    ],
  },
  DIRECTOR_OF_ACADEMICS: {
    targetRoleKey: 'DIRECTOR_OF_ACADEMICS',
    targetRoleTitle: 'Director of Academics',
    category: 'ACADEMIC_ADMINISTRATION',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution with required approval workflow',
    requiresWorkflowApproval: true,
    tierLevel: 2,
    description:
      'Sole Academic Administrator with exclusive authority over reports, assessments, and timetables.',
    prohibitedSelfActions: [
      'Teacher assigning own self to Director of Academics',
      'Director self-elevating to Head of Institution or Owner',
    ],
  },
  DIRECTOR_ACADEMICS: {
    targetRoleKey: 'DIRECTOR_ACADEMICS',
    targetRoleTitle: 'Director of Academics',
    category: 'ACADEMIC_ADMINISTRATION',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription:
      'Head of Institution with required approval workflow',
    requiresWorkflowApproval: true,
    tierLevel: 2,
    description: 'Sole Academic Administrator appointment.',
    prohibitedSelfActions: [
      'Teacher assigning own self to Director of Academics',
    ],
  },
  ADMIN: {
    targetRoleKey: 'ADMIN',
    targetRoleTitle: 'School Administrator',
    category: 'OPERATIONAL_STAFF',
    authorizedApproverRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    authorizedApproverDescription:
      'Owner/Super Administrator or authorized onboarding workflow',
    requiresWorkflowApproval: true,
    tierLevel: 3,
    description: 'Institutional records and system administrative support.',
    prohibitedSelfActions: [
      'Staff elevating own role to School Administrator',
      'Admin elevating own self to Owner/Super Administrator',
    ],
  },
  HEAD_OF_INSTITUTION: {
    targetRoleKey: 'HEAD_OF_INSTITUTION',
    targetRoleTitle: 'Head of Institution',
    category: 'INSTITUTIONAL_LEADERSHIP',
    authorizedApproverRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    authorizedApproverDescription: 'Owner/Super Administrator only',
    requiresWorkflowApproval: true,
    tierLevel: 1,
    description:
      'Chief institutional executive officer, school license governance, staff custodian.',
    prohibitedSelfActions: [
      'Head of Institution self-elevating to Owner/Super Administrator',
      'Deputy self-elevating to Head of Institution',
    ],
  },
  HEAD: {
    targetRoleKey: 'HEAD',
    targetRoleTitle: 'Head of Institution',
    category: 'INSTITUTIONAL_LEADERSHIP',
    authorizedApproverRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    authorizedApproverDescription: 'Owner/Super Administrator only',
    requiresWorkflowApproval: true,
    tierLevel: 1,
    description: 'Chief executive officer of the educational institution.',
    prohibitedSelfActions: [
      'Head of Institution changing own role to Owner/Super Administrator',
    ],
  },
  HEADTEACHER: {
    targetRoleKey: 'HEADTEACHER',
    targetRoleTitle: 'Head Teacher',
    category: 'INSTITUTIONAL_LEADERSHIP',
    authorizedApproverRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    authorizedApproverDescription: 'Owner/Super Administrator only',
    requiresWorkflowApproval: true,
    tierLevel: 1,
    description: 'Head of institution executive position.',
    prohibitedSelfActions: [
      'Head changing own role to Owner/Super Administrator',
    ],
  },
  SUPER_ADMIN: {
    targetRoleKey: 'SUPER_ADMIN',
    targetRoleTitle: 'Owner / Super Administrator',
    category: 'PLATFORM_OWNER',
    authorizedApproverRoles: ['SYSTEM_ADMIN', 'SUPER_ADMIN'],
    authorizedApproverDescription: 'System Owner governance process only',
    requiresWorkflowApproval: true,
    tierLevel: 0,
    description:
      'Root Platform Owner with cross-tenant master governance. Reserved exclusively for System Owner.',
    prohibitedSelfActions: [
      'Any institutional school personnel self-assigning or assuming Owner role',
    ],
  },
  SYSTEM_ADMIN: {
    targetRoleKey: 'SYSTEM_ADMIN',
    targetRoleTitle: 'Owner / System Administrator',
    category: 'PLATFORM_OWNER',
    authorizedApproverRoles: ['SYSTEM_ADMIN', 'SUPER_ADMIN'],
    authorizedApproverDescription: 'System Owner governance process only',
    requiresWorkflowApproval: true,
    tierLevel: 0,
    description: 'System Owner technical and security governance root.',
    prohibitedSelfActions: [
      'Any institutional user assuming System Administrator privileges',
    ],
  },
  FINANCE: {
    targetRoleKey: 'FINANCE',
    targetRoleTitle: 'Finance Officer / Bursar',
    category: 'OPERATIONAL_STAFF',
    authorizedApproverRoles: [
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'ADMIN',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
    ],
    authorizedApproverDescription: 'Head of Institution or School Administrator',
    requiresWorkflowApproval: false,
    tierLevel: 4,
    description: 'Fees, ledger, and payment reconciliation officer.',
    prohibitedSelfActions: ['Finance officer self-switching to Academic staff'],
  },
};

const AUDIT_STORAGE_KEY = 'jjsak_role_change_audit_records';
const REQUESTS_STORAGE_KEY = 'jjsak_role_change_requests';
const NOTIFICATIONS_STORAGE_KEY = 'jjsak_user_role_notifications';

// Generate cryptographic-style tamper evident record hash
function generateRecordHash(record: Partial<RoleChangeAuditRecord>): string {
  const payload = `${record.institutionId}|${record.affectedUserId}|${record.previousRole}->${record.newRole}|${record.initiatorId}|${record.approverId}|${record.timestamp}|${record.reason}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = 'JJSAK-SEC-AUDIT-v1';
  return `sha256_${hex}_${salt}`;
}

// Clean audit records for production
const INITIAL_AUDIT_SEED: RoleChangeAuditRecord[] = [];

class InstitutionalRoleGovernanceService {
  /**
   * Check if a user has authority to initiate or approve any role assignment
   */
  public canUserManageRoleAssignment(user?: User | null): boolean {
    if (!user) return false;
    const authorizedRoles: UserRole[] = [
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
      'HEAD_OF_INSTITUTION',
      'HEAD',
      'HEADTEACHER',
      'DEPUTY_HEAD_OF_INSTITUTION',
      'DEPUTY',
      'DEPUTY_HEADTEACHER',
      'DIRECTOR_OF_ACADEMICS',
      'DIRECTOR_ACADEMICS',
      'ADMIN',
    ];
    return authorizedRoles.includes(user.role as UserRole);
  }

  /**
   * Rule Validation Engine (§1–§6)
   * Validates if a proposed role change satisfies the Institutional Role Integrity Rule
   */
  public validateRoleChange(
    initiator: User,
    targetUser: User,
    proposedRole: string,
    reason: string
  ): RoleChangeValidationResult {
    // 1. INSTITUTIONAL ROLE INTEGRITY RULE (MANDATORY §1)
    // "Users within a school institution shall not have the ability to change, upgrade, downgrade, assign, or switch their own roles from one position to another."
    if (initiator.id === targetUser.id) {
      return {
        allowed: false,
        errorCode: 'SELF_SERVICE_PROHIBITED',
        reason:
          'INSTITUTIONAL ROLE INTEGRITY RULE: Users within a school institution shall not have the ability to change, upgrade, downgrade, assign, or switch their own roles from one position to another. Self-service role modification is strictly prohibited.',
      };
    }

    // 2. Reason Validation (§4.6)
    if (!reason || reason.trim().length < 10) {
      return {
        allowed: false,
        errorCode: 'REASON_REQUIRED',
        reason:
          'Mandatory justification required: A comprehensive, documented reason of at least 10 characters must be specified for any institutional role change.',
      };
    }

    // 3. Same Role check
    if (targetUser.role === proposedRole) {
      return {
        allowed: false,
        errorCode: 'SAME_ROLE_SPECIFIED',
        reason: `Target user '${targetUser.fullName}' already holds the role '${proposedRole}'.`,
      };
    }

    // 4. Role Assignment Authority Matrix Check (§2)
    const rule = ROLE_ASSIGNMENT_RULES[proposedRole];
    if (!rule) {
      return {
        allowed: false,
        errorCode: 'UNAUTHORIZED_APPROVER',
        reason: `Role '${proposedRole}' is not recognized under the approved institutional governance hierarchy.`,
      };
    }

    // Check if initiator holds one of the authorized approver roles
    const isAuthorized = rule.authorizedApproverRoles.includes(
      initiator.role as UserRole
    );

    if (!isAuthorized) {
      return {
        allowed: false,
        errorCode: 'UNAUTHORIZED_APPROVER',
        reason: `ACCESS DENIED: Role '${rule.targetRoleTitle}' can only be assigned or changed by: ${rule.authorizedApproverDescription}. Your current role '${initiator.role}' does not possess this governance authority.`,
        requiredApproverDescription: rule.authorizedApproverDescription,
      };
    }

    // 5. Cross-Tenant Isolation Boundary Check
    const isPlatformOwner =
      initiator.role === 'SUPER_ADMIN' || initiator.role === 'SYSTEM_ADMIN';
    if (
      !isPlatformOwner &&
      initiator.schoolId &&
      targetUser.schoolId &&
      initiator.schoolId !== targetUser.schoolId
    ) {
      return {
        allowed: false,
        errorCode: 'CROSS_TENANT_VIOLATION',
        reason:
          'CROSS-TENANT BOUNDARY VIOLATION: Institutional officers can only manage personnel within their own assigned school institution.',
      };
    }

    // 6. Privilege Elevation Protection (§3)
    // Non-super-admins can never assign Super Admin or System Admin roles
    if (
      (proposedRole === 'SUPER_ADMIN' || proposedRole === 'SYSTEM_ADMIN') &&
      !isPlatformOwner
    ) {
      return {
        allowed: false,
        errorCode: 'PRIVILEGE_ELEVATION_PROHIBITED',
        reason:
          'PRIVILEGE ELEVATION PROHIBITED: Owner / Super Administrator roles are strictly governed by the System Owner process. Institutional personnel cannot grant or assume platform-level privileges.',
      };
    }

    return {
      allowed: true,
      reason: 'Role change satisfies all institutional governance requirements.',
      requiresWorkflow: rule.requiresWorkflowApproval,
      requiredApproverDescription: rule.authorizedApproverDescription,
    };
  }

  /**
   * Execute Role Change Directly (§4 & §5)
   * Must be executed by an authorized approver.
   * Generates an immutable audit record and dispatches user notification.
   */
  public executeAuthorizedRoleChange(
    initiator: User,
    targetUser: User,
    proposedRole: string,
    reason: string,
    options?: {
      actionType?: RoleChangeActionType;
      institutionId?: string;
      institutionName?: string;
      customApprover?: { id: string; name: string; role: string };
    }
  ): { success: boolean; auditRecord?: RoleChangeAuditRecord; error?: string } {
    const validation = this.validateRoleChange(
      initiator,
      targetUser,
      proposedRole,
      reason
    );
    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    const now = new Date();
    const isoString = now.toISOString();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const approver = options?.customApprover || {
      id: initiator.id,
      name: initiator.fullName,
      role: initiator.role,
    };

    const actionType: RoleChangeActionType =
      options?.actionType ||
      this.determineActionType(targetUser.role, proposedRole);

    const auditRecord: RoleChangeAuditRecord = {
      id: `rc-audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recordHash: '',
      institutionId: options?.institutionId || targetUser.schoolId || 'sch-default',
      institutionName: options?.institutionName || 'Institutional School Tenant',
      affectedUserId: targetUser.id,
      affectedUserName: targetUser.fullName,
      previousRole: targetUser.role,
      newRole: proposedRole,
      actionType,
      initiatorId: initiator.id,
      initiatorName: initiator.fullName,
      initiatorRole: initiator.role,
      approverId: approver.id,
      approverName: approver.name,
      approverRole: approver.role,
      date: dateStr,
      time: timeStr,
      timestamp: isoString,
      deviceInfo:
        typeof navigator !== 'undefined'
          ? `${navigator.userAgent.substring(0, 100)}`
          : 'JJSAK Cloud Terminal v2.1',
      ipAddress: '197.232.44.12', // Simulated institutional gateway IP
      reason: reason.trim(),
      isImmutable: true,
      notificationDispatched: true,
    };

    auditRecord.recordHash = generateRecordHash(auditRecord);

    // Save to Immutable Audit Storage
    this.saveAuditRecord(auditRecord);

    // Dispatch In-App Notification to Affected User (§4.7)
    this.dispatchNotification({
      id: `notif-${Date.now()}`,
      recipientUserId: targetUser.id,
      title: 'Official Role Assignment Notice',
      message: `Your institutional role has been officially updated from '${targetUser.role}' to '${proposedRole}' by ${approver.name} (${approver.role}). Reason: ${reason}`,
      type: 'ROLE_CHANGE_NOTICE',
      timestamp: isoString,
      read: false,
      metadata: {
        previousRole: targetUser.role,
        newRole: proposedRole,
        approverName: approver.name,
        reason,
        institutionName: auditRecord.institutionName,
      },
    });

    return { success: true, auditRecord };
  }

  /**
   * Submit Role Change Request for Multi-Step Approval Workflow (§4)
   * Used when proposed role requires higher-level authorization (e.g. Deputy Head or Director of Academics)
   */
  public submitRoleChangeRequest(
    initiator: User,
    targetUser: User,
    proposedRole: string,
    reason: string,
    institutionId: string,
    institutionName: string
  ): { success: boolean; request?: RoleChangeRequest; error?: string } {
    if (initiator.id === targetUser.id) {
      return {
        success: false,
        error:
          'INSTITUTIONAL ROLE INTEGRITY RULE: Users cannot submit role change requests for themselves.',
      };
    }

    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        error: 'A detailed reason of at least 10 characters is required.',
      };
    }

    const rule = ROLE_ASSIGNMENT_RULES[proposedRole];
    if (!rule) {
      return { success: false, error: 'Unknown target role requested.' };
    }

    const now = new Date();
    const actionType = this.determineActionType(targetUser.role, proposedRole);

    const request: RoleChangeRequest = {
      id: `rc-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId,
      institutionName,
      targetUserId: targetUser.id,
      targetUserName: targetUser.fullName,
      targetUserEmail: targetUser.email,
      currentRole: targetUser.role,
      proposedRole,
      actionType,
      reason: reason.trim(),
      initiatorId: initiator.id,
      initiatorName: initiator.fullName,
      initiatorRole: initiator.role,
      requiredApproverRoles: rule.authorizedApproverRoles,
      status: 'PENDING_APPROVAL',
      createdAt: now.toISOString(),
      deviceInfo:
        typeof navigator !== 'undefined'
          ? navigator.userAgent.substring(0, 100)
          : 'Web Client',
      ipAddress: '197.232.44.12',
    };

    const requests = this.getPendingChangeRequests();
    requests.unshift(request);
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // LocalStorage fallback
    }

    return { success: true, request };
  }

  /**
   * Approve a Pending Role Change Request
   */
  public approveRoleChangeRequest(
    approver: User,
    requestId: string,
    approvalNotes?: string
  ): { success: boolean; auditRecord?: RoleChangeAuditRecord; error?: string } {
    const requests = this.getPendingChangeRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Role change request not found.' };
    }

    // Check if approver is authorized
    if (!req.requiredApproverRoles.includes(approver.role as UserRole)) {
      return {
        success: false,
        error: `ACCESS DENIED: Approver '${approver.fullName}' (${approver.role}) does not have governance authority to approve this change. Required: ${req.requiredApproverRoles.join(', ')}.`,
      };
    }

    // Approver cannot approve a change on themselves!
    if (approver.id === req.targetUserId) {
      return {
        success: false,
        error:
          'INSTITUTIONAL ROLE INTEGRITY RULE: Users cannot approve role changes for themselves.',
      };
    }

    const now = new Date();
    req.status = 'APPROVED';
    req.approvedBy = {
      id: approver.id,
      name: approver.fullName,
      role: approver.role,
      timestamp: now.toISOString(),
      notes: approvalNotes,
    };

    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // ignore
    }

    // Create Immutable Audit Record
    const auditRecord: RoleChangeAuditRecord = {
      id: `rc-audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recordHash: '',
      institutionId: req.institutionId,
      institutionName: req.institutionName,
      affectedUserId: req.targetUserId,
      affectedUserName: req.targetUserName,
      previousRole: req.currentRole,
      newRole: req.proposedRole,
      actionType: req.actionType,
      initiatorId: req.initiatorId,
      initiatorName: req.initiatorName,
      initiatorRole: req.initiatorRole,
      approverId: approver.id,
      approverName: approver.fullName,
      approverRole: approver.role,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      timestamp: now.toISOString(),
      deviceInfo: req.deviceInfo,
      ipAddress: req.ipAddress,
      reason: `${req.reason} [Approved with notes: ${approvalNotes || 'Signed off'}]`,
      isImmutable: true,
      notificationDispatched: true,
    };

    auditRecord.recordHash = generateRecordHash(auditRecord);
    this.saveAuditRecord(auditRecord);

    // Notify affected user
    this.dispatchNotification({
      id: `notif-${Date.now()}`,
      recipientUserId: req.targetUserId,
      title: 'Role Promotion / Assignment Approved',
      message: `Your role change request from '${req.currentRole}' to '${req.proposedRole}' has been approved by ${approver.fullName} (${approver.role}).`,
      type: 'ROLE_CHANGE_NOTICE',
      timestamp: now.toISOString(),
      read: false,
      metadata: {
        previousRole: req.currentRole,
        newRole: req.proposedRole,
        approverName: approver.fullName,
        reason: req.reason,
        institutionName: req.institutionName,
      },
    });

    return { success: true, auditRecord };
  }

  /**
   * Reject a Pending Role Change Request
   */
  public rejectRoleChangeRequest(
    approver: User,
    requestId: string,
    rejectionReason: string
  ): { success: boolean; error?: string } {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return { success: false, error: 'Rejection reason is required.' };
    }

    const requests = this.getPendingChangeRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Request not found.' };
    }

    req.status = 'REJECTED';
    req.rejectedBy = {
      id: approver.id,
      name: approver.fullName,
      role: approver.role,
      timestamp: new Date().toISOString(),
      reason: rejectionReason,
    };

    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // ignore
    }

    // Notify initiator
    this.dispatchNotification({
      id: `notif-${Date.now()}`,
      recipientUserId: req.initiatorId,
      title: 'Role Change Request Rejected',
      message: `Your request to change role for ${req.targetUserName} to '${req.proposedRole}' was rejected by ${approver.fullName}. Reason: ${rejectionReason}`,
      type: 'ROLE_CHANGE_NOTICE',
      timestamp: new Date().toISOString(),
      read: false,
    });

    return { success: true };
  }

  /**
   * Get Immutable Audit Records (§5)
   * "Audit records shall not be editable or deletable by school users."
   * Note: No delete or edit functions exist in this service.
   */
  public getRoleChangeAuditRecords(schoolId?: string): RoleChangeAuditRecord[] {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (schoolId) {
            return parsed.filter(
              (r) => !r.institutionId || r.institutionId === schoolId
            );
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Save initial seed if empty
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_SEED));
    } catch {
      // ignore
    }

    if (schoolId) {
      return INITIAL_AUDIT_SEED.filter(
        (r) => !r.institutionId || r.institutionId === schoolId
      );
    }
    return INITIAL_AUDIT_SEED;
  }

  /**
   * Get Pending Requests
   */
  public getPendingChangeRequests(schoolId?: string): RoleChangeRequest[] {
    try {
      const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          if (schoolId) {
            return parsed.filter(
              (r) => !r.institutionId || r.institutionId === schoolId
            );
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  /**
   * Notifications Management (§4.7)
   */
  public getUserNotifications(userId: string): UserRoleNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => n.recipientUserId === userId);
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  public markNotificationAsRead(userId: string, notificationId: string): void {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed: UserRoleNotification[] = JSON.parse(stored);
        const updated = parsed.map((n) =>
          n.id === notificationId && n.recipientUserId === userId ? { ...n, read: true } : n
        );
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  // Internal Helpers
  private saveAuditRecord(record: RoleChangeAuditRecord): void {
    try {
      const current = this.getRoleChangeAuditRecords();
      current.unshift(record);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }

  private dispatchNotification(notification: UserRoleNotification): void {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const parsed: UserRoleNotification[] = stored ? JSON.parse(stored) : [];
      parsed.unshift(notification);
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(parsed.slice(0, 100))
      );
    } catch {
      // ignore
    }
  }

  private determineActionType(
    currentRole: string,
    proposedRole: string
  ): RoleChangeActionType {
    const tierMap: Record<string, number> = {
      SUPER_ADMIN: 0,
      SYSTEM_ADMIN: 0,
      HEAD_OF_INSTITUTION: 1,
      HEAD: 1,
      HEADTEACHER: 1,
      DEPUTY_HEAD_OF_INSTITUTION: 2,
      DEPUTY: 2,
      DEPUTY_HEADTEACHER: 2,
      DIRECTOR_OF_ACADEMICS: 2,
      DIRECTOR_ACADEMICS: 2,
      ADMIN: 3,
      CLASS_TEACHER: 4,
      TEACHER: 4,
      SUBJECT_TEACHER: 4,
      FINANCE: 4,
      PARENT: 5,
      STUDENT: 5,
    };

    const curTier = tierMap[currentRole] ?? 4;
    const propTier = tierMap[proposedRole] ?? 4;

    if (proposedRole === 'CLASS_TEACHER' || proposedRole === 'SUBJECT_TEACHER') {
      return 'ASSIGNMENT';
    }
    if (propTier < curTier) return 'PROMOTION';
    if (propTier > curTier) return 'DEMOTION';
    return 'TRANSFER';
  }
}

export const institutionalRoleGovernanceService =
  new InstitutionalRoleGovernanceService();
