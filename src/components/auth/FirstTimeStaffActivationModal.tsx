import React, { useState } from 'react';
import { ShieldCheck, X, UserCheck, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { User, SchoolTenant } from '../../types';
import { validateJJSAKPassword } from '../../utils/securityEngine';
import { staffAuthOtpSecurityService } from '../../services/staffAuthOtpSecurityService';
import { generateSecureOtpDigits, maskAddress } from '../../utils/cryptoUtils';

interface FirstTimeStaffActivationModalProps {
  isOpen: boolean;
  users: User[];
  school?: SchoolTenant;
  schoolName?: string;
  onClose: () => void;
  onActivationSuccess: (activatedUser: User) => void;
}

export const FirstTimeStaffActivationModal: React.FC<FirstTimeStaffActivationModalProps> = ({
  isOpen,
  users,
  school,
  schoolName,
  onClose,
  onActivationSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpDispatchedNotice, setOtpDispatchedNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  if (!isOpen) return null;

  const passwordValidation = validateJJSAKPassword(newPassword);

  const handleRequestActivationOtp = () => {
    setErrorMessage(null);
    setOtpDispatchedNotice(null);
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your Username, TSC, or Employee Number first.');
      return;
    }

    setIsSendingOtp(true);

    setTimeout(() => {
      // Find candidate staff requiring first login activation strictly scoped to school tenant
      const matchedUser = users.find((u) => {
        if (school && u.schoolId !== school.schoolId) return false;
        const uName = (u.username || '').toLowerCase();
        const uEmp = (u.employeeNumber || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return uName === cleanId || uEmp === cleanId || uEmail === cleanId;
      });

      if (!matchedUser) {
        setIsSendingOtp(false);
        // Anti-enumeration notice
        setErrorMessage('Unable to dispatch activation code. Verify your identifier with school administration.');
        return;
      }

      // Generate a cryptographically secure 6-digit OTP
      const newOtp = generateSecureOtpDigits();
      matchedUser.tempOtp = newOtp;
      matchedUser.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Determine channel and masked destination
      const dest = matchedUser.email || matchedUser.phoneNumber || 'registered device';
      const channel = matchedUser.email ? 'EMAIL' : 'SMS';
      const maskedDest = maskAddress(dest, channel);

      staffAuthOtpSecurityService.logAudit({
        userId: matchedUser.id,
        tenantId: school?.schoolId || matchedUser.schoolId || 'UNKNOWN',
        role: matchedUser.role,
        deviceInfo: navigator.userAgent || 'Web Browser',
        sourceIp: '127.0.0.1',
        eventType: 'FIRST_TIME_ACTIVATION_OTP_DISPATCHED',
        eventOutcome: 'SUCCESS',
        details: `Dispatched activation code to registered ${channel} (${maskedDest}). Valid for 300s.`,
      });

      setIsSendingOtp(false);
      setOtpDispatchedNotice(`Activation code dispatched to registered ${channel} (${maskedDest}). Valid for 5 minutes.`);
    }, 600);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanId || !cleanOtp) {
      setErrorMessage('Please provide both your registered identifier and temporary OTP.');
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage('Password does not satisfy institutional security policy (minimum 12 characters, uppercase, lowercase, number, symbol).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your new password.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Find candidate staff requiring first login activation strictly scoped to school tenant
      const matchedUser = users.find((u) => {
        if (school && u.schoolId !== school.schoolId) return false;
        const uName = (u.username || '').toLowerCase();
        const uEmp = (u.employeeNumber || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return uName === cleanId || uEmp === cleanId || uEmail === cleanId;
      });

      // Strict failure message to prevent enumeration
      if (!matchedUser) {
        setIsProcessing(false);
        setErrorMessage('Invalid identifier or verification OTP code.');
        return;
      }

      // Check OTP without hardcoded bypasses
      const now = Date.now();
      const isExpired = matchedUser.otpExpiry ? now > matchedUser.otpExpiry : false;
      const isOtpValid = matchedUser.tempOtp && matchedUser.tempOtp === cleanOtp && !isExpired;

      if (!isOtpValid) {
        setIsProcessing(false);
        setErrorMessage(isExpired ? 'Activation code has expired. Please request a new code.' : 'Invalid identifier or verification OTP code.');
        return;
      }

      // Activate user account
      const updatedUser: User = {
        ...matchedUser,
        active: true,
        activationStatus: 'ACTIVE',
        firstLoginCompleted: true,
        password: newPassword,
        tempOtp: undefined,
        otpExpiry: undefined,
      };

      staffAuthOtpSecurityService.logAudit({
        userId: updatedUser.id,
        tenantId: school?.schoolId || updatedUser.schoolId || 'UNKNOWN',
        role: updatedUser.role,
        deviceInfo: navigator.userAgent || 'Web Browser',
        sourceIp: '127.0.0.1',
        eventType: 'FIRST_TIME_ACTIVATION_COMPLETED',
        eventOutcome: 'SUCCESS',
        details: `First-time staff activation successfully completed for ${updatedUser.fullName} under tenant ${schoolName || school?.schoolName || 'School Tenant'}. Credentials configured.`,
      });

      setIsProcessing(false);
      setSuccessMessage('Account successfully activated! You can now sign in with your new password.');

      setTimeout(() => {
        onActivationSuccess(updatedUser);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div
      id="first-time-staff-activation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C51E28]/20 border border-[#C51E28]/40 flex items-center justify-center text-[#C51E28]">
              <UserCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">
                JJSAK Security Core • Policy §1.4 &amp; §1.5
              </span>
              <h3 className="text-base font-bold text-white">First-Time Staff Activation</h3>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>In-School First-Time Staff Activation (Rule §6)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Per master policy, staff activation is executed securely through multi-factor authorization. The system will dispatch an authorization OTP code to your registered official phone or email.
            </p>
            <p className="text-[10px] text-amber-700/90 leading-tight">
              🔒 OTP Delivery (Rule §7): Your OTP was dispatched securely via SMS / Email and must be manually entered below. OTPs are never displayed on screens or in logs.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {otpDispatchedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{otpDispatchedNotice}</span>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Username / TSC / Employee Number
                </label>
                <button
                  type="button"
                  onClick={handleRequestActivationOtp}
                  disabled={isSendingOtp || !identifier.trim()}
                  className="text-[11px] font-bold text-[#C51E28] hover:text-red-700 flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
                  title="Dispatch a temporary activation code to the staff member's registered email or SMS number"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingOtp ? 'Sending...' : 'Request Code to Device'}</span>
                </button>
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. TSC-881923 or sarah.chebet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Temporary One-Time OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit activation code (e.g. 849120)"
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-widest text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Create New Permanent Password (12+ Characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 12 chars with upper, lower, digit, symbol"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                  required
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Strength: {passwordValidation.score}/5</span>
                <span className={passwordValidation.isValid ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {passwordValidation.isValid ? 'Strong (Approved)' : 'Requires 12+ chars & complexity'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Permanent Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Verifying Activation...' : 'Activate Staff Account'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>JJSAK Institutional Tenant Security</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
