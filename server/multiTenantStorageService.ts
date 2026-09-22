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
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
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
        status: 'ACTIVE',
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
        status: 'ACTIVE',
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

    if (modified) {
      this.saveToDisk();
    }
  }

  private ensureDefaultOwner() {
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
      this.saveToDisk();
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.deletedTenantIds)) {
          this.deletedTenantIds = new Set(data.deletedTenantIds);
        }

        if (Array.isArray(data.tenants)) {
          data.tenants.forEach((t: ServerSchoolTenant) => {
            if (t && t.schoolId && !this.deletedTenantIds.has(t.schoolId)) {
              this.tenants.set(t.schoolId, t);
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
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[MultiTenantStorage] Error saving storage to disk:', err);
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
    this.tenants.set(tenant.schoolId, tenant);
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
    return tenant;
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
      const freshBundle: ServerTenantDataBundle = {
        tenantId,
        students: [],
        teachers: [],
        assessments: [],
        grades: [],
        timetables: [],
        classes: [],
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
}

export const multiTenantStorageService = MultiTenantStorageService.getInstance();
