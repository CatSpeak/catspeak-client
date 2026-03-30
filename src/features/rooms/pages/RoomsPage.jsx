import React, { useState, useMemo } from "react"
import { MessageCircle, Monitor, Users, Layers, Filter } from "lucide-react"
import { useSearchParams, useParams, useNavigate } from "react-router-dom"
import {
  RoomFilterSidebar,
  ClassSidebar,
  WelcomeSection,
  SessionActionButtons,
  CommunicateTab,
  // TeachingTab,
  // GroupTab,
  // ClassTab,
  CreateRoomModal,
  RoomsTabs,
  RoomsMobileDrawer,
  useRoomsPageLogic,
  useGetRoomsQuery,
  AllowConnectSwitch,
} from "@/features/rooms"
import { WorkshopCarousel } from "@/features/workshops"

import { useLanguage } from "@/shared/context/LanguageContext"
import { PageNotFound } from "@/shared/pages"
import { AnimatePresence } from "framer-motion"
import {
  FadeAnimation,
  FluentAnimation,
} from "@/shared/components/ui/animations"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const RoomsPage = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { t } = useLanguage()

  const [page, setPage] = useState(1)
  const [tab, setTab] = useState("communicate")
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false)
  const navigate = useNavigate()

  const { state, actions } = useRoomsPageLogic()

  // Map language code to language name for queue preferences
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

  // Actions Wrappers
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

  // --- Extracting Data Fetching Logic ---
  const [searchParams] = useSearchParams()
  const { lang } = useParams()

  // Map language code to language type
  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  }
  const languageType = lang ? [langMap[lang]] : undefined

  // Force 404 for Vietnamese language
  if (languageType?.includes("Vietnamese")) {
    return <PageNotFound />
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

  // Only fetch data in RoomsPage if we are in a specific category (Filtered View)
  // Otherwise, the CommunicateTab's sections will fetch their own data.
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
  // --------------------------------------

  return (
    <AnimatePresence mode="wait">
      <FluentAnimation
        animationKey="rooms-page"
        direction="up"
        className="w-full"
      >
        {/* Hero Section - Improved mobile spacing */}
        <div className="grid grid-cols-1 gap-5 p-5 sm:px-6 sm:py-8 md:gap-10 md:py-12 lg:grid-cols-2">
          {/* Left column - Welcome Section */}
          <div className="flex flex-col gap-8">
            <WelcomeSection />

            <AllowConnectSwitch />

            {/* Session Creation Buttons */}
            <SessionActionButtons
              handleCreateOneOnOneSession={handleCreateOneOnOne}
              handleCreateStudyGroupSession={handleCreateStudyGroup}
              isCreatingOneOnOne={state.isCreatingOneOnOne}
              isCreatingStudyGroup={state.isCreatingStudyGroup}
            />
          </div>

          {/* Right column - Workshop Carousel */}
          <div>
            <WorkshopCarousel />
          </div>
        </div>

        {/* Lower section with content & sidebar */}
        <div className="px-5 sm:px-6 sm:pb-12">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[320px_1fr]">
            {/* Sidebar - Hidden on mobile by default, shown on tablet+ */}
            <div className="hidden lg:block">
              {tab === "class" ? <ClassSidebar /> : <RoomFilterSidebar />}
            </div>

            {/* Content area */}
            <div className="flex flex-col min-w-0">
              <div className="w-full">
                <div className="mb-4">
                  <RoomsTabs tab={tab} setTab={setTab} />
                </div>

                {/* Mobile Filter Button - Moved below tabs */}
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className={`flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-medium transition-all duration-200 ${
                      mobileFiltersOpen
                        ? "bg-[#990011] text-white border-[#990011]"
                        : "bg-[#F2F2F2] hover:bg-[#E6E6E6]"
                    }`}
                  >
                    <Filter size={20} />
                    <span>{t.rooms?.filters?.title || "Filters"}</span>
                  </button>
                </div>

                {/* Mobile Sidebar Drawer */}
                <RoomsMobileDrawer
                  isOpen={mobileFiltersOpen}
                  onClose={() => setMobileFiltersOpen(false)}
                  title={
                    tab === "class"
                      ? t.rooms?.tabs?.class || "Class List"
                      : t.rooms?.filters?.title || "Filters"
                  }
                >
                  {tab === "class" ? <ClassSidebar /> : <RoomFilterSidebar />}
                </RoomsMobileDrawer>

                {/* Tab Panels */}
                <div className="overflow-hidden py-10 -my-10 px-4 -mx-4">
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
                      {/* {tab === "teaching" && <TeachingTab />}
                      {tab === "group" && <GroupTab />}
                      {tab === "class" && <ClassTab />} */}
                    </FadeAnimation>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CreateRoomModal
          open={isCreateRoomModalOpen}
          onCancel={() => setCreateRoomModalOpen(false)}
        />
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default RoomsPage
