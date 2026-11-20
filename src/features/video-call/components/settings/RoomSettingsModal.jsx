import React, { useState, useEffect } from "react"
import { Mic, Settings } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Tabs, { TabContent } from "@/shared/components/ui/navigation/Tabs"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import AudioVideoTab from "./AudioVideoTab"
import PersonalSettingsTab from "./PersonalSettingsTab"

// Legacy tab ids were renamed: "general" is now the personal preferences tab.
const normalizeTab = (tab) => (tab === "general" ? "personal" : tab)

const RoomSettingsModal = ({
  open,
  onClose,
  initialTab = "audio-video",
  localStream = null,
}) => {
  const { t } = useLanguage()
  const waitingT = t?.rooms?.waitingScreen || {}

  const { deviceSelection, receiveSystemMsgs, setReceiveSystemMsgs } =
    useGlobalVideoCall()

  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab))

  useEffect(() => {
    if (open) {
      setActiveTab(normalizeTab(initialTab))
    }
  }, [open, initialTab])

  // Personal settings only. Room-wide policies live in the participant panel.
  const tabs = [
    {
      id: "audio-video",
      label: waitingT.deviceSettingsTab || "Cài đặt thiết bị",
      icon: Mic,
    },
    {
      id: "personal",
      label: waitingT.myPreferences || "Tùy chọn của tôi",
      icon: Settings,
    },
  ]

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={waitingT.deviceSettings || "Cài đặt"}
      className="md:max-w-[720px] w-full flex flex-col h-full md:!h-[560px] max-h-none md:max-h-[80vh]"
      bodyClassName="!p-0 !px-0 !mb-0 flex-1 overflow-hidden flex flex-col min-h-0"
      fullScreenOnMobile={true}
    >
      {/* Navigation Tabs - Edge to edge across top */}
      <div className="bg-white dark:bg-[#1A1A1A] shrink-0">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={false}
        />
      </div>

      {/* Content Area with padding on content */}
      <div
        role="tabpanel"
        id="room-settings-panel"
        aria-labelledby={`room-settings-tab-${activeTab}`}
        className="bg-white dark:bg-[#1A1A1A] flex-1 overflow-y-auto overflow-x-hidden min-h-0 h-full"
      >
        <TabContent activeTab={activeTab} tabs={tabs} className="w-full">
          {activeTab === "audio-video" && (
            <AudioVideoTab
              waitingT={waitingT}
              deviceSelection={deviceSelection}
              localStream={localStream}
              isOpen={open}
            />
          )}

          {activeTab === "personal" && (
            <PersonalSettingsTab
              receiveSystemMsgs={receiveSystemMsgs}
              setReceiveSystemMsgs={setReceiveSystemMsgs}
            />
          )}
        </TabContent>
      </div>
    </Modal>
  )
}

export default RoomSettingsModal
