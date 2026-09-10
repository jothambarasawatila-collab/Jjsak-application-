import React from 'react';
import {
  X,
  Printer,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { SubscriptionInvoice } from '../../types/subscriptionFramework';

interface InvoiceViewModalProps {
  invoice: SubscriptionInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'PAID';
  const isTrial = invoice.trialCredit > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-xs font-black tracking-wide text-white block">
                JJSAK Official Institutional Invoice
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {invoice.id} • Immutable Snapshot
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-900 text-xs select-text">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#C51E28] text-white flex items-center justify-center font-black text-sm">
                  J
                </div>
                <span className="text-base font-black tracking-tight text-slate-900">
                  JJSAK SYSTEMS LIMITED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Educational Technology &amp; School Governance Solutions
              </p>
              <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Trans Nzoia County, Kitale, Kenya</span>
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>+254 741 478 813 / +254 100 559 811</span>
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>billing@jjsak.sc.ke • support@jjsak.sc.ke</span>
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-2xl font-black text-[#C51E28] block tracking-tight">
                INVOICE
              </span>
              <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded inline-block">
                {invoice.id}
              </div>
              <p className="text-[11px] text-slate-500">
                Date: <strong>{new Date(invoice.issueDate).toLocaleDateString()}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Due Date: <strong>{new Date(invoice.dueDate).toLocaleDateString()}</strong>
              </p>
              <div>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isTrial
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isPaid ? 'PAID & SETTLED' : isTrial ? 'FREE TRIAL APPLIED' : 'PAYMENT DUE'}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / School Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Billed To School:
              </span>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#C51E28]" />
                <span>{invoice.schoolName}</span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                School Code: <span className="font-mono">{invoice.schoolCode}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Tenant ID: {invoice.schoolId}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Subscription Plan:
              </span>
              <p className="text-xs font-black text-slate-900">
                {invoice.planTitle}
              </p>
              <p className="text-[11px] text-slate-600">
                Coverage: {invoice.billingPeriod}
              </p>
              <p className="text-[11px] text-emerald-700 font-bold">
                JJSAK Learner-Based Rate: KES {invoice.ratePerLearner} / learner / yr
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Active Learners</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Amount (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <span className="font-black text-slate-900 block">
                      JJSAK School Academic Platform Licensing
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {invoice.planTitle} • CBC Curriculum &amp; Student Analytics
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    {invoice.activeLearnersSnapshot}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    KES {invoice.ratePerLearner}.00
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {invoice.subtotal.toLocaleString()}.00
                  </td>
                </tr>

                {invoice.trialCredit > 0 && (
                  <tr className="bg-blue-50/50 text-blue-900">
                    <td className="p-3" colSpan={3}>
                      <span className="font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>JJSAK Approved 1-Term Free Trial Exemption (100% Courtesy Credit)</span>
                      </span>
                      <span className="text-[10px] text-blue-700">
                        Zero learner-based subscription fees during initial 120-day school term
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-700">
                      - {invoice.trialCredit.toLocaleString()}.00
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={3} className="p-3 text-right font-bold text-slate-700">
                    Subtotal:
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    KES {invoice.subtotal.toLocaleString()}.00
                  </td>
                </tr>
                {invoice.trialCredit > 0 && (
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="p-2 text-right font-bold text-blue-700">
                      Trial Courtesy Credit:
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-blue-700">
                      - KES {invoice.trialCredit.toLocaleString()}.00
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td colSpan={3} className="p-3 text-right text-xs font-black text-slate-900">
                    Total Payable Amount:
                  </td>
                  <td className="p-3 text-right font-mono text-base font-black text-[#C51E28]">
                    KES {invoice.totalPayable.toLocaleString()}.00
                  </td>
                </tr>
                <tr className="bg-emerald-50">
                  <td colSpan={3} className="p-2 text-right font-bold text-emerald-800">
                    Amount Paid to Date:
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-emerald-800">
                    KES {invoice.amountPaid.toLocaleString()}.00
                  </td>
                </tr>
                <tr className="bg-red-50/50">
                  <td colSpan={3} className="p-2.5 text-right font-black text-slate-900">
                    Outstanding Balance Due:
                  </td>
                  <td className="p-2.5 text-right font-mono text-sm font-black text-[#C51E28]">
                    KES {invoice.balanceDue.toLocaleString()}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions Box */}
          {invoice.paymentInstructions && invoice.paymentInstructions.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Official Approved Payment Channels:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {invoice.paymentInstructions.map((ch, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">{ch.channelName}</span>
                    <span className="font-mono text-[11px] text-[#C51E28] font-bold block">
                      Paybill / A/C: {ch.paybillOrAccount}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Account Name: {ch.accountName}
                    </span>
                    <span className="text-[10px] text-slate-600 italic block mt-0.5">
                      Reference: {ch.accountReference}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Notes */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Generated by: {invoice.generatedBy} ({invoice.generatedByRole})
            </span>
            <span>
              This is an immutable electronic invoice under the Kenya Electronic Transactions Act.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
