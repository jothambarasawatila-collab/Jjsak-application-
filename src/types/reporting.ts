export type ReportTemplateType =
  | 'standard_cbc_report'
  | 'detailed_cbc_progress'
  | 'subject_breakdown'
  | 'competency_values_matrix'
  | 'ministry_nemis_export'
  | 'class_broadsheet'
  | 'official_transcript'
  | 'executive_brief';

export type ReportApprovalStatus =
  | 'DRAFT'
  | 'TEACHER_VERIFIED'
  | 'HOD_REVIEWED'
  | 'PRINCIPAL_APPROVED'
  | 'PUBLISHED'
  | 'LOCKED';

export type SeniorSchoolPathway =
  | 'STEM - Pure Sciences & Engineering'
  | 'STEM - Applied Sciences & Technical'
  | 'Social Sciences & Humanities'
  | 'Arts & Sports Science';

export interface ReportApprovalRecord {
  status: ReportApprovalStatus;
  verifiedByTeacher?: string;
  verifiedTeacherDate?: string;
  reviewedByHoD?: string;
  reviewedHoDDate?: string;
  approvedByPrincipal?: string;
  approvedPrincipalDate?: string;
  publishedDate?: string;
  isLocked: boolean;
  lockTimestamp?: string;
  integrityHash: string;
  qrVerificationUrl: string;
}

export interface LearnerCompetencyEvaluation {
  competencyId: string;
  competencyName: string;
  level: 'EE' | 'ME' | 'AE' | 'BE';
  scorePercent: number;
  descriptor: string;
  evidence: string;
}

export interface LearnerValueEvaluation {
  valueId: string;
  valueName: string;
  rating: 'Exceptional' | 'Consistent' | 'Developing' | 'Needs Support';
  remarks: string;
}

export interface LearnerPCIEvaluation {
  pciName: string; // Pertinent & Contemporary Issues (e.g., Environmental, Financial, Health)
  engagement: 'High' | 'Moderate' | 'Emerging';
  observedActivity: string;
}

export interface TermComparisonRecord {
  term: string;
  meanScore: number;
  overallGrade: string;
  streamPosition: number;
  gradePosition: number;
  attendanceDaysPresent: number;
  attendanceTotalDays: number;
}

export interface AICompetencyInsight {
  predictedKpseaBand: 'Band 1 (Superior)' | 'Band 2 (Proficient)' | 'Band 3 (Competent)' | 'Band 4 (Developing)';
  predictedMeanRange: string;
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_INTERVENTION_NEEDED';
  riskFactors: string[];
  recommendedPathway: SeniorSchoolPathway;
  pathwayConfidenceScore: number;
  primaryStrengths: string[];
  remedialFocusAreas: string[];
  teacherInterventionAction: string;
  parentHomeSupportTips: string[];
  careerSuggestions: string[];
}

export interface MarkEntryAuditItem {
  subjectName: string;
  teacherName: string;
  gradeArm: string;
  enrolledStudents: number;
  marksEntered: number;
  missingMarks: number;
  completionPercentage: number;
  lastUpdated: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED';
}

export interface TeacherPerformanceMetric {
  teacherId: string;
  teacherName: string;
  department: string;
  subjectsTaught: string[];
  allocatedStreams: string[];
  totalLearners: number;
  subjectMeanScore: number;
  passRatePercentage: number;
  exceedingMeetingPercentage: number;
  markEntryCompliancePct: number;
  valueAddedRating: 'Outstanding' | 'High Value-Added' | 'Satisfactory' | 'Needs Support';
}

export interface AdministrativeSummaryReport {
  academicYear: string;
  term: string;
  totalEnrolled: number;
  boysCount: number;
  girlsCount: number;
  schoolMeanScore: number;
  schoolOverallGrade: string;
  overallPassRate: number; // ME + EE percentage
  topPerformingGrade: string;
  topPerformingStream: string;
  topSubject: string;
  subjectNeedingSupport: string;
  specialNeedsLearnersCount: number;
  cbcComplianceRating: string;
  generatedDate: string;
}

export interface ReportDistributionBatch {
  id: string;
  batchName: string;
  reportType: ReportTemplateType;
  targetCohort: string; // e.g. "Grade 8 - All Streams"
  totalRecipients: number;
  channelsSelected: ('PDF_PRINT' | 'EMAIL' | 'SMS_ALERT' | 'WHATSAPP_LINK' | 'PARENT_PORTAL')[];
  status: 'READY' | 'DISPATCHING' | 'COMPLETED' | 'FAILED';
  dispatchedCount: number;
  timestamp: string;
  initiatedBy: string;
}

export interface ReportAccessLogEntry {
  id: string;
  timestamp: string;
  reportType: string;
  studentId: string;
  studentName: string;
  accessedByRole: 'Admin' | 'Teacher' | 'Parent' | 'Learner' | 'Auditor';
  accessedByName: string;
  action: 'VIEWED' | 'DOWNLOADED_PDF' | 'PRINTED' | 'SENT_SMS' | 'VERIFIED_QR';
  ipAddress?: string;
  verificationStatus: 'VALID_HASH' | 'HASH_VERIFIED' | 'REVOKED';
}
