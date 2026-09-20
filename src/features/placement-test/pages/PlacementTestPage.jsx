import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PLACEMENT_TEST_STEPS } from "../constants/steps"
import { PLACEMENT_TEST_SESSION_PATH } from "../constants/routes"
import useMicrophonePermission from "../hooks/useMicrophonePermission"
import useSessionResume from "../hooks/useSessionResume"
import { useCreateSessionMutation } from "../api"
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
  const [step, setStep] = useState(PLACEMENT_TEST_STEPS.CONSENT)
  const { requesting, request } = useMicrophonePermission()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()
  const entry = useSessionResume({ copy: lifecycleCopy })

  const handleStart = async () => {
    const granted = await request()
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

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-[960px] flex-col items-start gap-6 lg:flex-row">
        {step === PLACEMENT_TEST_STEPS.CONSENT && (
          <ConsentStep
            copy={copy}
            onStart={handleStart}
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
          onDiscard={entry.restart}
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
