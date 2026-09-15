import { Student, Teacher, SchoolInfo } from '../types';
import {
  ReportApprovalRecord,
  LearnerCompetencyEvaluation,
  LearnerValueEvaluation,
  LearnerPCIEvaluation,
  TermComparisonRecord,
  AICompetencyInsight,
  MarkEntryAuditItem,
  TeacherPerformanceMetric,
  AdministrativeSummaryReport,
  ReportDistributionBatch,
  ReportAccessLogEntry,
  SeniorSchoolPathway,
} from '../types/reporting';
import { AVAILABLE_SUBJECTS } from './mockData';

// Generates simulated SHA-256 hash
export function generateIntegrityHash(studentId: string, term: string, meanScore: number): string {
  const payload = `${studentId}-${term}-${meanScore}-${Date.now()}-JJSAK-SECURE-SEAL`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}7f8a9b2c${studentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}`.toUpperCase();
}

// Generate Default Approval Record
export function getInitialApprovalRecord(student?: Student | null, term?: string): ReportApprovalRecord {
  const avg = student?.avgScore ?? 65;
  const studentId = student?.id || 'learner-default';
  const admNo = student?.admNo || 'JJSAK-ADM';
  const termName = term || 'Term 2, 2026';
  const hash = generateIntegrityHash(studentId, termName, avg);
  return {
    status: 'PUBLISHED',
    verifiedByTeacher: 'Mr. David Mutua (Class Master)',
    verifiedTeacherDate: '2026-08-15',
    reviewedByHoD: 'Dr. Sarah Wambui (HoD Academics)',
    reviewedHoDDate: '2026-08-18',
    approvedByPrincipal: 'Prof. Jotham Barasa (Chief Principal)',
    approvedPrincipalDate: '2026-08-20',
    publishedDate: '2026-08-22',
    isLocked: true,
    lockTimestamp: '2026-08-22T08:30:00Z',
    integrityHash: hash,
    qrVerificationUrl: `https://jjsak.edu.ke/verify?doc=REPORT&id=${admNo}&hash=${hash}`,
  };
}

// 7 Core CBC Competencies Evaluation
export function generateCompetencyEvaluations(student?: Student | null): LearnerCompetencyEvaluation[] {
  const avg = student?.avgScore ?? 68;
  const isHigh = avg >= 75;
  const isMedium = avg >= 55;

  return [
    {
      competencyId: 'comp-1',
      competencyName: 'Communication and Collaboration',
      level: isHigh ? 'EE' : isMedium ? 'ME' : 'AE',
      scorePercent: Math.min(100, Math.round(avg + 4)),
      descriptor: isHigh
        ? 'Articulates complex concepts fluently and actively steers collaborative group discussions.'
        : 'Communicates ideas clearly and cooperates harmoniously in peer group tasks.',
      evidence: 'Led group inquiry in Integrated Science and represented class in debate.',
    },
    {
      competencyId: 'comp-2',
      competencyName: 'Critical Thinking and Problem Solving',
      level: avg >= 80 ? 'EE' : avg >= 65 ? 'ME' : avg >= 50 ? 'AE' : 'BE',
      scorePercent: Math.round(avg),
      descriptor: avg >= 80
        ? 'Deconstructs multi-step mathematical and scientific challenges systematically.'
        : 'Applies logical reasoning to solve standard structured problems.',
      evidence: 'Demonstrated exceptional problem decomposition in Mathematics & Pre-Tech.',
    },
    {
      competencyId: 'comp-3',
      competencyName: 'Creativity and Imagination',
      level: isHigh ? 'EE' : 'ME',
      scorePercent: Math.min(98, Math.round(avg + 6)),
      descriptor: 'Generates original perspectives and applies creative design principles in projects.',
      evidence: 'Exhibited distinctive visual design during Creative Arts portfolio showcase.',
    },
    {
      competencyId: 'comp-4',
      competencyName: 'Citizenship and Social Responsibility',
      level: 'EE',
      scorePercent: 92,
      descriptor: 'Exemplifies institutional discipline, mutual respect, and active civic participation.',
      evidence: 'Active participation in environmental cleanup and school tree planting initiative.',
    },
    {
      competencyId: 'comp-5',
      competencyName: 'Digital Literacy',
      level: isHigh ? 'EE' : isMedium ? 'ME' : 'AE',
      scorePercent: Math.min(100, Math.round(avg + 2)),
      descriptor: 'Navigates digital educational resources safely and demonstrates high typing/coding fluency.',
      evidence: 'Successfully coded interactive algorithm in Computer Studies lab.',
    },
    {
      competencyId: 'comp-6',
      competencyName: 'Learning to Learn',
      level: isHigh ? 'EE' : isMedium ? 'ME' : 'AE',
      scorePercent: Math.round(avg),
      descriptor: 'Demonstrates strong self-drive, organizes study schedules, and reflects on personal progress.',
      evidence: 'Maintains comprehensive revision journals and consults teachers proactively.',
    },
    {
      competencyId: 'comp-7',
      competencyName: 'Self-Efficacy',
      level: isHigh ? 'EE' : isMedium ? 'ME' : 'AE',
      scorePercent: Math.min(95, Math.round(avg + 3)),
      descriptor: 'Exhibits robust emotional resilience, confidence in public tasks, and persevering focus.',
      evidence: 'Stepped up confidently to lead morning assembly announcement.',
    },
  ];
}

// 8 Core Values Evaluation
export function generateValueEvaluations(): LearnerValueEvaluation[] {
  return [
    { valueId: 'val-1', valueName: 'Love & Empathy', rating: 'Exceptional', remarks: 'Shows genuine care for peers and fosters an inclusive learning community.' },
    { valueId: 'val-2', valueName: 'Responsibility', rating: 'Exceptional', remarks: 'Consistently submits assignments punctually and manages class equipment diligently.' },
    { valueId: 'val-3', valueName: 'Respect', rating: 'Consistent', remarks: 'Courteous to instructors, support staff, and fellow learners at all times.' },
    { valueId: 'val-4', valueName: 'Unity & Teamwork', rating: 'Exceptional', remarks: 'Brings diverse peers together seamlessly during practical and sports activities.' },
    { valueId: 'val-5', valueName: 'Peace', rating: 'Consistent', remarks: 'Mediates peer misunderstandings calmly and upholds order in the learning room.' },
    { valueId: 'val-6', valueName: 'Integrity', rating: 'Exceptional', remarks: 'Demonstrates unquestionable honesty in academic examinations and sportsmanship.' },
    { valueId: 'val-7', valueName: 'Social Justice', rating: 'Consistent', remarks: 'Advocates for fair sharing of resources and supports vulnerable schoolmates.' },
    { valueId: 'val-8', valueName: 'Patriotism', rating: 'Consistent', remarks: 'Takes deep pride in national symbols, heritage, and civic obligations.' },
  ];
}

// Pertinent and Contemporary Issues (PCIs)
export function generatePCIEvaluations(): LearnerPCIEvaluation[] {
  return [
    {
      pciName: 'Environmental Education & Climate Action',
      engagement: 'High',
      observedActivity: 'Tended to indigenous tree seedlings and organized classroom waste segregation.',
    },
    {
      pciName: 'Financial Literacy & Enterprise',
      engagement: 'High',
      observedActivity: 'Constructed realistic budget models for the Junior School mini-enterprise day.',
    },
    {
      pciName: 'Health & Nutrition / Life Skills',
      engagement: 'Moderate',
      observedActivity: 'Demonstrated balanced diet selection and emergency first-aid protocols.',
    },
    {
      pciName: 'Cybersecurity & Online Safety',
      engagement: 'High',
      observedActivity: 'Conducted a peer briefing on strong password generation and cyberbullying prevention.',
    },
  ];
}

// Multi-term progression records
export function generateTermComparisonRecords(student?: Student | null): TermComparisonRecord[] {
  if (!student) return [];
  const currentAvg = student.avgScore ?? 72;
  return [
    {
      term: 'Term 1, 2026',
      meanScore: Math.max(35, Math.round(currentAvg - 4.5)),
      overallGrade: currentAvg - 4.5 >= 80 ? 'EE' : currentAvg - 4.5 >= 60 ? 'ME' : 'AE',
      streamPosition: (student.streamRank || 8) + 2,
      gradePosition: (student.gradeRank || 24) + 6,
      attendanceDaysPresent: 64,
      attendanceTotalDays: 65,
    },
    {
      term: 'Term 2, 2026 (Current)',
      meanScore: Math.round(currentAvg),
      overallGrade: student.overallGrade || 'ME',
      streamPosition: student.streamRank || 8,
      gradePosition: student.gradeRank || 24,
      attendanceDaysPresent: 68,
      attendanceTotalDays: 70,
    },
    {
      term: 'Term 3, 2026 (Projected)',
      meanScore: Math.min(100, Math.round(currentAvg + 3.2)),
      overallGrade: currentAvg + 3.2 >= 80 ? 'EE' : 'ME',
      streamPosition: Math.max(1, (student.streamRank || 8) - 2),
      gradePosition: Math.max(1, (student.gradeRank || 24) - 5),
      attendanceDaysPresent: 63,
      attendanceTotalDays: 65,
    },
  ];
}

// AI-Powered Academic Intelligence
export function generateAICompetencyInsight(student?: Student | null): AICompetencyInsight {
  const avg = student?.avgScore ?? 65;
  const subjects = student?.subjects || [];

  // Identify top subjects
  const sortedSubjects = [...subjects].sort((a, b) => (b.score || 0) - (a.score || 0));
  const strengths = sortedSubjects.slice(0, 3).map((s) => `${s.subject} (${s.score}%)`);
  const weaknesses = sortedSubjects
    .slice(-2)
    .filter((s) => (s.score || 0) < 65)
    .map((s) => `${s.subject} (${s.score}%)`);

  // Check STEM vs Humanities affinity
  const mathSciScores = subjects
    .filter((s) => ['Mathematics', 'Integrated Science', 'Pre-Technical Studies', 'Agriculture'].includes(s.subject))
    .map((s) => s.score || 0);
  const mathSciAvg = mathSciScores.length ? mathSciScores.reduce((a, b) => a + b, 0) / mathSciScores.length : 60;

  const humArtsScores = subjects
    .filter((s) => ['Social Studies', 'English', 'Kiswahili', 'Creative Arts & Sports', 'CRE'].includes(s.subject))
    .map((s) => s.score || 0);
  const humArtsAvg = humArtsScores.length ? humArtsScores.reduce((a, b) => a + b, 0) / humArtsScores.length : 60;

  let recommendedPathway: SeniorSchoolPathway = 'STEM - Pure Sciences & Engineering';
  let careerSuggestions = ['Software Engineer', 'Biomedical Scientist', 'Aerospace Engineer', 'Data Analyst'];

  if (mathSciAvg >= 75 && mathSciAvg >= humArtsAvg) {
    recommendedPathway = 'STEM - Pure Sciences & Engineering';
    careerSuggestions = ['Robotics Engineer', 'Renewable Energy Specialist', 'Actuarial Scientist', 'Physician / Surgeon'];
  } else if (mathSciAvg >= 60 && mathSciAvg > humArtsAvg) {
    recommendedPathway = 'STEM - Applied Sciences & Technical';
    careerSuggestions = ['Agricultural Technologist', 'Aviation Maintenance Technician', 'Industrial Chemist', 'Network Architect'];
  } else if (humArtsAvg >= mathSciAvg && subjects.some((s) => s.subject === 'Creative Arts & Sports' && (s.score || 0) >= 80)) {
    recommendedPathway = 'Arts & Sports Science';
    careerSuggestions = ['Digital Media Producer', 'Architectural Designer', 'Sports Scientist & Physiotherapist', 'Creative Director'];
  } else {
    recommendedPathway = 'Social Sciences & Humanities';
    careerSuggestions = ['Diplomat / International Relations', 'Corporate Legal Counsel', 'Economic Policy Analyst', 'Journalist / Editor'];
  }

  const isRisk = avg < 50;
  const isModRisk = avg >= 50 && avg < 60;

  return {
    predictedKpseaBand: avg >= 80 ? 'Band 1 (Superior)' : avg >= 65 ? 'Band 2 (Proficient)' : avg >= 50 ? 'Band 3 (Competent)' : 'Band 4 (Developing)',
    predictedMeanRange: `${Math.max(0, Math.round(avg - 3))}% – ${Math.min(100, Math.round(avg + 5))}%`,
    riskLevel: isRisk ? 'HIGH_RISK_INTERVENTION_NEEDED' : isModRisk ? 'MODERATE_RISK' : 'LOW_RISK',
    riskFactors: isRisk
      ? ['Performance falling below CBC expectation in foundational STEM areas', 'Inconsistent quiz submission trend', 'Requires differentiated remedial coaching']
      : isModRisk
      ? ['Approaching expectation in selected numeracy modules', 'Fluctuating test retention during midterm evaluation']
      : ['Strong academic trajectory with high mastery resilience'],
    recommendedPathway,
    pathwayConfidenceScore: Math.min(98, Math.max(76, Math.round(avg * 0.85 + 20))),
    primaryStrengths: strengths.length > 0 ? strengths : ['Mathematics (82%)', 'Integrated Science (79%)', 'English (76%)'],
    remedialFocusAreas: weaknesses.length > 0 ? weaknesses : ['Pre-Technical Studies (Focus on practical electrical circuitry)', 'Kiswahili Insha elaboration'],
    teacherInterventionAction: isRisk
      ? 'Assign a peer study buddy, schedule 2 weekly 30-minute remedial review slots, and administer diagnostic formative exit cards.'
      : 'Provide advanced inquiry enrichment questions and encourage participation in National Science & Robotics Fair.',
    parentHomeSupportTips: [
      'Encourage 45 minutes of daily structured silent reading to enhance cross-disciplinary comprehension.',
      'Review daily homework assignments and celebrate incremental milestone improvements.',
      'Ensure access to digital learning tablets for interactive STEM simulations during weekends.',
    ],
    careerSuggestions,
  };
}

// Mark Entry Completion Tracker for School
export function generateMarkEntryAudit(teachers: Teacher[]): MarkEntryAuditItem[] {
  const grades = ['Grade 7 East', 'Grade 7 West', 'Grade 8 North', 'Grade 8 South', 'Grade 9 Alpha'];
  const list: MarkEntryAuditItem[] = [];

  AVAILABLE_SUBJECTS.slice(0, 8).forEach((sub, idx) => {
    const teacher = teachers[idx % teachers.length] || { name: 'Staff Member' };
    const gradeArm = grades[idx % grades.length];
    const enrolled = 45;
    const missing = idx === 1 ? 4 : idx === 4 ? 12 : 0;
    const entered = enrolled - missing;
    const pct = Math.round((entered / enrolled) * 100);

    list.push({
      subjectName: sub,
      teacherName: teacher.name,
      gradeArm,
      enrolledStudents: enrolled,
      marksEntered: entered,
      missingMarks: missing,
      completionPercentage: pct,
      lastUpdated: idx === 4 ? '3 days ago' : 'Today, 09:15 AM',
      status: pct === 100 ? 'COMPLETE' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
    });
  });

  return list;
}

// Teacher Performance Value Added Metrics
export function generateTeacherPerformanceMetrics(teachers: Teacher[]): TeacherPerformanceMetric[] {
  return teachers.map((t, idx) => {
    const baseMean = 71 + ((idx * 3) % 15);
    const passRate = Math.min(100, Math.round(baseMean + 8));
    return {
      teacherId: t.id,
      teacherName: t.name,
      department: t.department || 'Academics',
      subjectsTaught: t.subjects || ['Mathematics', 'Integrated Science'],
      allocatedStreams: ['G8 North', 'G8 South', 'G7 East'],
      totalLearners: 128,
      subjectMeanScore: baseMean,
      passRatePercentage: passRate,
      exceedingMeetingPercentage: Math.min(96, passRate + 3),
      markEntryCompliancePct: idx === 1 ? 92 : 100,
      valueAddedRating: baseMean >= 78 ? 'Outstanding' : baseMean >= 68 ? 'High Value-Added' : 'Satisfactory',
    };
  });
}

// Administrative Summary
export function generateAdminSummary(students: Student[], schoolInfo: SchoolInfo): AdministrativeSummaryReport {
  const total = students.length || 240;
  const boys = students.filter((s) => s.gender === 'Male').length || Math.round(total * 0.52);
  const girls = total - boys;
  const avg = students.reduce((acc, s) => acc + (s.avgScore || 0), 0) / (students.length || 1);

  return {
    academicYear: '2026',
    term: schoolInfo.term || 'Term 2, 2026',
    totalEnrolled: total,
    boysCount: boys,
    girlsCount: girls,
    schoolMeanScore: Math.round(avg * 10) / 10,
    schoolOverallGrade: avg >= 80 ? 'EE' : avg >= 65 ? 'ME' : avg >= 50 ? 'AE' : 'BE',
    overallPassRate: 88.4,
    topPerformingGrade: 'Grade 8',
    topPerformingStream: 'Grade 8 South',
    topSubject: 'Integrated Science (Mean: 78.4%)',
    subjectNeedingSupport: 'Pre-Technical Studies (Mean: 61.2%)',
    specialNeedsLearnersCount: 6,
    cbcComplianceRating: '100% KICD Statutory Aligned',
    generatedDate: new Date().toLocaleDateString('en-KE', { dateStyle: 'long' }),
  };
}

// Sample Distribution Batches
export const INITIAL_DISTRIBUTION_BATCHES: ReportDistributionBatch[] = [
  {
    id: 'batch-001',
    batchName: 'Grade 8 Term 2 CBC Mid-Term Dispatch',
    reportType: 'standard_cbc_report',
    targetCohort: 'Grade 8 (All Streams)',
    totalRecipients: 92,
    channelsSelected: ['PDF_PRINT', 'SMS_ALERT', 'PARENT_PORTAL'],
    status: 'COMPLETED',
    dispatchedCount: 92,
    timestamp: '2026-08-24 14:30',
    initiatedBy: 'Mr. David Mutua',
  },
  {
    id: 'batch-002',
    batchName: 'Grade 7 Continuous Assessment Portfolio',
    reportType: 'detailed_cbc_progress',
    targetCohort: 'Grade 7 (East & West)',
    totalRecipients: 88,
    channelsSelected: ['PARENT_PORTAL', 'WHATSAPP_LINK'],
    status: 'COMPLETED',
    dispatchedCount: 88,
    timestamp: '2026-08-25 11:15',
    initiatedBy: 'Dr. Sarah Wambui',
  },
];

// Sample Report Access Logs
export const INITIAL_ACCESS_LOGS: ReportAccessLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '2026-08-29 09:42:15',
    reportType: 'Standard CBC Report Card',
    studentId: 'std-101',
    studentName: 'Wanjiku Kamau',
    accessedByRole: 'Parent',
    accessedByName: 'Mary Kamau (Mother)',
    action: 'DOWNLOADED_PDF',
    ipAddress: '197.232.14.82',
    verificationStatus: 'VALID_HASH',
  },
  {
    id: 'log-02',
    timestamp: '2026-08-29 09:14:02',
    reportType: 'Competency & Values Matrix',
    studentId: 'std-102',
    studentName: 'Brian Kipchoge',
    accessedByRole: 'Teacher',
    accessedByName: 'Mr. David Mutua',
    action: 'PRINTED',
    ipAddress: '10.0.4.12',
    verificationStatus: 'HASH_VERIFIED',
  },
  {
    id: 'log-03',
    timestamp: '2026-08-28 17:05:44',
    reportType: 'Official Transcript',
    studentId: 'std-103',
    studentName: 'Amina Mohamed',
    accessedByRole: 'Admin',
    accessedByName: 'Prof. Jotham Barasa',
    action: 'VERIFIED_QR',
    ipAddress: '197.237.2.11',
    verificationStatus: 'VALID_HASH',
  },
];
