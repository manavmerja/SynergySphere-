"use client"

import { motion } from "framer-motion"
import { Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center"
            >
              <Mail className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
              <CardDescription>
                We’ve sent a verification link to your inbox. Please check your email to continue.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center text-muted-foreground text-sm"
            >
              Didn’t see the email? Open your Gmail inbox directly to find the verification link.
            </motion.div>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full"
              >
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                  Go to Gmail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
