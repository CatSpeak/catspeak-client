import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PLACEMENT_TEST_STEPS } from "../constants/steps"
import { PLACEMENT_TEST_SESSION_PATH } from "../constants/routes"
import useMicrophonePermission from "../hooks/useMicrophonePermission"
import { useCreateSessionMutation } from "../api"
import ConsentStep from "../components/ConsentStep"
import PermissionBlockedStep from "../components/PermissionBlockedStep"
import DeviceStep from "../components/DeviceStep"
import BandStep from "../components/BandStep"

const PlacementTestPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest || {}
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(PLACEMENT_TEST_STEPS.CONSENT)
  const { requesting, request } = useMicrophonePermission()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()

  const handleStart = async () => {
    const granted = await request()
    setStep(
      granted
        ? PLACEMENT_TEST_STEPS.DEVICE
        : PLACEMENT_TEST_STEPS.PERMISSION_DENIED,
    )
  }

  const handleStartSession = async (targetBand) => {
    await createSession({
      targetBand,
      studentId: user?.id ?? user?.accountId ?? null,
    })
      .unwrap()
      .then(() => navigate(PLACEMENT_TEST_SESSION_PATH))
      .catch(() => {})
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
    </div>
  )
}

export default PlacementTestPage
