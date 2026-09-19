import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PLACEMENT_TEST_STEPS } from "../constants/steps"
import useMicrophonePermission from "../hooks/useMicrophonePermission"
import ConsentStep from "../components/ConsentStep"
import PermissionBlockedStep from "../components/PermissionBlockedStep"
import DeviceStep from "../components/DeviceStep"

const PlacementTestPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest || {}
  const [step, setStep] = useState(PLACEMENT_TEST_STEPS.CONSENT)
  const { requesting, request } = useMicrophonePermission()

  const handleStart = async () => {
    const granted = await request()
    setStep(
      granted
        ? PLACEMENT_TEST_STEPS.DEVICE
        : PLACEMENT_TEST_STEPS.PERMISSION_DENIED,
    )
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
        {step === PLACEMENT_TEST_STEPS.DEVICE && <DeviceStep copy={copy} />}
      </div>
    </div>
  )
}

export default PlacementTestPage
