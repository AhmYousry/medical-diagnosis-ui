import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Activity } from "lucide-react"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--navy-900)" }}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "var(--cyan-500)" }}
      />

      {/* dot grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots404" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#00D4FF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots404)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* animated ring icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-32 w-32 mb-8"
        >
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "rgba(0,212,255,0.3)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border"
            style={{ borderColor: "rgba(0,212,255,0.15)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="h-10 w-10" style={{ color: "var(--cyan-500)" }} />
            </motion.div>
          </div>
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-4"
        >
          <span
            className="text-[7rem] font-bold leading-none select-none"
            style={{
              fontFamily: "'Clash Display',sans-serif",
              background: "linear-gradient(135deg, var(--cyan-500) 0%, rgba(0,212,255,0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="text-sm mb-8 max-w-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.46 }}
        >
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
              style={{
                background: "var(--cyan-500)",
                color: "var(--navy-950)",
                boxShadow: "0 4px 20px rgba(0,212,255,0.3)",
              }}
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
