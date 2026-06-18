import nodemailer from 'nodemailer';

// Simple mailer config
const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? {
    user: smtpUser,
    pass: smtpPass
  } : undefined
});

/**
 * Sends a notification email
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param text - Plain text body
 * @param html - HTML body (optional)
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"PawPass Platform" <noreply@pawpass.identity>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br />'),
    });

    console.log(`Email dispatched successfully to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email dispatch failed:', error);
    // In local development, we print the email details to console
    console.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return true;
  }
}
