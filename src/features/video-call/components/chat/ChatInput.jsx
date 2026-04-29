import React, { useState, useRef, useCallback } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { colors } from "@/shared/utils/colors"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const ChatInput = ({
  onSendMessage,
  isConnected,
  onAiMessageSent,
  isAiInput,
}) => {
  const [message, setMessage] = useState("")
  const [isPrivateAi, setIsPrivateAi] = useState(false)
  const sendingRef = useRef(false)
  const { t } = useLanguage()
  const {
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    currentUserId,
    lkRoomName,
    localParticipant,
    aiPromptStatus,
    setAiPromptStatus,
  } = useGlobalVideoCall()

  const handleSend = useCallback(async () => {
    if (sendingRef.current) return
    let text = message.trim()
    if (!text) return

    sendingRef.current = true

    if (isAiInput) {
      if (aiPromptStatus?.active) {
        sendingRef.current = false
        return // Prevent prompting if already waiting for AI
      }

      const isPublic = !isPrivateAi
      const cleanPrompt = text
      const formattedPrompt = `${isPublic ? "@AIPublic" : "@AIPrivate"} ${cleanPrompt}`

      const roomName = lkRoomName || "General"

      setAiPromptStatus({ active: true, name: t?.rooms?.chatBox?.you || "You" })

      addOptimisticAiMessage({
        id: `ai-opt-${Date.now()}`,
        timestamp: Date.now(),
        message: formattedPrompt,
        topic: isPublic ? "public-ai" : "private-ai",
        questioner: currentUserId,
        from: {
          name: t?.rooms?.chatBox?.you || "You",
          isLocal: true,
          isAi: false,
        },
      })

      // Broadcast the public prompt to everyone else so they see the prompt and loading state
      if (isPublic && localParticipant) {
        try {
          const payload = JSON.stringify({
            message: formattedPrompt,
            questioner: currentUserId,
          })
          const encoded = new TextEncoder().encode(payload)
          localParticipant.publishData(encoded, {
            reliable: true,
            topic: "public-ai-prompt",
          })
        } catch (e) {
          console.warn("Failed to broadcast public AI prompt", e)
        }
      }

      setMessage("")
      requestAnimationFrame(() => {
        sendingRef.current = false
      })

      // Notify parent to open AI pane if collapsed
      if (onAiMessageSent) onAiMessageSent()

      try {
        const payload = { roomName, message: cleanPrompt }
        console.log("Sending AI payload:", payload)

        if (isPublic) {
          await chatPublicAi(payload).unwrap()
        } else {
          await chatPrivateAi(payload).unwrap()
        }
      } catch (error) {
        console.error("AI chat error", error)
        setAiPromptStatus({ active: false, name: "" })
        addOptimisticAiMessage({
          id: `ai-err-${Date.now()}`,
          timestamp: Date.now(),
          message: error?.data?.message || "All models are unavailable.",
          topic: isPublic ? "public-ai" : "private-ai",
          from: { name: "Cat Speak", isSystem: true, isAi: true },
        })
      }
      return
    }

    // Normal chat message
    onSendMessage(text)
    setMessage("")

    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [
    message,
    onSendMessage,
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    currentUserId,
    t,
    onAiMessageSent,
    aiPromptStatus,
    lkRoomName,
    localParticipant,
    setAiPromptStatus,
    isAiInput,
    isPrivateAi,
  ])

  const handleKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return

    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="flex flex-col relative shrink-0 bg-white">
      <form
        onSubmit={handleSubmit}
        className={`py-2 px-3 flex items-center gap-2 relative z-20 ${
          !isAiInput ? "border-t border-[#E5E5E5]" : ""
        }`}
      >
        <TextInput
          disabled={!isConnected}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? isAiInput
                ? isPrivateAi
                  ? t.rooms?.chatBox?.privateAiPlaceholder ||
                    "Ask AI (Private mode)"
                  : t.rooms?.chatBox?.publicAiPlaceholder ||
                    "Ask AI (Public mode)"
                : t.rooms?.chatBox?.inputPlaceholder || "Type a message..."
              : t.rooms?.chatBox?.connectingPlaceholder || "Connecting..."
          }
          containerClassName="flex-1 min-w-0"
          className="disabled:opacity-50"
          leftContent={
            isAiInput ? (
              <div
                title={isPrivateAi ? "Private AI Prompt" : "Public AI Prompt"}
                className="flex items-center justify-center"
              >
                <Switch
                  checked={isPrivateAi}
                  onChange={() => setIsPrivateAi(!isPrivateAi)}
                  colorClass="peer-checked:bg-green-500"
                />
              </div>
            ) : undefined
          }
          leftContentWidthClass="!pl-[3.75rem]"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors disabled:bg-black/10 disabled:text-black/25 disabled:cursor-not-allowed hover:opacity-90"
          style={
            isConnected && message.trim()
              ? { backgroundColor: colors.red[700], color: "white" }
              : {}
          }
        >
          <Send size={20} className="ml-[-2px] mt-[1px]" />
        </button>
      </form>
    </div>
  )
}

export default ChatInput
