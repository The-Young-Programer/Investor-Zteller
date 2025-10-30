import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      investmentAmount,
      duration,
      projectedReturn,
      bankName,
      accountNumber,
      paymentScreenshotURL,
      transactionReference,
      applicationId,
    } = body

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'investmentAmount', 'duration', 'projectedReturn', 'applicationId'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
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
                  <span class="detail-value">${fullName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${phone}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Investment Details</h2>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Investment Amount:</span>
                  <span class="detail-value">₦${(investmentAmount || 0).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${duration || 'N/A'} ${duration ? 'months' : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Projected Return:</span>
                  <span class="highlight">₦${(projectedReturn || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Bank Details</h2>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Bank:</span>
                  <span class="detail-value">${bankName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Account Number:</span>
                  <span class="detail-value">****${accountNumber.slice(-4)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Transaction Reference:</span>
                  <span class="detail-value">${transactionReference || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Payment Receipt</h2>
              <div class="details">
                ${paymentScreenshotURL ? 
                  `<div style="text-align: center; margin: 15px 0;">
                    <a href="${paymentScreenshotURL}" target="_blank" style="display: block;">
                      <img src="${paymentScreenshotURL}" alt="Payment Receipt" style="max-width: 100%; max-height: 300px; border: 1px solid #e0e0e0; border-radius: 4px;">
                    </a>
                    <a href="${paymentScreenshotURL}" target="_blank" class="button" style="margin-top: 10px;">View Full Receipt</a>
                  </div>` : 
                  `<p style="text-align: center; padding: 20px; color: #999;">No payment receipt uploaded</p>`
                }
              </div>
            </div>

            <div class="section">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/applications/${applicationId}" class="button">
                Review Application
              </a>
            </div>

            <div class="footer">
              <p>Application ID: ${applicationId}</p>
              <p>This is an automated notification from Zteller Investor Portal</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      const result = await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@zteller.ng",
        subject: `New Investment Application - ₦${(investmentAmount || 0).toLocaleString()} from ${fullName || 'Investor'}`,
        html: emailHtml,
      })

      console.log("Admin notification email sent:", result.messageId)

      return NextResponse.json({
        success: true,
        message: "Admin notification sent successfully",
        applicationId,
        messageId: result.messageId,
      })
    } catch (emailError) {
      console.error("Nodemailer error:", emailError)
      console.warn("Email service failed, but application was saved to database")

      return NextResponse.json({
        success: true,
        message: "Application saved (email notification failed)",
        applicationId,
        warning: "Email service is not configured",
      })
    }
  } catch (error) {
    console.error("Error sending admin notification:", error)
    return NextResponse.json({ error: "Failed to send admin notification" }, { status: 500 })
  }
}
