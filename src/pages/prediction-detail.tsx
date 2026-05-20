import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { predictionsService } from "@/services/predictionsService"
import { usePredictionSocket } from "@/hooks/usePredictionSocket"
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer"
import {
  Brain, Calendar, Clock, Activity, CheckCircle, XCircle,
  AlertTriangle, FileText, ArrowLeft, Zap, Wifi,
} from "lucide-react"

const statusMap: Record<string, { color: string; bg: string; label: string }> = {
  completed:  { color: "var(--success)",     bg: "rgba(0,229,160,0.1)",  label: "Completed"  },
  processing: { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Processing" },
  pending:    { color: "var(--warning)",     bg: "rgba(255,184,0,0.1)",  label: "Pending"    },
  failed:     { color: "var(--destructive)", bg: "rgba(255,77,106,0.1)", label: "Failed"     },
}

const timelineSteps = [
  { key: "created",    label: "Created",    icon: Clock },
  { key: "processing", label: "Processing", icon: Activity },
  { key: "completed",  label: "Completed",  icon: CheckCircle },
]

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
      <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{value ?? <em style={{ color: "var(--foreground-subtle)" }}>N/A</em>}</span>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: prediction, isLoading, isError, refetch } = useQuery({
    queryKey: ["prediction", id],
    queryFn: () => predictionsService.get(id!),
    enabled: !!id,
  })

  // real-time updates via WebSocket — active only while pending/processing
  const isLive = prediction?.status === "pending" || prediction?.status === "processing"
  usePredictionSocket(id, { enabled: isLive })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-8">
        <div className="h-8 w-40 rounded-xl animate-pulse" style={{ background: "var(--surface-2)" }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }} />
        ))}
      </div>
    )
  }

  if (isError || !prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-10 w-10" style={{ color: "var(--destructive)" }} />
        <p className="font-medium" style={{ color: "var(--destructive)" }}>Prediction not found</p>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          The prediction doesn't exist or has been removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-xl px-5 py-2.5 text-sm font-medium"
            style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            Retry
          </button>
          <Link to="/predictions">
            <button
              className="rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: "var(--cyan-500)", color: "var(--navy-950)" }}
            >
              Back to Predictions
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const status = statusMap[prediction.status] ?? statusMap.pending

  const getTimelineState = (stepKey: string) => {
    if (stepKey === "created") return "complete"
    if (prediction.status === "pending")     return "pending"
    if (prediction.status === "processing")  return stepKey === "processing" ? "current" : "pending"
    return "complete"
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-5 pb-8">

      {/* back + title */}
      <motion.div variants={item} className="flex items-center gap-3">
        <Link to="/predictions">
          <motion.button
            whileHover={{ x: -2 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "var(--foreground-muted)", border: "1px solid var(--card-border)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
            Prediction Details
          </h1>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--foreground-subtle)" }}>ID: {prediction.id}</p>
        </div>
      </motion.div>

      {/* disclaimer banner — show only once results are visible */}
      {prediction.status === "completed" && (
        <motion.div variants={item}>
          <MedicalDisclaimer variant="banner" />
        </motion.div>
      )}

      {/* status + timeline card */}
      <motion.div
        variants={item}
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
      >
        {/* status header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--card-border)", background: `${status.bg}` }}
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Analysis Status</span>
            <AnimatePresence>
              {isLive && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: "rgba(0,212,255,0.1)", color: "var(--cyan-500)", border: "1px solid rgba(0,212,255,0.2)" }}
                >
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--cyan-500)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  Live
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize"
            style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}30` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
        </div>

        {/* timeline */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {timelineSteps.map((step, i) => {
              const state = getTimelineState(step.key)
              const Icon = step.icon
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      animate={{
                        background: state === "complete" ? "var(--success)" : state === "current" ? "var(--cyan-500)" : "rgba(255,255,255,0.06)",
                        boxShadow: state === "current" ? "0 0 12px rgba(0,212,255,0.4)" : "none",
                      }}
                      transition={{ duration: 0.4 }}
                      className="h-9 w-9 rounded-full flex items-center justify-center"
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: state !== "pending" ? "var(--navy-950)" : "var(--foreground-subtle)" }}
                      />
                    </motion.div>
                    <span className="text-xs font-medium" style={{ color: state !== "pending" ? "var(--foreground)" : "var(--foreground-subtle)" }}>
                      {step.label}
                    </span>
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <motion.div
                      className="w-16 sm:w-24 h-px mx-2 mb-4"
                      animate={{ background: state === "complete" ? "var(--success)" : "rgba(255,255,255,0.08)" }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* model info + timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* model info */}
        <motion.div
          variants={item}
          className="rounded-2xl p-5"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Model Info
            </h2>
          </div>
          <InfoRow label="Model" value={prediction.model_name} />
          <InfoRow label="Version" value={prediction.model_version} />
          <InfoRow label="Predicted Label" value={
            prediction.predicted_label
              ? <span style={{ color: "var(--success)" }}>{prediction.predicted_label}</span>
              : undefined
          } />
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Confidence</span>
            {prediction.confidence_score !== undefined ? (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Number(prediction.confidence_score), 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    style={{ background: "var(--cyan-500)" }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {Number(prediction.confidence_score).toFixed(2)}%
                </span>
              </div>
            ) : (
              <em style={{ color: "var(--foreground-subtle)" }}>N/A</em>
            )}
          </div>
        </motion.div>

        {/* timestamps */}
        <motion.div
          variants={item}
          className="rounded-2xl p-5"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Timestamps
            </h2>
          </div>
          <InfoRow label="Created" value={new Date(prediction.created_at).toLocaleString()} />
          <InfoRow label="Updated" value={new Date(prediction.updated_at).toLocaleString()} />
          {prediction.completed_at && (
            <InfoRow label="Completed" value={new Date(prediction.completed_at).toLocaleString()} />
          )}
        </motion.div>
      </div>

      {/* error message */}
      {prediction.error_message && (
        <motion.div
          variants={item}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,77,106,0.04)", border: "1px solid rgba(255,77,106,0.2)" }}
        >
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,77,106,0.12)" }}>
            <AlertTriangle className="h-4 w-4" style={{ color: "var(--destructive)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--destructive)" }}>Error Message</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm" style={{ color: "var(--destructive)" }}>{prediction.error_message}</p>
          </div>
        </motion.div>
      )}

      {/* uploaded file */}
      <motion.div
        variants={item}
        className="rounded-2xl p-5"
        style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
          <h2 className="text-sm font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>Uploaded File</h2>
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
          File ID: <span className="font-mono" style={{ color: "var(--foreground)" }}>{prediction.uploaded_file_id}</span>
        </p>
        <Link
          to={`/uploads/${prediction.uploaded_file_id}`}
          className="text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--cyan-500)" }}
        >
          View uploaded file details →
        </Link>
      </motion.div>

    </motion.div>
  )
}
