import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { predictionsService } from "@/services/predictionsService"
import { Brain, Activity, Clock, CheckCircle, XCircle, ArrowRight, Upload, Search } from "lucide-react"

const statusMap: Record<string, { color: string; bg: string; label: string }> = {
  completed:  { color: "var(--success)",     bg: "rgba(0,229,160,0.1)",  label: "Completed"  },
  processing: { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Processing" },
  pending:    { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Pending"    },
  failed:     { color: "var(--destructive)", bg: "rgba(255,77,106,0.1)", label: "Failed"     },
}

const tabs = ["all", "pending", "completed", "failed"] as const
type Tab = typeof tabs[number]

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { color: "var(--foreground-muted)", bg: "transparent", label: status }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4 animate-pulse"
      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
    >
      <div className="h-10 w-10 rounded-xl shrink-0" style={{ background: "var(--surface-3)" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-48 rounded" style={{ background: "var(--surface-3)" }} />
        <div className="h-2.5 w-32 rounded" style={{ background: "var(--surface-3)" }} />
      </div>
      <div className="h-5 w-20 rounded-full" style={{ background: "var(--surface-3)" }} />
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => predictionsService.list(),
  })

  const predictions = data?.predictions ?? []

  const filtered = useMemo(() => {
    let list = predictions
    if (activeTab !== "all") {
      list = list.filter(p => activeTab === "pending" ? (p.status === "pending" || p.status === "processing") : p.status === activeTab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.model_name?.toLowerCase().includes(q) || p.predicted_label?.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [predictions, activeTab, search])

  const counts = useMemo(() => ({
    all: predictions.length,
    pending: predictions.filter(p => p.status === "pending" || p.status === "processing").length,
    completed: predictions.filter(p => p.status === "completed").length,
    failed: predictions.filter(p => p.status === "failed").length,
  }), [predictions])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="h-10 w-10" style={{ color: "var(--destructive)" }} />
        <p className="font-medium" style={{ color: "var(--destructive)" }}>Failed to load predictions</p>
        <button
          onClick={() => refetch()}
          className="rounded-xl px-5 py-2.5 text-sm font-medium"
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
          Prediction History
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          View all your past medical scan predictions and results.
        </p>
      </motion.div>

      {/* tabs + search bar */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {/* tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              style={{ color: activeTab === tab ? "var(--navy-950)" : "var(--foreground-muted)" }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--cyan-500)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {tab === "pending" ? "Pending" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {" "}
                <span className="opacity-60">({counts[tab]})</span>
              </span>
            </button>
          ))}
        </div>

        {/* search */}
        <div className="flex-1 relative sm:max-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--foreground-subtle)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by model or label…"
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
            }}
          />
        </div>
      </motion.div>

      {/* list */}
      <motion.div variants={item} className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
          >
            <Brain className="h-10 w-10 mb-3" style={{ color: "var(--foreground-subtle)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>No predictions found</p>
            <p className="text-xs mb-6" style={{ color: "var(--foreground-subtle)" }}>Upload a scan to get started</p>
            <Link to="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                style={{ background: "var(--cyan-500)", color: "var(--navy-950)" }}
              >
                <Upload className="h-4 w-4" />
                Upload Scan
              </motion.button>
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((pred, i) => (
              <motion.div
                key={pred.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/predictions/${pred.id}`}>
                  <motion.div
                    whileHover={{ y: -1, borderColor: "rgba(0,212,255,0.2)" }}
                    className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 group"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                      style={{ background: "rgba(0,212,255,0.07)" }}
                    >
                      <Brain className="h-4.5 w-4.5 h-5 w-5" style={{ color: "var(--cyan-500)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {pred.model_name ?? "Medical Scan Prediction"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                          {new Date(pred.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {pred.predicted_label && (
                          <>
                            <span style={{ color: "var(--foreground-subtle)" }}>·</span>
                            <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{pred.predicted_label}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={pred.status} />
                      {pred.confidence_score !== undefined && (
                        <span className="text-xs font-medium hidden sm:inline" style={{ color: "var(--foreground-muted)" }}>
                          {(pred.confidence_score * 100).toFixed(1)}%
                        </span>
                      )}
                      <ArrowRight
                        className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--cyan-500)" }}
                      />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}
