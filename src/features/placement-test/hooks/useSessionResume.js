import { useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useCancelSessionMutation,
  useCreateSessionMutation,
  useGetActiveSessionQuery,
  useResumeSessionMutation,
} from "../api"
import { DEFAULT_TARGET_BAND } from "../constants/bands"
import {
  PLACEMENT_TEST_PROFILE_PATH,
  PLACEMENT_TEST_SESSION_PATH,
} from "../constants/routes"
import { getSessionLifecycle } from "../utils/sessionLifecycle"
import { clearActiveSession } from "../utils/sessionStorage"

const useSessionResume = ({ copy = {} } = {}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()
  const [resumeSession] = useResumeSessionMutation()
  const [cancelSession, { isLoading: cancelling }] = useCancelSessionMutation()
  const {
    data: activeSession,
    isSuccess: activeLoaded,
    isError: activeFailed,
  } = useGetActiveSessionQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const lifecycle = useMemo(
    () => getSessionLifecycle({ session: activeSession ?? null }),
    [activeSession],
  )

  useEffect(() => {
    if (lifecycle?.kind === "expired") clearActiveSession()
  }, [lifecycle])

  const resume = useCallback(async () => {
    if (!lifecycle || lifecycle.expired) return
    try {
      await resumeSession({ sessionId: lifecycle.session.id }).unwrap()
    } catch {
      // Keep the local session when the server check fails; the room validates it.
    }
    navigate(PLACEMENT_TEST_SESSION_PATH)
  }, [lifecycle, navigate, resumeSession])

  const cancelActiveSession = useCallback(async () => {
    const sessionId = lifecycle?.session?.id
    try {
      if (sessionId) {
        await cancelSession({ sessionId }).unwrap()
      } else {
        clearActiveSession()
      }
    } catch {
      clearActiveSession()
    }
  }, [cancelSession, lifecycle])

  const restart = useCallback(async () => {
    await cancelActiveSession()
    try {
      await createSession({
        targetBand: lifecycle?.session?.targetBand || DEFAULT_TARGET_BAND,
        studentId: user?.id ?? user?.accountId ?? null,
      }).unwrap()
      navigate(PLACEMENT_TEST_SESSION_PATH)
    } catch {
      toast.error(copy.errorToast)
    }
  }, [cancelActiveSession, createSession, copy.errorToast, lifecycle, navigate, user])

  const goToProfile = useCallback(() => {
    navigate(PLACEMENT_TEST_PROFILE_PATH)
  }, [navigate])

  return {
    lifecycle,
    loaded: Boolean(activeLoaded || activeFailed),
    creating: creating || cancelling,
    resume,
    restart,
    cancelActiveSession,
    goToProfile,
  }
}

export default useSessionResume

