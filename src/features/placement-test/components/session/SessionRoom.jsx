import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "@/components/ui/toast"
import useConversationLoop from "../../hooks/useConversationLoop"
import {
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
} from "../../constants/conversation"
import SessionTopbar from "./SessionTopbar"
import SessionModeTabs from "./SessionModeTabs"
import SessionNoticeBanner from "./SessionNoticeBanner"
import AiAvatarPanel from "./AiAvatarPanel"
import TranscriptCards from "./TranscriptCards"
import SessionControlRow from "./SessionControlRow"
import PauseSessionModal from "./PauseSessionModal"
import ConnectionLostModal from "./ConnectionLostModal"
import ResumeSessionModal from "../lifecycle/ResumeSessionModal"
import { TOTAL_TURNS } from "../../engine"

const SessionRoom = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.room || {}
  const resumeCopy = t.placementTest?.lifecycle?.resume || {}
  const loop = useConversationLoop({ exitNotice: copy.noHearingExitToast })

  const handleConfigure = () => {
    if (copy.configureNotice) toast.info(copy.configureNotice)
  }

  if (loop.resumePrompt) {
    const prompt = loop.resumePrompt
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-primaryBg">
        <ResumeSessionModal
          open
          copy={resumeCopy}
          answeredCount={prompt.answeredCount}
          totalTurns={TOTAL_TURNS}
          nextOrder={prompt.nextOrder}
          remainingMs={
            prompt.expiresAt ? Math.max(0, prompt.expiresAt - Date.now()) : 0
          }
          expiresAt={prompt.expiresAt}
          busy={loop.restarting}
          onResume={loop.handlePromptResume}
          onDiscard={loop.handlePromptRestart}
        />
      </div>
    )
  }

  if (!loop.ready) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-primaryBg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cath-red-700" />
      </div>
    )
  }

  const analyzing = loop.phase === CONVERSATION_PHASE.ANALYZING
  const notHearing =
    loop.notice === CONVERSATION_NOTICE.NO_HEARING && loop.isRecording
  const isRecording = loop.isRecording
  const hasRecorded = loop.hasRecorded

  let tone = "listening"
  let statusText = copy.aiListening

  if (analyzing) {
    tone = "analyzing"
    statusText = copy.aiAnalyzing
  } else if (notHearing) {
    tone = "notHearing"
    statusText = copy.aiNotHearing
  } else if (isRecording) {
    tone = "listening"
    statusText = copy.aiListening || "AI đang lắng nghe giọng nói của bạn..."
  } else if (hasRecorded) {
    tone = "analyzing"
    statusText =
      "Đã thu âm câu trả lời. Bạn có thể kiểm tra, thu âm lại hoặc bấm hoàn tất để nộp."
  } else if (loop.aiSpeaking) {
    tone = "listening"
    statusText = copy.aiSpeaking || "AI đang đọc câu hỏi, hãy lắng nghe..."
  } else {
    tone = "listening"
    statusText =
      copy.aiAutoRecord ||
      "Hệ thống sẽ tự ghi âm sau khi AI đọc xong câu hỏi."
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3">
        <SessionTopbar
          copy={copy}
          onPause={loop.handlePause}
          onConfigure={handleConfigure}
        />
        <SessionModeTabs copy={copy} currentOrder={loop.order} />

        <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] md:p-6">
          <SessionNoticeBanner
            copy={copy}
            notice={loop.notice}
            retryCount={loop.retryCount}
          />
          <AiAvatarPanel
            tone={tone}
            statusText={statusText}
            isRecording={loop.isRecording}
            aiSpeaking={loop.aiSpeaking}
            micLevel={loop.micLevel}
          />
          <TranscriptCards
            copy={copy}
            question={loop.question}
            transcript={loop.transcript}
            phase={loop.phase}
            notice={loop.notice}
            isRecording={loop.isRecording}
            hasRecorded={loop.hasRecorded}
            isPlayingUserAudio={loop.isPlayingUserAudio}
            onPlayUserAudio={loop.handlePlayUserAudio}
            onStopUserAudio={loop.handleStopUserAudio}
            showHanzi={loop.showHanzi}
            showPinyin={loop.showPinyin}
            showMeaning={loop.showMeaning}
            onToggleHanzi={loop.toggleHanzi}
            onTogglePinyin={loop.togglePinyin}
            onToggleMeaning={loop.toggleMeaning}
            onReplay={loop.handleReplay}
          />
          <SessionControlRow
            copy={copy}
            phase={loop.phase}
            notice={loop.notice}
            isRecording={loop.isRecording}
            aiSpeaking={loop.aiSpeaking}
            micLevel={loop.micLevel}
            hasRecorded={loop.hasRecorded}
            recordedMs={loop.recordedMs}
            remainingMs={loop.remainingMs}
            maxDurationMs={loop.maxDurationMs}
            canSkip={loop.canSkip}
            isPlayingUserAudio={loop.isPlayingUserAudio}
            onPlayUserAudio={loop.handlePlayUserAudio}
            onStopUserAudio={loop.handleStopUserAudio}
            onToggleRecord={loop.handleToggleRecord}
            onReRecord={loop.handleReRecord}
            onSubmit={loop.handleSubmit}
            onSkip={loop.handleSkip}
          />
        </div>
      </div>

      <PauseSessionModal
        open={loop.paused}
        copy={copy}
        pauseRemainingMs={loop.pauseRemainingMs}
        answeredCount={loop.answeredCount}
        onResume={loop.handleResume}
        onLeave={loop.handleLeave}
        onCancel={loop.handleCancel}
      />
      <ConnectionLostModal
        open={loop.connectionLost}
        copy={copy}
        reconnectAttempt={loop.reconnectAttempt}
        reconnectRemainingMs={loop.reconnectRemainingMs}
        currentOrder={loop.order}
        answeredCount={loop.answeredCount}
        onRetry={loop.handleReconnectNow}
        onLeave={loop.handleLeave}
      />
    </div>
  )
}

export default SessionRoom
