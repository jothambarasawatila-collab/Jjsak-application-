import {
  Student,
  GradingScheme,
  MarksDeadline,
  BehaviorRecord,
  InterClassTransferRecord,
  PromotionRecord,
  AcademicYearArchive,
  TeacherNotification,
  OcrExtractionResult,
  OcrMarkRow,
} from '../types';

export const DEFAULT_CBC_GRADING_SCHEME: GradingScheme = {
  id: 'scheme-cbc-standard',
  name: 'CBC Standard 4-Band Competency Framework (MOE/KNEC)',
  schemeType: 'CBC_4_BAND',
  active: true,
  updatedAt: '2026-08-20T08:00:00Z',
  updatedBy: 'Director of Academics (Mr. Jotham Watila)',
  boundaries: [
    {
      grade: 'EE',
      label: 'Exceeding Expectations',
      minScore: 80,
      maxScore: 100,
      points: 4.0,
      color: 'emerald',
      remarks: 'Consistently demonstrates exemplary mastery and independent application of competencies.',
    },
    {
      grade: 'ME',
      label: 'Meeting Expectations',
      minScore: 65,
      maxScore: 79,
      points: 3.0,
      color: 'blue',
      remarks: 'Proficiently demonstrates required competencies with consistent conceptual understanding.',
    },
    {
      grade: 'AE',
      label: 'Approaching Expectations',
      minScore: 50,
      maxScore: 64,
      points: 2.0,
      color: 'amber',
      remarks: 'Demonstrates basic competency acquisition; targeted learning scaffolding recommended.',
    },
    {
      grade: 'BE',
      label: 'Below Expectations',
      minScore: 0,
      maxScore: 49,
      points: 1.0,
      color: 'red',
      remarks: 'Requires intensive individual intervention, remedial modules, and regular pastoral check-ins.',
    },
  ],
};

export const KENYAN_12_GRADE_SCHEME: GradingScheme = {
  id: 'scheme-kenyan-12',
  name: 'Kenyan National 12-Grade Scale (A to E)',
  schemeType: 'KENYAN_12_GRADE',
  active: false,
  updatedAt: '2026-08-15T08:00:00Z',
  updatedBy: 'Head of Institution',
  boundaries: [
    { grade: 'A', label: 'Plain A', minScore: 80, maxScore: 100, points: 12, color: 'emerald', remarks: 'Excellent Performance' },
    { grade: 'A-', label: 'A Minus', minScore: 75, maxScore: 79, points: 11, color: 'emerald', remarks: 'Very Good Performance' },
    { grade: 'B+', label: 'B Plus', minScore: 70, maxScore: 74, points: 10, color: 'blue', remarks: 'Good Performance' },
    { grade: 'B', label: 'Plain B', minScore: 65, maxScore: 69, points: 9, color: 'blue', remarks: 'Good Performance' },
    { grade: 'B-', label: 'B Minus', minScore: 60, maxScore: 64, points: 8, color: 'blue', remarks: 'Above Average' },
    { grade: 'C+', label: 'C Plus', minScore: 55, maxScore: 59, points: 7, color: 'amber', remarks: 'Average Competency' },
    { grade: 'C', label: 'Plain C', minScore: 50, maxScore: 54, points: 6, color: 'amber', remarks: 'Average Competency' },
    { grade: 'C-', label: 'C Minus', minScore: 45, maxScore: 49, points: 5, color: 'amber', remarks: 'Marginal Pass' },
    { grade: 'D+', label: 'D Plus', minScore: 40, maxScore: 44, points: 4, color: 'orange', remarks: 'Weak Performance' },
    { grade: 'D', label: 'Plain D', minScore: 35, maxScore: 39, points: 3, color: 'orange', remarks: 'Weak Performance' },
    { grade: 'D-', label: 'D Minus', minScore: 30, maxScore: 34, points: 2, color: 'red', remarks: 'Poor Performance' },
    { grade: 'E', label: 'Plain E', minScore: 0, maxScore: 29, points: 1, color: 'red', remarks: 'Very Poor Performance' },
  ],
};

export const INITIAL_DEADLINES: MarksDeadline[] = [
  {
    id: 'dead-01',
    title: 'Term 2 Mid-Term Marks Submission',
    subject: 'Social Studies',
    grade: 'G8',
    stream: 'S',
    department: 'Humanities',
    examinationType: 'Mid Term Exam',
    term: 'Term 2',
    year: 2026,
    deadlineDateTime: '2026-08-25T17:00',
    createdBy: 'Mr. Jotham Watila (Director of Academics)',
    assignedTeacherName: 'Mr. O. Kinyanjui',
    status: 'Submitted',
    remindersSent: {
      sevenDays: true,
      threeDays: true,
      oneDay: true,
      deadlineDay: true,
      overdue: false,
    },
  },
  {
    id: 'dead-02',
    title: 'G8 N Mathematics Mid-Term Score Sheets',
    subject: 'Mathematics',
    grade: 'G8',
    stream: 'N',
    department: 'Mathematics',
    examinationType: 'Mid Term Exam',
    term: 'Term 2',
    year: 2026,
    deadlineDateTime: '2026-08-30T17:00',
    createdBy: 'Mr. Jotham Watila (Director of Academics)',
    assignedTeacherName: 'Mrs. J. Barasa',
    status: 'In Progress',
    remindersSent: {
      sevenDays: true,
      threeDays: true,
      oneDay: false,
      deadlineDay: false,
      overdue: false,
    },
  },
  {
    id: 'dead-03',
    title: 'G7 S Integrated Science Practical Scores',
    subject: 'Integrated Science',
    grade: 'G7',
    stream: 'S',
    department: 'Sciences',
    examinationType: 'Practical Assessment',
    term: 'Term 2',
    year: 2026,
    deadlineDateTime: '2026-09-02T16:30',
    createdBy: 'Mr. Jotham Watila (Director of Academics)',
    assignedTeacherName: 'Mr. F. Kiprop',
    status: 'Pending',
    remindersSent: {
      sevenDays: true,
      threeDays: false,
      oneDay: false,
      deadlineDay: false,
      overdue: false,
    },
  },
  {
    id: 'dead-04',
    title: 'G9 N Pretechnical Studies Capstone Project',
    subject: 'Pretechnical Studies',
    grade: 'G9',
    stream: 'N',
    department: 'Technical & Applied',
    examinationType: 'Project',
    term: 'Term 2',
    year: 2026,
    deadlineDateTime: '2026-08-26T17:00',
    createdBy: 'Mr. Jotham Watila (Director of Academics)',
    assignedTeacherName: 'Mr. D. Mwangi',
    status: 'Extended',
    extendedUntil: '2026-08-31T17:00',
    extensionReason: 'Workshop power disruption delayed lathe machine practical evaluations.',
    extensionApprovedBy: 'Mr. Jotham Watila',
    remindersSent: {
      sevenDays: true,
      threeDays: true,
      oneDay: true,
      deadlineDay: true,
      overdue: false,
    },
  },
  {
    id: 'dead-05',
    title: 'G7 N Kiswahili Insha & Lugha Mid-Term',
    subject: 'Kiswahili',
    grade: 'G7',
    stream: 'N',
    department: 'Languages',
    examinationType: 'Mid Term Exam',
    term: 'Term 2',
    year: 2026,
    deadlineDateTime: '2026-08-24T17:00',
    createdBy: 'Mr. Jotham Watila (Director of Academics)',
    assignedTeacherName: 'Mrs. M. Wanjiku',
    status: 'Overdue',
    remindersSent: {
      sevenDays: true,
      threeDays: true,
      oneDay: true,
      deadlineDay: true,
      overdue: true,
    },
  },
];

export const INITIAL_BEHAVIOR_RECORDS: BehaviorRecord[] = [
  {
    id: 'beh-01',
    studentId: 'std-01',
    studentName: 'Faith Achieng',
    admNo: 'JJSAK-2024-001',
    className: 'G8 S',
    date: '2026-08-14',
    category: 'Commendation',
    title: 'Sub-County Science Congress Winner',
    description: 'Developed an automated solar-powered irrigation demonstrator using locally recycled materials.',
    actionTaken: 'Certificate of Excellence presented at school assembly and logged in CBC talent portfolio.',
    recordedBy: 'Mr. O. Kinyanjui',
    severity: 'Positive',
  },
  {
    id: 'beh-02',
    studentId: 'std-02',
    studentName: 'Brian Kiprono',
    admNo: 'JJSAK-2024-002',
    className: 'G8 S',
    date: '2026-08-18',
    category: 'Attendance Concern',
    title: 'Unexcused Absence During Morning Preps',
    description: 'Missed two morning prep sessions on Monday and Tuesday without prior parental notification.',
    actionTaken: 'Parent notified via automated SMS; counseling session scheduled with Head of Guidance.',
    recordedBy: 'Mrs. M. Wanjiku',
    severity: 'Low',
  },
  {
    id: 'beh-03',
    studentId: 'std-03',
    studentName: 'Kevin Mutua',
    admNo: 'JJSAK-2024-003',
    className: 'G8 S',
    date: '2026-08-20',
    category: 'Guidance & Counseling',
    title: 'Career Pathway Consultation (STEM / Pre-Engineering)',
    description: 'Learner requested advisory session regarding Senior School STEM subject combinations and Technical track prerequisites.',
    actionTaken: 'Personalized 3-year pathway roadmap issued and signed by Director of Academics.',
    recordedBy: 'Mr. Jotham Watila',
    severity: 'Positive',
  },
];

export const INITIAL_TRANSFERS: InterClassTransferRecord[] = [
  {
    id: 'trans-01',
    studentId: 'std-04',
    studentName: 'Daniel Otieno',
    admNo: 'JJSAK-2024-004',
    fromClass: 'G7 N',
    toClass: 'G7 S',
    transferDate: '2026-05-12',
    reason: 'Stream load equalization and science laboratory grouping balance.',
    authorizedBy: 'Mr. Jotham Watila (Director of Academics)',
    status: 'Completed',
  },
  {
    id: 'trans-02',
    studentId: 'std-05',
    studentName: 'Stacey Nduta',
    admNo: 'JJSAK-2024-005',
    fromClass: 'G8 N',
    toClass: 'G8 S',
    transferDate: '2026-05-18',
    reason: 'Special Needs Accommodation: Relocation to ground-floor stream closest to the infirmary.',
    authorizedBy: 'Mrs. J. Barasa (Head of School)',
    status: 'Completed',
  },
];

export const INITIAL_PROMOTIONS: PromotionRecord[] = [
  {
    id: 'prom-2025',
    academicYearFrom: 2024,
    academicYearTo: 2025,
    executionDate: '2024-12-05',
    executedBy: 'Mr. Jotham Watila (Director of Academics)',
    totalEligible: 114,
    promotedCount: 109,
    retainedCount: 5,
    graduatedCount: 0,
    notes: 'Grade 7 promoted to Grade 8, Grade 8 promoted to Grade 9. 5 learners retained based on statutory minimum attendance and continuous remediation guidelines.',
    rollbackAvailable: false,
  },
];

export const INITIAL_ARCHIVES: AcademicYearArchive[] = [
  {
    id: 'arch-2024',
    academicYear: 2024,
    term: 'Term 3',
    archivedAt: 1734000000000,
    archivedBy: 'System Administrator',
    totalLearners: 114,
    totalAssessments: 24,
    meanPerformance: 74.2,
    isLocked: true,
    snapshotNotes: 'Official 2024 Academic Year Archive. CBC Junior Secondary Cohort 1 baseline results with digital rubber stamp.',
  },
  {
    id: 'arch-2025',
    academicYear: 2025,
    term: 'Term 3',
    archivedAt: 1765500000000,
    archivedBy: 'Director of Academics (Mr. Jotham Watila)',
    totalLearners: 120,
    totalAssessments: 28,
    meanPerformance: 77.8,
    isLocked: true,
    snapshotNotes: 'Official 2025 Academic Year Archive. Full cohort transitioned with verified KNEC CBA portal alignment.',
  },
];

export const INITIAL_TEACHER_NOTIFICATIONS: TeacherNotification[] = [
  {
    id: 'notif-01',
    teacherName: 'Mrs. M. Wanjiku',
    title: 'Overdue Alert: G7 N Kiswahili Mid-Term Scores',
    message: 'The deadline for G7 N Kiswahili Mid-Term marks passed on Aug 24 at 17:00. Please submit immediately or request an extension via Director of Academics.',
    channel: 'In-App',
    sentAt: '2026-08-25T08:00:00Z',
    status: 'Delivered',
    deadlineId: 'dead-05',
    urgency: 'Critical',
  },
  {
    id: 'notif-02',
    teacherName: 'Mrs. J. Barasa',
    title: 'Final Reminder: G8 N Mathematics Marks Due in 2 Days',
    message: 'G8 N Mathematics Mid-Term examination mark sheets are scheduled for submission on Aug 30 at 17:00.',
    channel: 'Email',
    sentAt: '2026-08-28T07:30:00Z',
    status: 'Delivered',
    deadlineId: 'dead-02',
    urgency: 'Urgent',
  },
  {
    id: 'notif-03',
    teacherName: 'Mr. F. Kiprop',
    title: 'Upcoming Assessment Submission Window: G7 S Science',
    message: 'G7 S Integrated Science Practical marks entry closes on Sep 02 at 16:30. Ensure all observation rubrics are recorded.',
    channel: 'SMS',
    sentAt: '2026-08-26T12:00:00Z',
    status: 'Delivered',
    deadlineId: 'dead-03',
    urgency: 'Routine',
  },
  {
    id: 'notif-04',
    teacherName: 'Mr. D. Mwangi',
    title: 'Extension Approved: G9 N Pretechnical Studies Capstone',
    message: 'Your extension request has been approved until Aug 31 at 17:00 by Director of Academics Mr. Jotham Watila.',
    channel: 'Mobile Push',
    sentAt: '2026-08-26T15:10:00Z',
    status: 'Read',
    deadlineId: 'dead-04',
    urgency: 'Routine',
  },
];

// Helper: Calculate grade, points, and color based on active Grading Scheme
export function gradeFromScheme(
  score: number | null | undefined,
  scheme: GradingScheme = DEFAULT_CBC_GRADING_SCHEME
): { grade: string; points: number; label: string; remarks: string; color: string } {
  if (score === null || score === undefined || isNaN(score)) {
    return {
      grade: 'N/A',
      points: 0,
      label: 'Not Recorded',
      remarks: 'Score entry pending',
      color: 'slate',
    };
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const b of scheme.boundaries) {
    if (clamped >= b.minScore && clamped <= b.maxScore) {
      return {
        grade: b.grade,
        points: b.points,
        label: b.label,
        remarks: b.remarks,
        color: b.color,
      };
    }
  }

  const last = scheme.boundaries[scheme.boundaries.length - 1];
  return {
    grade: last?.grade || 'BE',
    points: last?.points || 1.0,
    label: last?.label || 'Below Expectations',
    remarks: last?.remarks || 'Remediation needed',
    color: last?.color || 'red',
  };
}

// Helper: Recalculate student averages, overall grades, and ranks
export function recalculateAllAcademicRecords(
  students: Student[],
  scheme: GradingScheme = DEFAULT_CBC_GRADING_SCHEME
): Student[] {
  return students.map((student) => {
    const validScores = (student.subjects || [])
      .map((s) => s.score)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));

    const avgScore =
      validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : null;

    const evaluation = gradeFromScheme(avgScore, scheme);

    // Update subject-level grades using the same scheme
    const updatedSubjects = (student.subjects || []).map((sub) => {
      const subEval = gradeFromScheme(sub.score, scheme);
      return {
        ...sub,
        grade: subEval.grade,
        remarks: sub.remarks || subEval.remarks,
      };
    });

    return {
      ...student,
      avgScore,
      overallGrade: evaluation.grade,
      subjects: updatedSubjects,
    };
  });
}

// Helper: Check duplicate admission number
export function isDuplicateAdmissionNumber(
  admNo: string,
  students: Student[],
  currentStudentId?: string
): boolean {
  if (!admNo) return false;
  const normalized = admNo.trim().toUpperCase();
  return students.some(
    (s) => s.admNo.trim().toUpperCase() === normalized && s.id !== currentStudentId
  );
}

// Helper: Generate simulated OCR results for physical mark sheets
export function generateSimulatedOcrScan(
  className: string,
  subject: string,
  classStudents: Student[]
): OcrExtractionResult {
  const rows: OcrMarkRow[] = classStudents.map((s, idx) => {
    // Determine a simulated OCR recognized score based on existing or realistic variance
    const existing = s.subjects.find((sub) => sub.subject === subject)?.score;
    const baseScore = existing !== null && existing !== undefined ? existing : 70 + (idx % 25);
    const confidence = idx === 2 ? 0.78 : 0.92 + (idx % 7) * 0.01;
    const isConflict = idx === 2; // Simulated low confidence / manual review item

    return {
      admNo: s.admNo,
      studentName: s.name,
      extractedScore: baseScore,
      confidence: parseFloat(confidence.toFixed(2)),
      status: isConflict ? 'Conflict' : 'Matched',
      suggestedAction: isConflict ? 'Verify handwritten numeral (73 vs 78)' : 'Auto-match verified',
    };
  });

  return {
    id: `ocr-${Date.now()}`,
    fileName: `Scanned_MarkSheet_${className.replace(/\s+/g, '_')}_${subject.replace(/\s+/g, '_')}.pdf`,
    scanTimestamp: new Date().toISOString(),
    detectedSubject: subject,
    detectedClass: className,
    totalRowsDetected: rows.length,
    highConfidenceCount: rows.filter((r) => r.confidence >= 0.85).length,
    manualReviewCount: rows.filter((r) => r.confidence < 0.85).length,
    rows,
  };
}

// Helper: Downloadable Template Generators
export function generateTemplateData(type: 'learners' | 'marks' | 'attendance' | 'behavior'): string {
  if (type === 'learners') {
    return `AdmissionNumber,FirstName,LastName,Gender,DateOfBirth,Grade,Stream,ParentName,ParentPhone,ParentEmail,SpecialNeedsCategory,AccommodationsRequired,PreviousSchool
JJSAK-2024-001,Faith,Achieng,Female,2012-04-15,G8,S,David Mwangi,+254 722 345 678,david.mwangi@example.com,None,None,St. Jude Academy
JJSAK-2024-002,Brian,Kiprono,Male,2012-09-22,G8,S,Mary Kiprono,+254 723 456 789,mary.k@example.com,None,None,Eldoret Hills Junior
JJSAK-2024-003,Kevin,Mutua,Male,2012-02-10,G8,S,Grace Mutua,+254 724 567 890,grace.m@example.com,None,None,Kitale Township Primary
JJSAK-2024-004,Daniel,Otieno,Male,2012-07-30,G7,S,Peter Otieno,+254 725 678 901,peter.o@example.com,Hearing,Front Seating & Visual Scaffolding,Central Primary`;
  }

  if (type === 'marks') {
    return `AdmissionNumber,StudentName,Grade,Stream,Subject,AssessmentType,MaxScore,ScoreObtained,TeacherRemarks
JJSAK-2024-001,Faith Achieng,G8,S,Social Studies,Mid Term Exam,100,88,Demonstrates high conceptual grasp and articulate geographic analysis.
JJSAK-2024-002,Brian Kiprono,G8,S,Social Studies,Mid Term Exam,100,74,Good analytical comprehension; continue practicing map work.
JJSAK-2024-003,Kevin Mutua,G8,S,Social Studies,Mid Term Exam,100,79,Solid effort in history and citizenship components.
JJSAK-2024-004,Daniel Otieno,G7,S,Social Studies,Mid Term Exam,100,82,Excellent performance across all assessment indicators.`;
  }

  if (type === 'attendance') {
    return `AdmissionNumber,StudentName,Class,Date,Session,Status(P/A/L/E),ReasonForAbsence
JJSAK-2024-001,Faith Achieng,G8 S,2026-08-28,Full Day,P,Present
JJSAK-2024-002,Brian Kiprono,G8 S,2026-08-28,Full Day,L,Transport delay
JJSAK-2024-003,Kevin Mutua,G8 S,2026-08-28,Full Day,P,Present
JJSAK-2024-004,Daniel Otieno,G7 S,2026-08-28,Full Day,E,Hospital appointment with verified clinic chit`;
  }

  // Behavior
  return `AdmissionNumber,StudentName,Class,Date,Category,Title,Description,ActionTaken,Severity
JJSAK-2024-001,Faith Achieng,G8 S,2026-08-28,Commendation,Science Fair Excellence,Won sub-county award,Certificate presented,Positive
JJSAK-2024-002,Brian Kiprono,G8 S,2026-08-28,Disciplinary,Class Disruption,Repeated talking during silent prep,Written warning issued,Low
JJSAK-2024-003,Kevin Mutua,G8 S,2026-08-28,Guidance & Counseling,Senior Pathway Advisory,Counseling on STEM electives,Action plan filed,Positive`;
}

// Download file trigger
export function triggerFileDownload(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
