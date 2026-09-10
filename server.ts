import express from 'express';
import path from 'path';
import { backendOtpService } from './server/backendOtpService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===========================================================================
  // JJSAK-AUTH-OTP-004: BACKEND OTP DELIVERY & VERIFICATION API ROUTES
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

  // 4. Provider Status & Healthcheck
  app.get('/api/otp/provider-status', (_req, res) => {
    try {
      const status = backendOtpService.getProviderStatus();
      return res.status(200).json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Provider Delivery Receipt (DLR) Webhook Callback
  app.post('/api/otp/dlr-callback', (req, res) => {
    try {
      const { messageId, requestId, status, failureReason } = req.body || {};
      const updated = backendOtpService.handleDlrCallback({ messageId, requestId, status, failureReason });
      return res.status(200).json({ success: true, updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Real End-to-End Verification Test (Section 10)
  app.post('/api/otp/test-delivery', async (req, res) => {
    try {
      const { channel } = req.body || {};
      const targetChannel = channel === 'SMS' ? 'SMS' : 'EMAIL';
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
