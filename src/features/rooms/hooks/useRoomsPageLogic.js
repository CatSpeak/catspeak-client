import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useAuth } from "@/features/auth"
import { useState } from "react"

const AI_ALLOWED_ACCOUNT_IDS = [39]

export const useRoomsPageLogic = () => {
  const { isAuthenticated, user } = useAuth()
  const { openAuthModal } = useAuthModal()

  // Business loading states
  const [isCreatingAI, setIsCreatingAI] = useState(false)

  // Modal states
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false)
  const [createRoomMode, setCreateRoomMode] = useState("group")
  const [isJoinRoomModalOpen, setJoinRoomModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const canUseAI = AI_ALLOWED_ACCOUNT_IDS.includes(user?.accountId)

  const handleCreateOneOnOneSession = (onSuccess) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    onSuccess?.()
  }

  const handleCreateStudyGroupSession = (onSuccess) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    if (onSuccess) {
      onSuccess()
    } else {
      setJoinRoomModalOpen(true)
    }
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
    if (onSuccess) {
      onSuccess()
    } else {
      setCreateRoomMode("group")
      setCreateRoomModalOpen(true)
    }
  }

  return {
    state: {
      isCreating: isCreatingAI,
      isCreatingAI,
      canUseAI,
      isCreateRoomModalOpen,
      createRoomMode,
      isJoinRoomModalOpen,
      isSettingsModalOpen,
    },
    actions: {
      handleCreateOneOnOneSession,
      handleCreateStudyGroupSession,
      handleCreateAISession,
      handleCreateCustomRoomSession,
      setCreateRoomModalOpen,
      setCreateRoomMode,
      setJoinRoomModalOpen,
      setIsSettingsModalOpen,
      openJoinRoomModal: () => setJoinRoomModalOpen(true),
      closeJoinRoomModal: () => setJoinRoomModalOpen(false),
      openCreateRoomModal: (mode = "group") => {
        setCreateRoomMode(mode)
        setCreateRoomModalOpen(true)
      },
      closeCreateRoomModal: () => setCreateRoomModalOpen(false),
      openAISettingsModal: () => setIsSettingsModalOpen(true),
      closeAISettingsModal: () => setIsSettingsModalOpen(false),
    },
  }
}

