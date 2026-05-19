import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { adminService } from "@/services/adminService"
import { Brain, Calendar, Clock, Activity, CheckCircle, XCircle, AlertTriangle, User, FileText, History, ArrowLeft } from "lucide-react"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  processing: { label: "Processing", variant: "secondary", icon: Activity },
  completed: { label: "Completed", variant: "default", icon: CheckCircle },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
}

export default function AdminPredictionDetail() {
  const { id } = useParams<{ id: string }>()
  const [logsPage, setLogsPage] = useState(1)

  const { data: prediction, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "prediction", id],
    queryFn: () => adminService.getPrediction(id!),
    enabled: !!id,
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["admin", "prediction", id, "logs", logsPage],
    queryFn: () => adminService.getPredictionLogs(id!, { page: logsPage, size: 20 }),
    enabled: !!id,
  })

  const logs = logsData?.items ?? []

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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

  if (isError || !prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">Prediction not found</p>
        <p className="text-sm text-muted-foreground">
          The prediction you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button variant="outline" asChild>
          <Link to="/admin/predictions">Back to Predictions</Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[prediction.status] ?? statusConfig.pending
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/predictions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prediction Details</h1>
          <p className="text-sm text-muted-foreground mt-1">ID: {prediction.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Status
          </CardTitle>
          <Badge variant={status.variant} className="gap-1.5 text-sm px-3 py-1">
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">{prediction.model_name ?? "N/A"}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{prediction.model_version ?? "N/A"}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Predicted Label</span>
                <span className="font-medium">
                  {prediction.predicted_label ?? (
                    <span className="text-muted-foreground italic">Pending</span>
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">
                  {prediction.confidence_score !== undefined
                    ? `${(prediction.confidence_score * 100).toFixed(2)}%`
                    : <span className="text-muted-foreground italic">N/A</span>}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(prediction.created_at).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {new Date(prediction.updated_at).toLocaleString()}
                </span>
              </div>
              {prediction.completed_at && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {new Date(prediction.completed_at).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Requested By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{prediction.requested_by_name ?? "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{prediction.requested_by_email ?? "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction.result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Result Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-64 whitespace-pre-wrap font-mono">
              {typeof prediction.result === "object"
                ? JSON.stringify(prediction.result, null, 2)
                : (() => {
                    try { return JSON.stringify(JSON.parse(prediction.result as string), null, 2) }
                    catch { return String(prediction.result) }
                  })()
              }
            </pre>
          </CardContent>
        </Card>
      )}

      {prediction.error_message && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Error Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{prediction.error_message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Prediction Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No logs available yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-72">
              <div className="space-y-1 p-4">
                {logs.map((log, i) => (
                  <div
                    key={log.id}
                    className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                      {i < logs.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{log.event}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{log.message}</p>
                      )}
                      {log.actor_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {log.actor_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {(logsData?.pages ?? 1) > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-xs text-muted-foreground">
                Page {logsPage} of {logsData?.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsPage <= 1}
                  onClick={() => setLogsPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsPage >= (logsData?.pages ?? 1)}
                  onClick={() => setLogsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
