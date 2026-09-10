import React, { useState } from 'react';
import { KeyRound, X, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setIdentifier('');
    onClose();
  };

  return (
    <div
      id="account-recovery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                JJSAK Credential Assistance
              </span>
              <h3 className="text-base font-bold text-white">Account Recovery &amp; Password Assistance</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Enter your registered Institution Username, Email address, or TSC Number. A secure recovery token will be dispatched through your institution's verified administrative channel.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Username / Registered Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. username or staff@school.sc.ke"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                  required
                />
              </div>

              {/* Anti-Enumeration Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-2.5 text-[11px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tenant Privacy Rule:</strong> The recovery system does not indicate whether a school institution or user account exists in the platform to prevent unauthorized enumeration.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Verifying Request...' : 'Send Recovery Instructions'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center py-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Recovery Instructions Dispatched</h4>
                <p className="mt-2 text-slate-600 leading-relaxed text-[11px] text-left p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  If the supplied identifier corresponds to an active account within an officially registered institution, secure reset instructions and an authorization token have been sent to the verified administrator and registered contact.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Return to Secure Login
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>JJSAK Institutional Tenant Security</span>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
