import nodemailer from 'nodemailer';
import dns from 'dns';

// Render IPv6 chiqishini qo'llab-quvvatlamaydi (ENETUNREACH).
dns.setDefaultResultOrder('ipv4first');

/**
 * Email yuborish. Bir nechta usulni qo'llab-quvvatlaydi (tartib bilan):
 *   1. Resend  (RESEND_API_KEY)  — HTTP API, port 443
 *   2. Brevo   (BREVO_API_KEY)   — HTTP API, port 443
 *   3. SMTP    (SMTP_HOST...)     — lokal ishlab chiqish uchun
 *   4. Mock    — konsolga chiqaradi
 *
 * MUHIM: Render (bepul tarif) chiquvchi SMTP portlarini (465/587) bloklaydi,
 * shuning uchun Render'da HTTP API (Resend yoki Brevo) ishlatish kerak.
 *
 * .env namunasi (Brevo):
 *   BREVO_API_KEY=xkeysib-...
 *   EMAIL_FROM=siz@gmail.com           (Brevo'da tasdiqlangan sender)
 *   EMAIL_FROM_NAME=To'yxona
 */

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,
  RESEND_API_KEY, BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME,
} = process.env;

const port = Number(SMTP_PORT) || 465;

const smtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      family: 4,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    } as any)
  : null;

const fromEmail = EMAIL_FROM || SMTP_USER || 'onboarding@resend.dev';
const fromName = EMAIL_FROM_NAME || "To'yxona";

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const subject = "To'yxona — tasdiqlash kodi";
  const html = otpTemplate(otp);

  try {
    if (RESEND_API_KEY) {
      await sendViaResend(to, subject, html);
      console.log(`📧 (Resend) Tasdiqlash kodi ${to} manziliga yuborildi`);
      return;
    }
    if (BREVO_API_KEY) {
      await sendViaBrevo(to, subject, html);
      console.log(`📧 (Brevo) Tasdiqlash kodi ${to} manziliga yuborildi`);
      return;
    }
    if (transporter) {
      await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject, html });
      console.log(`📧 (SMTP) Tasdiqlash kodi ${to} manziliga yuborildi`);
      return;
    }
    // Hech qaysi usul sozlanmagan — lokal mock rejim
    console.log(`\n📧 [MOCK EMAIL] ${to} uchun tasdiqlash kodi: ${otp}\n`);
  } catch (err: any) {
    console.error(`❌ Email yuborishda xato (${to}):`, err?.code || '', err?.message || err);
    throw err;
  }
}

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendViaBrevo(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY as string,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

function otpTemplate(otp: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9f3e9;border-radius:16px;">
    <h2 style="color:#1b4079;margin:0 0 8px;">To'yxona</h2>
    <p style="color:#6b574e;margin:0 0 20px;">Hisobingizni tasdiqlash uchun quyidagi koddan foydalaning:</p>
    <div style="background:#fff;border:2px dashed #e0a82e;border-radius:12px;padding:18px;text-align:center;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#b23a2e;">${otp}</span>
    </div>
    <p style="color:#6b574e;font-size:13px;margin:20px 0 0;">Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xabarga e'tibor bermang.</p>
  </div>`;
}
