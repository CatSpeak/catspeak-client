import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"
import { PlanRequiredState } from "@/shared/components/ui/indicators"
import { PLACEMENT_TEST_STEPS } from "../constants/steps"
import {
  PLACEMENT_TEST_PROFILE_PATH,
  PLACEMENT_TEST_SESSION_PATH,
} from "../constants/routes"
import useMicrophonePermission from "../hooks/useMicrophonePermission"
import useSessionResume from "../hooks/useSessionResume"
import { useCreateSessionMutation, useGetRetakeStatusQuery } from "../api"
import ConsentStep from "../components/ConsentStep"
import PermissionBlockedStep from "../components/PermissionBlockedStep"
import DeviceStep from "../components/DeviceStep"
import BandStep from "../components/BandStep"
import ResumeSessionModal from "../components/lifecycle/ResumeSessionModal"
import SessionExpiredModal from "../components/lifecycle/SessionExpiredModal"

const PlacementTestPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest || {}
  const lifecycleCopy = copy.lifecycle || {}
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasFeature, isLoading: isPlanLoading } = usePlanFeatures()
  const canAccessPlacement = hasFeature(PLAN_FEATURES.ALLOW_PLACEMENT_TEST)
  const [step, setStep] = useState(PLACEMENT_TEST_STEPS.CONSENT)
  const [hasGrantedMic, setHasGrantedMic] = useState(false)
  const { requesting, request } = useMicrophonePermission()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()
  const entry = useSessionResume({ copy: lifecycleCopy })
  const { data: retakeStatus, isLoading: retakeLoading } = useGetRetakeStatusQuery(
    undefined,
    { skip: !canAccessPlacement, refetchOnMountOrArgChange: true },
  )

  // BUG-PT-16: người đã có kết quả thì vào thẳng hồ sơ kết quả (sc12), không
  // quay lại màn đồng ý như người chưa thi. Việc thi lại đi qua sc12 → sc13.
  const hasHistory = Boolean(retakeStatus?.hasHistory)
  const shouldOpenProfile =
    canAccessPlacement && hasHistory && entry.loaded && !entry.lifecycle
  useEffect(() => {
    if (shouldOpenProfile) navigate(PLACEMENT_TEST_PROFILE_PATH, { replace: true })
  }, [navigate, shouldOpenProfile])

  const handleRequestMic = async () => {
    const granted = await request()
    setHasGrantedMic(granted)
    return granted
  }

  const handlePermissionDenied = () => {
    setStep(PLACEMENT_TEST_STEPS.PERMISSION_DENIED)
  }

  const handleStart = async () => {
    if (hasGrantedMic) {
      setStep(PLACEMENT_TEST_STEPS.DEVICE)
      return
    }
    const granted = await request()
    setHasGrantedMic(granted)
    setStep(
      granted
        ? PLACEMENT_TEST_STEPS.DEVICE
        : PLACEMENT_TEST_STEPS.PERMISSION_DENIED,
    )
  }

  const handleStartSession = async (targetBand) => {
    try {
      await createSession({
        targetBand,
        studentId: user?.id ?? user?.accountId ?? null,
      }).unwrap()
      navigate(PLACEMENT_TEST_SESSION_PATH)
    } catch (err) {
      if (err?.status === 403 && err?.data?.detail?.code === "COOLDOWN_ACTIVE") {
        const days = err.data.detail.days_remaining || 14
        toast.error(`Bạn cần đợi thêm ${days} ngày nữa để thi lại theo quy tắc 14 ngày Cooldown.`)
        return
      }
      toast.error(lifecycleCopy.errorToast)
    }
  }

  const handleDiscardSession = async () => {
    await entry.cancelActiveSession()
    setStep(PLACEMENT_TEST_STEPS.CONSENT)
  }

  if (isPlanLoading || (canAccessPlacement && retakeLoading) || shouldOpenProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cath-red-600 border-t-transparent" />
      </div>
    )
  }

  if (!canAccessPlacement) {
    return (
      <PlanRequiredState
        pageTitle={copy.title || "Đánh giá trình độ"}
        title={copy.planRequiredTitle || "Yêu cầu Gói Pro"}
        subtext={
          copy.planRequiredSubtext ||
          "Tính năng Đánh giá trình độ (Placement Test) cùng AI chỉ dành cho người dùng gói Pro. Vui lòng nâng cấp gói để trải nghiệm tính năng này!"
        }
        featureName="Placement Test"
        animationKey="placement-test-pro-required"
      />
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
      {/* Hai cột chỉ đặt cạnh nhau từ xl: ở 1024px vùng nội dung chỉ ~670px (BUG-PT-17) */}
      <div className="mx-auto flex w-full max-w-[960px] flex-col items-stretch gap-6 xl:flex-row xl:items-start">
        {step === PLACEMENT_TEST_STEPS.CONSENT && (
          <ConsentStep
            copy={copy}
            onStart={handleStart}
            onRequestPermission={handleRequestMic}
            onPermissionDenied={handlePermissionDenied}
            requesting={requesting}
          />
        )}
        {step === PLACEMENT_TEST_STEPS.PERMISSION_DENIED && (
          <PermissionBlockedStep
            copy={copy}
            onRetry={handleStart}
            requesting={requesting}
          />
        )}
        {step === PLACEMENT_TEST_STEPS.DEVICE && (
          <DeviceStep
            copy={copy}
            onContinue={() => setStep(PLACEMENT_TEST_STEPS.BAND)}
          />
        )}
        {step === PLACEMENT_TEST_STEPS.BAND && (
          <BandStep copy={copy} onStart={handleStartSession} creating={creating} />
        )}
      </div>

      {entry.lifecycle?.kind === "resume" && (
        <ResumeSessionModal
          open
          copy={lifecycleCopy.resume || {}}
          answeredCount={entry.lifecycle.answeredCount}
          totalTurns={entry.lifecycle.totalTurns}
          nextOrder={entry.lifecycle.nextOrder}
          remainingMs={entry.lifecycle.remainingMs}
          expiresAt={entry.lifecycle.expiresAt}
          busy={entry.creating}
          onResume={entry.resume}
          onDiscard={handleDiscardSession}
        />
      )}
      {entry.lifecycle?.kind === "expired" && (
        <SessionExpiredModal
          open
          copy={lifecycleCopy.expired || {}}
          busy={entry.creating}
          onStartNew={entry.restart}
          onGoHome={entry.goToProfile}
        />
      )}
    </div>
  )
}

export default PlacementTestPage
