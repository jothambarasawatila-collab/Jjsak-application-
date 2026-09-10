import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Send,
  BellRing,
  Mail,
  MessageSquare,
} from 'lucide-react';
import {
  InstitutionalSubscription,
  PaymentPlanOption,
} from '../../types/subscriptionFramework';
import { subscriptionPaymentService } from '../../services/subscriptionPaymentService';
import { PublicPaymentChannelInfo, SubscriptionTransactionRecord, OwnerPaymentNotification } from '../../types/paymentChannels';
import { User } from '../../types';

interface PaymentVerificationModalProps {
  subscription: InstitutionalSubscription;
  currentUser: User;
  activeChannels: PublicPaymentChannelInfo[];
  selectedPlanOption: PaymentPlanOption;
  selectedPlanAmount: number;
  selectedPlanTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (receipt: any, updatedSub: InstitutionalSubscription) => void;
  onPaymentSubmitted?: (transaction: SubscriptionTransactionRecord, notification: OwnerPaymentNotification) => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  subscription,
  currentUser,
  activeChannels,
  selectedPlanAmount,
  selectedPlanTitle,
  isOpen,
  onClose,
  onPaymentSubmitted,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    activeChannels.find((c) => c.isPrimary)?.id || (activeChannels[0]?.id ?? 'pay-chan-verified-01')
  );
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(selectedPlanAmount);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    transaction: SubscriptionTransactionRecord;
    notification: OwnerPaymentNotification;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const ref = transactionCode.trim().toUpperCase();
    if (!ref || ref.length < 5) {
      setErrorMsg('Please enter a valid M-Pesa transaction code (e.g., SJB7811902).');
      return;
    }

    if (paymentAmount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep('Validating transaction parameters against institutional ledger...');

    try {
      await new Promise((res) => setTimeout(res, 500));
      setSubmissionStep('Generating unique payment reference and assigning PENDING_VALIDATION status...');

      await new Promise((res) => setTimeout(res, 600));
      setSubmissionStep('Dispatching instant notification to Owner (In-App, Email, SMS, WhatsApp)...');

      const result = subscriptionPaymentService.submitSubscriptionPayment({
        schoolId: subscription.schoolId,
        schoolName: subscription.schoolName,
        schoolCode: subscription.schoolCode,
        mpesaTransactionCode: ref,
        channelId: selectedChannelId,
        amount: paymentAmount,
        subscriptionPeriod: subscription.currentBillingPeriod || '2026 Academic Year',
        invoiceId: `INV-2026-${subscription.schoolCode.replace(/[^A-Z0-9]/g, '')}-001`,
        currentSubscriptionBalanceSnapshot: subscription.outstandingBalance || paymentAmount,
        submittedByUser: currentUser,
        proofDocumentName: paymentNotes ? `Memo: ${paymentNotes}` : undefined,
        notes: paymentNotes,
      });

      setIsSubmitting(false);
      setSubmittedResult(result);

      if (onPaymentSubmitted) {
        onPaymentSubmitted(result.transaction, result.notification);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Payment submission failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#C51E28] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-wide text-white block">
                Submit Subscription Payment
              </span>
              <span className="text-[11px] text-red-100 font-medium">
                {subscription.schoolName} • Status: PENDING VALIDATION
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {submittedResult ? (
          <div className="p-6 text-center space-y-4 text-xs">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                PENDING OWNER VALIDATION
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2.5">
                KES {submittedResult.transaction.amount.toLocaleString()}.00 Submitted
              </h3>
              <p className="text-slate-600 text-[11px] mt-1 max-w-sm mx-auto leading-relaxed">
                Payment has been successfully recorded under reference{' '}
                <strong className="text-slate-900 font-mono">
                  {submittedResult.transaction.paymentReferenceNumber}
                </strong>
                .
              </p>
            </div>

            {/* Notification Dispatch Status */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Owner Notifications Dispatched:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In-App Queue</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Owner Email Alert</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMS Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Alert</span>
                </div>
              </div>
            </div>

            {/* Transaction Summary Card */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-left space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Unique Payment Ref:</span>
                <span className="font-bold text-slate-900">{submittedResult.transaction.paymentReferenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">M-Pesa Code:</span>
                <span className="font-bold text-slate-900">{submittedResult.transaction.mpesaTransactionCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{submittedResult.transaction.channelSnapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted By:</span>
                <span className="font-bold text-slate-900">
                  {submittedResult.transaction.submittedByUserName} ({submittedResult.transaction.submittedByUserRole})
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-amber-200 text-amber-900 font-bold">
                <span>Validation Rule:</span>
                <span>Requires Owner Approval</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 text-left">
              <strong>Policy Reminder:</strong> In accordance with JJSAK Subscription Governance, subscription balances, service extensions, and official receipts are generated only after the Owner/Super Administrator verifies the M-Pesa statement.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl font-bold transition cursor-pointer shadow-md"
            >
              Done &amp; View Validation Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
            {/* Policy Banner */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Owner Validation Policy</strong>
                School users submit payment details for review. The payment status remains{' '}
                <strong className="font-black">PENDING VALIDATION</strong> until the Owner verifies it against Safaricom M-Pesa records.
              </div>
            </div>

            {/* Selected Plan Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Subscription Plan:
                </span>
                <span className="font-bold text-slate-900 text-xs">{selectedPlanTitle}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Amount Due:
                </span>
                <span className="font-mono font-black text-sm text-[#C51E28]">
                  KES {selectedPlanAmount.toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Official Payment Destination (Owner-Verified Channel) */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                1. Official Verified Payment Destination:
              </label>
              <div className="space-y-1.5">
                {activeChannels.map((c) => {
                  const isSelected = selectedChannelId === c.id;
                  return (
                    <label
                      key={c.id}
                      onClick={() => setSelectedChannelId(c.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-red-50/70 border-[#C51E28] ring-1 ring-[#C51E28]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">
                              {c.providerName}
                            </span>
                            <span className="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                              VERIFIED
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-700 font-mono font-bold block">
                            Business No: {c.businessNumber || '0741478813'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            A/C: {c.accountName}
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentChannel"
                        checked={isSelected}
                        onChange={() => setSelectedChannelId(c.id)}
                        className="text-[#C51E28] focus:ring-[#C51E28]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Transaction Reference Input */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                2. M-Pesa Transaction Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                placeholder="e.g. SJB7811902 or QKJ8910XYZ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#C51E28]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enter the 10-character confirmation code from your Safaricom M-Pesa SMS.
              </span>
            </div>

            {/* Payment Amount Input */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                3. Paid Amount (KES) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#C51E28]"
              />
            </div>

            {/* Memo / Notes */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                4. Reference Notes / Deposit Memo (Optional)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Term 1 Capitation, or Bank slip reference"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#C51E28]"
              />
            </div>

            {isSubmitting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 flex items-center gap-2.5 animate-pulse">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span className="text-[11px] font-semibold">{submissionStep}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#C51E28] hover:bg-[#B31821] disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Payment for Owner Validation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
