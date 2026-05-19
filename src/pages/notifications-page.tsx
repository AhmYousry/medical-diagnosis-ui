import { useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import type { Notification } from "@/types"
import { Bell, CheckCheck, Brain, AlertCircle, Info, Loader2 } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

const notificationConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  system: { icon: Info, color: "text-blue-500" },
  prediction_completed: { icon: Brain, color: "text-green-500" },
  prediction_failed: { icon: AlertCircle, color: "text-red-500" },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications")
      return res.data
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({ title: "All notifications marked as read" })
    },
    onError: () => {
      toast({ title: "Failed to mark notifications as read", variant: "destructive" })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: () => {
      toast({ title: "Failed to mark notification as read", variant: "destructive" })
    },
  })

  const notifications = data ?? []
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === "unread").length,
    [notifications]
  )

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-destructive">Failed to load notifications</p>
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your prediction results and system alerts.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="gap-2"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all read
          </Button>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;ll see notifications here when your predictions are complete or when there are system updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {notifications.map((notification) => {
              const config = notificationConfig[notification.type] ?? { icon: Info, color: "text-muted-foreground" }
              const Icon = config.icon
              const isUnread = notification.status === "unread"
              return (
                <motion.div key={notification.id} variants={itemVariants}>
                  <Card
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      isUnread ? "border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => {
                      if (isUnread) markReadMutation.mutate(notification.id)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              {isUnread && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {timeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${isUnread ? "text-foreground/80" : "text-muted-foreground"}`}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
