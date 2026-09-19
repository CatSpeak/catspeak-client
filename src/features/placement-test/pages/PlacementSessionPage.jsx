import { useLanguage } from "@/shared/context/LanguageContext"
import useConversationLoop from "../hooks/useConversationLoop"
import {
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
} from "../constants/conversation"
import SessionTopbar from "../components/session/SessionTopbar"
import SessionModeTabs from "../components/session/SessionModeTabs"
import SessionNoticeBanner from "../components/session/SessionNoticeBanner"
import AiAvatarPanel from "../components/session/AiAvatarPanel"
import TranscriptCards from "../components/session/TranscriptCards"
import SessionControlRow from "../components/session/SessionControlRow"

const PlacementSessionPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.room || {}
  const loop = useConversationLoop()

  if (!loop.ready) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-primaryBg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cath-red-700" />
      </div>
    )
  }

  const analyzing = loop.phase === CONVERSATION_PHASE.ANALYZING
  const notHearing = loop.notice === CONVERSATION_NOTICE.NO_HEARING
  const tone = analyzing ? "analyzing" : notHearing ? "notHearing" : "listening"
  const statusText = analyzing
    ? copy.aiAnalyzing
    : notHearing
      ? copy.aiNotHearing
      : copy.aiListening

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3">
        <SessionTopbar copy={copy} />
        <SessionModeTabs copy={copy} currentOrder={loop.order} />

        <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] md:p-6">
          <SessionNoticeBanner
            copy={copy}
            notice={loop.notice}
            retryCount={loop.retryCount}
          />
          <AiAvatarPanel tone={tone} statusText={statusText} />
          <TranscriptCards
            copy={copy}
            question={loop.question}
            transcript={loop.transcript}
            phase={loop.phase}
            notice={loop.notice}
            showHanzi={loop.showHanzi}
            showPinyin={loop.showPinyin}
            onToggleHanzi={loop.toggleHanzi}
            onTogglePinyin={loop.togglePinyin}
            onReplay={loop.handleReplay}
          />
          <SessionControlRow
            copy={copy}
            phase={loop.phase}
            notice={loop.notice}
            remainingMs={loop.remainingMs}
            canSkip={loop.canSkip}
            onSubmit={loop.handleSubmit}
            onSkip={loop.handleSkip}
          />
        </div>
      </div>
    </div>
  )
}

export default PlacementSessionPage
