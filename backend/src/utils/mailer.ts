import nodemailer from 'nodemailer';
import dns from 'dns';

// Render IPv6 chiqishini qo'llab-quvvatlamaydi (ENETUNREACH).
// DNS'ni IPv4'ni birinchi qaytaradigan qilamiz.
dns.setDefaultResultOrder('ipv4first');

/**
 * Email yuborish. Agar SMTP sozlamalari (.env) mavjud bo'lsa — haqiqiy email yuboriladi,
 * aks holda konsolga chiqariladi (lokal ishlab chiqish uchun).
 *
 * .env namunasi (Gmail):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=youremail@gmail.com
 *   SMTP_PASS=app_password   (Gmail "App password")
 *   SMTP_FROM="To'yxona <youremail@gmail.com>"
 */

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const port = Number(SMTP_PORT) || 465;

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL, 587/2525 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      family: 4, // IPv4'ga majburlash (Render IPv6 ulanmaydi)
      // 3 daqiqa osilib qolmasligi uchun qisqa timeoutlar
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    } as any)
  : null;

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const subject = "To'yxona — tasdiqlash kodi";
  const html = otpTemplate(otp);

  if (!transporter) {
    // SMTP sozlanmagan — lokal rejim
    console.log(`\n📧 [MOCK EMAIL] ${to} uchun tasdiqlash kodi: ${otp}\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Tasdiqlash kodi ${to} manziliga yuborildi`);
  } catch (err: any) {
    // Aniq xatoni log'ga chiqaramiz (Render Logs'da ko'rinadi)
    console.error(`❌ Email yuborishda xato (${to}):`, err?.code || '', err?.message || err);
    throw err;
  }
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
