import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Smartphone,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { User, SchoolTenant, JWTSession } from '../../types';
import { FirstTimeStaffActivationModal } from './FirstTimeStaffActivationModal';
import { AccountRecoveryModal } from './AccountRecoveryModal';
import { HelpSupportModal } from './HelpSupportModal';
import { OrganizationalProfileScreen } from '../launchFlow/OrganizationalProfileScreen';
import { staffAuthOtpSecurityService } from '../../services/staffAuthOtpSecurityService';
import { otpDeliveryService } from '../../services/otpDeliveryService';
import {
  ActiveAuthSession,
  OtpDeliveryReceipt,
  SECURITY_CONSTANTS,
} from '../../types/staffAuthSecurity';

interface SecureInstitutionalLoginScreenProps {
  users: User[];
  tenants: SchoolTenant[];
  activeTenantId: string;
  onLoginSuccess: (user: User, tenant: SchoolTenant, jwtSession: JWTSession) => void;
  onUpdateUser?: (updatedUser: User) => void;
  onLogAudit: (action: any, details: string, before?: string, after?: string) => void;
  onTriggerAlert?: (title: string, desc: string, severity: 'HIGH' | 'MEDIUM' | 'LOW') => void;
}

export const SecureInstitutionalLoginScreen: React.FC<SecureInstitutionalLoginScreenProps> = ({
  users,
  tenants,
  activeTenantId,
  onLoginSuccess,
  onUpdateUser,
  onLogAudit,
  onTriggerAlert,
}) => {
  // JJSAK-AUTH-PORTAL-001 Section 2: Application Launch Display
  // Opens the approved Organisational Profile / Welcome Display first with public info only
  const [viewMode, setViewMode] = useState<'WELCOME_PROFILE' | 'LOGIN'>('WELCOME_PROFILE');

  // Step 1: Credential Submission State
  const [institutionUsername, setInstitutionUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Single Continuous Authentication Session State (Section 3.1 & 3.3)
  const [authSession, setAuthSession] = useState<ActiveAuthSession | null>(null);
  const [deliveryReceipt, setDeliveryReceipt] = useState<OtpDeliveryReceipt | null>(null);
  // State to track OTP sent status (JJSAK-AUTH-OTP-OWNER-004)
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Live Timer States (5-minute validity & 30-second cooldown)
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState<number>(0);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);

  // Lockout State (Section 5)
  const [lockoutBanner, setLockoutBanner] = useState<{
    isLocked: boolean;
    remainingSeconds: number;
    trigger?: string;
    reason?: string;
  }>({
    isLocked: false,
    remainingSeconds: 0,
  });

  // Tenant Resolution State (Transition Animation)
  const [tenantResolutionState, setTenantResolutionState] = useState<{
    resolving: boolean;
    tenantDomain?: string;
    stageText?: string;
  }>({
    resolving: false,
  });

  // Sub-Modals
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Check active lockouts on load or when identifier changes
  useEffect(() => {
    if (!institutionUsername.trim()) return;
    const lock = staffAuthOtpSecurityService.checkActiveLockout(institutionUsername.trim());
    if (lock) {
      const remainingSec = Math.max(0, Math.ceil((lock.expiresAt - Date.now()) / 1000));
      setLockoutBanner({
        isLocked: true,
        remainingSeconds: remainingSec,
        trigger: lock.trigger,
        reason: lock.reason,
      });
    } else {
      setLockoutBanner({ isLocked: false, remainingSeconds: 0 });
    }
  }, [institutionUsername]);

  // Lockout Countdown Timer Effect
  useEffect(() => {
    if (!lockoutBanner.isLocked || lockoutBanner.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutBanner((prev) => {
        const next = prev.remainingSeconds - 1;
        if (next <= 0) {
          return { isLocked: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: next };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutBanner.isLocked, lockoutBanner.remainingSeconds]);

  // OTP Validity Countdown Timer Effect (5 Minutes / 300 Seconds - Section 4.2)
  useEffect(() => {
    if (!authSession || otpRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setOtpRemainingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setErrorMessage('One-Time Password has expired. Please request a new code.');
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [authSession, otpRemainingSeconds]);

  // Resend Cooldown Timer Effect (30 Seconds - Section 4.5)
  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldownSeconds]);

  // =========================================================================
  // STEP 1 & 2: CREDENTIAL SUBMISSION AND VALIDATION (Section 3.2)
  // =========================================================================
  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutBanner.isLocked) {
      setErrorMessage(`Account temporarily locked (${lockoutBanner.trigger}). Please wait.`);
      return;
    }

    const cleanIdentifier = institutionUsername.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Invalid Institution Username or Password');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const result = staffAuthOtpSecurityService.validateCredentialsAndInitiateSession({
        identifier: cleanIdentifier,
        password: cleanPassword,
        users,
        tenants,
        activeTenantId,
      });

      setIsAuthenticating(false);

      if (!result.success || !result.session || !result.receipt) {
        if (result.isLocked && result.lockout) {
          const remainingSec = Math.max(0, Math.ceil((result.lockout.expiresAt - Date.now()) / 1000));
          setLockoutBanner({
            isLocked: true,
            remainingSeconds: remainingSec,
            trigger: result.lockout.trigger,
            reason: result.lockout.reason,
          });
          setErrorMessage(result.errorMessage || 'Account temporarily locked due to security policy.');
          if (onTriggerAlert) {
            onTriggerAlert(
              `Lockout Triggered (${result.lockout.trigger})`,
              `Authentication temporarily throttled for ${result.lockout.durationMinutes} minutes.`,
              'HIGH'
            );
          }
        } else {
          setErrorMessage(result.errorMessage || 'Invalid Institution Username or Password');
        }
        return;
      }

      // Step 3: Call otpDeliveryService.sendOTP after successful password validation (JJSAK-AUTH-OTP-OWNER-004)
      otpDeliveryService.sendOTP({
        userId: result.session.user.id,
        userName: result.session.user.fullName || result.session.user.username,
        role: result.session.user.role,
        email: result.session.user.email || (cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@jjsak.internal`),
        phone: result.session.user.phoneNumber,
        channel: result.receipt.channel,
        purpose: 'Institutional Staff Authentication',
      }).catch((err) => {
        console.warn('otpDeliveryService notification logged:', err);
      });

      // Transition to Step 5: Continuous OTP Verification Session (Section 3.1 & 3.3)
      setAuthSession(result.session);
      setDeliveryReceipt(result.receipt);
      setIsOtpSent(true);
      setOtpRemainingSeconds(SECURITY_CONSTANTS.OTP_VALIDITY_SECONDS);
      setResendCooldownSeconds(SECURITY_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS);
      setOtpCode('');
    }, 600);
  };

  // =========================================================================
  // STEP 5: OTP VERIFICATION (Section 3.2, 4.2, 4.4, 5.1)
  // =========================================================================
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authSession) return;
    setErrorMessage(null);

    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit One-Time Password.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      const result = staffAuthOtpSecurityService.verifyOtp({
        sessionId: authSession.sessionId,
        otpCode: cleanOtp,
      });

      // Synchronize single-use token consumption in otpDeliveryService
      otpDeliveryService.verifyOTP(cleanOtp, authSession.sessionId);

      setIsVerifyingOtp(false);

      if (!result.success) {
        if (result.isLocked) {
          // Trigger A Lockout activated
          const remainingSec = result.lockoutExpiresAt
            ? Math.max(0, Math.ceil((result.lockoutExpiresAt - Date.now()) / 1000))
            : (result.lockoutDurationMinutes || 15) * 60;

          setLockoutBanner({
            isLocked: true,
            remainingSeconds: remainingSec,
            trigger: result.lockoutTrigger,
            reason: result.errorMessage,
          });
          setAuthSession(null);
          setDeliveryReceipt(null);
          setIsOtpSent(false);
          setErrorMessage(result.errorMessage || 'Authentication session locked after 5 failed attempts.');
          if (onTriggerAlert) {
            onTriggerAlert(
              `Lockout Enforced (${result.lockoutTrigger || 'TRIGGER_A'})`,
              `5 consecutive failed OTP attempts. Gateway locked for 15 minutes.`,
              'HIGH'
            );
          }
        } else {
          setErrorMessage(result.errorMessage || 'Invalid One-Time Password.');
        }
        return;
      }

      // Step 6: Session Established! Call handleLoginSuccess after OTP verification
      handleLoginSuccess(result.user!, result.tenant!, result.jwtSession);
    }, 500);
  };

  // =========================================================================
  // OTP RESEND (Section 4.5 & 5.2 Trigger B)
  // =========================================================================
  const handleResendOtp = () => {
    if (!authSession || resendCooldownSeconds > 0) return;
    setErrorMessage(null);
    setIsResending(true);

    setTimeout(() => {
      const result = staffAuthOtpSecurityService.resendOtp({
        sessionId: authSession.sessionId,
      });

      // Also trigger otpDeliveryService resend
      otpDeliveryService.sendOTP({
        userId: authSession.user.id,
        userName: authSession.user.fullName || authSession.user.username,
        role: authSession.user.role,
        email: authSession.user.email,
        phone: authSession.user.phoneNumber,
        channel: deliveryReceipt?.channel || 'EMAIL',
        purpose: 'Institutional Staff Authentication Resend',
      }).catch((err) => {
        console.warn('otpDeliveryService resend logged:', err);
      });

      setIsResending(false);

      if (!result.success) {
        if (result.isLocked) {
          // Trigger B Lockout activated (exceeded 3 resends)
          setLockoutBanner({
            isLocked: true,
            remainingSeconds: (result.lockoutDurationMinutes || 15) * 60,
            trigger: result.lockoutTrigger,
            reason: result.errorMessage,
          });
          setAuthSession(null);
          setDeliveryReceipt(null);
          setIsOtpSent(false);
          setErrorMessage(result.errorMessage || 'Lockout activated due to excessive OTP resends.');
          if (onTriggerAlert) {
            onTriggerAlert(
              'Excessive Resends Throttled (TRIGGER_B)',
              'Maximum 3 OTP resends exceeded. Gateway locked for 15 minutes.',
              'HIGH'
            );
          }
        } else {
          setErrorMessage(result.errorMessage || 'Failed to resend OTP.');
        }
        return;
      }

      if (result.receipt) {
        setDeliveryReceipt(result.receipt);
        setIsOtpSent(true);
        setOtpRemainingSeconds(SECURITY_CONSTANTS.OTP_VALIDITY_SECONDS);
        setResendCooldownSeconds(SECURITY_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS);
        setOtpCode('');
      }
    }, 400);
  };

  // =========================================================================
  // SUCCESSFUL SESSION COMPLETION (Step 6)
  // =========================================================================
  const handleLoginSuccess = (user: User, tenant: SchoolTenant, jwt: any) => {
    completeSuccessfulLogin(user, tenant, jwt);
  };

  const completeSuccessfulLogin = (user: User, tenant: SchoolTenant, jwt: any) => {
    const tenantSubdomain = tenant.subdomain || tenant.schoolCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tenantDomain = `${tenantSubdomain}.jjsak.com`;

    setTenantResolutionState({
      resolving: true,
      tenantDomain,
      stageText: 'Verifying Tenant Perimeter & Session Security...',
    });

    setTimeout(() => {
      setTenantResolutionState({
        resolving: true,
        tenantDomain,
        stageText: `Connecting to ${tenantDomain}...`,
      });

      setTimeout(() => {
        onLogAudit(
          'LOGIN',
          `Institutional user authenticated securely under tenant [${tenant.schoolId}]. JWT token generated. Single continuous session completed.`,
          undefined,
          `Tenant: ${tenantDomain}`
        );

        setTenantResolutionState({ resolving: false });
        onLoginSuccess(user, tenant, jwt);
      }, 500);
    }, 500);
  };

  const handleActivationSuccess = (activatedUser: User) => {
    if (onUpdateUser) {
      onUpdateUser(activatedUser);
    }
    setInstitutionUsername(activatedUser.username);
    setPassword('');
    setErrorMessage(null);
  };

  if (viewMode === 'WELCOME_PROFILE') {
    return (
      <OrganizationalProfileScreen
        onContinueToLogin={() => setViewMode('LOGIN')}
      />
    );
  }

  return (
    <div
      id="secure-institutional-login-screen"
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden select-none"
    >
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header - Platform Identity & Public Profile Navigation */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C51E28] flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-950/50">
            J
          </div>
          <div>
            <span className="text-xs font-black tracking-wider text-white uppercase block">
              JJSAK CORE
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              National CBE Assessment Perimeter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setViewMode('WELCOME_PROFILE');
              setErrorMessage(null);
            }}
            title="Return to Public Welcome & Organisational Profile"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C51E28]" />
            <span>Welcome Profile</span>
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col">
          {/* Branding Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C51E28] to-red-900 p-0.5 shadow-xl shadow-red-950/60 mb-3 flex items-center justify-center text-white border border-red-500/40">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>

            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight uppercase">
              JJSAK SCHOOL ASSESSMENT SYSTEM
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
              Unified Institutional Authentication Gateway
            </p>
            <span className="mt-2 text-[10px] font-bold text-red-400/90 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-900/80">
              {authSession ? 'Step 5: OTP Verification' : 'Single Unified Workflow • ISO/IEC 27001'}
            </span>
          </div>

          {/* Locked Gateway Banner (Section 5) */}
          {lockoutBanner.isLocked && (
            <div className="mb-4 p-4 rounded-2xl bg-red-950/90 border border-red-800 text-red-200 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>Security Throttling Activated ({lockoutBanner.trigger})</span>
              </div>
              <p className="text-[11px] text-red-300/80 leading-relaxed">
                {lockoutBanner.reason || 'Authentication gateway temporarily locked according to JJSAK security specification.'}
              </p>
              <div className="mt-1 font-mono text-xs font-bold text-white bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-red-900/60 flex items-center justify-between">
                <span>Lockout expires in:</span>
                <span className="text-red-400">
                  {Math.floor(lockoutBanner.remainingSeconds / 60)}m {lockoutBanner.remainingSeconds % 60}s
                </span>
              </div>
            </div>
          )}

          {/* Failure Alert Banner - Anti-Enumeration Compliant */}
          {errorMessage && (
            <div
              id="login-failure-alert"
              className="mb-4 p-3.5 rounded-2xl bg-red-950/90 border border-red-800/90 text-red-200 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="font-semibold text-red-200 text-xs">{errorMessage}</div>
            </div>
          )}

          {/* Tenant Identification Resolving Animation */}
          {tenantResolutionState.resolving && (
            <div className="mb-4 p-4 rounded-2xl bg-slate-950 border border-red-900/50 flex flex-col items-center text-center gap-2 animate-in zoom-in-95">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {tenantResolutionState.stageText}
                </span>
                <span className="font-mono text-[11px] text-red-400 block mt-0.5">
                  https://{tenantResolutionState.tenantDomain}
                </span>
              </div>
            </div>
          )}

          {/* STEP 1 & 2: CREDENTIAL SUBMISSION (Entered ONCE - Section 3.1 & 3.3) */}
          {!isOtpSent || !authSession ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              {/* Institution Username / Staff Identifier Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Login Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="login-institution-username"
                    value={institutionUsername}
                    onChange={(e) => {
                      setInstitutionUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Username, Email, Mobile Phone, or Staff No."
                    disabled={lockoutBanner.isLocked || isAuthenticating}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28] transition disabled:opacity-50"
                    required
                    autoComplete="username"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    disabled={lockoutBanner.isLocked || isAuthenticating}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28] transition disabled:opacity-50"
                    required
                    autoComplete="current-password"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={lockoutBanner.isLocked || isAuthenticating}
                  className="w-full py-3.5 rounded-2xl bg-[#C51E28] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/70 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>AUTHENTICATE & GENERATE OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 5: OTP VERIFICATION (Zero-Exposure Policy & Locked Spec JJSAK-AUTH-PORTAL-001) */
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    {deliveryReceipt?.channel === 'EMAIL' ? (
                      <Mail className="w-4 h-4 text-[#C51E28]" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-[#C51E28]" />
                    )}
                    <span>Verification Code Sent</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 font-semibold">
                    Encrypted Gateway
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Please check your registered email address or phone number and enter the 6-digit verification code.
                </p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Destination:
                  </div>
                  <div className="text-white font-mono font-bold text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 break-all">
                    {deliveryReceipt?.maskedDestination || 'Registered Email / Mobile Phone'}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>Code Validity:</span>
                    <span className="text-red-400 font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(otpRemainingSeconds / 60)}:
                      {String(otpRemainingSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Resends Remaining:</span>
                    <span className="text-slate-300 font-mono">
                      {deliveryReceipt?.resendsRemaining} of {SECURITY_CONSTANTS.OTP_MAX_RESEND_ALLOWANCE}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6-Digit Verification Code Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  [ Enter 6-Digit Verification Code ]
                </label>
                <input
                  type="text"
                  id="otp-verification-input"
                  value={otpCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(clean);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter 6-Digit Verification Code"
                  maxLength={6}
                  disabled={lockoutBanner.isLocked || isVerifyingOtp}
                  className="w-full px-3.5 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-center text-xl font-mono font-black tracking-widest text-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                  required
                  autoFocus
                />
              </div>

              {/* Action Buttons (Section 7 Allowed Buttons: Verify & Enter, Resend Code, Change Account) */}
              <div className="space-y-2">
                <button
                  type="submit"
                  id="otp-verify-submit-btn"
                  disabled={lockoutBanner.isLocked || isVerifyingOtp || otpCode.length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-[#C51E28] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/70 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>VERIFY & ENTER</span>
                    </>
                  )}
                </button>

                {/* Secondary Action Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSession(null);
                      setDeliveryReceipt(null);
                      setIsOtpSent(false);
                      setOtpCode('');
                      setErrorMessage(null);
                    }}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700/60"
                  >
                    Change Account
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={
                      resendCooldownSeconds > 0 ||
                      isResending ||
                      Boolean(deliveryReceipt && deliveryReceipt.resendsRemaining <= 0)
                    }
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldownSeconds > 0
                        ? `Resend in ${resendCooldownSeconds}s`
                        : deliveryReceipt && deliveryReceipt.resendsRemaining <= 0
                        ? 'Resend Limit Reached'
                        : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Secondary Portal Links */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <button
            type="button"
            onClick={() => setIsFirstTimeModalOpen(true)}
            className="hover:text-white transition cursor-pointer"
          >
            First-Time Staff Activation
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => setIsRecoveryModalOpen(true)}
            className="hover:text-white transition cursor-pointer"
          >
            Forgot Password?
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="hover:text-white transition cursor-pointer"
          >
            Support
          </button>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-2">
        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
          JJSAK CBE Educational Platform • Multi-Tenant Isolation Active • ISO/IEC 27001 Certified
        </p>
      </div>

      {/* Sub-Modals */}
      <FirstTimeStaffActivationModal
        isOpen={isFirstTimeModalOpen}
        users={users}
        school={tenants.find((t) => t.schoolId === activeTenantId)}
        onClose={() => setIsFirstTimeModalOpen(false)}
        onActivationSuccess={handleActivationSuccess}
      />

      <AccountRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />

      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
