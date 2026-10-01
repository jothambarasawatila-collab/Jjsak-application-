import fs from 'fs';
import path from 'path';

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

    // Ensure initial isolated tenant data for Ngonyek Junior School if not present
    if (!this.deletedTenantIds.has('sch-ngonyek-30200') && !this.tenantData.has('sch-ngonyek-30200')) {
      const ngonyekBundle: ServerTenantDataBundle = {
        tenantId: 'sch-ngonyek-30200',
        students: [
          {
            id: 'std-ngon-001',
            schoolId: 'sch-ngonyek-30200',
            admNo: 'NGON/2026/001',
            name: 'Kevin Kiprotich Cheruiyot',
            grade: 'Grade 8',
            classArm: 'G8 N',
            term: 'Term 1',
            year: 2026,
            avgScore: 82.5,
            overallGrade: 'EE',
            position: '1/38',
            attendance: 98,
            subjects: [
              { subject: 'Integrated Science', score: 86, grade: 'EE', remarks: 'Exceeding Expectations' },
              { subject: 'Mathematics', score: 84, grade: 'EE', remarks: 'Exceeding Expectations' },
              { subject: 'English', score: 79, grade: 'ME', remarks: 'Meeting Expectations' },
              { subject: 'Pretechnical Studies', score: 81, grade: 'EE', remarks: 'Exceeding Expectations' },
            ],
            classTeacherComment: 'Consistently displays exceptional initiative and critical thinking in CBC tasks.',
            classTeacherName: 'Dr. Evans Kiprono',
            headOfSchoolName: 'Dr. Evans Kiprono',
            nextTermDate: '2026-05-04',
          },
          {
            id: 'std-ngon-002',
            schoolId: 'sch-ngonyek-30200',
            admNo: 'NGON/2026/002',
            name: 'Mercy Jebet Koech',
            grade: 'Grade 8',
            classArm: 'G8 S',
            term: 'Term 1',
            year: 2026,
            avgScore: 79.0,
            overallGrade: 'ME',
            position: '2/38',
            attendance: 96,
            subjects: [
              { subject: 'Integrated Science', score: 80, grade: 'ME', remarks: 'Meeting Expectations' },
              { subject: 'Mathematics', score: 78, grade: 'ME', remarks: 'Meeting Expectations' },
              { subject: 'English', score: 82, grade: 'EE', remarks: 'Exceeding Expectations' },
              { subject: 'Pretechnical Studies', score: 76, grade: 'ME', remarks: 'Meeting Expectations' },
            ],
            classTeacherComment: 'Shows great responsibility in group projects and practical science labs.',
            classTeacherName: 'Dr. Evans Kiprono',
            headOfSchoolName: 'Dr. Evans Kiprono',
            nextTermDate: '2026-05-04',
          },
        ],
        teachers: [
          {
            id: 'tch-ngon-01',
            schoolId: 'sch-ngonyek-30200',
            name: 'Dr. Evans Kiprono',
            email: 'head@ngonyek.sc.ke',
            phoneNumber: '+254 722 000 111',
            role: 'HEAD_TEACHER',
            designation: 'Head of Institution & Class Teacher',
            classes: ['G8 N', 'G8 S'],
            subjects: ['Integrated Science', 'Pretechnical Studies'],
            allocations: [
              { className: 'G8 N', subjects: ['Integrated Science', 'Pretechnical Studies'] },
              { className: 'G8 S', subjects: ['Integrated Science'] },
            ],
          },
        ],
        assessments: [
          {
            id: 'ass-ngon-cat1',
            schoolId: 'sch-ngonyek-30200',
            name: 'Integrated Science Continuous Assessment Test 1',
            className: 'G8 N',
            subject: 'Integrated Science',
            totalMarks: 30,
            term: 'Term 1',
            date: '2026-03-14',
          },
        ],
        grades: [],
        timetables: [],
        classes: [],
        attendanceRegisters: [
          {
            id: 'att-ngon-001',
            schoolId: 'sch-ngonyek-30200',
            className: 'G8 N',
            grade: 'Grade 8',
            stream: 'North',
            date: '2026-03-15',
            academicYear: 2026,
            term: 'Term 1',
            isLocked: false,
            entries: [
              {
                studentId: 'std-ngon-001',
                admNo: 'NGON/2026/001',
                studentName: 'Kevin Kiprotich Cheruiyot',
                gender: 'Male',
                status: 'Present',
                recordedBy: 'Dr. Evans Kiprono',
                recordedAt: '2026-03-15T08:00:00Z',
              },
            ],
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
        academicStreams: [],
        academicSubjects: [],
        academicYears: [],
        terms: [],
        teacherSubjectAllocations: [],
        classTeacherAllocations: [],
        schoolInfo: {
          name: 'Ngonyek Junior School',
          motto: 'Excellence in Competency & Integrity',
          address: 'P.O. Box 78, Ngonyek',
          email: 'admin@ngonyek.sc.ke',
          phone: '+254 722 000 111',
          code: 'NGONYEK-30200',
          headTeacher: 'Dr. Evans Kiprono',
          headOfInstitution: 'Dr. Evans Kiprono',
          totalStudents: 2,
          totalClasses: 2,
          totalAssessments: 1,
        },
        schoolProfile: {
          schoolName: 'Ngonyek Junior School',
          motto: 'Excellence in Competency & Integrity',
          email: 'admin@ngonyek.sc.ke',
          phone: '+254 722 000 111',
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

    if (!this.users.has('usr-head-ngonyek-30200')) {
      this.users.set('usr-head-ngonyek-30200', {
        id: 'usr-head-ngonyek-30200',
        fullName: 'Dr. Evans Kiprono',
        username: 'head.ngonyek',
        email: 'head@ngonyek.sc.ke',
        phoneNumber: '+254722000111',
        role: 'HEAD_TEACHER',
        designation: 'Head of Institution',
        schoolId: 'sch-ngonyek-30200',
        active: true,
        mfaEnabled: true,
        firstLoginCompleted: true,
        activationStatus: 'ACTIVE',
      });
      modified = true;
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
  public getTenantData(tenantId: string): ServerTenantDataBundle {
    if (!this.tenantData.has(tenantId)) {
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
    return this.tenantData.get(tenantId)!;
  }

  public saveTenantData(tenantId: string, partialData: Partial<ServerTenantDataBundle>): ServerTenantDataBundle {
    const current = this.getTenantData(tenantId);
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
