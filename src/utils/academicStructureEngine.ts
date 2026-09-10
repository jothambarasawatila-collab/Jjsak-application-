import {
  AcademicValidationIssue,
  GradeConfig,
  StreamConfig,
  SubjectDefinition,
  TeacherSubjectAllocation,
  ClassTeacherAllocation,
  CurriculumFramework,
  AcademicYearConfig,
  AcademicTermConfig,
} from '../types/academicStructure';
import { Teacher } from '../types';

export interface ValidationSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: AcademicValidationIssue[];
  isCompliant: boolean;
  scorePercentage: number;
}

export function runAcademicStructureDiagnostics(params: {
  curriculum: CurriculumFramework;
  academicYears: AcademicYearConfig[];
  terms: AcademicTermConfig[];
  grades: GradeConfig[];
  streams: StreamConfig[];
  subjects: SubjectDefinition[];
  allocations: TeacherSubjectAllocation[];
  classTeacherAllocations: ClassTeacherAllocation[];
  teachers: Teacher[];
}): ValidationSummary {
  const { streams, subjects, allocations, classTeacherAllocations, teachers } = params;
  const issues: AcademicValidationIssue[] = [];

  // 1. Check Unassigned Subjects per Active Stream
  const activeStreams = streams.filter((s) => s.status === 'ACTIVE');
  const activeSubjects = subjects.filter((sub) => sub.status === 'ACTIVE' && sub.isCoreCompulsory);

  activeStreams.forEach((stream) => {
    activeSubjects.forEach((subject) => {
      // Check if subject is applicable to this grade
      if (subject.applicableGrades.includes(stream.gradeName)) {
        const hasAllocation = allocations.some(
          (a) => a.streamId === stream.id && (a.subjectId === subject.id || a.subjectCode === subject.code)
        );

        if (!hasAllocation) {
          issues.push({
            id: `issue-unassigned-${stream.id}-${subject.id}`,
            code: 'UNASSIGNED_SUBJECT',
            category: 'UNASSIGNED_SUBJECT',
            severity: 'ERROR',
            title: `Unassigned Subject: ${subject.name}`,
            description: `${stream.fullClassName} has no teacher allocated for compulsory learning area "${subject.name}" (${subject.code}).`,
            affectedEntity: `${stream.fullClassName} • ${subject.name}`,
            suggestedAction: `Assign a qualified ${subject.department} teacher to teach ${subject.lessonsPerWeek} lessons/week.`,
            autoFixAvailable: true,
            autoFixAction: 'ASSIGN_DEFAULT_TEACHER',
          });
        }
      }
    });
  });

  // 2. Check Class Teacher Allocations
  activeStreams.forEach((stream) => {
    const cta = classTeacherAllocations.find((c) => c.streamId === stream.id && c.status === 'ACTIVE');
    if (!cta || !cta.primaryClassTeacherId) {
      issues.push({
        id: `issue-no-cta-${stream.id}`,
        code: 'UNASSIGNED_CLASS_TEACHER',
        category: 'UNASSIGNED_CLASS_TEACHER',
        severity: 'ERROR',
        title: `Missing Class Teacher: ${stream.fullClassName}`,
        description: `${stream.fullClassName} does not have a designated Primary Class Teacher appointed for the active academic term.`,
        affectedEntity: stream.fullClassName,
        suggestedAction: 'Appoint a full-time teacher as Class Master/Mistress and generate the formal appointment letter.',
        autoFixAvailable: true,
        autoFixAction: 'APPOINT_CLASS_TEACHER',
      });
    }
  });

  // 3. Teacher Workload Checks (TSC Standard: 24 - 28 lessons/week)
  teachers.forEach((teacher) => {
    const tFirst = (teacher.name || '').toLowerCase().split(' ')[0] || '';
    const teacherAllocations = allocations.filter(
      (a) =>
        a.teacherId === teacher.id ||
        (tFirst && a.teacherName && a.teacherName.toLowerCase().includes(tFirst))
    );
    const totalWeeklyLessons = teacherAllocations.reduce((sum, a) => sum + (a.lessonsPerWeek || 0), 0);

    if (totalWeeklyLessons > 28) {
      issues.push({
        id: `issue-overload-${teacher.id}`,
        code: 'WORKLOAD_OVERLOAD',
        category: 'WORKLOAD_OVERLOAD',
        severity: 'WARNING',
        title: `Workload Exceeded: ${teacher.name} (${totalWeeklyLessons} Periods)`,
        description: `${teacher.name} is allocated ${totalWeeklyLessons} lessons/week, exceeding the TSC statutory ceiling of 28 periods/week by ${totalWeeklyLessons - 28} periods.`,
        affectedEntity: `${teacher.name} (${teacher.department || 'Academic'})`,
        suggestedAction: 'Reassign 1 or more streams to an assistant teacher or subject specialist to prevent teacher fatigue.',
        autoFixAvailable: false,
      });
    } else if (totalWeeklyLessons < 18 && totalWeeklyLessons > 0) {
      issues.push({
        id: `issue-underload-${teacher.id}`,
        code: 'WORKLOAD_UNDERLOAD',
        category: 'WORKLOAD_UNDERLOAD',
        severity: 'INFO',
        title: `Workload Under-Utilized: ${teacher.name} (${totalWeeklyLessons} Periods)`,
        description: `${teacher.name} has only ${totalWeeklyLessons} periods/week allocated (target benchmark is 24 - 28 periods).`,
        affectedEntity: teacher.name,
        suggestedAction: 'Allocate elective or remedial study periods to balance staff distribution.',
        autoFixAvailable: false,
      });
    }
  });

  // 4. Stream Capacity Breaches (Kenyan CBC Standard: Max 45 learners per stream)
  activeStreams.forEach((stream) => {
    if (stream.totalEnrolled > 55) {
      issues.push({
        id: `issue-cap-${stream.id}`,
        code: 'CAPACITY_BREACH',
        category: 'CAPACITY_BREACH',
        severity: 'WARNING',
        title: `Stream Overcapacity: ${stream.fullClassName} (${stream.totalEnrolled} Learners)`,
        description: `${stream.fullClassName} has ${stream.totalEnrolled} learners, which exceeds standard CBC classroom capacity (${stream.maxCapacity} learners).`,
        affectedEntity: stream.fullClassName,
        suggestedAction: 'Consider creating an additional stream (e.g. Gamma or South stream) to maintain optimal teacher-learner ratios.',
        autoFixAvailable: false,
      });
    }
  });

  // 5. KICD Lesson Count Verification
  subjects.forEach((subject) => {
    if (subject.isCoreCompulsory && subject.lessonsPerWeek < 3) {
      issues.push({
        id: `issue-kicd-${subject.id}`,
        code: 'KICD_LESSON_MISMATCH',
        category: 'KICD_LESSON_MISMATCH',
        severity: 'ERROR',
        title: `Curriculum Lesson Deficit: ${subject.name}`,
        description: `Compulsory subject "${subject.name}" is allocated only ${subject.lessonsPerWeek} lessons/week, falling below KICD minimum curricular standards.`,
        affectedEntity: subject.name,
        suggestedAction: 'Adjust weekly lesson periods to at least 3 - 5 lessons per week as mandated by KICD.',
        autoFixAvailable: true,
        autoFixAction: 'RESTORE_KICD_PERIODS',
      });
    }
  });

  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
  const infoCount = issues.filter((i) => i.severity === 'INFO').length;
  const totalIssues = issues.length;

  const scorePercentage = Math.max(0, Math.min(100, Math.round(100 - errorCount * 15 - warningCount * 5)));

  return {
    totalIssues,
    errorCount,
    warningCount,
    infoCount,
    issues,
    isCompliant: errorCount === 0,
    scorePercentage,
  };
}

export function generateAuditHash(details: string, timestamp: number): string {
  let hash = 0;
  const str = `${details}-${timestamp}-jjsak-integrity-token`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
