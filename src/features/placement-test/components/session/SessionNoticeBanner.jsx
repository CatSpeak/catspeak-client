import { TriangleAlert } from "lucide-react"
import {
  CONVERSATION_NOTICE,
} from "../../constants/conversation"
import { MAX_ASR_RETRIES } from "../../services/speech"
import { formatTemplate } from "../../utils/format"

const SessionNoticeBanner = ({ copy = {}, notice, retryCount = 0 }) => {
  if (!notice) return null

  const message =
    notice === CONVERSATION_NOTICE.NO_HEARING
      ? copy.noHearingBanner
      : formatTemplate(copy.retryBanner, {
          attempt: Math.min(retryCount, MAX_ASR_RETRIES),
          max: MAX_ASR_RETRIES,
        })

  return (
    <div className="flex w-full flex-col gap-1 rounded-[10px] bg-[#FFFBEB] px-3.5 py-2.5">
      <div className="flex items-start gap-2">
        <TriangleAlert
          size={16}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-amber-600"
        />
        <span className="text-xs font-medium leading-4 text-slate-700">
          {message}
        </span>
      </div>
      {notice === CONVERSATION_NOTICE.NO_HEARING && copy.volumeHint && (
        <span className="pl-6 text-[11px] font-medium leading-4 text-amber-700">
          {copy.volumeHint}
        </span>
      )}
    </div>
  )
}

export default SessionNoticeBanner
