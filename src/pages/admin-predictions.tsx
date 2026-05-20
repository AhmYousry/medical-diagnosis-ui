import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { adminService } from "@/services/adminService"
import { Search, Brain, ChevronLeft, ChevronRight, XCircle, CheckCircle, Clock, Activity } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const statusMap: Record<string, { color: string; bg: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed:  { color: "var(--success)",     bg: "rgba(0,229,160,0.1)",  label: "Completed",  icon: CheckCircle },
  processing: { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Processing", icon: Activity    },
  pending:    { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Pending",    icon: Clock       },
  failed:     { color: "var(--destructive)", bg: "rgba(255,77,106,0.1)", label: "Failed",     icon: XCircle     },
}

const statusFilters = ["all", "pending", "processing", "completed", "failed"] as const

export default function AdminPredictionsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "predictions", page, search, statusFilter],
    queryFn: () => adminService.listPredictions({ page, size: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
  })

  const predictions = data?.items ?? []
  const total       = data?.total ?? 0
  const totalPages  = data?.pages ?? 1

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="h-10 w-10" style={{ color: "var(--destructive)" }} />
        <p className="font-medium" style={{ color: "var(--destructive)" }}>Failed to load predictions</p>
        <button onClick={() => refetch()} className="rounded-xl px-5 py-2.5 text-sm font-medium" style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-8">

      {/* heading */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>Manage Predictions</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>Monitor all AI prediction requests across users.</p>
      </motion.div>

      {/* filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {/* status tabs */}
        <div className="flex flex-wrap rounded-xl p-1 gap-1" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1) }}
              className="relative rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              style={{ color: statusFilter === f ? "var(--navy-950)" : "var(--foreground-muted)" }}
            >
              {statusFilter === f && (
                <motion.div layoutId="pred-tab" className="absolute inset-0 rounded-lg" style={{ background: "var(--cyan-500)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--foreground-subtle)" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by model or user…"
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
      </motion.div>

      {/* count */}
      <motion.div variants={item}>
        <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
          {isLoading ? "Loading…" : `${total} prediction${total !== 1 ? "s" : ""} found`}
        </p>
      </motion.div>

      {/* table */}
      <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
        {isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <div className="h-9 w-9 rounded-xl shrink-0" style={{ background: "var(--surface-3)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded" style={{ background: "var(--surface-3)" }} />
                  <div className="h-2.5 w-28 rounded" style={{ background: "var(--surface-3)" }} />
                </div>
                <div className="h-5 w-20 rounded-full" style={{ background: "var(--surface-3)" }} />
              </div>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Brain className="h-10 w-10" style={{ color: "var(--foreground-subtle)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>No predictions found</p>
            <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
              {search ? "Try a different search term." : "No predictions have been made yet."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {predictions.map((pred, i) => {
              const s = statusMap[pred.status] ?? statusMap.pending
              const StatusIcon = s.icon
              return (
                <motion.div
                  key={pred.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => navigate(`/admin/predictions/${pred.id}`)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--card-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(167,139,250,0.08)" }}>
                    <Brain className="h-4 w-4" style={{ color: "#a78bfa" }} />
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                      {pred.model_name ?? "Medical Scan Prediction"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>
                      {pred.requested_by_name ?? pred.requested_by_email ?? "Unknown user"}
                      {" · "}
                      {new Date(pred.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* right side */}
                  <div className="flex items-center gap-3 shrink-0">
                    {pred.predicted_label && (
                      <span className="hidden sm:block text-xs font-medium" style={{ color: "var(--success)" }}>
                        {pred.predicted_label}
                      </span>
                    )}
                    {pred.confidence_score !== undefined && (
                      <span className="hidden md:block text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                        {Number(pred.confidence_score).toFixed(1)}%
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color: s.color, background: s.bg }}>
                      <StatusIcon className="h-3 w-3" />
                      {s.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* pagination */}
      {totalPages > 1 && (
        <motion.div variants={item} className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium disabled:opacity-40"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium disabled:opacity-40"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
