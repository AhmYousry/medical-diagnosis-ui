import { Navigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--navy-900)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--cyan-500)", borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{ background: "var(--cyan-glow)" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="text-sm" style={{ color: "var(--foreground-muted)", fontFamily: "'DM Sans', sans-serif" }}>
            Verifying session…
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
