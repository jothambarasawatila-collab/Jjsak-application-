import { SchoolTenant, User, JWTSession } from './index';

export type LaunchFlowStage =
  | 'STAGE_1_INITIALIZATION'
  | 'STAGE_2_NO_SCHOOL_REGISTERED'
  | 'STAGE_3_OWNER_LOGIN'
  | 'STAGE_3_OWNER_DASHBOARD'
  | 'STAGE_3_CREATE_SCHOOL'
  | 'STAGE_4_VERIFICATION_ACTIVATION'
  | 'STAGE_5_ORGANIZATIONAL_PROFILE'
  | 'STAGE_6_LOGIN_SCREEN'
  | 'STAGE_7_SECURITY_VALIDATION'
  | 'LAUNCH_COMPLETE';

export interface SecurityValidationCheck {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  status: 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED';
  errorMessage?: string;
}

export interface SecurityValidationResult {
  allPassed: boolean;
  checks: SecurityValidationCheck[];
  user?: User;
  school?: SchoolTenant;
  jwtSession?: JWTSession;
  failureReason?: string;
  remediationGuidance?: string;
}

export interface JJSAKProfileModule {
  id: string;
  title: string;
  description: string;
  category: 'Core' | 'Academics' | 'Administration' | 'Services' | 'Intelligence';
}

export const JJSAK_ORGANIZATIONAL_INFO = {
  systemName: 'JJSAK',
  officialMotto: 'Every Learner Matters, Every Achievement Counts.',
  about:
    'JJSAK is a secure, intelligent, scalable, and comprehensive educational management platform designed to support schools, administrators, teachers, learners, parents, and educational institutions through modern technology-driven solutions.',
  platformModules: [
    { title: 'School Administration', description: 'Institutional governance, multi-branch control & compliance.' },
    { title: 'Learner Management', description: 'End-to-end learner profiles, NEMIS/UPI tracking & welfare.' },
    { title: 'Staff Management', description: 'TSC appraisals, subject allocations & digital dossiers.' },
    { title: 'CBC/CBE Assessment Management', description: 'Formative & summative competency-based assessment recording.' },
    { title: 'Examination Management', description: 'Standardized exams, ranking algorithms & grading engines.' },
    { title: 'Timetable Management', description: 'Automated master scheduling & teacher workload optimization.' },
    { title: 'Finance Management', description: 'Fee billing, vote heads, M-Pesa reconciliation & receipts.' },
    { title: 'Communication Services', description: 'Automated SMS, push notices & parent portal broadcasts.' },
    { title: 'Reporting Services', description: 'KNEC-compliant CBC report cards, transcripts & analytics.' },
    { title: 'Analytics and Intelligence Services', description: 'Institutional KPI dashboards, subject trends & predictive metrics.' },
    { title: 'AI-Powered Educational Tools', description: 'Automated assessment generator & personalized learning pathways.' },
    { title: 'Multi-School Management', description: 'Tenant isolation, centralized multi-campus oversight.' },
    { title: 'Subscription and Billing Services', description: 'Termly licensing, automated token verification & audit logs.' },
  ],
  architectureNote: 'within a secure multi-tenant architecture.',
  vision: 'To become the most trusted educational management platform in the world.',
  mission: 'To empower schools through secure, innovative, and intelligent educational management solutions.',
  coreValues: [
    { name: 'Integrity', desc: 'Uncompromising honesty and ethical compliance in all academic data.' },
    { name: 'Accountability', desc: 'Complete transparency with immutable security and audit logging.' },
    { name: 'Innovation', desc: 'Continuous technology advancements powering intelligent school operations.' },
    { name: 'Excellence', desc: 'High-precision reporting, zero calculation defects, and gold-standard UX.' },
    { name: 'Security', desc: 'Bank-grade RBAC, AES/SHA encryption, multi-factor auth, and tenant isolation.' },
    { name: 'Inclusivity', desc: 'Special Needs Education (SNE) support and universal accessibility.' },
  ],
  founder: {
    name: 'Jotham Barasa Watila',
    title: 'Founder & Super Administrator / System Owner',
    email: 'jothambarasawatila@gmail.com',
    phone: '+254741478813 / +254100559811',
  },
  ruleP1_50: {
    code: 'RULE P1.50',
    title: 'MANDATORY SCHOOL REGISTRATION BEFORE USER ACCESS',
    statement:
      'No login screen shall be displayed until at least one school has been successfully registered, verified, approved, and activated by the System Owner/Super Administrator. Upon activation of a school, the system shall automatically display the official JJSAK Organizational Profile before presenting the login screen. Only users belonging to ACTIVE schools, possessing ACTIVE accounts, valid permissions, successful authentication credentials, and compliant security validation shall be granted access to the JJSAK platform.',
  },
};
