import { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

export type WsPayload = {
  prediction_id: string
  status: "processing" | "completed" | "failed"
  predicted_label?: string
  confidence_score?: number
  result?: Record<string, unknown>
  error_message?: string
}

type Options = {
  onUpdate?: (payload: WsPayload) => void
  enabled?: boolean
}

const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^http/, "ws")
  : `ws://${window.location.host}`

export function usePredictionSocket(predictionId: string | undefined, options: Options = {}) {
  const { onUpdate, enabled = true } = options
  const wsRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (!predictionId || !enabled) return
    const token = localStorage.getItem("access_token")
    if (!token) return

    const url = `${WS_BASE}/api/v1/predict/${predictionId}/ws?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const payload: WsPayload = JSON.parse(event.data)

        // optimistically update React Query cache
        queryClient.setQueryData(["prediction", predictionId], (old: Record<string, unknown> | undefined) => {
          if (!old) return old
          return { ...old, ...payload }
        })

        onUpdate?.(payload)

        // invalidate list so predictions page reflects the new status
        if (payload.status === "completed" || payload.status === "failed") {
          queryClient.invalidateQueries({ queryKey: ["predictions"] })
        }
      } catch {
        // malformed message — ignore
      }
    }

    ws.onerror = () => {
      // silent — will reconnect on next render if needed
    }

    ws.onclose = () => {
      wsRef.current = null
    }
  }, [predictionId, enabled, onUpdate, queryClient])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])
}
