import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/authStore"
import { notificationsService } from "@/services/notificationsService"
import { Bell, LogOut, Settings, ChevronDown } from "lucide-react"

function NotificationsBell() {
  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: notificationsService.unreadCount,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  return (
    <Link to="/notifications">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
        style={{ color: "var(--foreground-muted)" }}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            style={{
              background: "var(--cyan-500)",
              color: "var(--navy-950)",
              boxShadow: "0 0 8px rgba(0,212,255,0.5)",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </motion.button>
    </Link>
  )
}

function BreadcrumbSegment({ path }: { path: string }) {
  const segments = path.replace(/^\//, "").split("/")
  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: "var(--foreground-subtle)" }}>/</span>}
          <span
            className="capitalize"
            style={{ color: i === segments.length - 1 ? "var(--foreground)" : "var(--foreground-muted)" }}
          >
            {seg || "home"}
          </span>
        </span>
      ))}
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-6 shrink-0"
      style={{
        background: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,212,255,0.06)",
      }}
    >
      {/* breadcrumb */}
      <BreadcrumbSegment path={location.pathname} />

      {/* right side */}
      <div className="flex items-center gap-1.5">

        {/* notifications */}
        <NotificationsBell />

        {/* profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="ml-1 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5 outline-none"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className="text-xs font-semibold"
                  style={{ background: "rgba(0,212,255,0.12)", color: "var(--cyan-500)", fontFamily: "'Clash Display',sans-serif" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium leading-none" style={{ color: "var(--foreground)" }}>
                  {user?.full_name}
                </p>
                <p className="mt-0.5 text-[10px] capitalize" style={{ color: "var(--foreground-subtle)" }}>
                  {user?.role}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 hidden sm:block" style={{ color: "var(--foreground-subtle)" }} />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-52 rounded-xl overflow-hidden p-1"
            align="end"
            style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)" }}
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{user?.full_name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--foreground-muted)" }}>{user?.email}</p>
            </div>
            <DropdownMenuSeparator style={{ background: "var(--border)" }} />
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg mx-0 focus:bg-white/5">
              <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-lg mx-0 focus:bg-red-500/10 mt-0.5"
              style={{ color: "var(--destructive)" }}
            >
              <div className="flex items-center gap-2 px-1 py-0.5 text-sm w-full">
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
