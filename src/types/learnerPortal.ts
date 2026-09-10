import { SubjectPerformance } from './index';

export type LearnerReconciliationStatus =
  | 'LINKED'
  | 'UNLINKED_ACCOUNT'
  | 'UNLINKED_PROFILE'
  | 'INVALID_LINK'
  | 'WRONG_TENANT'
  | 'DUPLICATE';

export interface LearnerReconciliationRecord {
  id: string; // unique key (user id or student id)
  status: LearnerReconciliationStatus;
  statusLabel: string;
  account?: {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    schoolId?: string;
    active: boolean;
    learnerId?: string;
    admissionNumber?: string;
  };
  profile?: {
    id: string;
    admNo: string;
    name: string;
    grade: string;
    classArm: string;
    schoolId?: string;
    status?: string;
    parentName?: string;
  };
  issueDescription: string;
  suggestedAction: string;
}

export interface LearnerTimetablePeriod {
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isDouble?: boolean;
}

export interface LearnerAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  score?: number;
  maxScore?: number;
  instructions: string;
}

export interface LearnerAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'ACADEMIC' | 'GENERAL' | 'CO_CURRICULAR' | 'EXAM';
  priority: 'NORMAL' | 'HIGH';
}

export interface LearnerNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface LearnerReportDocument {
  id: string;
  title: string;
  term: string;
  year: number;
  downloadable: boolean;
  generatedAt: string;
}

export interface LearnerPortalData {
  profile: {
    learnerId: string;
    admissionNumber: string;
    name: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    grade: string;
    classArm: string;
    stream?: string;
    schoolId: string;
    schoolName: string;
    avatarInitials: string;
    photoUrl?: string;
    term: string;
    year: number;
    upi?: string;
    enrollmentDate?: string;
    status: string;
    classTeacherName: string;
    classTeacherComment?: string;
    headTeacherComment?: string;
    headOfSchoolName?: string;
  };
  assignedTeachers: Array<{
    id: string;
    name: string;
    subject: string;
    role: string;
    email?: string;
  }>;
  attendance: {
    overallPercentage: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    status: 'EXCELLENT' | 'GOOD' | 'ATTENTION_NEEDED';
    weeklyBreakdown: Array<{ day: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>;
  };
  academicResults: {
    avgScore: number | null;
    overallGrade: string;
    position: string;
    streamPosition: string;
    gradePosition: string;
    streamRank?: number | null;
    gradeRank?: number | null;
    subjects: SubjectPerformance[];
    termSummary?: string;
  };
  timetable: {
    daySchedule: LearnerTimetablePeriod[];
    todayDay: string;
    totalPeriodsToday: number;
  };
  assignments: LearnerAssignment[];
  announcements: LearnerAnnouncement[];
  notifications: LearnerNotification[];
  reports: LearnerReportDocument[];
}

export type LearnerPortalErrorType =
  | 'UNAUTHENTICATED'
  | 'NO_PROFILE_LINK'
  | 'INVALID_LINK'
  | 'TENANT_MISMATCH'
  | 'FORBIDDEN_ROLE'
  | 'API_FETCH_FAILURE';

export interface LearnerPortalAccessResult {
  authorized: boolean;
  errorType?: LearnerPortalErrorType;
  message?: string;
  technicalDetails?: string;
  learnerId?: string;
  schoolId?: string;
}
