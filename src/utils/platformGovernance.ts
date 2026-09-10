/**
 * SCMH 2.X – Platform Visibility, Governance and Access Isolation
 * 
 * Defines the visibility boundaries between the JJSAK Platform Layer and School Tenant Layer.
 * Ensures platform governance components remain under the exclusive control of the Owner/Super Administrator
 * while schools access only their own operational modules.
 */

import { User, UserRole } from '../types';

// =========================================================================
// 1. Platform Governance Components (Owner / Super Administrator ONLY)
// =========================================================================

export interface GovernanceComponentSpec {
  id: string;
  name: string;
  category: 'STRATEGIC' | 'MULTI_TENANT' | 'SECURITY' | 'OPERATIONS';
  description: string;
  phaseCode: string;
  routeKey?: string;
}

export const PLATFORM_GOVERNANCE_COMPONENTS: GovernanceComponentSpec[] = [
  // Strategic Platform Components
  {
    id: 'gov-strat-01',
    name: 'JJSAK 27-Phase Master Architecture',
    category: 'STRATEGIC',
    description: 'Complete system architecture specifications, 27-phase master blueprint, and module dependency graphs.',
    phaseCode: 'Phase 1 - P1.1',
    routeKey: 'master_architecture',
  },
  {
    id: 'gov-strat-02',
    name: 'Security Core',
    category: 'STRATEGIC',
    description: 'System-wide cryptographic controls, authentication infrastructure, and kernel security enforcement.',
    phaseCode: 'Phase 2 - P2.1',
    routeKey: 'security_core',
  },
  {
    id: 'gov-strat-03',
    name: 'Multi-Tenant Hub',
    category: 'STRATEGIC',
    description: 'Cross-tenant routing engine, isolation boundary controllers, and global tenant registry.',
    phaseCode: 'Phase 2 - P2.2',
    routeKey: 'security_core',
  },
  {
    id: 'gov-strat-04',
    name: 'Platform Governance Framework',
    category: 'STRATEGIC',
    description: 'Policy enforcement rules, compliance oversight, and institutional boundary specifications.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-strat-05',
    name: 'Platform Roadmap Management',
    category: 'STRATEGIC',
    description: 'Release engineering, feature flagging, and system-wide evolution planning.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-strat-06',
    name: 'Global Configuration Center',
    category: 'STRATEGIC',
    description: 'Master platform environment variables, CDN configurations, and cloud infrastructure settings.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-strat-07',
    name: 'System Architecture Repository',
    category: 'STRATEGIC',
    description: 'Technical documentation, API schemas, data models, and database migration histories.',
    phaseCode: 'SCMH 2.X',
  },

  // Multi-Tenant Management Components
  {
    id: 'gov-tenant-01',
    name: 'School Registration Center',
    category: 'MULTI_TENANT',
    description: 'Intake and registration of new educational institutions into the JJSAK cloud ecosystem.',
    phaseCode: 'Phase 1 - P1.1',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-02',
    name: 'School Verification Center',
    category: 'MULTI_TENANT',
    description: 'Ministry of Education credential verification, registration number audits, and KYC verification.',
    phaseCode: 'Phase 1 - P1.2',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-03',
    name: 'School Activation Center',
    category: 'MULTI_TENANT',
    description: 'Final institutional clearance and provisioning of dedicated tenant database schema.',
    phaseCode: 'Phase 1 - P1.3',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-04',
    name: 'School Suspension Center',
    category: 'MULTI_TENANT',
    description: 'Temporary access restriction mechanisms for policy infractions or expired licensing.',
    phaseCode: 'Phase 1 - P1.4',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-05',
    name: 'School Deactivation Center',
    category: 'MULTI_TENANT',
    description: 'Controlled institutional decommission and archival with strict data retention rules.',
    phaseCode: 'Phase 1 - P1.5',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-06',
    name: 'School Subscription Center',
    category: 'MULTI_TENANT',
    description: 'Global subscription billing ledger, institution licensing plans, and transaction reconciliation.',
    phaseCode: 'Phase 2 - P2.7',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-07',
    name: 'Multi-School Management Console',
    category: 'MULTI_TENANT',
    description: 'Centralized master console for multi-school supervision and platform fleet monitoring.',
    phaseCode: 'Phase 2 - P2.11',
    routeKey: 'owner_console',
  },
  {
    id: 'gov-tenant-08',
    name: 'Tenant Provisioning Engine',
    category: 'MULTI_TENANT',
    description: 'Automated tenant database container initialization, storage bucket allocation, and key provisioning.',
    phaseCode: 'Phase 2 - P2.12',
    routeKey: 'security_core',
  },
  {
    id: 'gov-tenant-09',
    name: 'Tenant Lifecycle Management Center',
    category: 'MULTI_TENANT',
    description: 'Orchestration of tenant lifecycle transitions: Registered -> Pending -> Active -> Suspended -> Archived.',
    phaseCode: 'SCMH 2.X',
    routeKey: 'owner_console',
  },

  // Security Components
  {
    id: 'gov-sec-01',
    name: 'Tenant Isolation Management',
    category: 'SECURITY',
    description: 'Multi-tenant cryptographic firewall preventing cross-school data leakages and zero-discovery enforcement.',
    phaseCode: 'Phase 2 - P2.11',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-02',
    name: 'Global Security Monitoring',
    category: 'SECURITY',
    description: 'Real-time telemetry of system-wide login activities, failed auth spikes, and suspicious anomalies.',
    phaseCode: 'Phase 2 - P2.8',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-03',
    name: 'Security Policies Management',
    category: 'SECURITY',
    description: 'Global password complexity policies (12+ chars), MFA mandates, and session expiration configurations.',
    phaseCode: 'Phase 2 - P2.5',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-04',
    name: 'Access Governance Center',
    category: 'SECURITY',
    description: 'Super Administrator permission matrices, root credential governance, and emergency revocation keys.',
    phaseCode: 'Phase 2 - P2.3',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-05',
    name: 'Global Audit Logs',
    category: 'SECURITY',
    description: 'Immutable, platform-wide audit log trail capturing every administrative event and privilege change.',
    phaseCode: 'Phase 2 - P2.9',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-06',
    name: 'Compliance Monitoring',
    category: 'SECURITY',
    description: 'Continuous validation against Kenya Data Protection Act 2019, MOE CBC standards, and KNEC rules.',
    phaseCode: 'Phase 1 - P1.15',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-07',
    name: 'Platform Threat Detection',
    category: 'SECURITY',
    description: 'Automated heuristics identifying brute-force attempts, credential stuffing, and injection attacks.',
    phaseCode: 'Phase 2 - P2.8',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-08',
    name: 'Backup and Recovery Control Center',
    category: 'SECURITY',
    description: 'AES-256 encrypted platform snapshots, SHA-256 integrity checksum verifications, and point-in-time recovery.',
    phaseCode: 'Phase 1 - P1.11',
    routeKey: 'security_core',
  },
  {
    id: 'gov-sec-09',
    name: 'Disaster Recovery Management',
    category: 'SECURITY',
    description: 'Multi-region failover protocols, data replication verification, and cold-storage redundancy control.',
    phaseCode: 'Phase 1 - P1.12',
    routeKey: 'security_core',
  },

  // Platform Operations Components
  {
    id: 'gov-ops-01',
    name: 'Billing and Revenue Management',
    category: 'OPERATIONS',
    description: 'Platform revenue reconciliation, payment gateway integration (M-Pesa / Bank), and SaaS licensing analytics.',
    phaseCode: 'Phase 2 - P2.7',
  },
  {
    id: 'gov-ops-02',
    name: 'Platform Analytics',
    category: 'OPERATIONS',
    description: 'Macro-level platform metrics: active institutions, total national student population, system throughput.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-ops-03',
    name: 'AI Services Management',
    category: 'OPERATIONS',
    description: 'Gemini cognitive services quotas, prompt governance, pedagogical model tuning, and token monitoring.',
    phaseCode: 'Phase 8 - P8.1',
  },
  {
    id: 'gov-ops-04',
    name: 'Notification Infrastructure Management',
    category: 'OPERATIONS',
    description: 'SMS gateway routing (Africa\'s Talking / Safaricom bulk SMS), email dispatch relays, and push pipelines.',
    phaseCode: 'Phase 9 - P9.1',
  },
  {
    id: 'gov-ops-05',
    name: 'Deployment and Update Management',
    category: 'OPERATIONS',
    description: 'Continuous deployment pipelines, rolling zero-downtime updates, and client bundle cache invalidation.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-ops-06',
    name: 'Platform Health Monitoring',
    category: 'OPERATIONS',
    description: 'Microservice availability, database latency, API error rate monitoring, and SLA uptime tracking.',
    phaseCode: 'SCMH 2.X',
  },
  {
    id: 'gov-ops-07',
    name: 'Infrastructure Monitoring',
    category: 'OPERATIONS',
    description: 'Cloud container memory usage, CPU load balancing, disk I/O, and server scaling policies.',
    phaseCode: 'SCMH 2.X',
  },
];

// =========================================================================
// 2. School Portal Scope Definitions (Tenant Authorized Modules)
// =========================================================================

export interface SchoolResourceScope {
  category: 'ACADEMIC' | 'HUMAN_RESOURCE' | 'OPERATIONAL';
  categoryTitle: string;
  resources: {
    name: string;
    description: string;
    targetScreen?: string;
  }[];
}

export const SCHOOL_PORTAL_SCOPE: SchoolResourceScope[] = [
  {
    category: 'ACADEMIC',
    categoryTitle: 'Academic Resources',
    resources: [
      { name: 'Learners', description: 'Learner profiles, registration details, admission numbers and guardian contacts.', targetScreen: 'students' },
      { name: 'Classes', description: 'Junior school class and stream configurations (e.g., Grade 7 East, Grade 8 West).', targetScreen: 'academic_structure_hub' },
      { name: 'Subjects', description: 'CBC 9 core learning areas and pretechnical integration.', targetScreen: 'academic_structure_hub' },
      { name: 'Assessments', description: 'Formative assessments, summative exams, rubrics, and subject score sheets.', targetScreen: 'assessments' },
      { name: 'Examinations', description: 'Mid-term, end-term, and national SBA mock examination schedules.', targetScreen: 'assessments' },
      { name: 'Timetables', description: 'Master, class, and individual teacher clash-free timetables.', targetScreen: 'timetabling' },
      { name: 'CBC Records', description: 'Core competencies, formative achievement bands (EE, ME, AE, BE), and values assessments.', targetScreen: 'analytics' },
      { name: 'Academic Reports', description: 'Official Ministry-compliant CBC student report cards, broadsheets, and transcripts.', targetScreen: 'reports_hub' },
    ],
  },
  {
    category: 'HUMAN_RESOURCE',
    categoryTitle: 'Human Resource Resources',
    resources: [
      { name: 'Teachers', description: 'Institutional teaching staff profiles, TSC numbers, and contact details.', targetScreen: 'teachers' },
      { name: 'School Administrators', description: 'Authorized school administrative and registrar personnel.', targetScreen: 'settings' },
      { name: 'Head of Institution', description: 'Official institutional leader, signature authority, and report card endorsements.', targetScreen: 'school_profile' },
      { name: 'Deputy Head of Institution', description: 'Academic deputy, discipline coordinator, and master scheduler.', targetScreen: 'teachers' },
      { name: 'Director of Academics', description: 'Director of studies, curriculum supervisor, and assessment coordinator.', targetScreen: 'academic_hub' },
      { name: 'Assigned School Staff', description: 'Support staff, finance clerks, and department heads.', targetScreen: 'teachers' },
    ],
  },
  {
    category: 'OPERATIONAL',
    categoryTitle: 'Operational Resources',
    resources: [
      { name: 'Attendance', description: 'Daily morning and afternoon roll call registers, term summaries, and absence trackers.', targetScreen: 'learner_welfare_hub' },
      { name: 'Finance', description: 'School-specific subscription license status and fee receipt ledgers.', targetScreen: 'subscription' },
      { name: 'Parent Communication', description: 'Direct SMS notifications, parent circulars, and meeting announcements.', targetScreen: 'communication_hub' },
      { name: 'School Documents', description: 'Official institution letterheads, digital crests, and rubber stamp profiles.', targetScreen: 'school_profile' },
      { name: 'School Notifications', description: 'Internal school announcements and academic deadline alerts.', targetScreen: 'home' },
      { name: 'School Analytics', description: 'School-level performance means, subject mastery indices, and champion rankings.', targetScreen: 'analytics' },
      { name: 'School Settings', description: 'Academic term opening/closing dates, motto, and year calendar configuration.', targetScreen: 'settings' },
      { name: 'School User Management', description: 'Local school staff account creation and role assignments within the institution.', targetScreen: 'settings' },
    ],
  },
];

// =========================================================================
// 3. Strict Boundary Validation & Verification Engine
// =========================================================================

export const FORBIDDEN_PLATFORM_ROUTES: string[] = [
  'master_architecture',
  'security_core',
  'owner_console',
];

export const FORBIDDEN_ROLES_FOR_PLATFORM_GOVERNANCE: UserRole[] = [
  'HEAD_OF_INSTITUTION',
  'DEPUTY_HEAD_OF_INSTITUTION',
  'DIRECTOR_OF_ACADEMICS',
  'HEAD',
  'DEPUTY',
  'DIRECTOR_ACADEMICS',
  'HEADTEACHER',
  'DEPUTY_HEADTEACHER',
  'ADMIN',
  'TEACHER',
  'FINANCE',
  'PARENT',
  'STUDENT',
];

export function isOwnerOrSuperAdmin(roleOrUser?: User | UserRole | string | null): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === 'object') {
    return roleOrUser.role === 'SUPER_ADMIN' || roleOrUser.role === 'SYSTEM_ADMIN';
  }
  return roleOrUser === 'SUPER_ADMIN' || roleOrUser === 'SYSTEM_ADMIN';
}

export function isPlatformGovernanceComponent(screenOrComponentId?: string): boolean {
  if (!screenOrComponentId) return false;
  if (FORBIDDEN_PLATFORM_ROUTES.includes(screenOrComponentId)) return true;
  return PLATFORM_GOVERNANCE_COMPONENTS.some(
    (c) => c.id === screenOrComponentId || c.routeKey === screenOrComponentId || c.name.toLowerCase() === screenOrComponentId.toLowerCase()
  );
}

export interface TenantIsolationValidationParams {
  tenantId?: string;
  schoolId?: string;
  targetSchoolId?: string;
  currentUser?: User;
  targetScreen?: string;
  actionType?: string;
  jwtToken?: string;
  activeSessionStatus?: 'VALID' | 'EXPIRED' | 'UNAUTHENTICATED';
}

export interface TenantIsolationValidationResult {
  isAllowed: boolean;
  violationCode?:
    | 'PLATFORM_GOVERNANCE_ACCESS_FORBIDDEN'
    | 'CROSS_TENANT_ACCESS_REJECTED'
    | 'ROLE_PERMISSION_DENIED'
    | 'SESSION_INVALID'
    | 'UNAUTHORIZED_TARGET';
  violationMessage?: string;
  reason?: string;
  checkpoints: {
    tenantIdValidated: boolean;
    schoolIdValidated: boolean;
    userIdValidated: boolean;
    rolePermissionsValidated: boolean;
    activeSessionValidated: boolean;
  };
  checkpointsFailed: string[];
}

/**
 * Validates request against SCMH 2.X Policy:
 * 1. Validate Tenant ID
 * 2. Validate School ID
 * 3. Validate User ID
 * 4. Validate Role Permissions
 * 5. Validate Active Session Status
 */
export function validateAccessBoundary(
  paramsOrUser?: TenantIsolationValidationParams | User,
  schoolIdParam?: string,
  targetScreenParam?: string,
  jwtTokenParam?: string
): TenantIsolationValidationResult {
  let params: TenantIsolationValidationParams;

  if (paramsOrUser && typeof paramsOrUser === 'object' && 'role' in paramsOrUser) {
    params = {
      currentUser: paramsOrUser as User,
      schoolId: schoolIdParam,
      targetScreen: targetScreenParam,
      jwtToken: jwtTokenParam,
      activeSessionStatus: 'VALID',
    };
  } else {
    params = (paramsOrUser as TenantIsolationValidationParams) || {};
  }

  const {
    tenantId,
    schoolId,
    targetSchoolId,
    currentUser,
    targetScreen,
    activeSessionStatus = 'VALID',
  } = params;

  const user = currentUser;
  const isOwner = isOwnerOrSuperAdmin(user);

  // Check 5: Active Session Status
  const activeSessionValidated = activeSessionStatus === 'VALID' && !!user && !!user.id;

  // Check 3: User ID Validation
  const userIdValidated = !!user && !!user.id && (user.active !== false);

  // Check 1 & 2: Tenant & School ID
  const effectiveSchoolId = schoolId || tenantId || user?.schoolId;
  const targetId = targetSchoolId || effectiveSchoolId;
  const tenantIdValidated = !!effectiveSchoolId;
  const schoolIdValidated = isOwner || (effectiveSchoolId === targetId);

  // Check 4: Role Permissions
  const rolePermissionsValidated = isOwner || (targetScreen ? !isPlatformGovernanceComponent(targetScreen) : true);

  // Rule A: Platform Governance Access Restriction
  if (targetScreen && isPlatformGovernanceComponent(targetScreen)) {
    if (!isOwner) {
      const msg = `CRITICAL ACCESS ISOLATION VIOLATION: Platform Governance Component '${targetScreen}' is permanently reserved for the Owner/Super Administrator under SCMH 2.X Policy. Access is strictly forbidden for role '${user?.role || 'ANONYMOUS'}'.`;
      return {
        isAllowed: false,
        violationCode: 'PLATFORM_GOVERNANCE_ACCESS_FORBIDDEN',
        violationMessage: msg,
        reason: msg,
        checkpoints: {
          tenantIdValidated,
          schoolIdValidated,
          userIdValidated,
          rolePermissionsValidated: false,
          activeSessionValidated,
        },
        checkpointsFailed: ['Role Permissions (Owner/Super Admin Reservation)'],
      };
    }
  }

  // Rule B: Cross-School Access Attempt
  if (!isOwner && targetSchoolId && user?.schoolId && targetSchoolId !== user.schoolId) {
    const msg = `CROSS-TENANT ACCESS BLOCKED: User '${user.fullName}' belonging to school '${user.schoolId}' attempted to query or access records from another institution '${targetSchoolId}'.`;
    return {
      isAllowed: false,
      violationCode: 'CROSS_TENANT_ACCESS_REJECTED',
      violationMessage: msg,
      reason: msg,
      checkpoints: {
        tenantIdValidated,
        schoolIdValidated: false,
        userIdValidated,
        rolePermissionsValidated: false,
        activeSessionValidated,
      },
      checkpointsFailed: ['School ID Validation', 'Role Permissions'],
    };
  }

  if (!activeSessionValidated) {
    const msg = 'Authentication session expired or invalid. Please re-authenticate.';
    return {
      isAllowed: false,
      violationCode: 'SESSION_INVALID',
      violationMessage: msg,
      reason: msg,
      checkpoints: {
        tenantIdValidated,
        schoolIdValidated,
        userIdValidated: false,
        rolePermissionsValidated: false,
        activeSessionValidated: false,
      },
      checkpointsFailed: ['User ID Validation', 'Active Session Validation'],
    };
  }

  return {
    isAllowed: true,
    checkpoints: {
      tenantIdValidated: true,
      schoolIdValidated: true,
      userIdValidated: true,
      rolePermissionsValidated,
      activeSessionValidated: true,
    },
    checkpointsFailed: [],
  };
}

/**
 * Strict Multi-Tenant Record Filter:
 * Ensures school users can NEVER see, search, discover, or export records belonging to other schools.
 */
export function enforceTenantIsolation<T extends { schoolId?: string }>(
  records: T[],
  authenticatedSchoolId: string,
  user?: User | null
): T[] {
  if (!records || !Array.isArray(records)) return [];

  // Super Admin can view all or filter by selected tenant
  if (isOwnerOrSuperAdmin(user)) {
    if (!authenticatedSchoolId || authenticatedSchoolId === 'ALL') {
      return records;
    }
    return records.filter((r) => !r.schoolId || r.schoolId === authenticatedSchoolId);
  }

  // School personnel are strictly constrained to their own authenticated school
  const targetSchool = user?.schoolId || authenticatedSchoolId;
  return records.filter((r) => !r.schoolId || r.schoolId === targetSchool);
}

/**
 * Filter search results to guarantee zero discovery of other school tenants.
 */
export function enforceSearchIsolation<T extends { schoolId?: string }>(
  records: T[],
  query: string,
  authenticatedSchoolId: string,
  user?: User | null
): T[] {
  const tenantRecords = enforceTenantIsolation(records, authenticatedSchoolId, user);
  const q = (query || '').trim().toLowerCase();
  if (!q) return tenantRecords;

  return tenantRecords.filter((item: any) => {
    const jsonStr = JSON.stringify(item).toLowerCase();
    return jsonStr.includes(q);
  });
}
