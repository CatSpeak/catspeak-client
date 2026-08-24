import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"

const AuthGuard = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

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
