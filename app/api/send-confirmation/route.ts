import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, investmentAmount, projectedReturn, applicationId } = body

    if (!email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, integrate with Resend, SendGrid, or similar service
    const emailContent = `
      <h2>Investment Application Confirmation</h2>
      <p>Dear ${fullName},</p>
      <p>Thank you for submitting your investment application to Zteller!</p>
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Investment Amount: ₦${investmentAmount.toLocaleString()}</li>
        <li>Projected Return: ₦${projectedReturn.toLocaleString()}</li>
        <li>Application ID: ${applicationId}</li>
      </ul>
      <p>Our team will review your application and contact you shortly.</p>
      <p>Best regards,<br/>Zteller Team</p>
    `

    // Log the email that would be sent (replace with actual email service)
    console.log("Confirmation email would be sent to:", email)
    console.log("Email content:", emailContent)

    return NextResponse.json({
      success: true,
      message: "Confirmation email queued for sending",
      applicationId,
    })
  } catch (error) {
    console.error("Error sending confirmation:", error)
    return NextResponse.json({ error: "Failed to send confirmation" }, { status: 500 })
  }
}
