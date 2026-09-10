import React from 'react';
import {
  X,
  Printer,
  Building2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { SubscriptionReceipt } from '../../types/subscriptionFramework';

interface ReceiptViewModalProps {
  receipt: SubscriptionReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-black tracking-wide text-white block">
                Official Payment Receipt
              </span>
              <span className="text-[10px] text-emerald-200 font-mono">
                {receipt.id} • Verified &amp; Reconciled
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
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto text-slate-900 text-xs select-text">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-emerald-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                  J
                </div>
                <span className="text-base font-black tracking-tight text-slate-900">
                  JJSAK SYSTEMS LIMITED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Official Electronic Payment Receipt
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Kitale, Trans Nzoia • billing@jjsak.sc.ke
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-emerald-700 block">
                RECEIPT
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                {receipt.id}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Date: {new Date(receipt.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* School & Payment Confirmation Card */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 block">
                  Received From:
                </span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>{receipt.schoolName}</span>
                </span>
                <span className="text-xs text-slate-600 font-semibold block">
                  School Code: {receipt.schoolCode}
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-800">
                <QrCode className="w-8 h-8" />
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Transaction Reference:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {receipt.transactionReference}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Payment Method / Channel:</span>
                <span className="font-bold text-slate-800">
                  {receipt.channelSnapshot}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide block">
                Amount Paid &amp; Credited
              </span>
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                KES {receipt.amountPaid.toLocaleString()}.00
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">License Coverage:</span>
              <span className="text-xs font-bold text-slate-200">
                {receipt.planOptionTitle}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                Balance Remaining: KES {receipt.balanceRemaining.toLocaleString()}.00
              </span>
            </div>
          </div>

          {/* Verification & Compliance Stamp */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified and Automatically Reconciled</span>
            </div>
            <p>
              Verified By: <strong>{receipt.verifiedBy}</strong> on{' '}
              {new Date(receipt.verifiedAt).toLocaleString()}
            </p>
            {receipt.darajaReceiptNumber && (
              <p className="font-mono text-[10px] text-slate-500">
                Safaricom Daraja API Validation Receipt: {receipt.darajaReceiptNumber}
              </p>
            )}
            {receipt.bankSlipNumber && (
              <p className="font-mono text-[10px] text-slate-500">
                Bank Branch Validation Memo: {receipt.bankSlipNumber}
              </p>
            )}
            {receipt.receiptNotes && (
              <p className="text-[10px] italic text-slate-500">
                Note: {receipt.receiptNotes}
              </p>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
            Thank you for subscribing to the JJSAK Academic Management Platform.
          </div>
        </div>
      </div>
    </div>
  );
};
