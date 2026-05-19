import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"
import App from "./App"

export default function AppWithAuth() {
  const { setUser, setAuthenticated, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          const user = await authService.getMe()
          setUser(user)
          setAuthenticated(true)
        } catch {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [setUser, setAuthenticated, setLoading])

  return <App />
}
