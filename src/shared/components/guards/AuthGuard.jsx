import React, { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useStore } from "react-redux"
import { useAuth } from "@/features/auth"
import { ensureRefresh } from "@/store/api/baseApi"
import VideoCallLoading from "@/features/video-call/components/VideoCallLoading"

const AuthGuard = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const store = useStore()

  const isInMeetRoute = location.pathname.includes("/meet/")
  const hasLocalCredentials = Boolean(
    localStorage.getItem("token") || localStorage.getItem("refreshToken"),
  )

  const [isRecoveringCallAuth, setIsRecoveringCallAuth] = useState(
    () => !isAuthenticated && isInMeetRoute && hasLocalCredentials,
  )

  useEffect(() => {
    let isMounted = true

    if (!isAuthenticated && isInMeetRoute && hasLocalCredentials) {
      console.info(
        "[AuthGuard] Encountered unauthenticated state on call route — attempting emergency reauth before redirecting",
      )
      ensureRefresh(store, undefined, "emergency-meet-guard")
        .finally(() => {
          if (isMounted) {
            setIsRecoveringCallAuth(false)
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, isInMeetRoute, hasLocalCredentials, store])

  if (isRecoveringCallAuth) {
    return <VideoCallLoading message="Đang kết nối lại phòng gọi..." />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{
          requireLogin: true,
          redirectTo: location.pathname + location.search + location.hash,
        }}
        replace
      />
    )
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return children || <Outlet />
}

export default AuthGuard
