import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import type { AIPredictionResult } from "@/types"

interface Props {
  result: AIPredictionResult
  threshold?: number
}

/** Color scale: high probability = warning/red, mid = cyan, low = muted. */
function barColor(prob: number, threshold: number): string {
  if (prob >= 0.7) return "var(--destructive)"
  if (prob >= threshold) return "var(--warning)"
  return "var(--cyan-500)"
}

export function PathologyFindings({ result, threshold = 0.5 }: Props) {
  const pathologies = result.pathologies
  if (!pathologies || Object.keys(pathologies).length === 0) return null

  // Sort all findings descending by probability
  const sorted = Object.entries(pathologies).sort((a, b) => b[1] - a[1])

  const positiveCount = sorted.filter(([, p]) => p >= threshold).length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--card-border)" }}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
          <h2
            className="text-sm font-semibold"
            style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
          >
            Pathology Analysis
          </h2>
        </div>
        <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
          {positiveCount > 0
            ? `${positiveCount} finding${positiveCount > 1 ? "s" : ""} above ${Math.round(threshold * 100)}%`
            : "No significant findings"}
        </span>
      </div>

      {/* bars */}
      <div className="p-5 space-y-2.5">
        {sorted.map(([label, prob], i) => {
          const pct = prob * 100
          const color = barColor(prob, threshold)
          const isPositive = prob >= threshold
          return (
            <div key={label} className="flex items-center gap-3">
              <span
                className="text-xs w-40 shrink-0 truncate"
                style={{
                  color: isPositive ? "var(--foreground)" : "var(--foreground-muted)",
                  fontWeight: isPositive ? 600 : 400,
                }}
                title={label}
              >
                {label}
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.03 }}
                  style={{ background: color }}
                />
              </div>
              <span
                className="text-xs font-mono w-12 text-right shrink-0"
                style={{ color: isPositive ? color : "var(--foreground-subtle)" }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* footer meta */}
      {(result.model || result.inference_time_ms != null) && (
        <div
          className="flex items-center justify-between px-5 py-3 text-xs"
          style={{ borderTop: "1px solid var(--card-border)", color: "var(--foreground-subtle)" }}
        >
          <span>{result.model ?? "—"}</span>
          <span className="flex items-center gap-3">
            {result.tta && <span>TTA on</span>}
            {result.inference_time_ms != null && <span>{result.inference_time_ms} ms</span>}
          </span>
        </div>
      )}
    </div>
  )
}
