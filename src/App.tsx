import { useState, useEffect } from 'react';
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
    const saved = localStorage.getItem('jjsak_users');
    let baseList = INITIAL_USERS;
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((u) => u.id));
          baseList = [...parsed];
          INITIAL_USERS.forEach((iu) => {
            if (!existingIds.has(iu.id)) {
              baseList.push(iu);
            }
          });
        }
      } catch {
        baseList = INITIAL_USERS;
      }
    }
    return baseList.map((u) => {
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
  });

  // Multi-School Tenancy (Code P2.1 & P2.11)
  const [tenants, setTenants] = useState<SchoolTenant[]>(() => {
    const saved = localStorage.getItem('jjsak_tenants');
    if (!saved) return DEFAULT_TENANT_SCHOOLS;
    try {
      const parsed: SchoolTenant[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((t) => t.schoolId));
        const merged = [...parsed];
        DEFAULT_TENANT_SCHOOLS.forEach((dt) => {
          if (!existingIds.has(dt.schoolId)) {
            merged.push(dt);
          } else {
            const idx = merged.findIndex((m) => m.schoolId === dt.schoolId);
            if (idx !== -1 && !merged[idx].subdomain) {
              merged[idx] = { ...merged[idx], subdomain: dt.subdomain, tenantDomain: dt.tenantDomain };
            }
          }
        });
        return merged;
      }
      return DEFAULT_TENANT_SCHOOLS;
    } catch {
      return DEFAULT_TENANT_SCHOOLS;
    }
  });
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    const saved = localStorage.getItem('jjsak_active_tenant_id');
    return saved || (DEFAULT_TENANT_SCHOOLS[0]?.schoolId || '');
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
    if (!saved) return calculateStudentRankings(INITIAL_STUDENTS);
    try {
      const parsed: Student[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return calculateStudentRankings(INITIAL_STUDENTS);
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
      return calculateStudentRankings(migrated);
    } catch {
      return calculateStudentRankings(INITIAL_STUDENTS);
    }
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
          if (!hasWatila) {
            teacherList = [INITIAL_TEACHERS[0], ...parsed];
          } else {
            teacherList = parsed;
          }
        }
      } catch {
        teacherList = INITIAL_TEACHERS;
      }
    }

    return (teacherList || []).map((t) => {
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
        classes: derivedClasses.length > 0 ? derivedClasses : (t.classes || ['G8 S']),
        subjects: derivedSubjects.length > 0 ? derivedSubjects : cleanedSubjects,
        allocations,
      };
    });
  });

  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  // Sync to localStorage with Real-time Save Status
  const triggerSaveNotification = (msg: string = '✓ Changes Saved to Local Storage') => {
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
    setBehaviorRecords((prev) => [record, ...prev]);
    handleLogAudit(
      'RECORD_EDIT',
      `Logged behavior record for ${record.studentName} (${record.admNo}): [${record.category}] ${record.title}. Severity: ${record.severity}.`
    );
    triggerSaveNotification(`✓ Behavior/Discipline record logged`);
  };

  // Phase 6 Action Handlers (P6.1 - P6.10)
  const handleSaveAttendanceRegister = (register: ClassAttendanceRegister) => {
    setAttendanceRegisters((prev) => {
      const idx = prev.findIndex((r) => r.id === register.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = register;
        return next;
      }
      return [register, ...prev];
    });
    triggerSaveNotification(`✓ Attendance register saved for ${register.className}`);
  };

  const handleAddDisciplineIncident = (incident: DisciplineIncident) => {
    setDisciplineIncidents((prev) => [incident, ...prev]);
    triggerSaveNotification(`✓ Discipline record logged for ${incident.studentName}`);
  };

  const handleUpdateDisciplineIncident = (incident: DisciplineIncident) => {
    setDisciplineIncidents((prev) =>
      prev.map((i) => (i.id === incident.id ? incident : i))
    );
    triggerSaveNotification(`✓ Discipline incident updated (${incident.status})`);
  };

  const handleAddHealthIncident = (incident: HealthIncidentRecord) => {
    setHealthIncidents((prev) => [incident, ...prev]);
    triggerSaveNotification(`✓ Health clinic encounter recorded for ${incident.studentName}`);
  };

  const handleUpdateHealthProfile = (profile: LearnerHealthProfile) => {
    setHealthProfiles((prev) => ({
      ...prev,
      [profile.studentId]: profile,
    }));
    triggerSaveNotification(`✓ Medical profile updated`);
  };

  const handleAddCounselingSession = (session: CounselingSession) => {
    setCounselingSessions((prev) => [session, ...prev]);
    triggerSaveNotification(`✓ Guidance & Counseling session logged`);
  };

  const handleAddVulnerableLearner = (record: VulnerableLearnerRecord) => {
    setVulnerableLearners((prev) => [record, ...prev]);
    triggerSaveNotification(`✓ Vulnerable learner registered into support scheme`);
  };

  const handleUpdateVulnerableLearner = (record: VulnerableLearnerRecord) => {
    setVulnerableLearners((prev) =>
      prev.map((v) => (v.id === record.id ? record : v))
    );
    triggerSaveNotification(`✓ Welfare record updated for ${record.studentName}`);
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
    triggerSaveNotification(`✓ Transfer-out clearance processed for ${record.studentName}`);
  };

  const handleProcessTransferIn = (record: TransferInRecord) => {
    setTransfersIn((prev) => [record, ...prev]);
    triggerSaveNotification(`✓ Transfer-in admitted for ${record.studentName}`);
  };

  const handleGraduateGrade9 = (record: Grade9GraduationRecord) => {
    setGraduations((prev) => [record, ...prev]);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === record.studentId
          ? { ...s, enrollmentStatus: 'Graduated' as any }
          : s
      )
    );
    triggerSaveNotification(`✓ Graduation & completion certificate issued`);
  };

  const handleSendParentNotice = (record: ParentCommunicationRecord) => {
    setCommunications((prev) => [record, ...prev]);
    triggerSaveNotification(`✓ Parent notice dispatched via ${record.channel}`);
  };

  const handleUpdateStudentsList = (newStudentsList: Student[]) => {
    const ranked = calculateStudentRankings(newStudentsList);
    setStudents(ranked);
    triggerSaveNotification(`✓ Updated learner cohort records`);
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
  const handleAutoLogout = () => {
    try {
      sessionStorage.removeItem('jjsak_session_authenticated');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    handleLogAudit('LOGOUT', `User ${currentUser.fullName} automatically logged out due to 30 minutes inactivity.`);
    triggerSaveNotification('🔒 Session expired due to inactivity. Please authenticate to access portal.');
  };

  // Explicit Sign Out Handler (JJSAK-AUTH-SEC-001)
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('jjsak_session_authenticated');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    handleLogAudit(
      'LOGOUT',
      `User ${currentUser.fullName} (${currentUser.role}) signed out. School portal locked and tenant identity cleared.`
    );
    triggerSaveNotification('🔒 Session locked. Please authenticate to access school portal.');
  };

  // Secure Authentication Success Handler (JJSAK-AUTH-SEC-001)
  const handleSecureLoginSuccess = (user: User, tenant: SchoolTenant, jwtSession: JWTSession) => {
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
    setAssessments((prev) => [newAss, ...prev]);
    setSchoolInfo((prev) => ({
      ...prev,
      totalAssessments: prev.totalAssessments + 1,
    }));
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
        setAssessments((prev) => prev.filter((a) => a.id !== id));
      },
      target
    );
  };

  // Save marks entered by teacher on phone/PC into students & assessment records
  const handleSaveAssessmentMarks = (assessment: Assessment, updatedStudents: Student[]) => {
    // 1. Update assessment record
    setAssessments((prev) => {
      const exists = prev.some((a) => a.id === assessment.id);
      if (exists) {
        return prev.map((a) => (a.id === assessment.id ? assessment : a));
      }
      return [assessment, ...prev];
    });

    // 2. Update students and recompute overall rankings and statistics
    const ranked = calculateStudentRankings(updatedStudents);
    setStudents(ranked);

    // 3. Keep selected student updated
    const currentSelectedId = selectedStudent.id;
    const matchingStudent = ranked.find((s) => s.id === currentSelectedId);
    if (matchingStudent) {
      setSelectedStudent(matchingStudent);
    }
  };

  const handleAddStudent = (newStudent: Student) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      alert("Access Denied (§6): The Platform Owner cannot register learners. Student admissions are strictly reserved for School Administrators.");
      return;
    }
    setStudents((prev) => {
      const merged = [newStudent, ...prev];
      const ranked = calculateStudentRankings(merged);
      const updatedCurrent = ranked.find((s) => s.id === newStudent.id) || newStudent;
      setSelectedStudent(updatedCurrent);
      return ranked;
    });
    setSchoolInfo((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => {
      const merged = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      const ranked = calculateStudentRankings(merged);
      const updatedCurrent = ranked.find((s) => s.id === updatedStudent.id) || updatedStudent;
      if (selectedStudent.id === updatedStudent.id) {
        setSelectedStudent(updatedCurrent);
      }
      return ranked;
    });
  };

  const handleBatchUpdateStudents = (updater: (s: Student) => Student) => {
    setStudents((prev) => {
      const merged = prev.map(updater);
      const ranked = calculateStudentRankings(merged);
      const updatedCurrent = ranked.find((s) => s.id === selectedStudent.id);
      if (updatedCurrent) {
        setSelectedStudent(updatedCurrent);
      }
      return ranked;
    });
  };

  const handleUpdateSchoolInfo = (newInfo: SchoolInfo, syncToStudents?: boolean) => {
    setSchoolInfo(newInfo);
    if (syncToStudents) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          year: newInfo.year,
          term: newInfo.term,
          nextTermDate: newInfo.nextTermOpenDate || s.nextTermDate,
        }))
      );
      setSelectedStudent((prev) => ({
        ...prev,
        year: newInfo.year,
        term: newInfo.term,
        nextTermDate: newInfo.nextTermOpenDate || prev.nextTermDate,
      }));
    }
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const title = target ? `${target.name} (${target.admNo})` : id;
    handleRequestPermanentDelete(
      title,
      'Learner Record',
      () => {
        setStudents((prev) => {
          const remaining = prev.filter((s) => s.id !== id);
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
      },
      target
    );
  };

  const handleAddTeacher = (
    newTeacher: Teacher,
    options?: { provisionAccount?: boolean; userRole?: UserRole; sendInvitation?: boolean }
  ) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      alert("Access Denied (§7): The Platform Owner cannot onboard teachers or staff. Staff onboarding is strictly delegated to School Institutional Administrators.");
      return;
    }
    setTeachers((prev) => [newTeacher, ...prev]);

    if (options?.provisionAccount) {
      const username = newTeacher.email
        ? newTeacher.email.split('@')[0]
        : (newTeacher.name || 'teacher').toLowerCase().replace(/[^a-z0-9]/g, '.');
      const newUser: User = {
        id: newTeacher.userId || `usr-${Date.now()}`,
        schoolId: activeTenantId || '',
        username,
        fullName: newTeacher.name,
        email: newTeacher.email,
        role: options.userRole || 'TEACHER',
        employeeNumber: newTeacher.tscNumber || newTeacher.staffNumber || newTeacher.employeeNumber,
        phoneNumber: newTeacher.phoneNumber,
        active: true,
        mfaEnabled: newTeacher.mfaEnabled || false,
        mfaMethod: newTeacher.mfaMethod || 'SMS_OTP',
      };
      setUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== newUser.id && u.username !== newUser.username);
        return [...filtered, newUser];
      });

      // If the individual registered by the school is the platform owner, link dual-identity (§7)
      if (
        newTeacher.name.toLowerCase().includes('jotham') ||
        (newTeacher.email && newTeacher.email.toLowerCase().includes('jothambarasawatila'))
      ) {
        const activeTenant = tenants.find((t) => t.schoolId === activeTenantId);
        ownerGovernanceService.registerSchoolIdentity({
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          schoolId: activeTenantId || 'sch-central-001',
          schoolName: activeTenant?.schoolName || 'Central Primary School',
          schoolDomain: activeTenant?.tenantDomain || `${activeTenantId}.jjsak.internal`,
          designation: newTeacher.designation || `Staff (${newUser.role})`,
          isDesignatedStaff: true,
          password: 'Password@2026!',
          lastLogin: new Date().toISOString(),
        });
      }

      handleLogAudit(
        'STAFF_ACCOUNT_PROVISIONED',
        `Provisioned unified IAM login for ${newTeacher.name} with role ${options.userRole || 'TEACHER'} in tenant ${activeTenantId}.`,
        'None',
        `User ID: ${newUser.id}`
      );
    }

    handleLogAudit(
      'STAFF_REGISTERED',
      `Registered staff profile for ${newTeacher.name} (${newTeacher.staffNumber || 'STF'}). Designation: ${newTeacher.designation || newTeacher.role}.`,
      'New Record',
      `Staff ID: ${newTeacher.id}`
    );
    triggerSaveNotification(`✓ Staff member registered & profile created`);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );

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
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      },
      target
    );
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
      />
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
              students={students}
              teachers={teachers}
              currentUser={currentUser}
              users={users}
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
              students={students}
              teachers={teachers}
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
              students={students}
              initialStudentId={selectedStudent.id}
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
              teachers={teachers}
              currentUser={currentUser}
              users={users}
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
              assessments={assessments}
              students={students}
              teachers={teachers}
              onBack={() => handleNavigate('home')}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onSaveAssessmentMarks={handleSaveAssessmentMarks}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          )}

          {currentScreen === 'student_report' && (
            <StudentReportScreen
              student={selectedStudent || students[0]}
              allStudents={students}
              teachers={teachers}
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
              students={students}
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
              teachers={teachers}
              onBack={() => handleNavigate('home')}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onOpenMarksEntry={(teachId, cls, sub) => handleOpenTeacherMarks(teachId, cls, sub)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              currentUser={currentUser}
              users={users}
              onLogAudit={handleLogAudit}
            />
          )}

          {currentScreen === 'import_export' && (
            <ImportExportScreen
              students={students}
              assessments={assessments}
              onBack={() => handleNavigate('home')}
              onOpenBulkUpload={() => setIsBulkUploadModalOpen(true)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              schoolInfo={schoolInfo}
              currentUser={currentUser}
              users={users}
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
              onNavigateToSubscriptions={() => handleNavigate('subscription')}
              onSave={handleUpdateSchoolProfile}
              onSaveTenantBranding={(updatedTenant) => {
                setTenants((prev) =>
                  prev.map((t) => (t.schoolId === updatedTenant.schoolId ? updatedTenant : t))
                );
                localStorage.setItem(
                  'jjsak_tenants',
                  JSON.stringify(
                    tenants.map((t) => (t.schoolId === updatedTenant.schoolId ? updatedTenant : t))
                  )
                );
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
              activeTenant={tenants.find((t) => t.schoolId === activeTenantId)}
              activeTenantId={activeTenantId}
              totalRegisteredLearners={students.length || 256}
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
              students={students}
              assessments={assessments}
              teachers={teachers}
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
                setTenants((prev) => [newT, ...prev]);
                localStorage.setItem('jjsak_tenants', JSON.stringify([newT, ...tenants]));
              }}
              onUpdateTenantStatus={(tId, st) => {
                setTenants((prev) =>
                  prev.map((t) => (t.schoolId === tId ? { ...t, status: st } : t))
                );
              }}
              onAddUser={(newU) => {
                if (currentUser?.role === 'SUPER_ADMIN') {
                  alert("Access Denied: The Platform Owner cannot onboard users or teachers under user accounts.");
                  return;
                }
                setUsers((prev) => [newU, ...prev]);
                localStorage.setItem('jjsak_users', JSON.stringify([newU, ...users]));
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
              students={students}
              assessments={assessments}
              teachers={teachers}
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
              onUpdateAssessment={(updatedAss: Assessment) => {
                setAssessments((prev) =>
                  prev.map((a) => (a.id === updatedAss.id ? updatedAss : a))
                );
              }}
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
              teachers={teachers}
              students={students}
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
              students={students}
              teachers={teachers}
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
              students={students}
              teachers={teachers}
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
                onAddSchool={(newSchool) => {
                  setTenants((prev) => [newSchool, ...prev]);
                  localStorage.setItem('jjsak_tenants', JSON.stringify([newSchool, ...tenants]));

                  // Auto-provision initial Head of Institution account in compliance with Part B, Rule §6
                  const initialHeadUser: User = {
                    id: `usr-${(newSchool.subdomain || newSchool.schoolCode).toLowerCase().replace(/[^a-z0-9]/g, '')}-head`,
                    schoolId: newSchool.schoolId,
                    fullName: newSchool.administratorDetails?.fullName || `Headteacher (${newSchool.schoolName})`,
                    username: `head.${(newSchool.subdomain || newSchool.schoolCode).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                    email: newSchool.administratorDetails?.emailAddress || newSchool.email || `head@${newSchool.subdomain || 'school'}.sc.ke`,
                    phoneNumber: newSchool.administratorDetails?.phoneNumber || newSchool.phone || '+254 722 000 111',
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

                  setUsers((prev) => {
                    const filtered = prev.filter((u) => u.id !== initialHeadUser.id);
                    const updated = [initialHeadUser, ...filtered];
                    localStorage.setItem('jjsak_users', JSON.stringify(updated));
                    return updated;
                  });

                  handleLogAudit('TENANT_CREATE', `Super Admin registered new school '${newSchool.schoolName}' [${newSchool.schoolCode}]. Initial Head of Institution account provisioned.`);
                  triggerSaveNotification(`✓ School '${newSchool.schoolName}' registered & Initial Head account provisioned`);
                }}
                onUpdateSchoolStatus={(schoolId, status) => {
                  setTenants((prev) =>
                    prev.map((t) => (t.schoolId === schoolId ? { ...t, status } : t))
                  );
                  handleLogAudit('SUBSCRIPTION_UPDATE', `Super Admin updated status of school ${schoolId} to ${status}.`);
                  triggerSaveNotification(`✓ School status set to ${status}`);
                }}
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
              students={students}
              currentUser={currentUser}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              attendanceRegisters={attendanceRegisters}
              onSaveAttendanceRegister={handleSaveAttendanceRegister}
              disciplineIncidents={disciplineIncidents}
              onAddDisciplineIncident={handleAddDisciplineIncident}
              onUpdateDisciplineIncident={handleUpdateDisciplineIncident}
              healthIncidents={healthIncidents}
              healthProfiles={healthProfiles}
              onAddHealthIncident={handleAddHealthIncident}
              onUpdateHealthProfile={handleUpdateHealthProfile}
              counselingSessions={counselingSessions}
              vulnerableLearners={vulnerableLearners}
              onAddCounselingSession={handleAddCounselingSession}
              onAddVulnerableLearner={handleAddVulnerableLearner}
              onUpdateVulnerableLearner={handleUpdateVulnerableLearner}
              transfersOut={transfersOut}
              transfersIn={transfersIn}
              graduations={graduations}
              onProcessTransferOut={handleProcessTransferOut}
              onProcessTransferIn={handleProcessTransferIn}
              onGraduateGrade9={handleGraduateGrade9}
              communications={communications}
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
        existingStudents={students}
        onUploadSuccess={(updatedStudents) => {
          setStudents(updatedStudents);
          setSchoolInfo((prev) => ({
            ...prev,
            totalStudents: updatedStudents.length,
          }));
          if (updatedStudents.length > 0) {
            setSelectedStudent(updatedStudents[0]);
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
        students={students}
        teachers={teachers}
        assessments={assessments}
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
        students={students}
        teachers={teachers}
        schoolInfo={schoolInfo}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onUpdateStudentsAttendance={(updates) => {
          setStudents((prev) =>
            prev.map((s) => {
              const match = updates.find((u) => u.id === s.id);
              return match ? { ...s, attendance: match.attendance } : s;
            })
          );
          triggerSaveNotification('✓ Attendance registers saved for all learners');
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
        students={students}
        teachers={teachers}
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
          users={users}
          onOpenFirstTimeActivation={() => setIsFirstTimeActivationModalOpen(true)}
        />
      )}

      {/* In-School First-Time Staff Activation Modal (Rule §6) */}
      <FirstTimeStaffActivationModal
        isOpen={isFirstTimeActivationModalOpen}
        users={users}
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
