import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  InstitutionalSubscription,
  SubscriptionStatus,
} from '../../types/subscriptionFramework';
import { institutionalSubscriptionService } from '../../services/institutionalSubscriptionService';
import { User } from '../../types';

interface SubscriptionStatusModalProps {
  subscription: InstitutionalSubscription;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: InstitutionalSubscription) => void;
}

const ALL_STATUSES: {
  key: SubscriptionStatus;
  label: string;
  badgeColor: string;
  description: string;
}[] = [
  {
    key: 'TRIAL',
    label: '1. Trial (1-Term Free Trial)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Initial school activation phase. 0 learner fees charged during approved one-term trial window.',
  },
  {
    key: 'ACTIVE',
    label: '2. Active (Subscription Active)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Valid, authorized institutional access with paid license or active term coverage.',
  },
  {
    key: 'PENDING_PAYMENT',
    label: '3. Pending Payment (Action Required)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Trial term ended or term installment due. Invoices generated; awaiting payment submission.',
  },
  {
    key: 'PARTIALLY_PAID',
    label: '4. Partially Paid (Term Installment Paid)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'School has paid an installment (e.g. Term 1 40%), with remaining installments pending.',
  },
  {
    key: 'FULLY_PAID',
    label: '5. Fully Paid (100% Annual Settled)',
    badgeColor: 'bg-emerald-600 text-white border-emerald-700',
    description: 'All 3 terms (100% of annual learner fees) settled for the academic year.',
  },
  {
    key: 'SUSPENDED',
    label: '6. Suspended (Governance Restriction)',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    description: 'Access locked under approved platform governance rules (e.g., prolonged delinquency or policy breach).',
  },
  {
    key: 'EXPIRED',
    label: '7. Expired (License Lapsed)',
    badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
    description: 'Annual licensing period or free trial expired without renewal.',
  },
];

export const SubscriptionStatusModal: React.FC<SubscriptionStatusModalProps> = ({
  subscription,
  currentUser,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus>(subscription.status);
  const [learnerCount, setLearnerCount] = useState<number>(subscription.activeLearnerCount);
  const [justificationReason, setJustificationReason] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const reason = justificationReason.trim();
    if (!reason || reason.length < 8) {
      setErrorMsg('Mandatory Audit Requirement: Please provide a clear justification reason (minimum 8 characters).');
      return;
    }

    // Security PIN confirmation (owner or standard admin confirmation)
    if (securityPin.trim() !== '9944' && securityPin.trim() !== '2026' && securityPin.trim() !== '1234') {
      setErrorMsg('Invalid Security PIN. Authorized administrative PIN required to modify institutional billing controls.');
      return;
    }

    try {
      let updated = subscription;

      // Update learner count if changed
      if (learnerCount !== subscription.activeLearnerCount) {
        updated = institutionalSubscriptionService.updateLearnerCount(
          subscription.schoolId,
          learnerCount,
          currentUser.fullName || 'Authorized Administrator',
          currentUser.role || 'ADMIN',
          reason
        );
      }

      // Update status if changed
      if (selectedStatus !== subscription.status) {
        updated = institutionalSubscriptionService.updateSubscriptionStatus(
          subscription.schoolId,
          selectedStatus,
          currentUser.fullName || 'Authorized Administrator',
          currentUser.role || 'ADMIN',
          reason
        );
      }

      setSuccessMsg('Subscription status & learner settings updated successfully with full audit trail attribution!');
      onUpdate(updated);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update subscription status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-black tracking-wide text-white block">
                Subscription Status Controls &amp; Governance
              </span>
              <span className="text-[10px] text-slate-400">
                {subscription.schoolName} ({subscription.schoolCode})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleApply} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Compliance Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[11px]">Audit &amp; Compliance Rule (§8):</strong>
              All status updates, learner adjustments, and balance modifications are recorded in the immutable audit trail with your name ({currentUser.fullName}), role ({currentUser.role}), and timestamp.
            </div>
          </div>

          {/* Active Learner Count Adjuster */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C51E28]" />
                <span>Active Registered Learners:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={learnerCount}
                  onChange={(e) => setLearnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-center text-slate-900 focus:ring-2 focus:ring-[#C51E28]"
                />
                <span className="text-slate-600 font-semibold">Learners</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
              <span>Annual Subscription Fee (KES 60 / learner):</span>
              <span className="font-mono font-bold text-[#C51E28]">
                KES {(learnerCount * 60).toLocaleString()}.00
              </span>
            </div>
          </div>

          {/* 7 Subscription Statuses Grid */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">
              Select Approved Subscription Status (Rule 7):
            </label>
            <div className="space-y-1.5">
              {ALL_STATUSES.map((st) => {
                const isSelected = selectedStatus === st.key;
                return (
                  <label
                    key={st.key}
                    onClick={() => setSelectedStatus(st.key)}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-red-50/70 border-[#C51E28] ring-1 ring-[#C51E28]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscriptionStatus"
                      value={st.key}
                      checked={isSelected}
                      onChange={() => setSelectedStatus(st.key)}
                      className="mt-1 text-[#C51E28] focus:ring-[#C51E28]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {st.label}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                          {st.key}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {st.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Justification Reason (Mandatory Audit) */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Audit Justification Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={justificationReason}
              onChange={(e) => setJustificationReason(e.target.value)}
              placeholder="e.g. Approved BOM resolution on Term 1 capitation reconciliation; active learner sync verified."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#C51E28]"
            />
          </div>

          {/* Security PIN */}
          <div>
            <label className="font-bold text-slate-800 flex items-center gap-1 mb-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Administrative Security PIN <span className="text-red-500">*</span></span>
            </label>
            <input
              type="password"
              maxLength={6}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              placeholder="Enter PIN (e.g. 9944, 2026, or 1234)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#C51E28]"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Commit Status Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
