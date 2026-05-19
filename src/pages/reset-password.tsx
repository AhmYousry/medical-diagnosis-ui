import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react"
import { authService } from "@/services/authService"

const fieldVariant = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.08 },
  }),
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [apiError, setApiError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const invalidToken = !token

  function validate() {
    const errs: typeof errors = {}
    if (!password) errs.password = "Password is required"
    else if (password.length < 8) errs.password = "Must be at least 8 characters"
    if (!confirm) errs.confirm = "Please confirm your password"
    else if (password !== confirm) errs.confirm = "Passwords do not match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError("")
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { detail?: string } } }).response?.data?.detail ?? "Reset failed"
        : "Reset failed"
      setApiError(msg)
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
          {[
            { v: "8+ chars", l: "Minimum length" },
            { v: "Unique", l: "Not reused" },
            { v: "Strong", l: "Mix of chars" },
          ].map(({ v, l }, i) => (
            <motion.div
              key={v}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(0,212,255,0.08)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--cyan-500)" }}>{v}</span>
              </div>
              <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>{l}</span>
            </motion.div>
          ))}
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
            {invalidToken ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl p-8 text-center"
                style={{ background: "rgba(255,77,106,0.04)", border: "1px solid rgba(255,77,106,0.2)" }}
              >
                <AlertTriangle className="mx-auto mb-4 h-12 w-12" style={{ color: "var(--destructive)" }} />
                <h2 className="mb-2 text-xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--destructive)" }}>
                  Invalid Link
                </h2>
                <p className="mb-6 text-sm" style={{ color: "var(--foreground-muted)" }}>
                  This reset link is missing or invalid. Please request a new one.
                </p>
                <Link to="/forgot-password">
                  <button className="rounded-xl px-6 py-2.5 text-sm font-semibold" style={{ background: "var(--cyan-500)", color: "var(--navy-950)" }}>
                    Request New Link
                  </button>
                </Link>
              </motion.div>
            ) : done ? (
              <motion.div
                key="done"
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
                  Password reset!
                </h2>
                <p className="mb-6 text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Your password has been updated. Redirecting to sign in…
                </p>
                <Link to="/login">
                  <button className="rounded-xl px-6 py-2.5 text-sm font-semibold" style={{ background: "var(--cyan-500)", color: "var(--navy-950)" }}>
                    Sign In
                  </button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                    Set new password
                  </h1>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Choose a strong password for your account.
                  </p>
                </motion.div>

                <div className="rounded-2xl p-8" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* API error */}
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl px-4 py-3 text-sm"
                        style={{ background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)", color: "var(--destructive)" }}
                      >
                        {apiError}
                      </motion.div>
                    )}

                    {/* password */}
                    <motion.div custom={0} variants={fieldVariant} initial="hidden" animate="visible" className="space-y-1.5">
                      <label className="block text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>New password</label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusedField("pwd")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all duration-200"
                          style={{
                            background: "var(--surface-2)",
                            border: `1px solid ${errors.password ? "var(--destructive)" : focusedField === "pwd" ? "var(--cyan-500)" : "var(--input-border)"}`,
                            color: "var(--foreground)",
                            boxShadow: focusedField === "pwd" && !errors.password ? "0 0 0 3px var(--input-focus)" : "none",
                          }}
                        />
                        <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground-subtle)" }}>
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs" style={{ color: "var(--destructive)" }}>
                          {errors.password}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* confirm */}
                    <motion.div custom={1} variants={fieldVariant} initial="hidden" animate="visible" className="space-y-1.5">
                      <label className="block text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>Confirm password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          onFocus={() => setFocusedField("confirm")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all duration-200"
                          style={{
                            background: "var(--surface-2)",
                            border: `1px solid ${errors.confirm ? "var(--destructive)" : focusedField === "confirm" ? "var(--cyan-500)" : "var(--input-border)"}`,
                            color: "var(--foreground)",
                            boxShadow: focusedField === "confirm" && !errors.confirm ? "0 0 0 3px var(--input-focus)" : "none",
                          }}
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground-subtle)" }}>
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirm && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs" style={{ color: "var(--destructive)" }}>
                          {errors.confirm}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.button
                      custom={2}
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
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : "Reset Password"}
                    </motion.button>
                  </form>
                </div>

                <motion.div
                  custom={3}
                  variants={fieldVariant}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 text-center text-sm"
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
