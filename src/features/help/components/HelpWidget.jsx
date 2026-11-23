import { useState, useEffect, useCallback } from "react"
import HelpChatBox from "./HelpChatBox"
import BugReportModal from "@/features/bug-report/components/BugReportModal"
import { isHelpHidden } from "../utils/helpVisibility"

function usePathname() {
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  )
  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        setPathname(window.location.pathname)
      }
    }
    window.addEventListener("popstate", update)
    const id = setInterval(update, 400)
    return () => {
      window.removeEventListener("popstate", update)
      clearInterval(id)
    }
  }, [])
  return pathname
}

export default function HelpWidget() {
  const [isBoxOpen, setIsBoxOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const pathname = usePathname()
  // Nhất quán với BugReportButton.jsx:28 ("/meet" || "/room"), và ẩn trên /chat để tránh đè lên ChatInput
  const isHidden = isHelpHidden(pathname)

  // Track chat open state for Q4 extra: Help toggle closes chat
  useEffect(() => {
    const onChatOpen = () => setIsChatOpen(true)
    const onChatClose = () => setIsChatOpen(false)
    window.addEventListener("catspeak:chat-assistant-opened", onChatOpen)
    window.addEventListener("catspeak:chat-assistant-closed", onChatClose)
    return () => {
      window.removeEventListener("catspeak:chat-assistant-opened", onChatOpen)
      window.removeEventListener("catspeak:chat-assistant-closed", onChatClose)
    }
  }, [])

  // Close box on Escape (also close chat)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (isChatOpen) {
          window.dispatchEvent(new CustomEvent("catspeak:close-chat-assistant"))
        }
        if (isBoxOpen) setIsBoxOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isBoxOpen, isChatOpen])

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

  // Single popup rule: when chat opens, close help box
  useEffect(() => {
    const onChatOpen = () => setIsBoxOpen(false)
    window.addEventListener("catspeak:chat-assistant-opened", onChatOpen)
    return () => window.removeEventListener("catspeak:chat-assistant-opened", onChatOpen)
  }, [])

  // Listen to open/close help event triggered from header dropdowns
  useEffect(() => {
    const onOpenHelp = () => {
      if (isChatOpen) {
        window.dispatchEvent(new CustomEvent("catspeak:close-chat-assistant"))
      }
      setIsBoxOpen(true)
    }
    const onCloseHelp = () => setIsBoxOpen(false)

    window.addEventListener("catspeak:open-help", onOpenHelp)
    window.addEventListener("catspeak:close-help", onCloseHelp)
    return () => {
      window.removeEventListener("catspeak:open-help", onOpenHelp)
      window.removeEventListener("catspeak:close-help", onCloseHelp)
    }
  }, [isChatOpen])

  // Q1: ẩn toàn bộ Help global khi vào room (/:lang/meet/:id) hoặc trang /chat nếu không chủ động mở.
  if (isHidden && !isBoxOpen && !isReportOpen) return null

  return (
    <>
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
