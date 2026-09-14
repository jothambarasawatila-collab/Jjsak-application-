import { SchoolTenant, User, SchoolInfo } from '../types';

/**
 * JJSAK CLEAN DEPLOYMENT, SCHOOL REGISTRATION, INSTITUTION IDENTITY PROTECTION & TENANT ISOLATION
 * Requirement IDs: JJSAK-DEPLOY-001 / JJSAK-AUTH-SEC-001
 * Status: APPROVED FOR IMPLEMENTATION — LOCKED
 *
 * Core Policies Enforced:
 * 1. ZERO-SCHOOL PRODUCTION STATE:
 *    - The platform launches with 0 registered institutions, 0 active schools, 0 tenants,
 *      0 learners, 0 teachers, 0 classes, 0 assessments, 0 timetables, 0 reports.
 * 2. OWNER-CONTROLLED REGISTRATION:
 *    - The Owner / Super Administrator is the sole platform authority responsible for registering schools.
 *    - Registration follows the strict 5-stage lifecycle:
 *      Registration → Verification → Provisioning → Activation → School Access
 * 3. NEW SCHOOL INITIAL STATE:
 *    - A newly activated school begins with system-generated tenant config and authorized initial account,
 *      with 0 pre-populated learners, teachers, marks, assessments, or timetables.
 * 4. PRE-AUTHENTICATION INSTITUTION IDENTITY PROTECTION:
 *    - Zero school-specific data is exposed before successful authentication.
 * 5. OWNER / SUPER ADMINISTRATOR BOUNDARY:
 *    - The Owner does NOT belong to any school tenant and possesses no default school membership.
 */

export const CLEAN_DEPLOYMENT_STORAGE_KEYS = {
  STATE_FLAG: 'jjsak_clean_deployment_state_v1',
  TENANTS: 'jjsak_tenants',
  USERS: 'jjsak_users',
  STUDENTS: 'jjsak_students',
  TEACHERS: 'jjsak_teachers',
  ASSESSMENTS: 'jjsak_assessments',
  TIMETABLES: 'jjsak_timetables',
  ATTENDANCE: 'jjsak_attendance_registers',
  SCHOOL_INFO: 'jjsak_school_info',
  ACTIVE_TENANT: 'jjsak_active_tenant_id',
};

// Authorized Platform Owner & Super Administrator Account (§17 & §18)
// Outside all school tenants. No default school membership.
export const AUTHORIZED_PLATFORM_OWNER: User = {
  id: 'usr-001',
  fullName: 'Jotham Barasa Watila',
  username: 'jotham Watila',
  email: 'jothambarasawatila@gmail.com',
  phoneNumber: '+254 741 478 813 / +254 100 559 811',
  role: 'SUPER_ADMIN',
  designation: 'Platform Owner & Super Administrator',
  password: '299991jB@#2026',
  active: true,
  mfaEnabled: true,
  mfaMethod: 'SMS_OTP',
  firstLoginCompleted: true,
  activationStatus: 'ACTIVE',
  // Critical Boundary Rule (§17): The Owner belongs to NO school tenant
  schoolId: undefined,
  employeeNumber: undefined,
};

// Generic Clean Platform Baseline Info (Zero-School State)
export const CLEAN_PLATFORM_INFO: SchoolInfo = {
  name: 'JJSAK Educational Assessment Platform',
  motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
  term: 'Term 1',
  year: 2026,
  headTeacher: 'Platform Administration',
  headOfInstitution: 'Platform Administration',
  logoInitial: 'J',
  nextTermOpenDate: '2026-05-04',
  totalStudents: 0,
  totalClasses: 0,
  totalAssessments: 0,
  avgPerformance: 0,
};

export class CleanDeploymentService {
  private static instance: CleanDeploymentService;

  private constructor() {}

  public static getInstance(): CleanDeploymentService {
    if (!CleanDeploymentService.instance) {
      CleanDeploymentService.instance = new CleanDeploymentService();
    }
    return CleanDeploymentService.instance;
  }

  /**
   * Checks if clean deployment state is active.
   * By default under JJSAK-DEPLOY-001, fresh deployments or explicit resets start clean.
   */
  public isCleanDeploymentInitialized(): boolean {
    try {
      return localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STATE_FLAG) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Initializes the Zero-School Production State (Rule §2 & §3)
   * Wipes all mock schools, learners, teachers, assessments, marks, and timetables.
   * Leaves Registered Schools: 0 and only the authorized Owner / Super Admin account.
   */
  public initializeZeroSchoolState(): void {
    try {
      // 1. Mark clean deployment state as initialized
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STATE_FLAG, 'ZERO_SCHOOL_PRODUCTION_STATE');

      // 2. Set schools/tenants to empty array (0 registered institutions)
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TENANTS, JSON.stringify([]));

      // 3. Set users to contain ONLY the Platform Owner & Super Administrator
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.USERS, JSON.stringify([AUTHORIZED_PLATFORM_OWNER]));

      // 4. Wipe all institutional operational data (0 learners, 0 teachers, 0 marks, 0 assessments)
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TEACHERS, JSON.stringify([]));
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.ASSESSMENTS, JSON.stringify([]));
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TIMETABLES, JSON.stringify([]));
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
      localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(CLEAN_PLATFORM_INFO));
      localStorage.removeItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.ACTIVE_TENANT);
      localStorage.removeItem('jjsak_active_tenant_id');
      localStorage.removeItem('jjsak_active_school_id');

      // Clean secondary operational keys
      localStorage.removeItem('jjsak_deadlines');
      localStorage.removeItem('jjsak_transfers');
      localStorage.removeItem('jjsak_promotions');
      localStorage.removeItem('jjsak_archives');
      localStorage.removeItem('jjsak_behavior_records');
      localStorage.removeItem('jjsak_discipline_incidents');
      localStorage.removeItem('jjsak_health_incidents');
      localStorage.removeItem('jjsak_health_profiles');
      localStorage.removeItem('jjsak_counseling_sessions');
      localStorage.removeItem('jjsak_vulnerable_learners');
      localStorage.removeItem('jjsak_transfers_out');
      localStorage.removeItem('jjsak_transfers_in');
      localStorage.removeItem('jjsak_graduations');
      localStorage.removeItem('jjsak_parent_communications');
      localStorage.removeItem('jjsak_academic_streams');
      localStorage.removeItem('jjsak_teacher_subject_allocations');
      localStorage.removeItem('jjsak_class_teacher_allocations');
      localStorage.removeItem('jjsak_recycle_bin');
      localStorage.removeItem('jjsak_institutional_subscriptions');
      localStorage.removeItem('jjsak_subscription_invoices');
      localStorage.removeItem('jjsak_subscription_transactions');
      localStorage.removeItem('jjsak_owner_payment_notifications');
      localStorage.removeItem('jjsak_owner_governance_state');
    } catch (e) {
      console.error('Failed to initialize zero school state:', e);
    }
  }

  /**
   * Purges all test schools (Ngonyek, Cheptiret, St. Mary's, Green Hill, Kitale Comprehensive)
   * and associated mock users/records from the system and storage.
   */
  public purgeTestSchools(): void {
    try {
      const isTestSchoolIdentifier = (id?: string, name?: string): boolean => {
        if (!id && !name) return false;
        const lowerId = (id || '').toLowerCase();
        const lowerName = (name || '').toLowerCase();
        return (
          lowerId === 'sch-ngonyek-001' ||
          lowerId === 'sch-stmarys-004' ||
          lowerId === 'sch-stmarys-003' ||
          lowerId === 'sch-greenhill-005' ||
          lowerId === 'sch-kitale-002' ||
          lowerId === 'sch-chep-003' ||
          lowerId.includes('ngonyek') ||
          lowerId.includes('stmary') ||
          lowerId.includes('greenhill') ||
          lowerId.includes('chep') ||
          lowerName.includes('ngonyek') ||
          lowerName.includes('cheptiret') ||
          lowerName.includes('st mary') ||
          lowerName.includes('st. mary') ||
          lowerName.includes('green hill') ||
          lowerName.includes('greenhill') ||
          lowerName.includes('kitale comprehensive')
        );
      };

      // 1. Purge from tenants
      const savedTenants = localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TENANTS);
      if (savedTenants) {
        try {
          const parsed = JSON.parse(savedTenants);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((t: any) => !isTestSchoolIdentifier(t.schoolId, t.schoolName));
            localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TENANTS, JSON.stringify(cleaned));
          }
        } catch {
          localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TENANTS, JSON.stringify([]));
        }
      }

      // 2. Purge test users
      const savedUsers = localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.USERS);
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((u: any) => {
              if (u.id === 'usr-001' || u.role === 'SUPER_ADMIN' || u.role === 'SYSTEM_ADMIN') return true;
              return !isTestSchoolIdentifier(u.schoolId, u.schoolName);
            });
            localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.USERS, JSON.stringify(cleaned));
          }
        } catch {
          localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.USERS, JSON.stringify([AUTHORIZED_PLATFORM_OWNER]));
        }
      }

      // 3. Purge test students
      const savedStudents = localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STUDENTS);
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((s: any) => !isTestSchoolIdentifier(s.schoolId, s.schoolName));
            localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STUDENTS, JSON.stringify(cleaned));
          }
        } catch {
          localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.STUDENTS, JSON.stringify([]));
        }
      }

      // 4. Purge test teachers
      const savedTeachers = localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TEACHERS);
      if (savedTeachers) {
        try {
          const parsed = JSON.parse(savedTeachers);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((t: any) => !isTestSchoolIdentifier(t.schoolId));
            localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TEACHERS, JSON.stringify(cleaned));
          }
        } catch {
          localStorage.setItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.TEACHERS, JSON.stringify([]));
        }
      }

      // 5. Purge active tenant if it was a test school
      const activeTenant = localStorage.getItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.ACTIVE_TENANT);
      if (activeTenant && isTestSchoolIdentifier(activeTenant)) {
        localStorage.removeItem(CLEAN_DEPLOYMENT_STORAGE_KEYS.ACTIVE_TENANT);
      }
      const activeTenantId = localStorage.getItem('jjsak_active_tenant_id');
      if (activeTenantId && isTestSchoolIdentifier(activeTenantId)) {
        localStorage.removeItem('jjsak_active_tenant_id');
      }

      // 6. Clean subscriptions and payment transactions
      localStorage.removeItem('jjsak_institutional_subscriptions');
      localStorage.removeItem('jjsak_subscription_invoices');
      localStorage.removeItem('jjsak_subscription_transactions');
      localStorage.removeItem('jjsak_owner_payment_notifications');
    } catch (e) {
      console.error('Failed to purge test schools:', e);
    }
  }

  /**
   * Executes School Registration Workflow (Part B, Rule §5):
   * Lifecycle: Registration → Verification → Provisioning → Activation → School Access
   * Creates an active tenant and auto-provisions the initial Head of Institution account.
   * The new school begins with 0 pre-populated learners, marks, assessments, or timetables (Rule §6).
   */
  public registerAndOnboardSchoolTenant(params: {
    schoolName: string;
    schoolCode: string;
    subdomain?: string;
    category?: 'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED' | 'OTHER';
    schoolType?: string;
    county?: string;
    subCounty?: string;
    ward?: string;
    physicalAddress?: string;
    postalAddress?: string;
    officialEmail?: string;
    officialPhone?: string;
    website?: string;
    motto?: string;
    logoUrl?: string;
    stampUrl?: string;
    adminFullName?: string;
    adminEmail?: string;
    adminPhone?: string;
    adminNationalId?: string;
  }): { tenant: SchoolTenant; initialAdminUser: User } {
    const cleanName = params.schoolName.trim();
    const cleanCode = params.schoolCode.trim().toUpperCase();
    const cleanSubdomain = (
      params.subdomain ||
      cleanName.split(' ')[0] ||
      cleanCode
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const schoolId = `sch-${cleanSubdomain}-${Date.now().toString().slice(-4)}`;
    const tenantDomain = `${cleanSubdomain}.jjsak.com`;
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    // Stage 1-4: Registered, Verified, Provisioned, and Activated by Platform Owner
    const tenant: SchoolTenant = {
      schoolId,
      schoolCode: cleanCode,
      schoolName: cleanName,
      subdomain: cleanSubdomain,
      tenantDomain,
      category: params.category || 'JUNIOR',
      schoolType: params.schoolType || 'Public',
      country: 'Kenya',
      county: params.county || 'Trans Nzoia',
      subCounty: params.subCounty || 'Kiminini',
      ward: params.ward || 'Sirende',
      physicalAddress: params.physicalAddress || `${params.ward || 'Central'}, ${params.subCounty || 'Sub-County'}`,
      postalAddress: params.postalAddress || `P.O. Box 450 - 30200, Kitale`,
      address: params.physicalAddress || `${params.ward || 'Central'}, ${params.subCounty || 'Sub-County'}`,
      officialEmail: params.officialEmail || `info@${cleanSubdomain}.sc.ke`,
      email: params.officialEmail || `info@${cleanSubdomain}.sc.ke`,
      officialPhone: params.officialPhone || '+254 700 000 000',
      phone: params.officialPhone || '+254 700 000 000',
      website: params.website || `https://${tenantDomain}`,
      motto: params.motto || 'Strive for Excellence and Integrity',
      logoUrl: params.logoUrl || '',
      stampUrl: params.stampUrl || '',
      status: 'ACTIVE', // Fully Activated after Owner verification & provisioning (§5)
      verifiedAt: nowIso,
      verifiedBy: 'Jotham Barasa Watila (Platform Owner)',
      activatedAt: nowIso,
      activatedBy: 'Jotham Barasa Watila (Platform Owner)',
      createdAt: today,
      administratorDetails: {
        fullName: params.adminFullName || `Head of Institution (${cleanName})`,
        nationalId: params.adminNationalId || '24567890',
        phoneNumber: params.adminPhone || params.officialPhone || '+254 722 000 111',
        emailAddress: params.adminEmail || `admin@${cleanSubdomain}.sc.ke`,
      },
      schoolBranding: {
        themePreset: 'maroon',
        primaryColor: '#881337',
        secondaryColor: '#E11D48',
        backgroundColor: '#FFF1F2',
        cardColorStyle: 'clean-white',
        navMenuColorStyle: 'theme-matched',
        headerColorStyle: 'gradient',
        footerColorStyle: 'brand-accent',
        buttonColorStyle: 'brand-primary',
        motto: params.motto || 'Strive for Excellence and Integrity',
        logoUrl: params.logoUrl || '',
        stampUrl: params.stampUrl || '',
        banners: {
          welcomeBannerText: `Welcome to ${cleanName} Portal`,
          mottoBannerText: params.motto || 'Strive for Excellence',
          visionBannerText: 'To be a premier center of holistic CBC junior academic excellence.',
          missionBannerText: 'Nurturing innovative, disciplined, and self-reliant learners.',
          bannerStyle: 'gradient',
          showWelcomeBanner: true,
          showMottoBanner: true,
          showVisionBanner: false,
        },
        lastModifiedBy: params.adminFullName || 'Head of Institution',
        lastModifiedRole: 'HEAD_OF_INSTITUTION',
        lastModifiedAt: Date.now(),
        isApprovedBySuperAdmin: true,
      },
    };

    // Stage 5: Authorized Initial Account Provisioning (Rule §6)
    // Head of Institution / Principal Account for this isolated tenant
    const initialAdminUser: User = {
      id: `usr-${cleanSubdomain}-admin`,
      schoolId,
      fullName: params.adminFullName || `Headteacher (${cleanName})`,
      username: `head.${cleanSubdomain}`,
      email: params.adminEmail || `head@${cleanSubdomain}.sc.ke`,
      phoneNumber: params.adminPhone || params.officialPhone || '+254 722 000 111',
      role: 'HEAD',
      designation: 'Head of Institution / Principal',
      password: 'Password@2026!',
      active: true,
      mfaEnabled: true,
      mfaMethod: 'SMS_OTP',
      firstLoginCompleted: true,
      activationStatus: 'ACTIVE',
      employeeNumber: `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    return { tenant, initialAdminUser };
  }

  /**
   * Pre-configured Sample School Templates: Cleared for clean production deployment.
   * Schools must be explicitly registered via the Stage 3 Onboarding Lifecycle.
   */
  public getSampleSchoolTemplates(): SchoolTemplateDefinition[] {
    return [];
  }
}

export interface SchoolTemplateDefinition {
  id: string;
  schoolName: string;
  schoolCode: string;
  subdomain?: string;
  category: 'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED' | 'OTHER';
  schoolType: string;
  county: string;
  subCounty: string;
  ward: string;
  physicalAddress: string;
  postalAddress: string;
  officialEmail: string;
  officialPhone: string;
  motto: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
}

export const cleanDeploymentService = CleanDeploymentService.getInstance();
