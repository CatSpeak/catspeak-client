import React, { useState, useEffect } from "react"
import { Mic, Settings } from "lucide-react"
import { motion, LayoutGroup } from "framer-motion"
import Modal from "@/shared/components/ui/Modal"
import ListItem from "@/shared/components/ui/ListItem"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import AudioVideoTab from "./AudioVideoTab"
import GeneralSettingsTab from "./GeneralSettingsTab"

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

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  const tabs = [
    {
      id: "audio-video",
      label: waitingT.deviceSettings || "Audio & Video",
      icon: <Mic size={20} />,
    },
    {
      id: "general",
      label: "General",
      icon: <Settings size={20} />,
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={waitingT.deviceSettings || "Cài đặt phòng họp"}
      className="md:max-w-[920px] w-full flex flex-col h-[560px] md:h-[560px] max-h-[80vh]"
      headerClassName="flex items-center justify-between p-4 sm:p-6 border-b border-[#E5E5E5] shrink-0"
      bodyClassName="p-0 flex-1 overflow-hidden flex flex-col md:flex-row min-h-0"
    >
      <div className="flex flex-col md:flex-row w-full h-full min-h-0 overflow-hidden">
        {/* Left Sidebar Navigation matching DesktopSidebar */}
        <div className="w-full md:w-[300px] bg-white md:border-r border-b md:border-b-0 border-[#E5E5E5] p-4 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-y-auto">
          <LayoutGroup id="roomSettingsSidebarNav">
            {tabs.map((tab) => {
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
                    leftContent={<span>{tab.icon}</span>}
                    className="w-full rounded-xl transition-all duration-200"
                    contentClassName={`rounded-xl transition-all duration-200 px-4 ${
                      isActive
                        ? "bg-[#F2F2F2] hover:bg-[#e6e6e6]"
                        : "hover:bg-[#F2F2F2]"
                    }`}
                  >
                    <span className="whitespace-nowrap text-base flex-1">
                      {tab.label}
                    </span>
                  </ListItem>
                </div>
              )
            })}
          </LayoutGroup>
        </div>

        {/* Right Content Area with fixed height & vertical scroll */}
        <div className="bg-[#f3f3f3] flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 h-full">
          {activeTab === "audio-video" && (
            <AudioVideoTab
              waitingT={waitingT}
              deviceSelection={deviceSelection}
              localStream={localStream}
              isOpen={open}
            />
          )}

          {activeTab === "general" && (
            <GeneralSettingsTab
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
