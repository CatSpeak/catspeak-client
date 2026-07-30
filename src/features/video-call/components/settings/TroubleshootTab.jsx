import React from "react"
import TroubleshootPanel from "../TroubleshootPanel"

const TroubleshootTab = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TroubleshootPanel hideTitle />
    </div>
  )
}

export default TroubleshootTab
