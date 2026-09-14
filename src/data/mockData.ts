import {
  Student,
  Assessment,
  Teacher,
  SchoolInfo,
  SchoolProfile,
  SchoolSubscription,
  SchoolTenant,
  User,
  AuditLogEntry,
} from '../types';

export const DEFAULT_TENANT_SCHOOLS: SchoolTenant[] = [];

export const SubscriptionConfig = {
  APP_NAME: 'JJSAK School Management System',
  APP_OWNER: 'Jotham Barasa Watila',
  OWNER_PHONE: '+254741478813 / +254100559811',
  OWNER_EMAIL: 'jothambarasawatila@gmail.com',
  BANK_NAME: 'National Bank of Kenya',
  BANK_ACCOUNT: '7717901382',
  MPESA_PAYBILL_OR_TILL: '0741478813',
  MPESA_NAME: 'JOTHAM BARASA WATILA',
  PER_LEARNER_ANNUAL_FEE: 60, // KSh 60 per registered learner per year
  TERM_1_PERCENTAGE: 40, // 40% first term
  TERM_2_PERCENTAGE: 40, // 40% second term
  TERM_3_PERCENTAGE: 20, // 20% third term
  SUBSCRIPTION_AMOUNT: '60 / learner / yr',
  SUBSCRIPTION_PERIOD_MONTHS: 12,
  TRIAL_DURATION_DAYS: 120, // 1 School Term (approx 4 months)
};

export const DEFAULT_SUBSCRIPTION: SchoolSubscription = {
  installationDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Installed 30 days ago
  trialEndDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days remaining in 1-term trial
  subscriptionEndDate: null,
  active: true,
  schoolName: 'JJSAK Educational Institution',
  paymentReference: '',
  activatedBy: 'Jotham Barasa Watila',
};

export function isSubscriptionValid(
  trialEndDate: number,
  subscriptionEndDate: number | null
): boolean {
  const now = Date.now();
  return now <= trialEndDate || (subscriptionEndDate !== null && now <= subscriptionEndDate);
}

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-001',
    username: 'jotham Watila',
    email: 'jothambarasawatila@gmail.com',
    password: '299991jB@#2026',
    fullName: 'Jotham Barasa Watila',
    role: 'SYSTEM_ADMIN',
    designation: 'Platform Owner & Super Administrator',
    phoneNumber: '+254741478813 / +254100559811',
    active: true,
    mfaEnabled: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    schoolId: 'GLOBAL',
    userId: 'usr-001',
    userName: 'Jotham Barasa Watila',
    userRole: 'SYSTEM_ADMIN',
    actionType: 'LOGIN',
    details: 'Platform Owner initialized clean production state.',
    timestamp: Date.now(),
    ipAddress: '197.237.12.89',
  },
];

// JJSAK Password Policy Validation Rule (P1.6)
export function validatePasswordPolicy(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*)');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolId: '',
  schoolName: 'JJSAK Educational Institution',
  motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
  county: '',
  subCounty: '',
  postalAddress: '',
  phoneNumber: '+254 741 478 813',
  emailAddress: 'info@jjsak.com',
  website: 'www.jjsak.com',
  headTeacherName: '',
  schoolLogoUri: '',
  schoolStampUri: '',
  lastUpdated: Date.now(),
};

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  name: 'JJSAK Educational Institution',
  motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
  term: 'Term 1, 2026',
  year: 2026,
  termStartDate: '6th January 2026',
  termEndDate: '10th April 2026',
  headOfInstitution: 'Head of Institution',
  headTeacher: 'Head Teacher',
  logoInitial: 'J',
  nextTermOpenDate: '4th May 2026',
  totalStudents: 0,
  totalClasses: 0,
  totalAssessments: 0,
  avgPerformance: 0,
};

export const HEAD_OF_INSTITUTION_COMMENT_PRESETS = [
  {
    level: 'Exceeding Expectations (EE)',
    comments: [
      'An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.',
      'Excellent competencies demonstrated across all learning areas. Highly commendable attitude and work ethic.',
      'Very impressive academic progress and moral conduct. Maintain this outstanding trajectory next term.',
    ],
  },
  {
    level: 'Meeting Expectations (ME)',
    comments: [
      'Commendable progress made this term. With consistent practice in core learning areas, higher attainment is within reach.',
      'Good overall performance and positive conduct. Encourage extra focus on revision and active classroom engagement.',
      'A satisfactory and steady effort throughout the term. Keep working diligently to exceed key competencies.',
    ],
  },
  {
    level: 'Approaching Expectations (AE)',
    comments: [
      'Has demonstrated potential. Closer guidance, targeted remedial support, and regular home study will yield great improvement.',
      'Encourage greater consistency in daily study habits, active subject revision, and timely completion of tasks.',
    ],
  },
  {
    level: 'Below Expectations (BE)',
    comments: [
      'Requires focused academic remediation, regular parental consultation, and dedicated follow-up on foundational competencies.',
    ],
  },
  {
    level: 'Did Not Sit / Not Assessed (-)',
    comments: [
      '-',
      'Did not sit for term assessments due to authorized absence.',
      'Did not complete assessments this term.',
    ],
  },
];

export const HEAD_TEACHER_COMMENT_PRESETS = HEAD_OF_INSTITUTION_COMMENT_PRESETS;

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ASSESSMENTS: Assessment[] = [];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-00',
    schoolId: '',
    name: 'Mr. Jotham Watila',
    email: 'jothambarasawatila@gmail.com',
    role: 'Platform Owner & Senior Educational Specialist',
    classes: [],
    subjects: ['Social Studies', 'Pretechnical Studies', 'Creative Arts'],
    allocations: [],
    avatarHex: '#C51E28',
    tscNumber: 'TSC-641890',
    staffNumber: 'STF-2022-001',
    nationalId: '28491034',
    gender: 'Male',
    dateOfBirth: '1988-04-12',
    phoneNumber: '+254 741 478 813',
    physicalAddress: 'Kitale, Trans-Nzoia',
    emergencyContact: {
      name: 'Dr. Stella Watila',
      phone: '+254 722 998 877',
      relationship: 'Spouse',
    },
    dateOfEmployment: '2022-01-10',
    designation: 'Senior Teacher / Specialist',
    department: 'Technical & Applied',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Ministry of Education',
    qualification: 'B.Ed (Arts) - Social Sciences & Pretech',
    academicQualifications: [
      {
        id: 'aq-001',
        degree: 'Bachelor of Education (Arts) - First Class Honours',
        institution: 'Kenyatta University',
        year: 2012,
        gradeOrClass: 'First Class Honours',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-001',
        title: 'TSC Registered Professional Educator',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/641890',
        year: 2012,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Pretechnical Studies', 'Social Studies', 'Creative Arts'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [],
    professionalDevelopmentRecords: [],
    trainingHistory: [],
    supportingDocuments: [],
    accountStatus: 'ACTIVE',
    userId: 'usr-001',
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 0,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 0,
      totalStudentsReached: 0,
    },
    appraisals: [],
  },
];

export const AVAILABLE_GRADES = [
  'G7',
  'G8',
  'G9',
];

export const AVAILABLE_CLASSES = [
  'G7 N',
  'G7 S',
  'G8 N',
  'G8 S',
  'G9 N',
  'G9 S',
];

export const AVAILABLE_YEARS = [
  2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
];

export function getAvailableTermsForYear(year: number): string[] {
  return [
    `Term 1, ${year}`,
    `Term 2, ${year}`,
    `Term 3, ${year}`,
  ];
}

export function getDefaultNextTermDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `5th August ${year}`;
  } else if (termName.includes('Term 2')) {
    return `6th January ${year + 1}`;
  } else if (termName.includes('Term 3')) {
    return `4th May ${year + 1}`;
  }
  return `5th August ${year}`;
}

export function getDefaultTermOpeningDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `6th January ${year}`;
  } else if (termName.includes('Term 2')) {
    return `6th May ${year}`;
  } else if (termName.includes('Term 3')) {
    return `2nd September ${year}`;
  }
  return `6th May ${year}`;
}

export function getDefaultTermClosingDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `4th April ${year}`;
  } else if (termName.includes('Term 2')) {
    return `1st August ${year}`;
  } else if (termName.includes('Term 3')) {
    return `28th November ${year}`;
  }
  return `1st August ${year}`;
}

export const AVAILABLE_TERMS = [
  'Term 1, 2026',
  'Term 2, 2026',
  'Term 3, 2026',
  'Term 1, 2027',
  'Term 2, 2027',
  'Term 3, 2027',
  'Term 1, 2028',
  'Term 2, 2028',
  'Term 3, 2028',
  'Term 1, 2029',
  'Term 2, 2029',
  'Term 3, 2029',
  'Term 1, 2030',
  'Term 2, 2030',
  'Term 3, 2030',
];

export const AVAILABLE_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Integrated Science',
  'Social Studies',
  'CRE',
  'Agriculture',
  'Pretechnical Studies',
  'Creative Arts',
];

export const AVAILABLE_ASSESSMENT_TYPES = [
  'Opener Exam',
  'Continuous Assessment (CAT)',
  'Mid Term Exam',
  'End Term Exam',
  'Practical / Project',
];

export interface GradeBand {
  min: number;
  max: number;
  grade: string;
  level: string;
  remarks: string;
}

export const CBC_GRADING_SCHEME: GradeBand[] = [
  { min: 90, max: 100, grade: 'EE1', level: 'Exceeding Expectations 1', remarks: 'Exceeding Expectations' },
  { min: 75, max: 89, grade: 'EE2', level: 'Exceeding Expectations 2', remarks: 'Exceeding Expectations' },
  { min: 58, max: 74, grade: 'ME1', level: 'Meeting Expectations 1', remarks: 'Meeting Expectations' },
  { min: 41, max: 57, grade: 'ME2', level: 'Meeting Expectations 2', remarks: 'Meeting Expectations' },
  { min: 31, max: 40, grade: 'AE1', level: 'Approaching Expectations 1', remarks: 'Approaching Expectations' },
  { min: 21, max: 30, grade: 'AE2', level: 'Approaching Expectations 2', remarks: 'Approaching Expectations' },
  { min: 11, max: 20, grade: 'BE1', level: 'Below Expectations 1', remarks: 'Below Expectations' },
  { min: 0, max: 10, grade: 'BE2', level: 'Below Expectations 2', remarks: 'Below Expectations' },
];

export function calculateGrade(score: number | null | undefined | string): { grade: string; remarks: string; level: string } {
  if (score === null || score === undefined || score === '' || score === '-') {
    return { grade: '-', remarks: '-', level: '-' };
  }
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  if (isNaN(numScore) || numScore < 0) {
    return { grade: '-', remarks: '-', level: '-' };
  }
  if (numScore >= 90) return { grade: 'EE1', remarks: 'Exceeding Expectations', level: 'Exceeding Expectations 1' };
  if (numScore >= 75) return { grade: 'EE2', remarks: 'Exceeding Expectations', level: 'Exceeding Expectations 2' };
  if (numScore >= 58) return { grade: 'ME1', remarks: 'Meeting Expectations', level: 'Meeting Expectations 1' };
  if (numScore >= 41) return { grade: 'ME2', remarks: 'Meeting Expectations', level: 'Meeting Expectations 2' };
  if (numScore >= 31) return { grade: 'AE1', remarks: 'Approaching Expectations', level: 'Approaching Expectations 1' };
  if (numScore >= 21) return { grade: 'AE2', remarks: 'Approaching Expectations', level: 'Approaching Expectations 2' };
  if (numScore >= 11) return { grade: 'BE1', remarks: 'Below Expectations', level: 'Below Expectations 1' };
  return { grade: 'BE2', remarks: 'Below Expectations', level: 'Below Expectations 2' };
}

export function calculateStudentAverage(subjects: { score: number | null | undefined }[]): {
  avgScore: number | null;
  overallGrade: string;
} {
  const assessed = subjects.filter(
    (s) => s.score !== null && s.score !== undefined && !isNaN(s.score) && s.score >= 0
  );
  if (assessed.length === 0) {
    return { avgScore: null, overallGrade: '-' };
  }
  const total = assessed.reduce((sum, item) => sum + (item.score as number), 0);
  const avg = Math.round(total / assessed.length);
  const { grade } = calculateGrade(avg);
  return { avgScore: avg, overallGrade: grade };
}

export const POPULAR_SCORE_BASES = [
  { value: 100, label: '/100 (Standard %)', shortLabel: '/100' },
  { value: 80, label: '/80 (End Term)', shortLabel: '/80' },
  { value: 50, label: '/50 (Midterm / Paper)', shortLabel: '/50' },
  { value: 30, label: '/30 (CAT / Project)', shortLabel: '/30' },
];

/**
 * Converts a raw score out of a given base into a percentage out of 100.
 * Examples:
 *  - 25 out of 30 => 83%
 *  - 33 out of 50 => 66%
 *  - 10 out of 50 => 20%
 *  - 64 out of 80 => 80%
 *  - 75 out of 100 => 75%
 */
export function convertRawScoreToPercentage(
  rawScore: number | string | null | undefined,
  outOf: number | string = 100
): number | null {
  if (rawScore === null || rawScore === undefined || rawScore === '' || rawScore === '-') {
    return null;
  }
  const raw = typeof rawScore === 'string' ? parseFloat(rawScore) : rawScore;
  const max = typeof outOf === 'string' ? parseFloat(outOf) : outOf;
  if (isNaN(raw) || isNaN(max) || max <= 0 || raw < 0) {
    return null;
  }
  const pct = (raw / max) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/**
 * Parses user input which can be:
 * - A single number: e.g. "75" -> raw: 75, outOf: 100, percentage: 75
 * - A fraction string: e.g. "33/50" -> raw: 33, outOf: 50, percentage: 66
 * - "25/30" -> raw: 25, outOf: 30, percentage: 83
 * - "64/80" -> raw: 64, outOf: 80, percentage: 80
 * - "10/50" -> raw: 10, outOf: 50, percentage: 20
 */
export function parseScoreString(
  input: string | number | null | undefined,
  defaultOutOf: number = 100
): {
  raw: number | null;
  outOf: number;
  percentage: number | null;
  isFraction: boolean;
} {
  if (input === null || input === undefined || input === '' || input === '-') {
    return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
  }

  if (typeof input === 'number') {
    if (isNaN(input) || input < 0) {
      return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
    }
    const pct = defaultOutOf === 100 ? Math.min(100, input) : convertRawScoreToPercentage(input, defaultOutOf);
    return { raw: input, outOf: defaultOutOf, percentage: pct, isFraction: false };
  }

  const str = input.trim();
  if (!str || str === '-') {
    return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
  }

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const raw = parseFloat(parts[0].trim());
      const max = parseFloat(parts[1].trim());
      if (!isNaN(raw) && !isNaN(max) && max > 0 && raw >= 0) {
        const pct = convertRawScoreToPercentage(raw, max);
        return { raw, outOf: max, percentage: pct, isFraction: true };
      }
    }
  }

  const parsed = parseFloat(str);
  if (!isNaN(parsed) && parsed >= 0) {
    const pct = defaultOutOf === 100 ? Math.min(100, Math.round(parsed)) : convertRawScoreToPercentage(parsed, defaultOutOf);
    return { raw: parsed, outOf: defaultOutOf, percentage: pct, isFraction: false };
  }

  return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
}

/**
 * Returns the ordinal suffix for a number (e.g. 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th").
 */
export function getRankSuffix(rank: number | null | undefined): string {
  if (!rank || rank <= 0) return '-';
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) return `${rank}st`;
  if (j === 2 && k !== 12) return `${rank}nd`;
  if (j === 3 && k !== 13) return `${rank}rd`;
  return `${rank}th`;
}

/**
 * Computes Grade and Stream rankings dynamically for an entire collection of students.
 * - Stream Ranking: Compares the student against peers in the exact same Stream / classArm (e.g., "G8 S" or "G7 N").
 * - Grade Ranking: Compares the student against all peers in the same Grade level (e.g., "G8" combining G8 S & G8 N).
 * 
 * Rules:
 * - Unassessed students (avgScore === null) receive position '-' and no numerical rank.
 * - Assessed students are ordered descending by avgScore.
 * - Tied scores share the same rank (standard 1224 competition ranking).
 * - Updates streamPosition, gradePosition, streamRank, gradeRank, and position.
 */
export function calculateStudentRankings(students: Student[]): Student[] {
  if (!students || students.length === 0) return [];

  // 1. Group by Stream (classArm)
  const streamMap = new Map<string, { rank: number | null; total: number; positionStr: string }>();
  const streamGroups = new Map<string, Student[]>();

  students.forEach((s) => {
    const list = streamGroups.get(s.classArm) || [];
    list.push(s);
    streamGroups.set(s.classArm, list);
  });

  streamGroups.forEach((streamList) => {
    const totalInStream = streamList.length;
    const assessed = streamList
      .filter((s) => s.avgScore !== null && s.avgScore !== undefined && !isNaN(s.avgScore))
      .sort((a, b) => (b.avgScore as number) - (a.avgScore as number));

    let currentRank = 1;
    for (let i = 0; i < assessed.length; i++) {
      if (i > 0 && (assessed[i].avgScore as number) < (assessed[i - 1].avgScore as number)) {
        currentRank = i + 1;
      }
      streamMap.set(assessed[i].id, {
        rank: currentRank,
        total: totalInStream,
        positionStr: `${currentRank}/${totalInStream}`,
      });
    }

    streamList
      .filter((s) => s.avgScore === null || s.avgScore === undefined || isNaN(s.avgScore))
      .forEach((s) => {
        streamMap.set(s.id, {
          rank: null,
          total: totalInStream,
          positionStr: '-',
        });
      });
  });

  // 2. Group by Grade (e.g. "G7", "G8", "G9")
  const gradeMap = new Map<string, { rank: number | null; total: number; positionStr: string }>();
  const gradeGroups = new Map<string, Student[]>();

  students.forEach((s) => {
    const effGrade = s.grade || (s.classArm ? s.classArm.split(' ')[0] : 'G8');
    const list = gradeGroups.get(effGrade) || [];
    list.push(s);
    gradeGroups.set(effGrade, list);
  });

  gradeGroups.forEach((gradeList) => {
    const totalInGrade = gradeList.length;
    const assessed = gradeList
      .filter((s) => s.avgScore !== null && s.avgScore !== undefined && !isNaN(s.avgScore))
      .sort((a, b) => (b.avgScore as number) - (a.avgScore as number));

    let currentRank = 1;
    for (let i = 0; i < assessed.length; i++) {
      if (i > 0 && (assessed[i].avgScore as number) < (assessed[i - 1].avgScore as number)) {
        currentRank = i + 1;
      }
      gradeMap.set(assessed[i].id, {
        rank: currentRank,
        total: totalInGrade,
        positionStr: `${currentRank}/${totalInGrade}`,
      });
    }

    gradeList
      .filter((s) => s.avgScore === null || s.avgScore === undefined || isNaN(s.avgScore))
      .forEach((s) => {
        gradeMap.set(s.id, {
          rank: null,
          total: totalInGrade,
          positionStr: '-',
        });
      });
  });

  return students.map((s) => {
    const sInfo = streamMap.get(s.id);
    const gInfo = gradeMap.get(s.id);

    const streamPosition = sInfo ? sInfo.positionStr : '-';
    const gradePosition = gInfo ? gInfo.positionStr : '-';
    const streamRank = sInfo ? sInfo.rank : null;
    const gradeRank = gInfo ? gInfo.rank : null;

    return {
      ...s,
      streamPosition,
      gradePosition,
      streamRank,
      gradeRank,
      position: streamPosition,
    };
  });
}

/**
 * Calculates the dynamic ranking for a single student against all other students in memory.
 */
export function calculateSingleStudentRanking(
  targetStudent: Student,
  allStudents: Student[]
): {
  streamPosition: string;
  gradePosition: string;
  streamRank: number | null;
  gradeRank: number | null;
  totalInStream: number;
  totalInGrade: number;
} {
  const merged = allStudents.some((s) => s.id === targetStudent.id)
    ? allStudents.map((s) => (s.id === targetStudent.id ? targetStudent : s))
    : [...allStudents, targetStudent];

  const ranked = calculateStudentRankings(merged);
  const found = ranked.find((s) => s.id === targetStudent.id);

  const streamCount = merged.filter((s) => s.classArm === targetStudent.classArm).length;
  const targetGrade = targetStudent.grade || targetStudent.classArm.split(' ')[0];
  const gradeCount = merged.filter(
    (s) => (s.grade || s.classArm.split(' ')[0]) === targetGrade
  ).length;

  return {
    streamPosition: found?.streamPosition || '-',
    gradePosition: found?.gradePosition || '-',
    streamRank: found?.streamRank ?? null,
    gradeRank: found?.gradeRank ?? null,
    totalInStream: streamCount,
    totalInGrade: gradeCount,
  };
}

/**
 * Computes teacher initials from a teacher's full name.
 * Examples:
 * - "Mr. Jotham Watila" -> "JW"
 * - "Jotham Watila" -> "JW"
 * - "Mr. O. Kinyanjui" -> "OK"
 * - "Mrs. J. Barasa" -> "JB"
 * - "Ms. C. Wanjiru" -> "CW"
 * - "Mr. P. Otieno" -> "PO"
 * - "Madam E. Achieng" -> "EA"
 */
export function getTeacherInitials(teacherName: string | undefined | null): string {
  if (!teacherName || !teacherName.trim()) return '--';

  // Strip honorific prefixes
  const clean = teacherName
    .replace(/^(Mr\.|Mrs\.|Ms\.|Miss|Dr\.|Prof\.|Madam|Tr\.|Teacher|Sir)\s+/i, '')
    .trim();

  // Split and clean punctuation
  const words = clean
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 0);

  if (words.length === 0) {
    return teacherName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'TR';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // First letter of first word and first letter of last word
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/**
 * Normalizes class strings for matching (e.g. "G8 S", "Grade 8 South", "8S", "G8 South")
 */
function normalizeClassKey(cls: string): string {
  if (!cls) return '';
  const upper = cls.toUpperCase().trim();
  // Extract number (7, 8, 9) and stream letter (S, N, E, W, etc.)
  const numMatch = upper.match(/(\d+)/);
  const streamMatch = upper.match(/(SOUTH|NORTH|EAST|WEST|[SNEW])/i);

  const num = numMatch ? numMatch[1] : '';
  let stream = '';
  if (streamMatch) {
    const raw = streamMatch[1].toUpperCase();
    if (raw.startsWith('S')) stream = 'S';
    else if (raw.startsWith('N')) stream = 'N';
    else if (raw.startsWith('E')) stream = 'E';
    else if (raw.startsWith('W')) stream = 'W';
    else stream = raw[0];
  }

  if (num && stream) {
    return `G${num} ${stream}`;
  }
  return upper;
}

/**
 * Resolves the assigned teacher and initials for a specific subject in a specific student's class.
 */
export function getTeacherForSubject(
  subjectName: string,
  classArm: string,
  teachersList: Teacher[] = INITIAL_TEACHERS
): { teacher: Teacher | null; initials: string; teacherName: string; role?: string } {
  const normTarget = normalizeClassKey(classArm);
  const gradePrefix = normTarget.split(' ')[0] || (classArm || '').trim().toUpperCase();

  const targetSub = (subjectName || '').toLowerCase().trim();

  // 1. Check allocations
  for (const t of teachersList) {
    if (t.allocations && t.allocations.length > 0) {
      const matchAlloc = t.allocations.find((a) => {
        const aNorm = normalizeClassKey(a.className || '');
        const classMatches =
          aNorm === normTarget ||
          (a.className || '').toUpperCase().trim() === (classArm || '').toUpperCase().trim() ||
          aNorm.startsWith(gradePrefix);

        const subMatches = (a.subjects || []).some(
          (s) => (s || '').toLowerCase().trim() === targetSub
        );

        return classMatches && subMatches;
      });

      if (matchAlloc) {
        return {
          teacher: t,
          initials: getTeacherInitials(t.name),
          teacherName: t.name,
          role: t.role,
        };
      }
    }
  }

  // 2. Check classes & subjects properties
  for (const t of teachersList) {
    const hasClass = (t.classes || []).some((c) => {
      const cNorm = normalizeClassKey(c);
      return cNorm === normTarget || cNorm.startsWith(gradePrefix);
    });

    const hasSubject = (t.subjects || []).some(
      (s) => (s || '').toLowerCase().trim() === targetSub
    );

    if (hasClass && hasSubject) {
      return {
        teacher: t,
        initials: getTeacherInitials(t.name),
        teacherName: t.name,
        role: t.role,
      };
    }
  }

  // 3. Any teacher assigned to this subject
  for (const t of teachersList) {
    const hasSubject = (t.subjects || []).some(
      (s) => (s || '').toLowerCase().trim() === targetSub
    );
    if (hasSubject) {
      return {
        teacher: t,
        initials: getTeacherInitials(t.name),
        teacherName: t.name,
        role: t.role,
      };
    }
  }

  // 4. Default Fallback Map
  const defaultSubjectTeachers: Record<string, { name: string; initials: string }> = {
    'Social Studies': { name: 'Mr. Jotham Watila', initials: 'JW' },
    'Pretechnical Studies': { name: 'Mr. Jotham Watila', initials: 'JW' },
    'Mathematics': { name: 'Mr. O. Kinyanjui', initials: 'OK' },
    'English': { name: 'Mrs. J. Barasa', initials: 'JB' },
    'Integrated Science': { name: 'Ms. C. Wanjiru', initials: 'CW' },
    'Agriculture': { name: 'Ms. C. Wanjiru', initials: 'CW' },
    'Kiswahili': { name: 'Mr. P. Otieno', initials: 'PO' },
    'CRE': { name: 'Mr. P. Otieno', initials: 'PO' },
    'Creative Arts': { name: 'Madam E. Achieng', initials: 'EA' },
  };

  const def = defaultSubjectTeachers[subjectName] || {
    name: 'Class Teacher',
    initials: 'TR',
  };

  return {
    teacher: null,
    initials: def.initials,
    teacherName: def.name,
  };
}

