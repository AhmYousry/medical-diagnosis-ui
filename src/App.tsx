import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import AppLayout from "@/components/layout/app-layout"
import ProtectedRoute from "@/components/layout/protected-route"

import LandingPage from "@/pages/landing"
import LoginPage from "@/pages/login"
import RegisterPage from "@/pages/register"
import ForgotPasswordPage from "@/pages/forgot-password"
import ResetPasswordPage from "@/pages/reset-password"
import VerifyEmailPage from "@/pages/verify-email"
import DoctorRegisterPage from "@/pages/doctor-register"
import UserDashboard from "@/pages/user-dashboard"
import UploadPage from "@/pages/upload-page"
import PredictionsPage from "@/pages/predictions-page"
import PredictionDetail from "@/pages/prediction-detail"
import NotificationsPage from "@/pages/notifications-page"
import SettingsPage from "@/pages/settings-page"
import AdminDashboard from "@/pages/admin-dashboard"
import AdminUsers from "@/pages/admin-users"
import AdminPredictions from "@/pages/admin-predictions"
import AdminPredictionDetail from "@/pages/admin-prediction-detail"
import DoctorPending from "@/pages/doctor-pending"
import DoctorProfile from "@/pages/doctor-profile"
import NotFound from "@/pages/not-found"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/predictions/:id" element={<PredictionDetail />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/doctor/register" element={<DoctorRegisterPage />} />
                <Route path="/doctor/pending" element={<DoctorPending />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/predictions"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPredictions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/predictions/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPredictionDetail />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
