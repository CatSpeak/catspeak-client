import { useState, useEffect, useCallback } from "react"
import HelpButton from "./HelpButton"
import HelpChatBox from "./HelpChatBox"
import BugReportModal from "@/features/bug-report/components/BugReportModal"

export default function HelpWidget() {
  const [isBoxOpen, setIsBoxOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Close box on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isBoxOpen) setIsBoxOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isBoxOpen])

  // Single active popup: when report opens, close box
  const handleReportProblem = useCallback(() => {
    setIsBoxOpen(false)
    setIsReportOpen(true)
  }, [])

  const handleExplore = useCallback(() => {
    // Navigate to /help — use window.location to avoid router context dependency (mounted in App.jsx outside router)
    window.location.assign("/help")
  }, [])

  const handleAskQuestion = useCallback(() => {
    setIsBoxOpen(false)
    // Trigger ChatAssistantWidget to open via custom event (Q7=A, Q13=A single popup)
    window.dispatchEvent(new CustomEvent("catspeak:open-chat-assistant"))
  }, [])

  // Also listen for external request to close help box when chat opens
  useEffect(() => {
    const onChatOpen = () => setIsBoxOpen(false)
    window.addEventListener("catspeak:chat-assistant-opened", onChatOpen)
    return () => window.removeEventListener("catspeak:chat-assistant-opened", onChatOpen)
  }, [])

  return (
    <>
      <HelpButton onClick={() => setIsBoxOpen((v) => !v)} isActive={isBoxOpen} />
      <HelpChatBox
        open={isBoxOpen}
        onClose={() => setIsBoxOpen(false)}
        onExplore={handleExplore}
        onReportProblem={handleReportProblem}
        onAskQuestion={handleAskQuestion}
      />
      <BugReportModal open={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  )
}
