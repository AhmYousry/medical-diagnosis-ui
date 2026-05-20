import api from "@/services/api"
import type { Notification } from "@/types"

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    const res = await api.get<Notification[]>("/notifications")
    return res.data
  },

  unreadCount: async (): Promise<number> => {
    const res = await api.get<{ unread: number }>("/notifications/unread-count")
    return res.data.unread
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`)
  },

  markAllRead: async (): Promise<void> => {
    await api.post("/notifications/read-all")
  },
}
