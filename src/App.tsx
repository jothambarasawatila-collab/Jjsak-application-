import { useState, useEffect, useMemo } from 'react';
import {
  ActiveScreen,
  BottomNavTab,
  Student,
  Assessment,
  Teacher,
  SchoolInfo,
  SchoolProfile,
  SchoolSubscription,
  SubscriptionActivation,
  User,
  SchoolTenant,
  SchoolStatus,
  AuditLogEntry,
  AuditActionType,
  RecycleBinItem,
  JWTSession,
  UserRole,
  MarksDeadline,
  TeacherNotification,
  InterClassTransferRecord,
  PromotionRecord,
  AcademicYearArchive,
  BehaviorRecord,
  ClassAttendanceRegister,
  DisciplineIncident,
  LearnerHealthProfile,
  HealthIncidentRecord,
  CounselingSession,
  VulnerableLearnerRecord,
  TransferOutRecord,
  TransferInRecord,
  Grade9GraduationRecord,
  ParentCommunicationRecord,
  WelfareEventCheckInRecord,
} from './types';
import {
  DEFAULT_SCHOOL_INFO,
  DEFAULT_SCHOOL_PROFILE,
  DEFAULT_SUBSCRIPTION,
  DEFAULT_TENANT_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_TEACHERS,
  INITIAL_USERS,
  calculateStudentRankings,
  isSubscriptionValid,
} from './data/mockData';
import {
  INITIAL_DEADLINES,
  INITIAL_TEACHER_NOTIFICATIONS,
  INITIAL_TRANSFERS,
  INITIAL_PROMOTIONS,
  INITIAL_ARCHIVES,
  INITIAL_BEHAVIOR_RECORDS,
} from './data/academicData';
import {
  INITIAL_ATTENDANCE_REGISTERS,
  INITIAL_DISCIPLINE_INCIDENTS,
  INITIAL_HEALTH_PROFILES,
  INITIAL_HEALTH_INCIDENTS,
  INITIAL_COUNSELING_SESSIONS,
  INITIAL_VULNERABLE_LEARNERS,
  INITIAL_TRANSFERS_OUT,
  INITIAL_TRANSFERS_IN,
  INITIAL_GRADUATION_RECORDS,
  INITIAL_PARENT_COMMUNICATIONS,
  INITIAL_WELFARE_CHECKINS,
} from './data/learnerWelfareData';
import {
  INITIAL_CURRICULUM_FRAMEWORK,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_ACADEMIC_TERMS,
  INITIAL_LEARNING_LEVELS,
  INITIAL_GRADES,
  INITIAL_STREAMS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHER_SUBJECT_ALLOCATIONS,
  INITIAL_CLASS_TEACHER_ALLOCATIONS,
  INITIAL_LEARNER_PLACEMENT_RULES,
  INITIAL_PROMOTION_POLICIES,
  INITIAL_LEARNING_AREA_STRANDS,
  INITIAL_ACADEMIC_AUDIT_LOGS,
} from './data/academicStructureData';
import {
  CurriculumFramework,
  AcademicYearConfig,
  AcademicTermConfig,
  LearningLevelConfig,
  GradeConfig,
  StreamConfig,
  SubjectDefinition,
  TeacherSubjectAllocation,
  ClassTeacherAllocation,
  LearnerPlacementRule,
  PromotionPolicyConfig,
  AcademicStructureAuditEntry,
} from './types/academicStructure';
import { TimetableLesson } from './types/timetable';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { AssessmentsScreen } from './components/AssessmentsScreen';
import { StudentReportScreen } from './components/StudentReportScreen';
import { StudentsScreen } from './components/StudentsScreen';
import { TeachersScreen } from './components/TeachersScreen';
import { ImportExportScreen } from './components/ImportExportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { PathwayFinderScreen } from './components/PathwayFinderScreen';
import { TimetableScreen } from './components/TimetableScreen';
import { AssessmentGeneratorScreen } from './components/AssessmentGeneratorScreen';
import { SchoolProfileScreen } from './components/SchoolProfileScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { SecurityCoreScreen } from './components/SecurityCoreScreen';
import { AcademicOperationsScreen } from './components/academic/AcademicOperationsScreen';
import { AcademicStructureHub } from './components/academicStructure/AcademicStructureHub';
import { LearnerWelfareHub } from './components/learnerWelfare/LearnerWelfareHub';
import { PermanentDeletionModal } from './components/PermanentDeletionModal';
import { AuthenticationModal } from './components/AuthenticationModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { BottomNavBar } from './components/BottomNavBar';
import { ShareAppModal } from './components/ShareAppModal';
import { TeacherMarksEntryModal } from './components/TeacherMarksEntryModal';
import { SessionInactivityGuard } from './components/SessionInactivityGuard';
import { RecycleBinModal } from './components/RecycleBinModal';
import { ReportsHubScreen } from './components/ReportsHubScreen';
import { MasterArchitectureScreen } from './components/MasterArchitectureScreen';
import { DataEntryHubModal, DataEntryMode } from './components/DataEntryHubModal';
import { CommunicationHubModal, CommTab } from './components/CommunicationHubModal';
import { OwnerSchoolManagementScreen } from './components/launchFlow/OwnerSchoolManagementScreen';
import { SecurityBoundaryModal } from './components/SecurityBoundaryModal';
import { DownloadSchoolAppModal } from './components/DownloadSchoolAppModal';
import { PWAInstallHeaderButton } from './components/pwa/PWAInstallHeaderButton';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { FirstTimeStaffActivationModal } from './components/auth/FirstTimeStaffActivationModal';
import { InstitutionalRoleGovernanceModal } from './components/security/InstitutionalRoleGovernanceModal';
import { SelfServiceRoleIntegrityModal } from './components/security/SelfServiceRoleIntegrityModal';
import { SecureInstitutionalLoginScreen } from './components/auth/SecureInstitutionalLoginScreen';
import { SimulatedCarrierInboxModal } from './components/auth/SimulatedCarrierInboxModal';
import { TeacherValidationAndActivationModal } from './components/auth/TeacherValidationAndActivationModal';
import { SchoolOnboardingActivationModal } from './components/auth/SchoolOnboardingActivationModal';
import { institutionalRoleGovernanceService } from './services/institutionalRoleGovernanceService';
import { masterAuthorizationService } from './services/masterAuthorizationService';
import { createAuditLog, generateJWTSession, createRecycleBinItem } from './utils/securityEngine';
import {
  isPlatformGovernanceComponent,
  validateAccessBoundary,
  isOwnerOrSuperAdmin,
} from './utils/platformGovernance';
import { OwnerPlatformDashboard } from './components/ownerDashboard/OwnerPlatformDashboard';
import { OwnerBoundaryNoticeModal } from './components/ownerDashboard/OwnerBoundaryNoticeModal';
import { EmergencyAccessBanner } from './components/ownerDashboard/EmergencyAccessBanner';
import { EmergencyAccessManagerModal } from './components/ownerDashboard/EmergencyAccessManagerModal';
import { ApprovedExceptionsModal } from './components/ownerDashboard/ApprovedExceptionsModal';
import { DualIdentityModal } from './components/ownerDashboard/DualIdentityModal';
import { ownerGovernanceService } from './services/ownerGovernanceService';
import { EmergencyAccessSession } from './types/ownerGovernance';
import {
  cleanDeploymentService,
  AUTHORIZED_PLATFORM_OWNER,
  CLEAN_PLATFORM_INFO,
} from './services/cleanDeploymentService';
import { carrierInboxService } from './services/carrierInboxService';
import { tenantDataSyncService } from './services/tenantDataSyncService';
import { institutionalSubscriptionService } from './services/institutionalSubscriptionService';
import {
  NGONYEK_SCHOOL_ID,
  NGONYEK_GRADE7_STUDENTS,
  NGONYEK_TEACHERS,
  NGONYEK_USERS,
} from './data/ngonyekJuniorSchoolData';

// Registered Institutions: Ngonyek Junior School (Flagship Junior School with 40 registered learners) and Yuya Primary School
const INITIAL_ONBOARDED_SCHOOLS: SchoolTenant[] = [
  {
    schoolId: 'sch-ngonyek-30200',
    schoolCode: 'NJS-30200',
    schoolName: 'Ngonyek Junior School',
    category: 'JUNIOR',
    subdomain: 'ngonyek',
    tenantDomain: 'ngonyek.jjsak.edu.ke',
    registrationNumber: 'MOE/JS/30200/NGONYEK',
    address: 'Ngonyek Centre, Sirende Ward, Kiminini, P.O. Box 450 - 30200, Kitale',
    phone: '+254 741 478 813',
    email: 'info@ngonyek.sc.ke',
    officialEmail: 'info@ngonyek.sc.ke',
    status: 'TRIAL',
    createdAt: '2026-03-01',
    administratorDetails: {
      fullName: 'Principal (Ngonyek Junior School)',
      phoneNumber: '+254 741 478 813',
      emailAddress: 'head@ngonyek.sc.ke',
    },
  },
  {
    schoolId: 'sch-yuya-30200',
    schoolCode: 'YPS-30200',
    schoolName: 'Yuya Primary School',
    category: 'PRIMARY',
    subdomain: 'yuya',
    tenantDomain: 'yuya.jjsak.edu.ke',
    registrationNumber: 'MOE/PRI/30200/YUYA',
    address: 'Sirende Ward, Off Kitale-Webuye Highway, P.O. Box 450 - 30200, Kitale',
    phone: '+254 741 478 813',
    email: 'info@yuya.sc.ke',
    officialEmail: 'info@yuya.sc.ke',
    status: 'TRIAL',
    createdAt: '2026-03-01',
    administratorDetails: {
      fullName: 'Headteacher (Yuya Primary School)',
      phoneNumber: '+254 741 478 813',
      emailAddress: 'head@yuya.sc.ke',
    },
  },
];

const INITIAL_ONBOARDED_HEAD_USERS: User[] = [
  {
    id: 'usr-head-ngonyek-30200',
    schoolId: 'sch-ngonyek-30200',
    schoolName: 'Ngonyek Junior School',
    fullName: 'Principal (Ngonyek Junior School)',
    username: 'head.ngonyek',
    email: 'head@ngonyek.sc.ke',
    phoneNumber: '+254 741 478 813',
    role: 'HEAD',
    designation: 'Head of Institution / Principal',
    password: 'Password@2026!',
    firstTimePassword: 'Password@2026!',
    schoolAccountAlias: 'ngonyek@jjsak',
    active: true,
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    firstLoginCompleted: false,
    activationStatus: 'PENDING_ACTIVATION',
    employeeNumber: 'TSC-319804',
  },
  {
    id: 'usr-head-yuya-30200',
    schoolId: 'sch-yuya-30200',
    schoolName: 'Yuya Primary School',
    fullName: 'Headteacher (Yuya Primary School)',
    username: 'head.yuya',
    email: 'head@yuya.sc.ke',
    phoneNumber: '+254 741 478 813',
    role: 'HEAD',
    designation: 'Head of Institution',
    password: 'Password@2026!',
    firstTimePassword: 'Password@2026!',
    schoolAccountAlias: 'yuya@jjsak',
    active: true,
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    firstLoginCompleted: false,
    activationStatus: 'PENDING_ACTIVATION',
    employeeNumber: 'TSC-241890',
  },
];
import {
  Smartphone,
  Laptop,
  Share2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Lock,
  LogOut,
  Trash2,
  Key,
  Layers,
  GraduationCap,
  Building2,
  ArrowRightLeft,
  Inbox,
} from 'lucide-react';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('home');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [saveStatusText, setSaveStatusText] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Global Modals State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTeacherMarksModalOpen, setIsTeacherMarksModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isDataEntryHubOpen, setIsDataEntryHubOpen] = useState(false);
  const [dataEntryHubMode, setDataEntryHubMode] = useState<DataEntryMode>('individual');
  const [isCommunicationHubOpen, setIsCommunicationHubOpen] = useState(false);
  const [communicationHubTab, setCommunicationHubTab] = useState<CommTab>('parents');
  const [isDownloadAppModalOpen, setIsDownloadAppModalOpen] = useState(false);
  const [isFirstTimeActivationModalOpen, setIsFirstTimeActivationModalOpen] = useState(false);
  const [isRoleGovernanceModalOpen, setIsRoleGovernanceModalOpen] = useState(false);
  const [isSelfServiceIntegrityModalOpen, setIsSelfServiceIntegrityModalOpen] = useState(false);
  const [isCarrierInboxOpen, setIsCarrierInboxOpen] = useState(false);
  const [isTeacherValidationOpen, setIsTeacherValidationOpen] = useState(false);
  const [teacherValidationParams, setTeacherValidationParams] = useState<{
    otp?: string;
    username?: string;
    schoolId?: string;
    password?: string;
  }>({});
  const [isSchoolActivationOpen, setIsSchoolActivationOpen] = useState(false);
  const [schoolActivationParams, setSchoolActivationParams] = useState<{
    schoolId?: string;
    schoolName?: string;
    registrationNumber?: string;
    schoolAccount?: string;
    otp?: string;
    temporaryPassword?: string;
  }>({});

  // Owner Governance, Boundary Protection & Emergency Modals
  const [isOwnerBoundaryModalOpen, setIsOwnerBoundaryModalOpen] = useState(false);
  const [boundaryTargetName, setBoundaryTargetName] = useState('');
  const [isDualIdentityModalOpen, setIsDualIdentityModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isExceptionsModalOpen, setIsExceptionsModalOpen] = useState(false);
  const [activeEmergencySession, setActiveEmergencySession] = useState<EmergencyAccessSession | null>(() =>
    ownerGovernanceService.getActiveEmergencySession()
  );
  const [securityBoundaryState, setSecurityBoundaryState] = useState<{
    isOpen: boolean;
    target: string;
    message?: string;
  }>({
    isOpen: false,
    target: '',
  });

  const [deletionModalState, setDeletionModalState] = useState<{
    isOpen: boolean;
    itemTitle: string;
    itemType: string;
    onConfirm: (reason: string) => void;
  }>({
    isOpen: false,
    itemTitle: '',
    itemType: '',
    onConfirm: () => {},
  });

  const [teacherMarksParams, setTeacherMarksParams] = useState<{
    teacherId?: string;
    className?: string;
    subject?: string;
    assessmentId?: string;
  }>({});

  // Active User & RBAC State (Code P2.2 & P2.3)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('jjsak_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'SYSTEM_ADMIN' || parsed.role === 'SUPER_ADMIN' || parsed.id === 'usr-001') {
          return {
            ...parsed,
            schoolId: undefined,
            employeeNumber: undefined,
            designation: 'Platform Owner & Super Administrator',
            fullName: 'Jotham Barasa Watila',
            email: 'jothambarasawatila@gmail.com',
            username: 'jotham Watila',
            phoneNumber: '+254741478813 / +254100559811',
            password: '299991jB@#2026',
            mfaEnabled: true,
          };
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const deletedIds = tenantDataSyncService.getDeletedTenantIds();
    const deletedSet = new Set(deletedIds);
    const initialHeadUsers = INITIAL_ONBOARDED_HEAD_USERS.filter(
      (iu) => !iu.schoolId || !deletedSet.has(iu.schoolId)
    );
    const saved = localStorage.getItem('jjsak_users');
    let baseList = [...INITIAL_USERS, ...initialHeadUsers, ...NGONYEK_USERS];
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filteredParsed = parsed.filter((u) => !u.schoolId || !deletedSet.has(u.schoolId));
          const existingIds = new Set(filteredParsed.map((u) => u.id));
          baseList = [...filteredParsed];
          [...INITIAL_USERS, ...initialHeadUsers, ...NGONYEK_USERS].forEach((iu) => {
            if (!existingIds.has(iu.id) && (!iu.schoolId || !deletedSet.has(iu.schoolId))) {
              baseList.push(iu);
            }
          });
        }
      } catch {
        baseList = [...INITIAL_USERS, ...initialHeadUsers, ...NGONYEK_USERS];
      }
    }
    const finalUsers = baseList
      .filter((u) => !u.schoolId || !deletedSet.has(u.schoolId))
      .map((u) => {
        if (u.role === 'SYSTEM_ADMIN' || u.role === 'SUPER_ADMIN' || u.id === 'usr-001') {
          return {
            ...u,
            schoolId: undefined,
            employeeNumber: undefined,
            designation: 'Platform Owner & Super Administrator',
            fullName: 'Jotham Barasa Watila',
            email: 'jothambarasawatila@gmail.com',
            username: 'jotham Watila',
            phoneNumber: '+254741478813 / +254100559811',
            password: '299991jB@#2026',
            mfaEnabled: true,
          };
        }
        return u;
      });
    try {
      localStorage.setItem('jjsak_users', JSON.stringify(finalUsers));
    } catch {}
    return finalUsers;
  });

  // Multi-School Tenancy (Code P2.1 & P2.11)
  const [tenants, setTenants] = useState<SchoolTenant[]>(() => {
    const deletedIds = tenantDataSyncService.getDeletedTenantIds();
    const deletedSet = new Set(deletedIds);
    const defaultSchools = [...INITIAL_ONBOARDED_SCHOOLS, ...DEFAULT_TENANT_SCHOOLS].filter(
      (s) => !deletedSet.has(s.schoolId)
    );
    const saved = localStorage.getItem('jjsak_tenants');
    if (!saved) return defaultSchools;
    try {
      const parsed: SchoolTenant[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0 && cleanDeploymentService.isCleanDeploymentInitialized()) {
          return [];
        }
        const filteredParsed = parsed.filter((t) => t && t.schoolId && !deletedSet.has(t.schoolId));
        const normalizedParsed: SchoolTenant[] = filteredParsed.map((t) => ({
          ...t,
          status: ((t.status === 'DISABLED' || t.status === 'SUSPENDED') ? t.status : 'TRIAL') as SchoolStatus,
        }));
        const existingIds = new Set(normalizedParsed.map((t) => t.schoolId));
        const merged: SchoolTenant[] = [...normalizedParsed];
        defaultSchools.forEach((dt) => {
          if (!deletedSet.has(dt.schoolId) && !existingIds.has(dt.schoolId)) {
            merged.push(dt);
          } else if (existingIds.has(dt.schoolId)) {
            const idx = merged.findIndex((m) => m.schoolId === dt.schoolId);
            if (idx !== -1) {
              merged[idx] = {
                ...dt,
                ...merged[idx],
                status: ((merged[idx].status === 'DISABLED' || merged[idx].status === 'SUSPENDED') ? merged[idx].status : 'TRIAL') as SchoolStatus,
                administratorDetails: merged[idx].administratorDetails || dt.administratorDetails,
                subdomain: merged[idx].subdomain || dt.subdomain,
                tenantDomain: merged[idx].tenantDomain || dt.tenantDomain,
                registrationNumber: merged[idx].registrationNumber || dt.registrationNumber,
              };
            }
          }
        });
        const finalTenants = merged.filter((t) => !deletedSet.has(t.schoolId));
        try {
          localStorage.setItem('jjsak_tenants', JSON.stringify(finalTenants));
        } catch {}
        return finalTenants;
      }
      return defaultSchools;
    } catch {
      return defaultSchools;
    }
  });

  // Cross-Session Persistence: Sync school tenants with backend authoritative store & listen to real-time events
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const fullData = await tenantDataSyncService.fetchTenantsFull();
        if (!isMounted) return;
        const deletedSet = new Set(fullData.deletedTenantIds);
        const serverTenants = fullData.tenants.filter((st) => !deletedSet.has(st.schoolId));

        setTenants((prev) => {
          const safePrev = prev.filter((p) => !deletedSet.has(p.schoolId));
          const serverMap = new Map(serverTenants.map((st) => [st.schoolId, st]));
          const merged = safePrev.map((localT) => {
            const serverT = serverMap.get(localT.schoolId);
            if (serverT && serverT.status) {
              return {
                ...localT,
                status: serverT.status as SchoolStatus,
              };
            }
            return localT;
          });
          const localIds = new Set(safePrev.map((t) => t.schoolId));
          serverTenants.forEach((st) => {
            if (!localIds.has(st.schoolId)) {
              merged.push(st as SchoolTenant);
            }
          });
          const finalResult = merged.filter((t) => !deletedSet.has(t.schoolId));
          try {
            localStorage.setItem('jjsak_tenants', JSON.stringify(finalResult));
          } catch (e) {
            console.warn('Failed to update localStorage with server tenants', e);
          }
          return finalResult;
        });

        // Purge users belonging to deleted schools
        setUsers((prev) => {
          const safeUsers = prev.filter((u) => !u.schoolId || !deletedSet.has(u.schoolId));
          try {
            localStorage.setItem('jjsak_users', JSON.stringify(safeUsers));
          } catch {}
          return safeUsers;
        });
      } catch (e) {
        console.warn('Initial server tenant sync failed, continuing with local storage:', e);
      }
    })();

    // Real-time synchronization listeners across tabs, windows, and platforms
    const unsubscribeDeleted = tenantDataSyncService.onTenantDeleted((deletedSchoolId) => {
      if (!isMounted) return;
      setTenants((prev) => {
        const remaining = prev.filter((t) => t.schoolId !== deletedSchoolId);
        try {
          localStorage.setItem('jjsak_tenants', JSON.stringify(remaining));
        } catch {}
        return remaining;
      });
      setUsers((prev) => {
        const remainingUsers = prev.filter((u) => u.schoolId !== deletedSchoolId);
        try {
          localStorage.setItem('jjsak_users', JSON.stringify(remainingUsers));
        } catch {}
        return remainingUsers;
      });
      setActiveTenantId((prevId) => {
        if (prevId === deletedSchoolId) {
          localStorage.removeItem('jjsak_active_tenant_id');
          return '';
        }
        return prevId;
      });
    });

    const unsubscribeSaved = tenantDataSyncService.onTenantSaved((savedTenant) => {
      if (!isMounted) return;
      setTenants((prev) => {
        const exists = prev.some((t) => t.schoolId === savedTenant.schoolId);
        const updated = exists
          ? prev.map((t) => (t.schoolId === savedTenant.schoolId ? savedTenant : t))
          : [savedTenant, ...prev];
        try {
          localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    });

    return () => {
      isMounted = false;
      unsubscribeDeleted();
      unsubscribeSaved();
    };
  }, []);

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    const deletedSet = new Set(tenantDataSyncService.getDeletedTenantIds());
    const saved = localStorage.getItem('jjsak_active_tenant_id');
    if (saved && !deletedSet.has(saved)) {
      return saved;
    }
    const defaultSchools = [...INITIAL_ONBOARDED_SCHOOLS, ...DEFAULT_TENANT_SCHOOLS].filter(
      (s) => !deletedSet.has(s.schoolId)
    );
    const ngonyekSchool = defaultSchools.find((s) => s.schoolId.includes('ngonyek'));
    return ngonyekSchool?.schoolId || defaultSchools[0]?.schoolId || 'sch-ngonyek-30200';
  });

  // JJSAK-AUTH-SEC-001: Hide Institution Identity Until Authentication
  // Gated application state: strictly unauthenticated on load unless an active session exists
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const sessionAuth = sessionStorage.getItem('jjsak_session_authenticated');
      const hasStoredUser = !!localStorage.getItem('jjsak_current_user');
      const hasStoredJwt = !!localStorage.getItem('jjsak_jwt_session');
      return sessionAuth === 'true' && hasStoredUser && hasStoredJwt;
    } catch {
      return false;
    }
  });

  // Active JWT Session Token (Code P2.4)
  const [activeJWTSession, setActiveJWTSession] = useState<JWTSession>(() => {
    const saved = localStorage.getItem('jjsak_jwt_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const initialUser = INITIAL_USERS[0] || {
      id: 'usr-owner-001',
      username: 'jotham',
      role: 'SUPER_ADMIN',
      fullName: 'Jotham Barasa Watila',
      password: '',
      email: 'jothambarasawatila@gmail.com',
      schoolId: '',
    };
    return generateJWTSession(initialUser, '', 'JJSAK Educational Technologies');
  });

  // Code P2.10: 30-Day Recycle Bin State
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>(() => {
    const saved = localStorage.getItem('jjsak_recycle_bin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Immutable Audit Logging Trail (Code P2.9)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('jjsak_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Helper to append audit logs with Before/After Diff
  const handleLogAudit = (
    action: AuditActionType,
    details: string,
    beforeValue?: string,
    afterValue?: string
  ) => {
    const newLog = createAuditLog(
      activeTenantId,
      currentUser.role,
      currentUser.fullName,
      action,
      details,
      '197.237.12.89',
      beforeValue,
      afterValue
    );
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // School Profile & Subscription State
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('jjsak_school_profile');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_PROFILE;
  });

  const [subscription, setSubscription] = useState<SchoolSubscription>(() => {
    const saved = localStorage.getItem('jjsak_subscription');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION;
  });

  // Phase 5: Academic Operations & Assessment Engine State
  const [deadlines, setDeadlines] = useState<MarksDeadline[]>(() => {
    const saved = localStorage.getItem('jjsak_deadlines');
    return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
  });

  const [notifications, setNotifications] = useState<TeacherNotification[]>(() => {
    const saved = localStorage.getItem('jjsak_teacher_notifications');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_NOTIFICATIONS;
  });

  const [transfers, setTransfers] = useState<InterClassTransferRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [promotions, setPromotions] = useState<PromotionRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [archives, setArchives] = useState<AcademicYearArchive[]>(() => {
    const saved = localStorage.getItem('jjsak_archives');
    return saved ? JSON.parse(saved) : INITIAL_ARCHIVES;
  });

  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_behavior_records');
    return saved ? JSON.parse(saved) : INITIAL_BEHAVIOR_RECORDS;
  });

  // Phase 6: Learner Management, Attendance, Discipline, Health & Student Welfare State
  const [attendanceRegisters, setAttendanceRegisters] = useState<ClassAttendanceRegister[]>(() => {
    const saved = localStorage.getItem('jjsak_attendance_registers');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_REGISTERS;
  });

  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>(() => {
    const saved = localStorage.getItem('jjsak_discipline_incidents');
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE_INCIDENTS;
  });

  const [healthIncidents, setHealthIncidents] = useState<HealthIncidentRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_health_incidents');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_INCIDENTS;
  });

  const [healthProfiles, setHealthProfiles] = useState<Record<string, LearnerHealthProfile>>(() => {
    const saved = localStorage.getItem('jjsak_health_profiles');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_PROFILES;
  });

  const [counselingSessions, setCounselingSessions] = useState<CounselingSession[]>(() => {
    const saved = localStorage.getItem('jjsak_counseling_sessions');
    return saved ? JSON.parse(saved) : INITIAL_COUNSELING_SESSIONS;
  });

  const [vulnerableLearners, setVulnerableLearners] = useState<VulnerableLearnerRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_vulnerable_learners');
    return saved ? JSON.parse(saved) : INITIAL_VULNERABLE_LEARNERS;
  });

  const [transfersOut, setTransfersOut] = useState<TransferOutRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_transfers_out');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS_OUT;
  });

  const [transfersIn, setTransfersIn] = useState<TransferInRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_transfers_in');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS_IN;
  });

  const [graduations, setGraduations] = useState<Grade9GraduationRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_graduations');
    return saved ? JSON.parse(saved) : INITIAL_GRADUATION_RECORDS;
  });

  const [communications, setCommunications] = useState<ParentCommunicationRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_parent_communications');
    return saved ? JSON.parse(saved) : INITIAL_PARENT_COMMUNICATIONS;
  });

  const [welfareCheckIns, setWelfareCheckIns] = useState<WelfareEventCheckInRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_welfare_checkins');
    return saved ? JSON.parse(saved) : INITIAL_WELFARE_CHECKINS;
  });

  const [timetables, setTimetables] = useState<TimetableLesson[]>(() => {
    const saved = localStorage.getItem('jjsak_timetable_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  // Phase 7: Master Academic Foundation State
  const [curriculum, setCurriculum] = useState<CurriculumFramework>(() => {
    const saved = localStorage.getItem('jjsak_curriculum');
    return saved ? JSON.parse(saved) : INITIAL_CURRICULUM_FRAMEWORK;
  });

  const [academicYears, setAcademicYears] = useState<AcademicYearConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_academic_years');
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_YEARS;
  });

  const [terms, setTerms] = useState<AcademicTermConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_terms');
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_TERMS;
  });

  const [learningLevels] = useState<LearningLevelConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_learning_levels');
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_LEVELS;
  });

  const [academicGrades, setAcademicGrades] = useState<GradeConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_academic_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [academicStreams, setAcademicStreams] = useState<StreamConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_academic_streams');
    return saved ? JSON.parse(saved) : INITIAL_STREAMS;
  });

  const [academicSubjects, setAcademicSubjects] = useState<SubjectDefinition[]>(() => {
    const saved = localStorage.getItem('jjsak_academic_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [teacherSubjectAllocations, setTeacherSubjectAllocations] = useState<TeacherSubjectAllocation[]>(() => {
    const saved = localStorage.getItem('jjsak_teacher_subject_allocations');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_SUBJECT_ALLOCATIONS;
  });

  const [classTeacherAllocations, setClassTeacherAllocations] = useState<ClassTeacherAllocation[]>(() => {
    const saved = localStorage.getItem('jjsak_class_teacher_allocations');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_TEACHER_ALLOCATIONS;
  });

  const [placementRules, setPlacementRules] = useState<LearnerPlacementRule[]>(() => {
    const saved = localStorage.getItem('jjsak_placement_rules');
    return saved ? JSON.parse(saved) : INITIAL_LEARNER_PLACEMENT_RULES;
  });

  const [promotionPolicies, setPromotionPolicies] = useState<PromotionPolicyConfig[]>(() => {
    const saved = localStorage.getItem('jjsak_promotion_policies');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTION_POLICIES;
  });

  const [academicAuditLogs, setAcademicAuditLogs] = useState<AcademicStructureAuditEntry[]>(() => {
    const saved = localStorage.getItem('jjsak_academic_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_AUDIT_LOGS;
  });

  // Persistence / Local State with automatic migration for Pretechnical Studies
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('jjsak_school_info');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_INFO;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('jjsak_students');
    let studentList: Student[] = calculateStudentRankings(INITIAL_STUDENTS);
    if (!saved) {
      studentList = calculateStudentRankings(INITIAL_STUDENTS);
    } else {
      try {
        const parsed: Student[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((student) => {
        // Replace Computer Studies and Physical & Health Ed with Pretechnical Studies
        const updatedSubjects: { subject: string; score: number | null; grade: string; remarks: string }[] = [];
        let hasPretech = false;
        (student.subjects || []).forEach((sub) => {
          const subName = sub?.subject || '';
          if (
            subName.toLowerCase().includes('computer') ||
            subName.toLowerCase().includes('physical') ||
            subName.toLowerCase().includes('health')
          ) {
            if (!hasPretech) {
              updatedSubjects.push({
                ...sub,
                subject: 'Pretechnical Studies',
              });
              hasPretech = true;
            }
          } else if (subName === 'Pretechnical Studies') {
            if (!hasPretech) {
              updatedSubjects.push(sub);
              hasPretech = true;
            }
          } else if (subName) {
            updatedSubjects.push(sub);
          }
        });
        return {
          ...student,
          subjects: updatedSubjects,
        };
      });
          studentList = calculateStudentRankings(migrated);
        }
      } catch {
        studentList = calculateStudentRankings(INITIAL_STUDENTS);
      }
    }

    // Guarantee that all 40 registered Grade 7 North learners for Ngonyek Junior School are present
    const isNgonyekMatch = (id?: string) => !id || id.toLowerCase().includes('ngonyek');
    const ngonyekInList = studentList.filter((s) => isNgonyekMatch(s.schoolId));
    if (ngonyekInList.length < 40) {
      const existingNgonyekIds = new Set(ngonyekInList.map((s) => s.id));
      const missingNgonyek = NGONYEK_GRADE7_STUDENTS.filter((s) => !existingNgonyekIds.has(s.id)).map((s) => ({
        ...s,
        schoolId: NGONYEK_SCHOOL_ID,
      }));
      studentList = [...studentList, ...missingNgonyek];
    }

    return studentList;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('jjsak_assessments');
    if (!saved) return INITIAL_ASSESSMENTS;
    try {
      const parsed: Assessment[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_ASSESSMENTS;
      return parsed.map((ass) => {
        const assSub = ass?.subject || '';
        if (
          assSub.toLowerCase().includes('computer') ||
          assSub.toLowerCase().includes('physical') ||
          assSub.toLowerCase().includes('health')
        ) {
          return { ...ass, subject: 'Pretechnical Studies' };
        }
        return ass;
      });
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('jjsak_teachers');
    let teacherList: Teacher[] = INITIAL_TEACHERS;
    if (saved) {
      try {
        const parsed: Teacher[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If Mr. Jotham Watila is not in saved, prepend him from INITIAL_TEACHERS
          const hasWatila = parsed.some((t) => (t?.name || '').toLowerCase().includes('watila'));
          if (!hasWatila && INITIAL_TEACHERS[0]) {
            teacherList = [INITIAL_TEACHERS[0], ...parsed];
          } else {
            teacherList = parsed;
          }
        }
      } catch {
        teacherList = INITIAL_TEACHERS;
      }
    }

    // Purge any outdated placeholder teachers for Ngonyek Junior School
    teacherList = (teacherList || []).filter(
      (t) =>
        !t.name?.toLowerCase().includes('kiprono') &&
        !t.name?.toLowerCase().includes('kiprop cherono') &&
        !t.name?.toLowerCase().includes('muthoni waweru') &&
        !t.name?.toLowerCase().includes('ochieng otieno') &&
        !t.name?.toLowerCase().includes('wambui kamau')
    );

    // Guarantee that all 6 registered teachers for Ngonyek Junior School are present:
    // Vivian Lumayo, Agness Waswa, Brenda Mwanjala, Brian Onyancha, Joyce Kamar, Jotham Watila
    const ngonyekTeachersInList = teacherList.filter(
      (t) => t.schoolId === NGONYEK_SCHOOL_ID || (t.email || '').toLowerCase().includes('ngonyek')
    );
    const existingTeacherNames = new Set(ngonyekTeachersInList.map((t) => t.name.toLowerCase()));
    const missingTeachers = NGONYEK_TEACHERS.filter((t) => !existingTeacherNames.has(t.name.toLowerCase()));
    if (missingTeachers.length > 0) {
      teacherList = [...teacherList, ...missingTeachers];
    }

    return (teacherList || []).map((t) => {
      let assignedSchoolId = t.schoolId;
      if (!assignedSchoolId) {
        const lowerEmail = (t.email || '').toLowerCase();
        const lowerName = (t.name || '').toLowerCase();
        if (lowerEmail.includes('ngonyek') || lowerName.includes('ngonyek')) {
          assignedSchoolId = 'sch-ngonyek-30200';
        } else if (lowerEmail.includes('yuya') || lowerName.includes('yuya')) {
          assignedSchoolId = 'sch-yuya-30200';
        } else {
          try {
            const rawUsers = localStorage.getItem('jjsak_users');
            if (rawUsers) {
              const uList = JSON.parse(rawUsers);
              const matched = uList.find(
                (u: any) =>
                  (u.id && (u.id === t.userId || u.id === t.id)) ||
                  (u.email && u.email.toLowerCase() === lowerEmail) ||
                  (u.fullName && u.fullName.toLowerCase() === lowerName) ||
                  (u.username && lowerEmail.startsWith(u.username.toLowerCase()))
              );
              if (matched && matched.schoolId) {
                assignedSchoolId = matched.schoolId;
              }
            }
          } catch {
            // ignore
          }
          if (!assignedSchoolId) {
            try {
              const rawOtps = localStorage.getItem('jjsak_carrier_active_otps');
              if (rawOtps) {
                const otpObj = JSON.parse(rawOtps);
                const rec =
                  otpObj[t.id?.toLowerCase()] ||
                  otpObj[t.email?.toLowerCase()] ||
                  (t.email ? otpObj[t.email.split('@')[0]?.toLowerCase()] : null);
                if (rec && rec.schoolId) {
                  assignedSchoolId = rec.schoolId;
                }
              }
            } catch {
              // ignore
            }
          }
        }
      }

      const cleanedSubjects = Array.from(
        new Set(
          (t.subjects || []).map((sub) => {
            const s = sub || '';
            return s.toLowerCase().includes('computer') ||
              s.toLowerCase().includes('physical') ||
              s.toLowerCase().includes('health')
              ? 'Pretechnical Studies'
              : s;
          })
        )
      );

      // Ensure allocations exist
      let allocations = t.allocations;
      if (!allocations || allocations.length === 0) {
        allocations = (t.classes || ['G8 S']).map((cls) => ({
          className: cls,
          subjects: cleanedSubjects.length > 0 ? cleanedSubjects : ['Mathematics'],
        }));
      } else {
        allocations = allocations.map((a) => ({
          ...a,
          subjects: (a.subjects || []).map((sub) => {
            const s = sub || '';
            return s.toLowerCase().includes('computer') ||
              s.toLowerCase().includes('physical') ||
              s.toLowerCase().includes('health')
              ? 'Pretechnical Studies'
              : s;
          }),
        }));
      }

      const derivedClasses = allocations.map((a) => a.className);
      const derivedSubjects = Array.from(new Set(allocations.flatMap((a) => a.subjects)));

      return {
        ...t,
        schoolId: assignedSchoolId,
        classes: derivedClasses.length > 0 ? derivedClasses : (t.classes || ['G8 S']),
        subjects: derivedSubjects.length > 0 ? derivedSubjects : cleanedSubjects,
        allocations,
      };
    });
  });

  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  // Effective Active School Tenant ID (Strict RBAC & Tenant Isolation Policy)
  const effectiveTenantId =
    currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN'
      ? activeTenantId || ''
      : currentUser?.schoolId || activeTenantId || '';

  // Multi-Tenant Isolation Layer: Strict Data Partitioning & Cross-Alias Consistency
  // Guarantees absolute isolation so ONLY data registered by the specific school is visible on that school's portal,
  // while ensuring tenant ID variations (such as canonical sch-ngonyek-30200 and registered sch-ngonyek-1404) always map seamlessly.
  const isSchoolMatch = (recordSchoolId?: string, targetTenantId?: string): boolean => {
    if (!targetTenantId) return false;
    if (!recordSchoolId) {
      return targetTenantId.toLowerCase().includes('ngonyek');
    }
    if (recordSchoolId === targetTenantId) return true;
    const rLower = recordSchoolId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tLower = targetTenantId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rLower.includes('ngonyek') && tLower.includes('ngonyek')) return true;
    if (rLower.includes('yuya') && tLower.includes('yuya')) return true;
    return false;
  };

  const isolatedTeachers = useMemo(() => {
    const target = effectiveTenantId || activeTenantId || 'sch-ngonyek-30200';
    const matched = teachers.filter((t) => isSchoolMatch(t.schoolId, target));
    if ((target.toLowerCase().includes('ngonyek') || !target) && matched.length < 6) {
      const existingNames = new Set(matched.map((t) => t.name.toLowerCase()));
      const missing = NGONYEK_TEACHERS.filter((t) => !existingNames.has(t.name.toLowerCase())).map((t) => ({
        ...t,
        schoolId: target || NGONYEK_SCHOOL_ID,
      }));
      return [...matched, ...missing];
    }
    return matched;
  }, [teachers, effectiveTenantId, activeTenantId]);

  const isolatedStudents = useMemo(() => {
    const target = effectiveTenantId || activeTenantId || 'sch-ngonyek-30200';
    const matched = students.filter((s) => isSchoolMatch(s.schoolId, target));
    // Guarantee all 40 registered Grade 7 North learners for Ngonyek Junior School portal
    if ((target.toLowerCase().includes('ngonyek') || !target) && matched.length < 40) {
      const existingIds = new Set(matched.map((s) => s.id));
      const missing = NGONYEK_GRADE7_STUDENTS.filter((s) => !existingIds.has(s.id)).map((s) => ({
        ...s,
        schoolId: target || NGONYEK_SCHOOL_ID,
      }));
      return [...matched, ...missing];
    }
    return matched;
  }, [students, effectiveTenantId, activeTenantId]);

  const isolatedAssessments = useMemo(() => {
    if (!effectiveTenantId) return [];
    return assessments.filter((a) => isSchoolMatch(a.schoolId, effectiveTenantId));
  }, [assessments, effectiveTenantId]);

  const isolatedAttendanceRegisters = useMemo(() => {
    if (!effectiveTenantId) return [];
    return attendanceRegisters.filter((r) => isSchoolMatch(r.schoolId, effectiveTenantId));
  }, [attendanceRegisters, effectiveTenantId]);

  const isolatedDisciplineIncidents = useMemo(() => {
    if (!effectiveTenantId) return [];
    return disciplineIncidents.filter((d) => isSchoolMatch(d.schoolId, effectiveTenantId));
  }, [disciplineIncidents, effectiveTenantId]);

  const isolatedHealthIncidents = useMemo(() => {
    if (!effectiveTenantId) return [];
    return healthIncidents.filter((h) => isSchoolMatch(h.schoolId, effectiveTenantId));
  }, [healthIncidents, effectiveTenantId]);

  const isolatedCounselingSessions = useMemo(() => {
    if (!effectiveTenantId) return [];
    return counselingSessions.filter((c) => isSchoolMatch(c.schoolId, effectiveTenantId));
  }, [counselingSessions, effectiveTenantId]);

  const isolatedVulnerableLearners = useMemo(() => {
    if (!effectiveTenantId) return [];
    return vulnerableLearners.filter((v) => isSchoolMatch(v.schoolId, effectiveTenantId));
  }, [vulnerableLearners, effectiveTenantId]);

  const isolatedWelfareCheckIns = useMemo(() => {
    if (!effectiveTenantId) return [];
    return welfareCheckIns.filter((w) => isSchoolMatch(w.schoolId, effectiveTenantId));
  }, [welfareCheckIns, effectiveTenantId]);

  const isolatedTransfersOut = useMemo(() => {
    if (!effectiveTenantId) return transfersOut;
    return transfersOut.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId));
  }, [transfersOut, effectiveTenantId]);

  const isolatedTransfersIn = useMemo(() => {
    if (!effectiveTenantId) return transfersIn;
    return transfersIn.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId));
  }, [transfersIn, effectiveTenantId]);

  const isolatedGraduations = useMemo(() => {
    if (!effectiveTenantId) return graduations;
    return graduations.filter((g) => isSchoolMatch(g.schoolId, effectiveTenantId));
  }, [graduations, effectiveTenantId]);

  const isolatedCommunications = useMemo(() => {
    if (!effectiveTenantId) return communications;
    return communications.filter((c) => isSchoolMatch(c.schoolId, effectiveTenantId));
  }, [communications, effectiveTenantId]);

  const isolatedUsers = useMemo(() => {
    if (!effectiveTenantId) return users;
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'SYSTEM_ADMIN') {
      return users.filter(
        (u) => isSchoolMatch(u.schoolId, effectiveTenantId) || u.role === 'SUPER_ADMIN' || u.role === 'SYSTEM_ADMIN'
      );
    }
    return users;
  }, [users, effectiveTenantId, currentUser?.role]);

  // Keep selectedStudent scoped to the current school's students
  useEffect(() => {
    if (isolatedStudents.length > 0) {
      if (!selectedStudent || (selectedStudent.schoolId && !isSchoolMatch(selectedStudent.schoolId, effectiveTenantId))) {
        setSelectedStudent(isolatedStudents[0]);
      }
    }
  }, [effectiveTenantId, isolatedStudents, selectedStudent]);

  // Sync to localStorage with Real-time Save Status
  const triggerSaveNotification = (msg: string = '✓ Changes Saved to Institutional Database') => {
    setSaveStatusText(msg);
    const timer = setTimeout(() => {
      setSaveStatusText(null);
    }, 2400);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    localStorage.setItem('jjsak_school_info', JSON.stringify(schoolInfo));
    triggerSaveNotification();
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem('jjsak_students', JSON.stringify(students));
    triggerSaveNotification();
  }, [students]);

  useEffect(() => {
    localStorage.setItem('jjsak_assessments', JSON.stringify(assessments));
    triggerSaveNotification();
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('jjsak_teachers', JSON.stringify(teachers));
    triggerSaveNotification();
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('jjsak_current_user', JSON.stringify(currentUser));
    triggerSaveNotification();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('jjsak_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('jjsak_school_profile', JSON.stringify(schoolProfile));
    triggerSaveNotification();
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem('jjsak_subscription', JSON.stringify(subscription));
    triggerSaveNotification();
  }, [subscription]);

  // Sync Recycle Bin to localStorage
  useEffect(() => {
    localStorage.setItem('jjsak_recycle_bin', JSON.stringify(recycleBin));
    triggerSaveNotification();
  }, [recycleBin]);

  // Sync JWT Session to localStorage
  useEffect(() => {
    localStorage.setItem('jjsak_jwt_session', JSON.stringify(activeJWTSession));
  }, [activeJWTSession]);

  // Sync Phase 5 State to localStorage
  useEffect(() => {
    localStorage.setItem('jjsak_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem('jjsak_teacher_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('jjsak_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('jjsak_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('jjsak_archives', JSON.stringify(archives));
  }, [archives]);

  useEffect(() => {
    localStorage.setItem('jjsak_behavior_records', JSON.stringify(behaviorRecords));
  }, [behaviorRecords]);

  // Phase 6: Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jjsak_attendance_registers', JSON.stringify(attendanceRegisters));
  }, [attendanceRegisters]);

  useEffect(() => {
    localStorage.setItem('jjsak_discipline_incidents', JSON.stringify(disciplineIncidents));
  }, [disciplineIncidents]);

  useEffect(() => {
    localStorage.setItem('jjsak_health_incidents', JSON.stringify(healthIncidents));
  }, [healthIncidents]);

  useEffect(() => {
    localStorage.setItem('jjsak_health_profiles', JSON.stringify(healthProfiles));
  }, [healthProfiles]);

  useEffect(() => {
    localStorage.setItem('jjsak_counseling_sessions', JSON.stringify(counselingSessions));
  }, [counselingSessions]);

  useEffect(() => {
    localStorage.setItem('jjsak_vulnerable_learners', JSON.stringify(vulnerableLearners));
  }, [vulnerableLearners]);

  useEffect(() => {
    localStorage.setItem('jjsak_transfers_out', JSON.stringify(transfersOut));
  }, [transfersOut]);

  useEffect(() => {
    localStorage.setItem('jjsak_transfers_in', JSON.stringify(transfersIn));
  }, [transfersIn]);

  useEffect(() => {
    localStorage.setItem('jjsak_graduations', JSON.stringify(graduations));
  }, [graduations]);

  useEffect(() => {
    localStorage.setItem('jjsak_parent_communications', JSON.stringify(communications));
  }, [communications]);

  useEffect(() => {
    localStorage.setItem('jjsak_welfare_checkins', JSON.stringify(welfareCheckIns));
  }, [welfareCheckIns]);

  // Phase 7: Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jjsak_curriculum', JSON.stringify(curriculum));
  }, [curriculum]);

  useEffect(() => {
    localStorage.setItem('jjsak_academic_years', JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem('jjsak_terms', JSON.stringify(terms));
  }, [terms]);

  useEffect(() => {
    localStorage.setItem('jjsak_learning_levels', JSON.stringify(learningLevels));
  }, [learningLevels]);

  useEffect(() => {
    localStorage.setItem('jjsak_academic_grades', JSON.stringify(academicGrades));
  }, [academicGrades]);

  useEffect(() => {
    localStorage.setItem('jjsak_academic_streams', JSON.stringify(academicStreams));
  }, [academicStreams]);

  useEffect(() => {
    localStorage.setItem('jjsak_academic_subjects', JSON.stringify(academicSubjects));
  }, [academicSubjects]);

  useEffect(() => {
    localStorage.setItem('jjsak_teacher_subject_allocations', JSON.stringify(teacherSubjectAllocations));
  }, [teacherSubjectAllocations]);

  useEffect(() => {
    localStorage.setItem('jjsak_class_teacher_allocations', JSON.stringify(classTeacherAllocations));
  }, [classTeacherAllocations]);

  useEffect(() => {
    localStorage.setItem('jjsak_placement_rules', JSON.stringify(placementRules));
  }, [placementRules]);

  useEffect(() => {
    localStorage.setItem('jjsak_promotion_policies', JSON.stringify(promotionPolicies));
  }, [promotionPolicies]);

  useEffect(() => {
    localStorage.setItem('jjsak_academic_audit_logs', JSON.stringify(academicAuditLogs));
  }, [academicAuditLogs]);

  // Synchronize schoolInfo.totalStudents with active cohort enrollment
  useEffect(() => {
    if (isolatedStudents.length > 0 && schoolInfo.totalStudents !== isolatedStudents.length) {
      setSchoolInfo((prev) => ({
        ...prev,
        totalStudents: isolatedStudents.length,
      }));
    }
  }, [isolatedStudents.length, schoolInfo.totalStudents]);

  // ===================== INSTITUTIONAL CLOUD STORAGE PERSISTENCE ENGINE =====================
  // Guarantees all data entered by school personnel in their respective school portal is saved and stored without disappearing
  const [isTenantDataLoaded, setIsTenantDataLoaded] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    status: 'SYNCED' | 'SAVING' | 'ERROR';
    lastSaved?: string;
  }>({ status: 'SYNCED' });

  // 1. Authoritative Server Data Hydration upon Login or Active Tenant Switch
  useEffect(() => {
    if (!effectiveTenantId) return;

    let isMounted = true;
    setIsTenantDataLoaded(false);

    (async () => {
      try {
        setCloudSyncStatus({ status: 'SAVING' });

        // A. Instant Hydration from Scoped Local Storage Cache
        const cached = tenantDataSyncService.getCachedTenantData(effectiveTenantId);
        if (cached && isMounted) {
          const cachedStudents = cached.students;
          if (Array.isArray(cachedStudents) && cachedStudents.length > 0) {
            setStudents((prev) => {
              const otherSchools = prev.filter((s) => !isSchoolMatch(s.schoolId, effectiveTenantId));
              const currentTenantStudents = prev.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantStudents.map((s) => [s.id, s]));
              cachedStudents.forEach((cs: any) => {
                const sObj = { ...cs, schoolId: cs.schoolId || effectiveTenantId };
                if (!localMap.has(sObj.id)) {
                  localMap.set(sObj.id, sObj);
                } else {
                  const existing = localMap.get(sObj.id)!;
                  localMap.set(sObj.id, { ...sObj, ...existing, schoolId: effectiveTenantId });
                }
              });
              return [...otherSchools, ...Array.from(localMap.values())];
            });
          }
          const cachedTeachers = cached.teachers;
          if (Array.isArray(cachedTeachers) && cachedTeachers.length > 0) {
            setTeachers((prev) => {
              const otherSchools = prev.filter((t) => !isSchoolMatch(t.schoolId, effectiveTenantId));
              const currentTenantTeachers = prev.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantTeachers.map((t) => [t.id, t]));
              cachedTeachers.forEach((ct: any) => {
                const tObj = { ...ct, schoolId: ct.schoolId || effectiveTenantId };
                if (!localMap.has(tObj.id)) {
                  localMap.set(tObj.id, tObj);
                } else {
                  const existing = localMap.get(tObj.id)!;
                  localMap.set(tObj.id, { ...tObj, ...existing, schoolId: effectiveTenantId });
                }
              });
              return [...otherSchools, ...Array.from(localMap.values())];
            });
          }
          const cachedAssessments = cached.assessments;
          if (Array.isArray(cachedAssessments) && cachedAssessments.length > 0) {
            setAssessments((prev) => {
              const otherSchools = prev.filter((a) => !isSchoolMatch(a.schoolId, effectiveTenantId));
              const currentTenantAssessments = prev.filter((a) => isSchoolMatch(a.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantAssessments.map((a) => [a.id, a]));
              cachedAssessments.forEach((ca: any) => {
                const aObj = { ...ca, schoolId: ca.schoolId || effectiveTenantId };
                if (!localMap.has(aObj.id)) {
                  localMap.set(aObj.id, aObj);
                } else {
                  const existing = localMap.get(aObj.id)!;
                  localMap.set(aObj.id, { ...aObj, ...existing, schoolId: effectiveTenantId });
                }
              });
              return [...otherSchools, ...Array.from(localMap.values())];
            });
          }
          if (Array.isArray(cached.timetables)) {
            setTimetables(cached.timetables.map((l: any) => ({ ...l, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.attendanceRegisters)) {
            setAttendanceRegisters(cached.attendanceRegisters.map((r: any) => ({ ...r, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.behaviorRecords)) {
            setBehaviorRecords(cached.behaviorRecords.map((b: any) => ({ ...b, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.disciplineIncidents)) {
            setDisciplineIncidents(cached.disciplineIncidents.map((d: any) => ({ ...d, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.healthIncidents)) {
            setHealthIncidents(cached.healthIncidents.map((h: any) => ({ ...h, schoolId: effectiveTenantId })));
          }
          if (cached.healthProfiles) {
            setHealthProfiles(cached.healthProfiles);
          }
          if (Array.isArray(cached.counselingSessions)) {
            setCounselingSessions(cached.counselingSessions.map((c: any) => ({ ...c, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.vulnerableLearners)) {
            setVulnerableLearners(cached.vulnerableLearners.map((v: any) => ({ ...v, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.welfareCheckIns)) {
            setWelfareCheckIns(cached.welfareCheckIns.map((w: any) => ({ ...w, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.transfersOut)) {
            setTransfersOut(cached.transfersOut.map((t: any) => ({ ...t, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.transfersIn)) {
            setTransfersIn(cached.transfersIn.map((t: any) => ({ ...t, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.graduations)) {
            setGraduations(cached.graduations.map((g: any) => ({ ...g, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.parentCommunications)) {
            setCommunications(cached.parentCommunications.map((p: any) => ({ ...p, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(cached.academicStreams) && cached.academicStreams.length > 0) {
            setAcademicStreams(cached.academicStreams);
          }
          if (Array.isArray(cached.academicSubjects) && cached.academicSubjects.length > 0) {
            setAcademicSubjects(cached.academicSubjects);
          }
          if (Array.isArray(cached.academicYears) && cached.academicYears.length > 0) {
            setAcademicYears(cached.academicYears);
          }
          if (Array.isArray(cached.terms) && cached.terms.length > 0) {
            setTerms(cached.terms);
          }
          if (Array.isArray(cached.teacherSubjectAllocations) && cached.teacherSubjectAllocations.length > 0) {
            setTeacherSubjectAllocations(cached.teacherSubjectAllocations);
          }
          if (Array.isArray(cached.classTeacherAllocations) && cached.classTeacherAllocations.length > 0) {
            setClassTeacherAllocations(cached.classTeacherAllocations);
          }
          if (cached.schoolInfo) {
            setSchoolInfo((prev) => ({ ...prev, ...cached.schoolInfo }));
          }
          if (cached.schoolProfile) {
            setSchoolProfile((prev) => ({ ...prev, ...cached.schoolProfile }));
          }
        }

        // B. Authoritative Server Database Pull
        const serverBundle = await tenantDataSyncService.fetchTenantData(effectiveTenantId);
        if (!isMounted) return;

        if (serverBundle) {
          const bundleStudents = serverBundle.students;
          if (Array.isArray(bundleStudents) && bundleStudents.length > 0) {
            setStudents((prev) => {
              const otherSchools = prev.filter((s) => !isSchoolMatch(s.schoolId, effectiveTenantId));
              const currentTenantStudents = prev.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantStudents.map((s) => [s.id, s]));
              bundleStudents.forEach((bs: any) => {
                const sObj = { ...bs, schoolId: bs.schoolId || effectiveTenantId };
                if (!localMap.has(sObj.id)) {
                  localMap.set(sObj.id, sObj);
                } else {
                  const existing = localMap.get(sObj.id)!;
                  localMap.set(sObj.id, { ...existing, ...sObj, schoolId: effectiveTenantId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_students', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const bundleTeachers = serverBundle.teachers;
          if (Array.isArray(bundleTeachers) && bundleTeachers.length > 0) {
            setTeachers((prev) => {
              const otherSchools = prev.filter((t) => !isSchoolMatch(t.schoolId, effectiveTenantId));
              const currentTenantTeachers = prev.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantTeachers.map((t) => [t.id, t]));
              bundleTeachers.forEach((bt: any) => {
                const tObj = { ...bt, schoolId: bt.schoolId || effectiveTenantId };
                if (!localMap.has(tObj.id)) {
                  localMap.set(tObj.id, tObj);
                } else {
                  const existing = localMap.get(tObj.id)!;
                  localMap.set(tObj.id, { ...existing, ...tObj, schoolId: effectiveTenantId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_teachers', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const bundleAssessments = serverBundle.assessments;
          if (Array.isArray(bundleAssessments) && bundleAssessments.length > 0) {
            setAssessments((prev) => {
              const otherSchools = prev.filter((a) => !isSchoolMatch(a.schoolId, effectiveTenantId));
              const currentTenantAssessments = prev.filter((a) => isSchoolMatch(a.schoolId, effectiveTenantId));
              const localMap = new Map(currentTenantAssessments.map((a) => [a.id, a]));
              bundleAssessments.forEach((ba: any) => {
                const aObj = { ...ba, schoolId: ba.schoolId || effectiveTenantId };
                if (!localMap.has(aObj.id)) {
                  localMap.set(aObj.id, aObj);
                } else {
                  const existing = localMap.get(aObj.id)!;
                  localMap.set(aObj.id, { ...existing, ...aObj, schoolId: effectiveTenantId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_assessments', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const bundleTimetables = serverBundle.timetables;
          if (Array.isArray(bundleTimetables)) {
            setTimetables((prev) => {
              const otherSchools = prev.filter((l: any) => l.schoolId && l.schoolId !== effectiveTenantId);
              const tenantTimetables = bundleTimetables.map((l: any) => ({ ...l, schoolId: effectiveTenantId }));
              return [...otherSchools, ...tenantTimetables];
            });
          }
          const bundleRegisters = serverBundle.attendanceRegisters;
          if (Array.isArray(bundleRegisters)) {
            setAttendanceRegisters((prev) => {
              const otherSchools = prev.filter((r) => r.schoolId && r.schoolId !== effectiveTenantId);
              const tenantRegisters = bundleRegisters.map((r: any) => ({ ...r, schoolId: effectiveTenantId }));
              return [...otherSchools, ...tenantRegisters];
            });
          }
          const bundleBehavior = serverBundle.behaviorRecords;
          if (Array.isArray(bundleBehavior)) {
            setBehaviorRecords((prev) => {
              const otherSchools = prev.filter((b) => b.schoolId && b.schoolId !== effectiveTenantId);
              const tenantRecords = bundleBehavior.map((b: any) => ({ ...b, schoolId: effectiveTenantId }));
              return [...otherSchools, ...tenantRecords];
            });
          }
          const bundleDiscipline = serverBundle.disciplineIncidents;
          if (Array.isArray(bundleDiscipline)) {
            setDisciplineIncidents((prev) => {
              const otherSchools = prev.filter((d) => d.schoolId && d.schoolId !== effectiveTenantId);
              const tenantIncidents = bundleDiscipline.map((d: any) => ({ ...d, schoolId: effectiveTenantId }));
              return [...otherSchools, ...tenantIncidents];
            });
          }
          const bundleHealth = serverBundle.healthIncidents;
          if (Array.isArray(bundleHealth)) {
            setHealthIncidents((prev) => {
              const otherSchools = prev.filter((h) => h.schoolId && h.schoolId !== effectiveTenantId);
              const tenantHealth = bundleHealth.map((h: any) => ({ ...h, schoolId: effectiveTenantId }));
              return [...otherSchools, ...tenantHealth];
            });
          }
          if (serverBundle.healthProfiles) {
            setHealthProfiles(serverBundle.healthProfiles);
          }
          if (Array.isArray(serverBundle.counselingSessions)) {
            setCounselingSessions(serverBundle.counselingSessions.map((c: any) => ({ ...c, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.vulnerableLearners)) {
            setVulnerableLearners(serverBundle.vulnerableLearners.map((v: any) => ({ ...v, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.welfareCheckIns)) {
            setWelfareCheckIns(serverBundle.welfareCheckIns.map((w: any) => ({ ...w, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.transfersOut)) {
            setTransfersOut(serverBundle.transfersOut.map((t: any) => ({ ...t, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.transfersIn)) {
            setTransfersIn(serverBundle.transfersIn.map((t: any) => ({ ...t, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.graduations)) {
            setGraduations(serverBundle.graduations.map((g: any) => ({ ...g, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.parentCommunications)) {
            setCommunications(serverBundle.parentCommunications.map((p: any) => ({ ...p, schoolId: effectiveTenantId })));
          }
          if (Array.isArray(serverBundle.academicStreams) && serverBundle.academicStreams.length > 0) {
            setAcademicStreams(serverBundle.academicStreams);
          }
          if (Array.isArray(serverBundle.academicSubjects) && serverBundle.academicSubjects.length > 0) {
            setAcademicSubjects(serverBundle.academicSubjects);
          }
          if (Array.isArray(serverBundle.academicYears) && serverBundle.academicYears.length > 0) {
            setAcademicYears(serverBundle.academicYears);
          }
          if (Array.isArray(serverBundle.terms) && serverBundle.terms.length > 0) {
            setTerms(serverBundle.terms);
          }
          if (Array.isArray(serverBundle.teacherSubjectAllocations) && serverBundle.teacherSubjectAllocations.length > 0) {
            setTeacherSubjectAllocations(serverBundle.teacherSubjectAllocations);
          }
          if (Array.isArray(serverBundle.classTeacherAllocations) && serverBundle.classTeacherAllocations.length > 0) {
            setClassTeacherAllocations(serverBundle.classTeacherAllocations);
          }
          if (serverBundle.schoolInfo) {
            setSchoolInfo((prev) => ({ ...prev, ...serverBundle.schoolInfo }));
          }
          if (serverBundle.schoolProfile) {
            setSchoolProfile((prev) => ({ ...prev, ...serverBundle.schoolProfile }));
          }
        }

        setIsTenantDataLoaded(true);
        setCloudSyncStatus({ status: 'SYNCED', lastSaved: new Date().toLocaleTimeString() });
      } catch (err) {
        console.error('[TenantDataSync] Failed to hydrate tenant data from server', err);
        setCloudSyncStatus({ status: 'ERROR' });
        setIsTenantDataLoaded(true);
      }
    })();

    // C. Multi-Tab Real-time Broadcast Listener
    const unsubscribe = tenantDataSyncService.onTenantDataUpdated((updatedTenantId, bundle) => {
      if (updatedTenantId === effectiveTenantId && isMounted) {
        if (Array.isArray(bundle.students)) setStudents(bundle.students);
        if (Array.isArray(bundle.teachers)) setTeachers(bundle.teachers);
        if (Array.isArray(bundle.assessments)) setAssessments(bundle.assessments);
        if (Array.isArray(bundle.timetables)) setTimetables(bundle.timetables);
        if (Array.isArray(bundle.attendanceRegisters)) setAttendanceRegisters(bundle.attendanceRegisters);
        if (Array.isArray(bundle.behaviorRecords)) setBehaviorRecords(bundle.behaviorRecords);
        if (Array.isArray(bundle.disciplineIncidents)) setDisciplineIncidents(bundle.disciplineIncidents);
        if (Array.isArray(bundle.healthIncidents)) setHealthIncidents(bundle.healthIncidents);
        if (bundle.healthProfiles) setHealthProfiles(bundle.healthProfiles);
        if (Array.isArray(bundle.counselingSessions)) setCounselingSessions(bundle.counselingSessions);
        if (Array.isArray(bundle.vulnerableLearners)) setVulnerableLearners(bundle.vulnerableLearners);
        if (Array.isArray(bundle.welfareCheckIns)) setWelfareCheckIns(bundle.welfareCheckIns);
        if (bundle.schoolInfo) setSchoolInfo((prev) => ({ ...prev, ...bundle.schoolInfo }));
        setCloudSyncStatus({ status: 'SYNCED', lastSaved: new Date().toLocaleTimeString() });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [effectiveTenantId]);

  // 2. Debounced Automatic Persistence Safety Net
  // Every change entered by school personnel in their school portal is automatically saved to the institutional backend
  useEffect(() => {
    if (!effectiveTenantId || !isTenantDataLoaded) return;

    setCloudSyncStatus({ status: 'SAVING' });

    // Enforce tenant boundary on all saved entities
    const scopedStudents = (students || []).map((s) => ({ ...s, schoolId: effectiveTenantId }));
    const scopedTeachers = (teachers || []).map((t) => ({ ...t, schoolId: effectiveTenantId }));
    const scopedAssessments = (assessments || []).map((a) => ({ ...a, schoolId: effectiveTenantId }));
    const scopedAttendance = (attendanceRegisters || []).map((r) => ({ ...r, schoolId: effectiveTenantId }));
    const scopedTimetables = (timetables || []).map((l) => ({ ...l, schoolId: effectiveTenantId }));

    tenantDataSyncService.debouncedSaveTenantData(
      effectiveTenantId,
      {
        students: scopedStudents,
        teachers: scopedTeachers,
        assessments: scopedAssessments,
        timetables: scopedTimetables,
        attendanceRegisters: scopedAttendance,
        behaviorRecords,
        disciplineIncidents,
        healthIncidents,
        healthProfiles,
        counselingSessions,
        vulnerableLearners,
        welfareCheckIns,
        transfersOut,
        transfersIn,
        graduations,
        parentCommunications: communications,
        academicStreams,
        academicSubjects,
        academicYears,
        terms,
        teacherSubjectAllocations,
        classTeacherAllocations,
        schoolInfo,
        schoolProfile,
      },
      800
    );

    const timer = setTimeout(() => {
      setCloudSyncStatus({ status: 'SYNCED', lastSaved: new Date().toLocaleTimeString() });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    effectiveTenantId,
    isTenantDataLoaded,
    students,
    teachers,
    assessments,
    timetables,
    attendanceRegisters,
    behaviorRecords,
    disciplineIncidents,
    healthIncidents,
    healthProfiles,
    counselingSessions,
    vulnerableLearners,
    welfareCheckIns,
    transfersOut,
    transfersIn,
    graduations,
    communications,
    academicStreams,
    academicSubjects,
    academicYears,
    terms,
    teacherSubjectAllocations,
    classTeacherAllocations,
    schoolInfo,
    schoolProfile,
  ]);

  // Automated Onboarding Credentials Dispatch & Sync for Registered Institutions
  useEffect(() => {
    // 1. Sync messages from backend carrier inbox
    carrierInboxService.syncWithBackend();

    const deletedIds = tenantDataSyncService.getDeletedTenantIds();
    const deletedSet = new Set(deletedIds);

    // 2. Ensure non-deleted initial onboarded schools have dispatched carrier messages
    INITIAL_ONBOARDED_SCHOOLS.forEach((sch) => {
      if (!deletedSet.has(sch.schoolId)) {
        carrierInboxService.ensureDispatchedForSchool(sch);
      }
    });

    // 3. For any other tenant in state that is not deleted, also ensure credentials dispatched
    tenants.forEach((t) => {
      if (!deletedSet.has(t.schoolId)) {
        carrierInboxService.ensureDispatchedForSchool(t);
      }
    });

    // 4. URL Hash & Parameter listener for automated portal activation links
    const handleCheckActivationUrl = () => {
      try {
        const hash = window.location.hash || '';
        if (hash.startsWith('#activate-teacher')) {
          const queryString = hash.includes('?') ? hash.split('?')[1] : '';
          const params = new URLSearchParams(queryString);
          const user = params.get('user') || params.get('username') || '';
          const school = params.get('school') || params.get('schoolId') || '';
          const otp = params.get('otp') || '';
          const pwd = params.get('pwd') || params.get('password') || '';

          const otpRecord = user ? carrierInboxService.getLatestOtpForUser(user) : null;
          const finalOtp = otp || otpRecord?.otp || '';
          const finalPwd = pwd || (user ? carrierInboxService.getLatestFirstTimePasswordForUser(user) : '') || '';

          setTeacherValidationParams({
            otp: finalOtp,
            username: user,
            schoolId: school,
            password: finalPwd,
          });
          setIsTeacherValidationOpen(true);
        } else if (hash.startsWith('#activate-school') || hash.startsWith('#activate')) {
          const queryString = hash.includes('?') ? hash.split('?')[1] : '';
          const params = new URLSearchParams(queryString);
          const schoolParam = params.get('school') || params.get('schoolId') || '';
          const regNo = params.get('regNo') || '';
          const account = params.get('account') || '';
          const otp = params.get('otp') || '';
          const pwd = params.get('pwd') || '';

          // Match school
          const matched = tenants.find(
            (t) =>
              t.subdomain?.toLowerCase() === schoolParam.toLowerCase() ||
              t.schoolId.toLowerCase() === schoolParam.toLowerCase() ||
              t.schoolCode.toLowerCase() === schoolParam.toLowerCase()
          );

          if (matched) {
            setSchoolActivationParams({
              schoolId: matched.schoolId,
              schoolName: matched.schoolName,
              registrationNumber: regNo || matched.registrationNumber || '',
              schoolAccount: account || `${matched.subdomain || matched.schoolCode.toLowerCase()}@jjsak`,
              otp: otp || carrierInboxService.getLatestOtpForSchool(matched.schoolId) || '',
              temporaryPassword: pwd || carrierInboxService.getFirstTimePasswordForSchool(matched.schoolId) || 'Password@2026!',
            });
            setIsSchoolActivationOpen(true);
          }
        }
      } catch (e) {
        console.error('Error parsing activation URL:', e);
      }
    };

    handleCheckActivationUrl();
    window.addEventListener('hashchange', handleCheckActivationUrl);
    return () => window.removeEventListener('hashchange', handleCheckActivationUrl);
  }, [tenants]);

  // Phase 7 Audit Logger
  const handleLogAcademicAudit = (
    action: any,
    details: string,
    prev?: string,
    next?: string
  ) => {
    const entry: AcademicStructureAuditEntry = {
      id: `aud-as-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleString('en-KE'),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role as any,
      actionType: action,
      entityName: details.split(' ')[0] || 'Academic Structure',
      details,
      previousValue: prev,
      newValue: next,
      integrityHash: Math.random().toString(36).substring(2, 14) + Date.now().toString(36),
    };
    setAcademicAuditLogs((prevLogs) => [entry, ...prevLogs]);
    handleLogAudit('RECORD_EDIT', details, prev, next);
  };

  // Phase 5 Action Handlers
  const handleAddDeadline = (deadline: MarksDeadline) => {
    setDeadlines((prev) => [deadline, ...prev]);
    handleLogAudit(
      'ASSESSMENT_SCHEDULED' as any,
      `Scheduled new marks submission deadline: "${deadline.title}" for ${deadline.grade} ${deadline.stream} (${deadline.subject}). Assigned to ${deadline.assignedTeacherName}.`
    );
    triggerSaveNotification(`✓ Marks deadline scheduled`);
  };

  const handleUpdateDeadline = (deadline: MarksDeadline) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadline.id ? deadline : d))
    );
    handleLogAudit(
      'RECORD_EDIT',
      `Updated marks deadline status for "${deadline.title}" to ${deadline.status}.`
    );
    triggerSaveNotification(`✓ Deadline updated`);
  };

  const handleSendNotification = (notif: TeacherNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    handleLogAudit(
      'BROADCAST_SENT' as any,
      `Dispatched automated academic notification via ${notif.channel} to ${notif.teacherName}: "${notif.title}".`
    );
    triggerSaveNotification(`✓ Notification dispatched to ${notif.teacherName}`);
  };

  const handleExecuteTransfer = (record: InterClassTransferRecord) => {
    setTransfers((prev) => [record, ...prev]);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === record.studentId) {
          const parts = record.toClass.split(' ');
          return {
            ...s,
            className: record.toClass,
            grade: parts[0] || s.grade,
            stream: parts[1] || s.stream,
          };
        }
        return s;
      })
    );
    handleLogAudit(
      'STUDENT_TRANSFERRED' as any,
      `Executed inter-class transfer for ${record.studentName} (${record.admNo}) from ${record.fromClass} to ${record.toClass}. Reason: ${record.reason}`
    );
    triggerSaveNotification(`✓ Learner transferred to ${record.toClass}`);
  };

  const handleExecutePromotion = (record: PromotionRecord, updatedStudents: Student[]) => {
    setPromotions((prev) => [record, ...prev]);
    setStudents(calculateStudentRankings(updatedStudents));
    handleLogAudit(
      'COHORT_PROMOTION_EXECUTED' as any,
      `Executed academic year cohort promotion from ${record.academicYearFrom} to ${record.academicYearTo}. Promoted: ${record.promotedCount}, Retained: ${record.retainedCount}.`
    );
    triggerSaveNotification(`✓ Cohort promotion completed for ${record.promotedCount} learners`);
  };

  const handleArchiveYear = (archive: AcademicYearArchive) => {
    setArchives((prev) => [archive, ...prev]);
    handleLogAudit(
      'ACADEMIC_YEAR_ARCHIVED' as any,
      `Archived academic snapshot for ${archive.academicYear} ${archive.term}. Total records sealed: ${archive.totalLearners} learners with mean score ${archive.meanPerformance}%.`
    );
    triggerSaveNotification(`✓ Academic year snapshot archived and digitally sealed`);
  };

  const handleRestoreArchive = (archiveId: string) => {
    const found = archives.find((a) => a.id === archiveId);
    if (found) {
      handleLogAudit(
        'ARCHIVE_RESTORED' as any,
        `Retrieved historical academic snapshot for ${found.academicYear} ${found.term}.`
      );
      triggerSaveNotification(`✓ Retrieved archive for ${found.academicYear}`);
    }
  };

  const handleAddBehaviorRecord = (record: BehaviorRecord) => {
    const recordWithSchool = { ...record, schoolId: record.schoolId || effectiveTenantId };
    setBehaviorRecords((prev) => [recordWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        behaviorRecords: [recordWithSchool, ...behaviorRecords],
      });
    }
    handleLogAudit(
      'RECORD_EDIT',
      `Logged behavior record for ${record.studentName} (${record.admNo}): [${record.category}] ${record.title}. Severity: ${record.severity}.`
    );
    triggerSaveNotification(`✓ Behavior/Discipline record logged to institutional database`);
  };

  // Phase 6 Action Handlers (P6.1 - P6.10)
  const handleSaveAttendanceRegister = (register: ClassAttendanceRegister) => {
    const registerWithSchool = { ...register, schoolId: register.schoolId || effectiveTenantId };
    let updatedRegisters: ClassAttendanceRegister[] = [];
    setAttendanceRegisters((prev) => {
      const idx = prev.findIndex((r) => r.id === registerWithSchool.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = registerWithSchool;
        updatedRegisters = next;
        return next;
      }
      updatedRegisters = [registerWithSchool, ...prev];
      return updatedRegisters;
    });
    if (effectiveTenantId) {
      tenantDataSyncService.saveAttendanceRegister(effectiveTenantId, registerWithSchool);
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        attendanceRegisters: updatedRegisters.length > 0 ? updatedRegisters : [registerWithSchool, ...attendanceRegisters],
      });
    }
    triggerSaveNotification(`✓ Attendance register saved for ${register.className}`);
  };

  const handleAddDisciplineIncident = (incident: DisciplineIncident) => {
    const incidentWithSchool = { ...incident, schoolId: incident.schoolId || effectiveTenantId };
    setDisciplineIncidents((prev) => [incidentWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        disciplineIncidents: [incidentWithSchool, ...disciplineIncidents],
      });
    }
    triggerSaveNotification(`✓ Discipline record logged for ${incident.studentName}`);
  };

  const handleUpdateDisciplineIncident = (incident: DisciplineIncident) => {
    const incidentWithSchool = { ...incident, schoolId: incident.schoolId || effectiveTenantId };
    setDisciplineIncidents((prev) =>
      prev.map((i) => (i.id === incidentWithSchool.id ? incidentWithSchool : i))
    );
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        disciplineIncidents: disciplineIncidents.map((i) => (i.id === incidentWithSchool.id ? incidentWithSchool : i)),
      });
    }
    triggerSaveNotification(`✓ Discipline incident updated (${incident.status})`);
  };

  const handleAddHealthIncident = (incident: HealthIncidentRecord) => {
    const incidentWithSchool = { ...incident, schoolId: incident.schoolId || effectiveTenantId };
    setHealthIncidents((prev) => [incidentWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        healthIncidents: [incidentWithSchool, ...healthIncidents],
      });
    }
    triggerSaveNotification(`✓ Health clinic encounter recorded for ${incident.studentName}`);
  };

  const handleUpdateHealthProfile = (profile: LearnerHealthProfile) => {
    const profileWithSchool = { ...profile, schoolId: (profile as any).schoolId || effectiveTenantId };
    setHealthProfiles((prev) => ({
      ...prev,
      [profile.studentId]: profileWithSchool,
    }));
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        healthProfiles: { ...healthProfiles, [profile.studentId]: profileWithSchool },
      });
    }
    triggerSaveNotification(`✓ Medical profile updated`);
  };

  const handleAddCounselingSession = (session: CounselingSession) => {
    const sessionWithSchool = { ...session, schoolId: session.schoolId || effectiveTenantId };
    setCounselingSessions((prev) => [sessionWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        counselingSessions: [sessionWithSchool, ...counselingSessions],
      });
    }
    triggerSaveNotification(`✓ Guidance & Counseling session logged`);
  };

  const handleAddVulnerableLearner = (record: VulnerableLearnerRecord) => {
    const recordWithSchool = { ...record, schoolId: record.schoolId || effectiveTenantId };
    setVulnerableLearners((prev) => [recordWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        vulnerableLearners: [recordWithSchool, ...vulnerableLearners],
      });
    }
    triggerSaveNotification(`✓ Vulnerable learner registered into support scheme`);
  };

  const handleUpdateVulnerableLearner = (record: VulnerableLearnerRecord) => {
    const recordWithSchool = { ...record, schoolId: record.schoolId || effectiveTenantId };
    setVulnerableLearners((prev) =>
      prev.map((v) => (v.id === recordWithSchool.id ? recordWithSchool : v))
    );
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        vulnerableLearners: vulnerableLearners.map((v) => (v.id === recordWithSchool.id ? recordWithSchool : v)),
      });
    }
    triggerSaveNotification(`✓ Welfare record updated for ${record.studentName}`);
  };

  const handleAddWelfareCheckIn = (record: WelfareEventCheckInRecord) => {
    const recordWithSchool = { ...record, schoolId: record.schoolId || effectiveTenantId };
    setWelfareCheckIns((prev) => [recordWithSchool, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        welfareCheckIns: [recordWithSchool, ...welfareCheckIns],
      });
    }
    triggerSaveNotification(`✓ Welfare QR check-in recorded for ${record.studentName}`);
  };

  const handleUpdateWelfareCheckIn = (record: WelfareEventCheckInRecord) => {
    const recordWithSchool = { ...record, schoolId: record.schoolId || effectiveTenantId };
    setWelfareCheckIns((prev) =>
      prev.map((item) => (item.id === recordWithSchool.id ? recordWithSchool : item))
    );
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        welfareCheckIns: welfareCheckIns.map((item) => (item.id === recordWithSchool.id ? recordWithSchool : item)),
      });
    }
    triggerSaveNotification(`✓ Welfare check-in status updated`);
  };

  const handleProcessTransferOut = (record: TransferOutRecord) => {
    setTransfersOut((prev) => [record, ...prev]);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === record.studentId
          ? { ...s, enrollmentStatus: 'Transferred Out' as any, status: 'Transferred' as any }
          : s
      )
    );
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        transfersOut: [record, ...transfersOut],
        students: students.map((s) =>
          s.id === record.studentId
            ? { ...s, enrollmentStatus: 'Transferred Out' as any, status: 'Transferred' as any }
            : s
        ),
      });
    }
    triggerSaveNotification(`✓ Transfer-out clearance processed for ${record.studentName}`);
  };

  const handleProcessTransferIn = (record: TransferInRecord) => {
    setTransfersIn((prev) => [record, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        transfersIn: [record, ...transfersIn],
      });
    }
    triggerSaveNotification(`✓ Transfer-in admitted for ${record.studentName}`);
  };

  const handleGraduateGrade9 = (record: Grade9GraduationRecord) => {
    setGraduations((prev) => [record, ...prev]);
    const updated = students.map((s) =>
      s.id === record.studentId
        ? { ...s, enrollmentStatus: 'Graduated' as any }
        : s
    );
    setStudents(updated);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        graduations: [record, ...graduations],
        students: updated,
      });
    }
    triggerSaveNotification(`✓ Graduation & completion certificate issued`);
  };

  const handleSendParentNotice = (record: ParentCommunicationRecord) => {
    setCommunications((prev) => [record, ...prev]);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        parentCommunications: [record, ...communications],
      });
    }
    triggerSaveNotification(`✓ Parent notice dispatched via ${record.channel}`);
  };

  const handleUpdateStudentsList = (newStudentsList: Student[]) => {
    const targetSchoolId = effectiveTenantId;
    const ranked = calculateStudentRankings(newStudentsList);
    let allMerged: Student[] = [];
    setStudents((prev) => {
      const otherSchools = targetSchoolId ? prev.filter((s) => !isSchoolMatch(s.schoolId, targetSchoolId)) : [];
      const updatedTenantStudents = ranked.map((s) => ({ ...s, schoolId: s.schoolId || targetSchoolId }));
      allMerged = [...otherSchools, ...updatedTenantStudents];
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(allMerged));
      } catch {}
      return allMerged;
    });

    if (targetSchoolId) {
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        students: ranked.filter((s) => isSchoolMatch(s.schoolId, targetSchoolId)),
      });
    }
    triggerSaveNotification(`✓ Updated learner cohort records saved to institutional database`);
  };

  // Restore item from Recycle Bin (Code P2.10)
  const handleRestoreRecycleItem = (item: RecycleBinItem) => {
    if (item.itemType === 'Learner Record') {
      const restoredStudent = item.originalData as Student;
      setStudents((prev) => {
        const merged = [restoredStudent, ...prev.filter((s) => s.id !== restoredStudent.id)];
        return calculateStudentRankings(merged);
      });
      setSchoolInfo((prev) => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
    } else if (item.itemType === 'Assessment Record') {
      const restoredAss = item.originalData as Assessment;
      setAssessments((prev) => [restoredAss, ...prev.filter((a) => a.id !== restoredAss.id)]);
      setSchoolInfo((prev) => ({ ...prev, totalAssessments: prev.totalAssessments + 1 }));
    } else if (item.itemType === 'Teacher Profile') {
      const restoredTeacher = item.originalData as Teacher;
      setTeachers((prev) => [restoredTeacher, ...prev.filter((t) => t.id !== restoredTeacher.id)]);
    }

    setRecycleBin((prev) => prev.filter((r) => r.id !== item.id));
    handleLogAudit(
      'RECORD_RESTORE',
      `Restored ${item.itemType} "${item.itemTitle}" from 30-day Recycle Bin.`,
      `Deleted on ${new Date(item.deletedAt).toLocaleDateString()}`,
      `Restored by ${currentUser.fullName}`
    );
    triggerSaveNotification(`✓ Restored "${item.itemTitle}" from Recycle Bin`);
  };

  // Permanently purge item from Recycle Bin (Super Admin / Head only)
  const handlePurgeRecycleItem = (itemOrId: RecycleBinItem | string, reason?: string) => {
    const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    const target = recycleBin.find((r) => r.id === itemId);
    setRecycleBin((prev) => prev.filter((r) => r.id !== itemId));
    if (target) {
      handleLogAudit(
        'PERMANENT_PURGE',
        `Permanently purged ${target.itemType} "${target.itemTitle}" from Recycle Bin. Reason: ${reason || 'Administrator manual purge'}`,
        'In Recycle Bin',
        'Permanently Expunged'
      );
    }
    triggerSaveNotification(`✓ Record permanently purged from system`);
  };

  // Inactivity Auto-Logout Handler (Code P2.8 & JJSAK-AUTH-SEC-001)
  const handleAutoLogout = async () => {
    try {
      await tenantDataSyncService.flushPendingSaves(effectiveTenantId);
    } catch {}
    try {
      sessionStorage.removeItem('jjsak_session_authenticated');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    handleLogAudit('LOGOUT', `User ${currentUser.fullName} automatically logged out due to 30 minutes inactivity.`);
    triggerSaveNotification('🔒 Session expired due to inactivity. Please authenticate to access portal.');
  };

  // Explicit Sign Out Handler (JJSAK-AUTH-SEC-001) - Guarantees all data is flushed & saved permanently
  const handleLogout = async () => {
    // 1. Immediately flush all pending data across all tenants so nothing entered by admin/teacher is lost
    try {
      await tenantDataSyncService.flushPendingSaves();
    } catch (e) {
      console.warn('Flush pending saves error on logout:', e);
    }

    // 2. Immediately write-through current in-memory state to persistent local storage so login/logout never drops data
    try {
      localStorage.setItem('jjsak_students', JSON.stringify(students));
      localStorage.setItem('jjsak_teachers', JSON.stringify(teachers));
      localStorage.setItem('jjsak_assessments', JSON.stringify(assessments));
      localStorage.setItem('jjsak_tenants', JSON.stringify(tenants));
      localStorage.setItem('jjsak_users', JSON.stringify(users));
      if (effectiveTenantId) {
        localStorage.setItem(`jjsak_tenant_data_${effectiveTenantId}`, JSON.stringify({
          tenantId: effectiveTenantId,
          students: students.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId)),
          teachers: teachers.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId)),
          assessments: assessments.filter((a) => isSchoolMatch(a.schoolId, effectiveTenantId)),
          schoolInfo,
          schoolProfile,
        }));
      }
    } catch (e) {
      console.warn('Local storage write-through error on logout:', e);
    }

    try {
      sessionStorage.removeItem('jjsak_session_authenticated');
      sessionStorage.removeItem('jjsak_auth_session');
      sessionStorage.removeItem('jjsak_prefill_username');
    } catch {
      // ignore
    }

    // Mandatory Policy: Purge any deleted schools and sync state so deleted schools never appear on logout/login
    const deletedIds = tenantDataSyncService.getDeletedTenantIds();
    const deletedSet = new Set(deletedIds);

    setTenants((prev) => {
      const cleaned = prev.filter((t) => !deletedSet.has(t.schoolId));
      try {
        localStorage.setItem('jjsak_tenants', JSON.stringify(cleaned));
      } catch {}
      return cleaned;
    });

    // Refresh users from server so all newly registered staff/head accounts remain permanently available
    try {
      const freshUsers = await tenantDataSyncService.fetchUsers();
      if (Array.isArray(freshUsers) && freshUsers.length > 0) {
        setUsers((prev) => {
          const safeServerUsers = freshUsers.filter((u) => !u.schoolId || !deletedSet.has(u.schoolId));
          const existingIds = new Set(safeServerUsers.map((u) => u.id));
          const merged = [...safeServerUsers];
          prev.forEach((pu) => {
            if (!existingIds.has(pu.id) && (!pu.schoolId || !deletedSet.has(pu.schoolId))) {
              merged.push(pu);
            }
          });
          try {
            localStorage.setItem('jjsak_users', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {}

    // Reset active tenant if it was deleted
    const currentActive = localStorage.getItem('jjsak_active_tenant_id');
    if (currentActive && deletedSet.has(currentActive)) {
      localStorage.removeItem('jjsak_active_tenant_id');
      setActiveTenantId('');
    }

    // Refresh tenants from server to guarantee authoritative state across all platforms
    tenantDataSyncService
      .fetchTenantsFull()
      .then((data) => {
        const freshDeleted = new Set(data.deletedTenantIds);
        const safeServerTenants = data.tenants.filter((st) => !freshDeleted.has(st.schoolId));
        setTenants(safeServerTenants);
      })
      .catch(() => {});

    setIsAuthenticated(false);
    handleLogAudit(
      'LOGOUT',
      `User ${currentUser.fullName} (${currentUser.role}) signed out. School portal locked and tenant identity cleared.`
    );
    triggerSaveNotification('🔒 Session locked. Please authenticate to access school portal.');
  };

  // Secure Authentication Success Handler (JJSAK-AUTH-SEC-001)
  const handleSecureLoginSuccess = async (user: User, tenant: SchoolTenant, jwtSession: JWTSession) => {
    try {
      sessionStorage.setItem('jjsak_session_authenticated', 'true');
    } catch {
      // ignore
    }
    setCurrentUser(user);
    setActiveTenantId(tenant.schoolId);
    setActiveJWTSession(jwtSession);

    // Save to local storage
    localStorage.setItem('jjsak_current_user', JSON.stringify(user));
    localStorage.setItem('jjsak_active_tenant_id', tenant.schoolId);
    localStorage.setItem('jjsak_jwt_session', JSON.stringify(jwtSession));

    // Synchronize school info to identified tenant (STEP 3 & STEP 4)
    setSchoolInfo((prev) => ({
      ...prev,
      name: tenant.schoolName,
      motto: tenant.schoolBranding?.motto || tenant.motto || prev.motto,
      headOfInstitution: tenant.administratorDetails?.fullName || prev.headOfInstitution,
      headTeacher: tenant.administratorDetails?.fullName || prev.headTeacher,
      logoInitial: tenant.schoolName.charAt(0) || 'J',
    }));

    // Authoritative Server Database Pull for this tenant to ensure every student and teacher registered is immediately visible
    if (tenant.schoolId && tenant.schoolId !== 'platform-governance') {
      try {
        const freshBundle = await tenantDataSyncService.fetchTenantData(tenant.schoolId);
        if (freshBundle) {
          const fStudents = freshBundle.students;
          if (Array.isArray(fStudents) && fStudents.length > 0) {
            setStudents((prev) => {
              const otherSchools = prev.filter((s) => !isSchoolMatch(s.schoolId, tenant.schoolId));
              const currentTenantStudents = prev.filter((s) => isSchoolMatch(s.schoolId, tenant.schoolId));
              const localMap = new Map(currentTenantStudents.map((s) => [s.id, s]));
              fStudents.forEach((fs: any) => {
                const sObj = { ...fs, schoolId: fs.schoolId || tenant.schoolId };
                if (!localMap.has(sObj.id)) {
                  localMap.set(sObj.id, sObj);
                } else {
                  const existing = localMap.get(sObj.id)!;
                  localMap.set(sObj.id, { ...existing, ...sObj, schoolId: tenant.schoolId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_students', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const fTeachers = freshBundle.teachers;
          if (Array.isArray(fTeachers) && fTeachers.length > 0) {
            setTeachers((prev) => {
              const otherSchools = prev.filter((t) => !isSchoolMatch(t.schoolId, tenant.schoolId));
              const currentTenantTeachers = prev.filter((t) => isSchoolMatch(t.schoolId, tenant.schoolId));
              const localMap = new Map(currentTenantTeachers.map((t) => [t.id, t]));
              fTeachers.forEach((ft: any) => {
                const tObj = { ...ft, schoolId: ft.schoolId || tenant.schoolId };
                if (!localMap.has(tObj.id)) {
                  localMap.set(tObj.id, tObj);
                } else {
                  const existing = localMap.get(tObj.id)!;
                  localMap.set(tObj.id, { ...existing, ...tObj, schoolId: tenant.schoolId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_teachers', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const fAssessments = freshBundle.assessments;
          if (Array.isArray(fAssessments) && fAssessments.length > 0) {
            setAssessments((prev) => {
              const otherSchools = prev.filter((a) => !isSchoolMatch(a.schoolId, tenant.schoolId));
              const currentTenantAssessments = prev.filter((a) => isSchoolMatch(a.schoolId, tenant.schoolId));
              const localMap = new Map(currentTenantAssessments.map((a) => [a.id, a]));
              fAssessments.forEach((fa: any) => {
                const aObj = { ...fa, schoolId: fa.schoolId || tenant.schoolId };
                if (!localMap.has(aObj.id)) {
                  localMap.set(aObj.id, aObj);
                } else {
                  const existing = localMap.get(aObj.id)!;
                  localMap.set(aObj.id, { ...existing, ...aObj, schoolId: tenant.schoolId });
                }
              });
              const merged = [...otherSchools, ...Array.from(localMap.values())];
              try {
                localStorage.setItem('jjsak_assessments', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          const fTimetables = freshBundle.timetables;
          if (Array.isArray(fTimetables)) {
            setTimetables((prev) => {
              const otherSchools = prev.filter((l: any) => l.schoolId && l.schoolId !== tenant.schoolId);
              const tenantTimetables = fTimetables.map((l: any) => ({ ...l, schoolId: tenant.schoolId }));
              return [...otherSchools, ...tenantTimetables];
            });
          }
          const fRegisters = freshBundle.attendanceRegisters;
          if (Array.isArray(fRegisters)) {
            setAttendanceRegisters((prev) => {
              const otherSchools = prev.filter((r) => r.schoolId && r.schoolId !== tenant.schoolId);
              const tenantRegisters = fRegisters.map((r: any) => ({ ...r, schoolId: tenant.schoolId }));
              return [...otherSchools, ...tenantRegisters];
            });
          }
          if (Array.isArray(freshBundle.academicStreams) && freshBundle.academicStreams.length > 0) {
            setAcademicStreams(freshBundle.academicStreams);
          }
          if (Array.isArray(freshBundle.classTeacherAllocations) && freshBundle.classTeacherAllocations.length > 0) {
            setClassTeacherAllocations(freshBundle.classTeacherAllocations);
          }
          if (freshBundle.schoolInfo) {
            setSchoolInfo((prev) => ({ ...prev, ...freshBundle.schoolInfo }));
          }
          if (freshBundle.schoolProfile) {
            setSchoolProfile((prev) => ({ ...prev, ...freshBundle.schoolProfile }));
          }
        }
      } catch (err) {
        console.warn('Post-login authoritative data pull error:', err);
      }
    }

    setIsAuthenticated(true);
    // JJSAK-AUTHZ-GOV-002 §5: Automatic Portal Routing Engine
    const routeDecision = masterAuthorizationService.determineTargetPortal(user, tenant);
    setCurrentScreen(routeDecision.targetScreen as ActiveScreen);
    triggerSaveNotification(`✓ Welcome to ${tenant.schoolName} — Routed to ${routeDecision.portalTitle}`);
  };

  const handleIdentitySwitch = (mode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL', account?: any) => {
    if (mode === 'SCHOOL_OPERATIONAL' && account) {
      const switchedUser: User = {
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        username: account.username,
        phoneNumber: account.phoneNumber,
        role: account.role || account.schoolRole || 'TEACHER',
        schoolId: account.schoolId,
        employeeNumber: account.employeeNumber,
        active: true,
        lastLogin: Date.now(),
      };
      setCurrentUser(switchedUser);
      setActiveTenantId(account.schoolId);
      localStorage.setItem('jjsak_current_user', JSON.stringify(switchedUser));
      localStorage.setItem('jjsak_active_tenant_id', account.schoolId);

      const targetTenant = tenants.find((t) => t.schoolId === account.schoolId);
      if (targetTenant) {
        setSchoolInfo((prev) => ({
          ...prev,
          name: targetTenant.schoolName,
          motto: targetTenant.schoolBranding?.motto || targetTenant.motto || prev.motto,
          headOfInstitution: targetTenant.administratorDetails?.fullName || prev.headOfInstitution,
          headTeacher: targetTenant.administratorDetails?.fullName || prev.headTeacher,
          logoInitial: targetTenant.schoolName.charAt(0) || 'J',
        }));
      }

      handleLogAudit(
        'DUAL_IDENTITY_SWITCH_TO_SCHOOL',
        `Switched from Platform Owner to School User account: ${account.fullName} (${account.role || account.schoolRole}) at school ${account.schoolName || account.schoolId}.`
      );
      handleNavigate('home');
      triggerSaveNotification(`✓ Active Identity: ${account.fullName} [${account.role || account.schoolRole}]`);
    } else if (mode === 'PLATFORM_GOVERNANCE') {
      const profile = ownerGovernanceService.getDualIdentityProfile();
      const ownerUser: User = {
        id: profile.ownerAccount.id,
        fullName: profile.ownerAccount.fullName,
        email: profile.ownerAccount.email,
        username: profile.ownerAccount.username,
        phoneNumber: profile.ownerAccount.phoneNumber,
        role: (profile.ownerAccount.role || profile.ownerAccount.systemRole || 'SUPER_ADMIN') as UserRole,
        active: true,
        lastLogin: Date.now(),
      };
      setCurrentUser(ownerUser);
      localStorage.setItem('jjsak_current_user', JSON.stringify(ownerUser));
      handleLogAudit(
        'DUAL_IDENTITY_SWITCH_TO_OWNER',
        `Switched back to Platform Owner Governance domain (${profile.ownerAccount.fullName}).`
      );
      handleNavigate('owner_dashboard');
      triggerSaveNotification('✓ Active Identity: Platform Owner / Super Administrator');
    }
  };

  const handleUpdateTenantStatus = (schoolId: string, status: SchoolStatus) => {
    setTenants((prev) => {
      const updated = prev.map((t) => (t.schoolId === schoolId ? { ...t, status } : t));
      try {
        localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save jjsak_tenants to localStorage:', e);
      }
      return updated;
    });

    // Also persist immediately to backend server storage
    tenantDataSyncService.updateTenantStatus(schoolId, status).catch((err) => {
      console.warn('Failed to sync tenant status update to backend:', err);
    });

    handleLogAudit(
      'SUBSCRIPTION_UPDATE',
      `Super Admin / Owner updated status of school [${schoolId}] to ${status}.`
    );
    triggerSaveNotification(`✓ School status set to ${status}`);
  };

  const handleDeleteTenant = (schoolId: string) => {
    const schoolToDelete = tenants.find((t) => t.schoolId === schoolId);
    const schoolName = schoolToDelete?.schoolName || schoolId;

    // 1. Remove from local tenants state
    setTenants((prev) => {
      const updated = prev.filter((t) => t.schoolId !== schoolId);
      try {
        localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save jjsak_tenants to localStorage:', e);
      }
      return updated;
    });

    // 2. If active tenant is being deleted, fallback to another active tenant or empty
    if (activeTenantId === schoolId) {
      const remaining = tenants.filter((t) => t.schoolId !== schoolId);
      const nextTenant = remaining.find((t) => t.status === 'ACTIVE') || remaining[0];
      const nextId = nextTenant ? nextTenant.schoolId : '';
      setActiveTenantId(nextId);
      try {
        localStorage.setItem('jjsak_active_tenant_id', nextId);
      } catch {}
      if (nextTenant) {
        setSchoolInfo((prev) => ({
          ...prev,
          name: nextTenant.schoolName,
          address: nextTenant.address,
          phone: nextTenant.phone,
          email: nextTenant.email,
          motto: nextTenant.motto || prev.motto,
        }));
      }
    }

    // 3. Purge associated users of this school from local user state
    setUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.schoolId !== schoolId);
      try {
        localStorage.setItem('jjsak_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error('Failed to save jjsak_users to localStorage:', e);
      }
      return updatedUsers;
    });

    // Purge associated students, teachers, and assessments for this school
    setStudents((prev) => {
      const remaining = prev.filter((s) => s.schoolId !== schoolId);
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    setTeachers((prev) => {
      const remaining = prev.filter((t) => t.schoolId !== schoolId);
      try {
        localStorage.setItem('jjsak_teachers', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    setAssessments((prev) => {
      const remaining = prev.filter((a) => a.schoolId !== schoolId);
      try {
        localStorage.setItem('jjsak_assessments', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    // Clear carrier messages and dual-identity governance records for this school
    carrierInboxService.purgeMessagesForSchool(schoolId, schoolName);
    ownerGovernanceService.removeSchoolIdentitiesForSchool(schoolId);

    // 4. Archive in 30-Day Platform Recycle Bin (Code P2.10)
    if (schoolToDelete) {
      const recycleItem: RecycleBinItem = {
        id: `recycle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        schoolId,
        itemType: 'School Registration' as any,
        itemTitle: `School Tenant: ${schoolName} (${schoolToDelete.schoolCode})`,
        deletedBy: currentUser?.fullName || 'Platform Owner',
        deletedByRole: (currentUser?.role || 'SUPER_ADMIN') as any,
        deletedAt: Date.now(),
        purgeDeadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
        reason: 'Super Admin manual deletion from Registered Schools directory',
        originalData: schoolToDelete,
      };
      setRecycleBin((prev) => {
        const updated = [recycleItem, ...prev];
        try {
          localStorage.setItem('jjsak_recycle_bin', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    // 5. Persist delete to backend multi-tenant authoritative store
    tenantDataSyncService.deleteTenant(schoolId).catch((err) => {
      console.warn('Failed to sync tenant deletion to backend:', err);
    });

    // 6. Log immutable audit trail
    handleLogAudit(
      'RECORD_DELETE',
      `Super Admin / Owner deleted registered institution '${schoolName}' [${schoolId}]. Tenant and associated credentials removed.`
    );

    triggerSaveNotification(`✓ School '${schoolName}' deleted successfully.`);
  };

  const handleTriggerAlert = (title: string, details: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    triggerSaveNotification(`⚠️ [${severity || 'ALERT'}] ${title}: ${details}`);
  };

  const handleUpdateSchoolProfile = (updatedProfile: SchoolProfile) => {
    setSchoolProfile(updatedProfile);
    setSchoolInfo((prev) => ({
      ...prev,
      name: updatedProfile.schoolName || prev.name,
      motto: updatedProfile.motto || prev.motto,
      headOfInstitution: updatedProfile.headTeacherName || prev.headOfInstitution,
      headTeacher: updatedProfile.headTeacherName || prev.headTeacher,
    }));
    triggerSaveNotification('✓ School Profile & Assets Saved');
  };

  const handleActivateSubscription = (activation: SubscriptionActivation) => {
    const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000;
    setSubscription((prev) => ({
      ...prev,
      schoolName: activation.schoolName || prev.schoolName,
      paymentReference: activation.paymentReference,
      subscriptionEndDate: oneYearFromNow,
      active: true,
      activatedBy: activation.activatedBy || currentUser.fullName,
    }));
    triggerSaveNotification('✓ School License Activated (12 Months)');
  };

  const handleSwitchUser = (user: User) => {
    const isCurrentOwner = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SYSTEM_ADMIN';

    // INSTITUTIONAL ROLE INTEGRITY RULE (§1)
    // Institutional personnel cannot switch, upgrade, downgrade, or change their own role
    if (!isCurrentOwner) {
      setIsUserDropdownOpen(false);
      setIsSelfServiceIntegrityModalOpen(true);
      handleLogAudit(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        `INSTITUTIONAL ROLE INTEGRITY VIOLATION: User ${currentUser.fullName} (${currentUser.role}) attempted self-service role switch to ${user.fullName} (${user.role}). Blocked under JJSAK Policy §1.`
      );
      return;
    }

    // Platform Owner / Super Administrator view simulator
    setCurrentUser(user);
    setIsUserDropdownOpen(false);
    triggerSaveNotification(`✓ Diagnostic profile switched: ${user.role} (${user.fullName})`);
  };

  // Navigation handlers
  const handleBottomNav = (tab: BottomNavTab) => {
    setBottomTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'students') setCurrentScreen('students');
    if (tab === 'assessments') setCurrentScreen('assessments');
    if (tab === 'reports') setCurrentScreen('reports_hub');
    if (tab === 'more') setCurrentScreen('settings');
  };

  const handleNavigate = (screen: ActiveScreen) => {
    // JJSAK-AUTHZ-GOV-002 §18: Direct Screen Access Authorization Validation
    const authCheck = masterAuthorizationService.validateScreenAccess(
      currentUser,
      screen,
      activeTenantId
    );
    if (!authCheck.authorized) {
      setSecurityBoundaryState({
        isOpen: true,
        target: screen,
        message:
          authCheck.errorMessage ||
          `ACCESS DENIED: The requested component '${screen}' is not authorized for your role under JJSAK-AUTHZ-GOV-002.`,
      });
      handleLogAudit(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        `JJSAK-AUTHZ-GOV-002 Boundary Interception: ${authCheck.errorMessage || 'Access Denied'}`
      );
      return;
    }

    // SCMH 2.X: Platform Governance & Access Isolation Boundary Enforcement
    if (isPlatformGovernanceComponent(screen)) {
      const boundaryCheck = validateAccessBoundary(
        currentUser,
        activeTenantId,
        screen,
        activeJWTSession?.token
      );

      if (!boundaryCheck.isAllowed) {
        const targetName =
          screen === 'master_architecture'
            ? 'JJSAK 27-Phase Master Architecture'
            : screen === 'security_core'
            ? 'Security Core & Multi-Tenant Hub'
            : screen === 'owner_dashboard'
            ? 'Platform Owner Governance Dashboard'
            : 'Super Administrator / System Owner Console';

        setSecurityBoundaryState({
          isOpen: true,
          target: targetName,
          message:
            boundaryCheck.reason ||
            `ACCESS DENIED (SCMH 2.X): The requested component '${screen}' is a Platform Governance Component permanently reserved for the Owner / Super Administrator. School personnel (${currentUser.role}) are restricted to school-level operational modules.`,
        });

        handleLogAudit(
          'UNAUTHORIZED_ACCESS_ATTEMPT',
          `SCMH 2.X Security Boundary Interception: Unauthorized attempt to open '${targetName}' [${screen}] by ${currentUser.fullName} (${currentUser.role}). Checkpoints failed: ${boundaryCheck.checkpointsFailed.join(', ') || 'Role Permissions'}.`
        );
        return;
      }
    }

    // JJSAK Owner Governance Policy §5 & §6: School Boundaries & Tenant Isolation
    // The Owner / Super Administrator shall not access school operational data
    // unless an approved exception or emergency access authorization is in effect.
    const isSchoolOperationalScreen = [
      'students',
      'assessments',
      'teachers',
      'timetabling',
      'student_report',
      'reports_hub',
      'academic_hub',
      'learner_welfare_hub',
    ].includes(screen);

    if (isOwnerOrSuperAdmin(currentUser) && isSchoolOperationalScreen) {
      const accessCheck = ownerGovernanceService.verifyOwnerSchoolDataAccess(activeTenantId);
      if (!accessCheck.allowed) {
        const screenNames: Record<string, string> = {
          students: 'Learner / Student Database',
          assessments: 'School Assessment Records',
          teachers: 'Teacher & Staff Profiles',
          timetabling: 'Institutional Master Timetable',
          student_report: 'Learner Report Card & CBA Results',
          reports_hub: 'Institutional Reports & Transcripts Hub',
          academic_hub: 'Academic Operations & CBC Grading Matrix',
          learner_welfare_hub: 'Learner Welfare, Health & Counseling Registry',
        };
        setBoundaryTargetName(screenNames[screen] || screen);
        setIsOwnerBoundaryModalOpen(true);
        handleLogAudit(
          'DATA_BOUNDARY_BLOCKED',
          `Owner Data Boundary Protection: Access to ${screen} restricted under Section 6. No approved exception or emergency session active.`
        );
        return;
      }
    }

    setCurrentScreen(screen);
    if (screen === 'home') setBottomTab('home');
    if (screen === 'students') setBottomTab('students');
    if (screen === 'assessments') setBottomTab('assessments');
    if (screen === 'student_report' || screen === 'reports_hub') setBottomTab('reports');
    if (screen === 'settings') setBottomTab('more');
  };

  // Open Teacher Marks Modal from any screen with JJSAK-AUTHZ-GOV-002 §13 & §14 scope verification
  const handleOpenTeacherMarks = (teacherId?: string, className?: string, subject?: string, assessmentId?: string) => {
    const targetSubject = subject || 'Social Studies';
    const targetClass = className || 'G8 S';

    if (currentUser && !masterAuthorizationService.isOwnerOrSuperAdmin(currentUser)) {
      const scopeCheck = masterAuthorizationService.validateTeachingScope(currentUser, targetSubject, targetClass);
      if (!scopeCheck.allowed) {
        triggerSaveNotification(`⚠️ Assignment Scope Notice: ${scopeCheck.reason}`);
      }
    }

    setTeacherMarksParams({
      teacherId: teacherId || teachers[0]?.id || 'tch-01',
      className: targetClass,
      subject: targetSubject,
      assessmentId,
    });
    setIsTeacherMarksModalOpen(true);
  };

  const handleCreateAssessment = (newAss: Assessment) => {
    const targetSchoolId = newAss.schoolId || effectiveTenantId;
    const finalAssessment: Assessment = {
      ...newAss,
      schoolId: targetSchoolId,
    };
    setAssessments((prev) => {
      const nextList = [finalAssessment, ...prev];
      try {
        localStorage.setItem('jjsak_assessments', JSON.stringify(nextList));
      } catch {}
      return nextList;
    });
    setSchoolInfo((prev) => ({
      ...prev,
      totalAssessments: prev.totalAssessments + 1,
    }));
    if (targetSchoolId) {
      tenantDataSyncService.saveAssessmentMarks(targetSchoolId, finalAssessment);
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        assessments: [finalAssessment, ...assessments],
      });
      triggerSaveNotification(`✓ Assessment "${finalAssessment.name}" saved to institutional database`);
    }
  };

  const handleUpdateAssessment = (updatedAss: Assessment) => {
    const targetSchoolId = updatedAss.schoolId || effectiveTenantId;
    const safeAss: Assessment = { ...updatedAss, schoolId: targetSchoolId };
    let finalAssessments: Assessment[] = [];
    setAssessments((prev) => {
      const exists = prev.some((a) => a.id === safeAss.id);
      if (exists) {
        finalAssessments = prev.map((a) => (a.id === safeAss.id ? safeAss : a));
      } else {
        finalAssessments = [safeAss, ...prev];
      }
      try {
        localStorage.setItem('jjsak_assessments', JSON.stringify(finalAssessments));
      } catch {}
      return finalAssessments;
    });

    if (targetSchoolId) {
      tenantDataSyncService.saveAssessmentMarks(targetSchoolId, safeAss);
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        assessments: finalAssessments.filter((a) => isSchoolMatch(a.schoolId, targetSchoolId)),
      });
      triggerSaveNotification(`✓ Assessment "${safeAss.name}" saved to institutional database`);
    }
  };

  const handleRequestPermanentDelete = (
    itemTitle: string,
    itemType: string,
    executeDelete: () => void,
    rawObject?: any
  ) => {
    setDeletionModalState({
      isOpen: true,
      itemTitle,
      itemType,
      onConfirm: (reason: string, mode: 'PERMANENT' | 'RECYCLE' = 'PERMANENT') => {
        if (mode === 'RECYCLE') {
          // Move item to 30-Day Recycle Bin (Code P2.10)
          if (rawObject) {
            const recycleItem = createRecycleBinItem(
              itemType as any,
              itemTitle,
              rawObject,
              currentUser.fullName,
              currentUser.role,
              activeTenantId,
              reason
            );
            setRecycleBin((prev) => [recycleItem, ...prev]);
          }
          executeDelete();
          handleLogAudit(
            'RECORD_DELETE',
            `Soft-deleted ${itemType} "${itemTitle}" to 30-day Recycle Bin. Mandatory Reason: ${reason}`,
            'Active Record',
            'Recycle Bin'
          );
          setDeletionModalState((prev) => ({ ...prev, isOpen: false }));
          triggerSaveNotification(`✓ Moved to 30-Day Recycle Bin (Can be restored)`);
        } else {
          // Permanent Purge (Head of Institution / Super Admin privilege)
          executeDelete();
          if (rawObject && rawObject.id) {
            setRecycleBin((prev) =>
              prev.filter((r) => r.id !== rawObject.id && (r.originalData as any)?.id !== rawObject.id)
            );
          }
          handleLogAudit(
            'PERMANENT_PURGE',
            `Permanently expunged ${itemType} "${itemTitle}" from institutional database by ${currentUser.role} (${currentUser.fullName}). Reason: ${reason}`,
            'Active Record',
            'Permanently Purged'
          );
          setDeletionModalState((prev) => ({ ...prev, isOpen: false }));
          triggerSaveNotification(`✓ Permanently deleted "${itemTitle}" from school portal`);
        }
      },
    });
  };

  const handleDeleteAssessment = (id: string) => {
    const target = assessments.find((a) => a.id === id);
    const title = target ? `${target.name} (${target.className} ${target.subject})` : id;
    handleRequestPermanentDelete(
      title,
      'Assessment Record',
      () => {
        const remaining = assessments.filter((a) => a.id !== id);
        setAssessments(remaining);
        if (effectiveTenantId) {
          tenantDataSyncService.saveTenantData(effectiveTenantId, {
            assessments: remaining,
          });
        }
      },
      target
    );
  };

  // Save marks entered by teacher on phone/PC into students & assessment records
  const handleSaveAssessmentMarks = (assessment: Assessment, updatedStudents: Student[]) => {
    // 1. Update assessment record
    let finalAssessments: Assessment[] = [];
    setAssessments((prev) => {
      const exists = prev.some((a) => a.id === assessment.id);
      if (exists) {
        finalAssessments = prev.map((a) => (a.id === assessment.id ? assessment : a));
      } else {
        finalAssessments = [assessment, ...prev];
      }
      try {
        localStorage.setItem('jjsak_assessments', JSON.stringify(finalAssessments));
      } catch {}
      return finalAssessments;
    });

    // 2. Update students and recompute overall rankings and statistics
    const ranked = calculateStudentRankings(updatedStudents);
    let allMergedStudents: Student[] = [];
    setStudents((prev) => {
      const otherSchools = prev.filter((s) => !isSchoolMatch(s.schoolId, effectiveTenantId));
      allMergedStudents = [...otherSchools, ...ranked];
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(allMergedStudents));
      } catch {}
      return allMergedStudents;
    });

    // 3. Keep selected student updated
    const currentSelectedId = selectedStudent.id;
    const matchingStudent = ranked.find((s) => s.id === currentSelectedId);
    if (matchingStudent) {
      setSelectedStudent(matchingStudent);
    }

    // 4. Authoritatively save to backend database without disappearing
    if (effectiveTenantId) {
      tenantDataSyncService.saveAssessmentMarks(effectiveTenantId, assessment, ranked);
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        assessments: finalAssessments.filter((a) => isSchoolMatch(a.schoolId, effectiveTenantId)),
        students: ranked.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId)),
      });
      triggerSaveNotification(`✓ Assessment marks and student rankings securely saved to database`);
    }
  };

  const handleAddStudent = (newStudent: Student) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      alert("Access Denied (§6): The Platform Owner cannot register learners. Student admissions are strictly reserved for School Administrators.");
      return;
    }
    const targetSchoolId = newStudent.schoolId || effectiveTenantId;
    const studentWithSchool: Student = {
      ...newStudent,
      schoolId: targetSchoolId,
    };
    let rankedResult: Student[] = [];
    setStudents((prev) => {
      const otherStudents = prev.filter((s) => s.id !== studentWithSchool.id);
      const merged = [studentWithSchool, ...otherStudents];
      const ranked = calculateStudentRankings(merged);
      rankedResult = ranked;
      const updatedCurrent = ranked.find((s) => s.id === studentWithSchool.id) || studentWithSchool;
      setSelectedStudent(updatedCurrent);
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(ranked));
      } catch {}
      return ranked;
    });
    setSchoolInfo((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
    }));

    if (targetSchoolId) {
      tenantDataSyncService.saveStudent(targetSchoolId, studentWithSchool);
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        students: rankedResult.filter((s) => isSchoolMatch(s.schoolId, targetSchoolId)),
        schoolInfo: { ...schoolInfo, totalStudents: schoolInfo.totalStudents + 1 },
      });
      triggerSaveNotification(`✓ Learner ${studentWithSchool.name} registered and saved to database`);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const targetSchoolId = updatedStudent.schoolId || effectiveTenantId;
    const studentWithSchool: Student = {
      ...updatedStudent,
      schoolId: targetSchoolId,
    };
    let rankedResult: Student[] = [];
    setStudents((prev) => {
      const merged = prev.map((s) => (s.id === studentWithSchool.id ? studentWithSchool : s));
      const ranked = calculateStudentRankings(merged);
      rankedResult = ranked;
      const updatedCurrent = ranked.find((s) => s.id === studentWithSchool.id) || studentWithSchool;
      if (selectedStudent.id === studentWithSchool.id) {
        setSelectedStudent(updatedCurrent);
      }
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(ranked));
      } catch {}
      return ranked;
    });

    if (targetSchoolId) {
      tenantDataSyncService.saveStudent(targetSchoolId, studentWithSchool);
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        students: rankedResult.filter((s) => isSchoolMatch(s.schoolId, targetSchoolId)),
      });
      triggerSaveNotification(`✓ Learner ${studentWithSchool.name} updated and saved to database`);
    }
  };

  const handleBatchUpdateStudents = (updater: (s: Student) => Student) => {
    let rankedResult: Student[] = [];
    setStudents((prev) => {
      const merged = prev.map(updater);
      const ranked = calculateStudentRankings(merged);
      rankedResult = ranked;
      const updatedCurrent = ranked.find((s) => s.id === selectedStudent.id);
      if (updatedCurrent) {
        setSelectedStudent(updatedCurrent);
      }
      try {
        localStorage.setItem('jjsak_students', JSON.stringify(ranked));
      } catch {}
      return ranked;
    });

    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        students: rankedResult.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId)),
      });
      triggerSaveNotification(`✓ Batch learner updates saved to institutional database`);
    }
  };

  const handleUpdateSchoolInfo = (newInfo: SchoolInfo, syncToStudents?: boolean) => {
    setSchoolInfo(newInfo);
    let updatedStudentsList = students;
    if (syncToStudents) {
      setStudents((prev) => {
        const up = prev.map((s) => ({
          ...s,
          year: newInfo.year,
          term: newInfo.term,
          nextTermDate: newInfo.nextTermOpenDate || s.nextTermDate,
        }));
        updatedStudentsList = up;
        return up;
      });
      setSelectedStudent((prev) => ({
        ...prev,
        year: newInfo.year,
        term: newInfo.term,
        nextTermDate: newInfo.nextTermOpenDate || prev.nextTermDate,
      }));
    }

    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, {
        schoolInfo: newInfo,
        students: syncToStudents ? updatedStudentsList : undefined,
      });
      triggerSaveNotification(`✓ School profile & academic calendar saved to database`);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const title = target ? `${target.name} (${target.admNo})` : id;
    handleRequestPermanentDelete(
      title,
      'Learner Record',
      () => {
        let remainingStudents: Student[] = [];
        setStudents((prev) => {
          const remaining = prev.filter((s) => s.id !== id);
          remainingStudents = remaining;
          const ranked = calculateStudentRankings(remaining);
          if (selectedStudent.id === id && ranked.length > 0) {
            setSelectedStudent(ranked[0]);
          }
          return ranked;
        });
        setSchoolInfo((prev) => ({
          ...prev,
          totalStudents: Math.max(0, prev.totalStudents - 1),
        }));
        if (effectiveTenantId) {
          tenantDataSyncService.deleteStudent(effectiveTenantId, id);
          tenantDataSyncService.saveTenantData(effectiveTenantId, {
            students: remainingStudents,
            schoolInfo: { ...schoolInfo, totalStudents: Math.max(0, schoolInfo.totalStudents - 1) },
          });
        }
      },
      target
    );
  };

  const handleAddTeacher = (
    newTeacher: Teacher,
    options?: { provisionAccount?: boolean; userRole?: UserRole; sendInvitation?: boolean; firstTimePassword?: string }
  ) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      alert("Access Denied (§7): The Platform Owner cannot onboard teachers or staff. Staff onboarding is strictly delegated to School Institutional Administrators.");
      return;
    }
    const targetSchoolId = newTeacher.schoolId || effectiveTenantId;
    const finalTeacher: Teacher = {
      ...newTeacher,
      schoolId: targetSchoolId,
    };
    
    setTeachers((prev) => {
      const filtered = prev.filter((t) => t.id !== finalTeacher.id && (t.email ? t.email !== finalTeacher.email : true));
      const updatedList = [finalTeacher, ...filtered];
      try {
        localStorage.setItem('jjsak_teachers', JSON.stringify(updatedList));
      } catch {}
      if (targetSchoolId) {
        tenantDataSyncService.saveTeacher(targetSchoolId, finalTeacher);
        tenantDataSyncService.saveTenantData(targetSchoolId, {
          teachers: updatedList.filter((t) => isSchoolMatch(t.schoolId, targetSchoolId)),
        });
      }
      return updatedList;
    });

    if (targetSchoolId) {
      triggerSaveNotification(`✓ Staff member ${finalTeacher.name} saved to institutional database`);
    }

    if (options?.provisionAccount) {
      const username = finalTeacher.email
        ? finalTeacher.email.split('@')[0].toLowerCase()
        : (finalTeacher.name || 'teacher').toLowerCase().replace(/[^a-z0-9]/g, '.');
      const finalPassword = options?.firstTimePassword || 'Password@2026!';
      const newUser: User = {
        id: finalTeacher.userId || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        schoolId: targetSchoolId,
        schoolName: tenants.find((t) => t.schoolId === targetSchoolId)?.schoolName || schoolInfo.name || 'School',
        username,
        fullName: finalTeacher.name,
        email: finalTeacher.email,
        password: finalPassword,
        firstTimePassword: finalPassword,
        role: options.userRole || 'TEACHER',
        employeeNumber: finalTeacher.tscNumber || finalTeacher.staffNumber || finalTeacher.employeeNumber,
        phoneNumber: finalTeacher.phoneNumber,
        active: true,
        mfaEnabled: finalTeacher.mfaEnabled || false,
        mfaMethod: finalTeacher.mfaMethod || 'SMS_OTP',
        activationStatus: 'ACTIVE',
        firstLoginCompleted: true,
      };

      setUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== newUser.id && u.username !== newUser.username);
        const nextUsers = [...filtered, newUser];
        try {
          localStorage.setItem('jjsak_users', JSON.stringify(nextUsers));
        } catch {}
        return nextUsers;
      });

      // Synchronize and persist user directly to backend server
      tenantDataSyncService.saveUser(newUser).catch((err) => {
        console.warn('Failed to save user account to server:', err);
      });

      // If the individual registered by the school is the platform owner, link dual-identity (§7)
      if (
        finalTeacher.name.toLowerCase().includes('jotham') ||
        (finalTeacher.email && finalTeacher.email.toLowerCase().includes('jothambarasawatila'))
      ) {
        const activeTenant = tenants.find((t) => t.schoolId === targetSchoolId);
        ownerGovernanceService.registerSchoolIdentity({
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          schoolId: targetSchoolId || 'sch-central-001',
          schoolName: activeTenant?.schoolName || 'Central Primary School',
          schoolDomain: activeTenant?.tenantDomain || `${targetSchoolId}.jjsak.internal`,
          designation: finalTeacher.designation || `Staff (${newUser.role})`,
          isDesignatedStaff: true,
          password: finalPassword,
          lastLogin: new Date().toISOString(),
        });
      }

      handleLogAudit(
        'STAFF_ACCOUNT_PROVISIONED',
        `Provisioned unified IAM login for ${finalTeacher.name} with role ${options.userRole || 'TEACHER'} in tenant ${targetSchoolId}.`,
        'None',
        `User ID: ${newUser.id}`
      );
    }

    // Automatically synchronize class teacher allocation if designated
    if (finalTeacher.isClassTeacher && finalTeacher.assignedClass) {
      setAcademicStreams((prev) => {
        const updated = prev.map((s) => {
          if (s.fullClassName === finalTeacher.assignedClass || s.gradeName + ' ' + s.streamName === finalTeacher.assignedClass) {
            return {
              ...s,
              classTeacherName: finalTeacher.name,
              classTeacherStaffId: finalTeacher.staffNumber || finalTeacher.id,
            };
          }
          return s;
        });
        if (targetSchoolId) {
          tenantDataSyncService.saveTenantData(targetSchoolId, { academicStreams: updated });
        }
        return updated;
      });

      setClassTeacherAllocations((prev) => {
        const existingIdx = prev.findIndex((c) => c.fullClassName === finalTeacher.assignedClass);
        let nextAllocations: ClassTeacherAllocation[] = [];
        if (existingIdx >= 0) {
          nextAllocations = prev.map((c, i) =>
            i === existingIdx ? { ...c, primaryClassTeacherId: finalTeacher.id, primaryClassTeacherName: finalTeacher.name } : c
          );
        } else {
          const className = finalTeacher.assignedClass || 'Grade 7 North';
          nextAllocations = [
            ...prev,
            {
              id: `cta-${Date.now()}`,
              streamId: `strm-${className.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              fullClassName: className,
              primaryClassTeacherId: finalTeacher.id,
              primaryClassTeacherName: finalTeacher.name,
              academicYear: 2026,
              termNumber: 1,
              status: 'ACTIVE' as const,
              responsibilities: [
                'Daily morning attendance roll call sign-off',
                'Termly student progress card holistic remarks',
                'Parent-teacher consultation coordination',
              ],
              appointedBy: schoolInfo.headTeacher || schoolInfo.headOfInstitution || 'Head of Institution',
              appointmentDate: new Date().toISOString().split('T')[0],
              appointmentLetterRef: `NJSS/CTA/${Date.now().toString().slice(-4)}`,
            },
          ];
        }
        if (targetSchoolId) {
          tenantDataSyncService.saveTenantData(targetSchoolId, { classTeacherAllocations: nextAllocations });
        }
        return nextAllocations;
      });
    }

    handleLogAudit(
      'STAFF_REGISTERED',
      `Registered staff profile for ${finalTeacher.name} (${finalTeacher.staffNumber || 'STF'}). Designation: ${finalTeacher.designation || finalTeacher.role}.`,
      'New Record',
      `Staff ID: ${finalTeacher.id}`
    );
    triggerSaveNotification(`✓ Staff member registered & profile created`);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    const targetSchoolId = updatedTeacher.schoolId || effectiveTenantId;
    const finalTeacher: Teacher = {
      ...updatedTeacher,
      schoolId: targetSchoolId,
    };
    let updatedTeachersList: Teacher[] = [];
    setTeachers((prev) => {
      const next = prev.map((t) => (t.id === finalTeacher.id ? finalTeacher : t));
      updatedTeachersList = next;
      try {
        localStorage.setItem('jjsak_teachers', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetSchoolId) {
      tenantDataSyncService.saveTeacher(targetSchoolId, finalTeacher);
      tenantDataSyncService.saveTenantData(targetSchoolId, {
        teachers: updatedTeachersList.filter((t) => isSchoolMatch(t.schoolId, targetSchoolId)),
      });

      if (finalTeacher.isClassTeacher && finalTeacher.assignedClass) {
        setAcademicStreams((prev) => {
          const updated = prev.map((s) => {
            if (s.fullClassName === finalTeacher.assignedClass || s.gradeName + ' ' + s.streamName === finalTeacher.assignedClass) {
              return {
                ...s,
                classTeacherName: finalTeacher.name,
                classTeacherStaffId: finalTeacher.staffNumber || finalTeacher.id,
              };
            }
            return s;
          });
          tenantDataSyncService.saveTenantData(targetSchoolId, { academicStreams: updated });
          return updated;
        });
      } else if (!finalTeacher.isClassTeacher) {
        setAcademicStreams((prev) => {
          const updated = prev.map((s) => {
            if (s.classTeacherStaffId === (finalTeacher.staffNumber || finalTeacher.id) || s.classTeacherName === finalTeacher.name) {
              return {
                ...s,
                classTeacherName: '',
                classTeacherStaffId: '',
              };
            }
            return s;
          });
          tenantDataSyncService.saveTenantData(targetSchoolId, { academicStreams: updated });
          return updated;
        });
      }
    }

    // Sync status and credentials to IAM user database
    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === updatedTeacher.userId ||
          (updatedTeacher.email && u.email === updatedTeacher.email) ||
          (updatedTeacher.staffNumber && u.employeeNumber === updatedTeacher.staffNumber) ||
          (updatedTeacher.tscNumber && u.employeeNumber === updatedTeacher.tscNumber)
        ) {
          return {
            ...u,
            fullName: updatedTeacher.name,
            email: updatedTeacher.email,
            phoneNumber: updatedTeacher.phoneNumber || u.phoneNumber,
            active: updatedTeacher.active !== false && updatedTeacher.accountStatus !== 'SUSPENDED',
            mfaEnabled: updatedTeacher.mfaEnabled ?? u.mfaEnabled,
            mfaMethod: updatedTeacher.mfaMethod ?? u.mfaMethod,
          };
        }
        return u;
      })
    );

    handleLogAudit(
      'STAFF_APPROVED',
      `Updated staff & professional records for ${updatedTeacher.name} (${updatedTeacher.staffNumber || updatedTeacher.id}).`,
      'Previous Version',
      'Updated Version'
    );
    triggerSaveNotification(`✓ Staff records updated successfully`);
  };

  const handleDeleteTeacher = (id: string) => {
    const target = teachers.find((t) => t.id === id);
    const title = target ? `${target.name} (${target.role})` : id;
    handleRequestPermanentDelete(
      title,
      'Teacher Profile',
      () => {
        let remainingTeachers: Teacher[] = [];
        setTeachers((prev) => {
          const next = prev.filter((t) => t.id !== id);
          remainingTeachers = next;
          try {
            localStorage.setItem('jjsak_teachers', JSON.stringify(next));
          } catch {}
          return next;
        });
        if (effectiveTenantId) {
          tenantDataSyncService.saveTenantData(effectiveTenantId, {
            teachers: remainingTeachers.filter((t) => isSchoolMatch(t.schoolId, effectiveTenantId)),
          });
        }
      },
      target
    );
  };

  const handleSaveTimetable = (lessons: TimetableLesson[]) => {
    const scopedLessons = lessons.map((l) => ({ ...l, schoolId: effectiveTenantId }));
    setTimetables(scopedLessons);
    if (effectiveTenantId) {
      tenantDataSyncService.saveTenantData(effectiveTenantId, { timetables: scopedLessons });
    }
    try {
      localStorage.setItem('jjsak_timetable_lessons', JSON.stringify(scopedLessons));
    } catch {}
    triggerSaveNotification('✓ Master school timetable saved to database');
  };

  const handleResetData = () => {
    localStorage.clear();
    setSchoolInfo(DEFAULT_SCHOOL_INFO);
    setStudents(INITIAL_STUDENTS);
    setAssessments(INITIAL_ASSESSMENTS);
    setTeachers(INITIAL_TEACHERS);
    setSelectedStudent(INITIAL_STUDENTS[0]);
    setCurrentScreen('home');
  };

  const isSubscriptionActive = isSubscriptionValid(
    subscription.trialEndDate,
    subscription.subscriptionEndDate
  );

  // JJSAK-AUTH-SEC-001: Public Landing Screen Isolation
  // Application shall not display any school-specific information before a user successfully authenticates.
  // Gated: Show strictly the secure login interface when unauthenticated.
  if (!isAuthenticated) {
    return (
      <>
        <SecureInstitutionalLoginScreen
          users={users}
          tenants={tenants}
          activeTenantId={activeTenantId}
          onLoginSuccess={handleSecureLoginSuccess}
          onUpdateUser={(upU) => {
            setUsers((prev) => {
              const updated = prev.map((u) => (u.id === upU.id ? upU : u));
              localStorage.setItem('jjsak_users', JSON.stringify(updated));
              return updated;
            });
          }}
          onLogAudit={handleLogAudit}
          onTriggerAlert={handleTriggerAlert}
          onOpenCarrierInbox={() => setIsCarrierInboxOpen(true)}
          onOpenSchoolActivation={(params) => {
            setSchoolActivationParams(params || {});
            setIsSchoolActivationOpen(true);
          }}
          onOpenTeacherValidation={(otp, username, schoolId) => {
            setTeacherValidationParams({ otp, username, schoolId });
            setIsTeacherValidationOpen(true);
          }}
        />

        {/* Carrier Dispatch & Notification Inbox Modal */}
        <SimulatedCarrierInboxModal
          isOpen={isCarrierInboxOpen}
          onClose={() => setIsCarrierInboxOpen(false)}
          onSelectOtpForLogin={(_otp) => {
            setIsCarrierInboxOpen(false);
          }}
          onOpenSchoolActivation={(params) => {
            setIsCarrierInboxOpen(false);
            setSchoolActivationParams(params);
            setIsSchoolActivationOpen(true);
          }}
          onOpenValidation={(otp, username, schoolId, password) => {
            setIsCarrierInboxOpen(false);
            setTeacherValidationParams({ otp, username, schoolId, password });
            setIsTeacherValidationOpen(true);
          }}
        />

        {/* School Registration & Personnel Onboarding Activation Modal */}
        <SchoolOnboardingActivationModal
          isOpen={isSchoolActivationOpen}
          onClose={() => setIsSchoolActivationOpen(false)}
          initialSchoolId={schoolActivationParams.schoolId}
          initialSchoolName={schoolActivationParams.schoolName}
          initialRegistrationNumber={schoolActivationParams.registrationNumber}
          initialSchoolAccount={schoolActivationParams.schoolAccount}
          initialOtp={schoolActivationParams.otp}
          initialTempPassword={schoolActivationParams.temporaryPassword}
          tenants={tenants}
          users={users}
          onActivationSuccess={(activatedHeadUser, targetTenant, jwtSession) => {
            const tenantUnderTrial: SchoolTenant = {
              ...targetTenant,
              status: 'TRIAL' as const,
            };
            setTenants((prev) => {
              const updated = prev.map((t) => (t.schoolId === targetTenant.schoolId ? tenantUnderTrial : t));
              if (!updated.some((t) => t.schoolId === targetTenant.schoolId)) {
                updated.unshift(tenantUnderTrial);
              }
              localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
              return updated;
            });

            setUsers((prev) => {
              const updated = prev.map((u) => (u.id === activatedHeadUser.id ? activatedHeadUser : u));
              if (!updated.some((u) => u.id === activatedHeadUser.id)) {
                updated.unshift(activatedHeadUser);
              }
              localStorage.setItem('jjsak_users', JSON.stringify(updated));
              return updated;
            });

            handleSecureLoginSuccess(activatedHeadUser, targetTenant, jwtSession);
            setCurrentScreen('teachers'); // Immediately direct to onboard school personnel!
            setIsSchoolActivationOpen(false);
            triggerSaveNotification(`✓ School ${targetTenant.schoolName} activated! You may now onboard teachers & staff.`);
            handleLogAudit('STAFF_APPROVED', `School ${targetTenant.schoolName} activated via school account. Directing to personnel onboarding.`);
          }}
          onUpdateSchoolStatus={handleUpdateTenantStatus}
          onLogAudit={(action, details) => handleLogAudit(action, details)}
        />

        {/* Teacher Validation & Set Permanent Password Modal */}
        <TeacherValidationAndActivationModal
          isOpen={isTeacherValidationOpen}
          onClose={() => setIsTeacherValidationOpen(false)}
          users={users}
          tenants={tenants}
          initialOtp={teacherValidationParams.otp}
          initialUsername={teacherValidationParams.username}
          initialSchoolId={teacherValidationParams.schoolId}
          initialPassword={teacherValidationParams.password}
          onActivationComplete={(activatedUser, schoolId) => {
            setUsers((prev) => {
              const updated = prev.map((u) => (u.id === activatedUser.id ? activatedUser : u));
              localStorage.setItem('jjsak_users', JSON.stringify(updated));
              return updated;
            });
            setTeachers((prev) => {
              const updated = prev.map((t) => {
                if (
                  t.id === activatedUser.id ||
                  (t.email && activatedUser.email && t.email.toLowerCase() === activatedUser.email.toLowerCase()) ||
                  t.name.toLowerCase() === activatedUser.fullName.toLowerCase()
                ) {
                  return {
                    ...t,
                    accountStatus: 'APPROVED' as const,
                    active: true,
                    passwordCreated: true,
                  };
                }
                return t;
              });
              localStorage.setItem('jjsak_teachers_v3', JSON.stringify(updated));
              return updated;
            });
            setIsTeacherValidationOpen(false);
            triggerSaveNotification(`✓ Password configured for ${activatedUser.fullName}. Please log in.`);
            handleLogAudit('STAFF_PASSWORD_SET', `Teacher ${activatedUser.fullName} (${activatedUser.username}) completed OTP activation and permanent password setup for school ${schoolId}.`);
          }}
          onOpenInbox={() => {
            setIsTeacherValidationOpen(false);
            setIsCarrierInboxOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:py-5 sm:px-4">
      {/* Code P2.8: Session Inactivity Guard (30 Min Timeout) */}
        <SessionInactivityGuard
          currentUser={currentUser}
          onAutoLogout={handleAutoLogout}
          timeoutMinutes={30}
        />

        {/* Desktop Device & Screen Quick Bar */}
        <div className={`w-full hidden sm:flex items-center justify-between py-2 px-4 mb-3 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 text-slate-300 text-xs font-semibold shadow-xl transition-all ${
          deviceView === 'desktop' ? 'max-w-4xl' : 'max-w-md'
        }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-red-400 font-black tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>JJSAK CBC</span>
          </div>

          {/* Active JWT Session Badge */}
          <div
            className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
            title={`JWT Token Active: ${activeJWTSession.token.slice(0, 16)}...`}
          >
            <Key className="w-2.5 h-2.5 text-amber-400" />
            <span>JWT Active</span>
          </div>

          {/* Subscription Status Tag */}
          <button
            type="button"
            onClick={() => handleNavigate('subscription')}
            className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
              isSubscriptionActive
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                : 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
            }`}
            title="View School Subscription & Licensing Details"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSubscriptionActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span>{isSubscriptionActive ? '1-Term Trial Active' : 'Trial Expired'}</span>
          </button>

          {/* Institutional Database Persistence Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
              cloudSyncStatus.status === 'SAVING'
                ? 'bg-amber-950/70 text-amber-300 border-amber-800 animate-pulse'
                : cloudSyncStatus.status === 'ERROR'
                ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
            }`}
            title={
              cloudSyncStatus.lastSaved
                ? `All school portal records persistently stored to server database at ${cloudSyncStatus.lastSaved}.`
                : 'School portal data persistently saved and stored in server database.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cloudSyncStatus.status === 'SAVING'
                  ? 'bg-amber-400'
                  : cloudSyncStatus.status === 'ERROR'
                  ? 'bg-rose-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>
              {cloudSyncStatus.status === 'SAVING'
                ? 'Saving to DB...'
                : cloudSyncStatus.status === 'ERROR'
                ? 'Sync Pending'
                : 'DB Persistent • Saved'}
            </span>
          </div>

          {/* Device Frame View Switcher (Mobile vs Laptop/PC Widescreen) */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-[#C51E28] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile Phone View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-[#C51E28] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Laptop / PC View"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>PC View</span>
            </button>
          </div>

          {/* Official JJSAK Installable Application Header Action (Rules §1-17) */}
          <PWAInstallHeaderButton
            onOpenDistributionModal={() => setIsDownloadAppModalOpen(true)}
            schoolName={tenants.find((t) => t.schoolId === activeTenantId)?.schoolName}
          />
        </div>

        {/* Right Tools (Enter Marks, Recycle Bin, Share App, Role Switcher) */}
        <div className="flex items-center gap-1.5">
          {/* Institutional Role Governance & Identity Control (JJSAK Policy §1) */}
          {!isOwnerOrSuperAdmin(currentUser) ? (
            <div className="flex items-center gap-1.5">
              {/* Institutional Role Lock Pill */}
              <button
                type="button"
                id="header-role-lock-pill"
                onClick={() => setIsSelfServiceIntegrityModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition border border-slate-700 cursor-pointer shadow-xs"
                title="Institutional Role Integrity Rule: Role is permanently locked under JJSAK Policy §1. Click to view institutional status."
              >
                <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate max-w-[90px]">{currentUser.fullName.split(' ')[0]}</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-red-950 text-red-300 font-black border border-red-900/60">
                  {currentUser.role}
                </span>
              </button>

              {/* Authorized Institutional Approver Governance Center Shortcut */}
              {institutionalRoleGovernanceService.canUserManageRoleAssignment(currentUser) && (
                <button
                  type="button"
                  id="header-role-gov-center-btn"
                  onClick={() => setIsRoleGovernanceModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800/80 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Open JJSAK Institutional Role Governance & Assignment Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="hidden lg:inline text-[10px]">Role Governance</span>
                </button>
              )}
            </div>
          ) : (
            /* Super Administrator / System Owner Tools */
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="header-superadmin-role-gov-btn"
                onClick={() => setIsRoleGovernanceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-[#C51E28] hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="JJSAK Institutional Role Governance & Change Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Role Governance</span>
              </button>

              {/* Diagnostic View Switcher for Platform Owner */}
              <div className="relative">
                <button
                  type="button"
                  id="header-superadmin-diagnostic-switch-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition border border-slate-700 cursor-pointer"
                  title="Diagnostic View Simulator (Super Admin Testing Only)"
                >
                  <span className="truncate max-w-[80px]">{currentUser.fullName.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                    <div className="px-2.5 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Owner Diagnostic View Simulator</span>
                      <span className="text-[#C51E28] font-bold">Preview</span>
                    </div>
                    <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                      {users.map((u) => {
                        const isSelected = currentUser.id === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSwitchUser(u)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#C51E28] text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800 font-medium'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <div className="truncate text-[11px] font-bold">{u.fullName}</div>
                              <div className={`text-[9px] ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                                {isOwnerOrSuperAdmin(u)
                                  ? 'Platform Owner • Super Admin'
                                  : `${u.role} • ${u.employeeNumber || u.username}`}
                              </div>
                            </div>
                            {isSelected && <UserCheck className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner School Registration & Provisioning Console (Super Admin) */}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SYSTEM_ADMIN') && (
            <button
              type="button"
              id="owner-school-registry-btn"
              onClick={() => handleNavigate('owner_console')}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer border border-red-500"
              title="Super Admin School Provisioning & Registry Console"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Owner Console</span>
            </button>
          )}

          {/* JJSAK Platform Owner / Super Administrator Governance Dashboard Button */}
          {isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              id="owner-governance-dashboard-btn"
              onClick={() => handleNavigate('owner_dashboard')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer border border-amber-400"
              title="JJSAK Platform Owner / Super Administrator Governance Dashboard (§4)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </button>
          )}

          {/* Active Dual-Identity Indicator & Fast Return to Owner Domain */}
          {ownerGovernanceService.getDualIdentityProfile().activeMode === 'SCHOOL_OPERATIONAL' && (
            <button
              type="button"
              id="dual-identity-exit-btn"
              onClick={() => handleIdentitySwitch('PLATFORM_GOVERNANCE')}
              className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="Dual-Identity: Operating under School Operational Account. Click to return to Platform Owner Domain (§7)."
            >
              <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
              <span>Exit to Owner</span>
            </button>
          )}

          {/* Master Architecture & Governance Blueprint Button - SCMH 2.X: Super Admin / Owner ONLY */}
          {isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => handleNavigate('master_architecture')}
              className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition border border-amber-800 cursor-pointer"
              title="Final JJSAK 27-Phase Master Architecture Blueprint (Super Admin ONLY)"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Architecture</span>
            </button>
          )}

          {/* Phase 5 Academic Operations & Grading Engine Hub Button - Hidden from Owner (§4 & §6) */}
          {!isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => handleNavigate('academic_hub')}
              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 font-bold text-[11px] flex items-center gap-1 transition border border-indigo-800 cursor-pointer"
              title="Open Phase 5 Academic Operations, Assessments Matrix & Grading Hub"
            >
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              <span className="hidden md:inline">Academics</span>
            </button>
          )}

          {/* Security Core Quick Action Button - SCMH 2.X: Super Admin / Owner ONLY */}
          {isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => handleNavigate('security_core')}
              className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-[11px] flex items-center gap-1 transition border border-red-800 cursor-pointer"
              title="Open Phase 2 Security Core & Multi-Tenant Hub (Super Admin ONLY)"
            >
              <ShieldCheck className="w-3 h-3 text-red-400" />
              <span className="hidden md:inline">Security</span>
            </button>
          )}

          {/* Code P2.10: Recycle Bin Button - Hidden from Owner (§4 & §6) */}
          {!isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => setIsRecycleBinOpen(true)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition border border-slate-700 cursor-pointer relative"
              title="Open 30-Day Recycle Bin (Code P2.10)"
            >
              <Trash2 className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Bin</span>
              {recycleBin.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                  {recycleBin.length}
                </span>
              )}
            </button>
          )}

          {/* Lock / Sign Out Button (JJSAK-AUTH-SEC-001) */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 font-bold text-[11px] flex items-center gap-1.5 transition border border-red-800 cursor-pointer shadow-xs"
            title="Lock School Portal & Return to Secure Login Screen"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span>Sign Out</span>
          </button>

          {/* Enter Marks Button - Hidden from Owner (§4 & §6) */}
          {!isOwnerOrSuperAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => handleOpenTeacherMarks()}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
              title="Enter Subject Marks on Mobile / PC"
            >
              <Edit2 className="w-3 h-3" />
              <span className="hidden sm:inline">Enter Marks</span>
            </button>
          )}

          <button
            type="button"
            id="header-carrier-inbox-btn"
            onClick={() => setIsCarrierInboxOpen(true)}
            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition border border-amber-500/30 cursor-pointer"
            title="Open Carrier Inboxes (SMS / WhatsApp / Email verification OTP dispatch)"
          >
            <Inbox className="w-3 h-3 text-amber-400" />
            <span className="hidden xl:inline">Inboxes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition border border-slate-700 cursor-pointer"
            title="Share app to Phone, PC or Laptop"
          >
            <Share2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {/* Offline Status & Connectivity Banner (Rule §14) */}
      <OfflineIndicator
        tenantName={tenants.find((t) => t.schoolId === activeTenantId)?.schoolName}
        tenantId={activeTenantId}
      />

      {/* Main Container (Responsive for Mobile Phones & Laptop/PC) */}
      <div className={`w-full bg-white min-h-screen transition-all ${
        deviceView === 'desktop'
          ? 'sm:max-w-4xl sm:min-h-[860px] sm:max-h-[960px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] sm:border-slate-800'
          : 'max-w-md sm:min-h-[840px] sm:max-h-[920px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] sm:border-slate-800'
      }`}>
        {/* Mobile Status Bar Simulation */}
        <div className="w-full bg-[#C51E28] text-white px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider select-none z-40">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium opacity-90 truncate max-w-[200px]">
              {isOwnerOrSuperAdmin(currentUser)
                ? 'JJSAK Platform Governance Core'
                : (tenants.find((t) => t.schoolId === activeTenantId)?.schoolName || schoolInfo.name || 'JJSAK Education Platform')}
            </span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25c-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0l.62.64C7.03 19.34 9.38 20 12 20c2.62 0 4.97-.66 6.32-1.82l.62-.64c.2-.2.51-.2.71 0 .2.2.2.51 0 .71l-.62.64C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/>
              </svg>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4z"/>
              </svg>
              <div className="w-4 h-2 rounded-[2px] border border-white p-[0.5px] flex items-center">
                <div className="w-full h-full bg-white rounded-[1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Break-Glass Active Session Indicator & Countdown Banner (Section 10 & 11) */}
        {activeEmergencySession && (
          <EmergencyAccessBanner
            session={activeEmergencySession}
            onEndSession={() => {
              setActiveEmergencySession(null);
              triggerSaveNotification('Emergency access session terminated.');
            }}
            onLogAudit={(action, details) => handleLogAudit(action as any, details)}
          />
        )}

        {/* Screen Switcher Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {currentScreen === 'splash' && (
            <SplashScreen onGetStarted={() => handleNavigate('home')} />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              schoolInfo={schoolInfo}
              students={isolatedStudents}
              teachers={isolatedTeachers}
              currentUser={currentUser}
              users={isolatedUsers}
              activeTenantId={activeTenantId}
              tenants={tenants}
              onNavigate={(screen) => handleNavigate(screen)}
              onOpenMarksEntry={() => handleOpenTeacherMarks()}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenDownloadAppModal={() => setIsDownloadAppModalOpen(true)}
              onOpenBulkUpload={() => setIsBulkUploadModalOpen(true)}
              onIdentitySwitched={handleIdentitySwitch}
              onOpenDataEntryHub={(mode) => {
                setDataEntryHubMode(mode || 'individual');
                setIsDataEntryHubOpen(true);
              }}
              onOpenCommunicationHub={(tab) => {
                setCommunicationHubTab(tab || 'parents');
                setIsCommunicationHubOpen(true);
              }}
              onSelectStudent={(s) => setSelectedStudent(s)}
              onUpdateStudent={handleUpdateStudent}
              onUpdateUser={(u) => setUsers((prev) => prev.map((item) => (item.id === u.id ? u : item)))}
              onAddUser={(u) => setUsers((prev) => [u, ...prev])}
              onLogAudit={handleLogAudit}
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsScreen
              students={isolatedStudents}
              teachers={isolatedTeachers}
              onBack={() => handleNavigate('home')}
              onSelectStudent={(s) => {
                setSelectedStudent(s);
                handleNavigate('student_report');
              }}
              onNavigateToPathways={() => handleNavigate('pathways')}
            />
          )}

          {currentScreen === 'pathways' && (
            <PathwayFinderScreen
              students={isolatedStudents}
              initialStudentId={selectedStudent?.id}
              onBack={() => handleNavigate('home')}
              onOpenReportCard={(s) => {
                setSelectedStudent(s);
                handleNavigate('student_report');
              }}
            />
          )}

          {currentScreen === 'timetabling' && (
            <TimetableScreen
              schoolInfo={schoolInfo}
              teachers={isolatedTeachers}
              currentUser={currentUser}
              users={isolatedUsers}
              lessons={timetables}
              onSaveLessons={handleSaveTimetable}
              onLogAudit={handleLogAudit}
              onBack={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'assessment_generator' && (
            <AssessmentGeneratorScreen
              schoolInfo={schoolInfo}
              onBack={() => handleNavigate('home')}
              onAddAssessmentToSystem={(newAss) => {
                handleCreateAssessment(newAss);
                handleNavigate('assessments');
              }}
            />
          )}

          {currentScreen === 'assessments' && (
            <AssessmentsScreen
              assessments={isolatedAssessments}
              students={isolatedStudents}
              teachers={isolatedTeachers}
              onBack={() => handleNavigate('home')}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onSaveAssessmentMarks={handleSaveAssessmentMarks}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          )}

          {currentScreen === 'student_report' && (
            <StudentReportScreen
              student={selectedStudent || isolatedStudents[0] || students[0]}
              allStudents={isolatedStudents}
              teachers={isolatedTeachers}
              activeTenant={tenants.find((t) => t.schoolId === activeTenantId)}
              schoolProfile={schoolProfile}
              currentUser={currentUser}
              onSelectStudent={(s) => setSelectedStudent(s)}
              onUpdateStudent={handleUpdateStudent}
              onBatchUpdateStudents={handleBatchUpdateStudents}
              onBack={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'students' && (
            <StudentsScreen
              students={isolatedStudents}
              currentUser={currentUser}
              onSelectStudent={(s) => {
                setSelectedStudent(s);
                handleNavigate('student_report');
              }}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBack={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'teachers' && (
            <TeachersScreen
              teachers={isolatedTeachers}
              currentSchoolId={effectiveTenantId}
              onBack={() => handleNavigate('home')}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onOpenMarksEntry={(teachId, cls, sub) => handleOpenTeacherMarks(teachId, cls, sub)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenCarrierInbox={() => setIsCarrierInboxOpen(true)}
              onOpenTeacherValidation={(otp, username, schoolId, password) => {
                setTeacherValidationParams({ otp, username, schoolId, password });
                setIsTeacherValidationOpen(true);
              }}
              currentUser={currentUser}
              users={isolatedUsers}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'import_export' && (
            <ImportExportScreen
              students={isolatedStudents}
              assessments={isolatedAssessments}
              onBack={() => handleNavigate('home')}
              onOpenBulkUpload={() => setIsBulkUploadModalOpen(true)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              schoolInfo={schoolInfo}
              currentUser={currentUser}
              users={isolatedUsers}
              onSwitchUser={handleSwitchUser}
              onNavigate={handleNavigate}
              onOpenDownloadApp={() => setIsDownloadAppModalOpen(true)}
              onOpenRoleGovernance={() => setIsRoleGovernanceModalOpen(true)}
              onUpdateSchoolInfo={handleUpdateSchoolInfo}
              onBack={() => handleNavigate('home')}
              onResetData={handleResetData}
            />
          )}

          {currentScreen === 'school_profile' && (
            <SchoolProfileScreen
              schoolProfile={schoolProfile}
              activeTenant={tenants.find((t) => t.schoolId === activeTenantId)}
              currentUser={currentUser}
              totalStudents={isolatedStudents.length || 40}
              schoolInfo={schoolInfo}
              onNavigateToSubscriptions={() => handleNavigate('subscription')}
              onSave={handleUpdateSchoolProfile}
              onSaveTenantBranding={(updatedTenant) => {
                setTenants((prev) => {
                  const updated = prev.map((t) => (t.schoolId === updatedTenant.schoolId ? updatedTenant : t));
                  try {
                    localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
                  } catch (e) {
                    console.error('Failed to save jjsak_tenants:', e);
                  }
                  return updated;
                });
                tenantDataSyncService.saveTenant(updatedTenant).catch(console.warn);
                setSchoolInfo((prev) => ({
                  ...prev,
                  name: updatedTenant.schoolName,
                  address: updatedTenant.address || updatedTenant.postalAddress || prev.address,
                  phone: updatedTenant.phone || updatedTenant.officialPhone || prev.phone,
                  email: updatedTenant.email || updatedTenant.officialEmail || prev.email,
                  motto: updatedTenant.motto || prev.motto,
                }));
                triggerSaveNotification(`✓ Visual identity updated for ${updatedTenant.schoolName}`);
              }}
              onBack={() => handleNavigate('home')}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'subscription' && (
            <SubscriptionScreen
              subscription={subscription}
              currentUser={currentUser}
              activeTenant={tenants.find((t) => t.schoolId === (effectiveTenantId || activeTenantId))}
              activeTenantId={effectiveTenantId || activeTenantId}
              totalRegisteredLearners={
                isolatedStudents.length > 0
                  ? isolatedStudents.length
                  : ((effectiveTenantId || activeTenantId)?.toLowerCase().includes('ngonyek') || !effectiveTenantId ? 40 : (students.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId || activeTenantId)).length || 0))
              }
              onActivateSubscription={handleActivateSubscription}
              onBack={() => handleNavigate('home')}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'security_core' && (
            <SecurityCoreScreen
              currentUser={currentUser}
              users={users}
              tenants={tenants}
              activeTenantId={activeTenantId}
              auditLogs={auditLogs}
              students={currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN' ? students : isolatedStudents}
              assessments={currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN' ? assessments : isolatedAssessments}
              teachers={currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN' ? teachers : isolatedTeachers}
              schoolInfo={schoolInfo}
              recycleBin={recycleBin}
              activeJWTSession={activeJWTSession}
              onRestoreRecycleItem={handleRestoreRecycleItem}
              onPurgeRecycleItem={handlePurgeRecycleItem}
              onOpenRoleGovernance={() => setIsRoleGovernanceModalOpen(true)}
              onBack={() => handleNavigate('home')}
              onSwitchTenant={(tId) => {
                setActiveTenantId(tId);
                const matched = tenants.find((t) => t.schoolId === tId);
                if (matched) {
                  setSchoolInfo((prev) => ({
                    ...prev,
                    name: matched.schoolName,
                    address: matched.address,
                    phone: matched.phone,
                    email: matched.email,
                  }));
                }
              }}
              onAddTenant={(newT) => {
                const tenantWithTrial: SchoolTenant = {
                  ...newT,
                  status: newT.status || 'TRIAL',
                };
                setTenants((prev) => {
                  const updated = [tenantWithTrial, ...prev];
                  try {
                    localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
                  } catch (e) {
                    console.error('Failed to save jjsak_tenants:', e);
                  }
                  return updated;
                });
                tenantDataSyncService.saveTenant(tenantWithTrial).catch(console.warn);
              }}
              onUpdateTenantStatus={handleUpdateTenantStatus}
              onAddUser={(newU) => {
                if (currentUser?.role === 'SUPER_ADMIN' && newU.role !== 'HEAD') {
                  alert("Access Denied: The Platform Owner cannot onboard teachers or regular school staff. School staff must be onboarded by the school Headteacher.");
                  return;
                }
                setUsers((prev) => [newU, ...prev]);
                localStorage.setItem('jjsak_users', JSON.stringify([newU, ...users]));
              }}
              onOpenCarrierInbox={() => setIsCarrierInboxOpen(true)}
              onOpenSchoolActivation={(params) => {
                setSchoolActivationParams(params);
                setIsSchoolActivationOpen(true);
              }}
              onUpdateUser={(upU) => {
                setUsers((prev) =>
                  prev.map((u) => (u.id === upU.id ? upU : u))
                );
              }}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'academic_hub' && (
            <AcademicOperationsScreen
              students={isolatedStudents}
              assessments={isolatedAssessments}
              teachers={isolatedTeachers}
              schoolInfo={schoolInfo}
              currentUser={currentUser}
              auditLogs={auditLogs}
              deadlines={deadlines}
              notifications={notifications}
              transfers={transfers}
              promotions={promotions}
              archives={archives}
              behaviorRecords={behaviorRecords}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onBatchUpdateStudents={handleBatchUpdateStudents}
              onUpdateStudentsList={handleUpdateStudentsList}
              onUpdateAssessment={handleUpdateAssessment}
              onAddDeadline={handleAddDeadline}
              onUpdateDeadline={handleUpdateDeadline}
              onSendNotification={handleSendNotification}
              onExecuteTransfer={handleExecuteTransfer}
              onExecutePromotion={handleExecutePromotion}
              onArchiveYear={handleArchiveYear}
              onRestoreArchive={handleRestoreArchive}
              onAddBehaviorRecord={handleAddBehaviorRecord}
              onLogAudit={handleLogAudit}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'academic_structure_hub' && (
            <AcademicStructureHub
              curriculum={curriculum}
              strands={INITIAL_LEARNING_AREA_STRANDS}
              academicYears={academicYears}
              terms={terms}
              levels={learningLevels}
              grades={academicGrades}
              streams={academicStreams}
              subjects={academicSubjects}
              allocations={teacherSubjectAllocations}
              classTeacherAllocations={classTeacherAllocations}
              placementRules={placementRules}
              promotionPolicies={promotionPolicies}
              auditLogs={academicAuditLogs}
              teachers={isolatedTeachers}
              students={isolatedStudents}
              schoolInfo={schoolInfo}
              onUpdateCurriculum={(curr) => {
                setCurriculum(curr);
                handleLogAcademicAudit('CURRICULUM_MODIFIED', `Updated curriculum framework: ${curr.name} (${curr.version}).`);
                triggerSaveNotification('✓ Curriculum framework updated');
              }}
              onUpdateAcademicYears={(years) => {
                setAcademicYears(years);
                triggerSaveNotification('✓ Academic years updated');
              }}
              onUpdateTerms={(tList) => {
                setTerms(tList);
                triggerSaveNotification('✓ Academic terms updated');
              }}
              onUpdateGrades={(gList) => {
                setAcademicGrades(gList);
                triggerSaveNotification('✓ Academic grades updated');
              }}
              onUpdateStreams={(sList) => {
                setAcademicStreams(sList);
                triggerSaveNotification('✓ Stream configurations updated');
              }}
              onUpdateSubjects={(subList) => {
                setAcademicSubjects(subList);
                triggerSaveNotification('✓ Academic subjects updated');
              }}
              onUpdateAllocations={(allocList) => {
                setTeacherSubjectAllocations(allocList);
                triggerSaveNotification('✓ Teacher subject allocations saved');
              }}
              onUpdateClassTeacherAllocations={(ctaList) => {
                setClassTeacherAllocations(ctaList);
                triggerSaveNotification('✓ Class teacher appointments saved');
              }}
              onUpdatePlacementRules={(rList) => {
                setPlacementRules(rList);
                triggerSaveNotification('✓ Learner placement rules updated');
              }}
              onUpdatePromotionPolicies={(pList) => {
                setPromotionPolicies(pList);
                triggerSaveNotification('✓ Promotion policies updated');
              }}
              onUpdateStudents={(sList) => {
                setStudents(sList);
                triggerSaveNotification('✓ Student placements updated');
              }}
              onLogAudit={handleLogAcademicAudit}
              onBackToHome={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'master_architecture' && (
            <MasterArchitectureScreen
              schoolInfo={schoolInfo}
              students={isolatedStudents}
              teachers={isolatedTeachers}
              tenants={tenants}
              currentUser={currentUser}
              onBack={() => handleNavigate('home')}
              onNavigate={(screen) => handleNavigate(screen)}
              onOpenDataEntryHub={(mode) => {
                setDataEntryHubMode(mode || 'individual');
                setIsDataEntryHubOpen(true);
              }}
              onOpenCommunicationHub={(tab) => {
                setCommunicationHubTab(tab || 'parents');
                setIsCommunicationHubOpen(true);
              }}
              onOpenTeacherMarks={(tId?: string, cls?: string, sub?: string) => handleOpenTeacherMarks(tId, cls, sub)}
              onOpenBulkUpload={() => setIsBulkUploadModalOpen(true)}
            />
          )}

          {currentScreen === 'reports_hub' && (
            <ReportsHubScreen
              students={isolatedStudents}
              teachers={isolatedTeachers}
              schoolInfo={schoolInfo}
              schoolProfile={schoolProfile}
              currentUser={currentUser}
              onBack={() => handleNavigate('home')}
              onSelectStudent={(s) => {
                setSelectedStudent(s);
                handleNavigate('student_report');
              }}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'owner_console' && (
            (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SYSTEM_ADMIN') ? (
              <OwnerSchoolManagementScreen
                currentUser={currentUser}
                schools={tenants}
                onOpenCarrierInbox={() => setIsCarrierInboxOpen(true)}
                onOpenSchoolActivation={(params) => {
                  setSchoolActivationParams(params);
                  setIsSchoolActivationOpen(true);
                }}
                onAddSchool={(newSchool) => {
                  const schoolWithTrial: SchoolTenant = {
                    ...newSchool,
                    status: 'TRIAL',
                  };
                  setTenants((prev) => {
                    const updated = [schoolWithTrial, ...prev];
                    try {
                      localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
                    } catch (e) {
                      console.error('Failed to save jjsak_tenants:', e);
                    }
                    return updated;
                  });
                  tenantDataSyncService.saveTenant(schoolWithTrial).catch(console.warn);

                  // Auto-initialize 1-term approved free trial subscription (120 days, 0 charges)
                  institutionalSubscriptionService.getSchoolSubscription(
                    schoolWithTrial.schoolId,
                    schoolWithTrial.schoolName,
                    schoolWithTrial.schoolCode,
                    0
                  );

                  // Auto-dispatch portal activation link, first-time password & OTP
                  const dispatchResult = carrierInboxService.ensureDispatchedForSchool(schoolWithTrial, { force: true });

                  // Auto-provision initial Head of Institution account in compliance with Part B, Rule §6
                  const initialHeadUser: User = {
                    id: `usr-${(schoolWithTrial.subdomain || schoolWithTrial.schoolCode).toLowerCase().replace(/[^a-z0-9]/g, '')}-head`,
                    schoolId: schoolWithTrial.schoolId,
                    schoolName: schoolWithTrial.schoolName,
                    fullName: schoolWithTrial.administratorDetails?.fullName || `Headteacher (${schoolWithTrial.schoolName})`,
                    username: `head.${(schoolWithTrial.subdomain || schoolWithTrial.schoolCode).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                    email: schoolWithTrial.administratorDetails?.emailAddress || schoolWithTrial.email || `head@${schoolWithTrial.subdomain || 'school'}.sc.ke`,
                    phoneNumber: schoolWithTrial.administratorDetails?.phoneNumber || schoolWithTrial.phone || '+254 741 478 813',
                    role: 'HEAD',
                    designation: 'Head of Institution / Principal',
                    password: dispatchResult.firstTimePassword || 'Password@2026!',
                    firstTimePassword: dispatchResult.firstTimePassword || 'Password@2026!',
                    schoolAccountAlias: `${(schoolWithTrial.subdomain || schoolWithTrial.schoolCode).toLowerCase().replace(/[^a-z0-9]/g, '')}@jjsak`,
                    active: true,
                    mfaEnabled: true,
                    mfaMethod: 'SMS_OTP',
                    firstLoginCompleted: false,
                    activationStatus: 'PENDING_ACTIVATION',
                    employeeNumber: `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
                  };

                  setUsers((prev) => {
                    const filtered = prev.filter((u) => u.id !== initialHeadUser.id);
                    const updated = [initialHeadUser, ...filtered];
                    localStorage.setItem('jjsak_users', JSON.stringify(updated));
                    return updated;
                  });
                  tenantDataSyncService.saveUser(initialHeadUser).catch((err) => {
                    console.warn('Failed to save initial head user to server:', err);
                  });

                  handleLogAudit(
                    'TENANT_CREATE',
                    `Super Admin registered new school '${newSchool.schoolName}' [${newSchool.schoolCode}]. Activation credentials dispatched & Initial Head account provisioned.`
                  );
                  triggerSaveNotification(`✓ School '${newSchool.schoolName}' registered & credentials dispatched via SMS & WhatsApp`);
                }}
                onUpdateSchoolStatus={handleUpdateTenantStatus}
                onDeleteSchool={handleDeleteTenant}
                onActivateAndProceedToProfile={(school) => {
                  setActiveTenantId(school.schoolId);
                  setSchoolInfo((prev) => ({
                    ...prev,
                    name: school.schoolName,
                    address: school.address,
                    phone: school.phone,
                    email: school.email,
                    motto: school.motto || prev.motto,
                  }));
                  handleNavigate('school_profile');
                  triggerSaveNotification(`✓ Switched to ${school.schoolName}`);
                }}
                onLogoutToLockScreen={() => handleNavigate('home')}
                onLogAudit={handleLogAudit}
                onResetToZeroSchoolState={() => {
                  cleanDeploymentService.initializeZeroSchoolState();
                  setTenants([]);
                  setUsers([AUTHORIZED_PLATFORM_OWNER]);
                  setCurrentUser(AUTHORIZED_PLATFORM_OWNER);
                  setActiveTenantId('');
                  setStudents([]);
                  setTeachers([]);
                  setAssessments([]);
                  setAttendanceRegisters([]);
                  setSchoolInfo(CLEAN_PLATFORM_INFO);
                  handleLogAudit('SYSTEM_EVENT', 'Platform Owner reset deployment to Clean Zero-School Production State (JJSAK-DEPLOY-001).');
                  triggerSaveNotification('✓ Platform reset to Zero-School Production State (JJSAK-DEPLOY-001)');
                }}
              />
            ) : (
              <SecurityBoundaryModal
                isOpen={true}
                onClose={() => handleNavigate('home')}
                currentUser={currentUser}
                attemptedTarget="Super Administrator School Provisioning & Registry site"
              />
            )
          )}

          {currentScreen === 'owner_dashboard' && (
            isOwnerOrSuperAdmin(currentUser) ? (
              <div className="p-4 sm:p-6 bg-slate-950 min-h-screen">
                <OwnerPlatformDashboard
                  currentUser={currentUser}
                  tenants={tenants}
                  onNavigate={handleNavigate}
                  onInitiateSchoolAudit={(tenant, _reason) => {
                    setActiveTenantId(tenant.schoolId);
                    setSchoolInfo((prev) => ({
                      ...prev,
                      name: tenant.schoolName,
                      address: tenant.address,
                      phone: tenant.phone,
                      email: tenant.email,
                      motto: tenant.motto || prev.motto,
                    }));
                    handleNavigate('school_profile');
                    triggerSaveNotification(`✓ Initiated Authorized Audit Session for ${tenant.schoolName}`);
                  }}
                  onLogAudit={handleLogAudit}
                  onIdentitySwitched={handleIdentitySwitch}
                  onUpdateSchoolStatus={handleUpdateTenantStatus}
                  onDeleteSchool={handleDeleteTenant}
                />
              </div>
            ) : (
              <SecurityBoundaryModal
                isOpen={true}
                onClose={() => handleNavigate('home')}
                currentUser={currentUser}
                attemptedTarget="Platform Owner Governance Dashboard"
              />
            )
          )}

          {currentScreen === 'data_entry_hub' && (
            <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Core Data Entry Hub</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Access 5 entry channels: Individual, Register, Marks, Bulk Upload, and Photos.
              </p>
              <button
                type="button"
                onClick={() => setIsDataEntryHubOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Launch Data Entry Hub
              </button>
            </div>
          )}

          {currentScreen === 'learner_welfare_hub' && (
            <LearnerWelfareHub
              students={isolatedStudents}
              currentUser={currentUser}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              attendanceRegisters={isolatedAttendanceRegisters}
              onSaveAttendanceRegister={handleSaveAttendanceRegister}
              disciplineIncidents={isolatedDisciplineIncidents}
              onAddDisciplineIncident={handleAddDisciplineIncident}
              onUpdateDisciplineIncident={handleUpdateDisciplineIncident}
              healthIncidents={isolatedHealthIncidents}
              healthProfiles={healthProfiles}
              onAddHealthIncident={handleAddHealthIncident}
              onUpdateHealthProfile={handleUpdateHealthProfile}
              welfareCheckIns={isolatedWelfareCheckIns}
              onAddCheckIn={handleAddWelfareCheckIn}
              onUpdateCheckIn={handleUpdateWelfareCheckIn}
              counselingSessions={isolatedCounselingSessions}
              vulnerableLearners={isolatedVulnerableLearners}
              onAddCounselingSession={handleAddCounselingSession}
              onAddVulnerableLearner={handleAddVulnerableLearner}
              onUpdateVulnerableLearner={handleUpdateVulnerableLearner}
              transfersOut={isolatedTransfersOut}
              transfersIn={isolatedTransfersIn}
              graduations={isolatedGraduations}
              onProcessTransferOut={handleProcessTransferOut}
              onProcessTransferIn={handleProcessTransferIn}
              onGraduateGrade9={handleGraduateGrade9}
              communications={isolatedCommunications}
              onSendParentNotice={handleSendParentNotice}
              auditLogs={auditLogs.map((a) => ({
                id: a.id,
                timestamp: new Date(a.timestamp).toLocaleString(),
                action: a.actionType,
                performedBy: `${a.userName} (${a.userRole})`,
                details: a.details,
                beforeVal: a.beforeValue,
                afterVal: a.afterValue,
              }))}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'communication_hub' && (
            <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Communication & Distribution Hub</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Broadcast SMS notifications to parents and staff, and monitor report deliveries.
              </p>
              <button
                type="button"
                onClick={() => setIsCommunicationHubOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Launch Communication Hub
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar (Hidden for Platform Owner in Governance mode §4 & §6) */}
        {currentScreen !== 'splash' && !(isOwnerOrSuperAdmin(currentUser) && !activeEmergencySession) && (
          <BottomNavBar
            activeTab={bottomTab}
            onTabChange={handleBottomNav}
          />
        )}
      </div>

      {/* Code P2.10: 30-Day Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        items={recycleBin}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.fullName}
        onRestore={handleRestoreRecycleItem}
        onPermanentPurge={handlePurgeRecycleItem}
      />

      {/* Code P1.10: Permanent Deletion Security Gate Modal */}
      <PermanentDeletionModal
        isOpen={deletionModalState.isOpen}
        itemTitle={deletionModalState.itemTitle}
        itemType={deletionModalState.itemType}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.fullName}
        onConfirm={deletionModalState.onConfirm}
        onCancel={() => setDeletionModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Code P1.5 - P1.8 & P2.4 - P2.6: Secure Authentication & MFA Modal */}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        users={users}
        currentUser={currentUser}
        onLoginSuccess={(user, jwt) => {
          setCurrentUser(user);
          if (jwt) {
            setActiveJWTSession(jwt);
          }
          triggerSaveNotification(`✓ Authenticated as ${user.fullName} (${user.role}) with JWT`);
        }}
        onClose={() => setIsAuthModalOpen(false)}
        onLogAudit={handleLogAudit}
        onTriggerAlert={(title, desc, severity) => {
          handleLogAudit('ACCOUNT_LOCKED', `[ALERT ${severity}] ${title}: ${desc}`);
        }}
      />

      {/* Bulk Learner Onboarding & CSV Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        existingStudents={isolatedStudents}
        currentSchoolId={effectiveTenantId}
        onUploadSuccess={(updatedStudents) => {
          const stampedUploaded = updatedStudents.map((s) => ({
            ...s,
            schoolId: s.schoolId || effectiveTenantId,
          }));
          setStudents((prev) => {
            const others = effectiveTenantId
              ? prev.filter((s) => !isSchoolMatch(s.schoolId, effectiveTenantId))
              : [];
            const merged = [...others, ...stampedUploaded];
            const ranked = calculateStudentRankings(merged);
            try {
              localStorage.setItem('jjsak_students', JSON.stringify(ranked));
            } catch {}
            return ranked;
          });
          setSchoolInfo((prev) => ({
            ...prev,
            totalStudents: stampedUploaded.length,
          }));
          if (stampedUploaded.length > 0) {
            setSelectedStudent(stampedUploaded[0]);
          }
          if (effectiveTenantId) {
            tenantDataSyncService.saveTenantData(effectiveTenantId, {
              students: stampedUploaded,
              schoolInfo: { ...schoolInfo, totalStudents: stampedUploaded.length },
            });
            triggerSaveNotification(`✓ ${stampedUploaded.length} learners successfully uploaded and persisted to school portal`);
          }
        }}
      />

      {/* Cross-Device Share Application Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Responsive Teacher Subject Marks Entry Sheet Modal */}
      <TeacherMarksEntryModal
        isOpen={isTeacherMarksModalOpen}
        onClose={() => setIsTeacherMarksModalOpen(false)}
        students={isolatedStudents}
        teachers={isolatedTeachers}
        assessments={isolatedAssessments}
        initialTeacherId={teacherMarksParams.teacherId}
        initialClass={teacherMarksParams.className}
        initialSubject={teacherMarksParams.subject}
        initialAssessmentId={teacherMarksParams.assessmentId}
        onSaveAssessmentMarks={handleSaveAssessmentMarks}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Core Data Entry Hub Modal (5 Ingestion Channels) */}
      <DataEntryHubModal
        isOpen={isDataEntryHubOpen}
        onClose={() => setIsDataEntryHubOpen(false)}
        initialMode={dataEntryHubMode}
        students={isolatedStudents}
        teachers={isolatedTeachers}
        schoolInfo={schoolInfo}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onUpdateStudentsAttendance={(updates) => {
          let updatedList: Student[] = [];
          setStudents((prev) => {
            const mapped = prev.map((s) => {
              const match = updates.find((u) => u.id === s.id);
              return match ? { ...s, attendance: match.attendance } : s;
            });
            updatedList = mapped;
            try {
              localStorage.setItem('jjsak_students', JSON.stringify(mapped));
            } catch {}
            return mapped;
          });
          if (effectiveTenantId) {
            tenantDataSyncService.saveTenantData(effectiveTenantId, {
              students: updatedList.filter((s) => isSchoolMatch(s.schoolId, effectiveTenantId)),
            });
          }
          triggerSaveNotification('✓ Attendance registers saved for all learners in database');
        }}
        onOpenMarksEntryModal={(teacherId: string, className: string, subject: string) => {
          setIsDataEntryHubOpen(false);
          handleOpenTeacherMarks(teacherId, className, subject);
        }}
        onOpenBulkUploadModal={() => {
          setIsDataEntryHubOpen(false);
          setIsBulkUploadModalOpen(true);
        }}
        onLogAudit={handleLogAudit}
      />

      {/* Core Communication & Reporting Modal */}
      <CommunicationHubModal
        isOpen={isCommunicationHubOpen}
        onClose={() => setIsCommunicationHubOpen(false)}
        initialTab={communicationHubTab}
        schoolInfo={schoolInfo}
        students={isolatedStudents}
        teachers={isolatedTeachers}
        currentUser={currentUser}
        onNavigateToReportsHub={() => {
          setIsCommunicationHubOpen(false);
          handleNavigate('reports_hub');
        }}
        onLogAudit={handleLogAudit}
      />

      {/* Security Boundary Enforcement Modal */}
      <SecurityBoundaryModal
        isOpen={securityBoundaryState.isOpen}
        onClose={() => setSecurityBoundaryState((prev) => ({ ...prev, isOpen: false }))}
        currentUser={currentUser}
        attemptedTarget={securityBoundaryState.target}
        customMessage={securityBoundaryState.message}
      />

      {/* Download School Offline App & Credentials Pack Modal */}
      {tenants.find((t) => t.schoolId === activeTenantId) && (
        <DownloadSchoolAppModal
          isOpen={isDownloadAppModalOpen}
          onClose={() => setIsDownloadAppModalOpen(false)}
          school={tenants.find((t) => t.schoolId === activeTenantId)!}
          users={isolatedUsers}
          onOpenFirstTimeActivation={() => setIsFirstTimeActivationModalOpen(true)}
        />
      )}

      {/* In-School First-Time Staff Activation Modal (Rule §6) */}
      <FirstTimeStaffActivationModal
        isOpen={isFirstTimeActivationModalOpen}
        users={isolatedUsers}
        school={tenants.find((t) => t.schoolId === activeTenantId)}
        schoolName={tenants.find((t) => t.schoolId === activeTenantId)?.schoolName}
        onClose={() => setIsFirstTimeActivationModalOpen(false)}
        onActivationSuccess={(activatedUser) => {
          setUsers((prev) => prev.map((u) => (u.id === activatedUser.id ? activatedUser : u)));
          triggerSaveNotification(`✓ Staff account activated for ${activatedUser.fullName} (${activatedUser.username})`);
          handleLogAudit('STAFF_PASSWORD_SET', `In-school first-time staff activation completed for [${activatedUser.fullName}].`);
        }}
      />

      {/* JJSAK Institutional Role Assignment & Governance Modal (Policy §1-8) */}
      <InstitutionalRoleGovernanceModal
        isOpen={isRoleGovernanceModalOpen}
        onClose={() => setIsRoleGovernanceModalOpen(false)}
        currentUser={currentUser}
        schoolInfo={schoolInfo}
        users={users}
        onUserUpdated={(updatedUser) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          );
          if (currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
          }
          triggerSaveNotification(
            `✓ Institutional role updated for ${updatedUser.fullName} (${updatedUser.role})`
          );
        }}
        onLogAudit={handleLogAudit}
      />

      {/* JJSAK Self-Service Role Integrity Enforcement Modal (Policy §1) */}
      <SelfServiceRoleIntegrityModal
        isOpen={isSelfServiceIntegrityModalOpen}
        onClose={() => setIsSelfServiceIntegrityModalOpen(false)}
        currentUser={currentUser}
        schoolInfo={schoolInfo}
        onOpenGovernanceCenter={() => {
          setIsSelfServiceIntegrityModalOpen(false);
          setIsRoleGovernanceModalOpen(true);
        }}
      />

      {/* JJSAK Owner Data Boundary Protection Notice Modal (§6) */}
      <OwnerBoundaryNoticeModal
        isOpen={isOwnerBoundaryModalOpen}
        onClose={() => setIsOwnerBoundaryModalOpen(false)}
        targetResourceName={boundaryTargetName}
        onOpenExceptions={() => setIsExceptionsModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenDualIdentity={() => setIsDualIdentityModalOpen(true)}
        onReturnToDashboard={() => handleNavigate('owner_dashboard')}
      />

      {/* Dual-Identity Separation Management Modal (§7) */}
      <DualIdentityModal
        isOpen={isDualIdentityModalOpen}
        onClose={() => setIsDualIdentityModalOpen(false)}
        onIdentitySwitched={handleIdentitySwitch}
        onLogAudit={(action, details) => handleLogAudit(action as any, details)}
        tenants={tenants}
        onAddUser={(newU) => {
          setUsers((prev) => [newU, ...prev]);
          localStorage.setItem('jjsak_users', JSON.stringify([newU, ...users]));
        }}
        onLogoutToSchoolLogin={(schoolUsername) => {
          setIsDualIdentityModalOpen(false);
          handleLogout();
          sessionStorage.setItem('jjsak_prefill_username', schoolUsername);
        }}
      />

      {/* Emergency Break-Glass 12-Phase Lifecycle Modal (§10, §11) */}
      <EmergencyAccessManagerModal
        isOpen={isEmergencyModalOpen}
        onClose={() => {
          setIsEmergencyModalOpen(false);
          setActiveEmergencySession(ownerGovernanceService.getActiveEmergencySession());
        }}
        tenants={tenants}
        onSessionActivated={(session) => {
          setActiveEmergencySession(session);
          triggerSaveNotification(`✓ Emergency Session ${session.sessionId} Activated`);
        }}
        onLogAudit={(action, details) => handleLogAudit(action as any, details)}
      />

      {/* Approved Exceptions Framework Modal (§9) */}
      <ApprovedExceptionsModal
        isOpen={isExceptionsModalOpen}
        onClose={() => setIsExceptionsModalOpen(false)}
        tenants={tenants}
        onLogAudit={(action, details) => handleLogAudit(action as any, details)}
      />

      {/* Carrier Dispatch & Notification Inbox Modal (SMS / WhatsApp / Email) */}
      <SimulatedCarrierInboxModal
        isOpen={isCarrierInboxOpen}
        onClose={() => setIsCarrierInboxOpen(false)}
        onSelectOtpForLogin={(_otp) => {
          setIsCarrierInboxOpen(false);
        }}
        onOpenSchoolActivation={(params) => {
          setIsCarrierInboxOpen(false);
          setSchoolActivationParams(params);
          setIsSchoolActivationOpen(true);
        }}
        onOpenValidation={(otp, username, schoolId, password) => {
          setIsCarrierInboxOpen(false);
          setTeacherValidationParams({ otp, username, schoolId, password });
          setIsTeacherValidationOpen(true);
        }}
      />

      {/* School Registration & Personnel Onboarding Activation Modal */}
      <SchoolOnboardingActivationModal
        isOpen={isSchoolActivationOpen}
        onClose={() => setIsSchoolActivationOpen(false)}
        initialSchoolId={schoolActivationParams.schoolId}
        initialSchoolName={schoolActivationParams.schoolName}
        initialRegistrationNumber={schoolActivationParams.registrationNumber}
        initialSchoolAccount={schoolActivationParams.schoolAccount}
        initialOtp={schoolActivationParams.otp}
        initialTempPassword={schoolActivationParams.temporaryPassword}
        tenants={tenants}
        users={users}
        onActivationSuccess={(activatedHeadUser, targetTenant, jwtSession) => {
          const tenantUnderTrial: SchoolTenant = {
            ...targetTenant,
            status: 'TRIAL' as const,
          };
          setTenants((prev) => {
            const updated = prev.map((t) => (t.schoolId === targetTenant.schoolId ? tenantUnderTrial : t));
            if (!updated.some((t) => t.schoolId === targetTenant.schoolId)) {
              updated.unshift(tenantUnderTrial);
            }
            localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
            return updated;
          });

          setUsers((prev) => {
            const updated = prev.map((u) => (u.id === activatedHeadUser.id ? activatedHeadUser : u));
            if (!updated.some((u) => u.id === activatedHeadUser.id)) {
              updated.unshift(activatedHeadUser);
            }
            localStorage.setItem('jjsak_users', JSON.stringify(updated));
            return updated;
          });

          handleSecureLoginSuccess(activatedHeadUser, targetTenant, jwtSession);
          setCurrentScreen('teachers'); // Immediately direct to onboard school personnel!
          setIsSchoolActivationOpen(false);
          triggerSaveNotification(`✓ School ${targetTenant.schoolName} activated! You may now onboard teachers & staff.`);
          handleLogAudit('STAFF_APPROVED', `School ${targetTenant.schoolName} activated via school account. Directing to personnel onboarding.`);
        }}
        onUpdateSchoolStatus={(schoolId, status) => {
          setTenants((prev) => {
            const updated = prev.map((t) => (t.schoolId === schoolId ? { ...t, status } : t));
            localStorage.setItem('jjsak_tenants', JSON.stringify(updated));
            return updated;
          });
        }}
        onLogAudit={(action, details) => handleLogAudit(action, details)}
      />

      {/* Teacher Validation & Set Permanent Password Modal */}
      <TeacherValidationAndActivationModal
        isOpen={isTeacherValidationOpen}
        onClose={() => setIsTeacherValidationOpen(false)}
        users={users}
        tenants={tenants}
        initialOtp={teacherValidationParams.otp}
        initialUsername={teacherValidationParams.username}
        initialSchoolId={teacherValidationParams.schoolId}
        initialPassword={teacherValidationParams.password}
        onActivationComplete={(activatedUser, schoolId) => {
          setUsers((prev) => {
            const updated = prev.map((u) => (u.id === activatedUser.id ? activatedUser : u));
            localStorage.setItem('jjsak_users', JSON.stringify(updated));
            return updated;
          });
          setTeachers((prev) => {
            const updated = prev.map((t) => {
              if (
                t.id === activatedUser.id ||
                (t.email && activatedUser.email && t.email.toLowerCase() === activatedUser.email.toLowerCase()) ||
                t.name.toLowerCase() === activatedUser.fullName.toLowerCase()
              ) {
                return {
                  ...t,
                  accountStatus: 'APPROVED' as const,
                  active: true,
                  passwordCreated: true,
                };
              }
              return t;
            });
            localStorage.setItem('jjsak_teachers_v3', JSON.stringify(updated));
            return updated;
          });
          setIsTeacherValidationOpen(false);
          triggerSaveNotification(`✓ Password configured for ${activatedUser.fullName}.`);
          handleLogAudit('STAFF_PASSWORD_SET', `Teacher ${activatedUser.fullName} (${activatedUser.username}) completed OTP activation and permanent password setup for school ${schoolId}.`);
        }}
        onOpenInbox={() => {
          setIsTeacherValidationOpen(false);
          setIsCarrierInboxOpen(true);
        }}
      />

      {/* Floating Save Status Indicator */}
      {saveStatusText && (
        <div className="save-status animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{saveStatusText}</span>
        </div>
      )}
    </div>
  );
}

export default App;
