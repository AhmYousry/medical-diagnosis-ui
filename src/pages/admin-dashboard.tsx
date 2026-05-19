import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { adminService } from "@/services/adminService"
import { Users, Brain, Clock, ArrowRight, Stethoscope, Activity, CheckCircle, XCircle, UserCheck } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const statusMap: Record<string, { color: string; bg: string }> = {
  completed:  { color: "var(--success)",     bg: "rgba(0,229,160,0.1)"  },
  processing: { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)"  },
  pending:    { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)"  },
  failed:     { color: "var(--destructive)", bg: "rgba(255,77,106,0.1)" },
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3 }}
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}>
          <Icon className="h-4.5 w-4.5 h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
      <motion.p
        className="text-3xl font-bold"
        style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {value.toLocaleString()}
      </motion.p>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
      <div className="h-3 w-24 rounded mb-4" style={{ background: "var(--surface-3)" }} />
      <div className="h-8 w-16 rounded" style={{ background: "var(--surface-3)" }} />
    </div>
  )
}

export default function AdminDashboard() {
  const usersQuery      = useQuery({ queryKey: ["admin", "users"],       queryFn: () => adminService.listUsers({ page: 1, size: 1 }) })
  const doctorsQuery    = useQuery({ queryKey: ["admin", "doctors"],     queryFn: () => adminService.listDoctors({ page: 1, size: 1 }) })
  const predictionsQuery= useQuery({ queryKey: ["admin", "predictions"], queryFn: () => adminService.listPredictions({ page: 1, size: 1 }) })
  const recentUsersQ    = useQuery({ queryKey: ["admin", "users", "recent"],       queryFn: () => adminService.listUsers({ page: 1, size: 5 }) })
  const recentPredsQ    = useQuery({ queryKey: ["admin", "predictions", "recent"], queryFn: () => adminService.listPredictions({ page: 1, size: 5 }) })
  const pendingDocsQ    = useQuery({ queryKey: ["admin", "doctors", "pending"],    queryFn: () => adminService.listDoctors({ page: 1, size: 1, verification_status: "pending" }) })

  const stats = useMemo(() => ({
    totalUsers:           usersQuery.data?.total ?? 0,
    totalDoctors:         doctorsQuery.data?.total ?? 0,
    totalPredictions:     predictionsQuery.data?.total ?? 0,
    pendingVerifications: pendingDocsQ.data?.total ?? 0,
  }), [usersQuery.data, doctorsQuery.data, predictionsQuery.data, pendingDocsQ.data])

  const recentUsers = recentUsersQ.data?.items ?? []
  const recentPreds = recentPredsQ.data?.items ?? []
  const isLoading   = usersQuery.isLoading || doctorsQuery.isLoading || predictionsQuery.isLoading

  const statCards = [
    { label: "Total Users",           value: stats.totalUsers,           icon: Users,       accent: "var(--cyan-500)" },
    { label: "Total Doctors",         value: stats.totalDoctors,         icon: Stethoscope, accent: "var(--success)"  },
    { label: "Total Predictions",     value: stats.totalPredictions,     icon: Brain,       accent: "#a78bfa"         },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Clock,       accent: "var(--warning)"  },
  ]

  const quickLinks = [
    { to: "/admin/users",        icon: Users,      label: "Manage Users",       sub: "View all registered users",       accent: "var(--cyan-500)" },
    { to: "/admin/predictions",  icon: Brain,      label: "Manage Predictions", sub: "Monitor all AI predictions",      accent: "#a78bfa"         },
    { to: "/admin/users?role=doctor", icon: Stethoscope, label: "Verify Doctors", sub: "Review doctor applications", accent: "var(--success)"  },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-8">

      {/* heading */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          System overview and management at a glance.
        </p>
      </motion.div>

      {/* stat cards */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(s => <StatCard key={s.label} {...s} />)
        }
      </motion.div>

      {/* recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* recent users */}
        <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
              <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>Recent Registrations</h2>
            </div>
            <Link to="/admin/users" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--cyan-500)" }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {recentUsersQ.isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full shrink-0" style={{ background: "var(--surface-3)" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded" style={{ background: "var(--surface-3)" }} />
                      <div className="h-2.5 w-24 rounded" style={{ background: "var(--surface-3)" }} />
                    </div>
                  </div>
                ))
              : recentUsers.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Users className="h-8 w-8" style={{ color: "var(--foreground-subtle)" }} />
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>No users yet</p>
                  </div>
                )
              : recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={{ background: "rgba(0,212,255,0.08)" }}>
                      <UserCheck className="h-3.5 w-3.5" style={{ color: "var(--cyan-500)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{user.full_name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>{user.email}</p>
                    </div>
                    <span
                      className="text-xs font-medium capitalize px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: user.role === "admin" ? "rgba(0,212,255,0.1)" : user.role === "doctor" ? "rgba(0,229,160,0.1)" : "rgba(255,255,255,0.05)",
                        color: user.role === "admin" ? "var(--cyan-500)" : user.role === "doctor" ? "var(--success)" : "var(--foreground-muted)",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                ))
            }
          </div>
        </motion.div>

        {/* recent predictions */}
        <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" style={{ color: "#a78bfa" }} />
              <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>Recent Predictions</h2>
            </div>
            <Link to="/admin/predictions" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--cyan-500)" }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {recentPredsQ.isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="h-8 w-8 rounded-xl shrink-0" style={{ background: "var(--surface-3)" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 rounded" style={{ background: "var(--surface-3)" }} />
                      <div className="h-2.5 w-20 rounded" style={{ background: "var(--surface-3)" }} />
                    </div>
                  </div>
                ))
              : recentPreds.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Brain className="h-8 w-8" style={{ color: "var(--foreground-subtle)" }} />
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>No predictions yet</p>
                  </div>
                )
              : recentPreds.map(pred => {
                  const s = statusMap[pred.status] ?? statusMap.pending
                  return (
                    <Link key={pred.id} to={`/admin/predictions/${pred.id}`}>
                      <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(167,139,250,0.08)" }}>
                          <Brain className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                            {pred.model_name ?? "Medical Scan"}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>
                            {new Date(pred.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: s.color, background: s.bg }}
                        >
                          {pred.status}
                        </span>
                      </div>
                    </Link>
                  )
                })
            }
          </div>
        </motion.div>
      </div>

      {/* quick links */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to}>
            <motion.div
              whileHover={{ y: -2, borderColor: `${l.accent}40` }}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${l.accent}12` }}>
                <l.icon className="h-5 w-5" style={{ color: l.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{l.label}</p>
                <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>{l.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 ml-auto" style={{ color: "var(--foreground-subtle)" }} />
            </motion.div>
          </Link>
        ))}
      </motion.div>

    </motion.div>
  )
}
