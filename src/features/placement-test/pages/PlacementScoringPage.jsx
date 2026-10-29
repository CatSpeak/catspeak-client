import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "@/components/ui/toast"
import { useScoreSessionMutation } from "../api"
import {
  PLACEMENT_TEST_DASHBOARD_PATH,
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_RESULT_PATH,
} from "../constants/routes"
import {
  SCORING_DURATION_MS,
  SCORING_TICK_MS,
  SCORING_TIMEOUT_MS,
} from "../constants/scoring"
import { computeScoringProgress } from "../utils/scoring"
import { readActiveSession } from "../utils/sessionStorage"
import ScoringTopbar from "../components/scoring/ScoringTopbar"
import ScoringProgressCard from "../components/scoring/ScoringProgressCard"
import ScoringErrorCard from "../components/scoring/ScoringErrorCard"

const SCORING_STATUS = {
  SCORING: "scoring",
  ERROR: "error",
}

const PlacementScoringPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.scoring || {}
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [scoreSession] = useScoreSessionMutation()

  const [session] = useState(readActiveSession)
  const sessionRef = useRef(session)
  const [status, setStatus] = useState(SCORING_STATUS.SCORING)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const startedAtRef = useRef(0)

  const steps = useMemo(() => computeScoringProgress(elapsedMs), [elapsedMs])

  useEffect(() => {
    if (!sessionRef.current) {
      navigate(PLACEMENT_TEST_PATH, { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (status !== SCORING_STATUS.SCORING) return undefined
    startedAtRef.current = Date.now()
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current)
    }, SCORING_TICK_MS)
    return () => window.clearInterval(id)
  }, [status, attempt])

  useEffect(() => {
    if (status !== SCORING_STATUS.SCORING || !sessionRef.current) {
      return undefined
    }
    let cancelled = false
    const fail = attempt === 0 && searchParams.get("fail") === "1"
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return
      cancelled = true
      setRetrying(false)
      setStatus(SCORING_STATUS.ERROR)
    }, SCORING_TIMEOUT_MS)

    scoreSession({ sessionId: sessionRef.current.id, fail })
      .unwrap()
      .then(async () => {
        if (cancelled) return
        const wait = SCORING_DURATION_MS - (Date.now() - startedAtRef.current)
        if (wait > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, wait))
        }
        if (cancelled) return
        cancelled = true
        window.clearTimeout(timeoutId)
        navigate(PLACEMENT_TEST_RESULT_PATH, { replace: true })
      })
      .catch(() => {
        if (cancelled) return
        cancelled = true
        window.clearTimeout(timeoutId)
        setRetrying(false)
        setStatus(SCORING_STATUS.ERROR)
      })

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [attempt, status, scoreSession, navigate, searchParams])

  const handleRetry = useCallback(() => {
    setRetrying(true)
    setElapsedMs(0)
    setStatus(SCORING_STATUS.SCORING)
    setAttempt((value) => value + 1)
  }, [])

  const handleSaveLater = useCallback(() => {
    navigate(PLACEMENT_TEST_DASHBOARD_PATH, { replace: true })
  }, [navigate])

  const handleHelp = useCallback(() => {
    if (copy.helpNotice) toast.info(copy.helpNotice)
  }, [copy.helpNotice])

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
        <ScoringTopbar
          copy={copy}
          error={status === SCORING_STATUS.ERROR}
          onHelp={handleHelp}
        />
        {status === SCORING_STATUS.ERROR ? (
          <ScoringErrorCard
            copy={copy}
            session={session}
            retrying={retrying}
            onRetry={handleRetry}
            onSaveLater={handleSaveLater}
          />
        ) : (
          <ScoringProgressCard copy={copy} steps={steps} />
        )}
      </div>
    </div>
  )
}

export default PlacementScoringPage
