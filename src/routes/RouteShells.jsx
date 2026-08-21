import { Suspense } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import LandingPage from "@/features/landing/pages/LandingPage"
import { useRegisterNavigate } from "@/features/video-call/context/GlobalVideoCallProvider"
import BottomRightStack from "@/shared/components/BottomRightStack"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

export const LazyRoute = ({ children }) => (
  <Suspense fallback={<LoadingSpinner className="flex min-h-[320px] items-center justify-center" />}>
    {children}
  </Suspense>
)

export const RootLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useRegisterNavigate(navigate, location)
  return (
    <>
      <Outlet />
      <BottomRightStack />
    </>
  )
}

export const RootRoute = () => {
  return <LandingPage />
}
