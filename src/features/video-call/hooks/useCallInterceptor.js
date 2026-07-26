import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { leaveCall } from "@/store/slices/videoCallSlice"
import {
  pingActiveCall,
  requestLeaveActiveCall,
} from "@/features/video-call/services/callBroadcastChannel"

export const useCallInterceptor = () => {
  const { isInCall } = useSelector((s) => s.videoCall)
  const dispatch = useDispatch()
  
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  /**
   * Intercepts an action if the user is in a call (local or in another tab).
   * Returns true if intercepted (modal opened), false otherwise.
   */
  const intercept = async (action) => {
    const remoteActive = await pingActiveCall()
    if (isInCall || remoteActive) {
      setPendingAction(() => action)
      setShowSwitchModal(true)
      return true
    }
    return false
  }

  const confirmSwitch = async () => {
    setShowSwitchModal(false)
    requestLeaveActiveCall()
    if (isInCall) {
      dispatch(leaveCall())
    }
    if (pendingAction) {
      await pendingAction()
    }
    setPendingAction(null)
  }

  const cancelSwitch = () => {
    setShowSwitchModal(false)
    setPendingAction(null)
  }

  return {
    showSwitchModal,
    intercept,
    confirmSwitch,
    cancelSwitch,
  }
}

