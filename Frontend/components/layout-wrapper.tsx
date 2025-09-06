"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavigation } from "@/components/top-navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/auth/") || pathname === "/auth/login" || pathname === "/auth/signup"
  const isLandingPage = pathname === "/"

  // Don't show navigation on auth pages and landing page
  if (isAuthPage || isLandingPage) {
    return <>{children}</>
  }

  const generateBreadcrumbs = () => {
    if (!pathname) return []

    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    if (segments[0] === "dashboard") {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" })
    } else if (segments[0] === "projects") {
      breadcrumbs.push({ label: "Projects", href: "/dashboard" })
      if (segments[1] && segments[1] !== "page") {
        breadcrumbs.push({ label: "Project Details" })
      }
    } else if (segments[0] === "my-tasks") {
      breadcrumbs.push({ label: "My Tasks", href: "/my-tasks" })
    } else if (segments[0] === "discussions") {
      breadcrumbs.push({ label: "Discussions", href: "/discussions" })
    } else if (segments[0] === "team") {
      breadcrumbs.push({ label: "Team", href: "/team" })
    } else if (segments[0] === "settings") {
      breadcrumbs.push({ label: "Settings", href: "/settings" })
    }

    return breadcrumbs
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <TopNavigation breadcrumbs={generateBreadcrumbs()} searchPlaceholder="Search..." />
        {children}
      </main>
    </div>
  )
}
