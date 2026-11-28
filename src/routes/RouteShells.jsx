import { Suspense, lazy, useEffect } from "react"
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import LandingPage from "@/features/landing/pages/LandingPage"
import { useAuth } from "@/features/auth"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useRegisterNavigate } from "@/features/video-call/hooks/useNavigateRef"
import BottomRightStack from "@/shared/components/BottomRightStack"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import NavigationProgress from "@/shared/components/NavigationProgress"
import { TourGuideProvider, TourGuideManager } from "@/features/tour-guide"
import NProgress from "nprogress"

const AiLevelAssessmentPage = lazy(
  () => import("@/features/ai-tutor/pages/LevelAssessmentPage"),
)
const PlacementTestPage = lazy(
  () => import("@/features/placement-test/pages/PlacementTestPage"),
)
const CommunityGuard = lazy(() =>
  import("@/shared/components").then((m) => ({ default: m.CommunityGuard })),
)

const LazyFallback = ({ fallback }) => {
  useEffect(() => {
    NProgress.start()
    return () => {
      NProgress.done()
    }
  }, [])

  return (
    fallback || (
      <LoadingSpinner className="flex min-h-[320px] items-center justify-center" />
    )
  )
}

export const LazyRoute = ({ children, fallback }) => (
  <Suspense fallback={<LazyFallback fallback={fallback} />}>
    {children}
  </Suspense>
)

export const RootLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useRegisterNavigate(navigate, location)
  return (
    <TourGuideProvider>
      <TourGuideManager />
      <NavigationProgress />
      <Outlet />
      <BottomRightStack />
    </TourGuideProvider>
  )
}

export const RootRoute = () => {
  return <LandingPage />
}

/**
 * ISS-45: /login and /register are not separate screens. They send the visitor
 * back to "/" and ask MainLayout to open the matching auth modal, while
 * authenticated users are taken straight to the community.
 */
export const AuthRedirectRoute = ({ mode = "login" }) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === true) {
    return <Navigate to={getCommunityPath()} replace />
  }

  return (
    <Navigate to="/" state={{ requireLogin: true, authMode: mode }} replace />
  )
}

export const AiLevelAssessmentRoute = () => {
  const { lang } = useParams()

  if (lang !== "zh") {
    return (
      <LazyRoute>
        <AiLevelAssessmentPage />
      </LazyRoute>
    )
  }

  return (
    <Suspense fallback={<LazyFallback />}>
      <CommunityGuard>
        <LazyRoute>
          <PlacementTestPage />
        </LazyRoute>
      </CommunityGuard>
    </Suspense>
  )
}
