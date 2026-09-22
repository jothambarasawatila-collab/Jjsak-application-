import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Inbox,
  Lock,
  ArrowRight,
  School,
  Smartphone,
  Mail,
  MessageSquare,
  Check,
  RefreshCw,
  Copy,
  Key,
} from 'lucide-react';
import { User, SchoolTenant } from '../../types';
import { carrierInboxService } from '../../services/carrierInboxService';
import { teacherAccountSecurityService } from '../../services/teacherAccountSecurityService';
import { validateJJSAKPassword } from '../../utils/securityEngine';

interface TeacherValidationAndActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  tenants: SchoolTenant[];
  initialOtp?: string;
  initialUsername?: string;
  initialSchoolId?: string;
  initialPassword?: string;
  onActivationComplete: (activatedUser: User, targetSchoolId: string) => void;
  onOpenInbox: () => void;
}

export const TeacherValidationAndActivationModal: React.FC<TeacherValidationAndActivationModalProps> = ({
  isOpen,
  onClose,
  users,
  tenants,
  initialOtp = '',
  initialUsername = '',
  initialSchoolId = '',
  initialPassword = '',
  onActivationComplete,
  onOpenInbox,
}) => {
  // Steps: 1 = Validate OTP from Inbox, 2 = Set Permanent Password, 3 = Complete & Access Portal
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form
  const [identifier, setIdentifier] = useState(initialUsername);
  const [enteredOtp, setEnteredOtp] = useState(initialOtp);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [targetSchool, setTargetSchool] = useState<SchoolTenant | null>(null);

  // Delivered First-Time Password state
  const [firstTimePassword, setFirstTimePassword] = useState(initialPassword);
  const [showFirstTimePassword, setShowFirstTimePassword] = useState(false);
  const [copiedFirstTimePassword, setCopiedFirstTimePassword] = useState(false);

  // Step 2 Form (Password Setup)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Resend state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialUsername) {
      setIdentifier(initialUsername);
      const u = users.find(
        (usr) =>
          usr.username.toLowerCase() === initialUsername.toLowerCase() ||
          usr.email?.toLowerCase() === initialUsername.toLowerCase()
      );
      if (u) {
        setMatchedUser(u);
        const s = tenants.find((t) => t.schoolId === u.schoolId);
        if (s) setTargetSchool(s);
        if (u.firstTimePassword && !firstTimePassword) {
          setFirstTimePassword(u.firstTimePassword);
        }
      }
    }
    if (initialOtp) {
      setEnteredOtp(initialOtp);
    }
    if (initialPassword) {
      setFirstTimePassword(initialPassword);
    } else if (initialUsername) {
      const delivered = carrierInboxService.getLatestFirstTimePasswordForUser(initialUsername);
      if (delivered) setFirstTimePassword(delivered);
    }
    if (initialSchoolId && !targetSchool) {
      const s = tenants.find((t) => t.schoolId === initialSchoolId);
      if (s) setTargetSchool(s);
    }
  }, [initialUsername, initialOtp, initialSchoolId, initialPassword, users, tenants]);

  // Cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Resolve user on the fly if identifier changes
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    setOtpError(null);
    const clean = val.trim().toLowerCase();
    const u = users.find(
      (usr) =>
        usr.username.toLowerCase() === clean ||
        usr.email?.toLowerCase() === clean ||
        usr.phoneNumber?.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    );
    if (u) {
      setMatchedUser(u);
      const s = tenants.find((t) => t.schoolId === u.schoolId);
      if (s) setTargetSchool(s);
      const deliveredPwd = u.firstTimePassword || carrierInboxService.getLatestFirstTimePasswordForUser(clean);
      if (deliveredPwd) {
        setFirstTimePassword(deliveredPwd);
      }
    } else {
      setMatchedUser(null);
      const deliveredPwd = carrierInboxService.getLatestFirstTimePasswordForUser(clean);
      if (deliveredPwd) {
        setFirstTimePassword(deliveredPwd);
      }
    }
  };

  // Step 1: Verify OTP retrieved from Inbox
  const handleValidateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanId = identifier.trim();
    const cleanOtp = enteredOtp.trim();

    if (!cleanId) {
      setOtpError('Please enter your registered Teacher Username, Email, or Phone number.');
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('Please enter the full 6-digit OTP retrieved from your SMS, WhatsApp, or Email inbox.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(async () => {
      // 1. First validate against carrierInboxService active records
      const carrierRes = carrierInboxService.validateTeacherOtp(cleanId, cleanOtp);

      // 2. Also check against teacherAccountSecurityService
      const staffSecRes = teacherAccountSecurityService.verifyFirstLoginOtp(cleanId, cleanOtp, users);

      let isValid = carrierRes.success || staffSecRes.result.success;

      // 3. If not yet validated, attempt authoritative backend verification
      if (!isValid) {
        try {
          const resp = await fetch('/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: cleanId, candidateCode: cleanOtp }),
          });
          const data = await resp.json();
          if (resp.ok && data.success && data.verified) {
            isValid = true;
          }
        } catch {
          // Ignore network errors
        }
      }

      if (isValid) {
        // Resolve user
        let user = matchedUser;
        if (!user) {
          user = users.find(
            (u) =>
              u.username.toLowerCase() === cleanId.toLowerCase() ||
              u.email?.toLowerCase() === cleanId.toLowerCase() ||
              u.id === cleanId
          ) || null;
        }

        // If user not found in local array, build a baseline user profile
        if (!user) {
          const sId = targetSchool?.schoolId || initialSchoolId || tenants[0]?.schoolId || 'sch-default';
          user = {
            id: `usr-${Date.now()}`,
            schoolId: sId,
            username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
            fullName: cleanId.includes('@') ? cleanId.split('@')[0].toUpperCase() : 'Registered Teacher',
            email: cleanId.includes('@') ? cleanId : undefined,
            role: 'TEACHER',
            active: false,
            activationStatus: 'REGISTERED_FIRST_LOGIN_REQUIRED',
            firstLoginCompleted: false,
            passwordCreated: false,
          };
        }

        setMatchedUser(user);
        setIsVerifyingOtp(false);
        setCurrentStep(2);
      } else {
        setIsVerifyingOtp(false);
        setOtpError(
          carrierRes.message ||
          staffSecRes.result.errorMessage ||
          'Invalid OTP code. Please check your SMS, WhatsApp, or Email inbox and enter the 6-digit code received.'
        );
      }
    }, 600);
  };

  // Resend OTP to inboxes
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const cleanId = identifier.trim();
    if (!cleanId) {
      setOtpError('Please enter your username, email, or phone number to resend the OTP.');
      return;
    }

    const school = targetSchool || tenants[0];
    const teacherName = matchedUser?.fullName || cleanId;

    carrierInboxService.dispatchTeacherRegistrationInvite({
      teacherId: matchedUser?.id || `tch-${Date.now()}`,
      teacherName,
      username: cleanId,
      email: matchedUser?.email || (cleanId.includes('@') ? cleanId : undefined),
      phoneNumber: matchedUser?.phoneNumber,
      schoolId: school?.schoolId || 'sch-001',
      schoolName: school?.schoolName || 'Central Primary School',
      schoolCode: school?.schoolCode || 'CPS',
      role: 'TEACHER',
    });

    setResendCooldown(60);
    setResendNotice(`✓ Fresh OTP dispatched to your registered SMS, WhatsApp, and Email inboxes.`);
    setTimeout(() => setResendNotice(null), 5000);
  };

  // Step 2: Set Permanent Password
  const passwordValidation = validateJJSAKPassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!matchedUser) {
      setPasswordError('Teacher profile session missing. Please restart validation.');
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordError('Password does not meet minimum policy requirements (12+ characters, uppercase, lowercase, number, symbol).');
      return;
    }

    if (!passwordsMatch) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    if (!acceptedTerms) {
      setPasswordError('You must review and accept the JJSAK ICT Acceptable Use Agreement to proceed.');
      return;
    }

    setIsSettingPassword(true);

    setTimeout(() => {
      // Invalidate OTP in carrier inbox service
      carrierInboxService.finalizeTeacherActivation(matchedUser.username);

      // Create updated active user
      const activatedUser: User = {
        ...matchedUser,
        password: newPassword,
        activationStatus: 'ACTIVE',
        firstLoginCompleted: true,
        passwordCreated: true,
        active: true,
        termsAcceptedAt: new Date().toISOString(),
      };

      setIsSettingPassword(false);
      setMatchedUser(activatedUser);
      setCurrentStep(3);
    }, 700);
  };

  // Step 3: Complete & Access School Portal
  const handleEnterSchoolPortal = () => {
    if (matchedUser) {
      const sId = matchedUser.schoolId || targetSchool?.schoolId || tenants[0]?.schoolId || 'sch-001';
      onActivationComplete(matchedUser, sId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6 text-red-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Teacher Registration Validation
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  STEP {currentStep} OF 3
                </span>
              </div>
              <p className="text-xs text-red-200/90 font-medium">
                Mandatory First-Time Registration OTP Validation &amp; Password Setup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= 1 ? 'bg-red-800 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={`font-bold ${currentStep === 1 ? 'text-red-900' : 'text-slate-500'}`}>
              Validate Inbox OTP
            </span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= 2 ? 'bg-red-800 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`font-bold ${currentStep === 2 ? 'text-red-900' : 'text-slate-500'}`}>
              Set Permanent Password
            </span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={`font-bold ${currentStep === 3 ? 'text-emerald-700' : 'text-slate-500'}`}>
              Access School Portal
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[72vh]">
          {/* STEP 1: VALIDATE OTP FROM INBOX */}
          {currentStep === 1 && (
            <form onSubmit={handleValidateOtp} className="space-y-5">
              {/* Info notice about multi-channel inbox delivery */}
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-red-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      {targetSchool ? targetSchool.schoolName : 'Registered School Operational Portal'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenInbox}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Inbox className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Open Messages / Inboxes</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Upon registration by your school, a secure activation link with a <strong>single-use 6-digit OTP</strong> was dispatched to your registered <strong>Email address, SMS inbox, and WhatsApp inbox</strong>.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span className="truncate">Email Inbox</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">SMS Inbox</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">WhatsApp Inbox</span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Teacher Username / Email / Phone:
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    placeholder="e.g. jothambarasawatila@gmail.com, jotham.watila, or +2547..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600 shadow-xs"
                    required
                  />
                  {matchedUser && (
                    <div className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Profile: {matchedUser.fullName} ({matchedUser.role})</span>
                    </div>
                  )}
                </div>

                {/* Delivered First-Time Temporary Password Notice */}
                {firstTimePassword && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          First-Time Temporary Password (Delivered by Portal)
                        </span>
                        {showFirstTimePassword ? (
                          <span className="font-mono text-xs font-black text-emerald-900 tracking-wider">
                            {firstTimePassword}
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-400">
                            ••••••••••••••••
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowFirstTimePassword(!showFirstTimePassword)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-600 hover:text-slate-900 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {showFirstTimePassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showFirstTimePassword ? 'Hide' : 'Reveal'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(firstTimePassword);
                          setCopiedFirstTimePassword(true);
                          setTimeout(() => setCopiedFirstTimePassword(false), 2500);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedFirstTimePassword ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedFirstTimePassword ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Enter 6-Digit Validation OTP retrieved from Inbox:
                    </label>
                    <button
                      type="button"
                      onClick={onOpenInbox}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Inbox className="w-3 h-3" />
                      <span>Retrieve from Inbox</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''));
                      setOtpError(null);
                    }}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-red-600 rounded-xl text-center text-xl font-black font-mono tracking-widest text-slate-900 focus:outline-none shadow-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Check your Email, SMS, or WhatsApp inbox for the 6-digit code sent upon teacher registration.
                  </p>
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {resendNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendNotice}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || enteredOtp.length !== 6}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <span>Validating OTP Code...</span>
                  ) : (
                    <>
                      <span>Validate Registration OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendOtp}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:text-slate-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code to Inbox'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SET PERMANENT PASSWORD */}
          {currentStep === 2 && (
            <form onSubmit={handleSetPassword} className="space-y-5 animate-in fade-in">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    Registration OTP Successfully Validated!
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Now create your permanent password to access the {targetSchool?.schoolName || 'school'} portal.
                  </div>
                </div>
              </div>

              {/* Quick Apply Delivered Password */}
              {firstTimePassword && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-emerald-950 block">Delivered Temporary Password Available</span>
                    <span className="text-[11px] text-slate-500">Apply the strong temporary password delivered by the portal.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPassword(firstTimePassword);
                      setConfirmPassword(firstTimePassword);
                      setPasswordError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply Delivered Password
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Permanent Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      placeholder="Enter minimum 12-character strong password"
                      className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-red-600 shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Permanent Password:
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Re-enter identical password"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-red-600 shadow-xs"
                    required
                  />
                  {confirmPassword && (
                    <div className="mt-1 text-[11px] font-bold">
                      {passwordsMatch ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-red-600">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-700">Security Criteria Checklist:</div>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <span className={newPassword.length >= 12 ? 'text-emerald-700 font-bold' : ''}>
                      {newPassword.length >= 12 ? '✓' : '•'} At least 12 characters
                    </span>
                    <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-700 font-bold' : ''}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '•'} Uppercase letter (A-Z)
                    </span>
                    <span className={/[a-z]/.test(newPassword) ? 'text-emerald-700 font-bold' : ''}>
                      {/[a-z]/.test(newPassword) ? '✓' : '•'} Lowercase letter (a-z)
                    </span>
                    <span className={/[0-9]/.test(newPassword) ? 'text-emerald-700 font-bold' : ''}>
                      {/[0-9]/.test(newPassword) ? '✓' : '•'} Number digit (0-9)
                    </span>
                    <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-emerald-700 font-bold' : ''}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? '✓' : '•'} Special symbol (@#$%...)
                    </span>
                  </div>
                </div>

                {/* Accept terms */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded text-red-700 focus:ring-red-600"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I acknowledge that I am registered under <strong>{targetSchool?.schoolName || 'this school'}</strong>, agree to adhere to the institutional Acceptable Use Policy, and will keep my credentials confidential.
                  </span>
                </label>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Back to OTP
                </button>
                <button
                  type="submit"
                  disabled={isSettingPassword || !passwordValidation.isValid || !passwordsMatch || !acceptedTerms}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSettingPassword ? (
                    <span>Saving Password &amp; Activating Account...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Save Password &amp; Activate Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ACTIVATION COMPLETE & ACCESS SCHOOL PORTAL */}
          {currentStep === 3 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Registration Validated &amp; Password Set!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Congratulations! Your teacher account for <strong>{matchedUser?.fullName}</strong> has been fully validated and activated at <strong>{targetSchool?.schoolName || 'your registered school'}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">School Portal:</span>
                  <span className="font-bold text-slate-900">{targetSchool?.schoolName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Teacher Username:</span>
                  <span className="font-bold font-mono text-slate-900">{matchedUser?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Role:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                    {matchedUser?.role || 'TEACHER'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <span className="font-bold text-emerald-700">ACTIVE</span>
                </div>
              </div>

              <div className="pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleEnterSchoolPortal}
                  className="w-full py-3.5 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <School className="w-4 h-4 text-red-200" />
                  <span>Access {targetSchool?.schoolName || 'School'} Portal Now</span>
                  <ArrowRight className="w-4 h-4 text-red-200" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>JJSAK Section 7 Teacher Account Governance</span>
          <span>Single-use OTP verification required</span>
        </div>
      </div>
    </div>
  );
};
