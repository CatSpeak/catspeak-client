import React, { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useVerifyEmailMutation } from "@/features/auth"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()
  const [status, setStatus] = useState("verifying") // verifying, success, error

  useEffect(() => {
    let mounted = true

    const verify = async () => {
      if (!token || !email) {
        setStatus("error")
        return
      }

      try {
        await verifyEmail({ email, token }).unwrap()
        if (mounted) setStatus("success")
      } catch (err) {
        console.error("Email verification failed:", err)
        if (mounted) setStatus("error")
      }
    }

    verify()

    return () => {
      mounted = false
    }
  }, [token, email, verifyEmail])

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        {status === "verifying" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cath-red-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Verifying your email...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600">
                Thank you for verifying your email address. You can now use all features of Cat Speak.
              </p>
            </div>
            <Link to="/">
              <button className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
                Go to Home
              </button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600">
                The verification link is invalid or has expired.
              </p>
            </div>
            <Link to="/">
              <button className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
                Back to Home
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
