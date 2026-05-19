import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { adminService } from "@/services/adminService"
import { Users, Shield, Activity, Clock, UserCheck, ArrowRight, Brain, Stethoscope } from "lucide-react"

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

export default function AdminDashboard() {
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.listUsers({ page: 1, size: 1 }),
  })

  const doctorsQuery = useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: () => adminService.listDoctors({ page: 1, size: 1 }),
  })

  const predictionsQuery = useQuery({
    queryKey: ["admin", "predictions"],
    queryFn: () => adminService.listPredictions({ page: 1, size: 1 }),
  })

  const recentUsersQuery = useQuery({
    queryKey: ["admin", "users", "recent"],
    queryFn: () => adminService.listUsers({ page: 1, size: 5 }),
  })

  const recentPredictionsQuery = useQuery({
    queryKey: ["admin", "predictions", "recent"],
    queryFn: () => adminService.listPredictions({ page: 1, size: 5 }),
  })

  const pendingDoctorsQuery = useQuery({
    queryKey: ["admin", "doctors", "pending"],
    queryFn: () => adminService.listDoctors({ page: 1, size: 1, verification_status: "pending" }),
  })

  const isLoading = usersQuery.isLoading || doctorsQuery.isLoading || predictionsQuery.isLoading

  const stats = useMemo(() => ({
    totalUsers: usersQuery.data?.total ?? 0,
    totalDoctors: doctorsQuery.data?.total ?? 0,
    totalPredictions: predictionsQuery.data?.total ?? 0,
    pendingVerifications: pendingDoctorsQuery.data?.total ?? 0,
  }), [usersQuery.data, doctorsQuery.data, predictionsQuery.data, pendingDoctorsQuery.data])

  const recentUsers = recentUsersQuery.data?.items ?? []
  const recentPredictions = recentPredictionsQuery.data?.items ?? []

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-green-500" },
    { label: "Total Predictions", value: stats.totalPredictions, icon: Brain, color: "text-purple-500" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Clock, color: "text-amber-500" },
  ]

  if (usersQuery.isError || doctorsQuery.isError || predictionsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">Failed to load dashboard data</p>
        <Button variant="outline" onClick={() => { usersQuery.refetch(); doctorsQuery.refetch(); predictionsQuery.refetch() }}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and management at a glance.</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsersQuery.isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No users yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPredictionsQuery.isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentPredictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Brain className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No predictions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPredictions.map((pred) => (
                  <div
                    key={pred.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Activity className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {pred.model_name ?? "Prediction"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pred.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        pred.status === "completed"
                          ? "default"
                          : pred.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {pred.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Button className="h-auto py-4 justify-start gap-3" asChild>
            <Link to="/admin/users">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-xs text-primary-foreground/70">View and manage all users</p>
              </div>
            </Link>
          </Button>
          <Button className="h-auto py-4 justify-start gap-3" variant="outline" asChild>
            <Link to="/admin/predictions">
              <Brain className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Manage Predictions</p>
                <p className="text-xs text-muted-foreground">View all predictions</p>
              </div>
            </Link>
          </Button>
          <Button className="h-auto py-4 justify-start gap-3" variant="outline" asChild>
            <Link to="/admin/users?role=doctor">
              <Stethoscope className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Manage Doctors</p>
                <p className="text-xs text-muted-foreground">Verify doctor applications</p>
              </div>
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
