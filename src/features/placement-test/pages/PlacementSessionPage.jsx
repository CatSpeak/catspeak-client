import { useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "@/components/ui/toast"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_PROFILE_PATH,
} from "../constants/routes"
import { useGetRetakeStatusQuery } from "../api"
import { clearActiveSession, readActiveSession } from "../utils/sessionStorage"
import { isUnfinishedSession } from "../utils/sessionLifecycle"
import { TAKEOVER_PHASE } from "../utils/sessionTakeover"
import useSessionTakeover from "../hooks/useSessionTakeover"
import SessionTakeoverModal from "../components/lifecycle/SessionTakeoverModal"
import SessionRoom from "../components/session/SessionRoom"

const PlacementSessionPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.lifecycle?.takeover || {}
  const navigate = useNavigate()
  const session = useMemo(() => readActiveSession(), [])
  const takeover = useSessionTakeover({ sessionId: session?.id })

  const { data: retakeStatus, isLoading: retakeLoading } = useGetRetakeStatusQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  )

  const isCoolingDown = Boolean(retakeStatus?.hasHistory && !retakeStatus?.eligible)
  const isInvalidSession = !session || !isUnfinishedSession(session)

  useEffect(() => {
    if (retakeLoading) return

    if (isCoolingDown) {
      clearActiveSession()
      const days = retakeStatus?.daysRemaining || 14
      toast.error(
        `Bạn đang trong thời gian chờ thi lại (còn ${days} ngày theo quy tắc 14 ngày Cooldown).`,
      )
      navigate(PLACEMENT_TEST_PROFILE_PATH, { replace: true })
      return
    }

    if (isInvalidSession) {
      clearActiveSession()
      if (retakeStatus?.hasHistory) {
        navigate(PLACEMENT_TEST_PROFILE_PATH, { replace: true })
      } else {
        navigate(PLACEMENT_TEST_PATH, { replace: true })
      }
    }
  }, [isCoolingDown, isInvalidSession, navigate, retakeLoading, retakeStatus])

  const handleLeaveSession = useCallback(() => {
    navigate(PLACEMENT_TEST_PROFILE_PATH, { replace: true })
  }, [navigate])

  if (retakeLoading || isCoolingDown || isInvalidSession) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-primaryBg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cath-red-700" />
      </div>
    )
  }

  if (takeover.phase === TAKEOVER_PHASE.CONFLICT) {
    return (
      <SessionTakeoverModal
        open
        mode="conflict"
        copy={copy}
        onContinue={takeover.confirmTakeover}
        onClose={handleLeaveSession}
      />
    )
  }

  if (takeover.phase === TAKEOVER_PHASE.TAKEN_OVER) {
    return (
      <SessionTakeoverModal
        open
        mode="takenOver"
        copy={copy}
        onClose={handleLeaveSession}
      />
    )
  }

  if (takeover.phase !== TAKEOVER_PHASE.ACTIVE) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-primaryBg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cath-red-700" />
      </div>
    )
  }

  return <SessionRoom />
}

export default PlacementSessionPage
