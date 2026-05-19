import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { doctorsService } from "@/services/doctorsService"
import { Clock, CheckCircle, XCircle, AlertTriangle, Stethoscope, ArrowLeft, RefreshCw } from "lucide-react"

export default function DoctorPendingPage() {
  const navigate = useNavigate()

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctor", "profile"],
    queryFn: () => doctorsService.getProfile(),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Card>
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl">Not Registered as Doctor</CardTitle>
              <CardDescription>
                You haven&apos;t submitted a doctor application yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/doctor/register")}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (profile.verification_status === "verified") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="text-center border-green-500/30">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-xl">You&apos;re Approved!</CardTitle>
              <CardDescription>
                Your doctor application has been verified. You now have access to doctor features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/doctor/profile")}>
                <Stethoscope className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (profile.verification_status === "rejected") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="text-center border-destructive/30">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">Application Rejected</CardTitle>
              <CardDescription>
                Your doctor application was not approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.rejection_reason && (
                <div className="bg-destructive/5 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-destructive mb-1">Reason:</p>
                  <p className="text-sm text-muted-foreground">{profile.rejection_reason}</p>
                </div>
              )}
              <Button className="w-full" onClick={() => navigate("/doctor/register")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-apply
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              className="flex justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </motion.div>
            <CardTitle className="text-xl">Application Under Review</CardTitle>
            <CardDescription>
              Your doctor application has been submitted and is currently being reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Estimated review time</p>
                  <p className="text-xs text-muted-foreground">
                    Typically takes 1-3 business days. You&apos;ll be notified once your application is reviewed.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Pending
              </Badge>
            </div>
            <Button variant="outline" className="w-full" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
