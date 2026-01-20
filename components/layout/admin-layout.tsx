"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { useIsMobile } from "@/hooks/use-mobile"
import type { LucideIcon } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  icon?: LucideIcon
}

export function AdminLayout({ children, title, subtitle, icon }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop/Tablet sidebar */}
      <div className={`${sidebarOpen ? (sidebarCollapsed ? "w-16" : "w-64") : "w-0"} transition-all duration-300 hidden md:block overflow-hidden`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar collapsed={false} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          icon={icon}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
