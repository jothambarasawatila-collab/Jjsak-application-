/**
 * JJSAK OTP CLIENT SERVICE
 * Requirement ID: JJSAK-AUTH-OTP-004
 * 
 * Frontend service that communicates with backend OTP delivery & verification API.
 * - Never stores or displays actual OTP values
 * - Enforces delivery provider confirmation before showing "Sent" message
 * - Handles timeout, retry, and provider failures gracefully
 * - Provides user-friendly error messages
 */

export interface OtpRequestPayload {
  identifier?: string;
  email?: string;
  phone?: string;
  channel?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  purpose?: string;
  userType?: 'OWNER' | 'INSTITUTIONAL';
  role?: string;
  userName?: string;
}

export interface OtpRequestResponse {
  success: boolean;
  status: 'REQUEST_ACCEPTED' | 'DELIVERY_FAILED' | 'RATE_LIMITED' | 'LOCKED';
  message: string;
  sessionId?: string;
  requestId?: string;
  channel?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  maskedDestination?: string;
  expiresAt?: number;
  cooldownSeconds?: number;
  failureReason?: string;
  errorCode?: string;
}

export interface OtpVerifyPayload {
  sessionId: string;
  candidateCode: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  verified: boolean;
  message: string;
  sessionToken?: string;
  attemptsRemaining?: number;
  locked?: boolean;
}

export interface OtpSession {
  sessionId: string;
  requestId: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  maskedDestination: string;
  expiresAt: number;
  createdAt: number;
  deliveryConfirmed: boolean;
  deliveryMessage?: string;
}

class OtpClientService {
  private apiBase = '/api';
  private activeSessions: Map<string, OtpSession> = new Map();
  private requestTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Request OTP from backend
   * CRITICAL: Only shows "Verification Code Sent" if backend confirms provider acceptance
   */
  public async requestOtp(params: OtpRequestPayload): Promise<{
    success: boolean;
    sessionId?: string;
    maskedDestination?: string;
    message: string;
    channel?: 'EMAIL' | 'SMS';
  }> {
    try {
      const response = await fetch(`${this.apiBase}/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-JJSAK-Client': 'OTP-VERIFICATION-UI',
        },
        body: JSON.stringify(params),
      });

      const data: OtpRequestResponse = await response.json();

      // Provider acceptance check: ONLY show "Sent" on successful provider acceptance
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Unable to deliver the verification code. Please try again or use another registered recovery method.',
        };
      }

      // Provider has accepted the message
      if (data.sessionId && data.status === 'REQUEST_ACCEPTED') {
        const session: OtpSession = {
          sessionId: data.sessionId,
          requestId: data.requestId || '',
          channel: data.channel || 'EMAIL',
          maskedDestination: data.maskedDestination || '***@***.***',
          expiresAt: data.expiresAt || Date.now() + 5 * 60 * 1000,
          createdAt: Date.now(),
          deliveryConfirmed: true,
          deliveryMessage: data.message,
        };

        this.activeSessions.set(data.sessionId, session);

        // Auto-clear expired session
        const timeoutId = setTimeout(() => {
          this.activeSessions.delete(data.sessionId!);
          this.requestTimeouts.delete(data.sessionId!);
        }, (data.expiresAt || 0) - Date.now() + 5000);

        this.requestTimeouts.set(data.sessionId, timeoutId);

        return {
          success: true,
          sessionId: data.sessionId,
          maskedDestination: data.maskedDestination,
          message: `Verification code sent to your registered ${data.channel?.toLowerCase() || 'email'} address.`,
          channel: data.channel,
        };
      }

      return {
        success: false,
        message: data.message || 'Verification code delivery failed.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Network error: ${error.message || 'Unable to reach verification service'}`,
      };
    }
  }

  /**
   * Verify OTP entered by user
   * Backend performs timing-safe comparison and single-use validation
   */
  public async verifyOtp(
    sessionId: string,
    code: string
  ): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
    sessionToken?: string;
    attemptsRemaining?: number;
  }> {
    try {
      const response = await fetch(`${this.apiBase}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-JJSAK-Client': 'OTP-VERIFICATION-UI',
        },
        body: JSON.stringify({
          sessionId,
          candidateCode: code,
        }),
      });

      const data: OtpVerifyResponse = await response.json();

      if (data.verified && data.sessionToken) {
        // Clear session on successful verification (single-use token invalidation)
        this.activeSessions.delete(sessionId);
        const timeout = this.requestTimeouts.get(sessionId);
        if (timeout) {
          clearTimeout(timeout);
          this.requestTimeouts.delete(sessionId);
        }

        return {
          success: true,
          verified: true,
          message: 'Authentication successful! Redirecting to portal...',
          sessionToken: data.sessionToken,
        };
      }

      return {
        success: false,
        verified: false,
        message: data.message || 'Invalid verification code.',
        attemptsRemaining: data.attemptsRemaining,
      };
    } catch (error: any) {
      return {
        success: false,
        verified: false,
        message: `Verification service error: ${error.message}`,
      };
    }
  }

  /**
   * Get current active OTP session (for UI display)
   */
  public getActiveSession(sessionId: string): OtpSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Check if expired
    if (session.expiresAt < Date.now()) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Calculate time remaining for OTP (in seconds)
   */
  public getTimeRemaining(sessionId: string): number {
    const session = this.activeSessions.get(sessionId);
    if (!session) return 0;

    const remaining = Math.ceil((session.expiresAt - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Request new OTP with rate limiting enforcement
   * Backend will enforce 30-second cooldown and 5-attempt lockout
   */
  public async requestNewOtp(params: OtpRequestPayload): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds?: number;
    sessionId?: string;
  }> {
    try {
      const response = await fetch(`${this.apiBase}/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data: OtpRequestResponse = await response.json();

      if (data.status === 'RATE_LIMITED') {
        return {
          success: false,
          message: `Please wait ${data.cooldownSeconds} seconds before requesting a new code.`,
          cooldownSeconds: data.cooldownSeconds,
        };
      }

      if (data.status === 'LOCKED') {
        return {
          success: false,
          message: 'Too many requests. Please try again later.',
        };
      }

      if (data.success && data.sessionId) {
        return {
          success: true,
          message: data.message,
          sessionId: data.sessionId,
        };
      }

      return {
        success: false,
        message: data.message || 'Unable to request new code.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  /**
   * Get provider status and health check
   */
  public async getProviderStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/otp/provider-status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all sessions on logout
   */
  public clearAllSessions(): void {
    this.activeSessions.forEach((_, sessionId) => {
      const timeout = this.requestTimeouts.get(sessionId);
      if (timeout) clearTimeout(timeout);
    });
    this.activeSessions.clear();
    this.requestTimeouts.clear();
  }
}

export const otpClientService = new OtpClientService();
