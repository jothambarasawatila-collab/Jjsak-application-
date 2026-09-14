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
    this.ensureDefaultOwner();
  }

  public static getInstance(): MultiTenantStorageService {
    if (!MultiTenantStorageService.instance) {
      MultiTenantStorageService.instance = new MultiTenantStorageService();
    }
    return MultiTenantStorageService.instance;
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

        if (Array.isArray(data.tenants)) {
          data.tenants.forEach((t: ServerSchoolTenant) => {
            if (t && t.schoolId) this.tenants.set(t.schoolId, t);
          });
        }

        if (Array.isArray(data.users)) {
          data.users.forEach((u: ServerUserData) => {
            if (u && u.id) this.users.set(u.id, u);
          });
        }

        if (data.tenantData && typeof data.tenantData === 'object') {
          Object.keys(data.tenantData).forEach((tenantId) => {
            this.tenantData.set(tenantId, data.tenantData[tenantId]);
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
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[MultiTenantStorage] Error saving storage to disk:', err);
    }
  }

  // ===================== TENANTS =====================
  public getAllTenants(): ServerSchoolTenant[] {
    return Array.from(this.tenants.values());
  }

  public getTenant(schoolId: string): ServerSchoolTenant | null {
    return this.tenants.get(schoolId) || null;
  }

  public saveTenant(tenant: ServerSchoolTenant): ServerSchoolTenant {
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
    const existing = this.tenants.get(schoolId);
    if (!existing) return false;
    existing.status = status;
    this.tenants.set(schoolId, existing);
    this.saveToDisk();
    return true;
  }

  public deleteTenant(schoolId: string): boolean {
    const deleted = this.tenants.delete(schoolId);
    this.tenantData.delete(schoolId);
    // Remove users of this tenant
    for (const [userId, user] of this.users.entries()) {
      if (user.schoolId === schoolId) {
        this.users.delete(userId);
      }
    }
    this.saveToDisk();
    return deleted;
  }

  // ===================== USERS =====================
  public getAllUsers(): ServerUserData[] {
    return Array.from(this.users.values());
  }

  public getUser(userId: string): ServerUserData | null {
    return this.users.get(userId) || null;
  }

  public findUserByIdentifier(identifier: string): ServerUserData | null {
    const norm = (identifier || '').trim().toLowerCase();
    const cleanDigits = norm.replace(/\D/g, '');

    for (const user of this.users.values()) {
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
