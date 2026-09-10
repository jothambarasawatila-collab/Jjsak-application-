export type SpecialNeedsCategory =
  | 'Visual'
  | 'Hearing'
  | 'Physical'
  | 'Neurodevelopmental'
  | 'Speech & Language'
  | 'Gifted & Talented'
  | 'None';

export interface SpecialNeedsInfo {
  category: SpecialNeedsCategory;
  hasSpecialNeeds: boolean;
  accommodationsRequired: string[];
  medicalOrDietaryNotes?: string;
  assistiveDevices?: string;
}

export interface TransferInfo {
  isTransferred: boolean;
  previousSchoolName?: string;
  previousAdmNo?: string;
  transferLetterRef?: string;
  nemisUpi?: string;
  admissionDate?: string;
  transferReason?: string;
  previousGrade?: string;
}

export interface InterClassTransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  fromClass: string;
  toClass: string;
  transferDate: string;
  reason: string;
  authorizedBy: string;
  status: 'Completed' | 'Pending';
}

export interface PromotionRecord {
  id: string;
  academicYearFrom: number;
  academicYearTo: number;
  executionDate: string;
  executedBy: string;
  totalEligible: number;
  promotedCount: number;
  retainedCount: number;
  graduatedCount: number;
  notes: string;
  rollbackAvailable: boolean;
}

export interface PromotionCandidate {
  studentId: string;
  name: string;
  admNo: string;
  currentClass: string;
  targetClass: string;
  avgScore: number;
  overallGrade: string;
  attendance: number;
  recommendedAction: 'Promote' | 'Retain' | 'Graduate';
  finalAction: 'Promote' | 'Retain' | 'Graduate';
  overrideReason?: string;
}

export interface AcademicYearArchive {
  id: string;
  academicYear: number;
  term: string;
  archivedAt: number;
  archivedBy: string;
  totalLearners: number;
  totalAssessments: number;
  meanPerformance: number;
  isLocked: boolean;
  snapshotNotes?: string;
}

export type BehaviorCategory =
  | 'Commendation'
  | 'Disciplinary'
  | 'Guidance & Counseling'
  | 'Attendance Concern'
  | 'Co-curricular Excellence';

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  className: string;
  date: string;
  category: BehaviorCategory;
  title: string;
  description: string;
  actionTaken: string;
  recordedBy: string;
  severity: 'Positive' | 'Low' | 'Medium' | 'High';
}

export type AssessmentCategoryType =
  | 'Continuous Assessment Test (CAT)'
  | 'Monthly Exam'
  | 'Mid-Term Exam'
  | 'End-Term Exam'
  | 'Project'
  | 'Practical Assessment'
  | 'Competency-Based Assessment'
  | 'Teacher Observation Record';

export type DeadlineStatus =
  | 'Pending'
  | 'In Progress'
  | 'Submitted'
  | 'Overdue'
  | 'Extended';

export interface DeadlineExtensionRequest {
  id: string;
  deadlineId: string;
  requestedBy: string;
  teacherName: string;
  requestedDate: string;
  requestedDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface MarksDeadline {
  id: string;
  title: string;
  subject: string;
  grade: string;
  stream: string;
  department: string;
  examinationType: string;
  term: string;
  year: number;
  deadlineDateTime: string; // "2026-09-05T17:00"
  createdBy: string;
  assignedTeacherName?: string;
  status: DeadlineStatus;
  extendedUntil?: string;
  extensionReason?: string;
  extensionApprovedBy?: string;
  remindersSent: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
    deadlineDay: boolean;
    overdue: boolean;
  };
}

export interface TeacherNotification {
  id: string;
  teacherId?: string;
  teacherName: string;
  title: string;
  message: string;
  channel: 'In-App' | 'Email' | 'SMS' | 'Mobile Push';
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Read';
  deadlineId?: string;
  urgency: 'Routine' | 'Urgent' | 'Critical';
}

export interface GradingBoundaryConfig {
  grade: string; // 'EE' | 'ME' | 'AE' | 'BE' or 'A', 'B', etc.
  label: string; // 'Exceeding Expectations', etc.
  minScore: number;
  maxScore: number;
  points: number;
  color: string;
  remarks: string;
}

export interface GradingScheme {
  id: string;
  name: string;
  schemeType: 'CBC_4_BAND' | 'KENYAN_12_GRADE';
  boundaries: GradingBoundaryConfig[];
  active: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface LearnerPerformanceHistoryItem {
  year: number;
  term: string;
  grade: string;
  stream: string;
  avgScore: number;
  overallGrade: string;
  rank: number;
  totalInClass: number;
  attendance: number;
  subjects: {
    subject: string;
    score: number;
    grade: string;
    remarks: string;
  }[];
}

export interface OcrMarkRow {
  admNo: string;
  studentName: string;
  extractedScore: number;
  confidence: number; // e.g. 0.94
  status: 'Matched' | 'Unmatched' | 'Conflict';
  suggestedAction: string;
}

export interface OcrExtractionResult {
  id: string;
  fileName: string;
  scanTimestamp: string;
  detectedSubject: string;
  detectedClass: string;
  totalRowsDetected: number;
  highConfidenceCount: number;
  manualReviewCount: number;
  rows: OcrMarkRow[];
}
