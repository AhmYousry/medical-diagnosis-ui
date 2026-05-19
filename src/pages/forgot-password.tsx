import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/authService"

const fieldVariant = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.08 },
  }),
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  function validate() {
    if (!email) { setEmailError("Email is required"); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Invalid email format"); return false }
    setEmailError("")
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: "var(--navy-950)" }}>

      {/* left panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,var(--navy-800),var(--navy-950))", borderRight: "1px solid rgba(0,212,255,0.07)" }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#00D4FF" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-15 blur-[100px]" style={{ background: "var(--cyan-600)" }} />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-xs px-8">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <Mail className="h-10 w-10" style={{ color: "var(--cyan-500)" }} />
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
            Secure Recovery
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            We'll send a secure reset link to your email address. The link expires in 2 hours for your safety.
          </p>
        </div>
      </div>

      {/* right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--cyan-500)" }}>
              <Activity className="h-5 w-5" style={{ color: "var(--navy-950)" }} />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              MedScan AI
            </span>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-8 text-center"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: "rgba(0,229,160,0.1)" }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: "var(--success)" }} />
                </motion.div>
                <h2 className="mb-2 text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                  Check your inbox
                </h2>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  If <strong style={{ color: "var(--foreground)" }}>{email}</strong> is registered, you'll receive a reset link shortly.
                  Check your spam folder if you don't see it.
                </p>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              /* form state */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                    Forgot password?
                  </h1>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                </motion.div>

                <div className="rounded-2xl p-8" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* email field */}
                    <motion.div custom={0} variants={fieldVariant} initial="hidden" animate="visible" className="space-y-1.5">
                      <label className="block text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                        Email address
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                        style={{
                          background: "var(--surface-2)",
                          border: `1px solid ${emailError ? "var(--destructive)" : focused ? "var(--cyan-500)" : "var(--input-border)"}`,
                          color: "var(--foreground)",
                          boxShadow: focused && !emailError ? "0 0 0 3px var(--input-focus)" : "none",
                        }}
                      />
                      {emailError && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs" style={{ color: "var(--destructive)" }}>
                          {emailError}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.button
                      custom={1}
                      variants={fieldVariant}
                      initial="hidden"
                      animate="visible"
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-70"
                      style={{ background: "var(--cyan-500)", color: "var(--navy-950)", boxShadow: "0 4px 20px rgba(0,212,255,0.25)" }}
                    >
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send Reset Link"}
                    </motion.button>
                  </form>
                </div>

                <motion.div
                  custom={2}
                  variants={fieldVariant}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <Link to="/login" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:opacity-80" style={{ color: "var(--cyan-500)" }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
