import React, { useState, useEffect } from "react"
import { Mic, Settings } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import ListItem from "@/shared/components/ui/ListItem"
import Tabs from "@/shared/components/ui/navigation/Tabs"
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={waitingT.deviceSettings || "Cài đặt"}
      className="md:max-w-[920px] w-full flex flex-col h-full md:!h-[560px] max-h-none md:max-h-[80vh]"
      headerClassName="flex items-center justify-between p-4 border-b border-border dark:border-[#3F3F3F] shrink-0"
      bodyClassName="!px-0 !mb-0 flex-1 overflow-hidden flex flex-col min-h-0"
      fullScreenOnMobile={true}
    >
      {/* Mobile Navigation Tabs */}
      <div className="block md:hidden bg-white dark:bg-[#1A1A1A] border-b border-border dark:border-[#3F3F3F] shrink-0">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="px-4"
        />
      </div>

      <div className="flex flex-col md:flex-row w-full h-full min-h-0 overflow-hidden flex-1">
        {/* Left Sidebar Navigation (Desktop Only) */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={waitingT.deviceSettings || "Settings"}
          className="hidden md:flex w-[280px] bg-white dark:bg-[#1A1A1A] border-r border-border dark:border-[#3F3F3F] flex-col shrink-0 overflow-y-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <div
                key={tab.id}
                className="relative group/navitem w-full shrink-0"
              >
                <ListItem
                  onClick={() => setActiveTab(tab.id)}
                  lines={1}
                  selected={isActive}
                  role="tab"
                  aria-selected={isActive}
                  id={`room-settings-tab-${tab.id}`}
                  aria-controls="room-settings-panel"
                  leftContent={
                    <span
                      className={
                        isActive
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-[#AAAAAA]"
                      }
                    >
                      {Icon && <Icon size={20} />}
                    </span>
                  }
                  className="w-full transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
                  contentClassName={`relative transition-colors duration-150 px-4 ${
                    isActive
                      ? "bg-itemActive hover:bg-itemActiveHover dark:bg-[#272727] dark:hover:bg-[#3D3D3D]"
                      : "hover:bg-itemHover dark:hover:bg-[#272727]"
                  }`}
                >
                  <span
                    className={`whitespace-nowrap text-base flex-1 ${
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-[#AAAAAA]"
                    }`}
                  >
                    {tab.label}
                  </span>
                </ListItem>
              </div>
            )
          })}
        </div>

        {/* Content Area */}
        <div
          role="tabpanel"
          id="room-settings-panel"
          aria-labelledby={`room-settings-tab-${activeTab}`}
          className="bg-white dark:bg-[#1A1A1A] flex-1 overflow-y-auto min-h-0 h-full"
        >
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
        </div>
      </div>
    </Modal>
  )
}

export default RoomSettingsModal
