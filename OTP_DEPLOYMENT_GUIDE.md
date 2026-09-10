# JJSAK OTP AUTHENTICATION SYSTEM
## Complete Production Deployment Guide
**Requirement ID:** JJSAK-AUTH-OTP-004  
**Status:** PRODUCTION READY  
**Last Updated:** 2026-09-10

---

## 📋 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Environment Configuration](#environment-configuration)
4. [Email Provider Setup](#email-provider-setup)
5. [SMS Provider Setup](#sms-provider-setup)
6. [WhatsApp Provider Setup](#whatsapp-provider-setup)
7. [API Endpoints](#api-endpoints)
8. [Frontend Integration](#frontend-integration)
9. [Testing & Verification](#testing--verification)
10. [Monitoring & Observability](#monitoring--observability)
11. [Troubleshooting](#troubleshooting)

---

## SYSTEM OVERVIEW

### What It Does
The JJSAK OTP Authentication System provides secure, multi-channel one-time password delivery:

✅ **Generate** cryptographically secure 6-digit OTP  
✅ **Deliver** via Email, SMS, or WhatsApp (no mock deliveries)  
✅ **Confirm** provider acceptance before showing "sent" message  
✅ **Verify** with timing-safe comparison and automatic invalidation  
✅ **Audit** every request with full observability trail  

### Key Security Features
- **Zero Exposure:** OTP never returned in API, never logged in plain text
- **Owner Binding:** Owner OTP locked to `jothambarasawatila@gmail.com` + `+254741478813`
- **Rate Limiting:** 30-second cooldown + 15-minute lockout after 5 failures
- **Timing-Safe Comparison:** Resistant to timing attacks
- **Single-Use Tokens:** Automatic invalidation after verification
- **Full Audit Trail:** Every request logged with provider status

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                  OTP Verification Screen                     │
└────────────┬──────────────────────────────────────────────┬──┘
             │                                              │
        POST /api/otp/request                          POST /api/otp/verify
             │ (email/phone/channel)                        │ (sessionId/code)
             ▼                                              ▼
   ┌─────────────────────────────────────────────────┐
   │      BACKEND (Node.js/Express/TypeScript)       │
   │         backendOtpService.ts                    │
   │                                                 │
   │  • Generate secure OTP                          │
   │  • Enforce rate limits                          │
   │  • Route to delivery provider                   │
   │  • Record audit log                             │
   │  • Verify against hash                          │
   │  • Invalidate on success                        │
   └──────────────┬──────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌──────┐ ┌──────────┐
   │ EMAIL  │ │ SMS  │ │ WHATSAPP │
   └────────┘ └──────┘ └──────────┘
        │         │         │
    ┌───┴────┐ ┌──┴──┐ ┌───┴────┐
    │ SMTP   │ │ AT  │ │ Meta   │
    │ Gmail  │ │ TW  │ │ Twilio │
    │ Resend │ │ SC  │ └────────┘
    │ SG     │ └─────┘
    │ PM     │
    └────────┘
        │
    REAL INBOXES
    (No Mocks)
```

---

## ENVIRONMENT CONFIGURATION

### Create `.env.production` file in project root:

```bash
# ============================================================================
# JJSAK OTP SERVICE CONFIGURATION
# ============================================================================

# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://jjsak.example.com

# ============================================================================
# EMAIL DELIVERY PROVIDERS
# ============================================================================

# Option 1: GMAIL SMTP (personal/GSuite with app password)
GMAIL_ADDRESS=jothambarasawatila@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Option 2: SENDGRID API
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=security@jjsak.org

# Option 3: RESEND EMAIL API
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Option 4: POSTMARK
POSTMARK_API_TOKEN=postmark-server-token-here

# Fallback SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jothambarasawatila@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_SECURE=false
SMTP_FROM="JJSAK Security Authority" <security@jjsak.org>
EMAIL_SENDING_DOMAIN=jjsak.org
EMAIL_PROVIDER_TYPE=RESEND

# ============================================================================
# SMS DELIVERY PROVIDERS
# ============================================================================

# Option 1: AFRICA'S TALKING (Kenya Optimized)
AFRICASTALKING_USERNAME=jjsak_sandbox
AFRICASTALKING_API_KEY=atsk_xxxxxxxxxxxxx
AFRICASTALKING_SENDER_ID=JJSAK-AUTH

# Option 2: TWILIO SMS & WHATSAPP
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Option 3: SAFARICOM BULK SMS (Kenya)
SAFARICOM_API_KEY=safaricom-api-key
SAFARICOM_PARTNER_ID=jjsak
SAFARICOM_SHORTCODE=40404

# ============================================================================
# WHATSAPP DELIVERY PROVIDERS
# ============================================================================

# Meta WhatsApp Business API
WHATSAPP_BUSINESS_PHONE_ID=your-phone-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=your-access-token
WHATSAPP_BUSINESS_API_VERSION=v18.0

# ============================================================================
# OWNER CREDENTIALS (STRICT BINDING)
# ============================================================================

OWNER_EMAIL=jothambarasawatila@gmail.com
OWNER_PHONE=+254741478813
OWNER_NAME=Jotham Barasa Watila

# ============================================================================
# SECURITY & RATE LIMITING
# ============================================================================

OTP_VALIDITY_OWNER_SECONDS=300
OTP_VALIDITY_STAFF_SECONDS=600
OTP_MAX_ATTEMPTS=5
OTP_COOLDOWN_SECONDS=30
OTP_LOCKOUT_MINUTES=15

# ============================================================================
# LOGGING & MONITORING
# ============================================================================

LOG_LEVEL=info
ENABLE_AUDIT_LOGGING=true
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## EMAIL PROVIDER SETUP

### 1️⃣ GMAIL SMTP (Recommended for Testing)

**Prerequisites:**
- Gmail account with 2FA enabled
- Google Account Settings access

**Setup Steps:**

```bash
# Step 1: Enable 2-Factor Authentication
# Visit: https://myaccount.google.com/security
# Enable 2-Step Verification

# Step 2: Generate App Password
# Visit: https://myaccount.google.com/apppasswords
# Select: Mail, Windows Computer (or your platform)
# Copy the 16-character password shown

# Step 3: Add to .env
GMAIL_ADDRESS=jothambarasawatila@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jothambarasawatila@gmail.com",
    "channel": "EMAIL",
    "purpose": "Testing Gmail SMTP"
  }'
```

---

### 2️⃣ SENDGRID (Production Email)

**Prerequisites:**
- SendGrid account (free tier available)
- API key with Mail Send permission

**Setup Steps:**

```bash
# Step 1: Create SendGrid Account
# Visit: https://sendgrid.com/

# Step 2: Create API Key
# Settings → API Keys → Create API Key
# Permission: Mail Send (Full Access)
# Copy the key (you'll only see it once)

# Step 3: Verify Sender Identity
# Settings → Sender Authentication
# Add your domain or single sender

# Step 4: Add to .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=security@jjsak.org
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "channel": "EMAIL",
    "purpose": "Testing SendGrid"
  }'
```

---

### 3️⃣ RESEND (Modern Email API)

**Prerequisites:**
- Resend account (resend.com)
- API key

**Setup Steps:**

```bash
# Step 1: Create Resend Account
# Visit: https://resend.com/

# Step 2: Get API Key
# Dashboard → API Keys → Create API Key
# Copy key starting with 're_'

# Step 3: Add to .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_PROVIDER_TYPE=RESEND
```

---

### 4️⃣ POSTMARK (Transactional Email)

**Prerequisites:**
- Postmark account
- Server token

**Setup Steps:**

```bash
# Step 1: Create Postmark Account
# Visit: https://postmark.com/

# Step 2: Create Server
# Servers → Add Server
# Choose "Production"

# Step 3: Get Server Token
# Click server → API Tokens → Copy Server Token

# Step 4: Add to .env
POSTMARK_API_TOKEN=postmark-server-token-xxxxx
```

---

## SMS PROVIDER SETUP

### 1️⃣ AFRICA'S TALKING (Kenya Optimized) ⭐ RECOMMENDED

**Prerequisites:**
- Africa's Talking developer account
- API key
- Account funded (for production)

**Setup Steps:**

```bash
# Step 1: Create Account
# Visit: https://africastalking.com/
# Sign up with email

# Step 2: Get API Credentials
# Dashboard → Settings → API Key
# Copy your Username & API Key

# Step 3: Test with Sandbox
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=atsk_xxxxxxxxxxxxx
AFRICASTALKING_SENDER_ID=JJSAK-AUTH

# Step 4: Verify Your Phone
# Settings → Phone Numbers → Add Phone
# Add: +254741478813

# Step 5: Fund Account (Production)
# Account → Billing → Add Funds
# Minimum: KES 100 (~$0.77 USD)
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254741478813",
    "channel": "SMS",
    "purpose": "Testing Africa'\''s Talking"
  }'
```

**Sender ID Registration:**
- Wait 24-48 hours for approval
- Once approved, all SMS use your sender ID
- Sandbox uses "SANDBOX" sender

---

### 2️⃣ TWILIO (Global SMS)

**Prerequisites:**
- Twilio account (trial available)
- Phone number
- Auth credentials

**Setup Steps:**

```bash
# Step 1: Create Twilio Account
# Visit: https://www.twilio.com/
# Sign up with email/phone

# Step 2: Get Credentials
# Console → Account Info
# Copy: Account SID & Auth Token
# Verify phone at: Console → Phone Numbers → Verify

# Step 3: Add to .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Step 4: (Optional) WhatsApp Setup
# Messaging → Try it out → WhatsApp
# Enable WhatsApp Sandbox
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

**Testing:**
```bash
# SMS Test
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "channel": "SMS",
    "purpose": "Testing Twilio"
  }'

# WhatsApp Test
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "channel": "WHATSAPP",
    "purpose": "Testing Twilio WhatsApp"
  }'
```

---

### 3️⃣ SAFARICOM BULK SMS (Kenya)

**Prerequisites:**
- Safaricom Business account
- API credentials
- Shortcode registration

**Setup Steps:**

```bash
# Step 1: Contact Safaricom Business
# Email: support@safaricom.co.ke
# Request: Bulk SMS API credentials

# Step 2: Get Credentials
# Partner ID: Unique identifier for your account
# API Key: Authentication token
# Shortcode: 4-digit code (e.g., 40404)

# Step 3: Add to .env
SAFARICOM_API_KEY=your-safaricom-key
SAFARICOM_PARTNER_ID=jjsak
SAFARICOM_SHORTCODE=40404

# Step 4: Register Shortcode (optional)
# Safaricom will handle registration
# Wait for approval (2-5 business days)
```

---

## WHATSAPP PROVIDER SETUP

### 1️⃣ META WHATSAPP BUSINESS API (Official)

**Prerequisites:**
- Facebook Business Account
- WhatsApp Business App
- Business Phone Number
- Meta Developer Access

**Setup Steps:**

```bash
# Step 1: Create Facebook Business Account
# Visit: https://business.facebook.com/
# Sign up and create business

# Step 2: Create WhatsApp Business App
# Apps → Create App → Business → WhatsApp
# Complete setup wizard

# Step 3: Add Phone Number
# WhatsApp > Phone Numbers > Add Phone Number
# Verify number with SMS code

# Step 4: Get Access Token
# Settings > Users & Permissions > Generate token
# Permissions: whatsapp_business_messaging

# Step 5: Get Phone ID
# API > Versions > WhatsApp > Manage > Phone Numbers
# Copy your Phone Number ID

# Step 6: Add to .env
WHATSAPP_BUSINESS_PHONE_ID=your-phone-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=your-token
WHATSAPP_BUSINESS_API_VERSION=v18.0
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254741478813",
    "channel": "WHATSAPP",
    "purpose": "Testing Meta WhatsApp"
  }'
```

---

### 2️⃣ TWILIO WHATSAPP SANDBOX

**Prerequisites:**
- Twilio account
- WhatsApp Sandbox enabled

**Setup Steps:**

```bash
# Step 1: Enable WhatsApp Sandbox
# Console > Messaging > Try it out > WhatsApp

# Step 2: Get WhatsApp Phone Number
# Messaging > Try it out > Phone Numbers
# Copy WhatsApp number (starts with whatsapp:)

# Step 3: Save WhatsApp Senders
# Message the sandbox from your phone with: join <code>
# Code provided in sandbox setup

# Step 4: Add to .env
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
```

---

## API ENDPOINTS

### 1. Request OTP
**Endpoint:** `POST /api/otp/request`

**Request Body:**
```json
{
  "identifier": "jotham",  // or email/phone
  "email": "jothambarasawatila@gmail.com",
  "phone": "+254741478813",
  "channel": "EMAIL",  // EMAIL | SMS | WHATSAPP
  "purpose": "Owner Platform Authentication",
  "userType": "OWNER",  // OWNER | INSTITUTIONAL
  "userName": "Jotham Barasa Watila",
  "role": "SUPER_ADMIN"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "status": "REQUEST_ACCEPTED",
  "message": "Verification code sent to your registered email address.",
  "sessionId": "SES-1694200000000-A1B2C3D4",
  "requestId": "REQ-1694200000000-E5F6G7H8",
  "channel": "EMAIL",
  "maskedDestination": "jo***a@gmail.com",
  "expiresAt": 1694200300000,
  "cooldownSeconds": 30
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "status": "RATE_LIMITED",
  "message": "Please wait 25 seconds before requesting a new OTP.",
  "cooldownSeconds": 25,
  "errorCode": "COOLDOWN_ACTIVE"
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /api/otp/verify`

**Request Body:**
```json
{
  "sessionId": "SES-1694200000000-A1B2C3D4",
  "candidateCode": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully.",
  "sessionToken": "jwt-verified-1694200050000-xxxxx..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "verified": false,
  "message": "Invalid 6-digit verification code. 2 attempt(s) remaining.",
  "attemptsRemaining": 2
}
```

---

### 3. Get Audit Logs
**Endpoint:** `GET /api/otp/logs`

**Response:**
```json
{
  "logs": [
    {
      "requestId": "REQ-1694200000000-E5F6G7H8",
      "channel": "EMAIL",
      "providerId": "GMAIL-SMTP",
      "created": "2024-09-10T10:00:00.000Z",
      "providerStatus": "ACCEPTED",
      "deliveryStatus": "VERIFIED",
      "failureReason": "None",
      "retryCount": 0,
      "recipientMasked": "jo***a@gmail.com",
      "purpose": "Owner Platform Authentication — Successfully Verified"
    }
  ]
}
```

---

### 4. Provider Status
**Endpoint:** `GET /api/otp/provider-status`

**Response:**
```json
{
  "email": {
    "gmailConfigured": true,
    "sendgridConfigured": false,
    "resendConfigured": true,
    "postmarkConfigured": false
  },
  "sms": {
    "africasTalkingConfigured": true,
    "twilioConfigured": true,
    "safaricomConfigured": false
  },
  "whatsapp": {
    "twilioWhatsAppConfigured": true,
    "metaWhatsAppConfigured": false
  },
  "ownerCredentialsConfigured": {
    "email": "jo***a@gmail.com",
    "mobile": "+254••••••813"
  },
  "activeSessionsCount": 3,
  "auditLogsCount": 42
}
```

---

## FRONTEND INTEGRATION

### Install Dependencies
```bash
npm install axios react-hook-form zod
```

### Create OTP Verification Screen

```tsx
// src/components/OtpVerificationScreen.tsx
import { useState } from 'react';
import { otpClientService } from '../services/otpClientService';

export function OtpVerificationScreen() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [sessionId, setSessionId] = useState('');
  const [maskedDest, setMaskedDest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);

  const handleRequest = async (channel: 'EMAIL' | 'SMS' | 'WHATSAPP') => {
    setLoading(true);
    setError('');
    
    const result = await otpClientService.requestOtp({
      identifier: 'jotham',
      channel,
      purpose: 'Platform Authentication',
      userType: 'OWNER',
    });

    if (result.success && result.sessionId) {
      setSessionId(result.sessionId);
      setMaskedDest(result.maskedDestination || '');
      setStep('verify');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    const result = await otpClientService.verifyOtp(sessionId, otp);

    if (result.verified && result.sessionToken) {
      setVerified(true);
      // Save token and redirect
      localStorage.setItem('jjsak_otp_token', result.sessionToken);
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  if (verified) {
    return <div className="text-center">✅ Authentication successful!</div>;
  }

  if (step === 'request') {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Request Verification Code</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        
        <button
          onClick={() => handleRequest('EMAIL')}
          disabled={loading}
          className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          📧 Send to Email ({maskedDest})
        </button>
        
        <button
          onClick={() => handleRequest('SMS')}
          disabled={loading}
          className="w-full mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          📱 Send via SMS
        </button>
        
        <button
          onClick={() => handleRequest('WHATSAPP')}
          disabled={loading}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          💬 Send via WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enter Verification Code</h2>
      <p className="text-sm text-gray-600 mb-4">
        Code sent to {maskedDest}. Valid for 5 minutes.
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        className="w-full px-4 py-2 border border-gray-300 rounded text-center text-2xl tracking-widest font-mono mb-4"
      />

      <button
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
      >
        Verify Code
      </button>

      <button
        onClick={() => setStep('request')}
        disabled={loading}
        className="w-full mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
      >
        Request New Code
      </button>
    </div>
  );
}
```

---

## TESTING & VERIFICATION

### Test Checklist

```bash
# 1. Email Delivery Test
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jothambarasawatila@gmail.com",
    "channel": "EMAIL",
    "userType": "OWNER"
  }'
# ✅ Verify email arrives in inbox with 6-digit code

# 2. SMS Delivery Test
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254741478813",
    "channel": "SMS",
    "userType": "OWNER"
  }'
# ✅ Verify SMS arrives on phone with code

# 3. WhatsApp Delivery Test
curl -X POST http://localhost:3000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254741478813",
    "channel": "WHATSAPP",
    "userType": "OWNER"
  }'
# ✅ Verify WhatsApp message arrives

# 4. Verification Test
SESSION_ID="SES-1694200000000-A1B2C3D4"
OTP_CODE="123456"

curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"candidateCode\": \"$OTP_CODE\"
  }"
# ✅ Returns verified: true with sessionToken

# 5. Rate Limiting Test
# Request OTP twice within 30 seconds
# ✅ Second request returns RATE_LIMITED status

# 6. Lockout Test
# Attempt verification 5 times with wrong codes
# ✅ Account locks and returns "locked: true"

# 7. Audit Log Test
curl -X GET http://localhost:3000/api/otp/logs
# ✅ Verify all requests are logged with full details

# 8. Provider Status Test
curl -X GET http://localhost:3000/api/otp/provider-status
# ✅ Verify configured providers are detected
```

---

## MONITORING & OBSERVABILITY

### Log Levels
```typescript
// Production logs (automatically generated)
[JJSAK-OTP] ✅ OTP delivered successfully via GMAIL-SMTP to jo***a@gmail.com
[JJSAK-OTP] ✅ OTP verified successfully for Jotham Barasa Watila
[JJSAK-OTP] ⚠️ Account locked after 5 failed attempts: Jotham Barasa Watila
[JJSAK-OTP] Delivery failed: AFRICASTALKING-GW | Invalid API key
```

### Metrics to Monitor
1. **Delivery Success Rate** - % of OTP requests accepted by provider
2. **Verification Success Rate** - % of delivered OTPs successfully verified
3. **Provider Health** - Availability of each configured provider
4. **Rate Limiting** - # of rate-limited requests per hour
5. **Failed Attempts** - # of locked accounts (security alert threshold: >10/hour)
6. **Average Response Time** - Time from request to delivery confirmation

### Sentry Integration
```typescript
// Add to server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture OTP delivery failures
backendOtpService.on('delivery_failed', (error) => {
  Sentry.captureException(error, {
    tags: { service: 'otp' },
  });
});
```

---

## TROUBLESHOOTING

### Email Not Arriving

**Issue:** User doesn't receive verification email

**Solutions:**
1. **Check provider configuration**
   ```bash
   curl http://localhost:3000/api/otp/provider-status
   # Verify: gmailConfigured: true OR resendConfigured: true
   ```

2. **Check spam folder**
   - Add security@jjsak.org to contacts
   - Gmail: Check "Promotions" tab

3. **Verify credentials**
   - Gmail app password (16 chars, no spaces/dashes)
   - SendGrid API key starts with "SG."
   - Resend API key starts with "re_"

4. **Check logs**
   ```bash
   curl http://localhost:3000/api/otp/logs | jq '.logs[-5:]'
   # Look for deliveryStatus: FAILED
   # Read failureReason for specific error
   ```

---

### SMS Not Arriving

**Issue:** User doesn't receive verification SMS

**Solutions:**
1. **Verify phone number format**
   ```
   ✅ Correct: +254741478813
   ❌ Wrong: 0741478813 (missing country code)
   ❌ Wrong: 254-741-478-813 (spaces/dashes)
   ```

2. **Check SMS provider credit**
   - Africa's Talking: Dashboard → Account → Balance
   - Twilio: Console → Account Details → Check balance
   - Safaricom: Contact business support

3. **Verify SMS is enabled**
   ```bash
   curl http://localhost:3000/api/otp/provider-status \
     | jq '.sms'
   # Verify: africasTalkingConfigured: true OR twilioConfigured: true
   ```

4. **Check carrier filters**
   - Some carriers filter transactional SMS
   - Try WhatsApp as alternative

---

### WhatsApp Not Arriving

**Issue:** User doesn't receive WhatsApp message

**Solutions:**
1. **Verify WhatsApp number**
   - Must have WhatsApp app installed
   - Number must match account number
   - International format: +country_code_number

2. **Check Meta WhatsApp setup**
   ```bash
   # Verify credentials
   WHATSAPP_BUSINESS_PHONE_ID=<set>
   WHATSAPP_BUSINESS_ACCESS_TOKEN=<set>
   
   # Test API connectivity
   curl https://graph.instagram.com/v18.0/<PHONE_ID>/messages \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Check Twilio WhatsApp Sandbox**
   - Sender must first message sandbox with: `join <code>`
   - Number must be in approved list

---

### Rate Limiting False Positives

**Issue:** User locked out despite correct behavior

**Solutions:**
1. **Check cooldown enforcement**
   ```
   30-second cooldown between requests (working as intended)
   Wait 30 seconds between "Send Code" clicks
   ```

2. **Check lockout threshold**
   ```
   After 5 failed OTP attempts → 15-minute lockout (working as intended)
   All attempts must be successful to reset counter
   ```

3. **Clear rate limiter** (development only)
   ```bash
   # Restart server or implement cache flush endpoint
   curl -X POST http://localhost:3000/api/otp/reset-limits \
     -H "Authorization: Bearer admin-token"
   ```

---

### Provider Fallback Not Working

**Issue:** OTP fails even with multiple providers configured

**Solutions:**
1. **Verify provider chain**
   ```bash
   # For EMAIL: Gmail → Resend → SendGrid → Postmark
   # For SMS: Africa's Talking → Twilio → Safaricom
   # Check that at least ONE is configured:
   curl http://localhost:3000/api/otp/provider-status
   ```

2. **Check logs for cascade failure**
   ```bash
   curl http://localhost:3000/api/otp/logs | jq '.logs[0]'
   # Look at providerId: should show which provider was tried
   ```

3. **Add debugging logs**
   ```typescript
   // In backendOtpService.ts
   console.log(`[DEBUG] Trying provider: ${provider.name}`);
   console.log(`[DEBUG] Result: ${JSON.stringify(result)}`);
   ```

---

### High Latency on OTP Request

**Issue:** `/api/otp/request` takes >2 seconds

**Solutions:**
1. **Check network connectivity**
   - Ping provider endpoints
   - Check firewall rules

2. **Enable request timeouts**
   ```typescript
   const response = await fetch(url, {
     method: 'POST',
     signal: AbortSignal.timeout(5000), // 5 second timeout
   });
   ```

3. **Switch to async processing**
   ```typescript
   // Queue OTP delivery on background job
   // Return immediately with sessionId
   // Delivery happens asynchronously
   ```

---

## Support & Escalation

**Contact Support:**
- Email: jothambarasawatila@gmail.com
- Phone: +254741478813
- Status Page: https://jjsak.statuspage.io

**Emergency Contacts:**
- Jotham Barasa Watila: jothambarasawatila@gmail.com
- Platform Owner: security@jjsak.org

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-10  
**Maintained By:** JJSAK Security Team
