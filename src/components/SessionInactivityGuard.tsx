import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { User } from '../types';

interface SessionInactivityGuardProps {
  currentUser?: User;
  onAutoLogout: (reason: string) => void;
  onRefreshSession?: () => void;
  timeoutMinutes?: number;
}

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (Code P2.8)
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes warning banner

export const SessionInactivityGuard: React.FC<SessionInactivityGuardProps> = ({
  currentUser,
  onAutoLogout,
  onRefreshSession,
  timeoutMinutes = 30,
}) => {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(120);

  const timeoutMs = timeoutMinutes * 60 * 1000 || DEFAULT_TIMEOUT_MS;
  const lastActivityRef = useRef<number>(Date.now());

  const resetActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setLastActivity(now);
    setShowWarningModal(false);
  }, []);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!currentUser) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleEvent = () => {
      // Throttle activity updates
      const now = Date.now();
      if (now - lastActivityRef.current > 3000) {
        lastActivityRef.current = now;
        setLastActivity(now);
      }
    };

    events.forEach((event) => window.addEventListener(event, handleEvent, { passive: true }));

    // Ticker check every 1 second
    const ticker = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const timeLeft = timeoutMs - elapsed;

      if (timeLeft <= 0) {
        setShowWarningModal(false);
        onAutoLogout(`Session expired after ${timeoutMinutes} minutes of inactivity (Code P2.8)`);
      } else if (timeLeft <= WARNING_THRESHOLD_MS) {
        setShowWarningModal(true);
        setRemainingSeconds(Math.ceil(timeLeft / 1000));
      } else {
        setShowWarningModal(false);
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleEvent));
      clearInterval(ticker);
    };
  }, [currentUser, onAutoLogout, timeoutMs, timeoutMinutes]);

  if (!currentUser || !showWarningModal) return null;

  return (
    <div
      id="session-inactivity-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-amber-400 flex flex-col p-6 animate-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
              JJSAK Security Core • Code P2.8
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Session Inactivity Warning
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          For institutional security compliance, accounts are automatically signed out after 30 minutes of inactivity. Your session will terminate in:
        </p>

        {/* Countdown Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-1.5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Time to Auto-Logout:</span>
            </div>
            <span className="font-mono text-xl font-black text-[#C51E28]">
              {Math.floor(remainingSeconds / 60)}:
              {(remainingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="text-[10px] text-amber-700/80 font-mono">
            Last Recorded Activity: {new Date(lastActivity).toLocaleTimeString()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="session-stay-signed-in-btn"
            onClick={() => {
              resetActivity();
              if (onRefreshSession) onRefreshSession();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In</span>
          </button>
          <button
            type="button"
            id="session-logout-now-btn"
            onClick={() => onAutoLogout('User manually terminated session at inactivity warning.')}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
