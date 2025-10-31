"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Upload } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { logError, sanitizeErrorMessage } from "@/lib/error-handler"

const INVESTMENT_AMOUNTS = [
  { label: "₦25,000", value: 25000 },
  { label: "₦50,000", value: 50000 },
  { label: "₦100,000", value: 100000 },
  { label: "₦250,000", value: 250000 },
  { label: "₦500,000", value: 500000 },
]

const DURATIONS = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
]

interface FormData {
  fullName: string
  phone: string
  email: string
  investmentAmount: number
  customAmount: string
  duration: number
  accountName: string
  bankName: string
  accountNumber: string
  paymentScreenshot: File | null
  transactionReference: string
}

interface ApplicationFormProps {
  onSuccess?: () => void
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [roiAnimating, setRoiAnimating] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    investmentAmount: 0,
    customAmount: "",
    duration: 3,
    accountName: "",
    bankName: "",
    accountNumber: "",
    paymentScreenshot: null,
    transactionReference: "",
  })

  const monthlyROI = 0.05
  const finalAmount = formData.investmentAmount || Number.parseInt(formData.customAmount) || 0
  const projectedReturn = finalAmount * (1 + monthlyROI * formData.duration)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "investmentAmount" || name === "duration" || name === "customAmount") {
      setRoiAnimating(true)
      setTimeout(() => setRoiAnimating(false), 600)
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "investmentAmount" ? Number.parseInt(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      const maxSize = 1 * 1024 * 1024 // 1MB in bytes

      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          paymentScreenshot: "Image size must be less than 1MB. Please compress or choose a smaller image."
        }))
        return
      }

      setError("")
      setFieldErrors(prev => ({
        ...prev,
        paymentScreenshot: ""
      }))
      setFormData((prev) => ({
        ...prev,
        paymentScreenshot: file,
      }))
    }
  }

  const validateStep = () => {
    setError("")
    setFieldErrors({})
    const newFieldErrors: Record<string, string> = {}
    let isValid = true

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newFieldErrors.fullName = "Full name is required"
        isValid = false
      }
      if (!formData.phone.trim()) {
        newFieldErrors.phone = "Phone number is required"
        isValid = false
      } else if (!validatePhone(formData.phone)) {
        newFieldErrors.phone = "Please enter a valid phone number"
        isValid = false
      }
      if (!formData.email.trim()) {
        newFieldErrors.email = "Email is required"
        isValid = false
      } else if (!validateEmail(formData.email)) {
        newFieldErrors.email = "Please enter a valid email address"
        isValid = false
      }
      if (!formData.investmentAmount && !formData.customAmount) {
        newFieldErrors.investmentAmount = "Please select or enter an investment amount"
        isValid = false
      }
    }

    if (step === 2) {
      if (!formData.accountName.trim()) {
        newFieldErrors.accountName = "Account name is required"
        isValid = false
      }
      if (!formData.bankName) {
        newFieldErrors.bankName = "Please select a bank"
        isValid = false
      }
      if (!formData.accountNumber.trim()) {
        newFieldErrors.accountNumber = "Account number is required"
        isValid = false
      } else if (!validateAccountNumber(formData.accountNumber)) {
        newFieldErrors.accountNumber = "Account number must be 10 digits"
        isValid = false
      }
    }

    if (step === 3) {
      if (!formData.paymentScreenshot) {
        newFieldErrors.paymentScreenshot = "Please upload payment proof"
        isValid = false
      }
    }

    setFieldErrors(newFieldErrors)
    if (!isValid) {
      setError("Please correct the errors below")
    }
    return isValid
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setError("")
  }

  // Input validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - can be adjusted for specific country formats
    return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s+/g, ''));
  };

  const validateAccountNumber = (accountNumber: string): boolean => {
    // Most account numbers are 10-12 digits
    return /^[0-9]{10,12}$/.test(accountNumber.replace(/\s+/g, ''));
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input: string): string => {
    if (!input) return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  };

  const validateFormData = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields validation
    if (!formData.fullName) errors.push("Full name is required");
    if (!formData.email) errors.push("Email is required");
    if (!formData.phone) errors.push("Phone number is required");
    if (!formData.accountName) errors.push("Account name is required");
    if (!formData.bankName) errors.push("Bank name is required");
    if (!formData.accountNumber) errors.push("Account number is required");
    
    // Format validation
    if (formData.email && !validateEmail(formData.email)) 
      errors.push("Invalid email format");
    if (formData.phone && !validatePhone(formData.phone)) 
      errors.push("Invalid phone number format");
    if (formData.accountNumber && !validateAccountNumber(formData.accountNumber)) 
      errors.push("Invalid account number format");

    // Investment amount validation
    const amount = formData.investmentAmount || Number.parseInt(formData.customAmount || '0');
    if (isNaN(amount) || amount <= 0) 
      errors.push("Please enter a valid investment amount");

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true);
    setError("");

    try {
      // Validate form data
      const validation = validateFormData();
      if (!validation.valid) {
        setError(validation.errors.join(". "));
        setLoading(false);
        return;
      }

      let paymentScreenshotURL = "";

      if (formData.paymentScreenshot) {
        try {
          const maxSize = 1 * 1024 * 1024 // 1MB
          if (formData.paymentScreenshot.size > maxSize) {
            throw new Error("Image size must be less than 1MB. Please compress or choose a smaller image.")
          }

          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
          if (!validTypes.includes(formData.paymentScreenshot.type)) {
            throw new Error("Please upload a valid image file (JPG, PNG, GIF, or WEBP)")
          }

          paymentScreenshotURL = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            
            // Set timeout to prevent hanging
            const timeout = setTimeout(() => {
              reader.abort();
              reject(new Error("File reading timed out. Please try again with a smaller image."));
            }, 30000);
            
            reader.onloadend = () => {
              clearTimeout(timeout);
              const result = reader.result as string
              // Double check the base64 string size
              if (result.length > 1048487) {
                reject(new Error("Image is too large even after validation. Please use a smaller image."))
              } else {
                resolve(result)
              }
            }
            reader.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to read image file"))
            }
            reader.readAsDataURL(formData.paymentScreenshot!)
          })

          console.log("[v0] Image converted to base64, size:", paymentScreenshotURL.length, "bytes")
        } catch (uploadError: any) {
          console.error("[v0] File processing error:", uploadError)
          throw new Error(uploadError.message || "Failed to process payment proof. Please try again.")
        }
      }

      // Sanitize text inputs
      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        phone: sanitizeInput(formData.phone),
        email: sanitizeInput(formData.email),
        accountName: sanitizeInput(formData.accountName),
        bankName: sanitizeInput(formData.bankName),
        accountNumber: sanitizeInput(formData.accountNumber),
        transactionReference: sanitizeInput(formData.transactionReference || ''),
      };

      const investmentAmount = formData.investmentAmount || Number.parseInt(formData.customAmount)

      console.log("[v0] Saving to Firestore...")
      const docRef = await addDoc(collection(db, "investors"), {
        fullName: sanitizedData.fullName,
        phone: sanitizedData.phone,
        email: sanitizedData.email,
        investmentAmount,
        duration: formData.duration,
        projectedReturn: Math.round(projectedReturn),
        accountName: sanitizedData.accountName,
        bankName: sanitizedData.bankName,
        accountNumber: sanitizedData.accountNumber,
        paymentScreenshotURL,
        transactionReference: sanitizedData.transactionReference,
        status: "pending",
        createdAt: Timestamp.now(),
      })

      console.log("[v0] Investment application submitted:", docRef.id)

      try {
        const response = await fetch("/api/send-admin-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: sanitizedData.fullName,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            investmentAmount,
            duration: formData.duration,
            projectedReturn: Math.round(projectedReturn),
            bankName: sanitizedData.bankName,
            accountNumber: sanitizedData.accountNumber,
            paymentScreenshotURL,
            transactionReference: sanitizedData.transactionReference,
            applicationId: docRef.id,
          }),
        })
        
        // Check if the response is ok
        if (!response.ok) {
          const errorText = await response.text();
          try {
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            console.warn("Admin notification API returned an error:", errorJson);
          } catch (parseError) {
            // If not JSON, log as text
            console.warn("Admin notification API returned a non-JSON response:", errorText.substring(0, 200));
          }
          // We continue anyway since the application is saved
        }
      } catch (emailError) {
        console.error("Error sending admin notification:", emailError)
        // We continue anyway since the application is saved
      }

      setStep(5)
      onSuccess?.()
    } catch (err: any) {
      console.error("Error submitting application:", err)
      logError(err, "Application Form Submission")
      setError(sanitizeErrorMessage(err) || "Failed to submit application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-smooth ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              <span className="text-xs text-center text-muted-foreground">
                {s === 1 && "Your Details"}
                {s === 2 && "Bank Info"}
                {s === 3 && "Payment"}
                {s === 4 && "Review"}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step - 1) * 33.33}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Investor Details */}
      {step === 1 && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Your Investment Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full ${fieldErrors.fullName ? 'border-red-500' : ''}`}
              />
              {fieldErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+234 800 000 0000"
                className={`w-full ${fieldErrors.phone ? 'border-red-500' : ''}`}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`w-full ${fieldErrors.email ? 'border-red-500' : ''}`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Investment Amount</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {INVESTMENT_AMOUNTS.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => {
                      setRoiAnimating(true)
                      setTimeout(() => setRoiAnimating(false), 600)
                      setFormData((prev) => ({ ...prev, investmentAmount: amount.value, customAmount: "" }))
                    }}
                    className={`p-3 rounded-lg border-2 font-medium transition-smooth ${
                      formData.investmentAmount === amount.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Or enter custom amount (₦)</label>
                <Input
                  name="customAmount"
                  type="number"
                  value={formData.customAmount}
                  onChange={(e) => {
                    setRoiAnimating(true)
                    setTimeout(() => setRoiAnimating(false), 600)
                    setFormData((prev) => ({ ...prev, customAmount: e.target.value, investmentAmount: 0 }))
                  }}
                  placeholder="Enter custom amount"
                  className={`w-full ${fieldErrors.investmentAmount ? 'border-red-500' : ''}`}
                />
                {fieldErrors.investmentAmount && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.investmentAmount}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Investment Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => {
                      setRoiAnimating(true)
                      setTimeout(() => setRoiAnimating(false), 600)
                      setFormData((prev) => ({ ...prev, duration: dur.value }))
                    }}
                    className={`p-3 rounded-lg border-2 font-medium transition-smooth ${
                      formData.duration === dur.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {finalAmount > 0 && (
              <div
                className={`mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20 transition-all duration-600 ${
                  roiAnimating ? "scale-105 opacity-100" : "scale-100 opacity-100"
                }`}
              >
                <p className="text-sm text-muted-foreground mb-1">Projected Return (5% monthly)</p>
                <p
                  className={`text-2xl font-bold text-secondary transition-all duration-600 ${
                    roiAnimating ? "scale-110" : "scale-100"
                  }`}
                >
                  ₦{projectedReturn.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-destructive text-sm mt-4">{error}</p>}

          <div className="flex gap-4 mt-8">
            <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Bank Account Details */}
      {step === 2 && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Bank Account Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <Input
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="Your account name"
                className={`w-full ${fieldErrors.accountName ? 'border-red-500' : ''}`}
              />
              {fieldErrors.accountName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.accountName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="Enter your bank name"
                className={`w-full ${fieldErrors.bankName ? 'border-red-500' : ''}`}
              />
              {fieldErrors.bankName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Number (10 digits)</label>
              <Input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="0123456789"
                maxLength={10}
                className={`w-full ${fieldErrors.accountNumber ? 'border-red-500' : ''}`}
              />
              {fieldErrors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.accountNumber}</p>
              )}
            </div>
          </div>

          {error && <p className="text-destructive text-sm mt-4">{error}</p>}

          <div className="flex gap-4 mt-8">
            <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Payment Upload */}
      {step === 3 && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Upload Payment Proof</h2>

          <div className="mb-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-3">Zteller Business Account</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Bank:</span> Moniepoint (MFB)
              </p>
              <p>
                <span className="font-medium">Account Name:</span> UNITY MYRA WILSON
              </p>
              <p>
                <span className="font-medium">Account Number:</span> 9122179405
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              After transferring your investment, upload proof of payment below.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Payment Screenshot</label>
              <div className={`border-2 border-dashed ${fieldErrors.paymentScreenshot ? 'border-red-500' : 'border-border'} rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-upload"
                />
                <label htmlFor="payment-upload" className="cursor-pointer">
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${fieldErrors.paymentScreenshot ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <p className="font-medium mb-1">
                    {formData.paymentScreenshot ? formData.paymentScreenshot.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 1MB</p>
                </label>
                {fieldErrors.paymentScreenshot && (
                  <p className="text-red-500 text-sm mt-2">{fieldErrors.paymentScreenshot}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Transaction Reference (Optional)</label>
              <Input
                name="transactionReference"
                value={formData.transactionReference}
                onChange={handleInputChange}
                placeholder="e.g., TRF123456789"
                className="w-full"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm mt-4">{error}</p>}

          <div className="flex gap-4 mt-8">
            <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Review Your Application</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="font-semibold">{formData.fullName}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-semibold">{formData.phone}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-semibold">{formData.email}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Investment Amount</p>
                <p className="font-semibold">
                  ₦{(formData.investmentAmount || Number.parseInt(formData.customAmount)).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold">{formData.duration} months</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-xs text-muted-foreground mb-1">Projected Return</p>
                <p className="font-semibold text-secondary">
                  ₦{projectedReturn.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Bank</p>
                <p className="font-semibold">{formData.bankName}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                <p className="font-semibold">{formData.accountNumber}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
              <p className="font-semibold text-yellow-600">Pending Confirmation</p>
            </div>
          </div>

          {error && <p className="text-destructive text-sm mt-4">{error}</p>}

          <div className="flex gap-4 mt-8">
            <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent" disabled={loading}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </Card>
      )}

      {/* Success Step */}
      {step === 5 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your investment request has been submitted successfully. Our team will review your application and contact
            you shortly at {formData.email} or {formData.phone}.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <a href="/">Return to Home</a>
          </Button>
        </Card>
      )}
    </div>
  )
}
