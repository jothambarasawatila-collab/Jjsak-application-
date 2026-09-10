import { DayOfWeek } from './timetable';

export interface StreamConfig {
  id: string;
  code: string; // e.g. "7N", "7S", "8N", "8S", "9N", "9S"
  name: string; // e.g. "Grade 7 North"
  gradeLevel: 'Grade 7' | 'Grade 8' | 'Grade 9' | string;
  streamName: 'North' | 'South' | 'East' | 'West' | string;
  classTeacherId?: string;
  classTeacherName?: string;
  homeRoomId?: string;
  homeRoomName?: string;
  learnerCount: number;
  isActive: boolean;
  notes?: string;
}

export interface TeacherStreamAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  streamCodes: string[]; // e.g. ["7N", "8N", "9N"]
  lessonsPerWeekPerStream: number;
  hasDoubleLesson: boolean;
  isPractical: boolean;
  notes?: string;
}

export interface SubjectAllocationConfig {
  id: string;
  gradeLevel: string; // "Grade 7", "Grade 8", "Grade 9"
  subjectName: string;
  weeklyFrequency: number; // e.g. 5 for Maths, 4 for Science
  doubleLessonsCount: number; // e.g. 1 double lesson
  isPractical: boolean;
  isCompulsory: boolean; // true = compulsory, false = elective / optional
  specialRoomType?:
    | 'Science Lab'
    | 'Computer Lab'
    | 'Home Science Room'
    | 'Workshop'
    | 'Library'
    | 'Music Room'
    | 'Examination Hall'
    | 'Classroom'
    | 'Sports Facility';
}

export type BellScheduleSlotType = 'lesson' | 'short_break' | 'long_break' | 'lunch_break' | 'assembly' | 'games';

export interface BellScheduleSlot {
  id: string;
  periodNumber: number; // 1 to 10 for lessons, or break index
  academicPeriodNumber?: number; // 1 to 10
  label: string; // e.g. "Lesson 1", "Short Break", "Lunch Break"
  startTime: string; // "08:00 AM" or "08:00"
  endTime: string; // "08:40 AM" or "08:40"
  durationMinutes: number;
  isBreak: boolean;
  breakType?: 'short_break' | 'long_break' | 'lunch_break' | 'assembly' | 'games';
}

export interface OfficialBellSchedule {
  id: string;
  scheduleName: string;
  schoolOpeningTime: string; // "07:30 AM"
  schoolClosingTime: string; // "04:00 PM"
  daysActive: DayOfWeek[];
  includesSaturday: boolean;
  slots: BellScheduleSlot[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export type LearningSpaceType =
  | 'Science Lab'
  | 'Computer Lab'
  | 'Home Science Room'
  | 'Workshop'
  | 'Library'
  | 'Music Room'
  | 'Examination Hall'
  | 'Classroom'
  | 'Auditorium'
  | 'Sports Facility';

export interface LearningSpaceRoom {
  id: string;
  name: string; // "Junior Science Laboratory 1", "Computer Lab A", "Pretechnical & Drafting Workshop"
  type: LearningSpaceType;
  capacity: number;
  location: string;
  permittedGradeLevels: string[]; // e.g. ["Grade 7", "Grade 8", "Grade 9"]
  specialEquipment: string[];
  isAvailable: boolean;
  isReserved?: boolean;
  reservationReason?: string;
  reservationDate?: string;
  reservationPeriods?: number[];
  assignedStreams?: string[];
}

export interface RoomAllocationConflict {
  id: string;
  roomId: string;
  roomName: string;
  day: DayOfWeek;
  periodNumber: number;
  periodTime: string;
  conflictingClasses: string[];
  conflictingSubjects: string[];
  conflictingTeachers: string[];
  description: string;
  alternativeAvailableRooms: string[];
  severity: 'Critical' | 'Warning';
}

export interface ComprehensiveValidationReport {
  timestamp: string;
  validatedBy: string;
  validatedRole: string;
  passed: boolean;
  criticalFailuresCount: number;
  warningsCount: number;
  teacherClashes: Array<{
    teacherId: string;
    teacherName: string;
    day: DayOfWeek;
    periodNumber: number;
    conflictingStreams: string[];
    description: string;
    suggestedFix: string;
  }>;
  roomClashes: RoomAllocationConflict[];
  classClashes: Array<{
    streamCode: string;
    day: DayOfWeek;
    periodNumber: number;
    subjects: string[];
    teachers: string[];
    description: string;
  }>;
  teacherWorkloadConflicts: Array<{
    teacherId: string;
    teacherName: string;
    currentWorkload: number;
    weeklyCap: number;
    description: string;
  }>;
  missingSubjectQuotas: Array<{
    streamCode: string;
    subjectName: string;
    requiredWeekly: number;
    allocatedCount: number;
    description: string;
  }>;
  bellScheduleOverlaps: Array<{
    slotA: string;
    slotB: string;
    description: string;
  }>;
  summaryNote: string;
}

export interface TimetableDraftOrPublishedRecord {
  id: string;
  versionName: string;
  status: 'Draft' | 'Approved' | 'Published' | 'Archived';
  scheduledActivationDate?: string;
  publishedAt?: string;
  publishedBy?: string;
  reasonForChange: string;
  auditTrailId: string;
}
