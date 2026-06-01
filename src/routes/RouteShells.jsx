import { Suspense } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import LandingPage from "@/features/landing/pages/LandingPage"
import { useRegisterNavigate } from "@/features/video-call/context/GlobalVideoCallProvider"

export const LazyRoute = ({ children }) => (
  <Suspense fallback={<div className="min-h-[320px]" />}>
    {children}
  </Suspense>
)

export const RootLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useRegisterNavigate(navigate, location)
  return <Outlet />
}

export const RootRoute = () => {
  return <LandingPage />
}
