import { SchoolTenant, User } from '../types';

export interface TenantDataBundle {
  tenantId: string;
  students: any[];
  teachers: any[];
  assessments: any[];
  grades: any[];
  timetables: any[];
  classes: any[];
  settings: Record<string, any>;
  auditLogs: any[];
  lastUpdated?: string;
}

class TenantDataSyncService {
  private static instance: TenantDataSyncService;

  private constructor() {}

  public static getInstance(): TenantDataSyncService {
    if (!TenantDataSyncService.instance) {
      TenantDataSyncService.instance = new TenantDataSyncService();
    }
    return TenantDataSyncService.instance;
  }

  // ===================== TENANTS =====================
  public async fetchTenants(): Promise<SchoolTenant[]> {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.tenants)) {
          return json.tenants;
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Failed to fetch tenants from server, falling back to local storage', err);
    }
    const local = localStorage.getItem('jjsak_tenants');
    return local ? JSON.parse(local) : [];
  }

  public async saveTenant(tenant: SchoolTenant): Promise<SchoolTenant> {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.tenant) {
          return json.tenant;
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Server save failed for tenant, saved locally', err);
    }
    return tenant;
  }

  public async updateTenantStatus(schoolId: string, status: string): Promise<void> {
    try {
      await fetch(`/api/tenants/${schoolId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('[TenantDataSync] Server status update failed', err);
    }
  }

  // ===================== USERS =====================
  public async fetchUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          return json.users;
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Failed to fetch users from server', err);
    }
    const local = localStorage.getItem('jjsak_users');
    return local ? JSON.parse(local) : [];
  }

  public async saveUser(user: User): Promise<User> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          return json.user;
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Server save failed for user', err);
    }
    return user;
  }

  public async onboardPersonnel(data: {
    schoolId: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    nationalId?: string;
    tscNumber?: string;
    designation?: string;
  }): Promise<{ success: boolean; user?: User; otpSession?: any; message?: string }> {
    try {
      const res = await fetch('/api/users/onboard-personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  // ===================== TENANT ISOLATED DATA =====================
  public async fetchTenantData(tenantId: string): Promise<TenantDataBundle | null> {
    if (!tenantId) return null;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/data`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`[TenantDataSync] Failed to fetch data for tenant ${tenantId}`, err);
    }
    return null;
  }

  public async saveTenantData(tenantId: string, partialBundle: Partial<TenantDataBundle>): Promise<void> {
    if (!tenantId) return;
    try {
      await fetch(`/api/tenants/${tenantId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialBundle),
      });
    } catch (err) {
      console.warn(`[TenantDataSync] Failed to persist data for tenant ${tenantId}`, err);
    }
  }

  // ===================== AI ASSESSMENT GENERATION =====================
  public async generateAiAssessments(params: {
    schoolName: string;
    grade: string;
    term: string;
    year?: number;
    assessmentType: string;
    subjects?: string[];
    questionsPerSubject?: number;
    targetMarksPerSubject?: number;
  }): Promise<{ success: boolean; papers: any[]; provider: string }> {
    const res = await fetch('/api/ai/generate-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Assessment generation error: ${res.statusText}`);
    }
    return await res.json();
  }
}

export const tenantDataSyncService = TenantDataSyncService.getInstance();
