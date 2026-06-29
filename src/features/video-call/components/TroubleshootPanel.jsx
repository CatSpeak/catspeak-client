import React from "react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { RefreshCcw } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const TroubleshootPanel = ({ hideTitle = false }) => {
  const { t } = useLanguage()
  const { lkRoom } = useGlobalVideoCall()

  const handleReconnect = () => {
    lkRoom?.simulateScenario("full-reconnect")
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {!hideTitle && (
        <div className="flex shrink-0 items-center border-b border-[#E5E5E5] px-4 py-3 min-h-12">
          <h2 className="text-base font-semibold">
            {t?.rooms?.videoCall?.reconnect || "Troubleshoot connection"}
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Reconnect Action Section */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-sm font-medium">
            {t?.rooms?.videoCall?.troubleshoot?.havingIssues || "Having issues?"}
          </h3>
          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            {t?.rooms?.videoCall?.troubleshoot?.description || "If you're experiencing lag, frozen video, or audio dropouts, try forcing a full reconnection. Your call will pause briefly while we re-establish the connection."}
          </p>
          <PillButton
            onClick={handleReconnect}
            startIcon={<RefreshCcw size={16} />}
            variant="primary"
            className="w-full"
          >
            {t?.rooms?.videoCall?.troubleshoot?.forceReconnect || "Force Reconnect"}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default TroubleshootPanel
