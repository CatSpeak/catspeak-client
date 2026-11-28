import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"

const GuestGuard = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) {
    // Redirect to the page they came from, or default to the workspace dashboard
    const from = location.state?.from?.pathname || "/workspace/dashboard"
    return <Navigate to={from} replace />
  }

  return children || <Outlet />
}

export default GuestGuard
