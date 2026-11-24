import React, { useState } from "react"
import { useSearchParams, useParams, useNavigate } from "react-router-dom"
import {
  CommunicateTab,
  RoomsTabs,
  TeachingTab,
  ForumTab,
  useGetRoomsQuery,
  useRoomsPageLogic,
  CreateRoomModal,
  JoinRoomModal,
  AISessionSettingsModal,
  RoomsBannerContent,
} from "@/features/rooms"
import { WorkshopCarousel } from "@/features/workshops"

import { useCreateAISessionMutation } from "@/store/api/roomsApi"
import { AnimatePresence, motion as Motion, LayoutGroup, useReducedMotion } from "framer-motion"
import { M3_MOTION } from "@/shared/constants/motion"
import {
  FadeAnimation,
  FluentAnimation,
} from "@/shared/components/ui/animations"
import { useSelector, useDispatch } from "react-redux"
import { leaveCall } from "@/store/slices/videoCallSlice"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import {
  pingActiveCall,
  requestLeaveActiveCall,
} from "@/features/video-call/services/callBroadcastChannel"

const RoomsPage = () => {
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const { isInCall } = useSelector((s) => s.videoCall)
  const dispatch = useDispatch()

  const [tab, setTab] = useState("communicate")
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useParams()

  const pageParam = parseInt(searchParams.get("page") || "1", 10)
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1

  const handleSetPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage)
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const { state, actions } = useRoomsPageLogic()
  const [createAISession] = useCreateAISessionMutation()
  const prefersReducedMotion = useReducedMotion()
  const spatialTransition = prefersReducedMotion
    ? { duration: 0 }
    : M3_MOTION.standard.spatial.fast

  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
    ja: "Japanese",
  }
  const languageType = lang ? [langMap[lang]] : undefined

  const checkAndIntercept = async (action) => {
    const remoteActive = await pingActiveCall()
    if (isInCall || remoteActive) {
      setPendingAction(() => action)
      setShowSwitchModal(true)
      return true
    }
    return false
  }

  const proceedCreateOneOnOne = async () => {
    const action = () => {
      actions.handleCreateOneOnOneSession(() => {
        const supportedLangCode = ["zh", "vi", "en", "ja"].includes(lang)
          ? lang
          : "en"
        const preferences = {
          roomType: "OneToOne",
          topics: [],
          languageType: langMap[supportedLangCode],
        }
        navigate("/queue", { state: preferences })
      })
    }
    if (await checkAndIntercept(action)) return
    action()
  }

  const proceedCreateStudyGroup = async () => {
    const action = () => {
      actions.handleCreateStudyGroupSession(() => {
        actions.openJoinRoomModal()
      })
    }
    if (await checkAndIntercept(action)) return
    action()
  }

  const handleCreateCustomRoom = async () => {
    const action = () => {
      actions.handleCreateCustomRoomSession(() => {
        actions.openCreateRoomModal("group")
      })
    }
    if (await checkAndIntercept(action)) return
    action()
  }

  const handleConfirmSwitch = async () => {
    setShowSwitchModal(false)
    requestLeaveActiveCall()
    if (isInCall) {
      dispatch(leaveCall())
    }

    if (typeof pendingAction === "function") {
      pendingAction()
    }
    setPendingAction(null)
  }

  const handleCancelSwitch = () => {
    setShowSwitchModal(false)
    setPendingAction(null)
  }

  const handleCreateAI = async (settings) => {
    actions.closeAISettingsModal()
    const action = () => {
      actions.handleCreateAISession(async () => {
        try {
          const result = await createAISession(settings).unwrap()
          navigate(`/${lang}/meet/${result.roomId}`, {
            state: { fromQueue: true, isAISession: true },
          })
        } catch (err) {
          console.error("Failed to create AI session", err)
        }
      })
    }
    if (await checkAndIntercept(action)) return
    action()
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

  const searchArg = searchParams.get("search")?.trim() || undefined

  const isFiltered = Boolean(
    searchArg ||
    (categories && categories.length > 0) ||
    (topicsArg && topicsArg.length > 0) ||
    (requiredLevelsArg && requiredLevelsArg.length > 0),
  )

  const pageSize = 12
  const shouldFetch =
    !!categories || !!topicsArg || !!requiredLevelsArg || !!searchArg

  const hasOtherCategory = categories?.includes("Other")
  const apiCategories = hasOtherCategory ? undefined : categories

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetRoomsQuery(
    {
      page: hasOtherCategory ? 1 : page,
      pageSize: hasOtherCategory ? 100 : pageSize,
      languageType,
      requiredLevels: requiredLevelsArg,
      categories: apiCategories,
      topics: topicsArg,
      roomName: searchArg,
    },
    { skip: !shouldFetch },
  )

  const isLoadingRooms = shouldFetch && (isLoading || isFetching)

  let rooms = responseData?.items ?? []

  if (hasOtherCategory) {
    const known = ["Knowledge", "Culture", "Lifestyle", "Growth"]
    rooms = rooms.filter((r) => {
      const isOtherRoom =
        !r.categories ||
        r.categories === "[]" ||
        r.categories.length === 0 ||
        r.categories.includes("Other") ||
        !known.some((c) => r.categories.includes(c))

      if (isOtherRoom && categories.includes("Other")) return true
      if (r.categories && r.categories.length > 0) {
        return categories.some(
          (selected) => selected !== "Other" && r.categories.includes(selected),
        )
      }
      return false
    })
  }

  // Use server pagination when querying exact categories, local pagination only for client-filtered "Other"
  const totalPages = hasOtherCategory
    ? Math.max(1, Math.ceil(rooms.length / pageSize))
    : Math.max(
        1,
        responseData?.totalPages ??
          Math.ceil((responseData?.totalCount ?? rooms.length) / pageSize),
      )

  if (hasOtherCategory) {
    rooms = rooms.slice((page - 1) * pageSize, page * pageSize)
  }

  return (
    <>
      <SwitchCallModal
        open={showSwitchModal}
        onCancel={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
      />
      <CreateRoomModal
        open={state.isCreateRoomModalOpen}
        initialMode={state.createRoomMode}
        onCancel={actions.closeCreateRoomModal}
      />
      <JoinRoomModal
        open={state.isJoinRoomModalOpen}
        onCancel={actions.closeJoinRoomModal}
      />
      <AISessionSettingsModal
        open={state.isSettingsModalOpen}
        urlLang={lang}
        onConfirm={handleCreateAI}
        onCancel={actions.closeAISettingsModal}
      />
      <AnimatePresence mode="wait">
        <FluentAnimation
          key="rooms-page"
          animationKey="rooms-page"
          direction="up"
          className="w-full h-full flex flex-col"
        >
          <LayoutGroup id="rooms-page-layout">
            <div className="w-full flex flex-col">
              {!isFiltered && (
                <Motion.div
                  layout="position"
                  transition={spatialTransition}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start p-4"
                >
                  <RoomsBannerContent
                    sessionProps={{
                      handleCreateOneOnOneSession: proceedCreateOneOnOne,
                      handleCreateStudyGroupSession: proceedCreateStudyGroup,
                      handleCreateAISession: () => actions.openAISettingsModal(),
                      handleCreateCustomRoomSession: handleCreateCustomRoom,
                      isCreatingOneOnOne: state.isCreatingOneOnOne,
                      isCreatingStudyGroup: state.isCreatingStudyGroup,
                      isCreatingAI: state.isCreatingAI,
                      isCreatingCustom: state.isCreatingCustom,
                      canUseAI: true,
                      currentLang: lang,
                    }}
                  />
                  <div className="w-full">
                    <WorkshopCarousel hideTitle={true} />
                  </div>
                </Motion.div>
              )}

              <Motion.div
                layout="position"
                transition={spatialTransition}
                className={`w-full flex flex-col px-4 pb-4 ${isFiltered ? "pt-4" : "pt-0"}`}
                data-tour="rooms-category-section"
              >
                {/* Tabs hidden temporarily to save vertical space */}
                {/* <RoomsTabs tab={tab} setTab={setTab} /> */}

                <div className="w-full">
                  <AnimatePresence mode="wait">
                    <FadeAnimation key={tab} className="w-full">
                      {tab === "communicate" && (
                        <CommunicateTab
                          rooms={rooms}
                          selectedCategories={categories}
                          page={page}
                          totalPages={totalPages}
                          setPage={handleSetPage}
                          languageType={languageType}
                          requiredLevels={requiredLevelsArg}
                          topics={topicsArg}
                          isLoading={isLoadingRooms}
                        />
                      )}
                      {tab === "teachers" && <TeachingTab />}
                      {tab === "forum" && <ForumTab />}
                    </FadeAnimation>
                  </AnimatePresence>
                </div>
              </Motion.div>
            </div>
          </LayoutGroup>
        </FluentAnimation>
      </AnimatePresence>
    </>
  )
}

export default RoomsPage
