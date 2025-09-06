"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify-email?token=${token}&email=${email}`)
        if (!res.ok) throw new Error("Verification failed")
        const text = await res.text()
        setStatus("success")
        setMessage(text)
        // Redirect after 3 seconds
        setTimeout(() => router.push("/auth/login"), 3000)
      } catch (err: any) {
        setStatus("error")
        setMessage(err.message || "Verification failed")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === "loading" ? "Verifying..." : message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" && <p>Your account is verified! Redirecting to login...</p>}
            {status === "error" && <p className="text-destructive">{message}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
