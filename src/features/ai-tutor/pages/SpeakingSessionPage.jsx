import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { toast } from "@/shared/utils/toastBridge"
import { SpeakingPage } from "../components/speakingRoom"
import {
  useEndSpeakingSessionMutation,
  useGetSpeakingSessionQuery,
  useLazyGetSpeakingSessionQuery,
  useReconnectSpeakingSessionMutation,
} from "../api/speakingApi"

const TERMINAL = new Set(["completed", "abandoned"])

const SpeakingSessionPage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessionCredentials, setSessionCredentials } = useOutletContext()
  const credentials = sessionCredentials?.session_id === sessionId ? sessionCredentials : null
  const [connectError, setConnectError] = useState(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const reconnecting = useRef(false)
  const attemptedSession = useRef(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const [loadSession] = useLazyGetSpeakingSessionQuery()
  const [reconnect] = useReconnectSpeakingSessionMutation()
  const [endSession, { isLoading: isEnding }] = useEndSpeakingSessionMutation()
  const { data: session, isLoading, isError, error: sessionError, refetch } = useGetSpeakingSessionQuery(sessionId)

  const installReconnectCredentials = useCallback((connection, latest) => {
    setSessionCredentials({
      session_id: connection.session_id,
      livekit: connection.livekit,
      topic: latest.topic,
      hsk_level: latest.hsk_level,
      started_at: latest.started_at,
    })
    setConnectError(null)
  }, [setSessionCredentials])

  const attemptReconnect = useCallback(async (force = false) => {
    if (reconnecting.current || (credentials && !force)) return
    if (force) setSessionCredentials(null)
    reconnecting.current = true
    attemptedSession.current = sessionId
    setIsReconnecting(true)
    setConnectError(null)
    let deadline = Date.now() + 14000
    try {
      while (mounted.current && Date.now() < deadline) {
        const latest = await loadSession(sessionId, false).unwrap()
        if (!mounted.current) return
        if (TERMINAL.has(latest.status) || latest.status === "closing" || latest.status === "completing") {
          navigate(`result`, { replace: true })
          return
        }
        if (latest.reconnect_deadline) {
          const parsed = new Date(latest.reconnect_deadline).getTime()
          if (!Number.isNaN(parsed)) deadline = parsed
        }
        if (latest.status === "reconnecting") {
          const connection = await reconnect(sessionId).unwrap()
          if (!mounted.current) return
          installReconnectCredentials(connection, latest)
          return
        }
        if (!force || latest.status === "created") {
          setConnectError("Phiên này chưa thể khôi phục. Bạn có thể đóng phiên và bắt đầu buổi mới.")
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      if (mounted.current) setConnectError("Không thể khôi phục kết nối trong thời gian cho phép.")
    } catch (error) {
      if (!mounted.current) return
      const detail = error?.data?.detail
      const code = detail?.code || detail?.errorCode || error?.data?.code || error?.code
      if (code === "SESSION_RECONNECT_EXPIRED") {
        setConnectError("Thời gian kết nối lại đã hết. Hãy đóng phiên và bắt đầu buổi mới.")
        return
      }
      setConnectError(detail?.message || error?.message || "Không thể khôi phục kết nối. Hãy thử lại.")
    } finally {
      reconnecting.current = false
      if (mounted.current) setIsReconnecting(false)
    }
  }, [credentials, installReconnectCredentials, loadSession, navigate, reconnect, sessionId, setSessionCredentials])

  useEffect(() => {
    if (!session || credentials || isError) return
    if (TERMINAL.has(session.status) || session.status === "closing" || session.status === "completing") {
      navigate("result", { replace: true })
      return
    }
    if (session.status === "reconnecting" && attemptedSession.current !== sessionId) {
      attemptReconnect()
    }
  }, [attemptReconnect, credentials, isError, navigate, session, sessionId])

  const handleLeave = useCallback(async () => {
    if (!sessionId || isEnding) return
    try {
      await endSession({ sessionId, end_reason: "early_finish" }).unwrap()
      setSessionCredentials(null)
      navigate("../", { replace: true })
    } catch (error) {
      toast.error(error?.message || "Không thể kết thúc phiên. Hãy thử lại.")
    }
  }, [endSession, isEnding, navigate, sessionId, setSessionCredentials])

  if (isLoading || isReconnecting) {
    return <div className="mx-auto max-w-xl py-20 text-center text-sm font-semibold text-slate-600">Đang xác nhận trạng thái phòng luyện nói...</div>
  }

  if (!credentials) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Không thể tiếp tục phiên luyện nói</h1>
        <p className="mt-2 text-sm text-slate-600">{sessionError?.message || connectError || (session?.status === "created" ? "Phiên chưa khởi động được. Hãy đóng phiên và bắt đầu buổi mới." : "Phiên có thể đang hoạt động trên thiết bị khác.")}</p>
        {isError ? <button className="mt-4 px-4 py-2 text-sm font-bold text-[#990011] underline" onClick={refetch}>Tải lại trạng thái phiên</button> : session?.status === "reconnecting" ? <button className="mt-4 px-4 py-2 text-sm font-bold text-[#990011] underline" onClick={() => attemptReconnect(true)}>Thử kết nối lại</button> : null}
        {session && <button disabled={isEnding} className="mt-4 px-4 py-2 text-sm font-bold text-[#990011] underline disabled:opacity-50" onClick={handleLeave}>{isEnding ? "Đang đóng phiên..." : "Đóng phiên cũ"}</button>}
        <button className="mt-6 rounded-xl bg-[#990011] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate("../", { replace: true })}>Về danh sách chủ đề</button>
      </div>
    )
  }

  return (
    <SpeakingPage
      sessionData={credentials}
      topicTitle={credentials.topic?.title_vi || credentials.topic?.title || "Luyện nói tiếng Trung"}
      onEndSession={() => navigate("result", { replace: true })}
      onBackToSelection={handleLeave}
      onConnectionLost={() => attemptReconnect(true)}
    />
  )
}

export default SpeakingSessionPage
