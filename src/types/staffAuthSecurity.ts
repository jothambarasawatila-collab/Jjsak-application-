import { User, SchoolTenant, UserRole } from './index';

/**
 * JJSAK Staff Onboarding, Activation, Authentication and OTP Security Types
 * 
 * Enforces Master Specification Requirements:
 * - Section 1: Purpose and Applicable Roles
 * - Section 2: School Staff Management (School Ownership, No SuperAdmin routine onboarding, Tenant Isolation)
 * - Section 3: Single Authentication Workflow (Unified, Continuous Session, Zero Duplicate Login)
 * - Section 4: OTP Security Requirements (Zero Exposure, 5-minute validity, Single-use, 5 max attempts, 30s cooldown, max 3 resends)
 * - Section 5: Lockout Rules (Trigger A: 15 min on 5 fails; Trigger B: 15 min on 4th resend; Trigger C: 24 hrs on 3 lockouts in 24h)
 * - Section 6: Counter Reset Rules
 * - Section 7: Channel Security Controls (Verified Email, Phone, WhatsApp, Authenticator App)
 * - Section 8: OTP Storage & Cryptographic Protection (Salted SHA-256, Plaintext strictly forbidden)
 * - Section 9: Authentication Audit Logging (Zero credential/secret leakage)
 * - Section 10: Platform-Wide Compliance
 */

export type AuthStep = 'CREDENTIAL_SUBMISSION' | 'OTP_VERIFICATION' | 'SESSION_ESTABLISHED';

export type ApprovedOtpChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'AUTHENTICATOR_APP';

export type LockoutTriggerType = 
  | 'TRIGGER_A_OTP_FAILURES' 
  | 'TRIGGER_B_EXCESSIVE_RESENDS' 
  | 'TRIGGER_C_REPEATED_ABUSE';

export interface LockoutRecord {
  id: string;
  userId?: string;
  identifier: string;
  tenantId?: string;
  trigger: LockoutTriggerType;
  lockedAt: number;
  expiresAt: number;
  durationMinutes: number;
  reason: string;
  active: boolean;
}

export interface ActiveAuthSession {
  sessionId: string;
  backendSessionId?: string; // Authoritative server-side session ID (SES-...)
  user: User;
  tenant?: SchoolTenant;
  identifier: string;
  step: AuthStep;
  channel: ApprovedOtpChannel;
  maskedDestination: string;
  hashedOtp: string; // Cryptographic SHA-256 with salt; PLAINTEXT STRICTLY FORBIDDEN
  salt: string;
  generatedAt: number;
  expiresAt: number; // Exactly generatedAt + 300,000 ms (5 minutes)
  failedAttempts: number; // Max 5 allowed before Trigger A
  resendCount: number; // Max 3 resends allowed; 4th request triggers Trigger B
  lastResendAt: number; // Timestamp of previous dispatch (30s cooldown enforced)
  requiresPasswordSetup?: boolean;
}

export interface OtpDeliveryReceipt {
  sessionId: string;
  backendSessionId?: string;
  channel: ApprovedOtpChannel;
  maskedDestination: string;
  generatedAt: number;
  expiresAt: number;
  validitySeconds: number; // 300 seconds
  cooldownSeconds: number; // 30 seconds
  resendsRemaining: number; // 3 - resendCount
  attemptsRemaining: number; // 5 - failedAttempts
  deliveryGatewayStatus: 'DELIVERED_TO_REGISTERED_DEVICE';
  message: string;
  // NOTE: Zero-Exposure Guarantee (§4.1): Plaintext OTP is NEVER included in this receipt or visible anywhere on UI
}

export type AuthAuditEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'OTP_GENERATION'
  | 'OTP_DELIVERY_ATTEMPT'
  | 'OTP_DELIVERY_SUCCESS'
  | 'OTP_DELIVERY_FAILURE'
  | 'OTP_RESEND_REQUEST'
  | 'OTP_VERIFICATION_SUCCESS'
  | 'OTP_VERIFICATION_FAILURE'
  | 'OTP_EXPIRATION'
  | 'OTP_INVALIDATION'
  | 'AUTHENTICATION_LOCKOUT'
  | 'ACCOUNT_LOCKOUT'
  | 'SECURITY_RESTRICTION'
  | 'STAFF_ONBOARDING_ATTEMPT'
  | 'STAFF_ONBOARDED'
  | 'STAFF_ROLE_ASSIGNED'
  | 'FIRST_TIME_ACTIVATION_OTP_DISPATCHED'
  | 'FIRST_TIME_ACTIVATION_COMPLETED';

export interface AuthAuditRecord {
  id: string;
  timestamp: number;
  userId: string;
  tenantId: string;
  role: string;
  deviceInfo: string;
  sourceIp: string;
  eventType: AuthAuditEventType;
  eventOutcome: 'SUCCESS' | 'FAILURE' | 'LOCKED' | 'DENIED';
  lockoutDurationMinutes?: number;
  lockoutExpirationTimestamp?: number;
  details: string;
  // NOTE: Audit records MUST NEVER contain OTP values, passwords, authentication secrets, encryption keys, or session secrets (§9)
}

export interface VerificationResult {
  success: boolean;
  user?: User;
  tenant?: SchoolTenant;
  jwtSession?: any;
  sessionToken?: string;
  requiresPasswordSetup?: boolean;
  attemptsRemaining?: number;
  isLocked?: boolean;
  lockoutTrigger?: LockoutTriggerType;
  lockoutDurationMinutes?: number;
  lockoutExpiresAt?: number;
  errorMessage?: string;
}

export interface ResendResult {
  success: boolean;
  receipt?: OtpDeliveryReceipt;
  cooldownRemainingSeconds?: number;
  isLocked?: boolean;
  lockoutTrigger?: LockoutTriggerType;
  lockoutDurationMinutes?: number;
  errorMessage?: string;
}

export interface StaffOnboardingPolicyValidation {
  isPermitted: boolean;
  reason?: string;
  authorizedRoles: UserRole[];
}

export const SECURITY_CONSTANTS = {
  OTP_VALIDITY_SECONDS: 300, // 5 minutes
  OTP_RESEND_COOLDOWN_SECONDS: 30, // 30 seconds
  OTP_MAX_FAILED_ATTEMPTS: 5, // Trigger A on 5th failure
  OTP_MAX_RESEND_ALLOWANCE: 3, // Trigger B on 4th request
  LOCKOUT_TRIGGER_A_MINUTES: 15, // 15 minutes
  LOCKOUT_TRIGGER_B_MINUTES: 15, // 15 minutes
  LOCKOUT_TRIGGER_C_MINUTES: 1440, // 24 hours
  TRIGGER_C_THRESHOLD: 3, // 3 lockouts in 24 hours
  ROLLING_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;
