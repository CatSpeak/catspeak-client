import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useAuth } from "@/features/auth"
import { useState } from "react"

const AI_ALLOWED_ACCOUNT_IDS = [39]

export const useRoomsPageLogic = () => {
  const { isAuthenticated, user } = useAuth()
  const { openAuthModal } = useAuthModal()

  // Business loading states
  const [isCreatingOneOnOne, setIsCreatingOneOnOne] = useState(false)
  const [isCreatingStudyGroup, setIsCreatingStudyGroup] = useState(false)
  const [isCreatingAI, setIsCreatingAI] = useState(false)
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)

  const canUseAI = AI_ALLOWED_ACCOUNT_IDS.includes(user?.accountId)

  const handleCreateOneOnOneSession = (onSuccess) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show login popup instead of navigating to login page
      openAuthModal("login")
      return
    }
    // If authenticated, trigger success
    onSuccess?.()
  }

  const handleCreateStudyGroupSession = (onSuccess) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

    // trigger success
    onSuccess?.()
  }

  const handleCreateAISession = async (onSuccess) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    try {
      setIsCreatingAI(true)
      await onSuccess?.()
    } finally {
      setIsCreatingAI(false)
    }
  }

  const handleCreateCustomRoomSession = (onSuccess) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    onSuccess?.()
  }

  return {
    state: {
      isCreating: isCreatingOneOnOne || isCreatingStudyGroup || isCreatingAI || isCreatingCustom,
      isCreatingOneOnOne,
      isCreatingStudyGroup,
      isCreatingAI,
      isCreatingCustom,
      canUseAI,
    },
    actions: {
      handleCreateOneOnOneSession,
      handleCreateStudyGroupSession,
      handleCreateAISession,
      handleCreateCustomRoomSession,
    },
  }
}

