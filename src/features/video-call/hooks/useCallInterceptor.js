import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { leaveCall } from "@/store/slices/videoCallSlice"

export const useCallInterceptor = () => {
  const { isInCall } = useSelector((s) => s.videoCall)
  const dispatch = useDispatch()
  
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  /**
   * Intercepts an action if the user is in a call.
   * Returns true if intercepted (modal opened), false otherwise.
   */
  const intercept = (action) => {
    if (isInCall) {
      setPendingAction(() => action)
      setShowSwitchModal(true)
      return true
    }
    return false
  }

  const confirmSwitch = async () => {
    setShowSwitchModal(false)
    dispatch(leaveCall())
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
