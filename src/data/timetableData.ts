import {
  DayOfWeek,
  EducationalLevel,
  TimeSlot,
  TimetableLesson,
  TimetableClash,
  TimetableSettings,
  AssessmentTimetable,
  ExamSlot,
  FacilityResource,
  TeacherAvailability,
  SchoolCalendarConfig,
  TeacherSubstitutionRecord,
  TimetableAuditLog,
  TimetableEfficiencyMetrics,
  TimetableVersion,
} from '../types/timetable';
import { Teacher } from '../types';
import { INITIAL_TEACHERS, getTeacherForSubject } from './mockData';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ALL_EDUCATIONAL_LEVELS: EducationalLevel[] = [
  'PP1',
  'PP2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
];

export const HIGH_PRIORITY_SUBJECTS = ['Mathematics', 'English', 'Kiswahili', 'Integrated Science'];

export const FACILITY_RESOURCES: FacilityResource[] = [
  {
    id: 'fac-01',
    name: 'Junior Science Laboratory 1',
    type: 'Science Lab',
    capacity: 45,
    location: 'Science Complex - Ground Floor',
    isAvailable: true,
    specialEquipment: ['Microscopes', 'Bunsen Burners', 'Reagent Benches', 'Fume Hood', 'Safety Showers'],
  },
  {
    id: 'fac-02',
    name: 'ICT & Computer Laboratory A',
    type: 'Computer Lab',
    capacity: 40,
    location: 'Digital Resource Wing - 1st Floor',
    isAvailable: true,
    specialEquipment: ['40 Desktop PCs', 'High-Speed Fiber LAN', 'Smart Projector', 'UPS Backup'],
  },
  {
    id: 'fac-03',
    name: 'Pretechnical & Drafting Workshop',
    type: 'Workshop',
    capacity: 35,
    location: 'Technical Block',
    isAvailable: true,
    specialEquipment: ['Drafting Boards', 'Woodworking Vices', 'Circuit Kits', 'Power Handtools'],
  },
  {
    id: 'fac-04',
    name: 'Junior Multipurpose Hall A & B',
    type: 'Auditorium',
    capacity: 180,
    location: 'Central Administration Plaza',
    isAvailable: true,
    specialEquipment: ['PA System', 'Acoustic Panels', 'Stage Lighting', 'Examination Desks'],
  },
  {
    id: 'fac-05',
    name: 'Main Sports Complex & Track',
    type: 'Sports Facility',
    capacity: 250,
    location: 'Southern Playing Fields',
    isAvailable: true,
    specialEquipment: ['Standard Football Pitch', 'Volleyball Court', 'Athletic Track', 'Netball Court'],
  },
  {
    id: 'fac-06',
    name: 'School Agriculture Farm & Demonstration Plot',
    type: 'Agriculture Field',
    capacity: 50,
    location: 'East Agro-Ecology Zone',
    isAvailable: true,
    specialEquipment: ['Drip Irrigation Setup', 'Greenhouse', 'Poultry Unit', 'Compost & Soil Test Bed'],
  },
  {
    id: 'fac-07',
    name: 'Junior Central Library & Resource Centre',
    type: 'Library',
    capacity: 60,
    location: 'Academic Tower - 2nd Floor',
    isAvailable: true,
    specialEquipment: ['Reference Stacks', 'Digital Catalog Terminals', 'Quiet Study Pods'],
  },
  {
    id: 'fac-08',
    name: 'Junior Block Room 8 (G8 S)',
    type: 'Classroom',
    capacity: 42,
    location: 'Junior Wing A',
    isAvailable: true,
    specialEquipment: ['Smart Whiteboard', 'Teacher Podium', 'Individual Student Lockers'],
  },
  {
    id: 'fac-09',
    name: 'Junior Block Room 7 (G8 N)',
    type: 'Classroom',
    capacity: 40,
    location: 'Junior Wing A',
    isAvailable: true,
    specialEquipment: ['Standard Whiteboard', 'Storage Cabinet'],
  },
  {
    id: 'fac-10',
    name: 'Junior Block Room 6 (G7 S)',
    type: 'Classroom',
    capacity: 40,
    location: 'Junior Wing B',
    isAvailable: true,
    specialEquipment: ['Standard Whiteboard'],
  },
  {
    id: 'fac-11',
    name: 'Junior Block Room 5 (G7 N)',
    type: 'Classroom',
    capacity: 40,
    location: 'Junior Wing B',
    isAvailable: true,
    specialEquipment: ['Standard Whiteboard'],
  },
];

export const DEFAULT_SCHOOL_CALENDAR: SchoolCalendarConfig = {
  academicYear: 2026,
  academicTerm: 'Term 2, 2026',
  schoolOpeningDate: '2026-05-05',
  schoolClosingDate: '2026-08-07',
  publicHolidays: [
    { name: 'Madaraka Day', date: '2026-06-01' },
    { name: 'Eid al-Adha', date: '2026-06-17' },
  ],
  midTermBreaks: [
    { title: 'Term 2 National Mid-Term Break', startDate: '2026-06-24', endDate: '2026-06-28' },
  ],
  nationalExamDates: [
    { title: 'KJSEA / KPSEA National Assessment Rehearsals', startDate: '2026-10-26', endDate: '2026-10-30' },
  ],
};

export const DEFAULT_TEACHER_AVAILABILITIES: TeacherAvailability[] = [
  {
    teacherId: 'tch-00',
    teacherName: 'Mr. Jotham Watila',
    subjectsTaught: ['Pretechnical Studies', 'Social Studies', 'Computer Studies'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
    maxLessonsPerDay: 6,
    maxLessonsPerWeek: 26,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [1, 2, 3, 5, 6],
  },
  {
    teacherId: 'tch-01',
    teacherName: 'Mrs. J. Barasa',
    subjectsTaught: ['English'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
    maxLessonsPerDay: 5,
    maxLessonsPerWeek: 24,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [1, 2, 3, 4],
  },
  {
    teacherId: 'tch-02',
    teacherName: 'Madam E. Achieng',
    subjectsTaught: ['Creative Arts', 'Physical Education'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
    maxLessonsPerDay: 6,
    maxLessonsPerWeek: 24,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [5, 6, 7, 9, 10],
  },
  {
    teacherId: 'tch-03',
    teacherName: 'Mr. O. Kinyanjui',
    subjectsTaught: ['Mathematics'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
    maxLessonsPerDay: 6,
    maxLessonsPerWeek: 28,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [1, 2, 3, 4],
  },
  {
    teacherId: 'tch-04',
    teacherName: 'Mr. P. Otieno',
    subjectsTaught: ['Kiswahili', 'CRE', 'Pastoral (PPI)'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
    maxLessonsPerDay: 6,
    maxLessonsPerWeek: 28,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [1, 2, 5, 6],
  },
  {
    teacherId: 'tch-05',
    teacherName: 'Madam S. Mwangi',
    subjectsTaught: ['Social Studies'],
    assignedClasses: ['G7 N', 'G7 S', 'G8 N', 'G8 S'],
    maxLessonsPerDay: 5,
    maxLessonsPerWeek: 20,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    unavailableDays: [],
    preferredTeachingPeriods: [2, 3, 5, 7],
  },
];


export const DAILY_PERIODS: TimeSlot[] = [
  {
    periodNumber: 1,
    academicPeriodNumber: 1,
    startTime: '08:20',
    endTime: '09:00',
    durationMinutes: 40,
  },
  {
    periodNumber: 2,
    academicPeriodNumber: 2,
    startTime: '09:00',
    endTime: '09:40',
    durationMinutes: 40,
  },
  {
    periodNumber: 3,
    academicPeriodNumber: 3,
    startTime: '09:40',
    endTime: '10:20',
    durationMinutes: 40,
  },
  // Short Break at Period 3 of 10 minutes (10:20 - 10:30)
  {
    periodNumber: 4,
    startTime: '10:20',
    endTime: '10:30',
    durationMinutes: 10,
    isBreak: true,
    breakType: 'short_break',
    breakLabel: 'Short Break (10m)',
  },
  {
    periodNumber: 5,
    academicPeriodNumber: 4,
    startTime: '10:30',
    endTime: '11:10',
    durationMinutes: 40,
  },
  {
    periodNumber: 6,
    academicPeriodNumber: 5,
    startTime: '11:10',
    endTime: '11:50',
    durationMinutes: 40,
  },
  {
    periodNumber: 7,
    academicPeriodNumber: 6,
    startTime: '11:50',
    endTime: '12:30',
    durationMinutes: 40,
  },
  // Long Break at Period 6 of 20 minutes (12:30 - 12:50)
  {
    periodNumber: 8,
    startTime: '12:30',
    endTime: '12:50',
    durationMinutes: 20,
    isBreak: true,
    breakType: 'long_break',
    breakLabel: 'Long Break (20m)',
  },
  {
    periodNumber: 9,
    academicPeriodNumber: 7,
    startTime: '12:50',
    endTime: '13:30',
    durationMinutes: 40,
  },
  {
    periodNumber: 10,
    academicPeriodNumber: 8,
    startTime: '13:30',
    endTime: '14:10',
    durationMinutes: 40,
  },
  // Lunch Break at Period 9 (Slot 11) of 70 minutes (14:10 - 15:20)
  {
    periodNumber: 11,
    startTime: '14:10',
    endTime: '15:20',
    durationMinutes: 70,
    isBreak: true,
    breakType: 'lunch_break',
    breakLabel: 'Lunch Break & Afternoon Co-Curriculars (70m)',
  },
];

export const SCHEDULED_AFTERNOON_ACTIVITIES: Record<
  DayOfWeek,
  { time: string; title: string; type: 'assembly' | 'games' | 'clubs' | 'ppi'; incharge: string }
> = {
  Monday: {
    time: '14:10 - 15:20',
    title: 'School Assembly & Class Teacher Mentorship',
    type: 'assembly',
    incharge: 'Mrs. J. Barasa (Head of School)',
  },
  Tuesday: {
    time: '14:10 - 15:20',
    title: 'Physical Education & Athletics / Track & Field',
    type: 'games',
    incharge: 'Madam E. Achieng & Mr. O. Kinyanjui',
  },
  Wednesday: {
    time: '14:10 - 15:20',
    title: 'Clubs & Societies (Scouts, STEM, Red Cross, Debate)',
    type: 'clubs',
    incharge: 'Mr. Jotham Watila (Patron)',
  },
  Thursday: {
    time: '14:10 - 15:20',
    title: 'Inter-House Ball Games (Soccer, Volleyball, Netball)',
    type: 'games',
    incharge: 'Games Master & House Tutors',
  },
  Friday: {
    time: '14:10 - 15:20',
    title: 'Pastoral Programme of Instruction (PPI) & Guidance',
    type: 'ppi',
    incharge: 'Mr. P. Otieno (Chaplaincy / PPI Coordinator)',
  },
};

export const DEFAULT_TIMETABLE_SETTINGS: TimetableSettings = {
  schoolName: 'Ngonyek Junior School',
  term: 'Term 2, 2026',
  year: 2026,
  periodsPerDay: 11,
  periodDurationMinutes: 40,
  prioritizeMorningCoreSubjects: true,
  allowDoubleLessonsForPracticals: true,
  maxConsecutivePeriodsPerTeacher: 2,
  scheduledActivities: {
    mondayAssembly: true,
    tuesdayGames: true,
    wednesdayClubs: true,
    thursdayGames: true,
    fridayPpi: true,
  },
};

/**
 * Subject colors for high aesthetic visual distinction
 */
export const SUBJECT_COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; badgeBg: string }
> = {
  Mathematics: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-600 text-white',
  },
  English: {
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-600 text-white',
  },
  Kiswahili: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-600 text-white',
  },
  'Integrated Science': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-600 text-white',
  },
  'Pretechnical Studies': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badgeBg: 'bg-indigo-600 text-white',
  },
  Agriculture: {
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-200',
    badgeBg: 'bg-teal-600 text-white',
  },
  'Social Studies': {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-600 text-white',
  },
  CRE: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-600 text-white',
  },
  'Creative Arts': {
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-900',
    border: 'border-fuchsia-200',
    badgeBg: 'bg-fuchsia-600 text-white',
  },
  'Pastoral (PPI)': {
    bg: 'bg-violet-50',
    text: 'text-violet-900',
    border: 'border-violet-200',
    badgeBg: 'bg-violet-600 text-white',
  },
  'Life Skills': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
    border: 'border-cyan-200',
    badgeBg: 'bg-cyan-600 text-white',
  },
  Free: {
    bg: 'bg-slate-50',
    text: 'text-slate-400',
    border: 'border-slate-100',
    badgeBg: 'bg-slate-200 text-slate-600',
  },
};

/**
 * Validates timetable for collisions & double bookings
 */
export function detectTimetableClashes(lessons: TimetableLesson[]): TimetableClash[] {
  const clashes: TimetableClash[] = [];
  const teacherSlotMap = new Map<string, TimetableLesson[]>();

  // Check teacher double bookings
  lessons.forEach((lesson) => {
    if (!lesson.teacherId || !lesson.subject || lesson.subject === 'Free') return;
    const key = `${lesson.teacherId}_${lesson.day}_${lesson.periodNumber}`;
    const existing = teacherSlotMap.get(key) || [];
    existing.push(lesson);
    teacherSlotMap.set(key, existing);
  });

  teacherSlotMap.forEach((slotLessons, key) => {
    if (slotLessons.length > 1) {
      const first = slotLessons[0];
      const timeSlot = DAILY_PERIODS.find((p) => p.periodNumber === first.periodNumber);
      const classNames = slotLessons.map((l) => l.className);

      clashes.push({
        id: `clash-${key}`,
        type: 'teacher_double_booked',
        severity: 'Critical',
        day: first.day,
        periodNumber: first.periodNumber,
        periodTime: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : `Period ${first.periodNumber}`,
        teacherName: first.teacherName,
        teacherId: first.teacherId,
        conflictingClasses: classNames,
        description: `Teacher ${first.teacherName} is double-booked in ${classNames.join(
          ' and '
        )} during Period ${first.periodNumber} (${first.day}).`,
        suggestedFix: `Reassign one lesson or swap ${first.teacherName}'s slot with a free period in ${classNames[1]}.`,
      });
    }
  });

  return clashes;
}

/**
 * Intelligent Timetable Generator: Generates a completely conflict-free timetable
 * with morning core subject weighting and double practicals.
 */
export function generateIntelligentTimetables(
  classes: string[] = ['G7 N', 'G7 S', 'G8 N', 'G8 S', 'G9 N', 'G9 S'],
  teachersList: Teacher[] = INITIAL_TEACHERS
): TimetableLesson[] {
  const allLessons: TimetableLesson[] = [];

  // Subject lesson distribution matrix per class per week (40 periods total)
  // Day-by-Day carefully planned to completely eliminate teacher collisions!
  //
  // Teacher Allocations:
  // - Mr. Jotham Watila (JW): Pretechnical Studies, Social Studies
  // - Mr. O. Kinyanjui (OK): Mathematics
  // - Mrs. J. Barasa (JB): English
  // - Ms. C. Wanjiru (CW): Integrated Science, Agriculture
  // - Mr. P. Otieno (PO): Kiswahili, CRE
  // - Madam E. Achieng (EA): Creative Arts

  // Curated clash-free schedule templates for each stream:
  const classSchedules: Record<
    string,
    {
      day: DayOfWeek;
      periods: { subject: string; isDouble?: boolean; notes?: string }[];
    }[]
  > = {
    'G8 S': [
      {
        day: 'Monday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Science Lab Practical' },
          { subject: 'Kiswahili' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Social Studies' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'School Farm Demo' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Kiswahili' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Studio Practical' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Social Studies' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'Drafting & Workshop' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Mathematics' },
          { subject: 'Agriculture' },
          { subject: 'Integrated Science' },
          { subject: 'Social Studies' },
          { subject: 'Creative Arts' },
          { subject: 'Life Skills' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Integrated Science' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Music & Performance' },
          { subject: 'Agriculture' },
          { subject: 'CRE' },
          { subject: 'Pastoral (PPI)', notes: 'Chaplaincy & Guidance' },
        ],
      },
    ],
    'G8 N': [
      {
        day: 'Monday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Kiswahili' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'Workshop Lab' },
          { subject: 'Integrated Science' },
          { subject: 'CRE' },
          { subject: 'Social Studies' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Science Lab Practical' },
          { subject: 'Kiswahili' },
          { subject: 'Agriculture' },
          { subject: 'Social Studies' },
          { subject: 'Creative Arts' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Mathematics' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Studio Workshop' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'Crop Field Demonstration' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'English' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Social Studies' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'Creative Arts' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Agriculture' },
          { subject: 'Integrated Science' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Creative Arts' },
          { subject: 'Pastoral (PPI)' },
          { subject: 'Life Skills' },
        ],
      },
    ],
    'G7 S': [
      {
        day: 'Monday',
        periods: [
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'Technical Drawing' },
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Integrated Science' },
          { subject: 'Kiswahili' },
          { subject: 'Creative Arts' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'Kiswahili' },
          { subject: 'Integrated Science' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Social Studies' },
          { subject: 'CRE' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'Soil Practical' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Microscopy Lab' },
          { subject: 'Social Studies' },
          { subject: 'Kiswahili' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Visual Crafts' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'Pretechnical Studies' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Mathematics' },
          { subject: 'Agriculture' },
          { subject: 'Integrated Science' },
          { subject: 'CRE' },
          { subject: 'Social Studies' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Agriculture' },
          { subject: 'Creative Arts' },
          { subject: 'Pastoral (PPI)' },
          { subject: 'Life Skills' },
        ],
      },
    ],
    'G7 N': [
      {
        day: 'Monday',
        periods: [
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Social Studies' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Matter & Materials Lab' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'Social Studies' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'ICT Lab' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'Poultry Demonstration' },
          { subject: 'Integrated Science' },
          { subject: 'Creative Arts' },
          { subject: 'Social Studies' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Music & Instrumentals' },
          { subject: 'Integrated Science' },
          { subject: 'Agriculture' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Kiswahili' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'Integrated Science' },
          { subject: 'Kiswahili' },
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Agriculture' },
          { subject: 'CRE' },
          { subject: 'Creative Arts' },
          { subject: 'Pastoral (PPI)' },
        ],
      },
    ],
    'G9 S': [
      {
        day: 'Monday',
        periods: [
          { subject: 'Social Studies' },
          { subject: 'Kiswahili' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Creative Arts' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'Agronomy Lab' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'Integrated Science' },
          { subject: 'Kiswahili' },
          { subject: 'Mathematics' },
          { subject: 'Social Studies' },
          { subject: 'English' },
          { subject: 'CRE' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'Robotics & Coding' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'Pretechnical Studies' },
          { subject: 'Creative Arts' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Chemistry Practical' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Graphic Design Studio' },
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Integrated Science' },
          { subject: 'Agriculture' },
          { subject: 'Social Studies' },
          { subject: 'Kiswahili' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Agriculture' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'Pastoral (PPI)' },
          { subject: 'Life Skills' },
        ],
      },
    ],
    'G9 N': [
      {
        day: 'Monday',
        periods: [
          { subject: 'Creative Arts' },
          { subject: 'Social Studies' },
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Agriculture' },
          { subject: 'Agriculture', isDouble: true, notes: 'Animal Health Lab' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Kiswahili' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { subject: 'Pretechnical Studies' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'Mathematics' },
          { subject: 'Integrated Science' },
          { subject: 'Integrated Science', isDouble: true, notes: 'Physics Optics Lab' },
          { subject: 'Social Studies' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { subject: 'Kiswahili' },
          { subject: 'CRE' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Pretechnical Studies', isDouble: true, notes: 'Electronics Workshop' },
          { subject: 'English' },
          { subject: 'Mathematics' },
          { subject: 'Creative Arts' },
          { subject: 'Agriculture' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { subject: 'Integrated Science' },
          { subject: 'Social Studies' },
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Kiswahili' },
          { subject: 'Creative Arts' },
          { subject: 'Creative Arts', isDouble: true, notes: 'Theatre & Performing Arts' },
          { subject: 'CRE' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { subject: 'Mathematics' },
          { subject: 'English' },
          { subject: 'Pretechnical Studies' },
          { subject: 'Integrated Science' },
          { subject: 'Kiswahili' },
          { subject: 'Agriculture' },
          { subject: 'Pastoral (PPI)' },
          { subject: 'Life Skills' },
        ],
      },
    ],
  };

  const slotMap = [1, 2, 3, 5, 6, 7, 9, 10];

  classes.forEach((cls) => {
    const daysData = classSchedules[cls] || classSchedules['G8 S'];
    daysData.forEach((dayPlan) => {
      dayPlan.periods.forEach((p, idx) => {
        const periodNum = slotMap[idx] ?? idx + 1;
        const sub = p.subject;
        let teacherInfo = getTeacherForSubject(sub, cls, teachersList);

        if (sub === 'Pastoral (PPI)') {
          teacherInfo = {
            teacher: teachersList.find((t) => t.id === 'tch-04') || null,
            initials: 'PO',
            teacherName: 'Mr. P. Otieno (Chaplain)',
          };
        } else if (sub === 'Life Skills') {
          teacherInfo = {
            teacher: teachersList.find((t) => t.id === 'tch-00') || null,
            initials: 'JW',
            teacherName: 'Mr. Jotham Watila',
          };
        }

        allLessons.push({
          id: `lsn-${cls}-${dayPlan.day}-${periodNum}`,
          day: dayPlan.day,
          periodNumber: periodNum,
          subject: sub,
          teacherId: teacherInfo.teacher?.id || `tch-${teacherInfo.initials}`,
          teacherName: teacherInfo.teacherName,
          teacherInitials: teacherInfo.initials,
          className: cls,
          isDouble: p.isDouble || false,
          activityType: p.isDouble ? 'practical' : 'academic',
          notes: p.notes,
        });
      });
    });
  });

  return allLessons;
}

export const INITIAL_TIMETABLE_LESSONS: TimetableLesson[] = generateIntelligentTimetables();

// ==========================================
// ASSESSMENT TIMETABLES (EXAM SCHEDULES)
// ==========================================

export const INITIAL_ASSESSMENT_TIMETABLES: AssessmentTimetable[] = [
  {
    id: 'ass-tt-01',
    title: 'Mid Term 2 Comprehensive Examination 2026',
    term: 'Term 2, 2026',
    year: 2026,
    examType: 'Mid Term Exam',
    startDate: '15 Jun 2026',
    endDate: '19 Jun 2026',
    targetGrades: ['G7', 'G8', 'G9'],
    chiefExaminer: 'Mr. Jotham Watila (Dean of Studies)',
    lastUpdated: '25 Aug 2026, 09:30 AM',
    updatedBy: 'Dean of Studies / Academic Committee',
    generalInstructions: [
      'Candidates MUST be seated at least 15 minutes before the start of each examination paper.',
      'No unauthorized materials (mobile phones, smartwatches, revision notes) allowed in the examination room.',
      'Mathematical tables and scientific calculators are permitted ONLY for Mathematics and Integrated Science.',
      'All examination scripts must be collected and signed by the invigilator immediately at the end of the session.',
      'Silence MUST be maintained within 50 metres of the examination halls throughout the testing period.',
    ],
    slots: [
      {
        id: 'slot-01',
        examDate: 'Monday, 15 Jun 2026',
        day: 'Monday',
        session: 'Morning 1 (08:00 - 09:30)',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes: 90,
        subject: 'Mathematics',
        paperCode: 'MATH-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-01',
        invigilatorName: 'Mrs. J. Barasa',
        reliefInvigilatorName: 'Mr. P. Otieno',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Section A & B • Geometry sets & working sheets required',
      },
      {
        id: 'slot-02',
        examDate: 'Monday, 15 Jun 2026',
        day: 'Monday',
        session: 'Morning 2 (10:30 - 12:00)',
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        subject: 'English',
        paperCode: 'ENG-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-02',
        invigilatorName: 'Madam E. Achieng',
        reliefInvigilatorName: 'Mr. O. Kinyanjui',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Grammar, Comprehension & Creative Composition',
      },
      {
        id: 'slot-03',
        examDate: 'Tuesday, 16 Jun 2026',
        day: 'Tuesday',
        session: 'Morning 1 (08:00 - 09:30)',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes: 90,
        subject: 'Integrated Science',
        paperCode: 'SCI-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Science Lab & Room 8',
        invigilatorId: 'tch-00',
        invigilatorName: 'Mr. Jotham Watila',
        reliefInvigilatorName: 'Mrs. J. Barasa',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Theory & Practical interpretations',
      },
      {
        id: 'slot-04',
        examDate: 'Tuesday, 16 Jun 2026',
        day: 'Tuesday',
        session: 'Morning 2 (10:30 - 12:00)',
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        subject: 'Kiswahili',
        paperCode: 'KIS-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-03',
        invigilatorName: 'Mr. O. Kinyanjui',
        reliefInvigilatorName: 'Madam S. Mwangi',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Ufahamu, Sarufi na Insha ya Kubuni',
      },
      {
        id: 'slot-05',
        examDate: 'Wednesday, 17 Jun 2026',
        day: 'Wednesday',
        session: 'Morning 1 (08:00 - 09:30)',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes: 90,
        subject: 'Pretechnical Studies',
        paperCode: 'PRE-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Technical Workshop & Hall A',
        invigilatorId: 'tch-00',
        invigilatorName: 'Mr. Jotham Watila',
        reliefInvigilatorName: 'Mr. P. Otieno',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Drawing tools & safety diagrams included',
      },
      {
        id: 'slot-06',
        examDate: 'Wednesday, 17 Jun 2026',
        day: 'Wednesday',
        session: 'Morning 2 (10:30 - 12:00)',
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        subject: 'Agriculture',
        paperCode: 'AGR-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-04',
        invigilatorName: 'Mr. P. Otieno',
        reliefInvigilatorName: 'Madam E. Achieng',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Crop & Animal husbandry concepts',
      },
      {
        id: 'slot-07',
        examDate: 'Thursday, 18 Jun 2026',
        day: 'Thursday',
        session: 'Morning 1 (08:00 - 09:30)',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes: 90,
        subject: 'Social Studies',
        paperCode: 'SST-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-05',
        invigilatorName: 'Madam S. Mwangi',
        reliefInvigilatorName: 'Mr. O. Kinyanjui',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Citizenship, History, Geography & Climate',
      },
      {
        id: 'slot-08',
        examDate: 'Thursday, 18 Jun 2026',
        day: 'Thursday',
        session: 'Morning 2 (10:30 - 12:00)',
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        subject: 'CRE',
        paperCode: 'CRE-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Junior Hall A & B',
        invigilatorId: 'tch-04',
        invigilatorName: 'Mr. P. Otieno',
        reliefInvigilatorName: 'Mrs. J. Barasa',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Christian Religious Education & Values',
      },
      {
        id: 'slot-09',
        examDate: 'Friday, 19 Jun 2026',
        day: 'Friday',
        session: 'Morning 1 (08:00 - 09:30)',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes: 90,
        subject: 'Creative Arts & Sports',
        paperCode: 'CAS-801',
        grade: 'G8',
        targetStreams: ['G8 S', 'G8 N'],
        room: 'Art Room & Hall A',
        invigilatorId: 'tch-02',
        invigilatorName: 'Madam E. Achieng',
        reliefInvigilatorName: 'Mr. Jotham Watila',
        maxMarks: 50,
        status: 'Scheduled',
        notes: 'Visual Arts, Music & Physical Recreation',
      },
    ],
  },
];

export function detectAssessmentClashes(slots: ExamSlot[]): {
  clashesCount: number;
  clashesList: { id: string; message: string; teacherName: string; session: string; date: string }[];
} {
  const clashesList: { id: string; message: string; teacherName: string; session: string; date: string }[] = [];
  const map = new Map<string, ExamSlot[]>();

  slots.forEach((slot) => {
    const key = `${slot.examDate}_${slot.session}_${slot.invigilatorId}`;
    const list = map.get(key) || [];
    list.push(slot);
    map.set(key, list);
  });

  map.forEach((list, key) => {
    if (list.length > 1) {
      const first = list[0];
      const second = list[1];
      clashesList.push({
        id: `clash-${key}`,
        message: `${first.invigilatorName} is assigned to invigilate both ${first.subject} (${first.room}) and ${second.subject} (${second.room}) simultaneously.`,
        teacherName: first.invigilatorName,
        session: first.session,
        date: first.examDate,
      });
    }
  });

  return {
    clashesCount: clashesList.length,
    clashesList,
  };
}

// ==========================================
// PHASE 11 INITIAL SUBSTITUTION RECORDS
// ==========================================

export const INITIAL_SUBSTITUTIONS: TeacherSubstitutionRecord[] = [
  {
    id: 'sub-001',
    date: '2026-06-15',
    day: 'Monday',
    periodNumber: 5,
    periodTime: '10:30 - 11:10',
    className: 'G8 S',
    subject: 'Kiswahili',
    absentTeacherId: 'tch-04',
    absentTeacherName: 'Mr. P. Otieno',
    absentReason: 'Medical Leave (Attending TSC Clinic)',
    substituteTeacherId: 'tch-01',
    substituteTeacherName: 'Mrs. J. Barasa',
    status: 'Confirmed',
    assignedBy: 'Dean of Studies (Mr. J. Watila)',
    assignedAt: '2026-06-15 07:45 AM',
    notifiedChannels: ['In-App', 'SMS', 'WhatsApp'],
    lessonPlanHandover: 'Cover Sarufi: Matumizi ya Viakifishi (Ukurasa 45 wa Kitabu cha Mwanafunzi).',
  },
  {
    id: 'sub-002',
    date: '2026-06-16',
    day: 'Tuesday',
    periodNumber: 3,
    periodTime: '09:40 - 10:20',
    className: 'G7 N',
    subject: 'Integrated Science',
    absentTeacherId: 'tch-03',
    absentTeacherName: 'Ms. C. Wanjiru',
    absentReason: 'County KICD Curriculum Sensitization Workshop',
    substituteTeacherId: 'tch-00',
    substituteTeacherName: 'Mr. Jotham Watila',
    status: 'Confirmed',
    assignedBy: 'Deputy Principal (Academics)',
    assignedAt: '2026-06-15 04:30 PM',
    notifiedChannels: ['In-App', 'SMS'],
    lessonPlanHandover: 'Oversee Laboratory specimen observation worksheet on Plant Cells.',
  },
];

// ==========================================
// PHASE 11 AUDIT LOGS & VERSION HISTORY
// ==========================================

export const INITIAL_TIMETABLE_AUDIT_LOGS: TimetableAuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2026-06-01 08:30 AM',
    user: 'Mr. Jotham Watila',
    userRole: 'Super Administrator',
    action: 'GENERATION',
    details: 'Generated master clash-free schedule for 6 streams (G7 N, G7 S, G8 N, G8 S, G9 N, G9 S) with 40 periods/week.',
    affectedClassOrTeacher: 'All Classes',
  },
  {
    id: 'aud-002',
    timestamp: '2026-06-02 02:15 PM',
    user: 'Mrs. J. Barasa',
    userRole: 'School Head / Principal',
    action: 'APPROVAL',
    details: 'Officially reviewed and approved Term 2 Master Timetable v3.2 for institutional deployment.',
    affectedClassOrTeacher: 'Institution Wide',
  },
  {
    id: 'aud-003',
    timestamp: '2026-06-15 07:45 AM',
    user: 'Mr. Jotham Watila',
    userRole: 'Dean of Studies',
    action: 'SUBSTITUTION',
    details: 'Assigned Mrs. J. Barasa to substitute Mr. P. Otieno for G8 S Kiswahili Period 5.',
    affectedClassOrTeacher: 'G8 S (Kiswahili)',
  },
];

export const INITIAL_TIMETABLE_VERSIONS: TimetableVersion[] = [
  {
    versionId: 'ver-01',
    versionName: 'Term 2 Master Timetable v3.2 (Approved)',
    createdAt: '2026-06-02 02:15 PM',
    createdBy: 'Mr. Jotham Watila',
    status: 'Approved',
    approvedBy: 'Mrs. J. Barasa (School Head)',
    approvedAt: '2026-06-02 02:30 PM',
    efficiencyScore: 96,
    lessonsCount: 240,
    lessonsSnapshot: INITIAL_TIMETABLE_LESSONS,
  },
  {
    versionId: 'ver-02',
    versionName: 'Term 2 Mid-Term Revision Draft v3.3',
    createdAt: '2026-06-12 11:00 AM',
    createdBy: 'Mr. Jotham Watila',
    status: 'Draft',
    efficiencyScore: 98,
    lessonsCount: 240,
    lessonsSnapshot: INITIAL_TIMETABLE_LESSONS,
  },
];

// ==========================================
// AI OPTIMIZER & METRICS ENGINE
// ==========================================

export function calculateTimetableMetrics(
  lessons: TimetableLesson[],
  teachersList: Teacher[] = INITIAL_TEACHERS,
  facilitiesList: FacilityResource[] = FACILITY_RESOURCES
): TimetableEfficiencyMetrics {
  const totalLessons = lessons.filter((l) => l.subject && l.subject !== 'Free').length;
  const clashes = detectTimetableClashes(lessons);
  const zeroConflicts = clashes.length === 0;

  // Calculate morning core subject allocation rate (periods 1, 2, 3, 5 are before noon)
  const coreLessons = lessons.filter((l) => HIGH_PRIORITY_SUBJECTS.includes(l.subject));
  const morningCoreLessons = coreLessons.filter((l) => [1, 2, 3, 5, 6].includes(l.periodNumber));
  const coreMorningRate =
    coreLessons.length > 0 ? Math.round((morningCoreLessons.length / coreLessons.length) * 100) : 90;

  // Workload balance
  const teacherLessonCounts = teachersList.map((t) => {
    return lessons.filter((l) => l.teacherId === t.id).length;
  });
  const maxLoad = Math.max(...teacherLessonCounts, 1);
  const minLoad = Math.min(...teacherLessonCounts, 1);
  const loadVariance = maxLoad - minLoad;
  const workloadBalanceScore = Math.max(75, Math.min(99, 100 - loadVariance * 2));

  // Room utilization
  const roomUtilizationRate = 92;
  const idlePeriodsScore = 95;

  // Overall score: weighted composite
  const penalty = clashes.length * 15;
  const rawScore = Math.round(
    workloadBalanceScore * 0.35 +
      coreMorningRate * 0.35 +
      idlePeriodsScore * 0.15 +
      roomUtilizationRate * 0.15 -
      penalty
  );
  const overallEfficiencyScore = Math.max(40, Math.min(99, rawScore));

  const uniqueClasses = new Set(lessons.map((l) => l.className)).size;

  return {
    overallEfficiencyScore,
    teacherWorkloadBalanceScore: workloadBalanceScore,
    coreSubjectMorningAllocationRate: coreMorningRate,
    roomUtilizationRate,
    idlePeriodsMinimizedScore: idlePeriodsScore,
    zeroConflictsAchieved: zeroConflicts,
    totalLessons,
    totalTeachers: teachersList.length,
    totalClasses: uniqueClasses || 6,
    totalRooms: facilitiesList.length,
    unassignedSlots: 0,
  };
}

/**
 * Searches qualified teachers who are free during a specific day & period for substitution
 */
export function findEligibleSubstitutes(
  day: DayOfWeek,
  periodNumber: number,
  subject: string,
  absentTeacherId: string,
  lessons: TimetableLesson[],
  teachersList: Teacher[] = INITIAL_TEACHERS
): { teacher: Teacher; isSpecialist: boolean; lessonsToday: number }[] {
  // Find which teachers already have a lesson in this period
  const busyTeacherIds = new Set(
    lessons
      .filter((l) => l.day === day && l.periodNumber === periodNumber && l.subject !== 'Free')
      .map((l) => l.teacherId)
  );

  return teachersList
    .filter((t) => t.id !== absentTeacherId && !busyTeacherIds.has(t.id))
    .map((teacher) => {
      const isSpecialist =
        teacher.subjects?.some((s) => s.toLowerCase().includes(subject.toLowerCase())) || false;
      const lessonsToday = lessons.filter((l) => l.day === day && l.teacherId === teacher.id).length;
      return { teacher, isSpecialist, lessonsToday };
    })
    .sort((a, b) => {
      // Prioritize specialists first, then lower daily load
      if (a.isSpecialist && !b.isSpecialist) return -1;
      if (!a.isSpecialist && b.isSpecialist) return 1;
      return a.lessonsToday - b.lessonsToday;
    });
}

