"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Menu,
  X,
  MoreHorizontal,
  Kanban,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Projects", href: "/projects", icon: LayoutDashboard },
  { name: "My Tasks", href: "/my-tasks", icon: CheckSquare },
  { name: "Discussions", href: "/discussions", icon: MessageSquare },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

const singout = () => {
 localStorage.removeItem("token");
 window.location.href = "/auth/login";

}

export function AppSidebar() {

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const pathname = usePathname()

  // Set window width on client only
  React.useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "256px",
          x:
            windowWidth === null
              ? 0 // fallback for SSR
              : windowWidth >= 768
                ? 0
                : isMobileOpen
                  ? 0
                  : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-sidebar",
          "md:relative md:translate-x-0 md:z-auto",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            {!isCollapsed && <span className="font-bold text-sidebar-foreground">Company</span>}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="hidden md:flex h-6 w-6" onClick={() => setIsCollapsed(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-6 w-6 absolute top-4 right-2"
              onClick={() => setIsCollapsed(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full h-10",
                    isCollapsed ? "justify-center px-2" : "justify-start px-3",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4">
          <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start")}>
            <ThemeToggle />
          </div>
        </div>

        <div className="p-4 border-t">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">T</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-sidebar-foreground">Test User</span>
                  <span className="text-xs text-sidebar-foreground/60">user@mail</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1"
                onClick={() => {
                // TODO: Add your sign out logic here
                singout();
                }}
                title="Sign out"
              >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
                </svg>
              </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
