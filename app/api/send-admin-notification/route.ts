import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/nodemailer"
import { logError, sanitizeErrorMessage } from "@/lib/error-handler"

// Input sanitization function
function sanitizeInput(input: string | undefined): string {
  if (!input) return '';
  // Remove any potentially dangerous HTML/script tags
  return input.toString()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Add request timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const body = await request.json();
      clearTimeout(timeoutId);
      
      // Sanitize all inputs
      const sanitizedBody: Record<string, any> = {
        fullName: sanitizeInput(body.fullName),
        email: sanitizeInput(body.email),
        phone: sanitizeInput(body.phone),
        investmentAmount: typeof body.investmentAmount === 'number' ? body.investmentAmount : 0,
        duration: typeof body.duration === 'number' ? body.duration : 0,
        projectedReturn: typeof body.projectedReturn === 'number' ? body.projectedReturn : 0,
        bankName: sanitizeInput(body.bankName),
        accountNumber: sanitizeInput(body.accountNumber),
        paymentScreenshotURL: body.paymentScreenshotURL,
        transactionReference: sanitizeInput(body.transactionReference),
        applicationId: sanitizeInput(body.applicationId),
      };
      
      // Validate required fields
      const requiredFields = ['fullName', 'email', 'investmentAmount', 'duration', 'projectedReturn', 'applicationId'];
      const missingFields = requiredFields.filter(field => !sanitizedBody[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, { status: 400 });
      }
      
      // Validate email format
      if (!isValidEmail(sanitizedBody.email)) {
        return NextResponse.json({ 
          error: "Invalid email format" 
        }, { status: 400 });
      }
      
      // Validate numeric fields
      if (sanitizedBody.investmentAmount <= 0 || sanitizedBody.duration <= 0 || sanitizedBody.projectedReturn <= 0) {
        return NextResponse.json({ 
          error: "Investment amount, duration, and projected return must be positive numbers" 
        }, { status: 400 });
      }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0052FF 0%, #00D1A7 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #0052FF; font-size: 16px; margin-bottom: 10px; }
            .details { background: #f6f9ff; padding: 15px; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #0052FF; }
            .detail-value { color: #333; }
            .highlight { background: #00D1A7; color: white; padding: 10px; border-radius: 4px; font-weight: bold; }
            .button { display: inline-block; background: #0052FF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
            .footer { color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Investment Application</h1>
              <p>A new investor has submitted an application</p>
            </div>

            <div class="section">
              <h2>Investor Information</h2>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${sanitizedBody.fullName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${sanitizedBody.email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${sanitizedBody.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Investment Details</h2>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Investment Amount:</span>
                  <span class="detail-value">₦${(sanitizedBody.investmentAmount || 0).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${sanitizedBody.duration || 'N/A'} ${sanitizedBody.duration ? 'months' : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Projected Return:</span>
                  <span class="highlight">₦${(sanitizedBody.projectedReturn || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Bank Details</h2>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Bank:</span>
                  <span class="detail-value">${sanitizedBody.bankName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Account Name:</span>
                  <span class="detail-value">${sanitizedBody.accountName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Account Number:</span>
                  <span class="detail-value">${sanitizedBody.accountNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Transaction Reference:</span>
                  <span class="detail-value">${sanitizedBody.transactionReference || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Payment Receipt</h2>
              <div class="details">
                ${sanitizedBody.paymentScreenshotURL ? 
                  `<div style="text-align: center; margin: 15px 0;">
                    <a href="${sanitizedBody.paymentScreenshotURL}" target="_blank" style="display: block;">
                      <img src="${sanitizedBody.paymentScreenshotURL}" alt="Payment Receipt" style="max-width: 100%; max-height: 300px; border: 1px solid #e0e0e0; border-radius: 4px;">
                    </a>
                    <a href="${sanitizedBody.paymentScreenshotURL}" target="_blank" class="button" style="margin-top: 10px;">View Full Receipt</a>
                  </div>` : 
                  `<p style="text-align: center; padding: 20px; color: #999;">No payment receipt uploaded</p>`
                }
              </div>
            </div>

            <div class="section">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/applications/${sanitizedBody.applicationId}" class="button">
                Review Application
              </a>
            </div>

            <div class="footer">
              <p>Application ID: ${sanitizedBody.applicationId}</p>
              <p>This is an automated notification from Zteller Investor Portal</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@zteller.ng";
      
      // Ensure admin email is valid
      if (!isValidEmail(adminEmail)) {
        console.error("Invalid admin email configuration");
        return NextResponse.json({
          success: true,
          message: "Application saved (invalid admin email configuration)",
          applicationId: sanitizedBody.applicationId,
          warning: "Admin email is not properly configured",
        });
      }
      
      const result = await sendEmail({
        to: adminEmail,
        subject: `New Investment Application - ₦${(sanitizedBody.investmentAmount || 0).toLocaleString()} from ${sanitizedBody.fullName || 'Investor'}`,
        html: emailHtml,
      });

      // Check if there was an error in sending email
      if (result.error) {
        console.error("Email sending failed:", result.errorDetails);
        return NextResponse.json({
          success: true,
          message: "Application saved (email notification failed)",
          applicationId: sanitizedBody.applicationId,
          warning: "Email service encountered an error",
          errorDetails: process.env.NODE_ENV === 'development' ? result.errorDetails : undefined
        });
      }

      console.log("Admin notification email sent:", result.messageId);

      return NextResponse.json({
        success: true,
        message: "Admin notification sent successfully",
        applicationId: sanitizedBody.applicationId,
        messageId: result.messageId,
      });
    } catch (emailError) {
      logError(emailError, "Email Service");
      console.warn("Email service failed, but application was saved to database");

      return NextResponse.json({
        success: true,
        message: "Application saved (email notification failed)",
        applicationId: sanitizedBody.applicationId,
        warning: "Email service encountered an error",
      });
    }
  } catch (error: unknown) {
    // Handle request parsing errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      logError(error, "Request Timeout");
      return NextResponse.json({ error: "Request timeout" }, { status: 408 });
    }
    
    logError(error, "Admin Notification API");
    
    // Use sanitized error message
    const errorMessage = sanitizeErrorMessage(error);
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  } catch (error: unknown) {
    // Handle request parsing errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      logError(error, "Request Timeout");
      return NextResponse.json({ error: "Request timeout" }, { status: 408 });
    }
    
    logError(error, "Admin Notification API");
    
    // Use sanitized error message
    const errorMessage = sanitizeErrorMessage(error);
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};