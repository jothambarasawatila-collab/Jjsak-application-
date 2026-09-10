import { User, UserRole, SchoolTenant } from '../types';
import { ownerGovernanceService } from './ownerGovernanceService';

/**
 * JJSAK MASTER AUTHORIZATION, PORTAL ROUTING, TENANT ISOLATION,
 * GOVERNANCE & EMERGENCY ACCESS STANDARD
 *
 * Requirement ID: JJSAK-AUTHZ-GOV-002
 * Priority: CRITICAL – LOCKED
 *
 * Enforces:
 * - §2: Authentication + Authorization + Tenant Isolation + Least Privilege + Assignment-Based Scope
 * - §3-4: Teacher Registration & Initial Status (PENDING, INVITED, NOT ACTIVATED)
 * - §5-7: Automatic Portal Routing & Server-Side Tenant Validation (No manual school selection)
 * - §8: Role and Tenant Immutability
 * - §9: Authentication != Authorization (Separate identity, tenant, role, permission, scope checks)
 * - §10-11: Multi-Role User Architecture (e.g. Leadership + Subject Teacher)
 * - §12-15: Effective Permission Calculation & Assignment-Based Scope (Subject, Class, Stream, Year, Term)
 * - §16: Timetable Governance Rule (ONLY Director of Academics can create/edit timetables)
 * - §17: No Self-Privilege Escalation
 * - §18: Direct URL and Screen Protection
 * - §19-22: Owner / Super Admin Platform Governance Scope & Data Access Boundaries
 * - §23: Dual-Identity Management
 * - §24: Approved Exception Access
 * - §25-27: Emergency Access Framework & Break-Glass Access (4h Critical, 24h Disaster Recovery)
 * - §28: Cross-Tenant Isolation Rules
 * - §29: Audit Trail Requirements
 * - §30-31: Zero-Tolerance Enforcement
 */

export interface EffectivePermissionSet {
  userId: string;
  fullName: string;
  primaryRole: UserRole;
  activeRoles: UserRole[];
  tenantId: string;
  isOwnerOrSuperAdmin: boolean;
  isDirectorOfAcademics: boolean;
  isHeadOfInstitution: boolean;
  isDeputyHead: boolean;
  isSubjectTeacher: boolean;
  isClassTeacher: boolean;
  isFinanceOfficer: boolean;
  
  // Scoped Teaching Capabilities (§13, §14, §15)
  assignedSubjects: string[];
  assignedClasses: string[];
  assignedStreams: string[];
  teachingResponsibilities: string[];
  academicYearScope: number;
  termScope: string;
  
  // Granular Functional Flags
  canManageTimetables: boolean; // §16: ONLY Director of Academics
  canCreateTimetable: boolean;  // §16: ONLY Director of Academics
  canEditTimetable: boolean;    // §16: ONLY Director of Academics
  canViewTimetable: boolean;    // All authorized roles
  
  canManageAssessments: boolean;
  canApproveAssessments: boolean; // Director of Academics
  canLockAssessments: boolean;    // Director of Academics
  canSubmitMarks: boolean;        // Subject Teachers with assignment
  
  canManageLearners: boolean;
  canApproveLearnerRegistration: boolean; // Director of Academics
  canRegisterLearner: boolean;            // Class Teacher or Director
  
  canManageStaff: boolean;                // Head of Institution
  canViewStaffDirectory: boolean;
  
  canManageFinance: boolean;              // Finance / Bursar
  canManageSubscriptions: boolean;        // Owner / Super Admin
  
  canAccessPlatformGovernance: boolean;  // Owner / Super Admin
  canAccessSchoolOperationalData: boolean;
}

export interface AuthorizationCheckResult {
  authorized: boolean;
  errorCode?: string;
  errorTitle?: string;
  errorMessage?: string;
  action: string;
  userRole: UserRole;
  effectiveRoles: UserRole[];
  tenantId: string;
  checkpointsPassed: string[];
  checkpointsFailed: string[];
  timestamp: string;
}

export interface PortalRouteDecision {
  targetScreen: string;
  portalTitle: string;
  portalCategory: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL' | 'LEARNER_STAKEHOLDER';
  tenantDomain: string;
  schoolId?: string;
  schoolName?: string;
  user: User;
  activeRoles: UserRole[];
  timestamp: string;
}

export interface AssignmentScopeValidation {
  allowed: boolean;
  reason?: string;
  subjectMatch: boolean;
  classMatch: boolean;
  streamMatch: boolean;
  yearMatch: boolean;
  termMatch: boolean;
}

class MasterAuthorizationService {
  private static instance: MasterAuthorizationService;

  private constructor() {}

  public static getInstance(): MasterAuthorizationService {
    if (!MasterAuthorizationService.instance) {
      MasterAuthorizationService.instance = new MasterAuthorizationService();
    }
    return MasterAuthorizationService.instance;
  }

  // =========================================================================
  // §10 & §11: MULTI-ROLE USER RESOLUTION
  // =========================================================================

  /**
   * Extract all active roles for a user.
   * Supports multi-role user architecture (§10) e.g. Head + Subject Teacher.
   */
  public getActiveRoles(user?: User | null): UserRole[] {
    if (!user) return ['TEACHER'];

    const roleSet = new Set<UserRole>();
    if (user.role) {
      roleSet.add(user.role);
    }
    if (Array.isArray(user.roles)) {
      user.roles.forEach((r) => {
        if (r) roleSet.add(r);
      });
    }

    // Auto-detect leadership user also holding teaching responsibilities (§11)
    if (
      (user.assignedSubjects && user.assignedSubjects.length > 0) ||
      (user.assignedClasses && user.assignedClasses.length > 0)
    ) {
      roleSet.add('SUBJECT_TEACHER');
    }

    return Array.from(roleSet);
  }

  /**
   * Checks if user holds any of the target roles
   */
  public hasAnyRole(user: User | null | undefined, targetRoles: UserRole[]): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return targetRoles.some((r) => active.includes(r));
  }

  public isOwnerOrSuperAdmin(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return active.includes('SUPER_ADMIN') || active.includes('SYSTEM_ADMIN');
  }

  public isDirectorOfAcademics(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return (
      active.includes('DIRECTOR_OF_ACADEMICS') ||
      active.includes('DIRECTOR_ACADEMICS') ||
      this.isOwnerOrSuperAdmin(user)
    );
  }

  public isHeadOfInstitution(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return (
      active.includes('HEAD_OF_INSTITUTION') ||
      active.includes('HEAD') ||
      active.includes('HEADTEACHER')
    );
  }

  public isDeputyHead(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return (
      active.includes('DEPUTY_HEAD_OF_INSTITUTION') ||
      active.includes('DEPUTY') ||
      active.includes('DEPUTY_HEADTEACHER')
    );
  }

  public isClassTeacher(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return active.includes('CLASS_TEACHER');
  }

  public isSubjectTeacher(user?: User | null): boolean {
    if (!user) return false;
    const active = this.getActiveRoles(user);
    return (
      active.includes('SUBJECT_TEACHER') ||
      active.includes('TEACHER') ||
      Boolean(user.assignedSubjects && user.assignedSubjects.length > 0)
    );
  }

  // =========================================================================
  // §5, §6 & §7: AUTOMATIC PORTAL ROUTING ENGINE
  // =========================================================================

  /**
   * Automatically determines the target portal after successful authentication and OTP verification (§5).
   * Users never manually choose a school portal. Server-side tenant determines destination.
   */
  public determineTargetPortal(user: User, tenant: SchoolTenant): PortalRouteDecision {
    const activeRoles = this.getActiveRoles(user);
    const tenantSubdomain = tenant.subdomain || tenant.schoolCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tenantDomain = `${tenantSubdomain}.jjsak.com`;

    // 1. Owner / Super Administrator -> Owner Governance Portal (§5.1, §19, §20)
    if (this.isOwnerOrSuperAdmin(user)) {
      return {
        targetScreen: 'owner_dashboard',
        portalTitle: 'JJSAK Platform Owner Governance Console',
        portalCategory: 'PLATFORM_GOVERNANCE',
        tenantDomain: 'platform-governance.jjsak.internal',
        user,
        activeRoles,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Learner Stakeholder Portal
    if (user.role === 'STUDENT' || Boolean(user.learnerId)) {
      return {
        targetScreen: 'student_report',
        portalTitle: `${tenant.schoolName} — Learner CBE Portal`,
        portalCategory: 'LEARNER_STAKEHOLDER',
        tenantDomain,
        schoolId: tenant.schoolId,
        schoolName: tenant.schoolName,
        user,
        activeRoles,
        timestamp: new Date().toISOString(),
      };
    }

    // 3. School Leadership & Instructional Staff -> Assigned School Portal (§5.2-5.6)
    // Head, Deputy, Director of Academics, Teachers all route to their assigned school portal
    return {
      targetScreen: 'home',
      portalTitle: `${tenant.schoolName} — Institutional Operations Portal`,
      portalCategory: 'SCHOOL_OPERATIONAL',
      tenantDomain,
      schoolId: tenant.schoolId,
      schoolName: tenant.schoolName,
      user,
      activeRoles,
      timestamp: new Date().toISOString(),
    };
  }

  // =========================================================================
  // §12: EFFECTIVE PERMISSION CALCULATION
  // =========================================================================

  /**
   * Calculates effective access using:
   * User -> Active Role(s) -> Role Permissions -> Subject Assignments ->
   * Class Assignments -> Stream Assignments -> Academic Year Scope -> Term Scope -> Effective Access
   */
  public calculateEffectivePermissions(
    user: User,
    tenant?: SchoolTenant | null,
    academicYear: number = 2026,
    term: string = 'Term 3'
  ): EffectivePermissionSet {
    const activeRoles = this.getActiveRoles(user);
    const isSuper = this.isOwnerOrSuperAdmin(user);
    const isDoA = this.isDirectorOfAcademics(user);
    const isHead = this.isHeadOfInstitution(user);
    const isDeputy = this.isDeputyHead(user);
    const isClassTchr = this.isClassTeacher(user);
    const isSubjTchr = this.isSubjectTeacher(user);
    const isFinance = activeRoles.includes('FINANCE');

    const assignedSubjects = user.assignedSubjects || [];
    const assignedClasses = user.assignedClasses || [];
    const assignedStreams = user.assignedStreams || [];
    const teachingResponsibilities = user.teachingResponsibilities || [];
    const yearScope = user.academicYearScope || academicYear;
    const termScope = user.termScope || term;

    // Timetable Governance Rule (§16): ONLY Director of Academics can create/edit
    const canManageTimetables = isDoA;
    const canCreateTimetable = isDoA;
    const canEditTimetable = isDoA;
    const canViewTimetable = true; // All authenticated roles may view

    return {
      userId: user.id,
      fullName: user.fullName,
      primaryRole: user.role,
      activeRoles,
      tenantId: user.schoolId || tenant?.schoolId || '',
      isOwnerOrSuperAdmin: isSuper,
      isDirectorOfAcademics: isDoA,
      isHeadOfInstitution: isHead,
      isDeputyHead: isDeputy,
      isSubjectTeacher: isSubjTchr,
      isClassTeacher: isClassTchr,
      isFinanceOfficer: isFinance,

      assignedSubjects,
      assignedClasses,
      assignedStreams,
      teachingResponsibilities,
      academicYearScope: yearScope,
      termScope,

      canManageTimetables,
      canCreateTimetable,
      canEditTimetable,
      canViewTimetable,

      canManageAssessments: isDoA || isHead || isDeputy || isSubjTchr,
      canApproveAssessments: isDoA,
      canLockAssessments: isDoA,
      canSubmitMarks: isSubjTchr,

      canManageLearners: isDoA || isHead || isDeputy || isClassTchr,
      canApproveLearnerRegistration: isDoA,
      canRegisterLearner: isDoA || isHead || isClassTchr,

      canManageStaff: isHead || isSuper,
      canViewStaffDirectory: true,

      canManageFinance: isFinance || isHead,
      canManageSubscriptions: isSuper,

      canAccessPlatformGovernance: isSuper,
      canAccessSchoolOperationalData: !isSuper || this.hasApprovedOwnerSchoolAccess(user.schoolId || tenant?.schoolId || ''),
    };
  }

  // =========================================================================
  // §13, §14 & §15: ASSIGNMENT-BASED TEACHING SCOPE VALIDATION
  // =========================================================================

  /**
   * Verifies if a teacher (including leadership functioning as subject teacher, §11)
   * is authorized to enter marks or take attendance for a specific subject, class, and stream (§13, §14).
   */
  public validateTeachingScope(
    user: User,
    subject: string,
    className: string,
    stream?: string,
    academicYear?: number,
    term?: string
  ): AssignmentScopeValidation {
    // If user is Director of Academics acting in academic oversight mode, full oversight is permitted
    if (this.isDirectorOfAcademics(user)) {
      return {
        allowed: true,
        reason: 'Director of Academics academic oversight authority',
        subjectMatch: true,
        classMatch: true,
        streamMatch: true,
        yearMatch: true,
        termMatch: true,
      };
    }

    const assignedSubjects = user.assignedSubjects || [];
    const assignedClasses = user.assignedClasses || [];
    const assignedStreams = user.assignedStreams || [];

    // Check subject match (flexible case-insensitive and partial match for CBC subjects)
    const subjectMatch =
      assignedSubjects.length === 0 ||
      assignedSubjects.some(
        (s) =>
          s.toLowerCase() === subject.toLowerCase() ||
          subject.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(subject.toLowerCase())
      );

    // Check class match
    const classMatch =
      assignedClasses.length === 0 ||
      assignedClasses.some(
        (c) =>
          c.toLowerCase() === className.toLowerCase() ||
          className.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(className.toLowerCase())
      );

    // Check stream match
    const streamMatch =
      !stream ||
      assignedStreams.length === 0 ||
      assignedStreams.some(
        (st) =>
          st.toLowerCase() === stream.toLowerCase() ||
          stream.toLowerCase().includes(st.toLowerCase())
      );

    const yearMatch = !user.academicYearScope || !academicYear || user.academicYearScope === academicYear;
    const termMatch = !user.termScope || !term || user.termScope === term;

    const allowed = subjectMatch && classMatch && streamMatch && yearMatch && termMatch;

    return {
      allowed,
      reason: allowed
        ? 'Officially assigned teaching scope'
        : `Unauthorized assignment scope: User is not officially assigned to ${subject} for ${className}${stream ? ' ' + stream : ''}.`,
      subjectMatch,
      classMatch,
      streamMatch,
      yearMatch,
      termMatch,
    };
  }

  // =========================================================================
  // §16 / Policy JJSAK-TIMETABLE-ACCESS-002: TIMETABLE GOVERNANCE RULE
  // =========================================================================

  /**
   * Enforces Policy JJSAK-TIMETABLE-ACCESS-002:
   * The Director of Academics serves as the Institution's Academic Timetable Administrator
   * with full timetable management authority over class timetables and assessment schedules.
   * Read Access users are strictly prohibited from creating, modifying, or deleting timetables.
   */
  public validateTimetableModification(
    user: User,
    action:
      | 'CREATE_CLASS_TIMETABLE'
      | 'EDIT_CLASS_TIMETABLE'
      | 'CREATE_ASSESSMENT_TIMETABLE'
      | 'EDIT_ASSESSMENT_TIMETABLE'
      | 'MODIFY_PERIOD_STRUCTURE'
      | 'PUBLISH_TIMETABLE'
      | 'UNPUBLISH_TIMETABLE'
      | 'UPDATE_PUBLISHED_TIMETABLE'
      | 'REGENERATE_TIMETABLE'
      | 'ASSIGN_TEACHERS'
      | 'ALLOCATE_ROOMS'
      | 'ASSIGN_INVIGILATORS'
      | 'RESOLVE_CLASHES'
      | 'APPROVE_REVISION'
      | 'CONFIGURE_CONSTRAINTS'
      | 'DELETE_TIMETABLE'
  ): AuthorizationCheckResult {
    const isDoA = this.isDirectorOfAcademics(user);
    const activeRoles = this.getActiveRoles(user);
    const timestamp = new Date().toISOString();

    if (isDoA) {
      return {
        authorized: true,
        action,
        userRole: user.role,
        effectiveRoles: activeRoles,
        tenantId: user.schoolId || '',
        checkpointsPassed: [
          'ROLE_DIRECTOR_OF_ACADEMICS',
          'POLICY_JJSAK_TIMETABLE_ACCESS_002',
          'ACADEMIC_TIMETABLE_ADMINISTRATOR',
        ],
        checkpointsFailed: [],
        timestamp,
      };
    }

    const actionLabels: Record<string, string> = {
      CREATE_CLASS_TIMETABLE: 'create class timetables',
      EDIT_CLASS_TIMETABLE: 'edit class timetables',
      CREATE_ASSESSMENT_TIMETABLE: 'create assessment and examination timetables',
      EDIT_ASSESSMENT_TIMETABLE: 'edit assessment timetables',
      MODIFY_PERIOD_STRUCTURE: 'modify period structure and bell schedules',
      PUBLISH_TIMETABLE: 'publish timetables',
      UNPUBLISH_TIMETABLE: 'unpublish timetables',
      UPDATE_PUBLISHED_TIMETABLE: 'update published timetables',
      REGENERATE_TIMETABLE: 'regenerate timetable schedules',
      ASSIGN_TEACHERS: 'assign and reassign teachers',
      ALLOCATE_ROOMS: 'allocate examination rooms and learning spaces',
      ASSIGN_INVIGILATORS: 'assign and modify invigilators',
      RESOLVE_CLASHES: 'resolve timetable conflicts and scheduling clashes',
      APPROVE_REVISION: 'approve timetable revisions',
      CONFIGURE_CONSTRAINTS: 'configure timetable constraints',
      DELETE_TIMETABLE: 'delete timetables',
    };

    const actionLabel = actionLabels[action] || action;
    const errorMessage = `Under JJSAK Timetable Access Control Policy (Policy ID: JJSAK-TIMETABLE-ACCESS-002), ONLY the Director of Academics (designated Academic Timetable Administrator) possesses authority to ${actionLabel}. User role (${user.role}) is designated as a Read Access User and is strictly forbidden from timetable modifications.`;

    return {
      authorized: false,
      errorCode: 'ERR_TIMETABLE_DIRECTOR_OF_ACADEMICS_REQUIRED',
      errorTitle: 'Academic Timetable Administrator Authority Required (Policy JJSAK-TIMETABLE-ACCESS-002)',
      errorMessage,
      action,
      userRole: user.role,
      effectiveRoles: activeRoles,
      tenantId: user.schoolId || '',
      checkpointsPassed: ['AUTHENTICATION_VALIDATED', 'TENANT_VALIDATED'],
      checkpointsFailed: ['POLICY_JJSAK_TIMETABLE_ACCESS_002_RESTRICTION'],
      timestamp,
    };
  }

  // =========================================================================
  // §17: NO SELF-PRIVILEGE ESCALATION
  // =========================================================================

  /**
   * Enforces §17: No school user may modify their own:
   * - Role
   * - Permissions
   * - Tenant ID
   * - School Assignment
   * - Security Status
   * - Account Status
   */
  public validateNoSelfPrivilegeEscalation(
    actor: User,
    targetUserId: string,
    modificationType: string
  ): AuthorizationCheckResult {
    const isSelf = actor.id === targetUserId;
    const activeRoles = this.getActiveRoles(actor);
    const timestamp = new Date().toISOString();

    if (isSelf) {
      return {
        authorized: false,
        errorCode: 'ERR_SELF_PRIVILEGE_ESCALATION_PROHIBITED',
        errorTitle: 'Self-Privilege Escalation Prohibited (§17)',
        errorMessage: `Zero-Tolerance Violation: User ${actor.fullName} (${actor.role}) attempted self-modification of ${modificationType}. Under JJSAK-AUTHZ-GOV-002 §17, users cannot modify their own roles, tenant assignments, or permissions.`,
        action: `MODIFY_${modificationType.toUpperCase()}`,
        userRole: actor.role,
        effectiveRoles: activeRoles,
        tenantId: actor.schoolId || '',
        checkpointsPassed: ['AUTHENTICATION_VALIDATED'],
        checkpointsFailed: ['NO_SELF_ESCALATION_CHECKPOINT_SECTION_17'],
        timestamp,
      };
    }

    return {
      authorized: true,
      action: `MODIFY_${modificationType.toUpperCase()}`,
      userRole: actor.role,
      effectiveRoles: activeRoles,
      tenantId: actor.schoolId || '',
      checkpointsPassed: ['NO_SELF_ESCALATION_PASSED'],
      checkpointsFailed: [],
      timestamp,
    };
  }

  // =========================================================================
  // §28: CROSS-TENANT ISOLATION RULES
  // =========================================================================

  /**
   * Enforces strict cross-tenant boundary (§28).
   * School A users shall NEVER access School B data.
   */
  public enforceTenantBoundary(
    user: User,
    targetTenantId: string,
    resourceDescription: string = 'institutional record'
  ): AuthorizationCheckResult {
    const timestamp = new Date().toISOString();
    const activeRoles = this.getActiveRoles(user);

    // Platform Owner is not assigned to any school by default (§19)
    if (this.isOwnerOrSuperAdmin(user)) {
      const hasException = this.hasApprovedOwnerSchoolAccess(targetTenantId);
      if (!hasException) {
        return {
          authorized: false,
          errorCode: 'ERR_OWNER_SCHOOL_DATA_BOUNDARY',
          errorTitle: 'Owner Data Access Boundary (§22)',
          errorMessage: `Platform Owner Governance Boundary: The Owner / Super Administrator operates strictly at the platform-governance level and does not possess access to school operational data (${resourceDescription}) by default. An active Approved Exception (§24) or Break-Glass Emergency Session (§26) is required.`,
          action: 'ACCESS_TENANT_DATA',
          userRole: user.role,
          effectiveRoles: activeRoles,
          tenantId: targetTenantId,
          checkpointsPassed: ['AUTHENTICATION_VALIDATED', 'GOVERNANCE_IDENTITY_CONFIRMED'],
          checkpointsFailed: ['OWNER_DATA_BOUNDARY_SECTION_22'],
          timestamp,
        };
      }

      return {
        authorized: true,
        action: 'ACCESS_TENANT_DATA_VIA_EXCEPTION',
        userRole: user.role,
        effectiveRoles: activeRoles,
        tenantId: targetTenantId,
        checkpointsPassed: ['APPROVED_EXCEPTION_ACTIVE'],
        checkpointsFailed: [],
        timestamp,
      };
    }

    // Standard school user tenant validation
    if (!user.schoolId || user.schoolId !== targetTenantId) {
      return {
        authorized: false,
        errorCode: 'ERR_CROSS_TENANT_ACCESS_DENIED',
        errorTitle: 'Cross-Tenant Access Violation (§28)',
        errorMessage: `Zero-Tolerance Cross-Tenant Violation: User ${user.fullName} is registered under tenant [${user.schoolId}] and cannot access data of tenant [${targetTenantId}]. School boundaries are strictly isolated under JJSAK-AUTHZ-GOV-002 §28.`,
        action: 'CROSS_TENANT_DATA_ACCESS',
        userRole: user.role,
        effectiveRoles: activeRoles,
        tenantId: targetTenantId,
        checkpointsPassed: ['AUTHENTICATION_VALIDATED'],
        checkpointsFailed: ['TENANT_ISOLATION_SECTION_28'],
        timestamp,
      };
    }

    return {
      authorized: true,
      action: 'TENANT_DATA_ACCESS',
      userRole: user.role,
      effectiveRoles: activeRoles,
      tenantId: targetTenantId,
      checkpointsPassed: ['TENANT_MATCH_VERIFIED'],
      checkpointsFailed: [],
      timestamp,
    };
  }

  // =========================================================================
  // §18: DIRECT SCREEN / ACTION AUTHORIZATION
  // =========================================================================

  /**
   * Validates if a user is permitted to open a specific screen (§18).
   * Menu hiding alone is insufficient; backend/screen authorization is mandatory.
   */
  public validateScreenAccess(
    user: User,
    screen: string,
    activeTenantId: string
  ): AuthorizationCheckResult {
    const timestamp = new Date().toISOString();
    const activeRoles = this.getActiveRoles(user);

    // 1. Platform Governance Screens (Super Admin ONLY)
    const governanceScreens = ['owner_dashboard', 'owner_console', 'master_architecture', 'security_core'];
    if (governanceScreens.includes(screen)) {
      if (!this.isOwnerOrSuperAdmin(user)) {
        return {
          authorized: false,
          errorCode: 'ERR_GOVERNANCE_SCREEN_RESTRICTED',
          errorTitle: 'Platform Governance Boundary (§19)',
          errorMessage: `ACCESS DENIED: Screen '${screen}' is a Platform Governance component permanently reserved for the Platform Owner / Super Administrator. School personnel (${user.role}) are restricted to school-level operational portals.`,
          action: `NAVIGATE_${screen.toUpperCase()}`,
          userRole: user.role,
          effectiveRoles: activeRoles,
          tenantId: activeTenantId,
          checkpointsPassed: ['AUTHENTICATION_VALIDATED'],
          checkpointsFailed: ['GOVERNANCE_ROLE_REQUIRED'],
          timestamp,
        };
      }
      return {
        authorized: true,
        action: `NAVIGATE_${screen.toUpperCase()}`,
        userRole: user.role,
        effectiveRoles: activeRoles,
        tenantId: activeTenantId,
        checkpointsPassed: ['GOVERNANCE_ROLE_VERIFIED'],
        checkpointsFailed: [],
        timestamp,
      };
    }

    // 2. School Operational Screens accessed by Owner (§22)
    const schoolOperationalScreens = [
      'students',
      'assessments',
      'teachers',
      'timetabling',
      'student_report',
      'reports_hub',
      'academic_hub',
      'learner_welfare_hub',
    ];

    if (this.isOwnerOrSuperAdmin(user) && schoolOperationalScreens.includes(screen)) {
      const boundaryCheck = this.enforceTenantBoundary(user, activeTenantId, screen);
      if (!boundaryCheck.authorized) {
        return boundaryCheck;
      }
    }

    // 3. School User Tenant Validation (§28)
    if (!this.isOwnerOrSuperAdmin(user) && user.schoolId && user.schoolId !== activeTenantId) {
      return this.enforceTenantBoundary(user, activeTenantId, screen);
    }

    return {
      authorized: true,
      action: `NAVIGATE_${screen.toUpperCase()}`,
      userRole: user.role,
      effectiveRoles: activeRoles,
      tenantId: activeTenantId,
      checkpointsPassed: ['SCREEN_AUTHORIZATION_PASSED'],
      checkpointsFailed: [],
      timestamp,
    };
  }

  // =========================================================================
  // §22 & §24: OWNER DATA BOUNDARY & APPROVED EXCEPTIONS HELPER
  // =========================================================================

  private hasApprovedOwnerSchoolAccess(schoolId: string): boolean {
    const check = ownerGovernanceService.verifyOwnerSchoolDataAccess(schoolId);
    return check.allowed;
  }
}

export const masterAuthorizationService = MasterAuthorizationService.getInstance();
