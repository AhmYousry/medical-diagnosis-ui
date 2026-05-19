import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Activity, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { authService } from "@/services/authService"

type State = "verifying" | "success" | "error" | "no-token"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [state, setState] = useState<State>(token ? "verifying" : "no-token")
  const [errorMsg, setErrorMsg] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resendDone, setResendDone] = useState(false)

  useEffect(() => {
    if (!token) return
    authService
      .verifyEmail(token)
      .then(() => setState("success"))
      .catch((err: unknown) => {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response: { data?: { detail?: string } } }).response?.data?.detail ?? "Verification failed"
            : "Verification failed"
        setErrorMsg(msg)
        setState("error")
      })
  }, [token])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!resendEmail) return
    setResending(true)
    try {
      await authService.resendVerification(resendEmail)
      setResendDone(true)
    } catch {
      setResendDone(true) // prevent enumeration
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6" style={{ background: "var(--navy-950)" }}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#00D4FF" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-80 w-80 rounded-full opacity-10 blur-[100px]" style={{ background: "var(--cyan-600)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--cyan-500)" }}>
            <Activity className="h-5 w-5" style={{ color: "var(--navy-950)" }} />
          </div>
          <span className="text-xl font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
            MedScan AI
          </span>
        </div>

        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>

          {/* verifying */}
          {state === "verifying" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(0,212,255,0.08)" }}>
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--cyan-500)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                Verifying your email…
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Please wait a moment.</p>
            </motion.div>
          )}

          {/* success */}
          {state === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "rgba(0,229,160,0.1)" }}
              >
                <CheckCircle2 className="h-8 w-8" style={{ color: "var(--success)" }} />
              </motion.div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                Email verified!
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Your account is now fully verified. You can use all features of MedScan AI.
              </p>
              <Link to="/dashboard" className="mt-2 w-full">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full rounded-xl py-3 text-sm font-semibold"
                  style={{ background: "var(--cyan-500)", color: "var(--navy-950)", boxShadow: "0 4px 20px rgba(0,212,255,0.25)" }}
                >
                  Go to Dashboard
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* error */}
          {state === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(255,77,106,0.1)" }}>
                <AlertTriangle className="h-8 w-8" style={{ color: "var(--destructive)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--destructive)" }}>
                Verification failed
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>{errorMsg}</p>

              {/* resend form */}
              {resendDone ? (
                <p className="text-sm" style={{ color: "var(--success)" }}>
                  ✓ A new verification link has been sent if your email is registered.
                </p>
              ) : (
                <form onSubmit={handleResend} className="mt-2 w-full space-y-3">
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Request a new verification link:
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    required
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  />
                  <motion.button
                    type="submit"
                    disabled={resending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  >
                    {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Resend Link
                  </motion.button>
                </form>
              )}
              <Link to="/login" className="text-xs font-medium" style={{ color: "var(--cyan-500)" }}>Back to Sign In</Link>
            </motion.div>
          )}

          {/* no token */}
          {state === "no-token" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(255,184,0,0.08)" }}>
                <AlertTriangle className="h-8 w-8" style={{ color: "var(--warning)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                No token provided
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                This page requires a valid verification link from your email.
              </p>
              <Link to="/login">
                <button className="rounded-xl px-6 py-2.5 text-sm font-semibold" style={{ background: "var(--cyan-500)", color: "var(--navy-950)" }}>
                  Back to Sign In
                </button>
              </Link>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  )
}
