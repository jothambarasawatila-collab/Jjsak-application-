import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Trash2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../types';
import { canPerformPermanentDelete } from '../utils/securityEngine';

interface PermanentDeletionModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType: string; // e.g. "Learner Assessment Record", "Teacher Profile", "Assessment File"
  currentUserRole: UserRole | string;
  currentUserName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const PermanentDeletionModal: React.FC<PermanentDeletionModalProps> = ({
  isOpen,
  itemTitle,
  itemType,
  currentUserRole,
  currentUserName,
  onConfirm,
  onCancel,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAuthorized = canPerformPermanentDelete(currentUserRole);
  const isConfirmMatch = confirmText.trim().toUpperCase() === 'DELETE';
  const isReasonValid = reasonText.trim().length >= 10;
  const canSubmit = isAuthorized && isConfirmMatch && isReasonValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setError('Unauthorized: Code P1.10 permits only Head of Institution, Deputy Head, or Director of Academics to permanently delete records.');
      return;
    }
    if (!isConfirmMatch) {
      setError('Please type DELETE exactly to confirm your intent.');
      return;
    }
    if (!isReasonValid) {
      setError('A mandatory reason of at least 10 characters is required for audit logging.');
      return;
    }

    onConfirm(reasonText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-[#C51E28] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
                Code P1.10 • Security Protocol
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                Permanent Deletion Gate
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {/* Authorization Check Banner */}
          {!isAuthorized ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-2 text-red-900">
              <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                <Lock className="w-4 h-4 text-red-600" />
                <span>Permission Denied (Code P1.10)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-800">
                Under JJSAK Security Rule Code P1.10, only <strong>Head of Institution</strong>, <strong>Deputy Head</strong>, or <strong>Director of Academics</strong> hold executive privileges to permanently delete data records.
              </p>
              <div className="mt-1 text-[10px] font-mono bg-white p-2 rounded-lg border border-red-200 text-slate-700">
                Current Role: <span className="font-bold text-red-700">{currentUserRole}</span> ({currentUserName})
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
              >
                Close &amp; Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Item Details Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-950">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block text-amber-900">
                    Target Record to be Permanently Purged:
                  </span>
                  <div className="font-mono text-[11px] font-bold text-slate-900 mt-1 bg-white/80 p-2 rounded-lg border border-amber-200">
                    [{itemType}] {itemTitle}
                  </div>
                  <p className="text-[10px] text-amber-800 mt-1.5 leading-tight">
                    This action is irreversible. All linked historical CBC formative and summative metrics will be removed.
                  </p>
                </div>
              </div>

              {/* Step 1: Double Confirmation Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Double Confirmation <span className="text-red-600">*</span>
                </label>
                <p className="text-[10px] text-slate-500 mb-1.5">
                  Type <span className="font-mono font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">DELETE</span> in capital letters to verify your intention:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Type DELETE"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border transition focus:outline-none ${
                    isConfirmMatch
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 focus:ring-1 focus:ring-emerald-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-red-500'
                  }`}
                  autoFocus
                />
              </div>

              {/* Step 2: Mandatory Audit Reason */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    2. Mandatory Audit Reason <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {reasonText.trim().length}/10 chars min
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={reasonText}
                  onChange={(e) => {
                    setReasonText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Duplicate learner entry registered during manual term onboarding."
                  className={`w-full px-3 py-2 rounded-xl text-xs border transition focus:outline-none ${
                    isReasonValid
                      ? 'border-emerald-500 bg-white text-slate-900'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-red-500'
                  }`}
                />
              </div>

              {/* Audit Trail Identity Notice */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Authorized by: <strong>{currentUserName}</strong> (<span className="font-semibold text-slate-800">{currentUserRole}</span>). Will be recorded in immutable audit log.
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-100 text-red-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer ${
                    canSubmit
                      ? 'bg-[#C51E28] hover:bg-red-700 active:scale-95'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
