import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_PROFILE_PATH,
} from "../constants/routes"
import { readActiveSession } from "../utils/sessionStorage"
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

  const handleCloseConflict = useCallback(() => {
    if (typeof window !== "undefined") window.close()
    navigate(PLACEMENT_TEST_PATH, { replace: true })
  }, [navigate])

  const handleGoHome = useCallback(() => {
    navigate(PLACEMENT_TEST_PROFILE_PATH, { replace: true })
  }, [navigate])

  if (takeover.phase === TAKEOVER_PHASE.CONFLICT) {
    return (
      <SessionTakeoverModal
        open
        mode="conflict"
        copy={copy}
        onContinue={takeover.confirmTakeover}
        onClose={handleCloseConflict}
      />
    )
  }

  if (takeover.phase === TAKEOVER_PHASE.TAKEN_OVER) {
    return (
      <SessionTakeoverModal
        open
        mode="takenOver"
        copy={copy}
        onClose={handleGoHome}
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
