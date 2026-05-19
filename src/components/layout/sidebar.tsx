"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import {
  LayoutDashboard, Upload, History, Activity,
  Users, Stethoscope, Bell, Settings,
  ChevronLeft, ChevronRight, Shield,
} from "lucide-react"

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  href: string
}

const mainItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Upload Scan", icon: Upload, href: "/upload" },
  { label: "Predictions", icon: History, href: "/predictions" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

const adminItems: NavItem[] = [
  { label: "Admin Dashboard", icon: Shield, href: "/admin" },
  { label: "Manage Users", icon: Users, href: "/admin/users" },
  { label: "Manage Predictions", icon: Activity, href: "/admin/predictions" },
]

const doctorItems: NavItem[] = [
  { label: "My Profile", icon: Stethoscope, href: "/doctor/profile" },
]

function NavGroup({ label, items, collapsed, isActive }: {
  label: string; items: NavItem[]; collapsed: boolean; isActive: (h: string) => boolean
}) {
  return (
    <div className="mb-1">
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-subtle)" }}
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
      {items.map(item => (
        <SidebarItem key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
      ))}
    </div>
  )
}

function SidebarItem({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon
  return (
    <Link to={item.href} title={collapsed ? item.label : undefined}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 2 }}
        className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 mb-0.5"
        style={{
          background: active ? "rgba(0,212,255,0.08)" : "transparent",
          color: active ? "var(--cyan-500)" : "var(--foreground-muted)",
        }}
      >
        {/* active left bar */}
        {active && (
          <motion.div
            layoutId="active-bar"
            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
            style={{ background: "var(--cyan-500)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Icon
          className="h-4 w-4 shrink-0"
          style={{ color: active ? "var(--cyan-500)" : "var(--foreground-subtle)" }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {/* active glow dot */}
        {active && collapsed && (
          <motion.div
            layoutId="active-dot"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--cyan-500)" }}
          />
        )}
      </motion.div>
    </Link>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (href: string) =>
    location.pathname === href || (href !== "/dashboard" && location.pathname.startsWith(href + "/"))

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col overflow-hidden shrink-0"
      style={{ background: "var(--navy-950)", borderRight: "1px solid rgba(0,212,255,0.06)" }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center px-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}
      >
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--cyan-500)" }}
          >
            <Activity className="h-3.5 w-3.5" style={{ color: "var(--navy-950)" }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-sm font-semibold"
                style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
              >
                MedScan AI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        <NavGroup label="Main" items={mainItems} collapsed={collapsed} isActive={isActive} />

        {user?.role === "doctor" && (
          <NavGroup label="Doctor" items={doctorItems} collapsed={collapsed} isActive={isActive} />
        )}
        {user?.role === "admin" && (
          <NavGroup label="Admin" items={adminItems} collapsed={collapsed} isActive={isActive} />
        )}
      </div>

      {/* Collapse toggle */}
      <div className="shrink-0 p-2" style={{ borderTop: "1px solid rgba(0,212,255,0.06)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 transition-colors duration-150 hover:bg-white/5"
          style={{ color: "var(--foreground-subtle)" }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap ml-2 text-xs"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
