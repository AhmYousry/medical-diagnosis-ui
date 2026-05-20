import { useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { uploadsService } from "@/services/uploadsService"
import { predictionsService } from "@/services/predictionsService"
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer"
import { Upload, FileImage, CheckCircle, Loader2, Brain, ScanLine, ArrowRight, X } from "lucide-react"

type Step = "upload" | "analyzing" | "results"

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "application/dicom"]

const steps: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "analyzing", label: "Analyzing" },
  { key: "results", label: "Results" },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [step, setStep] = useState<Step>("upload")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    uploadId: string
    prediction: { id: string; status: string; predicted_label?: string; confidence_score?: number }
  } | null>(null)

  const uploadMutation = useMutation({
    mutationFn: (f: File) => uploadsService.upload(f),
    onSuccess: (data) => {
      setStep("analyzing")
      setProgress(50)
      createMutation.mutate(data.id)
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Could not upload the file.", variant: "destructive" })
      setStep("upload")
      setProgress(0)
    },
  })

  const createMutation = useMutation({
    mutationFn: (fileId: string) => predictionsService.create(fileId),
    onSuccess: (data) => {
      setProgress(100)
      setStep("results")
      setResult((prev) => ({ uploadId: prev?.uploadId ?? "", prediction: data }))
    },
    onError: () => {
      toast({ title: "Analysis failed", description: "Could not analyze the scan.", variant: "destructive" })
      setStep("upload")
      setProgress(0)
    },
  })

  const isValidFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase()
    return acceptedTypes.includes(f.type) || ["dcm", "png", "jpg", "jpeg"].includes(ext ?? "")
  }

  const handleFile = useCallback((f: File) => {
    if (!isValidFile(f)) {
      toast({ title: "Invalid file type", description: "Please upload PNG, JPG, JPEG, or DICOM.", variant: "destructive" })
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStep("upload")
    setProgress(0)
    setResult(null)
  }, [toast])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(true) }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(false) }, [])
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }, [handleFile])

  const handleUpload = () => {
    if (!file) return
    setStep("analyzing")
    setProgress(10)
    uploadMutation.mutate(file)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setStep("upload")
    setProgress(0)
    setResult(null)
  }

  const isPending = uploadMutation.isPending || createMutation.isPending
  const stepIndex = steps.findIndex(s => s.key === step)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto space-y-6 pb-8"
    >
      {/* heading */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}
        >
          Upload Scan
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Submit a medical image for AI-powered analysis.
        </p>
      </div>

      {/* research-use-only disclaimer */}
      <MedicalDisclaimer variant="compact" />

      {/* step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  background: i < stepIndex
                    ? "var(--success)"
                    : i === stepIndex
                    ? "var(--cyan-500)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: i === stepIndex ? "0 0 12px rgba(0,212,255,0.4)" : "none",
                }}
                transition={{ duration: 0.3 }}
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ color: i <= stepIndex ? "var(--navy-950)" : "var(--foreground-subtle)" }}
              >
                {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </motion.div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: i === stepIndex ? "var(--foreground)" : "var(--foreground-subtle)" }}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className="flex-1 mx-3">
                <motion.div
                  className="h-px"
                  animate={{ background: i < stepIndex ? "var(--cyan-500)" : "rgba(255,255,255,0.08)" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* panels */}
      <AnimatePresence mode="wait">

        {/* ── UPLOAD ── */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* dropzone */}
            <motion.div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              animate={{
                borderColor: dragActive ? "rgba(0,212,255,0.6)" : "rgba(0,212,255,0.12)",
                background: dragActive ? "rgba(0,212,255,0.05)" : "rgba(13,21,48,0.6)",
              }}
              whileHover={{ borderColor: "rgba(0,212,255,0.3)" }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 cursor-pointer overflow-hidden"
            >
              {/* subtle scan line when drag active */}
              {dragActive && (
                <motion.div
                  className="absolute inset-x-0 h-px"
                  style={{ background: "linear-gradient(90deg,transparent,var(--cyan-500),transparent)", top: "50%" }}
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.dcm,image/png,image/jpeg"
                className="hidden"
                onChange={onInputChange}
              />
              <motion.div
                animate={dragActive ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
              >
                <Upload className="h-7 w-7" style={{ color: "var(--cyan-500)" }} />
              </motion.div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                {dragActive ? "Drop your file here" : "Drag & drop your scan here"}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                or click to browse — PNG, JPG, JPEG, DICOM
              </p>
            </motion.div>

            {/* file preview */}
            {file && preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl p-4 space-y-4"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--surface-2)" }}>
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{file.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: "rgba(0,229,160,0.1)", color: "var(--success)" }}
                    >
                      <CheckCircle className="h-2.5 w-2.5" />
                      Ready to upload
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-subtle)" }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <motion.button
                  onClick={handleUpload}
                  disabled={isPending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-60"
                  style={{
                    background: "var(--cyan-500)",
                    color: "var(--navy-950)",
                    boxShadow: "0 4px 20px rgba(0,212,255,0.25)",
                  }}
                >
                  {isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Brain className="h-4 w-4" /> Upload & Analyze</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-2xl p-10 flex flex-col items-center justify-center text-center"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
            >
              {/* animated brain ring */}
              <div className="relative h-24 w-24 mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: "rgba(0,212,255,0.3)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full"
                  style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)" }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-8 w-8" style={{ color: "var(--cyan-500)" }} />
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Clash Display',sans-serif", color: "var(--foreground)" }}>
                Analyzing Your Scan
              </h3>
              <p className="text-sm mb-8" style={{ color: "var(--foreground-muted)" }}>
                Our AI model is processing the image. This may take a moment.
              </p>

              {/* progress bar */}
              <div className="w-full max-w-sm">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,var(--cyan-500),rgba(0,212,255,0.6))" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs mt-2 text-right" style={{ color: "var(--foreground-subtle)" }}>{progress}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid rgba(0,229,160,0.2)" }}
            >
              {/* header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid rgba(0,229,160,0.12)", background: "rgba(0,229,160,0.04)" }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(0,229,160,0.12)" }}
                >
                  <CheckCircle className="h-4 w-4" style={{ color: "var(--success)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>Analysis Complete</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Your scan has been analyzed successfully.</p>
                </div>
              </div>

              {/* result body */}
              <div className="p-5 space-y-4">
                <div
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)" }}
                  >
                    <ScanLine className="h-6 w-6" style={{ color: "var(--cyan-500)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {result.prediction.predicted_label ?? "Result pending"}
                    </p>
                    {result.prediction.confidence_score !== undefined && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                        Confidence: {result.prediction.confidence_score.toFixed(1)}%
                      </p>
                    )}
                    <p className="text-xs capitalize mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
                      Status: {result.prediction.status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={reset}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex-1 rounded-xl py-3 text-sm font-medium transition-all"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--card-border)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    Upload Another
                  </motion.button>
                  <motion.button
                    onClick={() => navigate(`/predictions/${result.prediction.id}`)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
                    style={{
                      background: "var(--cyan-500)",
                      color: "var(--navy-950)",
                      boxShadow: "0 4px 16px rgba(0,212,255,0.2)",
                    }}
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
