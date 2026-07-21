import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import WelcomeSection from "../components/WelcomeSection"
import { WorkshopCarousel } from "@/features/workshops"
import {
  useRoomsPageLogic,
  SessionActionButtons,
  CreateRoomModal,
  CreateCustomRoomModal,
} from "@/features/rooms"
import CommunityPresence from "../components/CommunityPresence"

const HomePage = () => {
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false)
  const [isCustomRoomModalOpen, setCustomRoomModalOpen] = useState(false)
  const navigate = useNavigate()
  const { lang } = useParams()

  const { state, actions } = useRoomsPageLogic()

  const getLanguageName = (langCode) => {
    switch (langCode) {
      case "zh":
        return "Chinese"
      case "vi":
        return "Vietnamese"
      case "en":
        return "English"
      default:
        return "English"
    }
  }

  const handleCreateOneOnOne = () => {
    actions.handleCreateOneOnOneSession(() => {
      const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
      const preferences = {
        roomType: "OneToOne",
        topics: [],
        languageType: getLanguageName(supportedLangCode),
      }
      navigate("/queue", { state: preferences })
    })
  }

  const handleCreateStudyGroup = () => {
    actions.handleCreateStudyGroupSession(() => {
      setCreateRoomModalOpen(true)
    })
  }

  const handleCreateCustomRoom = () => {
    actions.handleCreateCustomRoomSession(() => {
      setCustomRoomModalOpen(true)
    })
  }

  return (
    <AnimatePresence mode="wait">
      <FluentAnimation animationKey="home-page" direction="up" className="p-5">
        <div className="flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-5 w-full">
            <WelcomeSection />
            <CommunityPresence />
            <SessionActionButtons
              handleCreateOneOnOneSession={handleCreateOneOnOne}
              handleCreateStudyGroupSession={handleCreateStudyGroup}
              handleCreateCustomRoomSession={handleCreateCustomRoom}
              isCreatingOneOnOne={state.isCreatingOneOnOne}
              isCreatingStudyGroup={state.isCreatingStudyGroup}
              isCreatingCustom={state.isCreatingCustom}
            />
          </div>

          <div className="w-full">
            <WorkshopCarousel />
          </div>
        </div>

        <CreateRoomModal
          open={isCreateRoomModalOpen}
          onCancel={() => setCreateRoomModalOpen(false)}
        />
        <CreateCustomRoomModal
          open={isCustomRoomModalOpen}
          onCancel={() => setCustomRoomModalOpen(false)}
        />
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default HomePage
