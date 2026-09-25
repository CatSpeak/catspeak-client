import { useCallback, useEffect, useReducer } from "react"
import { RoomEvent } from "livekit-client"
import {
  TOPICS,
  assistReducer,
  decodePacket,
  encodeControl,
  initialAssistState,
} from "../utils/speakingAssist"

/**
 * Nghe data packet của agent chế độ speaking_session và trả dữ liệu cho ss05.
 *
 * Phòng LiveKit do phần vòng đời phiên (Thái) tạo và nối; hook này chỉ cần object
 * Room của livekit-client:
 *
 *   const assist = useSpeakingAssist(lkRoom)
 *   <SpeakingPage aiTurn={assist.ai} hints={assist.hints} hintMode={assist.hintMode}
 *                 correction={assist.correction} onPlayHint={assist.playHint} ... />
 */
const useSpeakingAssist = (lkRoom) => {
  const [state, dispatch] = useReducer(assistReducer, initialAssistState)

  useEffect(() => {
    if (!lkRoom) return undefined
    const handle = (payload, _participant, _kind, topic) => {
      if (topic !== TOPICS.subtitle && topic !== TOPICS.assist && topic !== TOPICS.state) return
      const data = decodePacket(payload)
      if (data) dispatch({ topic, data })
    }
    lkRoom.on(RoomEvent.DataReceived, handle)
    return () => lkRoom.off(RoomEvent.DataReceived, handle)
  }, [lkRoom])

  const sendControl = useCallback(
    (action, extra) => {
      lkRoom?.localParticipant?.publishData(encodeControl(action, extra), {
        reliable: true,
        topic: TOPICS.control,
      })
    },
    [lkRoom],
  )

  // Q8: agent đọc câu gợi ý bằng chính giọng Kokoro ở tốc độ 0,7.
  const playHint = useCallback((hintId) => sendControl("play_hint", { hint_id: hintId }), [sendControl])
  const replayQuestion = useCallback(() => sendControl("replay_question"), [sendControl])

  return { ...state, playHint, replayQuestion, sendControl }
}

export default useSpeakingAssist
