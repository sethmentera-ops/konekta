import nodemailer from 'nodemailer';

export interface SendOtpResult {
  sent: boolean;
  provider: 'semaphore' | 'twilio' | 'resend' | 'smtp' | 'console';
  message: string;
}

export async function sendRealSmsOtp(phone: string, code: string): Promise<SendOtpResult> {
  const messageText = `Ang iyong KONEKTA verification code ay: ${code}. Valid sa loob ng 5 minuto. Huwag itong ipamigay.`;

  // 1. Semaphore (Pilipinas)
  const semaphoreApiKey = process.env.SEMAPHORE_API_KEY;
  if (semaphoreApiKey) {
    try {
      const cleanNumber = phone.replace(/^\+/, '');
      const response = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          apikey: semaphoreApiKey,
          number: cleanNumber,
          message: messageText,
        }),
      });

      if (response.ok) {
        return { sent: true, provider: 'semaphore', message: 'Naipadala ang SMS sa iyong cellphone.' };
      }
    } catch (err) {
      console.error('[SMS-ERROR]', err);
    }
  }

  // 2. Twilio (International)
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
        return { sent: true, provider: 'twilio', message: 'SMS sent to your phone.' };
      }
    } catch (err) {
      console.error('[TWILIO-ERROR]', err);
    }
  }

  return {
    sent: false,
    provider: 'console',
    message: 'Ilagay ang SEMAPHORE_API_KEY sa Render para sa totoong SMS.',
  };
}

export async function sendRealEmailOtp(email: string, code: string): Promise<SendOtpResult> {
  const subject = `Your KONEKTA Verification Code: ${code}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E4E7EC; border-radius: 16px;">
      <h2 style="color: #101A35;">KONEKTA Verification</h2>
      <p style="color: #667085; font-size: 14px;">Gamitin ang 6-digit code na ito para mag-login o mag-sign up:</p>
      <div style="background: #F4F7FB; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1677FF;">${code}</span>
      </div>
      <p style="color: #667085; font-size: 12px;">Valid ang code sa loob ng 5 minuto.</p>
    </div>
  `;

  // Resend API (Libre 3,000 emails/month)
  const resendApiKey = process.env.RESEND_API_KEY;
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
        return { sent: true, provider: 'resend', message: 'Naipadala ang email sa iyong inbox.' };
      }
    } catch (err) {
      console.error('[EMAIL-ERROR]', err);
    }
  }

  // Gmail SMTP
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"KONEKTA" <${smtpUser}>`,
        to: email,
        subject,
        html: htmlContent,
      });

      return { sent: true, provider: 'smtp', message: 'Email sent to your inbox.' };
    } catch (err) {
      console.error('[SMTP-ERROR]', err);
    }
  }

  return {
    sent: false,
    provider: 'console',
    message: 'Ilagay ang RESEND_API_KEY o GMAIL credentials sa Render para sa totoong email.',
  };
}