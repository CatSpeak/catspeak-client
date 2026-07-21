import { memo } from "react"

/**
 * SystemMessage — centered subtle notification text for system/event items in chat.
 */
const SystemMessage = memo(({ content }) => (
  <div className="flex justify-center items-center h-8">
    <span className="text-[#606060] text-xs text-center break-words">
      {content}
    </span>
  </div>
))

SystemMessage.displayName = "SystemMessage"

export default SystemMessage
