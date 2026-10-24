/**
 * Real OTP Service for SMS and Email
 * Supports:
 * - SMS: Semaphore (Philippines), Twilio (International)
 * - Email: Resend API or Gmail/SMTP (via Nodemailer)
 */

import nodemailer from 'nodemailer';

export interface SendOtpResult {
  sent: boolean;
  provider: 'semaphore' | 'twilio' | 'resend' | 'smtp' | 'console';
  message: string;
  errorDetail?: string;
}

/**
 * Send real 6-digit SMS OTP to actual mobile phone
 */
export async function sendRealSmsOtp(phone: string, code: string): Promise<SendOtpResult> {
  const messageText = `Your KONEKTA verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;

  // 1. Try Philippine SMS via Semaphore API (semaphore.co)
  const semaphoreApiKey = process.env.SEMAPHORE_API_KEY?.trim();
  if (semaphoreApiKey) {
    try {
      // Semaphore works best with 11-digit Philippine format: 09171234567
      let cleanNumber = phone.replace(/\D/g, '');
      if (cleanNumber.startsWith('63') && cleanNumber.length === 12) {
        cleanNumber = '0' + cleanNumber.substring(2);
      } else if (!cleanNumber.startsWith('0') && cleanNumber.length === 10) {
        cleanNumber = '0' + cleanNumber;
      }

      const params: Record<string, string> = {
        apikey: semaphoreApiKey,
        number: cleanNumber,
        message: messageText,
      };

      // Only include sendername if explicitly set and approved in Semaphore account
      if (process.env.SEMAPHORE_SENDER_NAME && process.env.SEMAPHORE_SENDER_NAME.trim() !== '') {
        params.sendername = process.env.SEMAPHORE_SENDER_NAME.trim();
      }

      const response = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
      });

      if (response.ok) {
        console.log(`[SMS-SEMAPHORE] Real SMS OTP successfully sent to ${cleanNumber}`);
        return { sent: true, provider: 'semaphore', message: 'SMS sent to your phone.' };
      } else {
        const errorBody = await response.text();
        console.warn(`[SMS-SEMAPHORE] Semaphore error response:`, errorBody);
        return {
          sent: false,
          provider: 'semaphore',
          message: 'Semaphore failed to send SMS.',
          errorDetail: errorBody,
        };
      }
    } catch (err: any) {
      console.error('[SMS-SEMAPHORE] Failed to send via Semaphore:', err);
      return {
        sent: false,
        provider: 'semaphore',
        message: 'Network error contacting Semaphore.',
        errorDetail: err?.message || String(err),
      };
    }
  }

  // 2. Try Global SMS via Twilio API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_PHONE;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioFrom,
          Body: messageText,
        }),
      });

      if (response.ok) {
        console.log(`[SMS-TWILIO] Real SMS OTP successfully sent to ${phone}`);
        return { sent: true, provider: 'twilio', message: 'SMS sent to your phone.' };
      } else {
        const errorText = await response.text();
        console.warn(`[SMS-TWILIO] Twilio error:`, errorText);
      }
    } catch (err) {
      console.error('[SMS-TWILIO] Failed to send via Twilio:', err);
    }
  }

  // 3. Fallback: Log to console when no API keys are configured yet
  console.log(`[REAL-SMS-FALLBACK] No SMS API key configured in env. OTP for ${phone} is: ${code}`);
  return {
    sent: false,
    provider: 'console',
    message: 'To receive real SMS, set SEMAPHORE_API_KEY (Philippines) or TWILIO_ACCOUNT_SID in Render Environment Variables.',
  };
}

/**
 * Send real 6-digit Email OTP to actual email address
 */
export async function sendRealEmailOtp(email: string, code: string): Promise<SendOtpResult> {
  const subject = `Your KONEKTA Verification Code: ${code}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E4E7EC; rounded: 16px;">
      <h2 style="color: #101A35; margin-bottom: 8px;">KONEKTA Verification</h2>
      <p style="color: #667085; font-size: 14px;">Use the following 6-digit code to complete your login or registration:</p>
      <div style="background: #F4F7FB; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1677FF;">${code}</span>
      </div>
      <p style="color: #667085; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  // 1. Try Resend API (resend.com)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'KONEKTA <onboarding@resend.dev>',
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        console.log(`[EMAIL-RESEND] Real Email OTP successfully sent to ${email}`);
        return { sent: true, provider: 'resend', message: 'Email sent to your inbox.' };
      } else {
        const errorText = await response.text();
        console.warn(`[EMAIL-RESEND] Resend error:`, errorText);
        return {
          sent: false,
          provider: 'resend',
          message: 'Resend failed to send email.',
          errorDetail: errorText,
        };
      }
    } catch (err: any) {
      console.error('[EMAIL-RESEND] Failed to send email via Resend:', err);
      return {
        sent: false,
        provider: 'resend',
        message: 'Network error calling Resend.',
        errorDetail: err?.message || String(err),
      };
    }
  }

  // 2. Try Gmail / SMTP via Nodemailer
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"KONEKTA" <${smtpUser}>`,
        to: email,
        subject,
        html: htmlContent,
      });

      console.log(`[EMAIL-SMTP] Real Email OTP successfully sent to ${email}`);
      return { sent: true, provider: 'smtp', message: 'Email sent to your inbox.' };
    } catch (err) {
      console.error('[EMAIL-SMTP] Failed to send email via SMTP:', err);
    }
  }

  // 3. Fallback
  console.log(`[REAL-EMAIL-FALLBACK] No Email API key configured. OTP for ${email} is: ${code}`);
  return {
    sent: false,
    provider: 'console',
    message: 'To receive real emails, set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD in Render Environment Variables.',
  };
}