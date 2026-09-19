import { CheckCircle2 } from "lucide-react"
import StepCard from "./StepCard"

const DeviceStep = ({ copy }) => {
  const device = copy?.device || {}

  return (
    <StepCard className="items-center gap-3 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={26} strokeWidth={2} />
      </span>
      <h2 className="text-xl font-bold leading-7 text-[#09090B]">
        {device.grantedTitle}
      </h2>
      <p className="max-w-md text-sm font-medium leading-[22px] text-slate-600">
        {device.grantedBody}
      </p>
    </StepCard>
  )
}

export default DeviceStep
