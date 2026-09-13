import React, { useState, useEffect } from "react"
import { Mic, Settings } from "lucide-react"
import { motion, LayoutGroup } from "framer-motion"
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
      headerClassName="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0"
      bodyClassName="p-0 flex-1 overflow-hidden flex flex-col min-h-0"
      fullScreenOnMobile={true}
    >
      {/* Mobile Navigation Tabs */}
      <div className="block md:hidden bg-white shrink-0">
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
          className="hidden md:flex w-[300px] bg-white border-r border-border p-4 flex-col gap-1 shrink-0 overflow-y-auto"
        >
          <LayoutGroup id="roomSettingsSidebarNav">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <div
                  key={tab.id}
                  className="relative group/navitem w-full shrink-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="roomSettingsNavActiveIndicator"
                      className="absolute left-0 inset-y-0 my-auto w-[3px] h-5 bg-cath-red-700 rounded-r-full z-20"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <ListItem
                    onClick={() => setActiveTab(tab.id)}
                    lines={1}
                    role="tab"
                    aria-selected={isActive}
                    id={`room-settings-tab-${tab.id}`}
                    aria-controls="room-settings-panel"
                    leftContent={
                      <span className={isActive ? "text-cath-red-700" : "text-neutral-500"}>
                        {Icon && <Icon size={20} />}
                      </span>
                    }
                    className="w-full rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
                    contentClassName={`rounded-xl transition-all duration-200 px-4 ${
                      isActive
                        ? "bg-cath-red-700/[0.07] hover:bg-cath-red-700/10"
                        : "hover:bg-primaryBg"
                    }`}
                  >
                    <span
                      className={`whitespace-nowrap text-base flex-1 ${
                        isActive ? "font-semibold text-neutral-900" : ""
                      }`}
                    >
                      {tab.label}
                    </span>
                  </ListItem>
                </div>
              )
            })}
          </LayoutGroup>
        </div>

        {/* Content Area */}
        <div
          role="tabpanel"
          id="room-settings-panel"
          aria-labelledby={`room-settings-tab-${activeTab}`}
          className="bg-primaryBg flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 h-full"
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
