/**
 * =============================================================================
 * Email Service - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Simple email service using Nodemailer
 * Supports any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
 * 
 * =============================================================================
 */

import nodemailer from "nodemailer"

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Create email transporter
 * Configure with your SMTP provider
 */
function createTransporter() {
  // Option 1: Gmail (with app password)
  // Note: Use App Password, not regular password
  // Get from: https://myaccount.google.com/apppasswords
  const gmailUser = process.env.SMTP_GMAIL_USER
  const gmailPass = process.env.SMTP_GMAIL_PASSWORD

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })
  }

  // Option 2: Custom SMTP
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD

  if (smtpHost && smtpUser) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "587"),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  }

  // No SMTP configured - return null
  return null
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log("[Email] No SMTP configured - email not sent")
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SunnyGPT" <noreply@sunnygpt.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      html: options.html,
    })
    
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`)
    return true
  } catch (error) {
    console.error("[Email] Failed to send:", error)
    return false
  }
}

// ============================================================================
// WELCOME EMAIL
// ============================================================================

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to SunnyGPT!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to SunnyGPT!</h1>
        <p>Hi ${name || "there"},</p>
        <p>Thank you for joining SunnyGPT! We're excited to have you on board.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Chat with AI using Google, GitHub, or Facebook login</li>
          <li>Access your private chat portal</li>
          <li>Store and manage your conversations</li>
        </ul>
        <p>Get started by logging in at: <a href="https://sunnygpt-five.vercel.app/login">https://sunnygpt-five.vercel.app/login</a></p>
        <p>If you have any questions, feel free to reach out!</p>
        <p>Best regards,<br/>The SunnyGPT Team</p>
      </div>
    `,
  })
}

// ============================================================================
// NOTIFICATION EMAIL
// ============================================================================

/**
 * Send notification email to users
 */
export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `[SunnyGPT] ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">${title}</h2>
        <p>${message}</p>
        <p><a href="https://sunnygpt-five.vercel.app/portal/chat" style="color: #4F46E5;">Go to Chat Portal</a></p>
      </div>
    `,
  })
}

// ============================================================================
// ADMIN NOTIFICATION
// ============================================================================

/**
 * Send notification to admin when new user signs up
 */
export async function sendAdminNewUserNotification(
  adminEmail: string,
  userName: string,
  userEmail: string
): Promise<boolean> {
  return sendEmail({
    to: adminEmail,
    subject: "New User Signed Up - SunnyGPT",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333EA;">New User Alert</h2>
        <p>A new user has signed up to SunnyGPT:</p>
        <ul>
          <li><strong>Name:</strong> ${userName || "N/A"}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>View in <a href="https://sunnygpt-five.vercel.app/admin/users">Admin Dashboard</a></p>
      </div>
    `,
  })
}