import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  GraduationCap,
  Inbox,
} from 'lucide-react';
import { User, SchoolTenant, JWTSession } from '../../types';
import { FirstTimeStaffActivationModal } from './FirstTimeStaffActivationModal';
import { AccountRecoveryModal } from './AccountRecoveryModal';
import { HelpSupportModal } from './HelpSupportModal';
import { OrganizationalProfileScreen } from '../launchFlow/OrganizationalProfileScreen';
import { staffAuthOtpSecurityService } from '../../services/staffAuthOtpSecurityService';
import { otpDeliveryService } from '../../services/otpDeliveryService';
import { ownerOtpDeliveryService } from '../../services/ownerOtpDeliveryService';
import { carrierInboxService } from '../../services/carrierInboxService';
import { generateJWTSession } from '../../utils/securityEngine';
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
  onOpenCarrierInbox?: () => void;
  onOpenTeacherValidation?: (otp?: string, username?: string, schoolId?: string) => void;
  onOpenSchoolActivation?: (params?: {
    schoolId?: string;
    schoolName?: string;
    registrationNumber?: string;
    schoolAccount?: string;
    otp?: string;
    temporaryPassword?: string;
  }) => void;
}

export const SecureInstitutionalLoginScreen: React.FC<SecureInstitutionalLoginScreenProps> = ({
  users,
  tenants,
  activeTenantId,
  onLoginSuccess,
  onUpdateUser,
  onLogAudit,
  onTriggerAlert,
  onOpenCarrierInbox,
  onOpenTeacherValidation,
  onOpenSchoolActivation,
}) => {
  // JJSAK-AUTH-PORTAL-001 Section 2: Application Launch Display
  // Opens the approved Organisational Profile / Welcome Display first with public info only
  const [viewMode, setViewMode] = useState<'WELCOME_PROFILE' | 'LOGIN'>(() => {
    try {
      if (sessionStorage.getItem('jjsak_prefill_username')) {
        return 'LOGIN';
      }
    } catch {
      // ignore
    }
    return 'WELCOME_PROFILE';
  });

  // Step 1: Credential Submission State
  const [institutionUsername, setInstitutionUsername] = useState(() => {
    try {
      const prefill = sessionStorage.getItem('jjsak_prefill_username');
      if (prefill) {
        sessionStorage.removeItem('jjsak_prefill_username');
        return prefill;
      }
    } catch {
      // ignore
    }
    return '';
  });
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
  const [detectedInboxOtp, setDetectedInboxOtp] = useState<string | null>(null);
  const [isRetrievingOtp, setIsRetrievingOtp] = useState<boolean>(false);

  // Auto-listen for Carrier Inbox autofill events
  useEffect(() => {
    const handleAutofill = (e: any) => {
      if (e.detail?.otp) {
        setOtpCode(e.detail.otp.trim());
        setDetectedInboxOtp(e.detail.otp.trim());
        if (errorMessage) setErrorMessage(null);
      }
    };
    window.addEventListener('jjsak_autofill_otp', handleAutofill);
    return () => window.removeEventListener('jjsak_autofill_otp', handleAutofill);
  }, [errorMessage]);

  // Continuously check carrier inbox for active OTP when on OTP verification step
  const checkInboxOtp = useCallback(async () => {
    if (!isOtpSent) return;
    try {
      await carrierInboxService.syncWithBackend();
      const targetUser = authSession?.user;
      const targetQuery =
        targetUser?.email ||
        targetUser?.username ||
        institutionUsername ||
        'jothambarasawatila@gmail.com';
      const channel = deliveryReceipt?.channel;
      const found = carrierInboxService.getLatestOtpForUser(targetQuery, channel as any);
      if (found && found.otp) {
        setDetectedInboxOtp(found.otp);
      }
    } catch {
      // ignore
    }
  }, [isOtpSent, authSession, institutionUsername, deliveryReceipt?.channel]);

  useEffect(() => {
    if (isOtpSent) {
      checkInboxOtp();
      const interval = setInterval(checkInboxOtp, 2500);
      return () => clearInterval(interval);
    } else {
      setDetectedInboxOtp(null);
    }
  }, [isOtpSent, checkInboxOtp]);

  const [inboxNotice, setInboxNotice] = useState<string | null>(null);
  const [isSwitchingChannel, setIsSwitchingChannel] = useState<boolean>(false);

  const handleRetrieveFromInbox = async () => {
    setIsRetrievingOtp(true);
    try {
      await carrierInboxService.syncWithBackend();
      const targetUser = authSession?.user;
      const targetQuery =
        targetUser?.email ||
        targetUser?.username ||
        institutionUsername ||
        'jothambarasawatila@gmail.com';
      const channel = deliveryReceipt?.channel;
      const found = carrierInboxService.getLatestOtpForUser(targetQuery, channel as any);
      if (found && found.otp) {
        setOtpCode(found.otp);
        setDetectedInboxOtp(found.otp);
        setErrorMessage(null);
        setInboxNotice(`✓ Verification code retrieved from ${found.channel} inbox (${found.recipientAddress})`);
        setTimeout(() => setInboxNotice(null), 4000);
      } else {
        const latestEmail = carrierInboxService.getLatestEmailMessage();
        if (latestEmail && latestEmail.otpCode) {
          setOtpCode(latestEmail.otpCode);
          setDetectedInboxOtp(latestEmail.otpCode);
          setErrorMessage(null);
          setInboxNotice(`✓ Verification code retrieved from ${latestEmail.channel} inbox (${latestEmail.recipientAddress})`);
          setTimeout(() => setInboxNotice(null), 4000);
        } else if (onOpenCarrierInbox) {
          onOpenCarrierInbox();
        }
      }
    } finally {
      setIsRetrievingOtp(false);
    }
  };

  // Switch delivery channel (EMAIL <-> SMS <-> WHATSAPP vice versa)
  const handleSwitchChannel = async (newChannel: 'EMAIL' | 'SMS' | 'WHATSAPP') => {
    if (!authSession || isSwitchingChannel) return;
    if (deliveryReceipt?.channel === newChannel) return;

    setIsSwitchingChannel(true);
    setErrorMessage(null);
    setInboxNotice(`Switching OTP channel to ${newChannel}...`);

    const isOwner =
      authSession.user.role === 'SUPER_ADMIN' ||
      authSession.user.role === 'SYSTEM_ADMIN' ||
      authSession.user.email?.toLowerCase() === 'jothambarasawatila@gmail.com' ||
      authSession.user.username?.toLowerCase().includes('jotham');

    try {
      let authoritativeSessionId = authSession.sessionId;
      let newMaskedDest = deliveryReceipt?.maskedDestination || '';
      let validitySecs = 300;
      let cooldownSecs = 30;

      if (isOwner) {
        const res = await ownerOtpDeliveryService.dispatchOwnerOtp(newChannel, 'OWNER_LOGIN');
        if (res.success && res.receipt) {
          authoritativeSessionId = res.receipt.sessionId;
          newMaskedDest = res.receipt.maskedDestination;
          validitySecs = res.receipt.validitySeconds || 300;
          cooldownSecs = res.receipt.cooldownSeconds || 30;
        } else {
          setErrorMessage(res.errorMessage || `Failed to switch to ${newChannel}.`);
          setIsSwitchingChannel(false);
          setInboxNotice(null);
          return;
        }
      } else {
        const resp = await fetch('/api/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authSession.user.id,
            userType: 'INSTITUTIONAL',
            identifier: authSession.identifier,
            email: authSession.user.email,
            phone: authSession.user.phoneNumber,
            channel: newChannel,
            purpose: 'Institutional Staff Authentication Channel Switch',
            role: authSession.user.role,
            userName: authSession.user.fullName || authSession.user.username,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          authoritativeSessionId = data.sessionId || authSession.sessionId;
          newMaskedDest = data.maskedDestination || newMaskedDest;
          validitySecs = data.expiresInSeconds || 300;
          cooldownSecs = data.cooldownSeconds || 30;
        } else {
          setErrorMessage(data.message || `Failed to switch to ${newChannel}.`);
          setIsSwitchingChannel(false);
          setInboxNotice(null);
          return;
        }
      }

      setAuthSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sessionId: authoritativeSessionId,
          backendSessionId: authoritativeSessionId,
          channel: newChannel as any,
          maskedDestination: newMaskedDest,
        };
      });

      setDeliveryReceipt((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sessionId: authoritativeSessionId,
          channel: newChannel as any,
          maskedDestination: newMaskedDest,
          validitySeconds: validitySecs,
          cooldownSeconds: cooldownSecs,
          expiresAt: Date.now() + validitySecs * 1000,
        };
      });

      setOtpRemainingSeconds(validitySecs);
      setResendCooldownSeconds(cooldownSecs);
      setOtpCode('');
      setDetectedInboxOtp(null);

      // Force background sync with carrier inbox
      await carrierInboxService.syncWithBackend();

      setInboxNotice(`✓ Channel switched! New verification code dispatched to your ${newChannel} (${newMaskedDest})`);
      setTimeout(() => setInboxNotice(null), 5000);
    } catch (err: any) {
      setErrorMessage(`Error switching delivery channel: ${err.message || err}`);
    } finally {
      setIsSwitchingChannel(false);
    }
  };

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
  const handleCredentialSubmit = async (e: React.FormEvent) => {
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

    const result = staffAuthOtpSecurityService.validateCredentialsAndInitiateSession({
      identifier: cleanIdentifier,
      password: cleanPassword,
      users,
      tenants,
      activeTenantId,
    });

    if (!result.success || !result.session || !result.receipt) {
      setIsAuthenticating(false);
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

    const targetUser = result.session.user;
    const isOwner =
      targetUser.role === 'SUPER_ADMIN' ||
      targetUser.role === 'SYSTEM_ADMIN' ||
      targetUser.email?.toLowerCase() === 'jothambarasawatila@gmail.com' ||
      targetUser.username?.toLowerCase().includes('jotham') ||
      (targetUser.phoneNumber && targetUser.phoneNumber.replace(/\D/g, '').endsWith('741478813'));

    let authoritativeSessionId = result.session.sessionId;
    let finalReceipt: OtpDeliveryReceipt = result.receipt;

    try {
      if (isOwner) {
        const dispatchRes = await ownerOtpDeliveryService.dispatchOwnerOtp(
          result.receipt.channel === 'SMS' ? 'SMS' : 'EMAIL',
          'OWNER_LOGIN'
        );
        if (dispatchRes.success && dispatchRes.receipt) {
          authoritativeSessionId = dispatchRes.receipt.sessionId;
          finalReceipt = {
            ...result.receipt,
            sessionId: dispatchRes.receipt.sessionId,
            channel: dispatchRes.receipt.channel,
            maskedDestination: dispatchRes.receipt.maskedDestination,
            expiresAt: dispatchRes.receipt.expiresAt,
            validitySeconds: dispatchRes.receipt.validitySeconds,
            cooldownSeconds: dispatchRes.receipt.cooldownSeconds,
            deliveryGatewayStatus: 'DELIVERED_TO_REGISTERED_DEVICE',
            message: dispatchRes.receipt.message,
          };
        } else {
          setIsAuthenticating(false);
          setErrorMessage(dispatchRes.errorMessage || 'Failed to dispatch verification code to owner channel.');
          return;
        }
      } else {
        // Institutional Staff: Dispatch via backend /api/otp/request
        const resp = await fetch('/api/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUser.id,
            userType: 'INSTITUTIONAL',
            identifier: cleanIdentifier,
            email: targetUser.email || (cleanIdentifier.includes('@') ? cleanIdentifier : undefined),
            phone: targetUser.phoneNumber,
            channel: result.receipt.channel,
            purpose: 'Institutional Staff Authentication',
            role: targetUser.role,
            userName: targetUser.fullName || targetUser.username,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success && data.sessionId) {
          authoritativeSessionId = data.sessionId;
          finalReceipt = {
            ...result.receipt,
            sessionId: data.sessionId,
            channel: data.channel || result.receipt.channel,
            maskedDestination: data.maskedDestination || result.receipt.maskedDestination,
            expiresAt: data.expiresAt || (Date.now() + 300000),
            validitySeconds: data.expiresInSeconds || 300,
            cooldownSeconds: data.cooldownSeconds || 30,
            deliveryGatewayStatus: 'DELIVERED_TO_REGISTERED_DEVICE',
            message: data.message || result.receipt.message,
          };
        }
      }
    } catch (err: any) {
      console.warn('Backend OTP dispatch notice:', err);
    }

    setIsAuthenticating(false);

    // Save active session with authoritative backend session ID
    setAuthSession({
      ...result.session,
      sessionId: authoritativeSessionId,
      backendSessionId: authoritativeSessionId,
    });
    setDeliveryReceipt(finalReceipt);
    setIsOtpSent(true);
    setOtpRemainingSeconds(finalReceipt.validitySeconds || SECURITY_CONSTANTS.OTP_VALIDITY_SECONDS);
    setResendCooldownSeconds(finalReceipt.cooldownSeconds || SECURITY_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS);
    setOtpCode('');
  };

  // =========================================================================
  // STEP 5: OTP VERIFICATION (Section 3.2, 4.2, 4.4, 5.1)
  // =========================================================================
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authSession) return;
    setErrorMessage(null);

    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit One-Time Password.');
      return;
    }

    setIsVerifyingOtp(true);

    const isOwner =
      authSession.user.role === 'SUPER_ADMIN' ||
      authSession.user.role === 'SYSTEM_ADMIN' ||
      authSession.user.email?.toLowerCase() === 'jothambarasawatila@gmail.com' ||
      authSession.user.username?.toLowerCase().includes('jotham');

    let isVerified = false;
    let verifyError: string | null = null;
    let attemptsRemaining: number | undefined = undefined;
    let isLocked = false;
    let lockDurationMinutes = 15;

    // 1. Authoritative Backend Verification
    const targetSessionId = authSession.backendSessionId || authSession.sessionId;
    try {
      if (isOwner) {
        const ownerVerify = await ownerOtpDeliveryService.verifyOwnerOtp(cleanOtp, targetSessionId);
        if (ownerVerify.success) {
          isVerified = true;
        } else {
          verifyError = ownerVerify.errorMessage || 'Invalid 6-digit verification code.';
          attemptsRemaining = ownerVerify.attemptsRemaining;
          if (verifyError?.toLowerCase().includes('lock')) isLocked = true;
        }
      } else if (targetSessionId) {
        const resp = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: targetSessionId,
            candidateCode: cleanOtp,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success && data.verified) {
          isVerified = true;
        } else {
          verifyError = data.message || 'Invalid One-Time Password.';
          attemptsRemaining = data.attemptsRemaining;
          if (data.locked || verifyError?.toLowerCase().includes('lock')) isLocked = true;
        }
      }
    } catch (err: any) {
      console.warn('Backend verification network notice:', err);
    }

    // 2. Fallback to local security service for demo/offline test accounts
    if (!isVerified && !isLocked) {
      const localResult = await staffAuthOtpSecurityService.verifyOtp({
        sessionId: authSession.sessionId,
        otpCode: cleanOtp,
      });
      if (localResult.success) {
        isVerified = true;
      } else if (!verifyError) {
        verifyError = localResult.errorMessage || 'Invalid One-Time Password.';
        isLocked = !!localResult.isLocked;
        if (localResult.lockoutDurationMinutes) lockDurationMinutes = localResult.lockoutDurationMinutes;
      }
    }

    // Also inform otpDeliveryService
    otpDeliveryService.verifyOTP(cleanOtp, targetSessionId);

    setIsVerifyingOtp(false);

    if (!isVerified) {
      if (isLocked) {
        setLockoutBanner({
          isLocked: true,
          remainingSeconds: lockDurationMinutes * 60,
          trigger: 'TRIGGER_A_OTP_FAILURES',
          reason: verifyError || 'Account locked after 5 consecutive failed attempts.',
        });
        setAuthSession(null);
        setDeliveryReceipt(null);
        setIsOtpSent(false);
        setErrorMessage(verifyError || 'Authentication session locked after 5 failed attempts.');
        if (onTriggerAlert) {
          onTriggerAlert(
            'Lockout Enforced (TRIGGER_A)',
            '5 consecutive failed OTP attempts. Gateway locked for 15 minutes.',
            'HIGH'
          );
        }
      } else {
        setErrorMessage(
          verifyError ||
            (attemptsRemaining !== undefined
              ? `Invalid One-Time Password. You have ${attemptsRemaining} attempt(s) remaining.`
              : 'Invalid One-Time Password.')
        );
      }
      return;
    }

    // STEP 6: SESSION ESTABLISHED!
    const activeSchool = authSession.tenant || tenants.find((t) => t.schoolId === activeTenantId) || {
      schoolId: 'sch-central-001',
      schoolCode: 'JJSAK-CENTRAL',
      schoolName: 'JJSAK Central Governance',
      status: 'ACTIVE' as const,
    };

    const jwt = generateJWTSession(
      authSession.user,
      activeSchool.schoolId,
      activeSchool.schoolName,
      authSession.channel === 'EMAIL' ? 'EMAIL_OTP' : 'SMS_OTP'
    );

    staffAuthOtpSecurityService.logAudit({
      userId: authSession.user.id,
      tenantId: activeSchool.schoolId,
      role: authSession.user.role,
      deviceInfo: navigator.userAgent || 'Web Browser',
      sourceIp: '127.0.0.1',
      eventType: 'OTP_VERIFICATION_SUCCESS',
      eventOutcome: 'SUCCESS',
      details: `OTP verified successfully for ${authSession.user.fullName} (${authSession.user.role}). Token invalidated.`,
    });

    handleLoginSuccess(authSession.user, activeSchool as any, jwt);
  };

  // =========================================================================
  // OTP RESEND (Section 4.5 & 5.2 Trigger B)
  // =========================================================================
  const handleResendOtp = async () => {
    if (!authSession || resendCooldownSeconds > 0) return;
    setErrorMessage(null);
    setIsResending(true);

    const isOwner =
      authSession.user.role === 'SUPER_ADMIN' ||
      authSession.user.role === 'SYSTEM_ADMIN' ||
      authSession.user.email?.toLowerCase() === 'jothambarasawatila@gmail.com' ||
      authSession.user.username?.toLowerCase().includes('jotham');

    let newSessionId = authSession.sessionId;

    try {
      if (isOwner) {
        const res = await ownerOtpDeliveryService.dispatchOwnerOtp(
          authSession.channel === 'SMS' ? 'SMS' : 'EMAIL',
          'OWNER_LOGIN'
        );
        if (res.success && res.receipt) {
          newSessionId = res.receipt.sessionId;
        } else {
          setIsResending(false);
          setErrorMessage(res.errorMessage || 'Failed to resend owner OTP.');
          return;
        }
      } else {
        const resp = await fetch('/api/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authSession.user.id,
            userType: 'INSTITUTIONAL',
            identifier: authSession.identifier,
            email: authSession.user.email,
            phone: authSession.user.phoneNumber,
            channel: authSession.channel,
            purpose: 'Institutional Staff Authentication Resend',
            role: authSession.user.role,
            userName: authSession.user.fullName || authSession.user.username,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success && data.sessionId) {
          newSessionId = data.sessionId;
        }
      }
    } catch (err: any) {
      console.warn('Backend OTP resend error:', err);
    }

    // Local tracking update
    const result = staffAuthOtpSecurityService.resendOtp({
      sessionId: authSession.sessionId,
    });

    setIsResending(false);

    if (!result.success && result.isLocked) {
      setLockoutBanner({
        isLocked: true,
        remainingSeconds: (result.lockoutDurationMinutes || 15) * 60,
        trigger: result.lockoutTrigger,
        reason: result.errorMessage,
      });
      setAuthSession(null);
      setDeliveryReceipt(null);
      setIsOtpSent(false);
      setErrorMessage(result.errorMessage || 'Authentication session locked due to excessive resend attempts.');
      return;
    }

    setAuthSession((prev) =>
      prev
        ? {
            ...prev,
            sessionId: newSessionId,
            backendSessionId: newSessionId,
            resendCount: prev.resendCount + 1,
            lastResendAt: Date.now(),
          }
        : null
    );
    setResendCooldownSeconds(SECURITY_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS);
    setOtpRemainingSeconds(SECURITY_CONSTANTS.OTP_VALIDITY_SECONDS);
    setOtpCode('');
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
                {/* Visual Governance Guidance on Identifier */}
                {institutionUsername.toLowerCase().includes('jotham') && !institutionUsername.includes('.teacher') && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-950/70 border border-amber-800/60 text-[11px] text-amber-200 flex items-start gap-2 animate-in fade-in">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300 font-bold">Platform Owner Account</strong>
                      <span className="text-[10px] text-amber-200/90 leading-tight block mt-0.5">
                        Authenticates strictly to Platform Governance. School portal access requires separate school-registered credentials.
                      </span>
                    </div>
                  </div>
                )}
                {institutionUsername.includes('.teacher') && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-[11px] text-emerald-200 flex items-start gap-2 animate-in fade-in">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-emerald-300 font-bold">School Operational Account</strong>
                      <span className="text-[10px] text-emerald-200/90 leading-tight block mt-0.5">
                        Authenticating to School Portal using separate credentials registered by the school.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Password
                  </label>
                  {institutionUsername && carrierInboxService.getLatestFirstTimePasswordForUser(institutionUsername) && (
                    <button
                      type="button"
                      onClick={() => {
                        const delivered = carrierInboxService.getLatestFirstTimePasswordForUser(institutionUsername);
                        if (delivered) {
                          setPassword(delivered);
                          if (errorMessage) setErrorMessage(null);
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Use Delivered Password</span>
                    </button>
                  )}
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
              {/* Interactive Delivery Channel Switcher (EMAIL <-> SMS <-> WHATSAPP vice versa) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Delivery Channel (Switch Anytime):
                  </span>
                  {isSwitchingChannel && (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Switching channel...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('EMAIL')}
                    disabled={isSwitchingChannel || deliveryReceipt?.channel === 'EMAIL'}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      deliveryReceipt?.channel === 'EMAIL'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    } disabled:cursor-not-allowed`}
                    title="Send OTP to registered Email address"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('SMS')}
                    disabled={isSwitchingChannel || deliveryReceipt?.channel === 'SMS'}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      deliveryReceipt?.channel === 'SMS'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    } disabled:cursor-not-allowed`}
                    title="Send OTP to registered mobile SMS"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('WHATSAPP')}
                    disabled={isSwitchingChannel || deliveryReceipt?.channel === 'WHATSAPP'}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      deliveryReceipt?.channel === 'WHATSAPP'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    } disabled:cursor-not-allowed`}
                    title="Send OTP to registered WhatsApp number"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    {deliveryReceipt?.channel === 'EMAIL' ? (
                      <Mail className="w-4 h-4 text-[#C51E28]" />
                    ) : deliveryReceipt?.channel === 'SMS' ? (
                      <Smartphone className="w-4 h-4 text-[#C51E28]" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-[#C51E28]" />
                    )}
                    <span>Verification Code Sent via {deliveryReceipt?.channel || 'EMAIL'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 font-semibold">
                    Encrypted Gateway
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {deliveryReceipt?.channel === 'EMAIL'
                    ? 'Please check your registered email inbox and enter the 6-digit verification code.'
                    : deliveryReceipt?.channel === 'SMS'
                    ? 'Please check your SMS messages and enter the 6-digit verification code.'
                    : 'Please check your WhatsApp chat and enter the 6-digit verification code.'}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Destination ({deliveryReceipt?.channel || 'EMAIL'}):
                  </div>
                  <div className="text-white font-mono font-bold text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 break-all">
                    {deliveryReceipt?.maskedDestination || 'Registered Address'}
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

              {/* Zero-Exposure: Inbox Delivery Notification Banner (OTP hidden until retrieved) */}
              {detectedInboxOtp && !otpCode && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/60 border border-amber-500/50 flex items-center justify-between gap-3 shadow-xl shadow-red-950/40 animate-in fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wide block">
                        Code Dispatched to {deliveryReceipt?.channel || 'Inbox'}:
                      </span>
                      <span className="text-slate-300 font-mono text-xs truncate block">
                        {deliveryReceipt?.maskedDestination || 'Verified address'} • Code Protected (••••••)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(detectedInboxOtp);
                      if (errorMessage) setErrorMessage(null);
                      setInboxNotice(`✓ OTP retrieved from ${deliveryReceipt?.channel || 'inbox'} address`);
                      setTimeout(() => setInboxNotice(null), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer shadow-md shadow-red-950/60"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Retrieve from Inbox</span>
                  </button>
                </div>
              )}

              {/* Inbox notice alert if recently retrieved or switched */}
              {inboxNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{inboxNotice}</span>
                </div>
              )}

              {/* 6-Digit Verification Code Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    [ Enter 6-Digit Verification Code ]
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetrieveFromInbox}
                      disabled={isRetrievingOtp}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Sync and retrieve OTP directly from inbox"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrievingOtp ? 'animate-spin' : ''}`} />
                      <span>{isRetrievingOtp ? 'Retrieving...' : 'Retrieve from Inbox'}</span>
                    </button>
                    {onOpenCarrierInbox && (
                      <button
                        type="button"
                        onClick={onOpenCarrierInbox}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>Open Inboxes</span>
                      </button>
                    )}
                  </div>
                </div>
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
          {onOpenSchoolActivation && (
            <>
              <button
                type="button"
                id="login-school-activation-btn"
                onClick={() => onOpenSchoolActivation()}
                className="text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1 font-bold"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Activate Registered School &amp; Onboard Staff</span>
              </button>
              <span className="text-slate-700 hidden sm:inline">•</span>
            </>
          )}

          {onOpenTeacherValidation && (
            <>
              <button
                type="button"
                id="login-teacher-validation-btn"
                onClick={() => onOpenTeacherValidation()}
                className="text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1 font-bold"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Validate Teacher &amp; Set Password</span>
              </button>
              <span className="text-slate-700 hidden sm:inline">•</span>
            </>
          )}

          {onOpenCarrierInbox && (
            <>
              <button
                type="button"
                id="login-carrier-inbox-btn"
                onClick={onOpenCarrierInbox}
                className="text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1 font-bold"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>SMS / WhatsApp / Email Inbox</span>
              </button>
              <span className="text-slate-700 hidden sm:inline">•</span>
            </>
          )}

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
