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
import { Search, Activity, ChevronLeft, ChevronRight, Brain, Eye } from "lucide-react"

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

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  processing: { label: "Processing", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
}

export default function AdminPredictionsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const size = 10

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "predictions", page, search, statusFilter],
    queryFn: () =>
      adminService.listPredictions({
        page,
        size,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  })

  const predictions = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.pages ?? 1

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">Failed to load predictions</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Manage Predictions</h1>
        <p className="text-muted-foreground mt-1">View and monitor all prediction requests.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by model name or user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v); setPage(1) }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
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
                `${total} prediction${total !== 1 ? "s" : ""} found`
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
            ) : predictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No predictions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? "Try a different search term." : "No predictions have been made yet."}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {predictions.map((pred) => {
                  const status = statusConfig[pred.status] ?? statusConfig.pending
                  return (
                    <motion.div
                      key={pred.id}
                      variants={itemVariants}
                      onClick={() => navigate(`/admin/predictions/${pred.id}`)}
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {pred.model_name ?? "Medical Scan Prediction"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {pred.requested_by_name ?? pred.requested_by_email ?? "Unknown user"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {pred.predicted_label && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 hidden sm:block">
                            {pred.predicted_label}
                          </span>
                        )}
                        {pred.confidence_score !== undefined && (
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {(pred.confidence_score * 100).toFixed(1)}%
                          </span>
                        )}
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(pred.created_at).toLocaleDateString()}
                        </span>
                        <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </motion.div>
                  )
                })}
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
