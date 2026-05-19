import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { doctorsService } from "@/services/doctorsService"
import { Stethoscope, Shield, Clock, CheckCircle, XCircle, FileText, Building, BookOpen, RefreshCw } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const statusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return { variant: "default" as const, icon: CheckCircle, label: "Verified" }
    case "rejected":
      return { variant: "destructive" as const, icon: XCircle, label: "Rejected" }
    default:
      return { variant: "secondary" as const, icon: Clock, label: "Pending" }
  }
}

export default function DoctorProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctor", "profile"],
    queryFn: () => doctorsService.getProfile(),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
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
              You haven&apos;t submitted a doctor application yet. Register to access doctor features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/doctor/register">
                <Stethoscope className="mr-2 h-4 w-4" />
                Register as Doctor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const status = statusBadge(profile.verification_status)
  const StatusIcon = status.icon

  const details = [
    { label: "License Number", value: profile.license_number, icon: FileText },
    { label: "Specialization", value: profile.specialization, icon: BookOpen },
    { label: "Clinic", value: profile.clinic_name ?? "Not specified", icon: Building },
    { label: "Bio", value: profile.bio ?? "No bio provided", icon: FileText },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        <p className="text-muted-foreground mt-1">Your professional information and verification status.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Verification Status</CardTitle>
                <CardDescription>Your application status</CardDescription>
              </div>
            </div>
            <Badge variant={status.variant} className="gap-1.5 text-sm px-3 py-1">
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </Badge>
          </CardHeader>
          <CardContent>
            {profile.verification_status === "rejected" && profile.rejection_reason && (
              <div className="bg-destructive/5 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
                <p className="text-sm text-muted-foreground">{profile.rejection_reason}</p>
              </div>
            )}
            {profile.verification_status === "rejected" && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/doctor/register">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-apply
                </Link>
              </Button>
            )}
            {profile.verification_status === "pending" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Your application is under review
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {details.map((detail, i) => {
              const Icon = detail.icon
              return (
                <div key={detail.label}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{detail.label}</p>
                      <p className="text-sm font-medium mt-0.5">{detail.value}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-medium">
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4">
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </motion.div>
    </motion.div>
  )
}
