'use client'

import { sendOtp, verifyOtp } from "@/lib/auth";
import { ArrowLeft, Loader, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const RESEND_SECONDS = 60;

const LoginPage = () => {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  async function requestOtp(isResend = false) {
    const trimmedEmail = email.trim()
    setIsLoading(true)

    try {
      const data = await sendOtp(trimmedEmail)
      if (!data.success) {
        toast.error(data.message || "Failed to send OTP")
        return
      }

      setEmail(trimmedEmail)
      setStep("otp")
      setOtp("")
      setResendIn(RESEND_SECONDS)

      if (isResend) {
        toast.success("A new OTP has been sent")
      } else {
        toast.success(data.message || "OTP sent successfully")
      }

    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    requestOtp()
  }

  async function handleVerifyOtp(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = otp.trim()
    setIsLoading(true)

    try {
      const data = await verifyOtp(email.trim(), code)
      if (!data.success) {
        toast.error(data.message || "Invalid or expired OTP")
        return;
      }
      toast.success(data.message || "Signed in successfully")
      router.replace("/admin/dashboard")
      router.refresh()

    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleChangeEmail() {
    setStep("email")
    setOtp("")
    setResendIn(0)
  }

  return (
    <div className="min-h-screen bg-gray-50  flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-15 bg-green-600 rounded-2xl flex items-center justify-center mx-auto my-4">
            <ShoppingCart className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FreshCart Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your store</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          {
            step === 'email' ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-gray-500 text-sm mb-6">Enter Your admin email to continue</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      autoFocus
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-xl border border-gray-400 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 cursor-pointer bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {
                      isLoading ? (
                        <>
                          <Loader className="size-5 animate-spin" />
                          Sending...
                        </>
                      ) : "Send OTP"
                    }
                  </button>

                </form>

              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="flex items-center cursor-pointer gap-1 text-green-600 text-sm font-medium mb-6 hover:text-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="size-4" /> Change Email
                </button>

                <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
                <p className="text-gray-500 text-sm mb-1">We sent a 6-Digit code to</p>
                <p className="text-green-600 text-sm font-semibold mb-6">{email}</p>

                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full h-12 px-4 rounded-xl border border-gray-400 bg-gray-50 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:text-gray-500"
                      maxLength={6}
                      autoFocus
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-12 cursor-pointer bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {
                      isLoading ? (
                        <>
                          <Loader className="size-4 animate-spin" />
                          Verifying...
                        </>
                      ) : "Verify & Sign In"
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => requestOtp(true)}
                    disabled={isLoading || resendIn > 0}
                    className="w-full text-gray-400 text-sm hover:text-gray-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
                  </button>

                </form>

              </>
            )
          }
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">FreshCart Admin Panel • Secure Access Only</p>

      </div>
    </div>
  )
}

export default LoginPage