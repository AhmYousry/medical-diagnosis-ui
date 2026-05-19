import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Activity, Shield, Zap, Brain, Upload, FileText, Stethoscope, ArrowRight, Sparkles, Lock } from "lucide-react"

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

/* ── data ── */
const features = [
  { icon: Brain, title: "AI Analysis", desc: "Advanced neural networks detect patterns invisible to the human eye with clinical-grade precision." },
  { icon: Zap, title: "Sub-5 Minute Results", desc: "Diagnostic insights delivered in minutes without compromising on accuracy or depth." },
  { icon: Lock, title: "HIPAA Compliant", desc: "End-to-end encryption with full HIPAA & GDPR compliance baked into every layer." },
  { icon: Shield, title: "Expert Reviewed", desc: "Every AI output is validated by board-certified radiologists before delivery." },
]

const steps = [
  { icon: Upload, label: "01", title: "Upload Scan", desc: "DICOM, JPEG, or PNG — securely transferred and immediately encrypted." },
  { icon: Brain, label: "02", title: "AI Processing", desc: "Our deep learning model analyzes structure, density, and anomaly patterns." },
  { icon: FileText, label: "03", title: "Detailed Report", desc: "Confidence scores, highlighted regions, and differential diagnoses." },
  { icon: Stethoscope, label: "04", title: "Doctor Review", desc: "A certified physician validates findings and co-signs the final report." },
]

const stats = [
  { value: "10K+", label: "Scans Analyzed" },
  { value: "99.2%", label: "Accuracy Rate" },
  { value: "< 5 min", label: "Average Result Time" },
  { value: "24 / 7", label: "AI Uptime" },
]

/* ── Ambient dot grid ── */
function DotGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#00D4FF" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

/* ── Animated scan ring ── */
function ScanRing() {
  return (
    <div className="pointer-events-none absolute right-[-8%] top-1/2 -translate-y-1/2 hidden lg:block">
      <div className="relative h-[520px] w-[520px]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `rgba(0,212,255,${0.15 - i * 0.04})` }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
          />
        ))}
        {/* crosshair lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full opacity-10" style={{ background: "var(--cyan-500)" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px opacity-10" style={{ background: "var(--cyan-500)" }} />
        </div>
        {/* rotating arc */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 75%, rgba(0,212,255,0.35) 100%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-4 w-4 rounded-full"
            style={{ background: "var(--cyan-500)" }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Main component ── */
export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: "var(--navy-900)" }}>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 z-50 w-full"
        style={{ background: "rgba(10,15,30,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,212,255,0.06)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--cyan-500)" }}>
              <Activity className="h-4 w-4" style={{ color: "var(--navy-950)" }} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              MedScan AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-medium transition-colors"
              style={{ color: "var(--foreground-muted)" }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-lg"
              style={{ background: "var(--cyan-500)", color: "var(--navy-950)", boxShadow: "0 0 0 0 var(--cyan-glow)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px var(--cyan-glow-strong)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden pt-20"
        style={{ background: "linear-gradient(160deg, var(--navy-950) 0%, var(--navy-900) 50%, var(--navy-800) 100%)" }}
      >
        <DotGrid />
        {/* ambient glow blobs */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full opacity-20 blur-[120px]" style={{ background: "var(--cyan-600)" }} />
        <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full opacity-10 blur-[100px]" style={{ background: "var(--cyan-500)" }} />

        <ScanRing />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          {/* badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{ borderColor: "rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.06)", color: "var(--cyan-300)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 500+ healthcare providers worldwide
          </motion.div>

          {/* headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-3xl text-[3.25rem] font-bold leading-[1.1] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
          >
            AI-Powered{" "}
            <span style={{ background: "linear-gradient(120deg,#00D4FF,#fff 55%,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Medical
            </span>{" "}
            Diagnosis
          </motion.h1>

          {/* sub */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Upload a scan. Our AI analyzes it in minutes with 99% accuracy.
            Every report co-signed by a board-certified specialist.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "var(--cyan-500)", color: "var(--navy-950)", boxShadow: "0 4px 24px rgba(0,212,255,0.3)" }}
            >
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-medium transition-all duration-200 hover:border-cyan-500/40"
              style={{ borderColor: "rgba(0,212,255,0.15)", color: "var(--foreground-muted)", background: "transparent" }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              How it works
            </button>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-5 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: "rgba(0,212,255,0.2)" }}
          >
            <div className="h-1.5 w-1 rounded-full" style={{ background: "var(--cyan-500)" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative z-10 -mt-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div
              className="grid grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0 rounded-2xl overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
            >
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="p-6 text-center"
                >
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: "'Clash Display',sans-serif", background: "linear-gradient(135deg,#00D4FF,#fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest" style={{ color: "var(--cyan-500)" }}>
              Capabilities
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              Why MedScan AI?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: "var(--foreground-muted)" }}>
              Precision diagnostics that combine frontier AI with clinical rigor.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(0,212,255,0.3)" }}
                  className="group h-full rounded-2xl p-6 transition-all duration-300"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-lg"
                    style={{ background: "rgba(0,212,255,0.08)", boxShadow: "0 0 0 0 rgba(0,212,255,0)" }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <f.icon className="h-6 w-6" style={{ color: "var(--cyan-500)" }} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                    {f.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8" style={{ background: "var(--surface-1)" }}>
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest" style={{ color: "var(--cyan-500)" }}>
              Process
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
              From Scan to Report
            </h2>
          </Reveal>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-[2.5rem] hidden h-px md:block" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 20%, rgba(0,212,255,0.3) 80%, transparent)" }} />

            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: "var(--navy-800)", border: "2px solid rgba(0,212,255,0.2)", boxShadow: "0 0 24px rgba(0,212,255,0.08)" }}
                  >
                    <s.icon className="h-8 w-8" style={{ color: "var(--cyan-500)" }} />
                    <div
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "var(--cyan-500)", color: "var(--navy-950)", fontFamily: "'Clash Display',sans-serif" }}
                    >
                      {i + 1}
                    </div>
                  </motion.div>
                  <h3 className="mb-2 text-base font-semibold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl p-12"
              style={{ background: "var(--surface-2)", border: "1px solid rgba(0,212,255,0.12)" }}
            >
              {/* glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 rounded-full opacity-20 blur-[80px]" style={{ background: "var(--cyan-600)" }} />
              </div>
              <div className="relative z-10">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest" style={{ color: "var(--cyan-500)" }}>
                  Get Started Today
                </p>
                <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                  Transform Your Diagnostics
                </h2>
                <p className="mb-8 text-lg" style={{ color: "var(--foreground-muted)" }}>
                  Join thousands of healthcare professionals already using MedScan AI.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: "var(--cyan-500)", color: "var(--navy-950)", boxShadow: "0 4px 24px rgba(0,212,255,0.3)" }}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-4" style={{ borderColor: "rgba(0,212,255,0.06)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2" style={{ color: "var(--foreground-muted)" }}>
            <Activity className="h-4 w-4" style={{ color: "var(--cyan-500)" }} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Clash Display',sans-serif" }}>MedScan AI</span>
          </div>
          <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
            &copy; {new Date().getFullYear()} MedScan AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
