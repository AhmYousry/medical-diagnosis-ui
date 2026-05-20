import { motion } from "framer-motion"
import { ShieldAlert } from "lucide-react"

type Variant = "banner" | "compact" | "footnote"

interface Props {
  variant?: Variant
  className?: string
}

export function MedicalDisclaimer({ variant = "banner", className = "" }: Props) {
  if (variant === "footnote") {
    return (
      <p
        className={`text-[11px] leading-relaxed ${className}`}
        style={{ color: "var(--foreground-subtle)" }}
      >
        ⚠ Research and educational use only — not approved by FDA/CE. AI predictions
        must not replace evaluation by a licensed radiologist.
      </p>
    )
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-start gap-2 rounded-xl px-3 py-2 ${className}`}
        style={{
          background: "rgba(255,184,0,0.06)",
          border: "1px solid rgba(255,184,0,0.2)",
        }}
      >
        <ShieldAlert
          className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
          style={{ color: "var(--warning)" }}
        />
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          <span style={{ color: "var(--warning)", fontWeight: 600 }}>Research use only.</span>{" "}
          Always confirm with a licensed radiologist.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-start gap-3 rounded-2xl p-4 ${className}`}
      style={{
        background: "rgba(255,184,0,0.05)",
        border: "1px solid rgba(255,184,0,0.25)",
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(255,184,0,0.12)" }}
      >
        <ShieldAlert className="h-4 w-4" style={{ color: "var(--warning)" }} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
          For research &amp; educational use only
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          MedScan AI is not a certified medical device and has not been approved by the FDA, CE,
          or any regulatory body. Predictions are probabilistic and may be incorrect. They must
          be reviewed by a licensed radiologist before any clinical decision is made.
        </p>
      </div>
    </motion.div>
  )
}
