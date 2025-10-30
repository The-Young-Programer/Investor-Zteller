import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

export function getNodemailerTransporter() {
  if (transporter) {
    return transporter
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587")
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("SMTP configuration is incomplete. Email functionality will be limited.")
    
    // In production, we should fail gracefully rather than throwing an error
    if (process.env.NODE_ENV === 'production') {
      // Create a mock transporter that logs instead of sending
      return {
        sendMail: async (mailOptions: any) => {
          console.log('Email would have been sent:', mailOptions);
          return { messageId: 'mock-id-' + Date.now() };
        }
      } as any;
    } else {
      throw new Error(
        "SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.",
      )
    }
  }

  // Define SMTP transport options
  const transportOptions = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Add connection pool for production reliability
    pool: process.env.NODE_ENV === 'production',
    maxConnections: 5,
    maxMessages: 100,
  }

  transporter = nodemailer.createTransport(transportOptions)

  return transporter
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const transporter = getNodemailerTransporter()
  const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

  return transporter.sendMail({
    from: fromEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}
