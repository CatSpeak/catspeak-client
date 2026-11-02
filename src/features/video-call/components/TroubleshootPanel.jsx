import React from "react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const TroubleshootPanel = ({ hideTitle = false, onClose }) => {
  const { t } = useLanguage()
  const { lkRoom, setShowTroubleshoot } = useGlobalVideoCall()

  const handleReconnect = () => {
    lkRoom?.simulateScenario("full-reconnect")
  }

  const handleClose = onClose || (() => setShowTroubleshoot?.(false))

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white">
      {!hideTitle && (
        <div className="flex shrink-0 items-center px-4 min-h-14">
          <h2 className="text-xl font-bold">
            {t?.rooms?.videoCall?.reconnect || "Troubleshoot connection"}
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Reconnect Action Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">
            {t?.rooms?.videoCall?.troubleshoot?.havingIssues ||
              "Having issues?"}
          </h3>
          <p className="text-base text-secondary dark:text-[#AAAAAA] leading-relaxed">
            {t?.rooms?.videoCall?.troubleshoot?.description ||
              "If you're experiencing lag, frozen video, or audio dropouts, try forcing a full reconnection. Your call will pause briefly while we re-establish the connection."}
          </p>
        </div>

        <PillButton
          onClick={handleReconnect}
          variant="primary"
          className="w-full"
        >
          {t?.rooms?.videoCall?.troubleshoot?.forceReconnect ||
            "Force Reconnect"}
        </PillButton>
      </div>
    </div>
  )
}

export default TroubleshootPanel
