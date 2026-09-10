import React from 'react';
import { HelpCircle, X, Phone, Mail, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <HelpCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">
                JJSAK Platform Support
              </span>
              <h3 className="text-base font-bold text-white">Help &amp; Technical Support</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed text-[11px]">
            The JJSAK Assessment Platform provides dedicated institutional assistance for school onboarding, credential recovery, system integration, and multi-tenant security queries.
          </p>

          <div className="space-y-2.5">
            {/* Direct Telephone Support */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-[#C51E28] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Telephone &amp; WhatsApp Support</span>
                <span className="font-bold text-slate-900 text-xs block">+254 741 478 813 / +254 100 559 811</span>
                <span className="text-[10px] text-slate-500">Dedicated Technical Lead Line</span>
              </div>
            </div>

            {/* Email Support */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Operations Desk</span>
                <span className="font-bold text-slate-900 text-xs block">support@jjsak.com</span>
                <span className="text-[10px] text-slate-500">helpdesk@jjsak.org</span>
              </div>
            </div>

            {/* Platform Governance */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Platform Security & Governance</span>
                <span className="font-bold text-slate-900 text-xs block">Directorate of Educational Technology</span>
                <span className="text-[10px] text-slate-500">National CBC Assessment Security Perimeter</span>
              </div>
            </div>

            {/* Availability */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 text-[11px]">
                <span className="font-bold text-amber-900 block">Operational Hours</span>
                <span className="text-amber-800">Mon – Fri: 8:00 AM – 5:00 PM EAT</span>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>24/7 High-Availability Cloud Perimeter Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>JJSAK School Assessment System</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#C51E28] hover:underline cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
