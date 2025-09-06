import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { FontSizeProvider } from "@/contexts/font-size-context"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "SynergySphere - Team Collaboration Platform",
  description: "Advanced team collaboration platform for modern teams",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <FontSizeProvider>
            <Suspense fallback={null}>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
            </Suspense>
          </FontSizeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
