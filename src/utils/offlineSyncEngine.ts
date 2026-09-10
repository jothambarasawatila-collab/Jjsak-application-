import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export interface OfflineDraftRecord {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: 'ASSESSMENT_MARKS' | 'ATTENDANCE_REGISTER' | 'WELFARE_NOTE';
  entityId: string;
  title: string;
  payload: any;
  timestamp: number;
  synced: boolean;
  syncAttempts: number;
  checksum: string;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  isSyncing: boolean;
}

// Generate simple hash for draft integrity validation
function computeChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `chk-${Math.abs(hash).toString(16)}`;
}

const STORAGE_PREFIX = 'jjsak_offline_queue_';

export function getTenantOfflineQueueKey(tenantId: string): string {
  return `${STORAGE_PREFIX}${tenantId}`;
}

export function getOfflineDrafts(tenantId: string): OfflineDraftRecord[] {
  if (typeof window === 'undefined' || !tenantId) return [];
  try {
    const raw = localStorage.getItem(getTenantOfflineQueueKey(tenantId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to retrieve offline drafts:', err);
    return [];
  }
}

export function saveOfflineDraft(params: {
  tenantId: string;
  user: User;
  category: OfflineDraftRecord['category'];
  entityId: string;
  title: string;
  payload: any;
}): { success: boolean; record?: OfflineDraftRecord; error?: string } {
  const { tenantId, user, category, entityId, title, payload } = params;

  // Strict Tenant Binding & Role Permission Check
  if (!tenantId || tenantId !== user.schoolId) {
    return {
      success: false,
      error: 'Security Violation: Cannot cache offline draft outside assigned school tenant boundary.',
    };
  }

  // Permission validation for offline drafting
  const allowedRoles: UserRole[] = [
    'TEACHER',
    'HEAD',
    'DEPUTY',
    'DIRECTOR_ACADEMICS',
    'ADMIN',
    'SUPER_ADMIN',
    'SYSTEM_ADMIN',
  ];
  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      error: `Security Violation: Role ${user.role} is not authorized for offline marks/attendance entry.`,
    };
  }

  const existing = getOfflineDrafts(tenantId);
  const newRecord: OfflineDraftRecord = {
    id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tenantId,
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    category,
    entityId,
    title,
    payload,
    timestamp: Date.now(),
    synced: false,
    syncAttempts: 0,
    checksum: computeChecksum(payload),
  };

  try {
    const updated = [newRecord, ...existing.filter((d) => !(d.category === category && d.entityId === entityId))];
    localStorage.setItem(getTenantOfflineQueueKey(tenantId), JSON.stringify(updated));
    return { success: true, record: newRecord };
  } catch (err) {
    return { success: false, error: 'Local storage quota exceeded or unavailable.' };
  }
}

export function clearSyncedDrafts(tenantId: string) {
  if (typeof window === 'undefined' || !tenantId) return;
  try {
    const existing = getOfflineDrafts(tenantId);
    const unSynced = existing.filter((d) => !d.synced);
    localStorage.setItem(getTenantOfflineQueueKey(tenantId), JSON.stringify(unSynced));
  } catch (err) {
    console.error('Failed to clear synced drafts:', err);
  }
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
