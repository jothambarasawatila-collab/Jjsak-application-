import { SchoolTenant, User } from '../types';

export interface TenantDataBundle {
  tenantId: string;
  students?: any[];
  teachers?: any[];
  assessments?: any[];
  grades?: any[];
  timetables?: any[];
  classes?: any[];
  attendanceRegisters?: any[];
  behaviorRecords?: any[];
  disciplineIncidents?: any[];
  healthIncidents?: any[];
  healthProfiles?: Record<string, any>;
  counselingSessions?: any[];
  vulnerableLearners?: any[];
  welfareCheckIns?: any[];
  transfersOut?: any[];
  transfersIn?: any[];
  graduations?: any[];
  parentCommunications?: any[];
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
  settings?: Record<string, any>;
  auditLogs?: any[];
  lastUpdated?: string;
}

const SYNC_CHANNEL_NAME = 'jjsak_tenant_sync_channel';
const DELETED_TENANTS_STORAGE_KEY = 'jjsak_deleted_tenant_ids';

class TenantDataSyncService {
  private static instance: TenantDataSyncService;
  private syncChannel: BroadcastChannel | null = null;
  private deleteListeners: Set<(schoolId: string) => void> = new Set();
  private savedListeners: Set<(tenant: SchoolTenant) => void> = new Set();
  private dataListeners: Set<(tenantId: string, bundle: TenantDataBundle) => void> = new Set();
  private saveDebounceTimers: Map<string, any> = new Map();
  private pendingBundles: Map<string, Partial<TenantDataBundle>> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
          this.syncChannel.onmessage = (event) => {
            if (event.data) {
              if (event.data.type === 'TENANT_DELETED' && event.data.schoolId) {
                this.handleIncomingTenantDeletion(event.data.schoolId, false);
              } else if (event.data.type === 'TENANT_SAVED' && event.data.tenant) {
                this.handleIncomingTenantSaved(event.data.tenant, false);
              } else if (event.data.type === 'TENANT_DATA_SAVED' && event.data.tenantId) {
                this.handleIncomingDataUpdated(event.data.tenantId, event.data.data, false);
              }
            }
          };
        } catch (e) {
          console.warn('[TenantDataSync] BroadcastChannel not supported in current environment', e);
        }
      }

      // Cross-tab storage event synchronization
      window.addEventListener('storage', (event) => {
        if (event.key === DELETED_TENANTS_STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (Array.isArray(parsed)) {
              parsed.forEach((id) => this.handleIncomingTenantDeletion(id, false));
            }
          } catch {}
        } else if (event.key === 'jjsak_tenants' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (Array.isArray(parsed)) {
              window.dispatchEvent(new CustomEvent('jjsak:tenants_synced', { detail: { tenants: parsed } }));
            }
          } catch {}
        } else if (event.key && event.key.startsWith('jjsak_tenant_data_') && event.newValue) {
          try {
            const tenantId = event.key.replace('jjsak_tenant_data_', '');
            const parsed = JSON.parse(event.newValue);
            this.handleIncomingDataUpdated(tenantId, parsed, false);
          } catch {}
        }
      });
    }
  }

  public static getInstance(): TenantDataSyncService {
    if (!TenantDataSyncService.instance) {
      TenantDataSyncService.instance = new TenantDataSyncService();
    }
    return TenantDataSyncService.instance;
  }

  public getDeletedTenantIds(): string[] {
    try {
      const stored = localStorage.getItem(DELETED_TENANTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  public isTenantDeleted(schoolId: string): boolean {
    if (!schoolId) return false;
    return this.getDeletedTenantIds().includes(schoolId);
  }

  public recordDeletedTenant(schoolId: string): void {
    if (!schoolId) return;
    try {
      const current = this.getDeletedTenantIds();
      if (!current.includes(schoolId)) {
        const updated = [...current, schoolId];
        localStorage.setItem(DELETED_TENANTS_STORAGE_KEY, JSON.stringify(updated));
      }

      // Purge from local jjsak_tenants
      const savedTenants = localStorage.getItem('jjsak_tenants');
      if (savedTenants) {
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((t: any) => t.schoolId !== schoolId);
          localStorage.setItem('jjsak_tenants', JSON.stringify(cleaned));
        }
      }

      // Purge from local jjsak_users
      const savedUsers = localStorage.getItem('jjsak_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((u: any) => u.schoolId !== schoolId);
          localStorage.setItem('jjsak_users', JSON.stringify(cleaned));
        }
      }

      // Purge school data from local storage collections
      ['jjsak_students', 'jjsak_teachers', 'jjsak_assessments', 'jjsak_timetables', 'jjsak_attendance_registers'].forEach((key) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const items = JSON.parse(stored);
            if (Array.isArray(items)) {
              const remaining = items.filter((item: any) => item.schoolId !== schoolId);
              localStorage.setItem(key, JSON.stringify(remaining));
            }
          } catch {}
        }
      });

      // Reset active tenant if it was deleted
      const activeTenant = localStorage.getItem('jjsak_active_tenant_id');
      if (activeTenant === schoolId) {
        localStorage.removeItem('jjsak_active_tenant_id');
      }
    } catch (e) {
      console.warn('[TenantDataSync] Failed to record deleted tenant locally', e);
    }

    this.handleIncomingTenantDeletion(schoolId, true);
  }

  private handleIncomingTenantDeletion(schoolId: string, broadcast = false) {
    if (broadcast && this.syncChannel) {
      try {
        this.syncChannel.postMessage({
          type: 'TENANT_DELETED',
          schoolId,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('[TenantDataSync] Failed to post to BroadcastChannel', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jjsak:tenant_deleted', {
          detail: { schoolId },
        })
      );
    }

    this.deleteListeners.forEach((listener) => {
      try {
        listener(schoolId);
      } catch (e) {
        console.warn('[TenantDataSync] Listener error on tenant deletion', e);
      }
    });
  }

  private handleIncomingTenantSaved(tenant: SchoolTenant, broadcast = false) {
    if (broadcast && this.syncChannel) {
      try {
        this.syncChannel.postMessage({
          type: 'TENANT_SAVED',
          tenant,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('[TenantDataSync] Failed to post to BroadcastChannel', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jjsak:tenant_saved', {
          detail: { tenant },
        })
      );
    }

    this.savedListeners.forEach((listener) => {
      try {
        listener(tenant);
      } catch (e) {
        console.warn('[TenantDataSync] Listener error on tenant saved', e);
      }
    });
  }

  private handleIncomingDataUpdated(tenantId: string, data: TenantDataBundle, broadcast = false) {
    if (broadcast && this.syncChannel) {
      try {
        this.syncChannel.postMessage({
          type: 'TENANT_DATA_SAVED',
          tenantId,
          data,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('[TenantDataSync] Failed to post to BroadcastChannel', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jjsak:tenant_data_saved', {
          detail: { tenantId, data },
        })
      );
    }

    this.dataListeners.forEach((listener) => {
      try {
        listener(tenantId, data);
      } catch (e) {
        console.warn('[TenantDataSync] Listener error on tenant data updated', e);
      }
    });
  }

  public onTenantDataUpdated(callback: (tenantId: string, data: TenantDataBundle) => void): () => void {
    this.dataListeners.add(callback);
    return () => {
      this.dataListeners.delete(callback);
    };
  }

  public onTenantDeleted(callback: (schoolId: string) => void): () => void {
    this.deleteListeners.add(callback);
    return () => {
      this.deleteListeners.delete(callback);
    };
  }

  public onTenantSaved(callback: (tenant: SchoolTenant) => void): () => void {
    this.savedListeners.add(callback);
    return () => {
      this.savedListeners.delete(callback);
    };
  }

  // ===================== TENANTS =====================
  public async fetchTenantsFull(): Promise<{ tenants: SchoolTenant[]; deletedTenantIds: string[] }> {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.tenants)) {
          const serverDeleted: string[] = Array.isArray(json.deletedTenantIds) ? json.deletedTenantIds : [];
          
          // Merge server-deleted IDs with local storage deleted IDs
          const localDeleted = this.getDeletedTenantIds();
          const allDeleted = Array.from(new Set([...serverDeleted, ...localDeleted]));
          try {
            localStorage.setItem(DELETED_TENANTS_STORAGE_KEY, JSON.stringify(allDeleted));
          } catch {}

          // Filter out any school that has been deleted
          const validTenants = json.tenants.filter(
            (t: SchoolTenant) => t && t.schoolId && !allDeleted.includes(t.schoolId)
          );

          // Update local tenants storage
          try {
            localStorage.setItem('jjsak_tenants', JSON.stringify(validTenants));
          } catch {}

          return { tenants: validTenants, deletedTenantIds: allDeleted };
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Failed to fetch tenants from server, falling back to local storage', err);
    }

    const deletedIds = this.getDeletedTenantIds();
    const local = localStorage.getItem('jjsak_tenants');
    let localTenants: SchoolTenant[] = [];
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          localTenants = parsed.filter((t: SchoolTenant) => t && t.schoolId && !deletedIds.includes(t.schoolId));
        }
      } catch {}
    }
    return { tenants: localTenants, deletedTenantIds: deletedIds };
  }

  public async fetchTenants(): Promise<SchoolTenant[]> {
    const data = await this.fetchTenantsFull();
    return data.tenants;
  }

  public async saveTenant(tenant: SchoolTenant): Promise<SchoolTenant> {
    let savedTenant = tenant;
    try {
      // If re-registering, remove from local deleted list
      const deleted = this.getDeletedTenantIds().filter((id) => id !== tenant.schoolId);
      try {
        localStorage.setItem(DELETED_TENANTS_STORAGE_KEY, JSON.stringify(deleted));
      } catch {}

      // Update local storage
      const savedTenants = localStorage.getItem('jjsak_tenants');
      let currentList: SchoolTenant[] = [];
      if (savedTenants) {
        try {
          const parsed = JSON.parse(savedTenants);
          if (Array.isArray(parsed)) currentList = parsed;
        } catch {}
      }
      const existingIdx = currentList.findIndex((t) => t.schoolId === tenant.schoolId);
      if (existingIdx >= 0) {
        currentList[existingIdx] = tenant;
      } else {
        currentList = [tenant, ...currentList];
      }
      try {
        localStorage.setItem('jjsak_tenants', JSON.stringify(currentList));
      } catch {}

      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.tenant) {
          savedTenant = json.tenant;
        }
      }
    } catch (err) {
      console.warn('[TenantDataSync] Server save failed for tenant, saved locally', err);
    }

    this.handleIncomingTenantSaved(savedTenant, true);
    return savedTenant;
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

  public async deleteTenant(schoolId: string): Promise<boolean> {
    // Record locally and broadcast immediately so all tabs update without delay
    this.recordDeletedTenant(schoolId);

    try {
      const res = await fetch(`/api/tenants/${schoolId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.deletedTenantIds && Array.isArray(json.deletedTenantIds)) {
          const current = this.getDeletedTenantIds();
          const merged = Array.from(new Set([...current, ...json.deletedTenantIds]));
          try {
            localStorage.setItem(DELETED_TENANTS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
        return !!json.success;
      }
    } catch (err) {
      console.warn('[TenantDataSync] Server delete tenant failed', err);
    }
    return true;
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
  public getCachedTenantData(tenantId: string): TenantDataBundle | null {
    if (!tenantId) return null;
    try {
      const cached = localStorage.getItem(`jjsak_tenant_data_${tenantId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // If Ngonyek has incomplete cached data (e.g. fewer than 40 learners) or old placeholder teachers, invalidate stale cache
        if (tenantId === 'sch-ngonyek-30200') {
          if (Array.isArray(parsed.students) && parsed.students.length < 40) {
            return null;
          }
          if (
            Array.isArray(parsed.teachers) &&
            parsed.teachers.some(
              (t: any) =>
                (t.name || '').includes('Kiprono') ||
                (t.name || '').includes('Kiprop Cherono') ||
                (t.name || '').includes('Muthoni Waweru')
            )
          ) {
            return null;
          }
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public async fetchTenantData(tenantId: string): Promise<TenantDataBundle | null> {
    if (!tenantId) return null;
    const localCached = this.getCachedTenantData(tenantId);

    try {
      const res = await fetch(`/api/tenants/${tenantId}/data`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverBundle: TenantDataBundle = json.data;
          try {
            localStorage.setItem(`jjsak_tenant_data_${tenantId}`, JSON.stringify(serverBundle));
          } catch {}
          this.handleIncomingDataUpdated(tenantId, serverBundle, false);
          return serverBundle;
        }
      }
    } catch (err) {
      console.warn(`[TenantDataSync] Server fetch failed for tenant ${tenantId}, using local cache`, err);
    }
    return localCached;
  }

  public async saveTenantData(tenantId: string, partialBundle: Partial<TenantDataBundle>): Promise<TenantDataBundle | null> {
    if (!tenantId) return null;

    // 1. Immediately update local scoped cache
    const current = this.getCachedTenantData(tenantId) || { tenantId };

    // Prevent overwriting 40 Grade 7 North students if stale array sent
    if (tenantId === 'sch-ngonyek-30200' && partialBundle.students && partialBundle.students.length < 40) {
      const currentStudents = (current as any).students || [];
      if (currentStudents.length >= 40) {
        const currentIds = new Set(currentStudents.map((s: any) => s.id));
        const newAdditions = partialBundle.students.filter(
          (s: any) => !currentIds.has(s.id) && s.id !== 'std-ngon-001' && s.id !== 'std-ngon-002'
        );
        partialBundle.students = [...currentStudents, ...newAdditions];
      }
    }
    const merged: TenantDataBundle = {
      ...current,
      ...partialBundle,
      tenantId,
      lastUpdated: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`jjsak_tenant_data_${tenantId}`, JSON.stringify(merged));
    } catch (e) {
      console.warn('[TenantDataSync] Failed to write to local storage cache', e);
    }

    // 2. Broadcast immediately so other views update
    this.handleIncomingDataUpdated(tenantId, merged, true);

    // 3. Persist to authoritative backend database
    try {
      const res = await fetch(`/api/tenants/${tenantId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialBundle),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(`jjsak_tenant_data_${tenantId}`, JSON.stringify(json.data));
          } catch {}
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`[TenantDataSync] Failed to persist data to server for tenant ${tenantId}`, err);
    }
    return merged;
  }

  public debouncedSaveTenantData(
    tenantId: string,
    partialBundle: Partial<TenantDataBundle>,
    delayMs = 600
  ): void {
    if (!tenantId) return;

    // Merge into pending
    const existingPending = this.pendingBundles.get(tenantId) || {};
    this.pendingBundles.set(tenantId, { ...existingPending, ...partialBundle });

    if (this.saveDebounceTimers.has(tenantId)) {
      clearTimeout(this.saveDebounceTimers.get(tenantId));
    }

    const timer = setTimeout(async () => {
      this.saveDebounceTimers.delete(tenantId);
      const toSend = this.pendingBundles.get(tenantId);
      if (toSend) {
        this.pendingBundles.delete(tenantId);
        await this.saveTenantData(tenantId, toSend);
      }
    }, delayMs);

    this.saveDebounceTimers.set(tenantId, timer);
  }

  public async saveStudent(tenantId: string, student: any): Promise<any> {
    if (!tenantId || !student) return null;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (res.ok) {
        const json = await res.json();
        return json.student;
      }
    } catch (err) {
      console.warn('[TenantDataSync] Direct save student error', err);
    }
    return student;
  }

  public async deleteStudent(tenantId: string, studentId: string): Promise<boolean> {
    if (!tenantId || !studentId) return false;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/students/${studentId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[TenantDataSync] Direct delete student error', err);
      return false;
    }
  }

  public async saveAssessmentMarks(
    tenantId: string,
    assessment: any,
    updatedStudents?: any[]
  ): Promise<any> {
    if (!tenantId || !assessment) return null;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment, updatedStudents }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.assessment;
      }
    } catch (err) {
      console.warn('[TenantDataSync] Direct save assessment marks error', err);
    }
    return assessment;
  }

  public async saveAttendanceRegister(tenantId: string, register: any): Promise<any> {
    if (!tenantId || !register) return null;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(register),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[TenantDataSync] Direct save attendance error', err);
    }
    return null;
  }

  public async saveTeacher(tenantId: string, teacher: any): Promise<any> {
    if (!tenantId || !teacher) return null;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
      });
      if (res.ok) {
        const json = await res.json();
        return json.teacher;
      }
    } catch (err) {
      console.warn('[TenantDataSync] Direct save teacher error', err);
    }
    return teacher;
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
