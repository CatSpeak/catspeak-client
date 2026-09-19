import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useCreateSessionMutation } from "../api"
import { DEFAULT_TARGET_BAND } from "../constants/bands"
import {
  PLACEMENT_TEST_PROFILE_PATH,
  PLACEMENT_TEST_SESSION_PATH,
} from "../constants/routes"
import { getSessionLifecycle } from "../utils/sessionLifecycle"
import { clearActiveSession, readActiveSession } from "../utils/sessionStorage"

const useSessionResume = ({ copy = {} } = {}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()
  const [lifecycle] = useState(() =>
    getSessionLifecycle({ session: readActiveSession() }),
  )

  useEffect(() => {
    if (lifecycle?.kind === "expired") clearActiveSession()
  }, [lifecycle])

  const resume = useCallback(() => {
    if (!lifecycle || lifecycle.expired) return
    navigate(PLACEMENT_TEST_SESSION_PATH)
  }, [lifecycle, navigate])

  const restart = useCallback(async () => {
    clearActiveSession()
    try {
      await createSession({
        targetBand: lifecycle?.session?.targetBand || DEFAULT_TARGET_BAND,
        studentId: user?.id ?? user?.accountId ?? null,
      }).unwrap()
      navigate(PLACEMENT_TEST_SESSION_PATH)
    } catch {
      toast(copy.errorToast)
    }
  }, [createSession, copy.errorToast, lifecycle, navigate, user])

  const goToProfile = useCallback(() => {
    navigate(PLACEMENT_TEST_PROFILE_PATH)
  }, [navigate])

  return {
    lifecycle,
    creating,
    resume,
    restart,
    goToProfile,
  }
}

export default useSessionResume
