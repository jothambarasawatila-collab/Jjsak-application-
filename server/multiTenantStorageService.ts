import fs from 'fs';
import path from 'path';
import {
  NGONYEK_GRADE7_STUDENTS,
  NGONYEK_TEACHERS,
  NGONYEK_USERS,
  NGONYEK_ACADEMIC_STREAMS,
  NGONYEK_CLASS_TEACHER_ALLOCATIONS,
} from '../src/data/ngonyekJuniorSchoolData.js';

export interface ServerSchoolTenant {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  schoolType?: string;
  registrationNumber?: string;
  educationLevel?: string;
  category: 'PRIMARY' | 'JUNIOR' | 'SECONDARY' | 'MIXED' | 'OTHER';
  country?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
  physicalAddress?: string;
  postalAddress?: string;
  address?: string;
  officialEmail?: string;
  email?: string;
  officialPhone?: string;
  phone?: string;
  website?: string;
  subdomain?: string;
  tenantDomain?: string;
  administratorDetails?: {
    fullName: string;
    nationalId: string;
    phoneNumber: string;
    emailAddress: string;
  };
  schoolBranding?: {
    logoUrl?: string;
    motto?: string;
    primaryColor?: string;
    secondaryColor?: string;
    stampUrl?: string;
  };
  logoUrl?: string;
  stampUrl?: string;
  motto?: string;
  status: 'TRIAL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DISABLED';
  createdAt: string;
}

export interface ServerTenantDataBundle {
  tenantId: string;
  students: any[];
  teachers: any[];
  assessments: any[];
  grades: any[];
  timetables: any[];
  classes: any[];
  attendanceRegisters: any[];
  behaviorRecords: any[];
  disciplineIncidents: any[];
  healthIncidents: any[];
  healthProfiles: Record<string, any>;
  counselingSessions: any[];
  vulnerableLearners: any[];
  welfareCheckIns: any[];
  transfersOut: any[];
  transfersIn: any[];
  graduations: any[];
  parentCommunications: any[];
  curriculum?: any;
  academicYears?: any[];
  terms?: any[];
  learningLevels?: any[];
  academicGrades?: any[];
  academicStreams?: any[];
  academicSubjects?: any[];
  teacherSubjectAllocations?: any[];
  classTeacherAllocations?: any[];
  placementRules?: any[];
  promotionPolicies?: any[];
  schoolInfo?: any;
  schoolProfile?: any;
  settings: Record<string, any>;
  auditLogs: any[];
  lastUpdated: string;
}

export interface ServerUserData {
  id: string;
  schoolId?: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  designation?: string;
  active: boolean;
  mfaEnabled?: boolean;
  mfaMethod?: string;
  firstLoginCompleted?: boolean;
  activationStatus?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  employeeNumber?: string;
  password?: string;
}

class MultiTenantStorageService {
  private static instance: MultiTenantStorageService;
  private filePath: string;
  private tenants: Map<string, ServerSchoolTenant> = new Map();
  private tenantData: Map<string, ServerTenantDataBundle> = new Map();
  private users: Map<string, ServerUserData> = new Map();
  private deletedTenantIds: Set<string> = new Set();

  private constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    this.filePath = path.join(dataDir, 'jjsak_production_store.json');
    this.loadFromDisk();
    this.ensureDefaultTenants();
    this.ensureDefaultOwner();
  }

  public static getInstance(): MultiTenantStorageService {
    if (!MultiTenantStorageService.instance) {
      MultiTenantStorageService.instance = new MultiTenantStorageService();
    }
    return MultiTenantStorageService.instance;
  }

  private ensureDefaultTenants() {
    const defaultSchools: ServerSchoolTenant[] = [
      {
        schoolId: 'sch-yuya-30200',
        schoolCode: 'YUYA-30200',
        schoolName: 'Yuya Primary School',
        subdomain: 'yuya',
        tenantDomain: 'yuya.jjsak.ac.ke',
        category: 'PRIMARY',
        address: 'P.O. Box 45, Yuya',
        email: 'info@yuya.sc.ke',
        phone: '+254 712 345 678',
        status: 'TRIAL',
        createdAt: '2026-03-01',
      },
      {
        schoolId: 'sch-ngonyek-30200',
        schoolCode: 'NGONYEK-30200',
        schoolName: 'Ngonyek Junior School',
        subdomain: 'ngonyek',
        tenantDomain: 'ngonyek.jjsak.ac.ke',
        category: 'JUNIOR_SECONDARY',
        address: 'P.O. Box 78, Ngonyek',
        email: 'admin@ngonyek.sc.ke',
        phone: '+254 722 000 111',
        status: 'TRIAL',
        createdAt: '2026-03-01',
      },
    ];

    let modified = false;
    defaultSchools.forEach((school) => {
      // NEVER restore a school that has been permanently deleted
      if (!this.deletedTenantIds.has(school.schoolId) && !this.tenants.has(school.schoolId)) {
        this.tenants.set(school.schoolId, school);
        modified = true;
      }
    });

    // Ensure initial isolated tenant data for Ngonyek Junior School if not present or incomplete
    const existingNgonyek = this.tenantData.get('sch-ngonyek-30200');
    if (!this.deletedTenantIds.has('sch-ngonyek-30200') && (!existingNgonyek || !existingNgonyek.students || existingNgonyek.students.length < 40)) {
      const rawGrade7 = [
        { admNo: 'NGON/2026/001', name: 'Brian Kipchumba Bett', gender: 'Male' as const, dob: '2013-03-14', pName: 'Kipchumba Bett', pPhone: '+254 721 890 101' },
        { admNo: 'NGON/2026/002', name: 'Faith Jepkemoi Cheruiyot', gender: 'Female' as const, dob: '2013-05-22', pName: 'Cheruiyot Sang', pPhone: '+254 721 890 102' },
        { admNo: 'NGON/2026/003', name: 'Kevin Kiprotich Kiptoo', gender: 'Male' as const, dob: '2013-01-18', pName: 'Kiptoo Korir', pPhone: '+254 721 890 103' },
        { admNo: 'NGON/2026/004', name: 'Mercy Chepkoech Mutai', gender: 'Female' as const, dob: '2013-08-09', pName: 'Mutai Bii', pPhone: '+254 721 890 104' },
        { admNo: 'NGON/2026/005', name: 'Dennis Kipkorir Tanui', gender: 'Male' as const, dob: '2013-04-30', pName: 'Tanui Rono', pPhone: '+254 721 890 105' },
        { admNo: 'NGON/2026/006', name: 'Brenda Cherono Langat', gender: 'Female' as const, dob: '2013-07-11', pName: 'Langat Chepkwony', pPhone: '+254 721 890 106' },
        { admNo: 'NGON/2026/007', name: 'Collins Kiprop Koech', gender: 'Male' as const, dob: '2013-02-15', pName: 'Koech Kemei', pPhone: '+254 721 890 107' },
        { admNo: 'NGON/2026/008', name: 'Vivian Jeruto Kimutai', gender: 'Female' as const, dob: '2013-09-03', pName: 'Kimutai Suter', pPhone: '+254 721 890 108' },
        { admNo: 'NGON/2026/009', name: 'Emmanuel Kiplagat Bowen', gender: 'Male' as const, dob: '2013-06-25', pName: 'Bowen Kaino', pPhone: '+254 721 890 109' },
        { admNo: 'NGON/2026/010', name: 'Sharon Jepchumba Biwott', gender: 'Female' as const, dob: '2013-11-19', pName: 'Biwott Chesire', pPhone: '+254 721 890 110' },
        { admNo: 'NGON/2026/011', name: 'Allan Kipkemboi Korir', gender: 'Male' as const, dob: '2013-03-08', pName: 'Korir Cheruiyot', pPhone: '+254 721 890 111' },
        { admNo: 'NGON/2026/012', name: 'Cynthia Chebet Rutto', gender: 'Female' as const, dob: '2013-10-14', pName: 'Rutto Tarus', pPhone: '+254 721 890 112' },
        { admNo: 'NGON/2026/013', name: 'Victor Kipkosgei Lagat', gender: 'Male' as const, dob: '2013-01-27', pName: 'Lagat Serem', pPhone: '+254 721 890 113' },
        { admNo: 'NGON/2026/014', name: 'Beatrice Jepkorir Suter', gender: 'Female' as const, dob: '2013-12-05', pName: 'Suter Komen', pPhone: '+254 721 890 114' },
        { admNo: 'NGON/2026/015', name: 'Titus Kipngetich Maiyo', gender: 'Male' as const, dob: '2013-04-12', pName: 'Maiyo Chelimo', pPhone: '+254 721 890 115' },
        { admNo: 'NGON/2026/016', name: 'Gloria Chepkemoi Kurgat', gender: 'Female' as const, dob: '2013-08-28', pName: 'Kurgat Too', pPhone: '+254 721 890 116' },
        { admNo: 'NGON/2026/017', name: 'Felix Kiptoo Kemei', gender: 'Male' as const, dob: '2013-02-04', pName: 'Kemei Yego', pPhone: '+254 721 890 117' },
        { admNo: 'NGON/2026/018', name: 'Purity Jerotich Rotich', gender: 'Female' as const, dob: '2013-07-20', pName: 'Rotich Kosgei', pPhone: '+254 721 890 118' },
        { admNo: 'NGON/2026/019', name: 'Gideon Kiprono Yego', gender: 'Male' as const, dob: '2013-05-16', pName: 'Yego Bartai', pPhone: '+254 721 890 119' },
        { admNo: 'NGON/2026/020', name: 'Daisy Cheptoo Chemweno', gender: 'Female' as const, dob: '2013-09-17', pName: 'Chemweno Kiptoo', pPhone: '+254 721 890 120' },
        { admNo: 'NGON/2026/021', name: 'Kelvin Kipchirchir Tarus', gender: 'Male' as const, dob: '2013-03-31', pName: 'Tarus Kibiwot', pPhone: '+254 721 890 121' },
        { admNo: 'NGON/2026/022', name: 'Joyline Jeptepkeny Sang', gender: 'Female' as const, dob: '2013-06-09', pName: 'Sang Keter', pPhone: '+254 721 890 122' },
        { admNo: 'NGON/2026/023', name: 'Meshack Kipchumba Chesire', gender: 'Male' as const, dob: '2013-11-02', pName: 'Chesire Bett', pPhone: '+254 721 890 123' },
        { admNo: 'NGON/2026/024', name: 'Ruth Cherotich Chelimo', gender: 'Female' as const, dob: '2013-01-07', pName: 'Chelimo Tanui', pPhone: '+254 721 890 124' },
        { admNo: 'NGON/2026/025', name: 'Ian Kipkoech Too', gender: 'Male' as const, dob: '2013-10-23', pName: 'Too Cherono', pPhone: '+254 721 890 125' },
        { admNo: 'NGON/2026/026', name: 'Millicent Chepngeno Bii', gender: 'Female' as const, dob: '2013-04-19', pName: 'Bii Koech', pPhone: '+254 721 890 126' },
        { admNo: 'NGON/2026/027', name: 'Brian Kibet Kendagor', gender: 'Male' as const, dob: '2013-08-14', pName: 'Kendagor Suter', pPhone: '+254 721 890 127' },
        { admNo: 'NGON/2026/028', name: 'Diana Jepchumba Kiprono', gender: 'Female' as const, dob: '2013-12-11', pName: 'Kiprono Rutto', pPhone: '+254 721 890 128' },
        { admNo: 'NGON/2026/029', name: 'Caleb Kipruto Serem', gender: 'Male' as const, dob: '2013-02-28', pName: 'Serem Kurgat', pPhone: '+254 721 890 129' },
        { admNo: 'NGON/2026/030', name: 'Fancy Chebet Kipkemoi', gender: 'Female' as const, dob: '2013-05-06', pName: 'Kipkemoi Bowen', pPhone: '+254 721 890 130' },
        { admNo: 'NGON/2026/031', name: 'Alex Kiprotich Keter', gender: 'Male' as const, dob: '2013-09-29', pName: 'Keter Lagat', pPhone: '+254 721 890 131' },
        { admNo: 'NGON/2026/032', name: 'Prudence Jerono Kosgei', gender: 'Female' as const, dob: '2013-03-17', pName: 'Kosgei Biwott', pPhone: '+254 721 890 132' },
        { admNo: 'NGON/2026/033', name: 'Silas Kiplimo Kaino', gender: 'Male' as const, dob: '2013-07-04', pName: 'Kaino Maiyo', pPhone: '+254 721 890 133' },
        { admNo: 'NGON/2026/034', name: 'Sheila Chepkirui Bett', gender: 'Female' as const, dob: '2013-11-26', pName: 'Bett Rotich', pPhone: '+254 721 890 134' },
        { admNo: 'NGON/2026/035', name: 'Festus Kipchumba Toroitich', gender: 'Male' as const, dob: '2013-01-12', pName: 'Toroitich Kemei', pPhone: '+254 721 890 135' },
        { admNo: 'NGON/2026/036', name: 'Nelly Jepkemboi Kibiwot', gender: 'Female' as const, dob: '2013-06-18', pName: 'Kibiwot Tarus', pPhone: '+254 721 890 136' },
        { admNo: 'NGON/2026/037', name: 'Daniel Kipkosgei Sambu', gender: 'Male' as const, dob: '2013-10-09', pName: 'Sambu Chemweno', pPhone: '+254 721 890 137' },
        { admNo: 'NGON/2026/038', name: 'Naomi Cherop Cheserek', gender: 'Female' as const, dob: '2013-04-03', pName: 'Cheserek Too', pPhone: '+254 721 890 138' },
        { admNo: 'NGON/2026/039', name: 'Evans Kiprop Bartai', gender: 'Male' as const, dob: '2013-08-21', pName: 'Bartai Sang', pPhone: '+254 721 890 139' },
        { admNo: 'NGON/2026/040', name: 'Judith Jepkoech Komen', gender: 'Female' as const, dob: '2013-12-30', pName: 'Komen Chesire', pPhone: '+254 721 890 140' },
      ];

      const cbcSubs = [
        'Mathematics', 'English Language', 'Kiswahili Lugha', 'Integrated Science',
        'Pretechnical Studies', 'Social Studies', 'CRE', 'Agriculture', 'Creative Arts & Sports'
      ];

      const ngonyekStudents = rawGrade7.map((item, idx) => {
        const parts = item.name.split(' ');
        const fName = parts[0];
        const lName = parts.slice(1).join(' ');
        return {
          id: `std-ngon-${String(idx + 1).padStart(3, '0')}`,
          schoolId: 'sch-ngonyek-30200',
          admNo: item.admNo,
          upi: `UPI-2026-NGON-${String(idx + 1).padStart(3, '0')}`,
          name: item.name,
          firstName: fName,
          lastName: lName,
          gender: item.gender,
          dateOfBirth: item.dob,
          grade: 'Grade 7',
          classArm: 'Grade 7 North',
          stream: 'North',
          term: 'Term 1',
          year: 2026,
          avgScore: null,
          overallGrade: '-',
          position: '-',
          attendance: 98,
          subjects: cbcSubs.map((s) => ({
            subject: s,
            score: null,
            grade: '-',
            remarks: 'Not Assessed / Pending Marks',
          })),
          classTeacherComment: 'Enrolled in Grade 7 North. Continuous and summative assessment marks pending entry.',
          classTeacherName: 'Vivian Lumayo',
          headOfSchoolName: 'Jotham Watila',
          headTeacherComment: 'Formally admitted to Ngonyek Junior School Grade 7 North. Welcome to the institution.',
          nextTermDate: '2026-05-04',
          parentName: item.pName,
          parentPhone: item.pPhone,
        };
      });

      const ngonyekTeachersList = [
        {
          id: 'tch-ngon-01',
          schoolId: 'sch-ngonyek-30200',
          name: 'Vivian Lumayo',
          email: 'vivian.lumayo@ngonyek.sc.ke',
          phoneNumber: '+254 722 341 001',
          role: 'Class Teacher',
          designation: 'Class Teacher',
          department: 'Mathematics & Technical',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-421901',
          tscNumber: 'TSC-421901',
          staffNumber: 'NJSS-STF-001',
          avatarHex: '#047857',
          isClassTeacher: true,
          assignedClass: 'Grade 7 North',
          classes: ['Grade 7 North'],
          subjects: ['Mathematics', 'Pretechnical Studies'],
          allocations: [{ className: 'Grade 7 North', subjects: ['Mathematics', 'Pretechnical Studies'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
        {
          id: 'tch-ngon-02',
          schoolId: 'sch-ngonyek-30200',
          name: 'Agness Waswa',
          email: 'agness.waswa@ngonyek.sc.ke',
          phoneNumber: '+254 722 341 002',
          role: 'TEACHER',
          designation: 'Subject Teacher',
          department: 'Languages',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-384721',
          tscNumber: 'TSC-384721',
          staffNumber: 'NJSS-STF-002',
          avatarHex: '#7C3AED',
          isClassTeacher: false,
          classes: ['Grade 7 North'],
          subjects: ['English Language', 'Creative Arts & Sports'],
          allocations: [{ className: 'Grade 7 North', subjects: ['English Language', 'Creative Arts & Sports'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
        {
          id: 'tch-ngon-03',
          schoolId: 'sch-ngonyek-30200',
          name: 'Brenda Mwanjala',
          email: 'brenda.mwanjala@ngonyek.sc.ke',
          phoneNumber: '+254 722 341 003',
          role: 'TEACHER',
          designation: 'Subject Teacher',
          department: 'Humanities & Languages',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-459203',
          tscNumber: 'TSC-459203',
          staffNumber: 'NJSS-STF-003',
          avatarHex: '#B45309',
          isClassTeacher: false,
          classes: ['Grade 7 North'],
          subjects: ['Kiswahili Lugha', 'Social Studies'],
          allocations: [{ className: 'Grade 7 North', subjects: ['Kiswahili Lugha', 'Social Studies'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
        {
          id: 'tch-ngon-04',
          schoolId: 'sch-ngonyek-30200',
          name: 'Brian Onyancha',
          email: 'brian.onyancha@ngonyek.sc.ke',
          phoneNumber: '+254 722 341 004',
          role: 'TEACHER',
          designation: 'Subject Teacher',
          department: 'Sciences & Agriculture',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-512044',
          tscNumber: 'TSC-512044',
          staffNumber: 'NJSS-STF-004',
          avatarHex: '#0284C7',
          isClassTeacher: false,
          classes: ['Grade 7 North'],
          subjects: ['Integrated Science', 'Agriculture'],
          allocations: [{ className: 'Grade 7 North', subjects: ['Integrated Science', 'Agriculture'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
        {
          id: 'tch-ngon-05',
          schoolId: 'sch-ngonyek-30200',
          name: 'Joyce Kamar',
          email: 'joyce.kamar@ngonyek.sc.ke',
          phoneNumber: '+254 722 341 005',
          role: 'TEACHER',
          designation: 'Subject Teacher',
          department: 'Religious Studies & Humanities',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-498115',
          tscNumber: 'TSC-498115',
          staffNumber: 'NJSS-STF-005',
          avatarHex: '#BE185D',
          isClassTeacher: false,
          classes: ['Grade 7 North'],
          subjects: ['CRE', 'Creative Arts & Sports'],
          allocations: [{ className: 'Grade 7 North', subjects: ['CRE', 'Creative Arts & Sports'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
        {
          id: 'tch-ngon-06',
          schoolId: 'sch-ngonyek-30200',
          name: 'Jotham Watila',
          email: 'head@ngonyek.sc.ke',
          phoneNumber: '+254 741 478 813',
          role: 'HEAD_TEACHER',
          designation: 'Head of Institution',
          department: 'Administration & Applied Sciences',
          employmentStatus: 'Permanent & Pensionable',
          employeeNumber: 'TSC-299991',
          tscNumber: 'TSC-299991',
          staffNumber: 'NJSS-STF-006',
          avatarHex: '#1E3A8A',
          isClassTeacher: false,
          classes: ['Grade 7 North'],
          subjects: ['Pretechnical Studies'],
          allocations: [{ className: 'Grade 7 North', subjects: ['Pretechnical Studies'] }],
          active: true,
          accountStatus: 'APPROVED',
        },
      ];

      const ngonyekBundle: ServerTenantDataBundle = {
        tenantId: 'sch-ngonyek-30200',
        students: ngonyekStudents,
        teachers: ngonyekTeachersList,
        assessments: [
          {
            id: 'ass-ngon-cat1',
            schoolId: 'sch-ngonyek-30200',
            name: 'Grade 7 North Mathematics Continuous Assessment Test 1',
            className: 'Grade 7 North',
            subject: 'Mathematics',
            totalMarks: 30,
            term: 'Term 1',
            date: '2026-03-24',
          },
        ],
        grades: [],
        timetables: [],
        classes: ['Grade 7 North'],
        academicStreams: [
          {
            id: 'strm-ngon-7-north',
            schoolId: 'sch-ngonyek-30200',
            streamName: 'North',
            gradeName: 'Grade 7',
            fullClassName: 'Grade 7 North',
            capacity: 45,
            currentEnrollment: 40,
            classTeacherId: 'tch-ngon-01',
            classTeacherName: 'Vivian Lumayo',
            assignedRoom: 'Junior Secondary Room 7N',
            academicYear: 2026,
            isActive: true,
          },
        ],
        attendanceRegisters: [
          {
            id: 'att-ngon-001',
            schoolId: 'sch-ngonyek-30200',
            className: 'Grade 7 North',
            grade: 'Grade 7',
            stream: 'North',
            date: '2026-03-20',
            academicYear: 2026,
            term: 'Term 1',
            isLocked: false,
            entries: ngonyekStudents.map((s) => ({
              studentId: s.id,
              admNo: s.admNo,
              studentName: s.name,
              gender: s.gender,
              status: 'Present',
              recordedBy: 'Vivian Lumayo',
              recordedAt: '2026-03-20T08:00:00Z',
            })),
          },
        ],
        behaviorRecords: [],
        disciplineIncidents: [],
        healthIncidents: [],
        healthProfiles: {},
        counselingSessions: [],
        vulnerableLearners: [],
        welfareCheckIns: [],
        transfersOut: [],
        transfersIn: [],
        graduations: [],
        parentCommunications: [],
        academicSubjects: [],
        academicYears: [],
        terms: [],
        teacherSubjectAllocations: [],
        classTeacherAllocations: [
          {
            id: 'cta-ngon-7-north',
            streamId: 'strm-ngon-7-north',
            fullClassName: 'Grade 7 North',
            primaryClassTeacherId: 'tch-ngon-01',
            primaryClassTeacherName: 'Vivian Lumayo',
            assistantClassTeacherId: 'tch-ngon-02',
            assistantClassTeacherName: 'Agness Waswa',
            academicYear: 2026,
            termNumber: 1,
            responsibilities: [
              'Daily morning attendance roll call sign-off',
              'Termly student progress card holistic remarks',
              'Parent-teacher consultation coordination',
              'Discipline & pastoral care tracking',
              'Learner welfare and counseling liaison',
            ],
            appointedBy: 'Jotham Watila (Head of Institution)',
            appointmentDate: '2026-01-08',
            status: 'ACTIVE',
          },
        ],
        schoolInfo: {
          name: 'Ngonyek Junior School',
          motto: 'Excellence in Competency & Integrity',
          address: 'P.O. Box 78, Ngonyek',
          email: 'admin@ngonyek.sc.ke',
          phone: '+254 741 478 813',
          code: 'NGONYEK-30200',
          headTeacher: 'Jotham Watila',
          headOfInstitution: 'Jotham Watila',
          totalStudents: 40,
          totalClasses: 1,
          totalAssessments: 1,
        },
        schoolProfile: {
          schoolName: 'Ngonyek Junior School',
          motto: 'Excellence in Competency & Integrity',
          email: 'admin@ngonyek.sc.ke',
          phone: '+254 741 478 813',
        },
        settings: {},
        auditLogs: [],
        lastUpdated: new Date().toISOString(),
      };
      this.tenantData.set('sch-ngonyek-30200', ngonyekBundle);
      modified = true;
    }

    if (modified) {
      this.saveToDisk();
    }
  }

  private ensureDefaultOwner() {
    let modified = false;
    if (!this.users.has('usr-001')) {
      this.users.set('usr-001', {
        id: 'usr-001',
        fullName: 'Jotham Barasa Watila',
        username: 'jotham Watila',
        email: 'jothambarasawatila@gmail.com',
        phoneNumber: '+254741478813',
        role: 'SUPER_ADMIN',
        designation: 'Platform Owner & Super Administrator',
        active: true,
        mfaEnabled: true,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      });
      modified = true;
    }

    const ngonyekUsers = [
      {
        id: 'usr-head-ngonyek-30200',
        fullName: 'Jotham Watila',
        username: 'head.ngonyek',
        email: 'head@ngonyek.sc.ke',
        phoneNumber: '+254741478813',
        role: 'HEAD_TEACHER',
        designation: 'Head of Institution',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: true,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
      {
        id: 'usr-tch-ngon-01',
        fullName: 'Vivian Lumayo',
        username: 'vivian.lumayo',
        email: 'vivian.lumayo@ngonyek.sc.ke',
        phoneNumber: '+254722341001',
        role: 'TEACHER',
        designation: 'Class Teacher (Grade 7 North)',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: false,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
      {
        id: 'usr-tch-ngon-02',
        fullName: 'Agness Waswa',
        username: 'agness.waswa',
        email: 'agness.waswa@ngonyek.sc.ke',
        phoneNumber: '+254722341002',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: false,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
      {
        id: 'usr-tch-ngon-03',
        fullName: 'Brenda Mwanjala',
        username: 'brenda.mwanjala',
        email: 'brenda.mwanjala@ngonyek.sc.ke',
        phoneNumber: '+254722341003',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: false,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
      {
        id: 'usr-tch-ngon-04',
        fullName: 'Brian Onyancha',
        username: 'brian.onyancha',
        email: 'brian.onyancha@ngonyek.sc.ke',
        phoneNumber: '+254722341004',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: false,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
      {
        id: 'usr-tch-ngon-05',
        fullName: 'Joyce Kamar',
        username: 'joyce.kamar',
        email: 'joyce.kamar@ngonyek.sc.ke',
        phoneNumber: '+254722341005',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: false,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      },
    ];

    for (const nu of ngonyekUsers) {
      const existing = this.users.get(nu.id);
      if (!existing || existing.fullName !== nu.fullName || existing.email !== nu.email) {
        this.users.set(nu.id, nu);
        modified = true;
      }
    }

    if (modified) {
      this.saveToDisk();
    }
  }

  private loadFromDisk() {
    try {
      let raw: string | null = null;
      if (fs.existsSync(this.filePath)) {
        try {
          raw = fs.readFileSync(this.filePath, 'utf-8');
        } catch (readErr) {
          console.warn('[MultiTenantStorage] Primary file read failed, trying backup:', readErr);
        }
      }
      const backupPath = `${this.filePath}.bak`;
      if (!raw && fs.existsSync(backupPath)) {
        try {
          raw = fs.readFileSync(backupPath, 'utf-8');
          console.log('[MultiTenantStorage] Restored storage from backup copy.');
        } catch (bakErr) {
          console.error('[MultiTenantStorage] Backup read error:', bakErr);
        }
      }

      if (raw) {
        const data = JSON.parse(raw);

        if (Array.isArray(data.deletedTenantIds)) {
          this.deletedTenantIds = new Set(data.deletedTenantIds);
        }

        if (Array.isArray(data.tenants)) {
          data.tenants.forEach((t: ServerSchoolTenant) => {
            if (t && t.schoolId && !this.deletedTenantIds.has(t.schoolId)) {
              // Policy: All schools registered and that will be registered should be placed under trial first
              const isLocked = t.status === 'DISABLED' || t.status === 'SUSPENDED';
              const normalizedTenant: ServerSchoolTenant = {
                ...t,
                status: isLocked ? t.status : (t.status === 'ACTIVE' ? 'TRIAL' : (t.status || 'TRIAL')),
              };
              this.tenants.set(t.schoolId, normalizedTenant);
            }
          });
        }

        if (Array.isArray(data.users)) {
          data.users.forEach((u: ServerUserData) => {
            if (u && u.id && (!u.schoolId || !this.deletedTenantIds.has(u.schoolId))) {
              this.users.set(u.id, u);
            }
          });
        }

        if (data.tenantData && typeof data.tenantData === 'object') {
          Object.keys(data.tenantData).forEach((tenantId) => {
            if (!this.deletedTenantIds.has(tenantId)) {
              this.tenantData.set(tenantId, data.tenantData[tenantId]);
            }
          });
        }
      }
    } catch (err) {
      console.error('[MultiTenantStorage] Error loading storage from disk:', err);
    }
  }

  private saveToDisk() {
    try {
      const data = {
        tenants: Array.from(this.tenants.values()),
        users: Array.from(this.users.values()),
        tenantData: Object.fromEntries(this.tenantData.entries()),
        deletedTenantIds: Array.from(this.deletedTenantIds),
        savedAt: new Date().toISOString(),
      };
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Atomic write: write to temp file then rename
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, jsonContent, 'utf-8');
      fs.renameSync(tempPath, this.filePath);

      // Keep a valid backup copy for disaster recovery
      const backupPath = `${this.filePath}.bak`;
      fs.writeFileSync(backupPath, jsonContent, 'utf-8');
    } catch (err) {
      console.error('[MultiTenantStorage] Error saving storage to disk:', err);
      // Fallback direct write if atomic rename encounters filesystem locks
      try {
        const fallbackData = {
          tenants: Array.from(this.tenants.values()),
          users: Array.from(this.users.values()),
          tenantData: Object.fromEntries(this.tenantData.entries()),
          deletedTenantIds: Array.from(this.deletedTenantIds),
          savedAt: new Date().toISOString(),
        };
        fs.writeFileSync(this.filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
      } catch (directErr) {
        console.error('[MultiTenantStorage] Direct write fallback also failed:', directErr);
      }
    }
  }

  // ===================== TENANTS =====================
  public getAllTenants(): ServerSchoolTenant[] {
    return Array.from(this.tenants.values()).filter((t) => !this.deletedTenantIds.has(t.schoolId));
  }

  public getDeletedTenantIds(): string[] {
    return Array.from(this.deletedTenantIds);
  }

  public isTenantDeleted(schoolId: string): boolean {
    return this.deletedTenantIds.has(schoolId);
  }

  public getTenant(schoolId: string): ServerSchoolTenant | null {
    if (this.deletedTenantIds.has(schoolId)) return null;
    return this.tenants.get(schoolId) || null;
  }

  public saveTenant(tenant: ServerSchoolTenant): ServerSchoolTenant {
    // If being re-created or updated, clear from deleted tombstone
    this.deletedTenantIds.delete(tenant.schoolId);
    const existing = this.tenants.get(tenant.schoolId);
    // Policy: All schools registered and that will be registered should be placed under trial first
    const finalTenant: ServerSchoolTenant = {
      ...tenant,
      status: tenant.status || existing?.status || 'TRIAL',
    };
    this.tenants.set(tenant.schoolId, finalTenant);
    if (!this.tenantData.has(tenant.schoolId)) {
      this.tenantData.set(tenant.schoolId, {
        tenantId: tenant.schoolId,
        students: [],
        teachers: [],
        assessments: [],
        grades: [],
        timetables: [],
        classes: [],
        settings: {},
        auditLogs: [],
        lastUpdated: new Date().toISOString(),
      });
    }
    this.saveToDisk();
    return finalTenant;
  }

  public updateTenantStatus(schoolId: string, status: ServerSchoolTenant['status']): boolean {
    if (this.deletedTenantIds.has(schoolId)) return false;
    let existing = this.tenants.get(schoolId);
    if (!existing) {
      existing = {
        schoolId,
        schoolCode: schoolId.toUpperCase(),
        schoolName: schoolId,
        subdomain: schoolId.replace(/^sch-/, '').replace(/-.*$/, ''),
        status,
      };
    } else {
      existing.status = status;
    }
    this.tenants.set(schoolId, existing);
    this.saveToDisk();
    return true;
  }

  public deleteTenant(schoolId: string): boolean {
    this.deletedTenantIds.add(schoolId);
    const deleted = this.tenants.delete(schoolId);
    this.tenantData.delete(schoolId);
    // Remove users of this tenant
    for (const [userId, user] of this.users.entries()) {
      if (user.schoolId === schoolId) {
        this.users.delete(userId);
      }
    }
    this.saveToDisk();
    return true;
  }

  // ===================== USERS =====================
  public getAllUsers(): ServerUserData[] {
    return Array.from(this.users.values()).filter(
      (u) => !u.schoolId || !this.deletedTenantIds.has(u.schoolId)
    );
  }

  public getUser(userId: string): ServerUserData | null {
    const user = this.users.get(userId);
    if (!user) return null;
    if (user.schoolId && this.deletedTenantIds.has(user.schoolId)) return null;
    return user;
  }

  public findUserByIdentifier(identifier: string): ServerUserData | null {
    const norm = (identifier || '').trim().toLowerCase();
    const cleanDigits = norm.replace(/\D/g, '');

    for (const user of this.users.values()) {
      if (user.schoolId && this.deletedTenantIds.has(user.schoolId)) {
        continue;
      }
      if (
        user.id.toLowerCase() === norm ||
        user.username.toLowerCase() === norm ||
        user.email.toLowerCase() === norm
      ) {
        return user;
      }
      const userDigits = user.phoneNumber.replace(/\D/g, '');
      if (cleanDigits.length >= 8 && userDigits.endsWith(cleanDigits)) {
        return user;
      }
    }
    return null;
  }

  public saveUser(user: ServerUserData): ServerUserData {
    this.users.set(user.id, user);
    this.saveToDisk();
    return user;
  }

  public updateUserStatus(userId: string, status: ServerUserData['activationStatus']): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.activationStatus = status;
    if (status === 'ACTIVE') {
      user.active = true;
      user.firstLoginCompleted = true;
    }
    this.users.set(userId, user);
    this.saveToDisk();
    return true;
  }

  // ===================== TENANT DATA ISOLATION =====================
  public buildNgonyekBundle(): ServerTenantDataBundle {
    const rawGrade7 = [
      { admNo: 'NGON/2026/001', name: 'Brian Kipchumba Bett', gender: 'Male' as const, dob: '2013-03-14', pName: 'Kipchumba Bett', pPhone: '+254 721 890 101' },
      { admNo: 'NGON/2026/002', name: 'Faith Jepkemoi Cheruiyot', gender: 'Female' as const, dob: '2013-05-22', pName: 'Cheruiyot Sang', pPhone: '+254 721 890 102' },
      { admNo: 'NGON/2026/003', name: 'Kevin Kiprotich Kiptoo', gender: 'Male' as const, dob: '2013-01-18', pName: 'Kiptoo Korir', pPhone: '+254 721 890 103' },
      { admNo: 'NGON/2026/004', name: 'Mercy Chepkoech Mutai', gender: 'Female' as const, dob: '2013-08-09', pName: 'Mutai Bii', pPhone: '+254 721 890 104' },
      { admNo: 'NGON/2026/005', name: 'Dennis Kipkorir Tanui', gender: 'Male' as const, dob: '2013-04-30', pName: 'Tanui Rono', pPhone: '+254 721 890 105' },
      { admNo: 'NGON/2026/006', name: 'Brenda Cherono Langat', gender: 'Female' as const, dob: '2013-07-11', pName: 'Langat Chepkwony', pPhone: '+254 721 890 106' },
      { admNo: 'NGON/2026/007', name: 'Collins Kiprop Koech', gender: 'Male' as const, dob: '2013-02-15', pName: 'Koech Kemei', pPhone: '+254 721 890 107' },
      { admNo: 'NGON/2026/008', name: 'Vivian Jeruto Kimutai', gender: 'Female' as const, dob: '2013-09-03', pName: 'Kimutai Suter', pPhone: '+254 721 890 108' },
      { admNo: 'NGON/2026/009', name: 'Emmanuel Kiplagat Bowen', gender: 'Male' as const, dob: '2013-06-25', pName: 'Bowen Kaino', pPhone: '+254 721 890 109' },
      { admNo: 'NGON/2026/010', name: 'Sharon Jepchumba Biwott', gender: 'Female' as const, dob: '2013-11-19', pName: 'Biwott Chesire', pPhone: '+254 721 890 110' },
      { admNo: 'NGON/2026/011', name: 'Allan Kipkemboi Korir', gender: 'Male' as const, dob: '2013-03-08', pName: 'Korir Cheruiyot', pPhone: '+254 721 890 111' },
      { admNo: 'NGON/2026/012', name: 'Cynthia Chebet Rutto', gender: 'Female' as const, dob: '2013-10-14', pName: 'Rutto Tarus', pPhone: '+254 721 890 112' },
      { admNo: 'NGON/2026/013', name: 'Victor Kipkosgei Lagat', gender: 'Male' as const, dob: '2013-01-27', pName: 'Lagat Serem', pPhone: '+254 721 890 113' },
      { admNo: 'NGON/2026/014', name: 'Beatrice Jepkorir Suter', gender: 'Female' as const, dob: '2013-12-05', pName: 'Suter Komen', pPhone: '+254 721 890 114' },
      { admNo: 'NGON/2026/015', name: 'Titus Kipngetich Maiyo', gender: 'Male' as const, dob: '2013-04-12', pName: 'Maiyo Chelimo', pPhone: '+254 721 890 115' },
      { admNo: 'NGON/2026/016', name: 'Gloria Chepkemoi Kurgat', gender: 'Female' as const, dob: '2013-08-28', pName: 'Kurgat Too', pPhone: '+254 721 890 116' },
      { admNo: 'NGON/2026/017', name: 'Felix Kiptoo Kemei', gender: 'Male' as const, dob: '2013-02-04', pName: 'Kemei Yego', pPhone: '+254 721 890 117' },
      { admNo: 'NGON/2026/018', name: 'Purity Jerotich Rotich', gender: 'Female' as const, dob: '2013-07-20', pName: 'Rotich Kosgei', pPhone: '+254 721 890 118' },
      { admNo: 'NGON/2026/019', name: 'Gideon Kiprono Yego', gender: 'Male' as const, dob: '2013-05-16', pName: 'Yego Bartai', pPhone: '+254 721 890 119' },
      { admNo: 'NGON/2026/020', name: 'Daisy Cheptoo Chemweno', gender: 'Female' as const, dob: '2013-09-17', pName: 'Chemweno Kiptoo', pPhone: '+254 721 890 120' },
      { admNo: 'NGON/2026/021', name: 'Kelvin Kipchirchir Tarus', gender: 'Male' as const, dob: '2013-03-31', pName: 'Tarus Kibiwot', pPhone: '+254 721 890 121' },
      { admNo: 'NGON/2026/022', name: 'Joyline Jeptepkeny Sang', gender: 'Female' as const, dob: '2013-06-09', pName: 'Sang Keter', pPhone: '+254 721 890 122' },
      { admNo: 'NGON/2026/023', name: 'Meshack Kipchumba Chesire', gender: 'Male' as const, dob: '2013-11-02', pName: 'Chesire Bett', pPhone: '+254 721 890 123' },
      { admNo: 'NGON/2026/024', name: 'Ruth Cherotich Chelimo', gender: 'Female' as const, dob: '2013-01-07', pName: 'Chelimo Tanui', pPhone: '+254 721 890 124' },
      { admNo: 'NGON/2026/025', name: 'Ian Kipkoech Too', gender: 'Male' as const, dob: '2013-10-23', pName: 'Too Cherono', pPhone: '+254 721 890 125' },
      { admNo: 'NGON/2026/026', name: 'Millicent Chepngeno Bii', gender: 'Female' as const, dob: '2013-04-19', pName: 'Bii Koech', pPhone: '+254 721 890 126' },
      { admNo: 'NGON/2026/027', name: 'Brian Kibet Kendagor', gender: 'Male' as const, dob: '2013-08-14', pName: 'Kendagor Suter', pPhone: '+254 721 890 127' },
      { admNo: 'NGON/2026/028', name: 'Diana Jepchumba Kiprono', gender: 'Female' as const, dob: '2013-12-11', pName: 'Kiprono Rutto', pPhone: '+254 721 890 128' },
      { admNo: 'NGON/2026/029', name: 'Caleb Kipruto Serem', gender: 'Male' as const, dob: '2013-02-28', pName: 'Serem Kurgat', pPhone: '+254 721 890 129' },
      { admNo: 'NGON/2026/030', name: 'Fancy Chebet Kipkemoi', gender: 'Female' as const, dob: '2013-05-06', pName: 'Kipkemoi Bowen', pPhone: '+254 721 890 130' },
      { admNo: 'NGON/2026/031', name: 'Alex Kiprotich Keter', gender: 'Male' as const, dob: '2013-09-29', pName: 'Keter Lagat', pPhone: '+254 721 890 131' },
      { admNo: 'NGON/2026/032', name: 'Prudence Jerono Kosgei', gender: 'Female' as const, dob: '2013-03-17', pName: 'Kosgei Biwott', pPhone: '+254 721 890 132' },
      { admNo: 'NGON/2026/033', name: 'Silas Kiplimo Kaino', gender: 'Male' as const, dob: '2013-07-04', pName: 'Kaino Maiyo', pPhone: '+254 721 890 133' },
      { admNo: 'NGON/2026/034', name: 'Sheila Chepkirui Bett', gender: 'Female' as const, dob: '2013-11-26', pName: 'Bett Rotich', pPhone: '+254 721 890 134' },
      { admNo: 'NGON/2026/035', name: 'Festus Kipchumba Toroitich', gender: 'Male' as const, dob: '2013-01-12', pName: 'Toroitich Kemei', pPhone: '+254 721 890 135' },
      { admNo: 'NGON/2026/036', name: 'Nelly Jepkemboi Kibiwot', gender: 'Female' as const, dob: '2013-06-18', pName: 'Kibiwot Tarus', pPhone: '+254 721 890 136' },
      { admNo: 'NGON/2026/037', name: 'Daniel Kipkosgei Sambu', gender: 'Male' as const, dob: '2013-10-09', pName: 'Sambu Chemweno', pPhone: '+254 721 890 137' },
      { admNo: 'NGON/2026/038', name: 'Naomi Cherop Cheserek', gender: 'Female' as const, dob: '2013-04-03', pName: 'Cheserek Too', pPhone: '+254 721 890 138' },
      { admNo: 'NGON/2026/039', name: 'Evans Kiprop Bartai', gender: 'Male' as const, dob: '2013-08-21', pName: 'Bartai Sang', pPhone: '+254 721 890 139' },
      { admNo: 'NGON/2026/040', name: 'Judith Jepkoech Komen', gender: 'Female' as const, dob: '2013-12-30', pName: 'Komen Chesire', pPhone: '+254 721 890 140' },
    ];

    const cbcSubs = [
      'Mathematics', 'English Language', 'Kiswahili Lugha', 'Integrated Science',
      'Pretechnical Studies', 'Social Studies', 'CRE', 'Agriculture', 'Creative Arts & Sports'
    ];

    const ngonyekStudents = rawGrade7.map((item, idx) => {
      const parts = item.name.split(' ');
      const fName = parts[0];
      const lName = parts.slice(1).join(' ');
      return {
        id: `std-ngon-${String(idx + 1).padStart(3, '0')}`,
        schoolId: 'sch-ngonyek-30200',
        admNo: item.admNo,
        upi: `UPI-2026-NGON-${String(idx + 1).padStart(3, '0')}`,
        name: item.name,
        firstName: fName,
        lastName: lName,
        gender: item.gender,
        dateOfBirth: item.dob,
        grade: 'Grade 7',
        classArm: 'Grade 7 North',
        stream: 'North',
        enrollmentDate: '2026-01-08',
        status: 'Active',
        term: 'Term 1',
        year: 2026,
        avgScore: null,
        overallGrade: '-',
        position: '-',
        streamPosition: '-',
        gradePosition: '-',
        streamRank: null,
        gradeRank: null,
        attendance: 98,
        subjects: cbcSubs.map((s) => ({
          subject: s,
          score: null,
          grade: '-',
          remarks: 'Not Assessed / Pending Marks',
        })),
        classTeacherComment: 'Enrolled in Grade 7 North. Continuous and summative assessment marks pending entry.',
        classTeacherName: 'Vivian Lumayo',
        headOfSchoolName: 'Jotham Watila',
        headTeacherComment: 'Formally admitted to Ngonyek Junior School Grade 7 North. Welcome to the institution.',
        nextTermDate: '2026-05-04',
        parentName: item.pName,
        parentPhone: item.pPhone,
      };
    });

    const ngonyekTeachersList = [
      {
        id: 'tch-ngon-01',
        schoolId: 'sch-ngonyek-30200',
        name: 'Vivian Lumayo',
        email: 'vivian.lumayo@ngonyek.sc.ke',
        phoneNumber: '+254 722 341 001',
        role: 'Class Teacher',
        designation: 'Class Teacher',
        department: 'Mathematics & Technical',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-421901',
        tscNumber: 'TSC-421901',
        staffNumber: 'NJSS-STF-001',
        avatarHex: '#047857',
        isClassTeacher: true,
        assignedClass: 'Grade 7 North',
        classes: ['Grade 7 North'],
        subjects: ['Mathematics', 'Pretechnical Studies'],
        allocations: [{ className: 'Grade 7 North', subjects: ['Mathematics', 'Pretechnical Studies'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
      {
        id: 'tch-ngon-02',
        schoolId: 'sch-ngonyek-30200',
        name: 'Agness Waswa',
        email: 'agness.waswa@ngonyek.sc.ke',
        phoneNumber: '+254 722 341 002',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        department: 'Languages',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-384721',
        tscNumber: 'TSC-384721',
        staffNumber: 'NJSS-STF-002',
        avatarHex: '#7C3AED',
        isClassTeacher: false,
        classes: ['Grade 7 North'],
        subjects: ['English Language', 'Creative Arts & Sports'],
        allocations: [{ className: 'Grade 7 North', subjects: ['English Language', 'Creative Arts & Sports'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
      {
        id: 'tch-ngon-03',
        schoolId: 'sch-ngonyek-30200',
        name: 'Brenda Mwanjala',
        email: 'brenda.mwanjala@ngonyek.sc.ke',
        phoneNumber: '+254 722 341 003',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        department: 'Humanities & Languages',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-459203',
        tscNumber: 'TSC-459203',
        staffNumber: 'NJSS-STF-003',
        avatarHex: '#B45309',
        isClassTeacher: false,
        classes: ['Grade 7 North'],
        subjects: ['Kiswahili Lugha', 'Social Studies'],
        allocations: [{ className: 'Grade 7 North', subjects: ['Kiswahili Lugha', 'Social Studies'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
      {
        id: 'tch-ngon-04',
        schoolId: 'sch-ngonyek-30200',
        name: 'Brian Onyancha',
        email: 'brian.onyancha@ngonyek.sc.ke',
        phoneNumber: '+254 722 341 004',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        department: 'Sciences & Agriculture',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-512044',
        tscNumber: 'TSC-512044',
        staffNumber: 'NJSS-STF-004',
        avatarHex: '#0284C7',
        isClassTeacher: false,
        classes: ['Grade 7 North'],
        subjects: ['Integrated Science', 'Agriculture'],
        allocations: [{ className: 'Grade 7 North', subjects: ['Integrated Science', 'Agriculture'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
      {
        id: 'tch-ngon-05',
        schoolId: 'sch-ngonyek-30200',
        name: 'Joyce Kamar',
        email: 'joyce.kamar@ngonyek.sc.ke',
        phoneNumber: '+254 722 341 005',
        role: 'TEACHER',
        designation: 'Subject Teacher',
        department: 'Religious Studies & Humanities',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-498115',
        tscNumber: 'TSC-498115',
        staffNumber: 'NJSS-STF-005',
        avatarHex: '#BE185D',
        isClassTeacher: false,
        classes: ['Grade 7 North'],
        subjects: ['CRE', 'Creative Arts & Sports'],
        allocations: [{ className: 'Grade 7 North', subjects: ['CRE', 'Creative Arts & Sports'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
      {
        id: 'tch-ngon-06',
        schoolId: 'sch-ngonyek-30200',
        name: 'Jotham Watila',
        email: 'head@ngonyek.sc.ke',
        phoneNumber: '+254 741 478 813',
        role: 'HEAD_TEACHER',
        designation: 'Head of Institution',
        department: 'Administration & Applied Sciences',
        employmentStatus: 'Permanent & Pensionable',
        employeeNumber: 'TSC-299991',
        tscNumber: 'TSC-299991',
        staffNumber: 'NJSS-STF-006',
        avatarHex: '#1E3A8A',
        isClassTeacher: false,
        classes: ['Grade 7 North'],
        subjects: ['Pretechnical Studies'],
        allocations: [{ className: 'Grade 7 North', subjects: ['Pretechnical Studies'] }],
        active: true,
        accountStatus: 'APPROVED',
      },
    ];

    return {
      tenantId: 'sch-ngonyek-30200',
      students: ngonyekStudents,
      teachers: ngonyekTeachersList,
      assessments: [
        {
          id: 'ass-ngon-cat1',
          schoolId: 'sch-ngonyek-30200',
          name: 'Grade 7 North Mathematics Continuous Assessment Test 1',
          className: 'Grade 7 North',
          subject: 'Mathematics',
          totalMarks: 30,
          term: 'Term 1',
          date: '2026-03-24',
        },
      ],
      grades: [],
      timetables: [],
      classes: ['Grade 7 North'],
      academicStreams: [
        {
          id: 'strm-ngon-7-north',
          schoolId: 'sch-ngonyek-30200',
          streamName: 'North',
          gradeName: 'Grade 7',
          fullClassName: 'Grade 7 North',
          capacity: 45,
          currentEnrollment: 40,
          classTeacherId: 'tch-ngon-01',
          classTeacherName: 'Vivian Lumayo',
          assignedRoom: 'Junior Secondary Room 7N',
          academicYear: 2026,
          isActive: true,
        },
      ],
      attendanceRegisters: [
        {
          id: 'att-ngon-001',
          schoolId: 'sch-ngonyek-30200',
          className: 'Grade 7 North',
          grade: 'Grade 7',
          stream: 'North',
          date: '2026-03-20',
          academicYear: 2026,
          term: 'Term 1',
          isLocked: false,
          entries: ngonyekStudents.map((s) => ({
            studentId: s.id,
            admNo: s.admNo,
            studentName: s.name,
            gender: s.gender,
            status: 'Present',
            recordedBy: 'Vivian Lumayo',
            recordedAt: '2026-03-20T08:00:00Z',
          })),
        },
      ],
      behaviorRecords: [],
      disciplineIncidents: [],
      healthIncidents: [],
      healthProfiles: {},
      counselingSessions: [],
      vulnerableLearners: [],
      welfareCheckIns: [],
      transfersOut: [],
      transfersIn: [],
      graduations: [],
      parentCommunications: [],
      academicSubjects: [],
      academicYears: [],
      terms: [],
      teacherSubjectAllocations: [],
      classTeacherAllocations: [
        {
          id: 'cta-ngon-7-north',
          streamId: 'strm-ngon-7-north',
          fullClassName: 'Grade 7 North',
          primaryClassTeacherId: 'tch-ngon-01',
          primaryClassTeacherName: 'Vivian Lumayo',
          assistantClassTeacherId: 'tch-ngon-02',
          assistantClassTeacherName: 'Agness Waswa',
          academicYear: 2026,
          termNumber: 1,
          responsibilities: [
            'Daily morning attendance roll call sign-off',
            'Termly student progress card holistic remarks',
            'Parent-teacher consultation coordination',
            'Discipline & pastoral care tracking',
            'Learner welfare and counseling liaison',
          ],
          appointedBy: 'Jotham Watila (Head of Institution)',
          appointmentDate: '2026-01-08',
          status: 'ACTIVE',
        },
      ],
      schoolInfo: {
        name: 'Ngonyek Junior School',
        motto: 'Excellence in Competency & Integrity',
        address: 'P.O. Box 78, Ngonyek',
        email: 'admin@ngonyek.sc.ke',
        phone: '+254 741 478 813',
        code: 'NGONYEK-30200',
        headTeacher: 'Jotham Watila',
        headOfInstitution: 'Jotham Watila',
        totalStudents: 40,
        totalClasses: 1,
        totalAssessments: 1,
      },
      schoolProfile: {
        schoolName: 'Ngonyek Junior School',
        motto: 'Excellence in Competency & Integrity',
        email: 'admin@ngonyek.sc.ke',
        phone: '+254 741 478 813',
      },
      settings: {},
      auditLogs: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  public getTenantData(tenantId: string): ServerTenantDataBundle {
    if (!this.tenantData.has(tenantId)) {
      if (tenantId === 'sch-ngonyek-30200') {
        const bundle = this.buildNgonyekBundle();
        this.tenantData.set(tenantId, bundle);
        this.saveToDisk();
        return bundle;
      }

      const tenant = this.tenants.get(tenantId);
      const freshBundle: ServerTenantDataBundle = {
        tenantId,
        students: [],
        teachers: [],
        assessments: [],
        grades: [],
        timetables: [],
        classes: [],
        attendanceRegisters: [],
        behaviorRecords: [],
        disciplineIncidents: [],
        healthIncidents: [],
        healthProfiles: {},
        counselingSessions: [],
        vulnerableLearners: [],
        welfareCheckIns: [],
        transfersOut: [],
        transfersIn: [],
        graduations: [],
        parentCommunications: [],
        academicStreams: [],
        academicSubjects: [],
        academicYears: [],
        terms: [],
        teacherSubjectAllocations: [],
        classTeacherAllocations: [],
        schoolInfo: tenant ? {
          name: tenant.schoolName,
          motto: tenant.motto || tenant.schoolBranding?.motto || 'Strive for Excellence',
          address: tenant.address || tenant.physicalAddress || '',
          email: tenant.email || tenant.officialEmail || '',
          phone: tenant.phone || tenant.officialPhone || '',
          code: tenant.schoolCode,
        } : undefined,
        schoolProfile: tenant ? {
          schoolName: tenant.schoolName,
          motto: tenant.motto || tenant.schoolBranding?.motto,
          logoUrl: tenant.logoUrl || tenant.schoolBranding?.logoUrl,
          stampUrl: tenant.stampUrl || tenant.schoolBranding?.stampUrl,
        } : undefined,
        settings: {},
        auditLogs: [],
        lastUpdated: new Date().toISOString(),
      };
      this.tenantData.set(tenantId, freshBundle);
      this.saveToDisk();
    }

    const bundle = this.tenantData.get(tenantId)!;

    // Self-healing guarantee for Ngonyek Junior School: ensure all 40 learners and 6 registered teachers are always intact
    if (tenantId === 'sch-ngonyek-30200') {
      let repaired = false;
      const defaultBundle = this.buildNgonyekBundle();
      if (
        !bundle.students ||
        bundle.students.length < 40 ||
        bundle.students.some((s: any) => (s.classTeacherName || '').includes('Kiprop') || (s.headOfSchoolName || '').includes('Kiprono'))
      ) {
        bundle.students = defaultBundle.students;
        repaired = true;
      }
      const hasLumayo = Array.isArray(bundle.teachers) && bundle.teachers.some((t: any) => (t.name || '').includes('Lumayo'));
      const hasOldMockTeachers = Array.isArray(bundle.teachers) && bundle.teachers.some(
        (t: any) => (t.name || '').includes('Kiprono') || (t.name || '').includes('Kiprop Cherono') || (t.name || '').includes('Muthoni Waweru')
      );
      if (!bundle.teachers || bundle.teachers.length < 6 || !hasLumayo || hasOldMockTeachers) {
        bundle.teachers = defaultBundle.teachers;
        repaired = true;
      }
      if (!bundle.classes || bundle.classes.length === 0) {
        bundle.classes = ['Grade 7 North'];
        repaired = true;
      }
      if (
        !bundle.academicStreams ||
        bundle.academicStreams.length === 0 ||
        bundle.academicStreams.some((s: any) => (s.classTeacherName || '').includes('Kiprop') || (s.classTeacherName || '').includes('Kiprono'))
      ) {
        bundle.academicStreams = defaultBundle.academicStreams;
        repaired = true;
      }
      if (
        !bundle.classTeacherAllocations ||
        bundle.classTeacherAllocations.length === 0 ||
        bundle.classTeacherAllocations.some((c: any) => (c.primaryClassTeacherName || '').includes('Kiprop') || (c.appointedBy || '').includes('Kiprono'))
      ) {
        bundle.classTeacherAllocations = defaultBundle.classTeacherAllocations;
        repaired = true;
      }
      if (
        !bundle.attendanceRegisters ||
        bundle.attendanceRegisters.length === 0 ||
        bundle.attendanceRegisters.some((r: any) => (r.recordedBy || '').includes('Peter') || (r.recordedBy || '').includes('Cherono'))
      ) {
        bundle.attendanceRegisters = defaultBundle.attendanceRegisters;
        repaired = true;
      }
      if (bundle.schoolInfo && (bundle.schoolInfo.headTeacher?.includes('Kiprono') || bundle.schoolInfo.headOfInstitution?.includes('Kiprono'))) {
        bundle.schoolInfo.headTeacher = 'Jotham Watila';
        bundle.schoolInfo.headOfInstitution = 'Jotham Watila';
        repaired = true;
      }
      if (repaired) {
        this.tenantData.set(tenantId, bundle);
        this.saveToDisk();
      }
    }

    return bundle;
  }

  public saveTenantData(tenantId: string, partialData: Partial<ServerTenantDataBundle>): ServerTenantDataBundle {
    const current = this.getTenantData(tenantId);

    // Safeguard Ngonyek: Prevent stale clients from replacing the 40 registered Grade 7 North learners with old test records
    if (tenantId === 'sch-ngonyek-30200' && partialData.students && partialData.students.length < 40) {
      const currentIds = new Set((current.students || []).map((s: any) => s.id));
      const newAdditions = partialData.students.filter(
        (s: any) => !currentIds.has(s.id) && s.id !== 'std-ngon-001' && s.id !== 'std-ngon-002'
      );
      partialData.students = [...(current.students || []), ...newAdditions];
    }

    // Safeguard Ngonyek: Prevent teachers list from collapsing below 6 and filter out old mock names
    if (tenantId === 'sch-ngonyek-30200' && partialData.teachers) {
      partialData.teachers = partialData.teachers.filter(
        (t: any) =>
          !t.name?.includes('Kiprono') &&
          !t.name?.includes('Kiprop Cherono') &&
          !t.name?.includes('Muthoni Waweru') &&
          !t.name?.includes('Ochieng Otieno') &&
          !t.name?.includes('Wambui Kamau')
      );
      if (partialData.teachers.length < 6) {
        const currentTeacherNames = new Set(partialData.teachers.map((t: any) => t.name?.toLowerCase()));
        const defaultTeachers = this.buildNgonyekBundle().teachers;
        const missing = defaultTeachers.filter((t: any) => !currentTeacherNames.has(t.name?.toLowerCase()));
        partialData.teachers = [...partialData.teachers, ...missing];
      }
    }

    const updated: ServerTenantDataBundle = {
      ...current,
      ...partialData,
      tenantId, // Prevent overwrite
      lastUpdated: new Date().toISOString(),
    };
    this.tenantData.set(tenantId, updated);
    this.saveToDisk();
    return updated;
  }

  // Dedicated atomic helpers for portal actions
  public saveStudent(tenantId: string, student: any): { student: any; allStudents: any[] } {
    const bundle = this.getTenantData(tenantId);
    const students = Array.isArray(bundle.students) ? [...bundle.students] : [];
    const idx = students.findIndex((s) => s.id === student.id || (s.admNo && s.admNo === student.admNo));
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...student, schoolId: tenantId };
    } else {
      students.unshift({ ...student, schoolId: tenantId });
    }
    this.saveTenantData(tenantId, { students });
    return { student: idx >= 0 ? students[idx] : students[0], allStudents: students };
  }

  public deleteStudent(tenantId: string, studentId: string): { success: boolean; allStudents: any[] } {
    const bundle = this.getTenantData(tenantId);
    const students = (bundle.students || []).filter((s) => s.id !== studentId);
    this.saveTenantData(tenantId, { students });
    return { success: true, allStudents: students };
  }

  public saveAssessmentMarks(tenantId: string, assessment: any, updatedStudents?: any[]): { assessment: any; students: any[] } {
    const bundle = this.getTenantData(tenantId);
    const assessments = Array.isArray(bundle.assessments) ? [...bundle.assessments] : [];
    const idx = assessments.findIndex((a) => a.id === assessment.id);
    const safeAssessment = { ...assessment, schoolId: tenantId };
    if (idx >= 0) {
      assessments[idx] = safeAssessment;
    } else {
      assessments.unshift(safeAssessment);
    }

    let finalStudents = bundle.students || [];
    if (Array.isArray(updatedStudents) && updatedStudents.length > 0) {
      finalStudents = updatedStudents.map((s) => ({ ...s, schoolId: s.schoolId || tenantId }));
    }

    this.saveTenantData(tenantId, {
      assessments,
      students: finalStudents,
    });
    return { assessment: safeAssessment, students: finalStudents };
  }

  public saveAttendanceRegister(tenantId: string, register: any): any[] {
    const bundle = this.getTenantData(tenantId);
    const registers = Array.isArray(bundle.attendanceRegisters) ? [...bundle.attendanceRegisters] : [];
    const safeRegister = { ...register, schoolId: tenantId };
    const idx = registers.findIndex((r) => r.id === register.id);
    if (idx >= 0) {
      registers[idx] = safeRegister;
    } else {
      registers.unshift(safeRegister);
    }
    this.saveTenantData(tenantId, { attendanceRegisters: registers });
    return registers;
  }

  public saveTeacher(tenantId: string, teacher: any): { teacher: any; teachers: any[] } {
    const bundle = this.getTenantData(tenantId);
    const teachers = Array.isArray(bundle.teachers) ? [...bundle.teachers] : [];
    const safeTeacher = { ...teacher, schoolId: tenantId };
    const idx = teachers.findIndex((t) => t.id === teacher.id || (t.email && t.email === teacher.email));
    if (idx >= 0) {
      teachers[idx] = { ...teachers[idx], ...safeTeacher };
    } else {
      teachers.unshift(safeTeacher);
    }
    this.saveTenantData(tenantId, { teachers });
    return { teacher: idx >= 0 ? teachers[idx] : teachers[0], teachers };
  }
}

export const multiTenantStorageService = MultiTenantStorageService.getInstance();
