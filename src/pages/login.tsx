import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"
import { Activity, Loader2, Eye, EyeOff, Scan } from "lucide-react"

const fieldVariant = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.08 },
  }),
}

function Field({
  id, label, type, placeholder, value, onChange, error, index,
}: {
  id: string; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string; index: number
}) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const isPassword = type === "password"

  return (
    <motion.div custom={index} variants={fieldVariant} initial="hidden" animate="visible" className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-10"
          style={{
            background: "var(--surface-2)",
            border: `1px solid ${error ? "var(--destructive)" : focused ? "var(--cyan-500)" : "var(--input-border)"}`,
            color: "var(--foreground)",
            boxShadow: focused && !error ? "0 0 0 3px var(--input-focus)" : "none",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--foreground-subtle)" }}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs"
          style={{ color: "var(--destructive)" }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setUser = useAuthStore(s => s.setUser)
  const setAuthenticated = useAuthStore(s => s.setAuthenticated)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errs: typeof errors = {}
    if (!email) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format"
    if (!password) errs.password = "Password is required"
    else if (password.length < 6) errs.password = "Password must be at least 6 characters"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      localStorage.setItem("access_token", res.access_token)
      localStorage.setItem("refresh_token", res.refresh_token)
      setUser(res.user)
      setAuthenticated(true)
      toast({ title: "Welcome back!", description: `Signed in as ${res.user.full_name}` })
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { detail?: string } } }).response?.data?.detail || "Login failed"
        : "Login failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: "var(--navy-950)" }}>

      {/* ── Left panel (decorative) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,var(--navy-800),var(--navy-950))", borderRight: "1px solid rgba(0,212,255,0.07)" }}>

        {/* dot grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#00D4FF" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-15 blur-[100px]" style={{ background: "var(--cyan-600)" }} />

        {/* scan ring */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative h-56 w-56">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: `rgba(0,212,255,${0.2 - i * 0.05})`, inset: `${i * 18}px` }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 12 + i * 4, repeat: Infinity, ease: "linear" }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Scan className="h-16 w-16" style={{ color: "var(--cyan-500)" }} />
              </motion.div>
            </div>
          </div>

          <div className="text-center max-w-xs">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Clinical Intelligence
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              AI-powered diagnostics trusted by 500+ healthcare providers worldwide.
            </p>
          </div>

          {/* stat pills */}
          <div className="flex gap-3">
            {[["99%", "Accuracy"], ["< 5 min", "Results"], ["24/7", "Uptime"]].map(([v, l], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              >
                <div className="text-sm font-bold" style={{ color: "var(--cyan-500)", fontFamily: "'Clash Display',sans-serif" }}>{v}</div>
                <div className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* logo */}
          <div className="mb-8 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--cyan-500)" }}
            >
              <Activity className="h-5 w-5" style={{ color: "var(--navy-950)" }} />
            </motion.div>
            <span className="text-xl font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              MedScan AI
            </span>
          </div>

          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* form card */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field id="email" label="Email address" type="email" placeholder="name@example.com" value={email} onChange={setEmail} error={errors.email} index={0} />
              <div className="space-y-1.5">
                <Field id="password" label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} error={errors.password} index={1} />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: "var(--cyan-500)" }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

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
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : "Sign In"}
              </motion.button>
            </form>
          </div>

          {/* links */}
          <motion.div
            custom={3}
            variants={fieldVariant}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-2 text-center text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium transition-colors hover:opacity-80" style={{ color: "var(--cyan-500)" }}>
                Register
              </Link>
            </p>
            <p>
              Are you a doctor?{" "}
              <Link to="/doctor/register" className="font-medium transition-colors hover:opacity-80" style={{ color: "var(--cyan-500)" }}>
                Register here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
