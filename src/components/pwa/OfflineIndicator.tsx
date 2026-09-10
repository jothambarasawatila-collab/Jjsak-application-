import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus, getOfflineDrafts } from '../../utils/offlineSyncEngine';

interface OfflineIndicatorProps {
  tenantName?: string;
  tenantId?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ tenantName, tenantId }) => {
  const isOnline = useOnlineStatus();
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const pendingCount = tenantId ? getOfflineDrafts(tenantId).filter((d) => !d.synced).length : 0;

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnectedBanner(false);
    } else if (wasOffline) {
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnectedBanner) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 select-none">
      {!isOnline ? (
        <div className="px-3.5 py-1.5 rounded-full bg-amber-950/95 text-amber-200 border border-amber-600 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span>Offline Mode</span>
          <span className="text-amber-400/80 hidden sm:inline">•</span>
          <span className="text-[11px] text-amber-300/90 hidden sm:inline truncate max-w-[200px]">
            {tenantName ? `${tenantName} local draft cache active` : 'Local draft cache active'}
          </span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {pendingCount} unsynced
            </span>
          )}
        </div>
      ) : (
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/95 text-emerald-200 border border-emerald-600 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Online Connection Restored</span>
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin shrink-0" />
          <span className="text-[11px] text-emerald-300/90 hidden sm:inline">Synchronizing with authoritative JJSAK backend</span>
        </div>
      )}
    </div>
  );
};
