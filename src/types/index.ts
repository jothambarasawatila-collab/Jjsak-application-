export interface SubjectPerformance {
  subject: string;
  score: number | null;
  grade: string;
  remarks: string;
  teacherInitials?: string;
  teacherName?: string;
}

export interface ParentContact {
  id?: string;
  name: string;
  phoneNumber: string;
  relation?: string; // e.g. "Father", "Mother", "Guardian"
}

// Full Learner Entity as specified
export interface Learner {
  learnerId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: string; // "Male" | "Female"
  dateOfBirth: string;
  grade: string;
  stream: string;
  classTeacher: string;
  enrollmentDate: string;
  status: 'Active' | 'Transferred' | 'Inactive';
}

// Full Parent / Guardian Entity as specified
export interface ParentInformation {
  parentId: string;
  learnerId: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  relationship: string;
  phoneNumber1: string;
  phoneNumber2: string;
  email: string;
  nationalId: string;
  occupation: string;
  homeAddress: string;
  emergencyContact: string;
  emergencyPhone: string;
  enteredBy: string; // Teacher/Admin
  entryDate: string;
}

export interface Student {
  id: string;
  schoolId?: string;
  admNo: string;
  upi?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  grade: string;
  classArm: string;
  stream?: string;
  term: string;
  year: number;
  avatarInitials: string;
  photoUrl?: string;
  avgScore: number | null;
  overallGrade: string;
  position: string;
  streamPosition?: string;
  gradePosition?: string;
  streamRank?: number | null;
  gradeRank?: number | null;
  attendance: number;
  subjects: SubjectPerformance[];
  classTeacherComment: string;
  classTeacherName: string;
  headTeacherComment?: string;
  headOfInstitutionComment?: string;
  headOfSchoolName: string;
  headOfInstitutionName?: string;
  nextTermDate: string;
  parentName?: string;
  parentPhone?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  parentRelationship?: string;
  parentPhone1?: string;
  parentPhone2?: string;
  parentEmail?: string;
  parentNationalId?: string;
  parentOccupation?: string;
  homeAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  parents?: ParentContact[];
  parentInfo?: ParentInformation;
  enrollmentDate?: string;
  nationality?: string;
  status?: 'Active' | 'Pending Verification' | 'Rejected' | 'Transferred' | 'Inactive' | string;
  approvalStatus?: 'Active' | 'Pending Verification' | 'Rejected' | string;
  registeredByTeacherId?: string;
  registeredByTeacherName?: string;
  approvedByDirectorName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  enrollmentStatus?: import('./learnerWelfare').LearnerEnrollmentStatus;
  healthProfile?: import('./learnerWelfare').LearnerHealthProfile;
  vulnerability?: import('./learnerWelfare').VulnerableLearnerRecord;
  specialNeeds?: import('./academic').SpecialNeedsInfo;
  transferInfo?: import('./academic').TransferInfo;
  performanceHistory?: import('./academic').LearnerPerformanceHistoryItem[];
  behaviorRecords?: import('./academic').BehaviorRecord[];
  isArchived?: boolean;
  promotionStatus?: 'Promoted' | 'Retained' | 'Graduated' | 'Normal';
}

export interface Assessment {
  id: string;
  schoolId?: string;
  name: string;
  className: string;
  term: string;
  year?: number;
  subject: string;
  assessmentType: string;
  totalMarks: number;
  date: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Submitted' | 'Approved' | 'Returned for Correction' | 'Locked' | string;
  recordedScoresCount?: number;
  totalStudentsCount?: number;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  submittedAt?: string;
  submittedBy?: string;
  submittedByTeacherName?: string;
  approvedBy?: string;
  approvedByDirectorName?: string;
  approvedAt?: string;
  approvalStatus?: 'Draft' | 'Submitted' | 'Approved' | 'Returned for Correction' | 'Locked' | 'Published' | string;
  returnReason?: string;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  isFinalized?: boolean;
  finalizedBy?: string;
  finalizedAt?: string;
  deadlineId?: string;
  integrityHash?: string;
}

export interface TeacherClassAllocation {
  className: string;
  subjects: string[];
}

export type StaffDesignation =
  | 'Head of Institution'
  | 'Deputy Head'
  | 'Director of Academics'
  | 'Registrar'
  | 'Teacher'
  | 'ICT Administrator'
  | 'Bursar'
  | 'System Administrator'
  | 'Senior Teacher'
  | 'Class Teacher'
  | 'Subject Teacher'
  | 'Head of Department'
  | string;

export type StaffDepartment =
  | 'Languages'
  | 'Sciences'
  | 'Mathematics'
  | 'Humanities'
  | 'Technical & Applied'
  | 'Creative Arts & Sports'
  | 'Administration'
  | 'Guidance & Counseling'
  | 'Finance'
  | 'ICT & Computing'
  | string;

export type EmploymentStatus =
  | 'Permanent & Pensionable'
  | 'Contract'
  | 'BOM'
  | 'Intern'
  | 'Probation';

export type StaffAccountStatus =
  | 'REGISTERED_FIRST_LOGIN_REQUIRED'
  | 'REGISTERED'
  | 'VALIDATED'
  | 'APPROVED'
  | 'PROVISIONED'
  | 'INVITED'
  | 'ACTIVE'
  | 'PASSWORD_RESET_PENDING'
  | 'LOCKED'
  | 'DISABLED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export interface StaffEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AcademicQualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  gradeOrClass?: string;
  verified: boolean;
}

export interface ProfessionalQualification {
  id: string;
  title: string;
  body: string;
  regNumber?: string;
  year: number;
  status: 'Verified' | 'Pending' | 'Expired';
}

export interface ProfessionalCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  validUntil?: string;
  verified: boolean;
}

export interface ProfessionalDevelopmentRecord {
  id: string;
  moduleName: string;
  provider: string; // e.g. "KICD / CEMASTEA", "KEMI"
  completionDate: string;
  cpdPoints: number;
  certificateId?: string;
}

export interface TrainingHistoryItem {
  id: string;
  workshopTitle: string;
  organizer: string;
  dates: string;
  venueOrPlatform: string;
}

export interface StaffSupportingDocument {
  id: string;
  type:
    | 'Passport Photo'
    | 'National ID Copy'
    | 'Academic Certificate'
    | 'Professional Certificate'
    | 'Appointment Letter'
    | 'Other Approved Document';
  title: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  verificationStatus: 'Verified' | 'Pending' | 'Flagged';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface StaffAppraisalRecord {
  id: string;
  term: string;
  year: number;
  overallRating: 'Exceeding Targets' | 'Meeting Targets' | 'Approaching Targets' | 'Developing';
  scorePercentage: number;
  appraiserName: string;
  appraiserRole: string;
  appraisalDate: string;
  targetsSet: string;
  competencyScores: {
    curriculumDelivery: number;
    assessmentRubrics: number;
    learnerProgress: number;
    ictIntegration: number;
    professionalEthics: number;
  };
  recommendations: string;
  teacherComments?: string;
  status: 'Completed' | 'Pending Review';
}

export interface TeachingWorkloadRecord {
  lessonsPerWeek: number;
  standardTarget: number; // e.g. 27
  status: 'Optimal' | 'Overloaded' | 'Underloaded';
  totalClassesAssigned: number;
  totalStudentsReached: number;
  notes?: string;
}

export interface StaffPromotionRecord {
  id: string;
  fromDesignation: string;
  toDesignation: string;
  effectiveDate: string;
  approvedBy: string;
  referenceNumber: string;
  notes?: string;
}

export interface StaffAwardRecord {
  id: string;
  awardTitle: string;
  awardedBy: string;
  year: number;
  category: string;
  description: string;
}

export interface Teacher {
  id: string;
  schoolId?: string;
  name: string;
  email: string;
  role: string;
  classes: string[];
  subjects: string[];
  allocations?: TeacherClassAllocation[];
  avatarHex: string;
  employeeNumber?: string;
  tscNumber?: string;
  qualification?: string;
  phoneNumber?: string;
  photoUrl?: string;
  active?: boolean;

  // PHASE 4 — Personal Information
  nationalId?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  physicalAddress?: string;
  emergencyContact?: StaffEmergencyContact;

  // PHASE 4 — Employment Information
  staffNumber?: string;
  dateOfEmployment?: string;
  designation?: StaffDesignation;
  department?: StaffDepartment;
  employmentStatus?: EmploymentStatus;
  reportingOfficer?: string;

  // PHASE 4 — Academic & Professional Information
  academicQualifications?: AcademicQualification[];
  professionalQualifications?: ProfessionalQualification[];
  teachingSubjects?: string[];
  teachingLevels?: string[];
  professionalCertifications?: ProfessionalCertification[];
  professionalDevelopmentRecords?: ProfessionalDevelopmentRecord[];
  trainingHistory?: TrainingHistoryItem[];

  // PHASE 4 — Supporting Documents
  supportingDocuments?: StaffSupportingDocument[];

  // PHASE 4 — Account & Security Lifecycle
  accountStatus?: StaffAccountStatus;
  userId?: string;
  mfaEnabled?: boolean;
  mfaMethod?: 'SMS_OTP' | 'EMAIL_OTP' | 'AUTHENTICATOR_APP';
  activationInvitationSentAt?: string;
  activationToken?: string;
  passwordCreated?: boolean;
  lastLogin?: number;

  // PHASE 4 — Professional Records Management
  appraisals?: StaffAppraisalRecord[];
  workload?: TeachingWorkloadRecord;
  promotions?: StaffPromotionRecord[];
  awards?: StaffAwardRecord[];
  departmentAssignments?: string[];
}

export interface SchoolInfo {
  name: string;
  motto: string;
  term: string;
  year: number;
  termStartDate?: string;
  termEndDate?: string;
  headTeacher?: string;
  headOfInstitution: string;
  logoInitial: string;
  nextTermOpenDate: string;
  totalStudents: number;
  totalClasses: number;
  totalAssessments: number;
  avgPerformance: number;
  address?: string;
  phone?: string;
  email?: string;
}

// School Profile model
export interface SchoolProfile {
  schoolId: string;
  schoolName: string;
  motto: string;
  county: string;
  subCounty: string;
  postalAddress: string;
  phoneNumber: string;
  emailAddress: string;
  website: string;
  headTeacherName: string;
  schoolLogoUri: string;
  schoolStampUri: string;
  lastUpdated: number;
}

// School Subscription & Licensing Models
export interface SchoolSubscription {
  installationDate: number;
  trialEndDate: number;
  subscriptionEndDate: number | null;
  active: boolean;
  schoolName?: string;
  paymentReference?: string;
  activatedBy?: string;
}

export interface SubscriptionActivation {
  schoolName: string;
  paymentReference: string;
  activationDate: number;
  activatedBy: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HEAD_OF_INSTITUTION'
  | 'DEPUTY_HEAD_OF_INSTITUTION'
  | 'DIRECTOR_OF_ACADEMICS'
  | 'HEAD'
  | 'DEPUTY'
  | 'DIRECTOR_ACADEMICS'
  | 'TEACHER'
  | 'CLASS_TEACHER'
  | 'SUBJECT_TEACHER'
  | 'FINANCE'
  | 'PARENT'
  | 'STUDENT'
  | 'ADMIN'
  | 'SYSTEM_ADMIN'
  | 'HEADTEACHER'
  | 'DEPUTY_HEADTEACHER';

export * from './roleGovernance';

export type MfaMethod = 'EMAIL_OTP' | 'SMS_OTP' | 'AUTHENTICATOR_APP';

export type SchoolStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export type UserActivationStatus =
  | 'REGISTERED_FIRST_LOGIN_REQUIRED'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'PASSWORD_RESET_PENDING'
  | 'LOCKED'
  | 'DISABLED'
  | 'SUSPENDED';

export interface SchoolAdministratorDetails {
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  emailAddress: string;
}

export type PortalThemePreset =
  | 'blue' // School A – Blue Theme
  | 'green' // School B – Green Theme
  | 'purple' // School C – Purple Theme
  | 'maroon' // School D – Maroon Theme
  | 'orange' // School E – Orange Theme
  | 'teal' // Oceanic Teal Theme
  | 'navy' // Midnight Navy / Slate Theme
  | 'crimson' // Ruby / Crimson Theme
  | 'amber' // Golden Amber Theme
  | 'custom';

export interface SchoolBannerConfig {
  welcomeBannerText?: string;
  mottoBannerText?: string;
  visionBannerText?: string;
  missionBannerText?: string;
  bannerStyle?: 'gradient' | 'solid' | 'pattern' | 'modern';
  bannerImageUrl?: string;
  showWelcomeBanner?: boolean;
  showMottoBanner?: boolean;
  showVisionBanner?: boolean;
}

export interface SchoolBrandingDetails {
  themePreset?: PortalThemePreset;
  primaryColor?: string; // e.g. #1E40AF, #065F46, #581C87, #881337, #9A3412
  secondaryColor?: string; // e.g. #3B82F6, #10B981, #8B5CF6, #E11D48, #EA580C
  backgroundColor?: string; // Portal background color e.g. #F0F4FF, #F0FDF4, #FAF5FF, #FFF1F2, #FFF7ED, #F8FAFC
  cardColorStyle?: 'clean-white' | 'tinted' | 'bordered' | 'contrast';
  navMenuColorStyle?: 'theme-matched' | 'midnight-slate' | 'deep-solid' | 'minimal-white';
  headerColorStyle?: 'gradient' | 'solid' | 'clean-light' | 'dark-institutional';
  footerColorStyle?: 'neutral' | 'brand-accent' | 'minimal';
  buttonColorStyle?: 'brand-primary' | 'brand-gradient' | 'dark-contrast';
  
  logoUrl?: string;
  stampUrl?: string;
  
  motto: string;
  vision?: string;
  mission?: string;
  coreValues?: string[];
  
  banners?: SchoolBannerConfig;
  
  // Auditing & Super Admin compliance
  lastModifiedBy?: string;
  lastModifiedRole?: string;
  lastModifiedAt?: number;
  isApprovedBySuperAdmin?: boolean;
}

export interface SchoolTenant {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  subdomain?: string; // e.g. 'institution', 'academy', 'campus'
  tenantDomain?: string; // e.g. 'institution.jjsak.com'
  category: 'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED' | 'OTHER';
  schoolType?: 'Public' | 'Private' | 'Faith-Based' | 'International' | 'Community' | string;
  registrationNumber?: string;
  educationLevel?: string;
  country?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
  physicalAddress?: string;
  postalAddress?: string;
  address: string;
  officialEmail?: string;
  email: string;
  officialPhone?: string;
  phone: string;
  website?: string;
  administratorDetails?: SchoolAdministratorDetails;
  schoolBranding?: SchoolBrandingDetails;
  logoUrl?: string;
  stampUrl?: string;
  motto?: string;
  status: SchoolStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  activatedAt?: string;
  activatedBy?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  schoolId?: string;
  username: string;
  fullName: string;
  email?: string;
  password?: string;
  role: UserRole;
  // Learner Account-to-Profile Permanent Relationship (JJSAK Core Section 2)
  learnerId?: string;
  admissionNumber?: string;
  // Parent Account-to-Learner Relationship
  parentId?: string;
  nationalId?: string;
  tscNumber?: string;
  designation?: string;
  employeeNumber?: string;
  phoneNumber?: string;
  active: boolean;
  activationStatus?: UserActivationStatus;
  activatedAt?: string | number;
  activatedBy?: string;
  tempOtp?: string;
  otpExpiry?: number;
  termsAccepted?: boolean;
  invitationSentAt?: number;
  invitationMethod?: 'SMS' | 'EMAIL' | 'BOTH';
  mfaEnabled?: boolean;
  mfaMethod?: MfaMethod;
  failedAttempts?: number;
  lockedUntil?: number | null;
  lastLogin?: number;
  lastPasswordChange?: number;
  forcePasswordReset?: boolean;
  firstLoginCompleted?: boolean;
  resendCount?: number;
  lastResendAt?: number;
  failedOtpAttempts?: number;
  previousActivationStatus?: UserActivationStatus;
  passwordResetCode?: string;
  passwordResetExpiry?: number;
  passwordResetAttempts?: number;
  contactUpdatePending?: {
    type: 'EMAIL' | 'PHONE' | 'BOTH';
    newEmail?: string;
    newPhone?: string;
    verificationCode?: string;
    expiresAt?: number;
    requestedAt: number;
    requestedBy: string;
  };
  lockoutReason?: string;
  // JJSAK-AUTHZ-GOV-002: Multi-Role User Architecture & Assignment-Based Scope (§10-13)
  roles?: UserRole[];
  assignedSubjects?: string[];
  assignedClasses?: string[];
  assignedStreams?: string[];
  teachingResponsibilities?: string[];
  academicYearScope?: number;
  termScope?: string;
  registrationStatus?: 'PENDING' | 'INVITED' | 'NOT_ACTIVATED' | 'ACTIVE' | 'SUSPENDED';
}

export interface JWTSession {
  token: string;
  header: { alg: string; typ: string };
  payload: {
    sub: string;
    username: string;
    fullName: string;
    schoolId: string;
    schoolName?: string;
    role: UserRole;
    learnerId?: string;
    admissionNumber?: string;
    parentId?: string;
    permissions: string[];
    iat: number;
    exp: number;
    jti: string;
    mfaVerified: boolean;
    mfaMethod?: MfaMethod;
    ipAddress: string;
  };
  signature: string;
}

export interface RecycleBinItem {
  id: string;
  schoolId: string;
  itemType: 'Learner Record' | 'Assessment Record' | 'Teacher Profile' | 'Report Card Draft' | 'Grading Scheme';
  itemTitle: string;
  deletedBy: string;
  deletedByRole: UserRole;
  deletedAt: number;
  purgeDeadline: number; // 30 days after deletion
  reason: string;
  originalData: any;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'RECORD_CREATE'
  | 'RECORD_EDIT'
  | 'RECORD_DELETE'
  | 'RECORD_RESTORE'
  | 'PERMANENT_PURGE'
  | 'MARKS_SUBMIT'
  | 'DEADLINE_CREATE'
  | 'REPORT_GENERATE'
  | 'BULK_REPORT_GENERATE'
  | 'USER_MANAGE'
  | 'PASSWORD_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'TENANT_CREATE'
  | 'TENANT_SWITCH'
  | 'BACKUP_CREATED'
  | 'BACKUP_RESTORED'
  | 'SUBSCRIPTION_UPDATE'
  | 'SECURITY_ALERT_DISMISS'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'UNAUTHORIZED_SCHOOL_ACCESS_ATTEMPT'
  | 'TENANT_BOUNDARY_VIOLATION'
  | 'CROSS_SCHOOL_ACCESS_DENIED'
  | 'SYSTEM_EVENT'
  | 'STAFF_REGISTERED'
  | 'STAFF_VERIFIED'
  | 'STAFF_APPROVED'
  | 'STAFF_ROLE_ASSIGNED'
  | 'STAFF_ACCOUNT_PROVISIONED'
  | 'STAFF_ACTIVATION_INVITE'
  | 'STAFF_PASSWORD_SET'
  | 'STAFF_SUSPENDED'
  | 'STAFF_ACTIVATED'
  | 'STAFF_APPRAISAL_LOGGED'
  | 'LEARNER_TRANSFER'
  | 'LEARNER_PROMOTE'
  | 'ACADEMIC_YEAR_ARCHIVE'
  | 'ACADEMIC_YEAR_RESTORE'
  | 'EXAM_FINALIZED'
  | 'EXAM_UNFINALIZED'
  | 'DEADLINE_EXTENDED'
  | 'BEHAVIOR_RECORD_LOGGED'
  | 'GRADING_SCHEME_UPDATED'
  | 'OCR_MARKS_EXTRACTED'
  | 'ACADEMIC_REPORT_GENERATED'
  | 'ACADEMIC_REPORT_PRINTED'
  | 'ACADEMIC_REPORT_EXPORTED'
  | 'ACADEMIC_REPORT_PUBLISHED'
  | 'ACADEMIC_REPORT_DISTRIBUTED'
  | 'ASSESSMENT_SUBMITTED'
  | 'ASSESSMENT_APPROVED'
  | 'ASSESSMENT_RETURNED'
  | 'ASSESSMENT_LOCKED'
  | 'ASSESSMENT_REOPENED'
  | 'LEARNER_REGISTERED'
  | 'LEARNER_APPROVED'
  | 'LEARNER_REJECTED'
  | 'ACADEMIC_OPERATION_CREATED'
  | 'ACADEMIC_OPERATION_MODIFIED'
  | 'ACADEMIC_OPERATION_DELETED'
  | 'TIMETABLE_GENERATE'
  | 'TIMETABLE_EDIT'
  | 'TIMETABLE_PUBLISH'
  | 'TIMETABLE_APPROVE'
  | 'TIMETABLE_ARCHIVE'
  | 'TIMETABLE_PERIOD_CONFIG'
  | 'TIMETABLE_SUBSTITUTION'
  | 'EXAM_TIMETABLE_CREATE'
  | 'EXAM_TIMETABLE_EDIT'
  | 'EXAM_TIMETABLE_DELETE'
  | 'EXAM_TIMETABLE_PUBLISH'
  | 'UNAUTHORIZED_TIMETABLE_ATTEMPT'
  | 'DUAL_IDENTITY_SWITCH_TO_SCHOOL'
  | 'DUAL_IDENTITY_SWITCH_TO_OWNER'
  | 'DATA_BOUNDARY_BLOCKED'
  | 'EMERGENCY_ACCESS_INITIATED'
  | 'EMERGENCY_ACCESS_APPROVED'
  | 'EMERGENCY_ACCESS_TERMINATED'
  | 'EXCEPTION_REQUESTED'
  | 'EXCEPTION_APPROVED'
  | 'EXCEPTION_REVOKED';

export interface AuditLogEntry {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: AuditActionType;
  details: string;
  timestamp: number;
  ipAddress?: string;
  deviceInfo?: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'BRUTE_FORCE' | 'PERMISSION_ELEVATION' | 'UNUSUAL_EXPORT' | 'FAILED_LOGIN_THRESHOLD' | 'UNAUTHORIZED_ACCESS';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: number;
  ipAddress: string;
  resolved: boolean;
}

export interface BackupRecord {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MANUAL';
  timestamp: number;
  sizeBytes: number;
  recordCount: number;
  checksumSha256: string;
  encryptionAlgorithm: string; // "AES-256-GCM"
  status: 'COMPLETED' | 'VERIFIED' | 'RESTORED';
}

export interface ComplianceItem {
  id: string;
  category: 'KDPA_2019' | 'MOE_CBC' | 'ASSESSMENT_REGS' | 'JJSAK_STANDARDS';
  ruleCode: string;
  title: string;
  requirement: string;
  status: 'COMPLIANT' | 'VERIFIED';
  lastAudited: string;
}

export interface APISecurityStats {
  totalRequestsToday: number;
  blockedRequests: number;
  rateLimitHits: number;
  activeTokensCount: number;
  sslTlsVersion: string;
  encryptionAtRest: string;
}

export interface PermanentDeletionModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType: string;
  currentUserRole: UserRole;
  currentUserName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export type DashboardRole = 'admin' | 'teacher' | 'learner' | 'parent';

export type ActiveScreen =
  | 'splash'
  | 'home'
  | 'students'
  | 'assessments'
  | 'student_report'
  | 'teachers'
  | 'import_export'
  | 'settings'
  | 'analytics'
  | 'pathways'
  | 'timetabling'
  | 'assessment_generator'
  | 'school_profile'
  | 'subscription'
  | 'security_core'
  | 'owner_console'
  | 'owner_dashboard'
  | 'reports_hub'
  | 'master_architecture'
  | 'data_entry_hub'
  | 'communication_hub'
  | 'academic_hub'
  | 'academic_structure_hub'
  | 'learner_welfare_hub'
  | 'learner_registration_hub';

export * from './ownerGovernance';
export * from './timetable';
export * from './assessmentGenerator';
export * from './academic';
export * from './learnerWelfare';
export * from './academicStructure';
export * from './reporting';
export * from './learnerRegistration';
export * from './learnerPortal';

export type BottomNavTab = 'home' | 'students' | 'assessments' | 'reports' | 'analytics' | 'more';
