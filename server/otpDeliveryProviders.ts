/**
 * JJSAK OTP DELIVERY PROVIDERS
 * Requirement ID: JJSAK-AUTH-OTP-004
 * 
 * REAL delivery integrations for:
 * 1. EMAIL: SMTP (Gmail, SendGrid, Resend), Postmark
 * 2. SMS: Africa's Talking, Twilio, Safaricom
 * 3. WHATSAPP: WhatsApp Business API, Twilio WhatsApp
 * 
 * NO MOCK DELIVERIES - All messages are sent to real destinations
 * Each provider confirms delivery acceptance or fails transparently
 */

import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

export type DeliveryChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface DeliveryResult {
  accepted: boolean;
  providerId: string;
  messageId?: string;
  status: 'ACCEPTED' | 'REJECTED' | 'FAILED';
  failureReason?: string;
  timestamp: string;
}

// ============================================================================
// EMAIL DELIVERY PROVIDERS
// ============================================================================

export class EmailDeliveryProvider {
  /**
   * Option 1: GMAIL SMTP (Personal/GSuite)
   * Requires: Gmail app password (2FA enabled)
   * Env vars: GMAIL_ADDRESS, GMAIL_APP_PASSWORD
   */
  static async deliverViaGmail(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const gmailAddress = process.env.GMAIL_ADDRESS;
      const gmailPassword = process.env.GMAIL_APP_PASSWORD;

      if (!gmailAddress || !gmailPassword) {
        return {
          accepted: false,
          providerId: 'GMAIL-SMTP',
          status: 'FAILED',
          failureReason: 'Gmail credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailAddress,
          pass: gmailPassword,
        },
      });

      const info = await transporter.sendMail({
        from: `"JJSAK Security" <${gmailAddress}>`,
        to: recipient,
        subject: '[JJSAK] Single-Use Verification Code',
        html: EmailDeliveryProvider.generateEmailHtml(otp, purpose),
        text: `Your JJSAK verification code is: ${otp}. Valid for 5 minutes. Purpose: ${purpose}`,
        headers: {
          'X-JJSAK-OTP': 'true',
          'X-Delivery-Channel': 'EMAIL',
        },
      });

      return {
        accepted: true,
        providerId: 'GMAIL-SMTP',
        messageId: info.messageId,
        status: 'ACCEPTED',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'GMAIL-SMTP',
        status: 'FAILED',
        failureReason: err.message || 'SMTP connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 2: SENDGRID API (Production Email)
   * Requires: SendGrid API key with mail send permission
   * Env var: SENDGRID_API_KEY
   */
  static async deliverViaSendGrid(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;

      if (!apiKey) {
        return {
          accepted: false,
          providerId: 'SENDGRID-API',
          status: 'FAILED',
          failureReason: 'SendGrid API key not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: recipient }],
              subject: '[JJSAK] Single-Use Verification Code',
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'security@jjsak.org',
            name: 'JJSAK Security Authority',
          },
          content: [
            {
              type: 'text/html',
              value: EmailDeliveryProvider.generateEmailHtml(otp, purpose),
            },
            {
              type: 'text/plain',
              value: `Your JJSAK verification code is: ${otp}. Valid for 5 minutes.`,
            },
          ],
          headers: {
            'X-JJSAK-OTP': 'true',
          },
        }),
      });

      if (response.status === 202) {
        return {
          accepted: true,
          providerId: 'SENDGRID-API',
          messageId: `sendgrid-${Date.now()}`,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      const errorData: any = await response.json();
      return {
        accepted: false,
        providerId: 'SENDGRID-API',
        status: 'REJECTED',
        failureReason: errorData.errors?.[0]?.message || 'SendGrid rejected the request',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'SENDGRID-API',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 3: RESEND (Modern email for developers)
   * Requires: Resend API key
   * Env var: RESEND_API_KEY
   */
  static async deliverViaResend(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        return {
          accepted: false,
          providerId: 'RESEND-API',
          status: 'FAILED',
          failureReason: 'Resend API key not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'JJSAK Security <security@jjsak.org>',
          to: recipient,
          subject: '[JJSAK] Single-Use Verification Code',
          html: EmailDeliveryProvider.generateEmailHtml(otp, purpose),
          text: `Your JJSAK verification code is: ${otp}. Valid for 5 minutes.`,
          headers: { 'X-JJSAK-OTP': 'true' },
        }),
      });

      const data: any = await response.json();

      if (response.ok && data.id) {
        return {
          accepted: true,
          providerId: 'RESEND-API',
          messageId: data.id,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'RESEND-API',
        status: 'REJECTED',
        failureReason: data.message || 'Resend API rejected the request',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'RESEND-API',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 4: POSTMARK (Transactional email)
   * Requires: Postmark API token
   * Env var: POSTMARK_API_TOKEN
   */
  static async deliverViaPostmark(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const apiToken = process.env.POSTMARK_API_TOKEN;

      if (!apiToken) {
        return {
          accepted: false,
          providerId: 'POSTMARK-API',
          status: 'FAILED',
          failureReason: 'Postmark API token not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': apiToken,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          From: 'security@jjsak.org',
          To: recipient,
          Subject: '[JJSAK] Single-Use Verification Code',
          HtmlBody: EmailDeliveryProvider.generateEmailHtml(otp, purpose),
          TextBody: `Your JJSAK verification code is: ${otp}. Valid for 5 minutes.`,
          Headers: [
            {
              Name: 'X-JJSAK-OTP',
              Value: 'true',
            },
          ],
        }),
      });

      const data: any = await response.json();

      if (response.ok && data.MessageID) {
        return {
          accepted: true,
          providerId: 'POSTMARK-API',
          messageId: data.MessageID,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'POSTMARK-API',
        status: 'REJECTED',
        failureReason: data.Message || 'Postmark rejected the request',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'POSTMARK-API',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static generateEmailHtml(otp: string, purpose: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #991b1b; padding: 12px 16px; border-radius: 8px; color: #ffffff; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
          🔒 JJSAK SECURITY NOTIFICATION
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          A single-use verification code was requested for <strong>${purpose}</strong>.
        </p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin: 0 0 8px 0;">
            Your Verification Code
          </p>
          <p style="font-size: 36px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 8px; color: #0f172a; margin: 0;">
            ${otp}
          </p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>⚠️ Important:</strong> This code expires in <strong>5 minutes</strong>. Never share this code with anyone.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0;">
          If you did not request this code, ignore this email and lock your account immediately.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <p style="color: #94a3b8; font-size: 10px; text-align: center; margin: 0;">
          JJSAK Institutional CBE Platform | Secure Authentication Gateway
        </p>
      </div>
    `;
  }
}

// ============================================================================
// SMS DELIVERY PROVIDERS
// ============================================================================

export class SmsDeliveryProvider {
  /**
   * Option 1: AFRICA'S TALKING (Primary for Kenya +254)
   * Requires: Africa's Talking username & API key
   * Env vars: AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY, AFRICASTALKING_SENDER_ID
   */
  static async deliverViaAfricasTalking(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const username = process.env.AFRICASTALKING_USERNAME;
      const apiKey = process.env.AFRICASTALKING_API_KEY;
      const senderId = process.env.AFRICASTALKING_SENDER_ID || 'JJSAK';

      if (!username || !apiKey) {
        return {
          accepted: false,
          providerId: 'AFRICASTALKING-SMS',
          status: 'FAILED',
          failureReason: 'Africa\'s Talking credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const message = `[JJSAK] Your verification code: ${otp}. Valid for 5 minutes. Do not share.`;
      const params = new URLSearchParams({
        username,
        to: recipient,
        message,
        from: senderId,
      });

      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      const data: any = await response.json();
      const recipientStatus = data?.SMSMessageData?.Recipients?.[0];

      if (recipientStatus?.status === 'Success') {
        return {
          accepted: true,
          providerId: 'AFRICASTALKING-SMS',
          messageId: recipientStatus.messageId,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'AFRICASTALKING-SMS',
        status: 'REJECTED',
        failureReason: recipientStatus?.status || 'Africa\'s Talking rejected the SMS',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'AFRICASTALKING-SMS',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 2: TWILIO SMS (Global SMS provider)
   * Requires: Twilio Account SID, Auth Token, Phone Number
   * Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   */
  static async deliverViaTwilio(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        return {
          accepted: false,
          providerId: 'TWILIO-SMS',
          status: 'FAILED',
          failureReason: 'Twilio credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const message = `[JJSAK] Your verification code: ${otp}. Valid for 5 minutes. Do not share.`;
      const params = new URLSearchParams({
        To: recipient,
        From: fromNumber,
        Body: message,
      });

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data: any = await response.json();

      if (response.ok && data.sid) {
        return {
          accepted: true,
          providerId: 'TWILIO-SMS',
          messageId: data.sid,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'TWILIO-SMS',
        status: 'REJECTED',
        failureReason: data.message || 'Twilio rejected the SMS',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'TWILIO-SMS',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 3: SAFARICOM BULK SMS (Kenya-specific)
   * Requires: Safaricom API credentials
   * Env vars: SAFARICOM_API_KEY, SAFARICOM_PARTNER_ID, SAFARICOM_SHORTCODE
   */
  static async deliverViaSafaricom(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const apiKey = process.env.SAFARICOM_API_KEY;
      const partnerId = process.env.SAFARICOM_PARTNER_ID;
      const shortcode = process.env.SAFARICOM_SHORTCODE;

      if (!apiKey || !partnerId || !shortcode) {
        return {
          accepted: false,
          providerId: 'SAFARICOM-SMS',
          status: 'FAILED',
          failureReason: 'Safaricom credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      const message = `[JJSAK] Your verification code: ${otp}. Valid for 5 minutes. Do not share.`;

      const response = await fetch('https://bulksms.safaricom.co.ke/SendSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          mobile: recipient,
          message,
          shortcode,
          partnerID: partnerId,
          timestamp: new Date().toISOString(),
        }),
      });

      const data: any = await response.json();

      if (data.success || data.status === '0') {
        return {
          accepted: true,
          providerId: 'SAFARICOM-SMS',
          messageId: data.transactionId || `safaricom-${Date.now()}`,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'SAFARICOM-SMS',
        status: 'REJECTED',
        failureReason: data.error || 'Safaricom rejected the SMS',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'SAFARICOM-SMS',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// ============================================================================
// WHATSAPP DELIVERY PROVIDERS
// ============================================================================

export class WhatsAppDeliveryProvider {
  /**
   * Option 1: TWILIO WHATSAPP (Global WhatsApp API)
   * Requires: Twilio WhatsApp Sandbox or Approved Business Account
   * Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
   */
  static async deliverViaTwilioWhatsApp(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!accountSid || !authToken || !fromWhatsAppNumber) {
        return {
          accepted: false,
          providerId: 'TWILIO-WHATSAPP',
          status: 'FAILED',
          failureReason: 'Twilio WhatsApp credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      // Ensure recipient is in WhatsApp format (whatsapp:+country_code_number)
      const whatsappRecipient = recipient.startsWith('whatsapp:')
        ? recipient
        : `whatsapp:+${recipient.replace(/\D/g, '')}`;

      const message = `🔐 *JJSAK Verification Code*\n\nYour code: *${otp}*\n\n⏱️ Valid for 5 minutes\n🚫 Do not share this code`;

      const params = new URLSearchParams({
        To: whatsappRecipient,
        From: fromWhatsAppNumber,
        Body: message,
      });

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data: any = await response.json();

      if (response.ok && data.sid) {
        return {
          accepted: true,
          providerId: 'TWILIO-WHATSAPP',
          messageId: data.sid,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'TWILIO-WHATSAPP',
        status: 'REJECTED',
        failureReason: data.message || 'Twilio WhatsApp rejected the message',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'TWILIO-WHATSAPP',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Option 2: META WHATSAPP BUSINESS API (Official WhatsApp Business)
   * Requires: Meta Business Account, WhatsApp Business App, Access Token
   * Env vars: WHATSAPP_BUSINESS_PHONE_ID, WHATSAPP_BUSINESS_ACCESS_TOKEN, WHATSAPP_BUSINESS_API_VERSION
   */
  static async deliverViaMetaWhatsApp(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    try {
      const phoneId = process.env.WHATSAPP_BUSINESS_PHONE_ID;
      const accessToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
      const apiVersion = process.env.WHATSAPP_BUSINESS_API_VERSION || 'v18.0';

      if (!phoneId || !accessToken) {
        return {
          accepted: false,
          providerId: 'META-WHATSAPP',
          status: 'FAILED',
          failureReason: 'Meta WhatsApp Business credentials not configured',
          timestamp: new Date().toISOString(),
        };
      }

      // Ensure recipient is in international format
      const cleanNumber = recipient.replace(/\D/g, '');
      const internationalNumber = cleanNumber.startsWith('254')
        ? cleanNumber
        : `254${cleanNumber.slice(-9)}`;

      const response = await fetch(
        `https://graph.instagram.com/${apiVersion}/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: internationalNumber,
            type: 'template',
            template: {
              name: 'jjsak_otp_verification',
              language: {
                code: 'en',
              },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: otp,
                    },
                  ],
                },
              ],
            },
          }),
        }
      );

      const data: any = await response.json();

      if (data.messages?.[0]?.id) {
        return {
          accepted: true,
          providerId: 'META-WHATSAPP',
          messageId: data.messages[0].id,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        accepted: false,
        providerId: 'META-WHATSAPP',
        status: 'REJECTED',
        failureReason: data.error?.message || 'Meta WhatsApp rejected the message',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        accepted: false,
        providerId: 'META-WHATSAPP',
        status: 'FAILED',
        failureReason: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// ============================================================================
// ROUTER: Automatically select best available provider per channel
// ============================================================================

export class OtpDeliveryRouter {
  static async deliverEmail(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    // Try in order of preference/configuration
    const providers = [
      () => EmailDeliveryProvider.deliverViaGmail(recipient, otp, purpose),
      () => EmailDeliveryProvider.deliverViaResend(recipient, otp, purpose),
      () => EmailDeliveryProvider.deliverViaSendGrid(recipient, otp, purpose),
      () => EmailDeliveryProvider.deliverViaPostmark(recipient, otp, purpose),
    ];

    for (const provider of providers) {
      const result = await provider();
      if (result.accepted) return result;
    }

    // All email providers failed
    return {
      accepted: false,
      providerId: 'EMAIL-ALL-FAILED',
      status: 'FAILED',
      failureReason: 'All email providers failed or are not configured',
      timestamp: new Date().toISOString(),
    };
  }

  static async deliverSms(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    // Try in order of preference for Kenya
    const providers = [
      () => SmsDeliveryProvider.deliverViaAfricasTalking(recipient, otp, purpose),
      () => SmsDeliveryProvider.deliverViaSafaricom(recipient, otp, purpose),
      () => SmsDeliveryProvider.deliverViaTwilio(recipient, otp, purpose),
    ];

    for (const provider of providers) {
      const result = await provider();
      if (result.accepted) return result;
    }

    // All SMS providers failed
    return {
      accepted: false,
      providerId: 'SMS-ALL-FAILED',
      status: 'FAILED',
      failureReason: 'All SMS providers failed or are not configured',
      timestamp: new Date().toISOString(),
    };
  }

  static async deliverWhatsApp(
    recipient: string,
    otp: string,
    purpose: string
  ): Promise<DeliveryResult> {
    // Try in order of preference
    const providers = [
      () => WhatsAppDeliveryProvider.deliverViaMetaWhatsApp(recipient, otp, purpose),
      () => WhatsAppDeliveryProvider.deliverViaTwilioWhatsApp(recipient, otp, purpose),
    ];

    for (const provider of providers) {
      const result = await provider();
      if (result.accepted) return result;
    }

    // All WhatsApp providers failed
    return {
      accepted: false,
      providerId: 'WHATSAPP-ALL-FAILED',
      status: 'FAILED',
      failureReason: 'All WhatsApp providers failed or are not configured',
      timestamp: new Date().toISOString(),
    };
  }
}

export default OtpDeliveryRouter;
