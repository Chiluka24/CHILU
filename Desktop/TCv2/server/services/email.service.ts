// Email service for verification, password-reset and password-changed flows.
// (Was at root in the monolith: ./email-service.ts)

import * as nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️  Email service not configured. Emails will be logged to console only.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transport = getTransporter();

  if (!transport) {
    console.log('\n📧 [EMAIL - DEV MODE]');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html);
    console.log('---\n');
    return true;
  }

  try {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (err) {
    console.error('❌ Email send error:', err);
    return false;
  }
};

// ── Templates ───────────────────────────────────────────────────────────────
// In a future iteration these can be moved to `server/services/email-templates/*.html`
// and rendered with a templating engine — for now they're inline strings.

export const sendVerificationEmail = async (
  email: string,
  username: string,
  token: string
): Promise<boolean> => {
  const verificationUrl = `${env.APP_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html><head><style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #1A0F08; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #1A0F08; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      .code { background: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 16px; letter-spacing: 2px; text-align: center; margin: 20px 0; }
    </style></head>
    <body><div class="container">
      <div class="header"><h1 style="margin:0;font-size:28px;">The Crumb</h1><p style="margin:10px 0 0 0;opacity:0.9;">Verify Your Email</p></div>
      <div class="content">
        <h2>Welcome, ${username}!</h2>
        <p>Thank you for signing up for The Crumb. To complete your registration and start building your link-in-bio page, please verify your email address.</p>
        <div style="text-align:center;"><a href="${verificationUrl}" class="button">Verify Email Address</a></div>
        <p>Or copy and paste this link into your browser:</p>
        <div class="code">${verificationUrl}</div>
        <p style="color:#6b7280;font-size:14px;margin-top:30px;">This link will expire in 24 hours. If you didn't create an account with The Crumb, you can safely ignore this email.</p>
      </div>
      <div class="footer"><p>© 2026 The Crumb. All rights reserved.</p></div>
    </div></body></html>`;

  const text = `Welcome to The Crumb, ${username}!\n\nPlease verify your email address:\n${verificationUrl}\n\nThis link will expire in 24 hours.`;

  return sendEmail({ to: email, subject: 'Verify Your Email - The Crumb', html, text });
};

export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  token: string
): Promise<boolean> => {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html><head><style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #1A0F08; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #1A0F08; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style></head>
    <body><div class="container">
      <div class="header"><h1 style="margin:0;font-size:28px;">The Crumb</h1><p style="margin:10px 0 0 0;opacity:0.9;">Password Reset Request</p></div>
      <div class="content">
        <h2>Hi ${username},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align:center;"><a href="${resetUrl}" class="button">Reset Password</a></div>
        <div class="warning"><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.</div>
        <p style="color:#6b7280;font-size:14px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
      <div class="footer"><p>© 2026 The Crumb. All rights reserved.</p></div>
    </div></body></html>`;

  const text = `Hi ${username},\n\nWe received a request to reset your password.\n\n${resetUrl}\n\nThis link expires in 1 hour.`;

  return sendEmail({ to: email, subject: 'Reset Your Password - The Crumb', html, text });
};

export const sendPasswordChangedEmail = async (
  email: string,
  username: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html><head><style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #1A0F08; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
      .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      .success { background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style></head>
    <body><div class="container">
      <div class="header"><h1 style="margin:0;font-size:28px;">The Crumb</h1><p style="margin:10px 0 0 0;opacity:0.9;">Password Changed</p></div>
      <div class="content">
        <h2>Hi ${username},</h2>
        <div class="success"><strong>✅ Success:</strong> Your password has been changed successfully.</div>
        <p>If you made this change, no further action is needed.</p>
        <p style="color:#DC2626;font-weight:500;">If you did NOT make this change, please contact support immediately at support@thecrumb.co</p>
      </div>
      <div class="footer"><p>© 2026 The Crumb. All rights reserved.</p></div>
    </div></body></html>`;

  const text = `Hi ${username},\n\nYour password for The Crumb has been changed successfully.\n\nIf you did NOT make this change, please contact support@thecrumb.co immediately.`;

  return sendEmail({ to: email, subject: 'Password Changed - The Crumb', html, text });
};
