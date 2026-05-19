import { useMemo, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { predictionsService } from "@/services/predictionsService"
import { uploadsService } from "@/services/uploadsService"
import { Upload, Brain, Clock, CheckCircle, ArrowRight, FileText, History, Settings, Activity } from "lucide-react"

/* ── animated number counter ── */
function Counter({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(false)

  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [to, duration])

  return <>{count}</>
}

/* ── stat card ── */
function StatCard({ icon: Icon, label, value, accent, delay }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string; value: number; accent?: boolean; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -2, borderColor: "rgba(0,212,255,0.25)" }}
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>{label}</p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: accent ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)" }}
        >
          <Icon className="h-4 w-4" style={{ color: accent ? "var(--cyan-500)" : "var(--foreground-subtle)" }} />
        </div>
      </div>
      <p
        className="text-3xl font-bold"
        style={{ fontFamily: "'Clash Display',sans-serif", color: accent ? "var(--cyan-500)" : "var(--foreground)" }}
      >
        <Counter to={value} />
      </p>
    </motion.div>
  )
}

/* ── skeleton ── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
      <div className="flex justify-between mb-3">
        <div className="h-3 w-20 rounded" style={{ background: "var(--surface-3)" }} />
        <div className="h-8 w-8 rounded-lg" style={{ background: "var(--surface-3)" }} />
      </div>
      <div className="h-8 w-12 rounded" style={{ background: "var(--surface-3)" }} />
    </div>
  )
}

/* ── status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    completed: { color: "var(--success)", bg: "rgba(0,229,160,0.1)" },
    processing: { color: "var(--warning)", bg: "rgba(255,184,0,0.1)" },
    pending:    { color: "var(--warning)", bg: "rgba(255,184,0,0.1)" },
    failed:     { color: "var(--destructive)", bg: "rgba(255,77,106,0.1)" },
  }
  const s = map[status] ?? { color: "var(--foreground-muted)", bg: "transparent" }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  )
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function UserDashboard() {
  const user = useAuthStore(s => s.user)

  const predictionsQuery = useQuery({ queryKey: ["predictions"], queryFn: predictionsService.list })
  const uploadsQuery = useQuery({ queryKey: ["uploads"], queryFn: uploadsService.list })

  const predictions = predictionsQuery.data?.predictions ?? []
  const uploads = uploadsQuery.data?.files ?? []
  const isLoading = predictionsQuery.isLoading || uploadsQuery.isLoading
  const isError = predictionsQuery.isError || uploadsQuery.isError

  const stats = useMemo(() => ({
    totalUploads: uploads.length,
    totalPredictions: predictions.length,
    pending: predictions.filter(p => p.status === "pending" || p.status === "processing").length,
    completed: predictions.filter(p => p.status === "completed").length,
  }), [uploads, predictions])

  const recent = useMemo(() =>
    [...predictions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  , [predictions])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="h-10 w-10" style={{ color: "var(--destructive)" }} />
        <p className="font-medium" style={{ color: "var(--destructive)" }}>Failed to load dashboard</p>
        <button
          onClick={() => { predictionsQuery.refetch(); uploadsQuery.refetch() }}
          className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-8">

      {/* heading */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
          Welcome back, {user?.full_name?.split(" ")[0] ?? "User"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Here's your scan activity at a glance.
        </p>
      </motion.div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Upload}       label="Total Uploads"    value={stats.totalUploads}      delay={0.1} />
            <StatCard icon={Brain}        label="Predictions"      value={stats.totalPredictions}  delay={0.15} accent />
            <StatCard icon={Clock}        label="Pending"          value={stats.pending}           delay={0.2} />
            <StatCard icon={CheckCircle}  label="Completed"        value={stats.completed}         delay={0.25} />
          </>
        )}
      </div>

      {/* lower grid */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* recent predictions */}
        <motion.div
          variants={item}
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Recent Predictions
            </h2>
            <Link
              to="/predictions"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--cyan-500)" }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--surface-2)" }} />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-10 w-10 mb-3" style={{ color: "var(--foreground-subtle)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>No predictions yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--foreground-subtle)" }}>Upload a scan to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((pred, i) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={`/predictions/${pred.id}`}
                      className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(0,212,255,0.07)" }}
                        >
                          <FileText className="h-3.5 w-3.5" style={{ color: "var(--cyan-500)" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                            {pred.model_name ?? "Prediction"}
                          </p>
                          <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                            {new Date(pred.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={pred.status} />
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--foreground-subtle)" }} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* quick actions */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Quick Actions
            </h2>
          </div>
          <div className="p-3 space-y-2">
            {[
              { to: "/upload",      icon: Upload,   label: "Upload New Scan",   sub: "Submit a medical image for analysis",      accent: true },
              { to: "/predictions", icon: History,  label: "View History",      sub: "Browse past predictions and results",      accent: false },
              { to: "/settings",    icon: Settings, label: "Account Settings",  sub: "Manage your profile and preferences",      accent: false },
            ].map((action, i) => (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={action.to}
                  className="flex items-center gap-3 rounded-xl p-3.5 transition-all duration-150 hover:border-cyan-500/20 group"
                  style={{
                    background: action.accent ? "rgba(0,212,255,0.06)" : "transparent",
                    border: `1px solid ${action.accent ? "rgba(0,212,255,0.15)" : "var(--card-border)"}`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ background: action.accent ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)" }}
                  >
                    <action.icon className="h-4 w-4" style={{ color: action.accent ? "var(--cyan-500)" : "var(--foreground-subtle)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: action.accent ? "var(--cyan-500)" : "var(--foreground)" }}>
                      {action.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{action.sub}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--cyan-500)" }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
