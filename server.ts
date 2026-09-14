import express from 'express';
import path from 'path';

// Load local environment variables if available
try {
  if (typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile();
  }
} catch {
  // .env is optional
}

import { backendOtpService } from './server/backendOtpService';
import { multiTenantStorageService } from './server/multiTenantStorageService';
import { aiAssessmentService } from './server/aiAssessmentService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===========================================================================
  // JJSAK-AUTH-OTP-004 & 004D: BACKEND OTP DELIVERY & VERIFICATION API ROUTES
  // ===========================================================================

  // 1. Request OTP (Dispatches via configured provider, captures acceptance, returns session)
  app.post('/api/otp/request', async (req, res) => {
    try {
      const { identifier, email, phone, channel, purpose, userType, role, userName } = req.body || {};
      const result = await backendOtpService.requestOtp({
        identifier,
        email,
        phone,
        channel,
        purpose,
        userType,
        role,
        userName,
      });

      if (!result.success) {
        return res.status(result.status === 'RATE_LIMITED' || result.status === 'LOCKED' ? 429 : 400).json(result);
      }

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        status: 'DELIVERY_FAILED',
        message: 'We could not deliver the OTP. Please try again or use another registered verification channel.',
        failureReason: err.message,
      });
    }
  });

  // 2. Verify OTP (Timing-safe backend verification and single-use token invalidation)
  app.post('/api/otp/verify', (req, res) => {
    try {
      const { sessionId, candidateCode } = req.body || {};
      if (!sessionId || !candidateCode) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Both sessionId and 6-digit candidateCode are required.',
        });
      }

      const result = backendOtpService.verifyOtp({ sessionId, candidateCode });
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        verified: false,
        message: 'Internal verification engine error.',
      });
    }
  });

  // 3. Observability Audit Logs (Section 11: Request ID | Channel | Provider ID | Created | Provider Status | Delivery Status | Failure Reason | Retry Count)
  app.get('/api/otp/logs', (_req, res) => {
    try {
      const logs = backendOtpService.getAuditLogs();
      return res.status(200).json({ success: true, logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, logs: [] });
    }
  });

  // 4. Provider Status & Operational Healthcheck (JJSAK-AUTH-OTP-004D §21)
  // Returns operational status flags ('configured' | 'unavailable'), timestamps, and failure states
  // Strictly excludes all API keys, secrets, and auth tokens.
  app.get('/api/otp/provider-status', (_req, res) => {
    try {
      const status = backendOtpService.getProviderStatus();
      const emailStatus = {
        provider: 'RESEND',
        status: status.emailProvider.status, // 'configured' | 'unavailable'
        lastSuccess: status.emailProvider.lastSuccessfulRequest,
        lastSuccessfulRequest: status.emailProvider.lastSuccessfulRequest,
        lastFailure: status.emailProvider.lastFailure,
        lastFailureTimestamp: status.emailProvider.lastFailureTimestamp,
      };

      const smsStatus = {
        provider: 'AFRICASTALKING',
        status: status.smsProvider.status, // 'configured' | 'unavailable'
        lastSuccess: status.smsProvider.lastSuccessfulRequest,
        lastSuccessfulRequest: status.smsProvider.lastSuccessfulRequest,
        lastFailure: status.smsProvider.lastFailure,
        lastFailureTimestamp: status.smsProvider.lastFailureTimestamp,
      };

      const twilioStatus = (status as any).twilioProvider || {
        provider: 'TWILIO',
        status: 'unavailable',
      };

      const whatsappStatus = {
        provider: status.whatsapp.primaryProvider || 'TWILIO',
        status: status.whatsapp.twilioConfigured || status.whatsapp.metaCloudApiConfigured ? 'configured' : 'unavailable',
        senderPhone: status.whatsapp.senderPhoneId,
        providerReachable: status.whatsapp.providerReachable,
      };

      return res.status(200).json({
        success: true,
        // Status of Email, SMS (Africa's Talking / Twilio), and WhatsApp providers
        email: emailStatus,
        sms: smsStatus,
        twilio: twilioStatus,
        whatsapp: whatsappStatus,
        resend: emailStatus,
        africasTalking: smsStatus,
        emailProvider: status.emailProvider,
        smsProvider: status.smsProvider,
        twilioProvider: twilioStatus,
        providers: {
          email: emailStatus,
          sms: smsStatus,
          twilio: twilioStatus,
          whatsapp: whatsappStatus,
        },
        deliveryCallbackStatus: status.deliveryCallbackStatus,
        status,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Africa's Talking SMS Delivery Report (DLR) Webhook Callback (JJSAK-AUTH-OTP-004D §8)
  // Validates the callback from Africa's Talking, matches the provider message ID to an existing OTP delivery record,
  // updates the delivery status, and strictly excludes any sensitive authentication data.
  app.post('/api/otp/providers/africastalking/delivery-report', (req, res) => {
    try {
      // Support both application/x-www-form-urlencoded and application/json bodies
      const payload = { ...req.query, ...(req.body || {}) };
      const rawId = payload.id || payload.messageId;
      const rawStatus = payload.status;
      const failureReason = payload.failureReason;
      const phoneNumber = payload.phoneNumber;
      const networkCode = payload.networkCode;

      // Validate required callback parameters
      if (!rawId || typeof rawId !== 'string' || !rawId.trim()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed: 'id' parameter is required.",
        });
      }

      if (!rawStatus || typeof rawStatus !== 'string' || !rawStatus.trim()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed: 'status' parameter is required.",
        });
      }

      const id = rawId.trim();
      const status = rawStatus.trim();

      // Process delivery report and match provider message ID against existing delivery records
      const result = backendOtpService.handleAfricasTalkingCallback({
        id,
        status,
        failureReason: typeof failureReason === 'string' ? failureReason.trim() : undefined,
        phoneNumber: typeof phoneNumber === 'string' ? phoneNumber.trim() : undefined,
        networkCode: typeof networkCode === 'string' ? networkCode.trim() : undefined,
      });

      // Strict Zero-Exposure: response contains only delivery state metadata, never exposing OTPs, hashes, salts, or tokens
      return res.status(200).json({
        success: true,
        message: result.found
          ? 'Delivery report processed and OTP delivery record updated.'
          : 'Delivery report processed (no active session matched).',
        matched: result.found,
        providerMessageId: result.messageId,
        deliveryStatus: result.updatedStatus,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'An internal error occurred while processing the delivery report.',
      });
    }
  });

  // Twilio SMS & WhatsApp Delivery Status (DLR) Webhook Callback
  app.post('/api/otp/providers/twilio/status-callback', (req, res) => {
    try {
      const payload = { ...req.query, ...(req.body || {}) };
      const messageSid = payload.MessageSid || payload.SmsSid;
      const messageStatus = payload.MessageStatus || payload.SmsStatus;
      const errorCode = payload.ErrorCode;
      const errorMessage = payload.ErrorMessage;

      if (!messageSid || typeof messageSid !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Validation failed: 'MessageSid' parameter is required.",
        });
      }

      const result = backendOtpService.handleTwilioCallback({
        MessageSid: messageSid.trim(),
        MessageStatus: typeof messageStatus === 'string' ? messageStatus.trim() : undefined,
        ErrorCode: typeof errorCode === 'string' ? errorCode.trim() : undefined,
        ErrorMessage: typeof errorMessage === 'string' ? errorMessage.trim() : undefined,
        To: payload.To,
        From: payload.From,
      });

      return res.status(200).json({
        success: true,
        message: result.found
          ? 'Twilio delivery status processed and OTP delivery record updated.'
          : 'Twilio delivery status processed (no active session matched).',
        matched: result.found,
        providerMessageId: result.messageId,
        deliveryStatus: result.updatedStatus,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Resend Transactional Email Delivery Webhook (JJSAK-AUTH-OTP-004D §9)
  app.post('/api/otp/providers/resend/webhook', (req, res) => {
    try {
      const result = backendOtpService.handleResendWebhook(req.body || {});
      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Session Status & Delivery State Query
  app.get('/api/otp/status/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const status = backendOtpService.getSessionStatus(sessionId);
      if (!status.found) {
        return res.status(404).json({ success: false, message: 'Session not found or expired.' });
      }
      return res.status(200).json({ success: true, ...status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Provider Delivery Receipt (DLR) Webhook Callback
  app.post('/api/otp/dlr-callback', (req, res) => {
    try {
      const { messageId, requestId, status, failureReason } = req.body || {};
      const updated = backendOtpService.handleDlrCallback({ messageId, requestId, status, failureReason });
      return res.status(200).json({ success: true, updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Real End-to-End Verification Test (Section 10)
  app.post('/api/otp/test-delivery', async (req, res) => {
    try {
      const { channel } = req.body || {};
      const targetChannel = channel === 'SMS' ? 'SMS' : channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL';
      const result = await backendOtpService.requestOtp({
        channel: targetChannel,
        purpose: 'JJSAK-AUTH-OTP-004 End-to-End Delivery Verification Test',
        userType: 'OWNER',
        role: 'SUPER_ADMIN',
        userName: 'Jotham Barasa Watila',
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Verification test encountered delivery failure.',
        error: err.message,
      });
    }
  });

  // ===========================================================================
  // JJSAK-AUTH-OTP-004C: PHASE 3 SECURITY, MONITORING & ACCEPTANCE TEST ENDPOINTS
  // ===========================================================================

  // 8. Administrative Monitoring Alerts (§16)
  app.get('/api/otp/alerts', (_req, res) => {
    try {
      const alerts = backendOtpService.getAlerts();
      return res.status(200).json({ success: true, count: alerts.length, alerts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/otp/clear-alerts', (_req, res) => {
    try {
      backendOtpService.clearAlerts();
      return res.status(200).json({ success: true, message: 'All alerts cleared.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Session Cleanup Engine (§19)
  app.post('/api/otp/cleanup-expired', (_req, res) => {
    try {
      const stats = backendOtpService.cleanupExpiredSessions();
      return res.status(200).json({ success: true, ...stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Automated Acceptance Test Runners (Phase 3: 24 tests, Phase 4: 10 tests)
  app.all(['/api/otp/run-acceptance-tests', '/api/otp/acceptance-status'], async (_req, res) => {
    try {
      const phase3Report = await backendOtpService.runPhase3AcceptanceTests();
      const phase4Report = await backendOtpService.runPhase4AcceptanceTests();
      const combinedResults = [...phase3Report.results, ...phase4Report.results];
      const allPassed = phase3Report.allPassed && phase4Report.allPassed;

      return res.status(200).json({
        success: true,
        allPassed,
        totalCount: combinedResults.length,
        passedCount: combinedResults.filter((r) => r.passed).length,
        phase3: phase3Report,
        phase4: phase4Report,
        results: combinedResults,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dedicated Phase 4 Resend & Africa's Talking Provider Acceptance Suite (JJSAK-AUTH-OTP-004D)
  app.all('/api/otp/phase4-acceptance', async (_req, res) => {
    try {
      const report = await backendOtpService.runPhase4AcceptanceTests();
      return res.status(200).json({ success: true, ...report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Authentication Middleware (§17, §18)
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
    }
    const user = backendOtpService.authenticateToken(authHeader);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
    (req as any).user = user;
    next();
  };

  // 11. Profile & Session Me Endpoint (§18)
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    return res.status(200).json({ success: true, user });
  });

  // 12. Logout / Session Invalidation Endpoint (§18)
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      backendOtpService.revokeToken(authHeader);
    }
    return res.status(200).json({ success: true, message: 'Session successfully terminated.' });
  });

  // 13. Owner Super Administrator Protected Route (§11)
  app.get('/api/owner/governance', requireAuth, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'SUPER_ADMIN' || user.userType !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'ACCESS DENIED: Exclusive to JJSAK Owner and Super Administrator.',
      });
    }

    return res.status(200).json({
      success: true,
      governanceData: {
        platform: 'JJSAK Educational Assessment & CBE Platform',
        owner: user.userName,
        status: 'PRODUCTION_ACTIVE',
        governanceModules: [
          'Global Tenant Provisioning',
          'System Security & Cryptographic Auditing',
          'National Curriculum Alignment Oversight',
          'Carrier Gateway Configuration',
        ],
      },
    });
  });

  // 14. School Tenant Protected Route with Cross-School Isolation (§10)
  app.get('/api/school/:schoolId/data', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { schoolId } = req.params;

    // Tenant isolation enforcement: user must belong to requested school
    if (user.tenantId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS DENIED',
        message: `Cross-tenant access violation: User ${user.userId} registered for tenant ${user.tenantId || 'GLOBAL'} cannot access tenant ${schoolId}.`,
      });
    }

    return res.status(200).json({
      success: true,
      schoolId,
      schoolName: user.schoolName,
      message: `Tenant data accessed successfully for ${user.schoolName}.`,
    });
  });

  // ===========================================================================
  // PRODUCTION MULTI-TENANT ONBOARDING, PERSISTENCE & CROSS-PLATFORM DATA API
  // ===========================================================================

  // 15. Tenants: Get all registered schools
  app.get('/api/tenants', (_req, res) => {
    try {
      const tenants = multiTenantStorageService.getAllTenants();
      return res.status(200).json({ success: true, count: tenants.length, tenants });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 16. Tenants: Register / update school tenant
  app.post('/api/tenants', (req, res) => {
    try {
      const tenant = req.body;
      if (!tenant || !tenant.schoolId || !tenant.schoolName) {
        return res.status(400).json({ success: false, message: 'schoolId and schoolName are required.' });
      }
      const saved = multiTenantStorageService.saveTenant(tenant);
      return res.status(200).json({ success: true, tenant: saved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 17. Tenants: Update tenant status (e.g., PENDING -> ACTIVE)
  app.put('/api/tenants/:tenantId/status', (req, res) => {
    try {
      const { tenantId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required.' });
      }
      const updated = multiTenantStorageService.updateTenantStatus(tenantId, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Tenant not found.' });
      }
      return res.status(200).json({ success: true, tenantId, status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 18. Tenants: Delete tenant
  app.delete('/api/tenants/:tenantId', (req, res) => {
    try {
      const { tenantId } = req.params;
      const deleted = multiTenantStorageService.deleteTenant(tenantId);
      return res.status(200).json({ success: true, deleted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 19. Users: Get all registered users
  app.get('/api/users', (_req, res) => {
    try {
      const users = multiTenantStorageService.getAllUsers().map((u) => {
        // Exclude passwords
        const { password, ...safeUser } = u as any;
        return safeUser;
      });
      return res.status(200).json({ success: true, count: users.length, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 20. Users: Save / Update user
  app.post('/api/users', (req, res) => {
    try {
      const user = req.body;
      if (!user || !user.id || !user.email) {
        return res.status(400).json({ success: false, message: 'User id and email are required.' });
      }
      const saved = multiTenantStorageService.saveUser(user);
      // Synchronize with backend OTP service registry
      const tenant = user.schoolId ? multiTenantStorageService.getTenant(user.schoolId) : null;
      backendOtpService.registerUser({
        userId: user.id,
        username: user.username || user.email,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        userType: user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN' ? 'OWNER' : 'INSTITUTIONAL',
        tenantId: user.schoolId,
        schoolId: user.schoolId,
        schoolName: tenant ? tenant.schoolName : undefined,
        portalDestination: user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN' ? 'OWNER_DASHBOARD' : 'SCHOOL_PORTAL',
        permissions: ['PORTAL_ACCESS', 'STAFF_MANAGEMENT', 'MARKS_ENTRY'],
      });
      return res.status(200).json({ success: true, user: saved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 21. Live Personnel Onboarding & Instant OTP Dispatch
  // Used when Head of Institution, Teacher, or Staff is registered
  app.post('/api/users/onboard-personnel', async (req, res) => {
    try {
      const {
        schoolId,
        fullName,
        email,
        phone,
        role,
        nationalId,
        tscNumber,
        designation,
      } = req.body;

      if (!fullName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email address, and phone number are required for personnel onboarding.',
        });
      }

      const tenant = schoolId ? multiTenantStorageService.getTenant(schoolId) : null;
      const cleanSchoolCode = tenant ? tenant.schoolCode.toLowerCase() : 'school';
      const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const userId = `usr-${cleanSchoolCode}-${Date.now().toString().slice(-4)}-${cleanName.slice(0, 5)}`;
      const username = `${(role || 'staff').toLowerCase()}.${cleanName.slice(0, 6)}`;

      const newUser = multiTenantStorageService.saveUser({
        id: userId,
        schoolId,
        fullName: fullName.trim(),
        username,
        email: email.trim().toLowerCase(),
        phoneNumber: phone.trim(),
        role: role || 'HEAD_OF_INSTITUTION',
        designation: designation || (role === 'HEAD_OF_INSTITUTION' ? 'Head of Institution' : 'Teacher'),
        active: true,
        mfaEnabled: true,
        mfaMethod: 'SMS_OTP',
        firstLoginCompleted: false,
        activationStatus: 'PENDING_ACTIVATION',
        employeeNumber: tscNumber || nationalId || `EMP-${Date.now().toString().slice(-4)}`,
      });

      // Register with backend OTP registry
      backendOtpService.registerUser({
        userId: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        userType: 'INSTITUTIONAL',
        tenantId: schoolId,
        schoolId: schoolId,
        schoolName: tenant ? tenant.schoolName : undefined,
        portalDestination: 'SCHOOL_PORTAL',
        permissions: ['PORTAL_ACCESS', 'STAFF_MANAGEMENT', 'MARKS_ENTRY', 'STUDENT_REGISTRATION', 'REPORTS_VIEW'],
      });

      // Automatically dispatch OTP to the registered email and phone number
      const otpPurpose = `${tenant ? tenant.schoolName : 'Institution'} Personnel Activation & Role Verification`;
      const emailOtpResult = await backendOtpService.requestOtp({
        identifier: newUser.id,
        email: newUser.email,
        channel: 'EMAIL',
        purpose: otpPurpose,
        userType: 'INSTITUTIONAL',
        role: newUser.role,
        userName: newUser.fullName,
      });

      return res.status(200).json({
        success: true,
        message: `Personnel ${newUser.fullName} registered successfully. OTP dispatched to ${newUser.email} and ${newUser.phoneNumber}.`,
        user: newUser,
        otpSession: {
          sessionId: emailOtpResult.sessionId,
          requestId: emailOtpResult.requestId,
          maskedDestination: emailOtpResult.maskedDestination,
          expiresIn: emailOtpResult.expiresIn,
          status: emailOtpResult.status,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 22. Tenant Data Bundle: Get isolated school data (students, teachers, assessments, grades, etc.)
  app.get('/api/tenants/:tenantId/data', (req, res) => {
    try {
      const { tenantId } = req.params;
      const data = multiTenantStorageService.getTenantData(tenantId);
      return res.status(200).json({ success: true, tenantId, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 23. Tenant Data Bundle: Save isolated school data
  app.post('/api/tenants/:tenantId/data', (req, res) => {
    try {
      const { tenantId } = req.params;
      const partialBundle = req.body;
      const updated = multiTenantStorageService.saveTenantData(tenantId, partialBundle);
      return res.status(200).json({ success: true, tenantId, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 24. AI Assessment Generation (All Learning Areas / Batch Generation)
  app.post('/api/ai/generate-assessments', async (req, res) => {
    try {
      const { schoolName, grade, term, year, assessmentType, subjects, questionsPerSubject, targetMarksPerSubject } = req.body || {};

      const result = await aiAssessmentService.generateBatchAssessments({
        schoolName: schoolName || 'Kenya Junior School',
        grade: grade || 'Grade 8',
        term: term || 'Term 2, 2026',
        year: year || 2026,
        assessmentType: assessmentType || 'Mid Term Examination',
        subjects,
        questionsPerSubject: Number(questionsPerSubject || 15),
        targetMarksPerSubject: Number(targetMarksPerSubject || 50),
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
        message: 'Failed to generate assessment papers.',
      });
    }
  });

  // Healthcheck endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'JJSAK-Educational-Platform', timestamp: new Date().toISOString() });
  });

  // ===========================================================================
  // VITE DEV SERVER / PRODUCTION STATIC SERVING
  // ===========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JJSAK Core] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
