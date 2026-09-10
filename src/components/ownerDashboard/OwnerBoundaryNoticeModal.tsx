import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Flame,
  FileCheck2,
  ArrowRightLeft,
  X,
} from 'lucide-react';

interface OwnerBoundaryNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetResourceName: string;
  onOpenExceptions: () => void;
  onOpenEmergency: () => void;
  onOpenDualIdentity: () => void;
  onReturnToDashboard: () => void;
}

export const OwnerBoundaryNoticeModal: React.FC<OwnerBoundaryNoticeModalProps> = ({
  isOpen,
  onClose,
  targetResourceName,
  onOpenExceptions,
  onOpenEmergency,
  onOpenDualIdentity,
  onReturnToDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Data Boundary Protection Notice
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                  Section 6 Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Owner Direct Access to School Operational Data is Restricted.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Notice Message */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Tenant Boundary Enforcement Mandate:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You are attempting to access <strong>{targetResourceName}</strong>. Under the <em>JJSAK Owner / Super Administrator Governance Policy</em>, schools own their learner records, assessments, staff profiles, and operational data.
          </p>
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] text-amber-200/90 font-medium">
            "The Owner may not directly access school operational data without an approved exception or emergency access authorization." (§6)
          </div>
        </div>

        {/* Authorized Paths of Action */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-600 uppercase tracking-tight block">
            Authorized Governance Access Paths:
          </span>

          {/* Option 1: Approved Exception (§9) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenExceptions();
            }}
            className="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition flex items-center justify-between gap-3 cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs text-blue-950 block group-hover:text-blue-900">
                  1. Request Approved Exception (§9)
                </strong>
                <span className="text-[11px] text-blue-700">
                  Technical support, security review, or school-authorized assistance with documented ticket reference.
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
          </button>

          {/* Option 2: Break-Glass Emergency (§10 & §11) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEmergency();
            }}
            className="w-full p-3 rounded-2xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-left transition flex items-center justify-between gap-3 cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs text-red-950 block group-hover:text-red-900">
                  2. Initiate Emergency Break-Glass Access (§10)
                </strong>
                <span className="text-[11px] text-red-700">
                  Immediate 12-phase protocol for critical outages, cyber incidents, or disaster recovery.
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
          </button>

          {/* Option 3: Dual-Identity Switch (§7) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDualIdentity();
            }}
            className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition flex items-center justify-between gap-3 cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs text-emerald-950 block group-hover:text-emerald-900">
                  3. Switch to School Operational Account (§7)
                </strong>
                <span className="text-[11px] text-emerald-700">
                  Switch from Platform Owner to your assigned school-created teacher/administrator identity.
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>
        </div>

        {/* Return Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Tenant Isolation: <strong className="text-slate-700">Zero Cross-Tenant Leakage</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onReturnToDashboard();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Return to Owner Governance Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
