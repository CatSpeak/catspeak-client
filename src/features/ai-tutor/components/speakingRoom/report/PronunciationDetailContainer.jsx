import React, { useMemo, useRef, useState } from "react"
import DeepPronunciationAnalysisModal from "../modals/DeepPronunciationAnalysisModal"
import MouthShapeGuideModal from "../modals/MouthShapeGuideModal"
import {
  speakingAudioPath,
  speakingErrorCode,
  useGetPronunciationGuideQuery,
  useGetSpeakingPronunciationQuery,
  useLazyGetSpeakingAudioUrlQuery,
  useRetrySpeakingPronunciationMutation,
} from "../../../api/speakingPedagogyApi"
import useShortRecorder from "../../../hooks/useShortRecorder"
import { toAnalysisData, toGuideData } from "../../../utils/speakingReport"

/**
 * ss12 (FR-SS-016, 017) và ss13 (FR-SS-018) của một buổi nói.
 *
 * Lần mở đầu ai-api gọi Azure chấm cả buổi nên mất vài giây; modal hiện trạng thái
 * chờ. Hai modal không mở chồng nhau: bấm "Xem video Shorts khẩu hình" thì đóng
 * ss12 mở ss13, bấm "Đã hiểu khẩu hình, Luyện tập ngay" ở ss13 thì quay lại ss12.
 */
const errorMessage = (error, data) => {
  if (error) {
    return speakingErrorCode(error) === "SPEAKING_PRONUNCIATION_UNAVAILABLE"
      ? "Phân tích phát âm chi tiết đang tạm tắt. Bạn quay lại sau nhé."
      : "Chưa tải được phân tích phát âm. Bạn thử lại sau ít phút nhé."
  }
  if (data?.status === "no_audio") {
    return "Buổi nói này chưa có bản ghi âm để phân tích. Buổi sau bạn nhớ bật mic trong suốt buổi nhé."
  }
  if (data && !data.words?.length) {
    return "Bạn phát âm rất ổn, không có từ nào cần luyện thêm trong buổi này!"
  }
  return null
}

const PronunciationDetailContainer = ({ sessionId, isOpen, onClose }) => {
  const [stage, setStage] = useState("analysis") // analysis | guide
  const [wordIndex, setWordIndex] = useState(0)
  const [retries, setRetries] = useState({})
  const [retryError, setRetryError] = useState(null)
  const switching = useRef(false)

  const { data, error, isLoading, isFetching } = useGetSpeakingPronunciationQuery(
    { sessionId },
    { skip: !isOpen || !sessionId },
  )
  const words = data?.words || []
  const word = words[Math.min(wordIndex, Math.max(0, words.length - 1))]

  const guideRef = word?.guide_ref_code
  const { data: guide } = useGetPronunciationGuideQuery(guideRef, { skip: stage !== "guide" || !guideRef })

  const [retryPronunciation] = useRetrySpeakingPronunciationMutation()
  const [loadAudio] = useLazyGetSpeakingAudioUrlQuery()

  const recorder = useShortRecorder({
    onDone: async (blob) => {
      if (!word) return
      setRetryError(null)
      try {
        const previous = retries[wordIndex]?.score ?? word.accuracy
        const res = await retryPronunciation({ audioBlob: blob, text: word.word, previousScore: previous }).unwrap()
        setRetries((r) => ({ ...r, [wordIndex]: res }))
      } catch (e) {
        setRetryError(
          speakingErrorCode(e) === "SPEAKING_RETRY_NOT_HEARD"
            ? "Chưa nghe rõ, bạn thử nói to và rõ hơn nhé."
            : "Chưa chấm được lần này, bạn thử lại nhé.",
        )
      }
    },
  })

  const play = async (path) => {
    try {
      const url = await loadAudio(path, true).unwrap()
      await new Audio(url).play()
    } catch {
      // tải hoặc phát lỗi: nút không làm gì, không chặn phần còn lại của modal
    }
  }

  const analysisData = useMemo(() => {
    const base = toAnalysisData(word, retries[wordIndex])
    if (base && retryError) return { ...base, lastRetestScore: null, lastRetestResult: retryError }
    return base
  }, [word, retries, wordIndex, retryError])

  const closeAll = () => {
    setStage("analysis")
    onClose?.()
  }

  return (
    <>
      <DeepPronunciationAnalysisModal
        isOpen={Boolean(isOpen) && stage === "analysis"}
        onClose={() => {
          if (switching.current) {
            switching.current = false
            return
          }
          closeAll()
        }}
        data={analysisData || undefined}
        loading={isLoading || (isFetching && !data)}
        errorText={errorMessage(error, data)}
        words={words}
        selectedIndex={wordIndex}
        onSelectWord={(i) => {
          setWordIndex(i)
          setRetryError(null)
        }}
        isRecording={recorder.isRecording}
        onRecordRetry={recorder.toggle}
        onPlayUser={
          word?.audio?.start_ms != null
            ? () => play(speakingAudioPath.turn(sessionId, word.audio.seq, word.audio.start_ms, word.audio.end_ms))
            : undefined
        }
        onPlayModel={word ? () => play(speakingAudioPath.sample(word.word, "slow")) : undefined}
        onWatchShorts={() => {
          switching.current = true
          setStage("guide")
        }}
      />

      <MouthShapeGuideModal
        isOpen={Boolean(isOpen) && stage === "guide"}
        data={toGuideData(guide) || undefined}
        onPracticeNow={() => {
          switching.current = true
          setStage("analysis")
        }}
        onClose={() => {
          if (switching.current) {
            switching.current = false
            return
          }
          closeAll()
        }}
      />
    </>
  )
}

export default PronunciationDetailContainer
