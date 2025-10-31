import nodemailer from "nodemailer"
import dns from "dns"
import { logError } from "@/lib/error-handler"
import { promisify } from "util"

// Promisify DNS lookup for better error handling
const dnsLookup = promisify(dns.lookup)

let transporter: nodemailer.Transporter | null = null
let lastConnectionAttempt = 0
const CONNECTION_RETRY_INTERVAL = 60000 // 1 minute

// Create a mock transporter for fallback
const createMockTransporter = () => {
  return {
    sendMail: async (mailOptions: any) => {
      console.log('Email would have been sent:', mailOptions);
      return { messageId: 'mock-id-' + Date.now() };
    }
  } as any;
}

// Verify SMTP connection is working
async function verifyConnection(transporterToVerify: nodemailer.Transporter) {
  try {
    await transporterToVerify.verify();
    return true;
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    return false;
  }
}

// Check if host is reachable via DNS
async function isHostReachable(host: string): Promise<boolean> {
  try {
    await dnsLookup(host);
    return true;
  } catch (error) {
      logError(error, "SMTP Host Check");
      return false;
    }
}

export async function getNodemailerTransporter() {
  const currentTime = Date.now();
  
  // Return existing transporter if it exists and we haven't tried recently
  if (transporter && (currentTime - lastConnectionAttempt < CONNECTION_RETRY_INTERVAL)) {
    return transporter;
  }
  
  lastConnectionAttempt = currentTime;

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587")
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("SMTP configuration is incomplete. Email functionality will be limited.")
    
    // In production, we should fail gracefully rather than throwing an error
    if (process.env.NODE_ENV === 'production') {
      return createMockTransporter();
    } else {
      throw new Error(
        "SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.",
      )
    }
  }

  // Check if the SMTP host is reachable
  const isReachable = await isHostReachable(smtpHost);
  if (!isReachable) {
    console.warn(`SMTP host ${smtpHost} is not reachable. Using fallback email handling.`);
    return createMockTransporter();
  }

  // Define SMTP transport options with improved error handling
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
    // Add connection timeout
    connectionTimeout: 10000, // 10 seconds
    // Add graceful error handling
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  }

  try {
    const newTransporter = nodemailer.createTransport(transportOptions);
    
    // Verify the connection works
    const isConnected = await verifyConnection(newTransporter);
    if (!isConnected) {
      console.warn("SMTP connection verification failed. Using fallback email handling.");
      return createMockTransporter();
    }
    
    transporter = newTransporter;
    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    return createMockTransporter();
  }
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    // Validate email inputs
    if (!options.to || !options.subject || !options.html) {
      throw new Error("Missing required email fields (to, subject, or html)");
    }
    
    // Sanitize inputs
    const sanitizedOptions = {
      to: options.to.trim(),
      subject: options.subject.trim(),
      html: options.html,
      from: options.from?.trim()
    };
    
    const transporter = await getNodemailerTransporter();
    const fromEmail = sanitizedOptions.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const result = await transporter.sendMail({
      from: fromEmail,
      to: sanitizedOptions.to,
      subject: sanitizedOptions.subject,
      html: sanitizedOptions.html,
    });
    
    return result;
  } catch (error) {
    logError(error, "Email Sending");
    
    // Return a structured error response instead of throwing
    return {
      error: true,
      messageId: 'error-' + Date.now(),
      errorDetails: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
}
