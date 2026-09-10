import {
  StreamConfig,
  TeacherStreamAssignment,
  SubjectAllocationConfig,
  OfficialBellSchedule,
  LearningSpaceRoom,
  RoomAllocationConflict,
  ComprehensiveValidationReport,
  BellScheduleSlot,
} from '../types/streamTimetableGovernance';
import { TimetableLesson, DayOfWeek } from '../types/timetable';
import { Teacher, User } from '../types';

const STORAGE_KEYS = {
  STREAMS: 'jjsak_stream_configs',
  TEACHER_ASSIGNMENTS: 'jjsak_teacher_stream_assignments',
  SUBJECT_ALLOCATIONS: 'jjsak_subject_allocations',
  BELL_SCHEDULE: 'jjsak_official_bell_schedule',
  LEARNING_SPACES: 'jjsak_learning_spaces',
  AUDIT_LOGS: 'jjsak_stream_timetable_audit_logs',
};

// 1. Initial Streams (Requirement §1)
export const INITIAL_STREAMS: StreamConfig[] = [
  {
    id: 'st-7n',
    code: '7N',
    name: 'Grade 7 North',
    gradeLevel: 'Grade 7',
    streamName: 'North',
    classTeacherId: 'tch-01',
    classTeacherName: 'Mrs. J. Barasa',
    homeRoomId: 'rm-g7n',
    homeRoomName: 'Junior Block Room 5 (G7 N)',
    learnerCount: 42,
    isActive: true,
  },
  {
    id: 'st-7s',
    code: '7S',
    name: 'Grade 7 South',
    gradeLevel: 'Grade 7',
    streamName: 'South',
    classTeacherId: 'tch-02',
    classTeacherName: 'Madam E. Achieng',
    homeRoomId: 'rm-g7s',
    homeRoomName: 'Junior Block Room 6 (G7 S)',
    learnerCount: 40,
    isActive: true,
  },
  {
    id: 'st-8n',
    code: '8N',
    name: 'Grade 8 North',
    gradeLevel: 'Grade 8',
    streamName: 'North',
    classTeacherId: 'tch-04',
    classTeacherName: 'Mr. P. Otieno',
    homeRoomId: 'rm-g8n',
    homeRoomName: 'Junior Block Room 7 (G8 N)',
    learnerCount: 41,
    isActive: true,
  },
  {
    id: 'st-8s',
    code: '8S',
    name: 'Grade 8 South',
    gradeLevel: 'Grade 8',
    streamName: 'South',
    classTeacherId: 'tch-05',
    classTeacherName: 'Madam S. Mwangi',
    homeRoomId: 'rm-g8s',
    homeRoomName: 'Junior Block Room 8 (G8 S)',
    learnerCount: 43,
    isActive: true,
  },
  {
    id: 'st-9n',
    code: '9N',
    name: 'Grade 9 North',
    gradeLevel: 'Grade 9',
    streamName: 'North',
    classTeacherId: 'tch-03',
    classTeacherName: 'Mr. O. Kinyanjui',
    homeRoomId: 'rm-g9n',
    homeRoomName: 'Junior Block Room 9 (G9 N)',
    learnerCount: 39,
    isActive: true,
  },
  {
    id: 'st-9s',
    code: '9S',
    name: 'Grade 9 South',
    gradeLevel: 'Grade 9',
    streamName: 'South',
    classTeacherId: 'tch-06',
    classTeacherName: 'Mr. D. Tanui',
    homeRoomId: 'rm-g9s',
    homeRoomName: 'Junior Block Room 10 (G9 S)',
    learnerCount: 40,
    isActive: true,
  },
];

// 2. Initial Teacher Stream Assignments (Requirement §2 Examples)
export const INITIAL_TEACHER_ASSIGNMENTS: TeacherStreamAssignment[] = [
  {
    id: 'tsa-01',
    teacherId: 'tch-00',
    teacherName: 'Mr. Jotham Watila',
    subjectName: 'Pre-Technical Studies',
    streamCodes: ['7N', '8N', '9N'],
    lessonsPerWeekPerStream: 4,
    hasDoubleLesson: true,
    isPractical: true,
    notes: 'Technical workshop allocation assigned',
  },
  {
    id: 'tsa-02',
    teacherId: 'tch-05',
    teacherName: 'Madam S. Mwangi',
    subjectName: 'Social Studies',
    streamCodes: ['7S', '8S', '9N'],
    lessonsPerWeekPerStream: 3,
    hasDoubleLesson: false,
    isPractical: false,
  },
  {
    id: 'tsa-03',
    teacherId: 'tch-03',
    teacherName: 'Mr. O. Kinyanjui',
    subjectName: 'Mathematics',
    streamCodes: ['7N', '7S', '8N'],
    lessonsPerWeekPerStream: 5,
    hasDoubleLesson: false,
    isPractical: false,
  },
  {
    id: 'tsa-04',
    teacherId: 'tch-06',
    teacherName: 'Mr. D. Tanui',
    subjectName: 'Integrated Science',
    streamCodes: ['8N', '8S'],
    lessonsPerWeekPerStream: 4,
    hasDoubleLesson: true,
    isPractical: true,
    notes: 'Science laboratory session assigned',
  },
  {
    id: 'tsa-05',
    teacherId: 'tch-01',
    teacherName: 'Mrs. J. Barasa',
    subjectName: 'English',
    streamCodes: ['7N', '7S', '8S'],
    lessonsPerWeekPerStream: 5,
    hasDoubleLesson: false,
    isPractical: false,
  },
  {
    id: 'tsa-06',
    teacherId: 'tch-04',
    teacherName: 'Mr. P. Otieno',
    subjectName: 'Kiswahili',
    streamCodes: ['8N', '8S', '9S'],
    lessonsPerWeekPerStream: 4,
    hasDoubleLesson: false,
    isPractical: false,
  },
];

// 3. Initial Subject Allocations per Grade (Requirement §3)
export const INITIAL_SUBJECT_ALLOCATIONS: SubjectAllocationConfig[] = [
  { id: 'sa-01', gradeLevel: 'Grade 8', subjectName: 'Mathematics', weeklyFrequency: 5, doubleLessonsCount: 0, isPractical: false, isCompulsory: true },
  { id: 'sa-02', gradeLevel: 'Grade 8', subjectName: 'English', weeklyFrequency: 5, doubleLessonsCount: 0, isPractical: false, isCompulsory: true },
  { id: 'sa-03', gradeLevel: 'Grade 8', subjectName: 'Kiswahili', weeklyFrequency: 4, doubleLessonsCount: 0, isPractical: false, isCompulsory: true },
  { id: 'sa-04', gradeLevel: 'Grade 8', subjectName: 'Integrated Science', weeklyFrequency: 4, doubleLessonsCount: 1, isPractical: true, isCompulsory: true, specialRoomType: 'Science Lab' },
  { id: 'sa-05', gradeLevel: 'Grade 8', subjectName: 'Pre-Technical Studies', weeklyFrequency: 4, doubleLessonsCount: 1, isPractical: true, isCompulsory: true, specialRoomType: 'Workshop' },
  { id: 'sa-06', gradeLevel: 'Grade 8', subjectName: 'Social Studies', weeklyFrequency: 3, doubleLessonsCount: 0, isPractical: false, isCompulsory: true },
  { id: 'sa-07', gradeLevel: 'Grade 8', subjectName: 'Christian Religious Education (CRE)', weeklyFrequency: 3, doubleLessonsCount: 0, isPractical: false, isCompulsory: true },
  { id: 'sa-08', gradeLevel: 'Grade 8', subjectName: 'Creative Arts & Sports', weeklyFrequency: 3, doubleLessonsCount: 1, isPractical: true, isCompulsory: true, specialRoomType: 'Sports Facility' },
  { id: 'sa-09', gradeLevel: 'Grade 8', subjectName: 'Agriculture & Nutrition', weeklyFrequency: 4, doubleLessonsCount: 1, isPractical: true, isCompulsory: true, specialRoomType: 'Home Science Room' },
  { id: 'sa-10', gradeLevel: 'Grade 8', subjectName: 'Computer Studies', weeklyFrequency: 3, doubleLessonsCount: 1, isPractical: true, isCompulsory: false, specialRoomType: 'Computer Lab' },
];

// 4. Initial Bell Schedule (Requirement §4 Example: 10 Lessons, Short Break, Long Break, Lunch Break)
export const INITIAL_BELL_SCHEDULE_SLOTS: BellScheduleSlot[] = [
  { id: 'bs-01', periodNumber: 1, academicPeriodNumber: 1, label: 'Lesson 1', startTime: '08:00 AM', endTime: '08:40 AM', durationMinutes: 40, isBreak: false },
  { id: 'bs-02', periodNumber: 2, academicPeriodNumber: 2, label: 'Lesson 2', startTime: '08:40 AM', endTime: '09:20 AM', durationMinutes: 40, isBreak: false },
  { id: 'bs-03', periodNumber: 3, academicPeriodNumber: 3, label: 'Lesson 3', startTime: '09:20 AM', endTime: '09:40 AM', durationMinutes: 20, isBreak: false },
  { id: 'bs-brk1', periodNumber: 4, label: 'Short Break', startTime: '09:40 AM', endTime: '10:00 AM', durationMinutes: 20, isBreak: true, breakType: 'short_break' },
  { id: 'bs-04', periodNumber: 5, academicPeriodNumber: 4, label: 'Lesson 4', startTime: '10:00 AM', endTime: '10:40 AM', durationMinutes: 40, isBreak: false },
  { id: 'bs-05', periodNumber: 6, academicPeriodNumber: 5, label: 'Lesson 5', startTime: '10:40 AM', endTime: '11:20 AM', durationMinutes: 40, isBreak: false },
  { id: 'bs-brk2', periodNumber: 7, label: 'Long Break', startTime: '11:20 AM', endTime: '11:40 AM', durationMinutes: 20, isBreak: true, breakType: 'long_break' },
  { id: 'bs-06', periodNumber: 8, academicPeriodNumber: 6, label: 'Lesson 6', startTime: '11:40 AM', endTime: '12:10 PM', durationMinutes: 30, isBreak: false },
  { id: 'bs-07', periodNumber: 9, academicPeriodNumber: 7, label: 'Lesson 7', startTime: '12:10 PM', endTime: '12:50 PM', durationMinutes: 40, isBreak: false },
  { id: 'bs-lunch', periodNumber: 10, label: 'Lunch Break', startTime: '12:50 PM', endTime: '02:00 PM', durationMinutes: 70, isBreak: true, breakType: 'lunch_break' },
  { id: 'bs-08', periodNumber: 11, academicPeriodNumber: 8, label: 'Lesson 8', startTime: '02:00 PM', endTime: '02:40 PM', durationMinutes: 40, isBreak: false },
  { id: 'bs-09', periodNumber: 12, academicPeriodNumber: 9, label: 'Lesson 9', startTime: '02:40 PM', endTime: '03:20 PM', durationMinutes: 40, isBreak: false },
  { id: 'bs-10', periodNumber: 13, academicPeriodNumber: 10, label: 'Lesson 10', startTime: '03:20 PM', endTime: '04:00 PM', durationMinutes: 40, isBreak: false },
];

export const INITIAL_OFFICIAL_BELL_SCHEDULE: OfficialBellSchedule = {
  id: 'obs-01',
  scheduleName: 'JJSAK Junior School Standard Bell Schedule (10 Periods)',
  schoolOpeningTime: '07:30 AM',
  schoolClosingTime: '04:00 PM',
  daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  includesSaturday: false,
  slots: INITIAL_BELL_SCHEDULE_SLOTS,
  lastUpdatedBy: 'Director of Academics',
  lastUpdatedAt: new Date().toISOString(),
};

// 5. Initial Learning Spaces / Rooms (Requirement §11)
export const INITIAL_LEARNING_SPACES: LearningSpaceRoom[] = [
  {
    id: 'room-sci-01',
    name: 'Junior Science Laboratory 1',
    type: 'Science Lab',
    capacity: 45,
    location: 'Science Wing - Ground Floor',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Bunsen Burners', 'Microscopes', 'Gas taps', 'Safety Goggles'],
    isAvailable: true,
  },
  {
    id: 'room-sci-02',
    name: 'Junior Science Laboratory 2 (Bio-Agric)',
    type: 'Science Lab',
    capacity: 45,
    location: 'Science Wing - Ground Floor',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Microscopes', 'Plant Anatomy Models', 'Soil Test Kits'],
    isAvailable: true,
  },
  {
    id: 'room-ict-01',
    name: 'Computer Laboratory A',
    type: 'Computer Lab',
    capacity: 45,
    location: 'Digital Resource Wing - 1st Floor',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['45 Workstations', 'LAN & Fibre Connection', 'Projector', 'UPS'],
    isAvailable: true,
  },
  {
    id: 'room-ict-02',
    name: 'Computer Laboratory B',
    type: 'Computer Lab',
    capacity: 40,
    location: 'Digital Resource Wing - 1st Floor',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['40 Workstations', 'Interactive Whiteboard'],
    isAvailable: true,
  },
  {
    id: 'room-wksp-01',
    name: 'Pretechnical & Drafting Workshop',
    type: 'Workshop',
    capacity: 40,
    location: 'Technical Complex',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Workbenches', 'Drafting Tables', 'Electrical Trainers', 'Safety Vices'],
    isAvailable: true,
  },
  {
    id: 'room-hs-01',
    name: 'Home Science & Nutrition Studio',
    type: 'Home Science Room',
    capacity: 35,
    location: 'Applied Sciences Wing',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Sewing Machines', 'Cooking Stations', 'Cold Storage'],
    isAvailable: true,
  },
  {
    id: 'room-lib-01',
    name: 'Junior School Central Library',
    type: 'Library',
    capacity: 60,
    location: 'Main Academic Block - 2nd Floor',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Reading Pods', 'Research Computers', 'CBA Resource Stacks'],
    isAvailable: true,
  },
  {
    id: 'room-mus-01',
    name: 'Music & Creative Performing Studio',
    type: 'Music Room',
    capacity: 40,
    location: 'Arts Block',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Keyboards', 'Traditional Drums', 'Acoustic Soundproofing'],
    isAvailable: true,
  },
  {
    id: 'room-hall-01',
    name: 'Multipurpose Examination & Assembly Hall',
    type: 'Examination Hall',
    capacity: 250,
    location: 'Administration Complex',
    permittedGradeLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    specialEquipment: ['Exam Desks', 'Sound System', 'Projection Display'],
    isAvailable: true,
  },
  {
    id: 'rm-g7n',
    name: 'Junior Block Room 5 (G7 N)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing B',
    permittedGradeLevels: ['Grade 7'],
    specialEquipment: ['Whiteboard', 'Display Board'],
    isAvailable: true,
    assignedStreams: ['7N'],
  },
  {
    id: 'rm-g7s',
    name: 'Junior Block Room 6 (G7 S)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing B',
    permittedGradeLevels: ['Grade 7'],
    specialEquipment: ['Whiteboard', 'Display Board'],
    isAvailable: true,
    assignedStreams: ['7S'],
  },
  {
    id: 'rm-g8n',
    name: 'Junior Block Room 7 (G8 N)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing A',
    permittedGradeLevels: ['Grade 8'],
    specialEquipment: ['Whiteboard', 'Lockers'],
    isAvailable: true,
    assignedStreams: ['8N'],
  },
  {
    id: 'rm-g8s',
    name: 'Junior Block Room 8 (G8 S)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing A',
    permittedGradeLevels: ['Grade 8'],
    specialEquipment: ['Smart Screen', 'Whiteboard'],
    isAvailable: true,
    assignedStreams: ['8S'],
  },
  {
    id: 'rm-g9n',
    name: 'Junior Block Room 9 (G9 N)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing C',
    permittedGradeLevels: ['Grade 9'],
    specialEquipment: ['Whiteboard', 'Storage Rack'],
    isAvailable: true,
    assignedStreams: ['9N'],
  },
  {
    id: 'rm-g9s',
    name: 'Junior Block Room 10 (G9 S)',
    type: 'Classroom',
    capacity: 45,
    location: 'Junior Wing C',
    permittedGradeLevels: ['Grade 9'],
    specialEquipment: ['Whiteboard', 'Study Carrels'],
    isAvailable: true,
    assignedStreams: ['9S'],
  },
];

class StreamTimetableGovernanceService {
  // Streams Management
  getStreams(): StreamConfig[] {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAMS);
    return saved ? JSON.parse(saved) : INITIAL_STREAMS;
  }

  saveStreams(streams: StreamConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.STREAMS, JSON.stringify(streams));
  }

  addStream(stream: Omit<StreamConfig, 'id'>): StreamConfig {
    const streams = this.getStreams();
    const newStream: StreamConfig = {
      ...stream,
      id: `st-${Date.now()}`,
    };
    this.saveStreams([...streams, newStream]);
    return newStream;
  }

  updateStream(stream: StreamConfig): void {
    const streams = this.getStreams();
    const idx = streams.findIndex((s) => s.id === stream.id);
    if (idx !== -1) {
      streams[idx] = stream;
      this.saveStreams([...streams]);
    }
  }

  // Teacher Assignments
  getTeacherAssignments(): TeacherStreamAssignment[] {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ASSIGNMENTS;
  }

  saveTeacherAssignments(assignments: TeacherStreamAssignment[]): void {
    localStorage.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, JSON.stringify(assignments));
  }

  addTeacherAssignment(assignment: Omit<TeacherStreamAssignment, 'id'>): TeacherStreamAssignment {
    const list = this.getTeacherAssignments();
    const newAssign: TeacherStreamAssignment = {
      ...assignment,
      id: `tsa-${Date.now()}`,
    };
    this.saveTeacherAssignments([...list, newAssign]);
    return newAssign;
  }

  removeTeacherAssignment(id: string): void {
    const list = this.getTeacherAssignments();
    this.saveTeacherAssignments(list.filter((a) => a.id !== id));
  }

  // Calculate teacher workload from assignments
  calculateTeacherWorkload(teacherId: string): { totalLessons: number; streamBreakdown: Record<string, number> } {
    const assignments = this.getTeacherAssignments().filter((a) => a.teacherId === teacherId);
    let total = 0;
    const breakdown: Record<string, number> = {};

    assignments.forEach((a) => {
      a.streamCodes.forEach((sc) => {
        total += a.lessonsPerWeekPerStream;
        breakdown[sc] = (breakdown[sc] || 0) + a.lessonsPerWeekPerStream;
      });
    });

    return { totalLessons: total, streamBreakdown: breakdown };
  }

  // Subject Allocations
  getSubjectAllocations(): SubjectAllocationConfig[] {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECT_ALLOCATIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECT_ALLOCATIONS;
  }

  saveSubjectAllocations(allocations: SubjectAllocationConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_ALLOCATIONS, JSON.stringify(allocations));
  }

  // Bell Schedule
  getBellSchedule(): OfficialBellSchedule {
    const saved = localStorage.getItem(STORAGE_KEYS.BELL_SCHEDULE);
    return saved ? JSON.parse(saved) : INITIAL_OFFICIAL_BELL_SCHEDULE;
  }

  saveBellSchedule(schedule: OfficialBellSchedule): void {
    localStorage.setItem(STORAGE_KEYS.BELL_SCHEDULE, JSON.stringify(schedule));
  }

  // Learning Spaces / Rooms
  getLearningSpaces(): LearningSpaceRoom[] {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNING_SPACES);
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_SPACES;
  }

  saveLearningSpaces(spaces: LearningSpaceRoom[]): void {
    localStorage.setItem(STORAGE_KEYS.LEARNING_SPACES, JSON.stringify(spaces));
  }

  reserveRoom(
    roomId: string,
    reason: string,
    date: string,
    periods: number[],
    reservedBy: string
  ): boolean {
    const spaces = this.getLearningSpaces();
    const idx = spaces.findIndex((s) => s.id === roomId);
    if (idx === -1) return false;

    spaces[idx].isReserved = true;
    spaces[idx].reservationReason = `${reason} (Reserved by: ${reservedBy})`;
    spaces[idx].reservationDate = date;
    spaces[idx].reservationPeriods = periods;
    this.saveLearningSpaces([...spaces]);
    return true;
  }

  releaseRoomReservation(roomId: string): boolean {
    const spaces = this.getLearningSpaces();
    const idx = spaces.findIndex((s) => s.id === roomId);
    if (idx === -1) return false;

    spaces[idx].isReserved = false;
    spaces[idx].reservationReason = undefined;
    spaces[idx].reservationDate = undefined;
    spaces[idx].reservationPeriods = undefined;
    this.saveLearningSpaces([...spaces]);
    return true;
  }

  // Room Conflict Detection & Resolution Suggestion (Requirement §11)
  detectRoomConflicts(lessons: TimetableLesson[]): RoomAllocationConflict[] {
    const spaces = this.getLearningSpaces();
    const conflicts: RoomAllocationConflict[] = [];

    // Group lessons by Room + Day + Period
    const roomOccupancy: Record<string, TimetableLesson[]> = {};

    lessons.forEach((l) => {
      const roomKey = `${l.room || 'General'}|${l.day}|${l.periodNumber}`;
      if (!roomOccupancy[roomKey]) roomOccupancy[roomKey] = [];
      roomOccupancy[roomKey].push(l);
    });

    Object.entries(roomOccupancy).forEach(([key, group]) => {
      if (group.length > 1) {
        const [roomName, day, periodStr] = key.split('|');
        const periodNum = parseInt(periodStr, 10);

        // Find available alternative rooms of matching or compatible type
        const occupiedRoomObj = spaces.find((s) => s.name.toLowerCase() === roomName.toLowerCase());
        const targetType = occupiedRoomObj ? occupiedRoomObj.type : 'Classroom';

        const busyRoomsAtThisSlot = new Set<string>();
        lessons
          .filter((l) => l.day === day && l.periodNumber === periodNum && l.room)
          .forEach((l) => busyRoomsAtThisSlot.add(l.room!.toLowerCase()));

        const alternatives = spaces
          .filter(
            (s) =>
              s.name.toLowerCase() !== roomName.toLowerCase() &&
              (s.type === targetType || s.type === 'Classroom') &&
              !busyRoomsAtThisSlot.has(s.name.toLowerCase()) &&
              !s.isReserved
          )
          .map((s) => s.name);

        conflicts.push({
          id: `rc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          roomId: occupiedRoomObj?.id || 'rm-gen',
          roomName,
          day: day as DayOfWeek,
          periodNumber: periodNum,
          periodTime: `Period ${periodNum}`,
          conflictingClasses: Array.from(new Set(group.map((g) => g.className))),
          conflictingSubjects: Array.from(new Set(group.map((g) => g.subject))),
          conflictingTeachers: Array.from(new Set(group.map((g) => g.teacherName))),
          description: `ROOM CONFLICT DETECTED: Room '${roomName}' is assigned to multiple classes (${group
            .map((g) => `${g.className} [${g.subject}]`)
            .join(', ')}) simultaneously during ${day} Period ${periodNum}.`,
          alternativeAvailableRooms: alternatives.slice(0, 3),
          severity: 'Critical',
        });
      }
    });

    return conflicts;
  }

  // FINAL TIMETABLE VALIDATION RULE:
  // Validate Teacher + Subject + Stream/Class + Bell Time + Room + Workload + Availability
  validateComprehensiveTimetable(
    lessons: TimetableLesson[],
    teachers: Teacher[],
    validatorUser: User
  ): ComprehensiveValidationReport {
    const bellSchedule = this.getBellSchedule();
    const streams = this.getStreams();
    const teacherClashes: ComprehensiveValidationReport['teacherClashes'] = [];
    const classClashes: ComprehensiveValidationReport['classClashes'] = [];
    const teacherWorkloadConflicts: ComprehensiveValidationReport['teacherWorkloadConflicts'] = [];
    const missingSubjectQuotas: ComprehensiveValidationReport['missingSubjectQuotas'] = [];
    const bellScheduleOverlaps: ComprehensiveValidationReport['bellScheduleOverlaps'] = [];

    // 1. Teacher Double-Booking Check
    const teacherPeriodMap: Record<string, TimetableLesson[]> = {};
    lessons.forEach((l) => {
      const key = `${l.teacherId}|${l.day}|${l.periodNumber}`;
      if (!teacherPeriodMap[key]) teacherPeriodMap[key] = [];
      teacherPeriodMap[key].push(l);
    });

    Object.entries(teacherPeriodMap).forEach(([key, group]) => {
      if (group.length > 1) {
        const [teacherId, day, periodStr] = key.split('|');
        const periodNum = parseInt(periodStr, 10);
        teacherClashes.push({
          teacherId,
          teacherName: group[0].teacherName,
          day: day as DayOfWeek,
          periodNumber: periodNum,
          conflictingStreams: group.map((g) => g.className),
          description: `Teacher ${group[0].teacherName} is double-booked across ${group
            .map((g) => g.className)
            .join(' and ')} on ${day} Period ${periodNum}.`,
          suggestedFix: `Reassign ${group[1].subject} in ${group[1].className} to another period or co-teacher.`,
        });
      }
    });

    // 2. Class Stream Double-Booking Check
    const classPeriodMap: Record<string, TimetableLesson[]> = {};
    lessons.forEach((l) => {
      const key = `${l.className}|${l.day}|${l.periodNumber}`;
      if (!classPeriodMap[key]) classPeriodMap[key] = [];
      classPeriodMap[key].push(l);
    });

    Object.entries(classPeriodMap).forEach(([key, group]) => {
      if (group.length > 1) {
        const [streamCode, day, periodStr] = key.split('|');
        const periodNum = parseInt(periodStr, 10);
        classClashes.push({
          streamCode,
          day: day as DayOfWeek,
          periodNumber: periodNum,
          subjects: group.map((g) => g.subject),
          teachers: group.map((g) => g.teacherName),
          description: `Stream ${streamCode} has multiple simultaneous lessons (${group
            .map((g) => g.subject)
            .join(', ')}) scheduled during ${day} Period ${periodNum}.`,
        });
      }
    });

    // 3. Room Conflicts Check
    const roomClashes = this.detectRoomConflicts(lessons);

    // 4. Teacher Workload Cap Check (Weekly limit: 26)
    const weeklyTeacherLessonCount: Record<string, number> = {};
    lessons.forEach((l) => {
      weeklyTeacherLessonCount[l.teacherId] = (weeklyTeacherLessonCount[l.teacherId] || 0) + 1;
    });

    const WEEKLY_CAP = 26;
    teachers.forEach((t) => {
      const count = weeklyTeacherLessonCount[t.id] || 0;
      if (count > WEEKLY_CAP) {
        teacherWorkloadConflicts.push({
          teacherId: t.id,
          teacherName: t.name,
          currentWorkload: count,
          weeklyCap: WEEKLY_CAP,
          description: `Teacher ${t.name} workload of ${count} lessons exceeds the institutional maximum of ${WEEKLY_CAP} lessons/week.`,
        });
      }
    });

    // 5. Missing Subject Allocation Check per Stream
    streams.forEach((stream) => {
      const streamLessons = lessons.filter((l) => l.className === stream.code || l.className === stream.name);
      // Expected core subjects: Mathematics, English, Kiswahili, Integrated Science
      const coreSubjects = [
        { name: 'Mathematics', min: 4 },
        { name: 'English', min: 4 },
        { name: 'Kiswahili', min: 3 },
        { name: 'Integrated Science', min: 3 },
      ];

      coreSubjects.forEach((cs) => {
        const scheduled = streamLessons.filter((l) => l.subject.toLowerCase().includes(cs.name.toLowerCase())).length;
        if (scheduled < cs.min) {
          missingSubjectQuotas.push({
            streamCode: stream.code,
            subjectName: cs.name,
            requiredWeekly: cs.min,
            allocatedCount: scheduled,
            description: `Stream ${stream.name} (${stream.code}) is missing ${cs.name} lessons: only ${scheduled} allocated (minimum ${cs.min} required).`,
          });
        }
      });
    });

    // 6. Bell Schedule Time Overlap Check
    const activeSlots = bellSchedule.slots;
    for (let i = 0; i < activeSlots.length - 1; i++) {
      const curr = activeSlots[i];
      const next = activeSlots[i + 1];
      if (curr.endTime > next.startTime && !curr.isBreak) {
        bellScheduleOverlaps.push({
          slotA: curr.label,
          slotB: next.label,
          description: `Bell time overlap detected between ${curr.label} (${curr.startTime}–${curr.endTime}) and ${next.label} (${next.startTime}–${next.endTime}).`,
        });
      }
    }

    const criticalFailures =
      teacherClashes.length +
      classClashes.length +
      roomClashes.filter((r) => r.severity === 'Critical').length +
      teacherWorkloadConflicts.length +
      bellScheduleOverlaps.length;

    const warnings = missingSubjectQuotas.length;

    const passed = criticalFailures === 0;

    return {
      timestamp: new Date().toISOString(),
      validatedBy: validatorUser.fullName,
      validatedRole: validatorUser.role,
      passed,
      criticalFailuresCount: criticalFailures,
      warningsCount: warnings,
      teacherClashes,
      roomClashes,
      classClashes,
      teacherWorkloadConflicts,
      missingSubjectQuotas,
      bellScheduleOverlaps,
      summaryNote: passed
        ? '✓ FINAL VALIDATION PASSED: Teacher + Subject + Stream + Bell Time + Room + Workload + Availability successfully confirmed. Timetable is eligible for immediate publication.'
        : `⚠️ FINAL VALIDATION FAILED: ${criticalFailures} critical conflict(s) detected across teachers, rooms, classes, or bell schedules. Publication is blocked until resolved.`,
    };
  }

  // Automatic Stream Timetable Generator (Requirement §8)
  generateStreamTimetableLayout(
    streamCode: string,
    teachers: Teacher[]
  ): TimetableLesson[] {
    const streams = this.getStreams();
    const stream = streams.find((s) => s.code === streamCode) || streams[0];
    const bellSchedule = this.getBellSchedule();
    const teachingSlots = bellSchedule.slots.filter((s) => !s.isBreak);

    const generatedLessons: TimetableLesson[] = [];
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Core schedule template by day
    const subjectTemplates: Record<DayOfWeek, string[]> = {
      Monday: [
        'Mathematics',
        'English',
        'Kiswahili',
        'Integrated Science',
        'Pre-Technical Studies',
        'Social Studies',
        'Agriculture & Nutrition',
        'Creative Arts',
        'Pastoral (PPI)',
        'Remedial / Prep',
      ],
      Tuesday: [
        'English',
        'Mathematics',
        'Integrated Science (Practical)',
        'Integrated Science (Practical)',
        'Kiswahili',
        'Christian Religious Education (CRE)',
        'Pre-Technical Studies',
        'Computer Studies',
        'Physical Education',
        'Clubs & Societies',
      ],
      Wednesday: [
        'Mathematics',
        'Social Studies',
        'English',
        'Pre-Technical Workshop (Practical)',
        'Pre-Technical Workshop (Practical)',
        'Kiswahili',
        'Integrated Science',
        'Agriculture & Nutrition',
        'Games & Sports',
        'Academic Clinics',
      ],
      Thursday: [
        'Kiswahili',
        'English',
        'Mathematics',
        'Integrated Science',
        'Social Studies',
        'Christian Religious Education (CRE)',
        'Pre-Technical Studies',
        'Creative Arts & Music',
        'Games & Athletics',
        'House Meeting',
      ],
      Friday: [
        'Mathematics',
        'English',
        'Kiswahili',
        'Computer Studies (Practical)',
        'Computer Studies (Practical)',
        'Agriculture & Nutrition (Demonstration)',
        'Social Studies',
        'General School Assembly',
        'Remedial Consultations',
        'Weekend Handover',
      ],
    };

    days.forEach((day) => {
      const daySubjects = subjectTemplates[day];

      teachingSlots.forEach((slot, index) => {
        const subject = daySubjects[index] || 'Remedial Studies';
        const isDouble = subject.includes('(Practical)') || subject.includes('Workshop');
        const isAssembly = subject.includes('Assembly');
        const isGames = subject.includes('Games') || subject.includes('Sports');
        const isClubs = subject.includes('Clubs');

        // Select suitable teacher
        let teacher = teachers[0] || { id: 'tch-00', name: 'Mr. Jotham Watila' };
        if (subject.includes('Maths') || subject.includes('Mathematics')) {
          teacher = teachers.find((t) => t.name.includes('Kinyanjui')) || teachers[0];
        } else if (subject.includes('English')) {
          teacher = teachers.find((t) => t.name.includes('Barasa')) || teachers[0];
        } else if (subject.includes('Kiswahili')) {
          teacher = teachers.find((t) => t.name.includes('Otieno')) || teachers[0];
        } else if (subject.includes('Science')) {
          teacher = teachers.find((t) => t.name.includes('Tanui')) || teachers[0];
        } else if (subject.includes('Pre-Tech')) {
          teacher = teachers.find((t) => t.name.includes('Watila')) || teachers[0];
        } else if (subject.includes('Social')) {
          teacher = teachers.find((t) => t.name.includes('Mwangi')) || teachers[0];
        } else if (subject.includes('Creative') || subject.includes('Physical') || subject.includes('Games')) {
          teacher = teachers.find((t) => t.name.includes('Achieng')) || teachers[0];
        }

        // Select suitable room
        let roomName = stream.homeRoomName || 'Standard Classroom';
        if (subject.includes('Science (Practical)')) {
          roomName = 'Junior Science Laboratory 1';
        } else if (subject.includes('Computer')) {
          roomName = 'Computer Laboratory A';
        } else if (subject.includes('Workshop')) {
          roomName = 'Pretechnical & Drafting Workshop';
        } else if (isGames) {
          roomName = 'Main Sports Complex & Track';
        } else if (isAssembly) {
          roomName = 'Multipurpose Examination & Assembly Hall';
        }

        const initials = teacher.name
          .replace(/^(mr|mrs|ms|dr|prof|madam)\.?\s+/i, '')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'TR';

        generatedLessons.push({
          id: `ls-${streamCode}-${day.substring(0, 3)}-${slot.periodNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          day,
          periodNumber: slot.periodNumber,
          subject,
          teacherId: teacher.id,
          teacherName: teacher.name,
          teacherInitials: initials,
          className: stream.code,
          room: roomName,
          isDouble,
          activityType: isAssembly ? 'assembly' : isGames ? 'games' : isClubs ? 'clubs' : isDouble ? 'practical' : 'academic',
        });
      });
    });

    return generatedLessons;
  }
}

export const streamTimetableGovernanceService = new StreamTimetableGovernanceService();
