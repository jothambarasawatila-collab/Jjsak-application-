import { UserRole } from '../types';

export interface PreservedPermission {
  module: string;
  moduleCode: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  description: string;
}

export interface PreservedRoleDefinition {
  roleKey: UserRole | string;
  roleTitle: string;
  shortCode: string;
  category: 'EXECUTIVE_OWNER' | 'ADMINISTRATIVE_LEADERSHIP' | 'ACADEMIC_FACULTY' | 'OPERATIONS_FINANCE' | 'CLIENT_STAKEHOLDER';
  tierLevel: 1 | 2 | 3 | 4 | 5;
  isPreserved: boolean;
  protectionStatus: 'PRESERVED_SYSTEM_IMMUTABLE' | 'PRESERVED_INSTITUTIONAL_CORE' | 'PRESERVED_FACULTY_CORE' | 'PRESERVED_STAKEHOLDER';
  badgeColor: string;
  description: string;
  coreResponsibilities: string[];
  defaultAccessScope: 'GLOBAL_MULTI_TENANT' | 'SINGLE_INSTITUTION' | 'DEPARTMENT_ONLY' | 'CLASSROOM_ONLY' | 'PERSONAL_RECORDS';
  permissions: PreservedPermission[];
  securityProfile: {
    requiresMfa: boolean;
    sessionTimeoutMinutes: number;
    crossSchoolAccess: boolean;
    auditPurgeAuthority: boolean;
    canImpersonate: boolean;
    maxActiveSessions: number;
  };
}

export const PRESERVED_SYSTEM_ROLES: PreservedRoleDefinition[] = [
  {
    roleKey: 'SUPER_ADMIN',
    roleTitle: 'Super Administrator / System Owner',
    shortCode: 'OWNER-01',
    category: 'EXECUTIVE_OWNER',
    tierLevel: 1,
    isPreserved: true,
    protectionStatus: 'PRESERVED_SYSTEM_IMMUTABLE',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    description:
      'The supreme governing authority of the JJSAK platform. Holds root-level system privileges, multi-tenant school provisioning, license generation, security policy baseline enforcement, and immutable audit logs.',
    coreResponsibilities: [
      'Master Multi-Tenant School Provisioning, Verification & Lifecycle Activation (Rule P1.50)',
      'System-wide Role-Based Access Control (RBAC) Preservation & Permission Matrix Management',
      'Termly Subscription Licensing, Activation Key Management & Cryptographic Signing',
      'Root Security Policies, MFA Enforcement, Brute-Force Lockout Governance & Audit Log Verification',
      'Global Database Encryption Keys, Automated Disaster Recovery & Cryptographic Snapshots',
      'Direct Impersonation and Diagnostic Access to any Registered School Portal',
    ],
    defaultAccessScope: 'GLOBAL_MULTI_TENANT',
    permissions: [
      { module: 'School Registration & Tenants', moduleCode: 'MOD-TENANT', read: true, write: true, delete: true, approve: true, export: true, description: 'Full root control over all school registrations and activations.' },
      { module: 'Security Core & RBAC Roles', moduleCode: 'MOD-SEC', read: true, write: true, delete: true, approve: true, export: true, description: 'Preserved system roles, security baseline and authentication policies.' },
      { module: 'Learner Welfare & Academic Data', moduleCode: 'MOD-ACAD', read: true, write: true, delete: true, approve: true, export: true, description: 'Cross-tenant oversight of student records, exams, and CBC outcomes.' },
      { module: 'Staff Directory & Appraisals', moduleCode: 'MOD-STAFF', read: true, write: true, delete: true, approve: true, export: true, description: 'Institutional staff management, TSC dossier compliance and promotions.' },
      { module: 'Timetable & Scheduling Engine', moduleCode: 'MOD-TIME', read: true, write: true, delete: true, approve: true, export: true, description: 'Master AI scheduler, room utilization, and teacher workload configuration.' },
      { module: 'Finance, Billing & Subscriptions', moduleCode: 'MOD-FIN', read: true, write: true, delete: true, approve: true, export: true, description: 'Multi-school subscription billing, fee management and licensing keys.' },
      { module: 'Immutable Audit & Recovery', moduleCode: 'MOD-AUDIT', read: true, write: true, delete: false, approve: true, export: true, description: 'System-wide tamper-proof audit trail and disaster recovery snapshots.' },
    ],
    securityProfile: {
      requiresMfa: true,
      sessionTimeoutMinutes: 120,
      crossSchoolAccess: true,
      auditPurgeAuthority: true,
      canImpersonate: true,
      maxActiveSessions: 5,
    },
  },
  {
    roleKey: 'HEAD',
    roleTitle: 'Head of Institution / Principal',
    shortCode: 'EXEC-02',
    category: 'ADMINISTRATIVE_LEADERSHIP',
    tierLevel: 2,
    isPreserved: true,
    protectionStatus: 'PRESERVED_INSTITUTIONAL_CORE',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    description:
      'Chief executive authority of the registered school. Authorizes report cards, endorses staff appraisals, signs off academic results, manages institutional policies, and chairs BOM & academic committees.',
    coreResponsibilities: [
      'Official Endorsement and Digital Signing of CBC Assessment Report Cards & Transcripts',
      'Final Approval of Teacher Performance Appraisals (TPAD) & Institutional Allocations',
      'School Calendar, Term Dates, and Academic Structure Final Sign-off',
      'School Fee Structure Approvals and Budget Vote Head Oversight',
      'Institutional Transfer Authorizations (NEMIS/UPI clearance)',
      'Management of Permanent Deletion requests via Two-Person Authorization Protocol',
    ],
    defaultAccessScope: 'SINGLE_INSTITUTION',
    permissions: [
      { module: 'School Profile & Settings', moduleCode: 'MOD-TENANT', read: true, write: true, delete: false, approve: true, export: true, description: 'Manage institutional identity, motto, crest, and term configurations.' },
      { module: 'Learner Registration & Welfare', moduleCode: 'MOD-ACAD', read: true, write: true, delete: false, approve: true, export: true, description: 'Approve student enrollments, promotions, graduations, and transfers.' },
      { module: 'Assessments & Examinations', moduleCode: 'MOD-EXAM', read: true, write: true, delete: false, approve: true, export: true, description: 'Finalize summative exams, approve rankings, and publish report cards.' },
      { module: 'Staff Directory & Appraisals', moduleCode: 'MOD-STAFF', read: true, write: true, delete: false, approve: true, export: true, description: 'Conduct appraisals, assign designations, and approve promotions.' },
      { module: 'Timetable Scheduling', moduleCode: 'MOD-TIME', read: true, write: false, delete: false, approve: true, export: true, description: 'Approve and publish school master timetables and bell schedules.' },
      { module: 'Finance & Fee Statements', moduleCode: 'MOD-FIN', read: true, write: false, delete: false, approve: true, export: true, description: 'Inspect financial statements, fee collections, and bursary allocations.' },
      { module: 'Institutional Audit Logs', moduleCode: 'MOD-AUDIT', read: true, write: false, delete: false, approve: false, export: true, description: 'Monitor staff actions, marks modifications, and security incidents.' },
    ],
    securityProfile: {
      requiresMfa: true,
      sessionTimeoutMinutes: 60,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 3,
    },
  },
  {
    roleKey: 'DEPUTY',
    roleTitle: 'Deputy Head of Institution',
    shortCode: 'EXEC-03',
    category: 'ADMINISTRATIVE_LEADERSHIP',
    tierLevel: 2,
    isPreserved: true,
    protectionStatus: 'PRESERVED_INSTITUTIONAL_CORE',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    description:
      'Directs day-to-day operations, learner discipline, attendance monitoring, teacher supervision, daily routine management, and acts in the absence of the Principal.',
    coreResponsibilities: [
      'Daily School Operations, Bell Routine & Lesson Attendance Supervision',
      'Learner Discipline Record Management & Counseling Referrals',
      'Daily Teacher Substitution Approval and Duty Roster Oversight',
      'Class Attendance Register Verifications and Truancy Escalations',
      'Co-Curricular & Special Activity Scheduling',
    ],
    defaultAccessScope: 'SINGLE_INSTITUTION',
    permissions: [
      { module: 'Learner Welfare & Attendance', moduleCode: 'MOD-ACAD', read: true, write: true, delete: false, approve: true, export: true, description: 'Manage student discipline records, daily rolls, and guidance sessions.' },
      { module: 'Teacher Substitution & Roster', moduleCode: 'MOD-TIME', read: true, write: true, delete: false, approve: true, export: true, description: 'Assign emergency substitute teachers and monitor lesson compliance.' },
      { module: 'Assessment Marks & Deadlines', moduleCode: 'MOD-EXAM', read: true, write: true, delete: false, approve: false, export: true, description: 'Monitor marks entry deadlines and follow up on pending teacher submissions.' },
      { module: 'Communication Hub', moduleCode: 'MOD-COMM', read: true, write: true, delete: false, approve: true, export: true, description: 'Send official disciplinary notices and attendance SMS to parents.' },
    ],
    securityProfile: {
      requiresMfa: true,
      sessionTimeoutMinutes: 60,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 2,
    },
  },
  {
    roleKey: 'DIRECTOR_ACADEMICS',
    roleTitle: 'Director of Academics / Dean of Studies',
    shortCode: 'ACAD-04',
    category: 'ADMINISTRATIVE_LEADERSHIP',
    tierLevel: 2,
    isPreserved: true,
    protectionStatus: 'PRESERVED_INSTITUTIONAL_CORE',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    description:
      'Curriculum custodian, examination coordinator, timetable architect, and academic standard regulator ensuring full CBC/CBE curriculum compliance and pedagogical excellence.',
    coreResponsibilities: [
      'Master Timetable Generation, Optimization & Bell Schedule Architecture',
      'CBC Curriculum Strands, Learning Areas & Competency Rubric Configuration',
      'Examination Scheduling, Grade Weightings, and Score Conversion Rubrics',
      'Marks Submission Deadlines, Moderation & Academic Integrity Checks',
      'Learning Pathway Counseling (STEM, Social Sciences, Arts & Sports)',
    ],
    defaultAccessScope: 'SINGLE_INSTITUTION',
    permissions: [
      { module: 'Timetable & Scheduling Hub', moduleCode: 'MOD-TIME', read: true, write: true, delete: true, approve: true, export: true, description: 'Full authoring and optimization control over master and class schedules.' },
      { module: 'Academic Structure & Curriculum', moduleCode: 'MOD-STRUCT', read: true, write: true, delete: false, approve: true, export: true, description: 'Configure learning levels, grades, streams, and subject definitions.' },
      { module: 'Assessment Generator & Question Bank', moduleCode: 'MOD-AI', read: true, write: true, delete: true, approve: true, export: true, description: 'Generate CBC assessments, rubrics, and standardized marking guides.' },
      { module: 'Academic Analytics & Rankings', moduleCode: 'MOD-ANALYTICS', read: true, write: false, delete: false, approve: false, export: true, description: 'Analyze performance trends, subject disparities, and student trajectories.' },
    ],
    securityProfile: {
      requiresMfa: true,
      sessionTimeoutMinutes: 60,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 2,
    },
  },
  {
    roleKey: 'CLASS_TEACHER',
    roleTitle: 'Class Teacher / Form Tutor',
    shortCode: 'FAC-05',
    category: 'ACADEMIC_FACULTY',
    tierLevel: 3,
    isPreserved: true,
    protectionStatus: 'PRESERVED_FACULTY_CORE',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    description:
      'Primary pastoral and administrative mentor for an assigned class stream. Records attendance, compiles holistic report card remarks, tracks student welfare, and coordinates with parents.',
    coreResponsibilities: [
      'Daily Morning and Afternoon Class Register Attendance Logging',
      'Compiling and Personalizing Class Teacher Report Card Comments',
      'Monitoring Assigned Class Academic Progress, Rank, and Improvement Targets',
      'Logging Learner Health, Vulnerability, and Behavior Observations',
      'Parent-Teacher Consultation Coordination and Progress Review',
    ],
    defaultAccessScope: 'CLASSROOM_ONLY',
    permissions: [
      { module: 'Class Student Records', moduleCode: 'MOD-STUDENTS', read: true, write: true, delete: false, approve: false, export: true, description: 'Manage bio-data, parent contacts, and welfare records for assigned stream.' },
      { module: 'Report Card Compilation', moduleCode: 'MOD-REPORTS', read: true, write: true, delete: false, approve: false, export: true, description: 'Draft comments and generate individual/batch reports for assigned class.' },
      { module: 'Attendance Registers', moduleCode: 'MOD-ATTEND', read: true, write: true, delete: false, approve: false, export: true, description: 'Mark and submit daily session rolls and record absent justifications.' },
      { module: 'Communication Dispatch', moduleCode: 'MOD-COMM', read: true, write: true, delete: false, approve: false, export: false, description: 'Send targeted class announcements and welfare updates to parents.' },
    ],
    securityProfile: {
      requiresMfa: false,
      sessionTimeoutMinutes: 45,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 2,
    },
  },
  {
    roleKey: 'TEACHER',
    roleTitle: 'Subject Teacher',
    shortCode: 'FAC-06',
    category: 'ACADEMIC_FACULTY',
    tierLevel: 3,
    isPreserved: true,
    protectionStatus: 'PRESERVED_FACULTY_CORE',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    description:
      'Delivers curriculum instruction for assigned subjects, captures formative continuous assessments and summative exam scores, and tracks student competency levels.',
    coreResponsibilities: [
      'Entering and Modifying Formative & Summative Assessment Scores Before Deadlines',
      'Providing Subject-Specific Performance Remarks and Remediation Notes',
      'Personal Timetable and Lesson Schedule Execution',
      'Generating CBC Lesson Plans, Rubrics, and Practice Exercises',
    ],
    defaultAccessScope: 'CLASSROOM_ONLY',
    permissions: [
      { module: 'Marks Entry Hub', moduleCode: 'MOD-MARKS', read: true, write: true, delete: false, approve: false, export: true, description: 'Enter, edit, and submit scores for allocated subject-class combinations.' },
      { module: 'Teacher Schedule & Timetable', moduleCode: 'MOD-TIME', read: true, write: false, delete: false, approve: false, export: true, description: 'View weekly teaching timetable, room assignments, and duty rosters.' },
      { module: 'Assessment Generator', moduleCode: 'MOD-AI', read: true, write: true, delete: false, approve: false, export: true, description: 'Create AI-assisted tests, quizzes, and rubrics for assigned subjects.' },
    ],
    securityProfile: {
      requiresMfa: false,
      sessionTimeoutMinutes: 45,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 2,
    },
  },
  {
    roleKey: 'FINANCE',
    roleTitle: 'Finance Officer / Bursar',
    shortCode: 'OPS-07',
    category: 'OPERATIONS_FINANCE',
    tierLevel: 3,
    isPreserved: true,
    protectionStatus: 'PRESERVED_INSTITUTIONAL_CORE',
    badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
    description:
      'Oversees fee structures, student fee invoicing, payment receipts, M-Pesa payment reconciliations, vote head allocations, and financial clearance certificates.',
    coreResponsibilities: [
      'Termly Student Fee Invoicing and Vote Head Allocation',
      'Recording Payments (Cash, Bank Slip, M-Pesa, Cheque) & Issuing Official Receipts',
      'Generating Student Fee Statements and Clearance Slips for Exams/Transfers',
      'Automated SMS Fee Reminders to Parents and Outstanding Balances Tracking',
    ],
    defaultAccessScope: 'SINGLE_INSTITUTION',
    permissions: [
      { module: 'Fee Billing & Collections', moduleCode: 'MOD-FIN', read: true, write: true, delete: false, approve: true, export: true, description: 'Post payments, reconcile statements, and manage school vote heads.' },
      { module: 'Student Financial Clearance', moduleCode: 'MOD-STUDENTS', read: true, write: true, delete: false, approve: false, export: true, description: 'Set financial clearance flags on learner records for report releases.' },
      { module: 'Financial Reports & Audits', moduleCode: 'MOD-REPORTS', read: true, write: false, delete: false, approve: false, export: true, description: 'Export termly revenue summaries, debtor lists, and audit journals.' },
    ],
    securityProfile: {
      requiresMfa: true,
      sessionTimeoutMinutes: 45,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 2,
    },
  },
  {
    roleKey: 'PARENT',
    roleTitle: 'Parent / Guardian',
    shortCode: 'STK-08',
    category: 'CLIENT_STAKEHOLDER',
    tierLevel: 4,
    isPreserved: true,
    protectionStatus: 'PRESERVED_STAKEHOLDER',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    description:
      'External stakeholder portal for parents and guardians. Provides real-time visibility of student report cards, attendance records, fee statements, and school announcements.',
    coreResponsibilities: [
      'Reviewing Ward Academic Performance, Grade Transcripts & Formative Rubrics',
      'Tracking Real-Time Attendance, Punctuality, and Welfare Notifications',
      'Viewing Fee Statements, Payment References & Making Direct M-Pesa Payments',
      'Direct Communication with Class Teacher and School Administration',
    ],
    defaultAccessScope: 'PERSONAL_RECORDS',
    permissions: [
      { module: 'Ward Academic Profile', moduleCode: 'MOD-PORTAL', read: true, write: false, delete: false, approve: false, export: true, description: 'Access report cards, assessment transcripts, and teacher comments.' },
      { module: 'Ward Fee Statement', moduleCode: 'MOD-FIN', read: true, write: false, delete: false, approve: false, export: true, description: 'View current fee balance, past payment receipts, and bank instructions.' },
      { module: 'School Announcements', moduleCode: 'MOD-COMM', read: true, write: false, delete: false, approve: false, export: false, description: 'Read circulars, newsletters, and academic calendar dates.' },
    ],
    securityProfile: {
      requiresMfa: false,
      sessionTimeoutMinutes: 30,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 3,
    },
  },
  {
    roleKey: 'STUDENT',
    roleTitle: 'Learner / Student',
    shortCode: 'STK-09',
    category: 'CLIENT_STAKEHOLDER',
    tierLevel: 5,
    isPreserved: true,
    protectionStatus: 'PRESERVED_STAKEHOLDER',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    description:
      'Learner academic portal. Enables students to view their class timetable, review assessment feedback, practice CBC exercises, and explore senior school pathway recommendations.',
    coreResponsibilities: [
      'Accessing Daily Class Lesson Timetable and Room Locations',
      'Reviewing Subject Performance Feedback and Competency Badges',
      'Exploring CBC Senior School Pathway Matches (STEM, Arts, Social Sciences)',
      'Completing Self-Assessments and AI Learning Challenges',
    ],
    defaultAccessScope: 'PERSONAL_RECORDS',
    permissions: [
      { module: 'Learner Academic Portal', moduleCode: 'MOD-LEARNER', read: true, write: false, delete: false, approve: false, export: true, description: 'Inspect grades, position, and individual subject rubrics.' },
      { module: 'Timetable & Schedule', moduleCode: 'MOD-TIME', read: true, write: false, delete: false, approve: false, export: false, description: 'View weekly class timetable and school activity schedules.' },
      { module: 'Pathway Finder', moduleCode: 'MOD-PATHWAY', read: true, write: true, delete: false, approve: false, export: true, description: 'Take CBC career pathway assessments and view recommended tracks.' },
    ],
    securityProfile: {
      requiresMfa: false,
      sessionTimeoutMinutes: 30,
      crossSchoolAccess: false,
      auditPurgeAuthority: false,
      canImpersonate: false,
      maxActiveSessions: 1,
    },
  },
];
