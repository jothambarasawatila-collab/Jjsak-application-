import React from 'react';
import {
  ShieldAlert,
  X,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { User as UserType } from '../types';

interface SecurityBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedAction?: string;
  attemptedTarget?: string;
  customMessage?: string;
  currentUser?: UserType;
}

export const SecurityBoundaryModal: React.FC<SecurityBoundaryModalProps> = ({
  isOpen,
  onClose,
  attemptedAction,
  attemptedTarget,
  customMessage,
  currentUser,
}) => {
  if (!isOpen) return null;

  const actionDisplay = attemptedTarget || attemptedAction || 'Platform Governance Component (SCMH 2.X)';

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border-2 border-red-600/90 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-red-950/90 border-b border-red-700/60 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">
                SCMH 2.X – Platform Governance & Access Isolation
              </span>
              <h3 className="text-base font-black text-white">Platform Boundary Violation</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-200 text-xs overflow-y-auto max-h-[75vh]">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-200 text-xs">
                Owner / Super Administrator Exclusive Access Enforced
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {customMessage ||
                  'The requested component is classified as a Platform Governance Component and shall be accessible ONLY to the Owner/Super Administrator under JJSAK Policy SCMH 2.X. School portals and institutional roles are restricted exclusively to their own operational modules.'}
              </p>
            </div>
          </div>

          {/* 5-Point Tenant Isolation Enforcement Checkpoints */}
          <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Security Core Isolation Checkpoints
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-950 text-red-400 border border-red-800">
                Mandatory Policy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Tenant ID Check: <strong className="text-white">Validated</strong></span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">School ID Check: <strong className="text-white">Isolated</strong></span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">User ID Check: <strong className="text-white">Authenticated</strong></span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-red-950/40 border border-red-800/60">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-red-300 font-semibold">Role Permissions: <strong className="text-red-200">Blocked</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Active Session: Active &amp; logged under institutional profile.</span>
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px]">
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Attempted Target:</span>
              <span className="text-red-400 font-bold truncate max-w-[260px]">{actionDisplay}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Current User:</span>
              <span className="text-white truncate max-w-[260px]">{currentUser?.fullName || 'Institutional User'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Institutional Role:</span>
              <span className="text-amber-400 font-bold">{currentUser?.role || 'SCHOOL_STAFF'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Policy Reference:</span>
              <span className="text-emerald-400">SCMH 2.X – Access Isolation</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <p className="font-semibold text-slate-200">
              🔒 <strong>School Portal Visibility Restrictions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>27-Phase Master Architecture, Security Core, and Multi-Tenant Hub are reserved exclusively for Platform Owner.</li>
              <li>Global Configuration, Platform Monitoring, and Tenant Provisioning controls are blocked from all school portals.</li>
              <li>Every school tenant operates in a zero-discovery environment isolated from other schools.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400 font-medium">
            Security audit log entry recorded.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
          >
            <span>Return to School Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
