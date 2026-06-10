import React, { useContext, useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"

const AuthGuard = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const authModalCtx = useContext(AuthModalContext)

  // When there is an AuthModalContext in scope (MainLayout / UserLayout),
  // open the login modal and stay on the current page instead of hard-navigating.
  useEffect(() => {
    if (!isAuthenticated && authModalCtx) {
      const redirectPath = location.pathname + location.search + location.hash
      authModalCtx.openAuthModal("login", redirectPath)
    }
  }, [isAuthenticated, authModalCtx, location])

  if (!isAuthenticated) {
    // If we have a modal context, we triggered it in useEffect above — render nothing.
    // If we don't (e.g. route not wrapped in a layout with AuthModalContext), fall back to redirect.
    if (authModalCtx) return null
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
