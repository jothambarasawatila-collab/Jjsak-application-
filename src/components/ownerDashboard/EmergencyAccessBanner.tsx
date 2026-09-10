import React, { useEffect, useState } from 'react';
import {
  Flame,
  Clock,
  XCircle,
} from 'lucide-react';
import { EmergencyAccessSession } from '../../types/ownerGovernance';
import { ownerGovernanceService } from '../../services/ownerGovernanceService';

interface EmergencyAccessBannerProps {
  session?: EmergencyAccessSession | null;
  onEndSession: () => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const EmergencyAccessBanner: React.FC<EmergencyAccessBannerProps> = ({
  session,
  onEndSession,
  onLogAudit,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    if (!session || !session.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const exp = new Date(session.expiresAt).getTime();
      const diffMs = exp - now;

      if (diffMs <= 0) {
        setTimeLeftStr('EXPIRED');
        onEndSession();
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        setTimeLeftStr(
          `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, onEndSession]);

  if (!session || !session.isActive) return null;

  const handleManualRevoke = () => {
    ownerGovernanceService.revokeEmergencySession(
      session.sessionId,
      'Operator Manual Revocation',
      'Revoked from Context Entry Banner'
    );
    onLogAudit?.(
      'EMERGENCY_SESSION_REVOKED_MANUALLY',
      `Emergency Session [${session.sessionId}] for incident [${session.incidentId}] terminated by operator from active context banner.`
    );
    onEndSession();
  };

  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs z-40 border-b border-red-500/50">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-black/30 text-amber-300 flex items-center justify-center shrink-0 animate-pulse">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-[10px] text-amber-300">
              {session.isBreakGlass ? 'Break-Glass Emergency Session Active' : 'Emergency Access Session Active'}
            </span>
            <span className="font-mono font-bold text-[11px] text-white">
              {session.incidentId}
            </span>
            <span className="text-white/80">•</span>
            <span className="font-bold text-white">
              School: {session.schoolName}
            </span>
          </div>
          <div className="text-[11px] text-red-100 mt-0.5 flex items-center gap-2">
            <span>Scope: [{session.scope.join(', ')}]</span>
            <span>•</span>
            <span>Operator: {session.operatorName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/20 font-mono font-bold text-amber-300">
          <Clock className="w-3.5 h-3.5" />
          <span>Session Expiry: {timeLeftStr}</span>
        </div>
        <button
          type="button"
          onClick={handleManualRevoke}
          className="px-3 py-1 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>End Session &amp; Revoke Access</span>
        </button>
      </div>
    </div>
  );
};
