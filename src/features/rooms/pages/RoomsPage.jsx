import React, { useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  CommunicateTab,
  RoomsTabs,
  TeachingTab,
  ForumTab,
  useGetRoomsQuery,
  useRoomsPageLogic,
  CreateRoomModal,
  AISessionSettingsModal,
  RoomsBannerContent,
} from "@/features/rooms";
import { WorkshopCarousel } from "@/features/workshops";

import { useCreateAISessionMutation } from "@/store/api/roomsApi";
import { AnimatePresence } from "framer-motion";
import {
  FadeAnimation,
  FluentAnimation,
} from "@/shared/components/ui/animations";
import { useSelector, useDispatch } from "react-redux";
import { leaveCall } from "@/store/slices/videoCallSlice";
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal";

const RoomsPage = () => {
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const { isInCall } = useSelector((s) => s.videoCall);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("communicate");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useParams();

  const { state, actions } = useRoomsPageLogic();
  const [createAISession] = useCreateAISessionMutation();

  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  };
  const languageType = lang ? [langMap[lang]] : undefined;

  const proceedCreateOneOnOne = () => {
    actions.handleCreateOneOnOneSession(() => {
      const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en";
      const preferences = {
        roomType: "OneToOne",
        topics: [],
        languageType: langMap[supportedLangCode],
      };
      navigate("/queue", { state: preferences });
    });
  };

  const proceedCreateStudyGroup = () => {
    actions.handleCreateStudyGroupSession(() => {
      setCreateRoomModalOpen(true);
    });
  };

  const handleConfirmSwitch = async () => {
    setShowSwitchModal(false);
    if (isInCall) {
      dispatch(leaveCall());
    }

    if (pendingAction === "1:1") {
      proceedCreateOneOnOne();
    }
    setPendingAction(null);
  };

  const handleCancelSwitch = () => {
    setShowSwitchModal(false);
    setPendingAction(null);
  };

  const handleCreateAI = (settings) => {
    setIsSettingsModalOpen(false);
    actions.handleCreateAISession(async () => {
      try {
        const result = await createAISession(settings).unwrap();
        navigate(`/${lang}/meet/${result.roomId}`, {
          state: { fromQueue: true, isAISession: true },
        });
      } catch (err) {
        console.error("Failed to create AI session", err);
      }
    });
  };

  const requiredLevels = searchParams.getAll("requiredLevels");
  const requiredLevelsArg =
    requiredLevels.length > 0 ? requiredLevels : undefined;

  const categoriesParam = searchParams.get("categories");
  const categories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim())
    : undefined;

  const topicsValues = searchParams.getAll("topics");
  const topicsArg = topicsValues.length > 0 ? topicsValues : undefined;

  const searchArg = searchParams.get("search");

  const pageSize = 12;
  const shouldFetch = !!categories || !!topicsArg || !!requiredLevelsArg || !!searchArg;

  const { data: responseData } = useGetRoomsQuery(
    {
      page: 1,
      pageSize: 1000,
      languageType,
      requiredLevels: requiredLevelsArg,
      categories,
      topics: topicsArg,
      roomName: searchArg,
    },
    { skip: !shouldFetch },
  );

  let rooms = responseData?.data ?? [];

  // Local pagination
  const totalFilteredCount = rooms.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  
  // Slice rooms for current page
  rooms = rooms.slice((page - 1) * pageSize, page * pageSize);

  const additionalData = responseData?.additionalData ?? {};

  return (
    <>
      <SwitchCallModal
        open={showSwitchModal}
        onCancel={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
      />
      <CreateRoomModal
        open={isCreateRoomModalOpen}
        onCancel={() => setCreateRoomModalOpen(false)}
      />
      <AISessionSettingsModal
        open={isSettingsModalOpen}
        urlLang={lang}
        onConfirm={handleCreateAI}
        onCancel={() => setIsSettingsModalOpen(false)}
      />
      <AnimatePresence mode="wait">
        <FluentAnimation
          key="rooms-page"
          animationKey="rooms-page"
          direction="up"
          className="w-full h-full flex flex-col"
        >
          <div className="p-5 flex-1 min-w-0 pt-8 px-0">
            <WorkshopCarousel
              hideTitle={true}
              leftContent={
                <RoomsBannerContent
                  sessionProps={{
                    handleCreateOneOnOneSession: proceedCreateOneOnOne,
                    handleCreateStudyGroupSession: proceedCreateStudyGroup,
                    handleCreateAISession: () => setIsSettingsModalOpen(true),
                    isCreatingOneOnOne: state.isCreatingOneOnOne,
                    isCreatingStudyGroup: state.isCreatingStudyGroup,
                    isCreatingAI: state.isCreatingAI,
                    canUseAI: true,
                  }}
                />
              }
            />

            <div className="w-full flex flex-col pt-6 backdrop-blur-sm border-t border-white shadow-[0_-2px_2px_rgba(0,0,0,0.02)] shaw">
              {/* Tabs */}
              <RoomsTabs tab={tab} setTab={setTab} />

              <div className="w-full">
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
                    {tab === "teachers" && <TeachingTab />}
                    {tab === "forum" && <ForumTab />}
                  </FadeAnimation>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </FluentAnimation>
      </AnimatePresence>
    </>
  );
};

export default RoomsPage;
