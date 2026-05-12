import React, { useState } from "react"
import { Filter } from "lucide-react"
import { useSearchParams, useParams, useNavigate } from "react-router-dom"
import {
  ClassSidebar,
  CommunicateTab,
  RoomsMobileDrawer,
  useGetRoomsQuery,
  useRoomsPageLogic,
  SessionActionButtons,
  CreateRoomModal,
} from "@/features/rooms"

import RoomFilterSidebar from "@/features/rooms/components/navigation/RoomFilterSidebar"
import WelcomeSection from "@/features/homepage/components/WelcomeSection"
import { WorkshopCarousel } from "@/features/workshops"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PageNotFound } from "@/shared/pages"
import { AnimatePresence } from "framer-motion"
import {
  FadeAnimation,
  FluentAnimation,
} from "@/shared/components/ui/animations"
import { useSelector, useDispatch } from "react-redux"
import { leaveCall } from "@/store/slices/videoCallSlice"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"

const RoomsPage = () => {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false)
  const { t } = useLanguage()

  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  
  const { isInCall, callInfo } = useSelector((s) => s.videoCall)
  const dispatch = useDispatch()


  const [page, setPage] = useState(1)
  const [tab, setTab] = useState("communicate")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useParams()

  // Session logic (moved from HomePage)
  const { state, actions } = useRoomsPageLogic()

  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  }
  const languageType = lang ? [langMap[lang]] : undefined

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

  const proceedCreateOneOnOne = () => {
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

  const handleCreateOneOnOne = () => {
    if (isInCall) {
      setPendingAction("1:1")
      setShowSwitchModal(true)
      return
    }
    proceedCreateOneOnOne()
  }

  const handleCreateStudyGroup = () => {
    actions.handleCreateStudyGroupSession(() => {
      setCreateRoomModalOpen(true)
    })
  }

  const handleConfirmSwitch = async () => {
    setShowSwitchModal(false)
    if (isInCall) {
      dispatch(leaveCall())
    }
    
    if (pendingAction === "1:1") {
      proceedCreateOneOnOne()
    }
    setPendingAction(null)
  }

  const handleCancelSwitch = () => {
    setShowSwitchModal(false)
    setPendingAction(null)
  }

  const requiredLevels = searchParams.getAll("requiredLevels")
  const requiredLevelsArg =
    requiredLevels.length > 0 ? requiredLevels : undefined

  const categoriesParam = searchParams.get("categories")
  const categories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim())
    : undefined

  const topicsValues = searchParams.getAll("topics")
  const topicsArg = topicsValues.length > 0 ? topicsValues : undefined

  const pageSize = 12

  // Only fetch data if we are in a specific category (Filtered View)
  const shouldFetch = !!categories

  const { data: responseData, isLoading } = useGetRoomsQuery(
    {
      page,
      pageSize,
      languageType,
      requiredLevels: requiredLevelsArg,
      categories,
      topics: topicsArg,
    },
    { skip: !shouldFetch },
  )

  // Process data
  const rooms = responseData?.data ?? []
  const additionalData = responseData?.additionalData ?? {}
  const totalPages = additionalData.totalPages || 1

  // Force 404 for Vietnamese language (after all hooks)
  if (languageType?.includes("Vietnamese")) {
    return <PageNotFound />
  }

  const switchModal = (
    <SwitchCallModal
      open={showSwitchModal}
      onCancel={handleCancelSwitch}
      onConfirm={handleConfirmSwitch}
    />
  )

  return (
    <>
      {switchModal}
      <CreateRoomModal
        open={isCreateRoomModalOpen}
        onCancel={() => setCreateRoomModalOpen(false)}
      />
      <AnimatePresence mode="wait">
        <FluentAnimation
          key="rooms-page"
          animationKey="rooms-page"
          direction="up"
          className="w-full"
        >
        {/* ─── Hero Section: WelcomeSection + WorkshopCarousel ─── */}
        <div className="p-5 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Left: Welcome + Action Buttons */}
            <div className="flex flex-col gap-8">
              <WelcomeSection />
              <SessionActionButtons
                handleCreateOneOnOneSession={handleCreateOneOnOne}
                handleCreateStudyGroupSession={handleCreateStudyGroup}
                isCreatingOneOnOne={state.isCreatingOneOnOne}
                isCreatingStudyGroup={state.isCreatingStudyGroup}
              />
            </div>

            {/* Right: Workshop Carousel */}
            <div className="w-full">
              <WorkshopCarousel hideTitle />
            </div>
          </div>
        </div>

        {/* ─── Rooms Section: Filter Sidebar + CommunicateTab ─── */}
        <div className="p-5">
          {/* Mobile Filter Button (inline, above content) */}
          <div className="lg:hidden mb-4 flex justify-end">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg h-10 px-4 text-sm font-medium border border-[#C6C6C6] bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{t.rooms?.filters?.title || "Filters"}</span>
            </button>
          </div>

          <RoomsMobileDrawer
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title={t.rooms?.filters?.title || "Filters"}
          >
            <RoomFilterSidebar inDrawer />
          </RoomsMobileDrawer>

          <div className="flex gap-10 w-full">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-[280px] shrink-0">
              <RoomFilterSidebar />
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0">
              <div>
                <AnimatePresence mode="wait">
                  <FadeAnimation key={tab} className="w-full">
                    {tab === "communicate" && (
                      <CommunicateTab
                        rooms={rooms}
                        selectedCategories={categories}
                        page={page}
                        totalPages={totalPages}
                        setPage={setPage}
                        languageType={languageType}
                        requiredLevels={requiredLevelsArg}
                        topics={topicsArg}
                      />
                    )}
                  </FadeAnimation>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </FluentAnimation>
    </AnimatePresence>
    </>
  )
}

export default RoomsPage
