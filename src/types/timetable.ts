export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export type EducationalLevel =
  | 'PP1'
  | 'PP2'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Form 1'
  | 'Form 2'
  | 'Form 3'
  | 'Form 4';

export interface TimeSlot {
  periodNumber: number; // 1 to 11
  academicPeriodNumber?: number; // 1 to 8 for teaching periods, undefined for breaks
  startTime: string; // "08:20"
  endTime: string; // "09:00"
  durationMinutes: number; // 40, 10, 20, 70
  isBreak?: boolean;
  breakType?: 'short_break' | 'long_break' | 'lunch_break' | 'assembly' | 'games';
  breakLabel?: string;
}

export interface FacilityResource {
  id: string;
  name: string; // "Junior Science Lab 1", "Computer Lab A", "Drafting Workshop", "Junior Hall A", "Main Sports Field", "School Farm Plot"
  type: 'Classroom' | 'Science Lab' | 'Computer Lab' | 'Library' | 'Workshop' | 'Agriculture Field' | 'Sports Facility' | 'Auditorium';
  capacity: number;
  location: string;
  isAvailable: boolean;
  specialEquipment?: string[];
}

export interface TeacherAvailability {
  teacherId: string;
  teacherName: string;
  subjectsTaught: string[];
  assignedClasses: string[];
  maxLessonsPerDay: number; // e.g. 6
  maxLessonsPerWeek: number; // e.g. 26
  availableDays: DayOfWeek[];
  unavailableDays: DayOfWeek[];
  preferredTeachingPeriods: number[]; // e.g. [1, 2, 3, 4] for morning
}

export interface TimetableLesson {
  id: string;
  day: DayOfWeek;
  periodNumber: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  className: string; // "G8 S", "G7 N", etc.
  room?: string;
  isDouble?: boolean;
  isTriple?: boolean;
  activityType?: 'academic' | 'practical' | 'games' | 'clubs' | 'ppi' | 'assembly' | 'clinic' | 'meeting' | 'project';
  activityTitle?: string;
  notes?: string;
  priorityLevel?: 'High' | 'Medium' | 'Standard';
  isLocked?: boolean;
  isSubstituted?: boolean;
  substituteTeacherName?: string;
  substituteTeacherId?: string;
}

export interface ClassTimetable {
  className: string;
  grade: string;
  stream: string;
  classTeacherName: string;
  lessons: TimetableLesson[];
}

export interface TimetableClash {
  id: string;
  type: 'teacher_double_booked' | 'room_conflict' | 'subject_overload' | 'resource_collision' | 'exam_overlap';
  day: DayOfWeek;
  periodNumber: number;
  periodTime: string;
  teacherName?: string;
  teacherId?: string;
  resourceName?: string;
  conflictingClasses: string[];
  description: string;
  suggestedFix?: string;
  severity: 'Critical' | 'Warning' | 'Notice';
}

export interface SchoolCalendarConfig {
  academicYear: number;
  academicTerm: string;
  schoolOpeningDate: string;
  schoolClosingDate: string;
  publicHolidays: { name: string; date: string }[];
  midTermBreaks: { title: string; startDate: string; endDate: string }[];
  nationalExamDates: { title: string; startDate: string; endDate: string }[];
}

export interface TimetableSettings {
  schoolName: string;
  term: string;
  year: number;
  periodsPerDay: number;
  periodDurationMinutes: number;
  prioritizeMorningCoreSubjects: boolean;
  allowDoubleLessonsForPracticals: boolean;
  maxConsecutivePeriodsPerTeacher: number;
  scheduledActivities: {
    mondayAssembly: boolean;
    tuesdayGames: boolean;
    wednesdayClubs: boolean;
    thursdayGames: boolean;
    fridayPpi: boolean;
  };
}

export interface TeacherSubstitutionRecord {
  id: string;
  date: string;
  day: DayOfWeek;
  periodNumber: number;
  periodTime: string;
  className: string;
  subject: string;
  absentTeacherId: string;
  absentTeacherName: string;
  absentReason: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  status: 'Draft' | 'Confirmed' | 'Completed' | 'Cancelled';
  assignedBy: string;
  assignedAt: string;
  notifiedChannels: ('In-App' | 'SMS' | 'Email' | 'WhatsApp')[];
  lessonPlanHandover?: string;
}

export interface TimetableAuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action:
    | 'GENERATION'
    | 'OPTIMIZATION'
    | 'LESSON_MOVE'
    | 'LESSON_EDIT'
    | 'SUBSTITUTION'
    | 'EXAM_SCHEDULE'
    | 'EXAM_CREATE'
    | 'EXAM_DELETE'
    | 'EXAM_SLOT_EDIT'
    | 'EXAM_INVIGILATOR_ASSIGN'
    | 'APPROVAL'
    | 'PUBLISH'
    | 'ARCHIVE'
    | 'ROLLBACK'
    | 'PERIOD_CONFIG'
    | 'CALENDAR_ADJUST'
    | 'UNAUTHORIZED_ATTEMPT';
  details: string;
  affectedClassOrTeacher?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  schoolId?: string;
  schoolName?: string;
  academicTerm?: string;
}

export interface TimetableVersion {
  versionId: string;
  versionName: string; // e.g. "Term 2 Master Timetable v3.2 (Approved)"
  createdAt: string;
  createdBy: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Published';
  approvedBy?: string;
  approvedAt?: string;
  efficiencyScore: number; // e.g. 96
  lessonsCount: number;
  lessonsSnapshot: TimetableLesson[];
}

export interface TimetableEfficiencyMetrics {
  overallEfficiencyScore: number; // 0 to 100
  teacherWorkloadBalanceScore: number;
  coreSubjectMorningAllocationRate: number; // %
  roomUtilizationRate: number; // %
  idlePeriodsMinimizedScore: number;
  zeroConflictsAchieved: boolean;
  totalLessons: number;
  totalTeachers: number;
  totalClasses: number;
  totalRooms: number;
  unassignedSlots: number;
}

export type ExamSessionTime =
  | 'Morning 1 (08:00 - 09:30)'
  | 'Morning 2 (10:30 - 12:00)'
  | 'Afternoon (14:00 - 15:30)';

export interface ExamSlot {
  id: string;
  examDate: string; // e.g. "Monday, 15 Jun 2026"
  day: DayOfWeek;
  session: ExamSessionTime;
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  durationMinutes: number; // 90
  subject: string;
  paperCode?: string; // "MATH-801"
  grade: string; // "G7", "G8", "G9", or "All Junior School"
  targetStreams: string[]; // ["G8 S", "G8 N"]
  room: string; // "Hall A", "Room 8", "Science Lab"
  invigilatorId: string;
  invigilatorName: string;
  reliefInvigilatorName?: string;
  maxMarks: number;
  status: 'Scheduled' | 'In Progress' | 'Scripts Collected' | 'Marked';
  notes?: string;
  specialInstructions?: string;
}

export interface AssessmentTimetable {
  id: string;
  title: string; // "Term 2 Mid-Term Examination 2026"
  term: string;
  year: number;
  examType:
    | 'Mid Term Exam'
    | 'End of Term Exam'
    | 'KJSEA Trial Mock'
    | 'Opener Exam'
    | 'Continuous Assessment'
    | 'CAT Exam'
    | 'Practical Assessment';
  startDate: string;
  endDate: string;
  targetGrades: string[];
  slots: ExamSlot[];
  generalInstructions: string[];
  chiefExaminer: string;
  status?: 'Draft' | 'Approved' | 'Published' | 'Archived';
  isPublished?: boolean;
  publishedBy?: string;
  publishedAt?: string;
  lastUpdated: string;
  updatedBy: string;
}

