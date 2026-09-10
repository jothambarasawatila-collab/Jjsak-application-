export type LearnerEnrollmentStatus =
  | 'Active'
  | 'Pending Admission'
  | 'Transferred In'
  | 'Transferred Out'
  | 'Graduated'
  | 'Completed'
  | 'Suspended'
  | 'Withdrawn'
  | 'Deceased'
  | 'Archived';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Excused'
  | 'Sick'
  | 'School Activity';

export interface DailyAttendanceEntry {
  id: string;
  studentId: string;
  admNo: string;
  studentName: string;
  grade: string;
  stream: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  minutesLate?: number;
  remarks?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface ClassAttendanceRegister {
  id: string;
  className: string;
  grade: string;
  stream: string;
  date: string; // YYYY-MM-DD
  academicYear: number;
  term: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  unlockedBy?: string;
  unlockReason?: string;
  entries: DailyAttendanceEntry[];
}

export interface AttendanceAnalyticsSummary {
  studentId: string;
  admNo: string;
  studentName: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  sickDays: number;
  schoolActivityDays: number;
  attendanceRate: number; // percentage
  isChronicAbsent: boolean; // attendanceRate < 80%
  consecutiveAbsences: number;
}

export type DisciplineIncidentSeverity =
  | 'Positive Recognition'
  | 'Minor'
  | 'Moderate'
  | 'Severe / Critical';

export type DisciplineWorkflowStatus =
  | 'Reported'
  | 'Under Investigation'
  | 'Resolved'
  | 'Escalated'
  | 'Closed';

export interface DisciplineIncident {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  className: string;
  date: string;
  time: string;
  location: string;
  category: string; // e.g. 'Punctuality', 'Uniform & Grooming', 'Academic Honesty', 'Peer Relations', 'Merit Commendation', 'Property Care'
  description: string;
  severity: DisciplineIncidentSeverity;
  status: DisciplineWorkflowStatus;
  reportingStaff: string;
  witnesses?: string[];
  actionTaken: string;
  parentContacted: boolean;
  parentContactDate?: string;
  parentFeedback?: string;
  followUpDate?: string;
  closedBy?: string;
  closedAt?: string;
}

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'Unknown';

export interface LearnerHealthProfile {
  studentId: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  disabilities: string[];
  regularMedications: string[];
  emergencyMedicalNotes: string;
  preferredHospital?: string;
  doctorName?: string;
  doctorPhone?: string;
  immunizationUpToDate: boolean;
  nhifOrInsuranceNumber?: string;
}

export type HealthIncidentType =
  | 'Sickbay Visit'
  | 'Minor First Aid'
  | 'Sudden Illness'
  | 'Medical Emergency'
  | 'Hospital Referral'
  | 'Routine Health Check';

export interface HealthIncidentRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  className: string;
  dateTime: string;
  incidentType: HealthIncidentType;
  symptoms: string;
  temperatureCelsius?: number;
  firstAidGiven: string;
  medicationAdministered?: string;
  nurseOrAttendant: string;
  parentInformed: boolean;
  referredToHospital: boolean;
  hospitalName?: string;
  outcome: string;
  followUpRequired: boolean;
}

export type CounselingCategory =
  | 'Academic Guidance'
  | 'Emotional Well-being'
  | 'Peer Relations & Bullying'
  | 'Family & Bereavement'
  | 'Career & Pathway Guidance'
  | 'Discipline & Rehabilitation'
  | 'Substance Awareness'
  | 'Special Psychological Support';

export interface CounselingSession {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  className: string;
  date: string;
  counselorName: string;
  category: CounselingCategory;
  sessionSummary: string; // protected
  supportPlan: string;
  followUpDate?: string;
  confidentialityLevel: 'Standard Welfare Team' | 'Strictly Headteacher & Counselor';
  status: 'Ongoing' | 'Resolved' | 'Referred to External Specialist';
}

export type VulnerabilityType =
  | 'Orphan / Vulnerable Child (OVC)'
  | 'Needy / Tuition Support'
  | 'Food / Nutrition Support'
  | 'Medical Needs Support'
  | 'Disability Accommodation'
  | 'Child Protection Concern';

export interface VulnerableLearnerRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  className: string;
  vulnerabilityType: VulnerabilityType;
  details: string;
  assignedSupportProgram: string;
  sponsorOrPartner?: string;
  allocatedBursaryAmount?: number;
  status: 'Active Support' | 'Monitored' | 'Graduated from Program';
}

export interface ClearanceItem {
  department: string;
  item: string;
  cleared: boolean;
  clearedBy?: string;
  clearedDate?: string;
  remarks?: string;
}

export interface TransferOutRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  upi?: string;
  currentClass: string;
  destinationSchool: string;
  destinationCounty: string;
  transferReason: string;
  clearanceDate: string;
  transferLetterRef: string;
  clearanceChecklist: ClearanceItem[];
  allCleared: boolean;
  authorizedBy: string;
  status: 'Completed' | 'Pending Clearance';
}

export interface TransferInRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  upi?: string;
  admittedClass: string;
  previousSchool: string;
  previousAdmNo?: string;
  transferLetterRef?: string;
  dateAdmitted: string;
  priorMeanScore?: number;
  priorAttendanceRate?: number;
  specialNotes?: string;
  admittedBy: string;
}

export interface Grade9GraduationRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  upi?: string;
  graduationYear: number;
  kjseaMeanBand: string; // 'EE', 'ME', etc.
  overallScore: number;
  recommendedPathway: 'STEM' | 'Social Sciences' | 'Arts & Sports Science';
  completionCertificateNumber: string;
  exitDate: string;
  status: 'Graduated' | 'Certificate Issued';
}

export type ParentCommChannel =
  | 'SMS'
  | 'WhatsApp'
  | 'Phone Call'
  | 'In-Person Meeting'
  | 'Official Letter'
  | 'Email';

export interface ParentCommunicationRecord {
  id: string;
  studentId: string;
  studentName: string;
  admNo: string;
  parentName: string;
  parentPhone: string;
  date: string;
  channel: ParentCommChannel;
  purpose: 'Attendance Alert' | 'Discipline Summons' | 'Academic Progress' | 'Medical Emergency' | 'General Notice' | 'Welfare Follow-up';
  subject: string;
  details: string;
  staffName: string;
  parentResponse?: string;
  status: 'Delivered' | 'Attended' | 'No Response' | 'Follow-up Needed';
}
