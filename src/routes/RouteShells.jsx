import { Suspense, lazy, useEffect } from "react"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import LandingPage from "@/features/landing/pages/LandingPage"
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
