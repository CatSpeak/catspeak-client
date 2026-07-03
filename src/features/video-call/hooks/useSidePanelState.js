import { useState } from "react"

/**
 * Manages the exclusive side-panel state for the video call UI.
 *
 * Only one panel can be active at a time. Opening a new panel
 * automatically closes the previous one.
 *
 * Panel keys: "chat" | "participants" | "virtualBackground" | "avatarPicker"
 *
 * To add a new panel in the future:
 *   1. Add a derived boolean (e.g. `const showFoo = activeSidePanel === "foo"`)
 *   2. Add a convenience setter (e.g. `const setShowFoo = (show) => set(show ? "foo" : null)`)
 *   3. Include both in the return object
 */
export const useSidePanelState = () => {
  const [activeSidePanel, setActiveSidePanel] = useState(null)

  // Derived booleans
  const showChat = activeSidePanel === "chat"
  const showParticipants = activeSidePanel === "participants"
  const showVirtualBackground = activeSidePanel === "virtualBackground"
  const showAvatarPicker = activeSidePanel === "avatarPicker"
  const showBreakout = activeSidePanel === "breakout"

  // Convenience setters (accept boolean toggle style)
  const setShowChat = (show) => setActiveSidePanel(show ? "chat" : null)
  const setShowParticipants = (show) => setActiveSidePanel(show ? "participants" : null)
  const setShowVirtualBackground = (show) => setActiveSidePanel(show ? "virtualBackground" : null)
  const setShowAvatarPicker = (show) => setActiveSidePanel(show ? "avatarPicker" : null)
  const setShowBreakout = (show) => setActiveSidePanel(show ? "breakout" : null)

  // Chat sub-panel collapse state (tightly coupled to panel visibility)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [isAiCollapsed, setIsAiCollapsed] = useState(false)

  return {
    activeSidePanel,
    setActiveSidePanel,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    showBreakout,
    setShowBreakout,
    isChatCollapsed,
    setIsChatCollapsed,
    isAiCollapsed,
    setIsAiCollapsed,
  }
}
