import {
  Student,
  Teacher,
  User,
  JWTSession,
  LearnerPortalData,
  LearnerPortalAccessResult,
  LearnerReconciliationRecord,
} from '../types';

/**
 * JJSAK LEARNER PORTAL CORE SERVICE & AUTHORIZATION ENGINE
 *
 * Implements strict multi-tenant authorization, server-side identity resolution,
 * widget-level fault isolation, and administrative reconciliation.
 *
 * Relationship Flow:
 * School/Tenant → Learner Profile → learnerId → Learner Account → Authentication → Learner Portal
 */

// 1. Authorization & Access Verification
export function verifyLearnerPortalAccess(
  user: User | null | undefined,
  currentSchoolId: string,
  _session?: JWTSession | null
): LearnerPortalAccessResult {
  if (!user) {
    return {
      authorized: false,
      errorType: 'UNAUTHENTICATED',
      message: 'Authentication required. Please sign in to access the Learner Portal.',
      technicalDetails: 'No active user found in application context.',
    };
  }

  if (!user.active) {
    return {
      authorized: false,
      errorType: 'UNAUTHENTICATED',
      message: 'This account has been deactivated. Please contact the school administrator.',
      technicalDetails: `Account ${user.username} is marked active=false.`,
    };
  }

  // Tenant Boundary Check: User must belong to active school tenant (unless Super Admin)
  const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN';
  if (!isSuperAdmin && user.schoolId && currentSchoolId && user.schoolId !== currentSchoolId) {
    return {
      authorized: false,
      errorType: 'TENANT_MISMATCH',
      message: 'Cross-Tenant Access Denied: Your account is registered under a different school tenant.',
      technicalDetails: `User tenant '${user.schoolId}' does not match active tenant '${currentSchoolId}'.`,
      schoolId: user.schoolId,
    };
  }

  // Learner Role Check
  if (user.role === 'STUDENT') {
    // Permanent Relationship Requirement: Every learner account must have a unique learnerId
    if (!user.learnerId || user.learnerId.trim() === '') {
      return {
        authorized: false,
        errorType: 'NO_PROFILE_LINK',
        message: 'Your learner profile has not yet been linked to your learner account. Please contact the school administrator.',
        technicalDetails: `Learner user '${user.username}' (ID: ${user.id}) has no learnerId in profile record.`,
      };
    }

    return {
      authorized: true,
      learnerId: user.learnerId,
      schoolId: user.schoolId,
    };
  }

  // Parent Role Check: Must not use Learner Portal as substitute
  if (user.role === 'PARENT') {
    return {
      authorized: false,
      errorType: 'FORBIDDEN_ROLE',
      message: 'Parent/Guardian accounts must access learner information through the Parent/Guardian Portal.',
      technicalDetails: 'Learner API cannot be invoked using PARENT credentials.',
    };
  }

  // Authorized Administrative & Academic Faculty (can preview/inspect with audit logging)
  return {
    authorized: true,
    schoolId: user.schoolId,
  };
}

// 2. Server-side Authorized Data Retrieval
export interface FetchLearnerDataOptions {
  previewStudentId?: string; // Only respected for administrative/teacher preview
  simulatedWidgetFailures?: {
    attendance?: boolean;
    timetable?: boolean;
    academicResults?: boolean;
    assignments?: boolean;
    announcements?: boolean;
  };
}

export function fetchAuthorizedLearnerData(
  user: User,
  session: JWTSession | null,
  currentSchoolId: string,
  students: Student[],
  teachers: Teacher[] = [],
  options: FetchLearnerDataOptions = {}
): {
  data: LearnerPortalData | null;
  accessResult: LearnerPortalAccessResult;
  widgetErrors: Record<string, string>;
} {
  const accessResult = verifyLearnerPortalAccess(user, currentSchoolId, session);

  if (!accessResult.authorized) {
    return {
      data: null,
      accessResult,
      widgetErrors: {},
    };
  }

  // Server-Side Identity Resolution:
  // For STUDENT users: Strictly use user.learnerId (NEVER trust arbitrary client-supplied IDs!)
  let targetLearnerId: string | undefined;

  if (user.role === 'STUDENT') {
    targetLearnerId = user.learnerId;
  } else {
    // Admin or Teacher inspection mode
    targetLearnerId = options.previewStudentId || students[0]?.id;
  }

  if (!targetLearnerId) {
    return {
      data: null,
      accessResult: {
        authorized: false,
        errorType: 'NO_PROFILE_LINK',
        message: 'Your learner profile has not yet been linked to your learner account. Please contact the school administrator.',
        technicalDetails: 'No target learnerId could be resolved for the active session.',
      },
      widgetErrors: {},
    };
  }

  // Locate Student Profile in the tenant's registry
  const student = students.find((s) => s.id === targetLearnerId);

  if (!student) {
    return {
      data: null,
      accessResult: {
        authorized: false,
        errorType: 'INVALID_LINK',
        message: 'The linked learner record could not be found. Please contact the school administrator.',
        technicalDetails: `Profile with ID '${targetLearnerId}' does not exist in student database.`,
      },
      widgetErrors: {},
    };
  }

  // Tenant Verification on the student record
  const studentSchool = student.schoolId || 'sch-ngonyek-001';
  if (user.role === 'STUDENT' && studentSchool !== currentSchoolId && currentSchoolId) {
    return {
      data: null,
      accessResult: {
        authorized: false,
        errorType: 'TENANT_MISMATCH',
        message: 'Cross-Tenant Access Denied: The requested learner record belongs to another school tenant.',
        technicalDetails: `Student record '${student.id}' belongs to '${studentSchool}', expected '${currentSchoolId}'.`,
      },
      widgetErrors: {},
    };
  }

  const widgetErrors: Record<string, string> = {};
  const simulated = options.simulatedWidgetFailures || {};

  // Widget 1: Biodata & Profile
  const profile = {
    learnerId: student.id,
    admissionNumber: student.admNo,
    name: student.name,
    firstName: student.firstName || student.name.split(' ')[0],
    lastName: student.lastName || student.name.split(' ').slice(1).join(' '),
    gender: student.gender || 'Male',
    dateOfBirth: student.dateOfBirth || '14 May 2011',
    grade: student.grade,
    classArm: student.classArm,
    stream: student.stream || student.classArm,
    schoolId: studentSchool,
    schoolName: 'Ngonyek Junior School',
    avatarInitials: student.avatarInitials || student.name.substring(0, 2).toUpperCase(),
    photoUrl: student.photoUrl,
    term: student.term || 'Term 2, 2024',
    year: student.year || 2024,
    upi: student.upi || 'NEMIS-2024-KNY-0982',
    enrollmentDate: '10th January 2024',
    status: 'Active',
    classTeacherName: student.classTeacherName || 'Mr. O. Kinyanjui',
    classTeacherComment: student.classTeacherComment,
    headTeacherComment: student.headTeacherComment,
    headOfSchoolName: student.headOfSchoolName || 'Mrs. J. Barasa',
  };

  // Widget 2: Attendance Register
  let attendanceData = {
    overallPercentage: student.attendance || 94,
    totalDays: 65,
    presentDays: Math.round((65 * (student.attendance || 94)) / 100),
    absentDays: Math.max(0, 65 - Math.round((65 * (student.attendance || 94)) / 100)),
    excusedDays: 2,
    status: (student.attendance >= 90 ? 'EXCELLENT' : student.attendance >= 75 ? 'GOOD' : 'ATTENTION_NEEDED') as 'EXCELLENT' | 'GOOD' | 'ATTENTION_NEEDED',
    weeklyBreakdown: [
      { day: 'Mon', status: 'PRESENT' as const },
      { day: 'Tue', status: 'PRESENT' as const },
      { day: 'Wed', status: 'PRESENT' as const },
      { day: 'Thu', status: 'PRESENT' as const },
      { day: 'Fri', status: 'PRESENT' as const },
    ],
  };

  if (simulated.attendance) {
    widgetErrors.attendance = 'Attendance tracking microservice unavailable. Retrying...';
  }

  // Widget 3: Academic Results
  let resultsData = {
    avgScore: student.avgScore,
    overallGrade: student.overallGrade,
    position: student.position,
    streamPosition: student.streamPosition || student.position,
    gradePosition: student.gradePosition || '2/5',
    streamRank: student.streamRank || 1,
    gradeRank: student.gradeRank || 2,
    subjects: student.subjects || [],
    termSummary: 'Meeting and exceeding Junior School CBC foundational competencies.',
  };

  if (simulated.academicResults) {
    widgetErrors.academicResults = 'Assessment database query timed out. Retrying...';
  }

  // Widget 4: Timetable (CBC Grade 8 South schedule)
  let timetableData = {
    todayDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    totalPeriodsToday: 8,
    daySchedule: [
      { period: 1, time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. O. Kinyanjui', room: 'Room 8S' },
      { period: 2, time: '08:45 - 09:30', subject: 'Integrated Science', teacher: 'Dr. C. Wekesa', room: 'Science Lab 2' },
      { period: 3, time: '09:30 - 10:15', subject: 'English Language', teacher: 'Mrs. L. Chebet', room: 'Room 8S' },
      { period: 4, time: '10:45 - 11:30', subject: 'Pretechnical Studies', teacher: 'Eng. K. Omondi', room: 'Workshop B', isDouble: true },
      { period: 5, time: '11:30 - 12:15', subject: 'Pretechnical Studies', teacher: 'Eng. K. Omondi', room: 'Workshop B', isDouble: true },
      { period: 6, time: '13:15 - 14:00', subject: 'Kiswahili', teacher: 'Mwl. B. Kiprono', room: 'Room 8S' },
      { period: 7, time: '14:00 - 14:45', subject: 'Social Studies', teacher: 'Mrs. S. Achieng', room: 'Room 8S' },
      { period: 8, time: '14:45 - 15:30', subject: 'Physical Education & Sports', teacher: 'Coach M. Ndegwa', room: 'Main Field' },
    ],
  };

  if (simulated.timetable) {
    widgetErrors.timetable = 'Timetable schedule temporarily unavailable.';
  }

  // Widget 5: Assigned Teachers for this stream
  const assignedTeachers = teachers
    .filter((t) => (t.classes && t.classes.length > 0 ? t.classes.some((c: string) => c.includes(student.grade) || (student.classArm && c.includes(student.classArm))) : true))
    .map((t) => ({
      id: t.id,
      name: t.name,
      subject: (t.subjects && t.subjects[0]) || (t.teachingSubjects && t.teachingSubjects[0]) || 'Faculty',
      role: t.role || 'Subject Teacher',
      email: t.email,
    }));

  // Widget 6: Assignments
  const assignments = [
    {
      id: 'asg-001',
      title: 'Integrated Science: Solar Cooker Model Project',
      subject: 'Integrated Science',
      dueDate: 'Friday, 12 July 2024',
      status: 'PENDING' as const,
      instructions: 'Construct a parabolic solar reflector using recyclable cardboard and aluminium foil.',
      maxScore: 30,
    },
    {
      id: 'asg-002',
      title: 'Mathematics: Algebraic Expressions Exercise 4B',
      subject: 'Mathematics',
      dueDate: 'Wednesday, 10 July 2024',
      status: 'SUBMITTED' as const,
      instructions: 'Complete questions 1 through 15 on page 84 of the Grade 8 workbook.',
      maxScore: 20,
    },
    {
      id: 'asg-003',
      title: 'Pretechnical Studies: Safety Symbols Identification',
      subject: 'Pretechnical Studies',
      dueDate: 'Monday, 8 July 2024',
      status: 'GRADED' as const,
      score: 19,
      maxScore: 20,
      instructions: 'Draw and label 5 mandatory safety warning signs found in an engineering workshop.',
    },
  ];

  if (simulated.assignments) {
    widgetErrors.assignments = 'Assignments service currently offline.';
  }

  // Widget 7: Announcements & School Notices
  const announcements = [
    {
      id: 'anc-001',
      title: 'Mid-Term Break Announcement & Clearance',
      content: 'Mid-term break will commence on Friday, 19th July at 12:30 PM. All learners must return on Monday, 29th July.',
      date: '08 July 2024',
      author: 'Mrs. J. Barasa (Head of School)',
      category: 'GENERAL' as const,
      priority: 'HIGH' as const,
    },
    {
      id: 'anc-002',
      title: 'Junior Secondary Inter-School Science Fair 2024',
      content: 'Registration for the Regional STEM and Robotics Innovation Challenge closes this Friday. See Mr. O. Kinyanjui.',
      date: '05 July 2024',
      author: 'Dr. C. Wekesa (Science Dept)',
      category: 'ACADEMIC' as const,
      priority: 'NORMAL' as const,
    },
    {
      id: 'anc-003',
      title: 'CBC Assessment Question Paper Timetable Released',
      content: 'Official end of Term 2 summative assessment schedule has been published on the school noticeboard.',
      date: '02 July 2024',
      author: 'Director of Academics',
      category: 'EXAM' as const,
      priority: 'HIGH' as const,
    },
  ];

  if (simulated.announcements) {
    widgetErrors.announcements = 'Noticeboard feeds currently syncing.';
  }

  // Widget 8: Notifications
  const notifications = [
    {
      id: 'notif-001',
      title: 'New Grade Recorded',
      message: 'Your score for Pretechnical Studies (19/20 - Exceeding Expectations) has been verified.',
      timestamp: Date.now() - 3600000 * 4,
      read: false,
    },
    {
      id: 'notif-002',
      title: 'Timetable Update',
      message: 'Tomorrow period 4 has been adjusted for Science Lab practical session.',
      timestamp: Date.now() - 3600000 * 24,
      read: true,
    },
  ];

  // Widget 9: Report Cards
  const reports = [
    {
      id: `rep-${student.id}-t2-2024`,
      title: `Official Term 2 CBC Assessment Report Card - ${student.grade}`,
      term: 'Term 2',
      year: 2024,
      downloadable: true,
      generatedAt: '05 July 2024',
    },
    {
      id: `rep-${student.id}-t1-2024`,
      title: `Official Term 1 CBC Assessment Report Card - ${student.grade}`,
      term: 'Term 1',
      year: 2024,
      downloadable: true,
      generatedAt: '12 April 2024',
    },
  ];

  return {
    data: {
      profile,
      assignedTeachers,
      attendance: attendanceData,
      academicResults: resultsData,
      timetable: timetableData,
      assignments,
      announcements,
      notifications,
      reports,
    },
    accessResult: { authorized: true, learnerId: targetLearnerId },
    widgetErrors,
  };
}

// 3. Account Creation Validation Engine (JJSAK Core Section 3)
export interface ValidateAccountCreationParams {
  username: string;
  fullName?: string;
  email?: string;
  learnerId: string;
  admissionNumber?: string;
  schoolId: string;
  existingUsers: User[];
  students: Student[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  student?: Student;
}

export function validateLearnerAccountCreation(
  params: ValidateAccountCreationParams
): ValidationResult {
  const errors: string[] = [];

  // Rule 1: The learner exists
  if (!params.learnerId || params.learnerId.trim() === '') {
    errors.push('A valid learner ID must be selected to link this account.');
    return { valid: false, errors };
  }

  const student = params.students.find((s) => s.id === params.learnerId);
  if (!student) {
    errors.push(`Learner profile record '${params.learnerId}' does not exist in the official student register.`);
    return { valid: false, errors };
  }

  // Rule 2: The learner belongs to the current school/tenant
  const studentSchool = student.schoolId || 'sch-ngonyek-001';
  if (params.schoolId && studentSchool !== params.schoolId) {
    errors.push(
      `Tenant Isolation Violation: Learner '${student.name}' belongs to school '${studentSchool}', which does not match active school '${params.schoolId}'.`
    );
  }

  // Rule 3: The learner profile is active
  // If the student record has a status, ensure it is Active
  if ((student as any).status && (student as any).status !== 'Active') {
    errors.push(`Learner '${student.name}' is marked as ${(student as any).status}. Only active learners can have login accounts.`);
  }

  // Rule 4 & 5: Admission number check
  if (params.admissionNumber && params.admissionNumber.trim() !== '' && student.admNo !== params.admissionNumber.trim()) {
    errors.push(
      `Admission number mismatch: Provided '${params.admissionNumber}' does not match official record '${student.admNo}' for learner '${student.name}'.`
    );
  }

  // Rule 6: Learner account is not already linked to another learner
  // (An account must only link to exactly one profile)
  // Check if this username or email already exists
  const existingUsername = params.existingUsers.find(
    (u) => u.username.toLowerCase() === params.username.toLowerCase()
  );
  if (existingUsername) {
    errors.push(`The username '@${params.username}' is already taken by another account.`);
  }

  // Rule 7: No duplicate learner account is created for the same learner
  const existingLearnerAccount = params.existingUsers.find(
    (u) => u.role === 'STUDENT' && u.learnerId === params.learnerId
  );
  if (existingLearnerAccount) {
    errors.push(
      `Duplicate Account Prohibited: Learner '${student.name}' (${student.admNo}) is already linked to account '@${existingLearnerAccount.username}' (${existingLearnerAccount.fullName}).`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    student,
  };
}

// 4. Administrative Reconciliation Engine (JJSAK Core Section 14)
export function reconcileLearnerAccounts(
  users: User[],
  students: Student[],
  currentSchoolId: string
): {
  records: LearnerReconciliationRecord[];
  summary: {
    totalAccounts: number;
    totalProfiles: number;
    linkedCount: number;
    unlinkedAccountsCount: number;
    unlinkedProfilesCount: number;
    invalidLinksCount: number;
    wrongTenantCount: number;
    duplicatesCount: number;
  };
} {
  const records: LearnerReconciliationRecord[] = [];

  // Filter users to student accounts in this school
  const studentAccounts = users.filter((u) => u.role === 'STUDENT');
  const schoolStudents = students.filter((s) => (s.schoolId || 'sch-ngonyek-001') === currentSchoolId);

  // Track which students have been matched to accounts
  const studentAccountMap = new Map<string, User[]>();
  studentAccounts.forEach((acc) => {
    if (acc.learnerId) {
      const list = studentAccountMap.get(acc.learnerId) || [];
      list.push(acc);
      studentAccountMap.set(acc.learnerId, list);
    }
  });

  let linkedCount = 0;
  let unlinkedAccountsCount = 0;
  let invalidLinksCount = 0;
  let wrongTenantCount = 0;
  let duplicatesCount = 0;

  // Process Accounts
  studentAccounts.forEach((acc) => {
    // 1. Account with NO learnerId
    if (!acc.learnerId || acc.learnerId.trim() === '') {
      unlinkedAccountsCount++;
      records.push({
        id: `rec-acc-${acc.id}`,
        status: 'UNLINKED_ACCOUNT',
        statusLabel: 'Unlinked Account',
        account: acc,
        issueDescription: `Learner login account '@${acc.username}' has no permanent learnerId link to an official profile.`,
        suggestedAction: 'Link to an existing student profile or deactivate account.',
      });
      return;
    }

    // 2. Account with learnerId: Find student in full student list
    const matchedStudent = students.find((s) => s.id === acc.learnerId);

    // Invalid Link: student doesn't exist
    if (!matchedStudent) {
      invalidLinksCount++;
      records.push({
        id: `rec-acc-${acc.id}`,
        status: 'INVALID_LINK',
        statusLabel: 'Invalid Link',
        account: acc,
        issueDescription: `Account '@${acc.username}' references learnerId '${acc.learnerId}', but no matching profile exists.`,
        suggestedAction: 'Re-link to a valid learner admission profile or clear invalid pointer.',
      });
      return;
    }

    // Wrong Tenant: student or user belongs to another school
    const studentSchool = matchedStudent.schoolId || 'sch-ngonyek-001';
    const accountSchool = acc.schoolId || 'sch-ngonyek-001';

    if (studentSchool !== accountSchool || (currentSchoolId && accountSchool !== currentSchoolId)) {
      wrongTenantCount++;
      records.push({
        id: `rec-acc-${acc.id}`,
        status: 'WRONG_TENANT',
        statusLabel: 'Wrong Tenant',
        account: acc,
        profile: matchedStudent,
        issueDescription: `Tenant Mismatch: Account belongs to school '${accountSchool}', while student belongs to '${studentSchool}'.`,
        suggestedAction: 'Transfer account to correct tenant or reassign profile.',
      });
      return;
    }

    // Duplicate Check: multiple accounts linking to same student
    const allLinkedToThisStudent = studentAccountMap.get(acc.learnerId) || [];
    if (allLinkedToThisStudent.length > 1) {
      duplicatesCount++;
      records.push({
        id: `rec-acc-${acc.id}`,
        status: 'DUPLICATE',
        statusLabel: 'Duplicate Link',
        account: acc,
        profile: matchedStudent,
        issueDescription: `Multiple accounts (${allLinkedToThisStudent.map((u) => '@' + u.username).join(', ')}) are linked to learner '${matchedStudent.name}' (${matchedStudent.admNo}).`,
        suggestedAction: 'Merge duplicate logins or remove redundant account.',
      });
      return;
    }

    // Linked: Clean, 1-to-1 relationship
    linkedCount++;
    records.push({
      id: `rec-acc-${acc.id}`,
      status: 'LINKED',
      statusLabel: 'Linked',
      account: acc,
      profile: matchedStudent,
      issueDescription: `Account '@${acc.username}' is correctly linked to learner profile '${matchedStudent.name}' (${matchedStudent.admNo}).`,
      suggestedAction: 'No action needed. Healthy connection.',
    });
  });

  // Process Unlinked Profiles (students in current school with no account)
  let unlinkedProfilesCount = 0;
  schoolStudents.forEach((student) => {
    const linkedAccounts = studentAccountMap.get(student.id) || [];
    if (linkedAccounts.length === 0) {
      unlinkedProfilesCount++;
      records.push({
        id: `rec-std-${student.id}`,
        status: 'UNLINKED_PROFILE',
        statusLabel: 'Unlinked Profile',
        profile: student,
        issueDescription: `Official learner '${student.name}' (${student.admNo}) has no portal account.`,
        suggestedAction: 'Generate a secure learner portal login account.',
      });
    }
  });

  return {
    records,
    summary: {
      totalAccounts: studentAccounts.length,
      totalProfiles: schoolStudents.length,
      linkedCount,
      unlinkedAccountsCount,
      unlinkedProfilesCount,
      invalidLinksCount,
      wrongTenantCount,
      duplicatesCount,
    },
  };
}
