import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { adminService } from "@/services/adminService"
import { Search, Users as UsersIcon, ChevronLeft, ChevronRight, Shield, User, Stethoscope } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

const roleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="h-3.5 w-3.5" />
    case "doctor":
      return <Stethoscope className="h-3.5 w-3.5" />
    default:
      return <User className="h-3.5 w-3.5" />
  }
}

const roleVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "default" as const
    case "doctor":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

const statusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default" as const
    case "inactive":
      return "secondary" as const
    case "suspended":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const size = 10

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users", page, search, roleFilter],
    queryFn: () =>
      adminService.listUsers({
        page,
        size,
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      }),
  })

  const users = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.pages ?? 1

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UsersIcon className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">Failed to load users</p>
        <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
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
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => { setRoleFilter(v); setPage(1) }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                `${total} user${total !== 1 ? "s" : ""} found`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? "Try a different search term." : "No users have registered yet."}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {roleIcon(user.role)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge variant={roleVariant(user.role)} className="gap-1">
                        {roleIcon(user.role)}
                        {user.role}
                      </Badge>
                      <Badge variant={statusVariant(user.status)}>
                        {user.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
