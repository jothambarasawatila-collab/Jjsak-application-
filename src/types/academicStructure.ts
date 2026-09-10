export type CurriculumType = 'CBC_JUNIOR_SECONDARY' | 'CBC_FOUNDATIONAL' | 'CBE_SENIOR_SECONDARY' | '8_4_4_LEGACY';

export interface CompetencyDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  indicators: string[];
}

export interface ValueDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  learningEvidence: string;
}

export interface PCIDefinition {
  id: string;
  code: string;
  category: 'Citizenship' | 'Health Education' | 'Life Skills' | 'Education for Sustainable Development' | 'Learner Support';
  title: string;
  integrationGuide: string;
}

export interface LearningAreaStrand {
  id: string;
  subjectCode: string;
  grade: string;
  strandNumber: number;
  strandTitle: string;
  subStrands: {
    subStrandNumber: string;
    title: string;
    specificLearningOutcomes: string[];
    suggestedLearningExperiences: string;
    keyInquiryQuestions: string[];
    assessmentMethods: string[];
  }[];
}

export interface AssessmentRubricBand {
  level: 'EE' | 'ME' | 'AE' | 'BE';
  name: string;
  scoreRange: string;
  descriptor: string;
  color: string;
}

export interface CurriculumFramework {
  id: string;
  name: string;
  code: string;
  governingBody: string; // "KICD / Ministry of Education"
  version: string;
  effectiveYear: number;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
  coreCompetencies: CompetencyDefinition[];
  coreValues: ValueDefinition[];
  pcis: PCIDefinition[];
  assessmentScale: AssessmentRubricBand[];
  totalWeeklyLessons: number;
}

export type AcademicYearStatus = 'ACTIVE' | 'PLANNING' | 'CLOSED' | 'ARCHIVED';

export interface AcademicYearConfig {
  id: string;
  year: number;
  name: string; // e.g. "2026 Academic Year"
  startDate: string; // "2026-01-05"
  endDate: string; // "2026-11-20"
  status: AcademicYearStatus;
  totalWeeks: number;
  workingDaysPerWeek: number;
  targetEnrollment: number;
  isCurrent: boolean;
  termsCount: number;
  notes?: string;
}

export type AcademicTermStatus = 'ACTIVE' | 'UPCOMING' | 'CLOSED' | 'LOCKED';

export interface AcademicTermConfig {
  id: string;
  academicYearId: string;
  year: number;
  termNumber: 1 | 2 | 3;
  termName: string; // e.g. "Term 2 - 2026"
  startDate: string;
  endDate: string;
  midTermBreakStart: string;
  midTermBreakEnd: string;
  status: AcademicTermStatus;
  isCurrent: boolean;
  totalInstructionalWeeks: number;
  assessmentWindows: {
    cat1Window: { start: string; end: string; weight: number };
    midTermWindow: { start: string; end: string; weight: number };
    endTermWindow: { start: string; end: string; weight: number };
    marksSubmissionDeadline: string;
    reportCardReleaseDate: string;
  };
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export type LearningLevelCode = 'FOUNDATIONAL' | 'MIDDLE_JUNIOR' | 'SENIOR_SECONDARY';

export interface LearningLevelConfig {
  id: string;
  code: LearningLevelCode;
  name: string;
  description: string;
  gradeRange: string[]; // e.g. ["Grade 7", "Grade 8", "Grade 9"]
  headOfLevel: string;
  headOfLevelStaffId: string;
  totalLearners: number;
  curriculumModel: string;
  active: boolean;
}

export interface GradeConfig {
  id: string;
  levelCode: LearningLevelCode;
  gradeName: string; // "Grade 7", "Grade 8", "Grade 9"
  numericLevel: number; // 7, 8, 9
  coordinatorName: string;
  coordinatorStaffId: string;
  ageBracket: string; // "12 - 14 Years"
  standardCapacity: number;
  currentEnrollment: number;
  streamsCount: number;
  compulsorySubjectsCount: number;
  electiveSubjectsCount: number;
  passMarkPercentage: number;
  notes?: string;
}

export interface StreamConfig {
  id: string;
  gradeName: string; // "Grade 7"
  streamName: string; // "East", "West", "Alpha", "Beta", "Omega"
  fullClassName: string; // "Grade 7 East"
  classTeacherName: string;
  classTeacherStaffId: string;
  assistantClassTeacherName?: string;
  assistantClassTeacherStaffId?: string;
  roomNumber: string;
  buildingWing: string;
  maxCapacity: number;
  currentBoys: number;
  currentGirls: number;
  totalEnrolled: number;
  status: 'ACTIVE' | 'COMBINED' | 'INACTIVE';
  classRepStudentName?: string;
  isSpecialNeedsInclusive: boolean;
}

export type SubjectDepartment =
  | 'Languages'
  | 'Mathematics'
  | 'Sciences'
  | 'Humanities & Social Sciences'
  | 'Technical & Applied Studies'
  | 'Creative Arts & Sports'
  | 'Religious Education';

export interface SubjectDefinition {
  id: string;
  code: string; // "MAT-701", "ENG-702", "KIS-703", "SCI-704", etc.
  name: string; // "Mathematics", "English", "Kiswahili"
  shortName: string; // "Math", "Eng", "Kisw"
  department: SubjectDepartment;
  applicableGrades: string[]; // ["Grade 7", "Grade 8", "Grade 9"]
  isCoreCompulsory: boolean;
  lessonsPerWeek: number; // KICD mandated lesson count (e.g. 5, 4, 3)
  passingBenchmark: number; // e.g. 50%
  requiresLabOrWorkshop: boolean;
  specialFacility?: string; // "Science Lab", "Computer Lab", "Home Science Workshop", "Sports Field"
  hodStaffName: string;
  hodStaffId: string;
  gradingScaleId: string;
  description: string;
  status: 'ACTIVE' | 'ELECTIVE_AVAILABLE' | 'INACTIVE';
}

export interface TeacherSubjectAllocation {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  streamId: string;
  fullClassName: string; // "Grade 7 East"
  gradeName: string;
  lessonsPerWeek: number;
  allocatedRoom?: string;
  academicYear: number;
  termNumber: number;
  assignedBy: string;
  assignedAt: string;
  status: 'CONFIRMED' | 'PROVISIONAL';
}

export interface ClassTeacherAllocation {
  id: string;
  streamId: string;
  fullClassName: string;
  primaryClassTeacherId: string;
  primaryClassTeacherName: string;
  assistantClassTeacherId?: string;
  assistantClassTeacherName?: string;
  academicYear: number;
  termNumber: number;
  responsibilities: string[];
  appointedBy: string;
  appointmentDate: string;
  appointmentLetterRef: string;
  status: 'ACTIVE' | 'REVOKED' | 'CONCLUDED';
}

export interface LearnerPlacementRule {
  id: string;
  title: string;
  description: string;
  targetRatioGirls: number; // e.g. 50
  targetRatioBoys: number; // e.g. 50
  heterogeneousAcademicMixing: boolean; // Mix high, mid, low performers evenly
  specialNeedsEvenDistribution: boolean;
  maxStreamSize: number;
  active: boolean;
}

export interface PromotionPolicyConfig {
  id: string;
  fromGrade: string; // "Grade 7"
  toGrade: string; // "Grade 8"
  minOverallMeanScore: number; // 40%
  minAttendancePercentage: number; // 75%
  compulsoryPassCount: number; // 6 subjects
  cbcExpectationMinimum: 'ME' | 'AE' | 'BE';
  specialNeedsExemption: boolean;
  headTeacherApprovalRequired: boolean;
  seniorSchoolTransitionTrack?: {
    stemMinScore: number;
    socialScienceMinScore: number;
    artsSportsMinScore: number;
  };
}

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface AcademicValidationIssue {
  id: string;
  code: string;
  category:
    | 'UNASSIGNED_SUBJECT'
    | 'UNASSIGNED_CLASS_TEACHER'
    | 'WORKLOAD_OVERLOAD'
    | 'WORKLOAD_UNDERLOAD'
    | 'CAPACITY_BREACH'
    | 'KICD_LESSON_MISMATCH'
    | 'ROOM_CONFLICT'
    | 'TIMETABLE_READINESS';
  severity: ValidationSeverity;
  title: string;
  description: string;
  affectedEntity: string; // e.g. "Grade 8 Beta - Integrated Science" or "Tr. Peter Kiprop"
  suggestedAction: string;
  autoFixAvailable: boolean;
  autoFixAction?: string;
}

export interface AcademicStructureAuditEntry {
  id: string;
  timestamp: number;
  formattedDate: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType:
    | 'CURRICULUM_UPDATED'
    | 'ACADEMIC_YEAR_CREATED'
    | 'ACADEMIC_YEAR_TRANSITION'
    | 'TERM_DATES_MODIFIED'
    | 'TERM_LOCKED'
    | 'STREAM_CREATED'
    | 'STREAM_CAPACITY_CHANGED'
    | 'SUBJECT_CATALOG_UPDATED'
    | 'TEACHER_ALLOCATED'
    | 'CLASS_TEACHER_APPOINTED'
    | 'LEARNER_STREAM_PLACED'
    | 'PROMOTION_POLICY_UPDATED'
    | 'PROMOTION_BATCH_EXECUTED'
    | 'VALIDATION_AUTO_FIX_APPLIED';
  entityName: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  integrityHash: string;
}
