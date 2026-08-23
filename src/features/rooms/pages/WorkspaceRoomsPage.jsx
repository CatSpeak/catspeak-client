import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";
import {
  Crown,
  Bookmark,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  DoorOpen,
} from "lucide-react";
import Tabs from "@/shared/components/ui/navigation/Tabs";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";
import { toast } from "react-hot-toast";
import {
  useGetMyRoomsQuery,
  useGetMyCustomRoomsQuery,
  useDeleteCustomRoomMutation,
  useToggleBookmarkRoomMutation,
} from "@/store/api/roomsApi";
import CreateRoomModal from "../components/CreateRoomModal";
import EditRoomModal from "../components/EditRoomModal";
import CustomRoomCard from "../components/CustomRoomCard";
import RoomCard from "../components/RoomCard";
import WorkspaceRoomFilterModal from "../components/WorkspaceRoomFilterModal";
import WorkspaceRoomSortModal from "../components/WorkspaceRoomSortModal";

// const getLanguageName = (langCode) => {
//   switch (langCode) {
//     case "zh":
//       return "Chinese";
//     case "vi":
//       return "Vietnamese";
//     case "en":
//       return "English";
//     default:
//       return "English";
//   }
// };

const WorkspaceRoomsContent = () => {
  const { t } = useLanguage();
  const { lang, id } = useParams();
  const navigate = useNavigate();
  const ct = t.rooms?.customRooms || {};

  const supportedLangCode = ["zh", "vi", "en", "ja"].includes(lang) ? lang : "en";

  // Tab State: "created" | "bookmark"
  const [activeTab, setActiveTab] = useState("created");

  // Modals & Card Interaction States
  const [copiedId, setCopiedId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Search, Filter & Sort States
  const [searchInputValue, setSearchInputValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLevels, setAppliedLevels] = useState([]);
  const [appliedTopics, setAppliedTopics] = useState([]);
  const [appliedSortField, setAppliedSortField] = useState("createdAt");
  const [appliedSortOrder, setAppliedSortOrder] = useState("desc");

  // Tab mapping for API: "created" | "bookmark"
  const apiTab =
    activeTab === "bookmark" || activeTab === "bookmarked"
      ? "bookmark"
      : "created";

  // Map sort options to API format
  const apiSort = useMemo(() => {
    if (appliedSortField === "name") {
      return appliedSortOrder === "asc" ? "name_asc" : "name_desc";
    }
    if (appliedSortField === "currentParticipantCount") {
      return "participants_desc";
    }
    if (appliedSortField === "createdAt") {
      return appliedSortOrder === "asc" ? "oldest" : "newest";
    }
    return "newest";
  }, [appliedSortField, appliedSortOrder]);

  // API Hooks
  const {
    data: myRoomsResponse,
    isLoading: isMyRoomsLoading,
    refetch: refetchMyRooms,
  } = useGetMyRoomsQuery({
    tab: apiTab,
    search: appliedSearch.trim() || undefined,
    sort: apiSort,
    page: 1,
    pageSize: 50,
  });

  const { data: customRoomsData } = useGetMyCustomRoomsQuery();

  const [deleteCustomRoom, { isLoading: isDeleting }] =
    useDeleteCustomRoomMutation();

  const [toggleBookmark] = useToggleBookmarkRoomMutation();

  const isLoading = isMyRoomsLoading && !myRoomsResponse;

  // Extract raw room list from getMyRooms response
  const rawTargetRooms = useMemo(() => {
    if (Array.isArray(myRoomsResponse?.data?.items)) {
      return myRoomsResponse.data.items;
    }
    if (Array.isArray(myRoomsResponse?.data)) {
      return myRoomsResponse.data;
    }
    if (Array.isArray(myRoomsResponse?.items)) {
      return myRoomsResponse.items;
    }
    if (apiTab === "created" && Array.isArray(customRoomsData?.customRooms)) {
      return customRoomsData.customRooms;
    }
    return [];
  }, [myRoomsResponse, apiTab, customRoomsData]);

  // Quota for custom rooms
  const quota = {
    used:
      customRoomsData?.currentCustomRoomsCount ??
      myRoomsResponse?.data?.totalCount ??
      rawTargetRooms.length,
    max: customRoomsData?.maxCustomRooms ?? 3,
  };
  const isQuotaFull = customRoomsData?.canCreateCustomRoom === false;

  // Tab definition
  const tabs = useMemo(
    () => [
      {
        id: "created",
        label: t.rooms?.workspace?.customRooms || "Phòng tùy chỉnh",
        icon: DoorOpen,
      },
      {
        id: "bookmark",
        label: t.rooms?.workspace?.bookmarkedRooms || "Phòng đã lưu",
        icon: Bookmark,
      },
    ],
    [t],
  );

  // Handle Search trigger
  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInputValue);
  }, [searchInputValue]);

  // Handle Search Input Change with instant reset if cleared
  const handleSearchInputChange = useCallback((val) => {
    setSearchInputValue(val);
    if (val === "") {
      setAppliedSearch("");
    }
  }, []);

  // Action handlers
  const handleCopyLink = useCallback(
    (roomId) => {
      const link = `${window.location.origin}/${supportedLangCode}/meet/${roomId}`;
      navigator.clipboard.writeText(link);
      setCopiedId(roomId);
      toast.success(ct.linkCopied || "Link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    },
    [supportedLangCode, ct.linkCopied],
  );

  const handleJoinRoom = useCallback(
    (roomId) => {
      navigate(`/${supportedLangCode}/meet/${roomId}`);
    },
    [navigate, supportedLangCode],
  );

  const handleEditRoom = useCallback((room) => {
    setEditingRoom(room);
  }, []);

  const handleDelete = useCallback(
    async (roomId) => {
      try {
        await deleteCustomRoom(roomId).unwrap();
        toast.success(ct.deleteSuccess || "Đã xóa phòng thành công");
        refetchMyRooms();
      } catch (err) {
        console.error("Failed to delete custom room:", err);
        toast.error(err?.data?.message || "Failed to delete room");
      }
    },
    [deleteCustomRoom, ct.deleteSuccess, refetchMyRooms],
  );

  const handleToggleBookmark = useCallback(
    async (roomId) => {
      try {
        const res = await toggleBookmark(roomId).unwrap();
        toast.success(res?.message || "Đã cập nhật danh sách phòng đã lưu");
        refetchMyRooms();
      } catch (err) {
        console.error("Failed to toggle bookmark:", err);
        toast.error(err?.data?.message || "Không thể thay đổi lưu phòng");
      }
    },
    [toggleBookmark, refetchMyRooms],
  );

  // Filter & Sort Application
  const handleApplyFilter = useCallback((levels, topics) => {
    setAppliedLevels(levels);
    setAppliedTopics(topics);
  }, []);

  const handleApplySort = useCallback((field, order) => {
    setAppliedSortField(field);
    setAppliedSortOrder(order);
  }, []);

  const activeFilterCount = appliedLevels.length + appliedTopics.length;

  // Client-side filtering
  const filteredAndSortedRooms = useMemo(() => {
    let list = [...rawTargetRooms];

    // 1. Level Filter
    if (appliedLevels.length > 0) {
      list = list.filter(
        (room) =>
          room.requiredLevel && appliedLevels.includes(room.requiredLevel),
      );
    }

    // 2. Topic Filter
    if (appliedTopics.length > 0) {
      list = list.filter((room) => {
        const topicsList = Array.isArray(room.topics)
          ? room.topics
          : room.topic
            ? [room.topic]
            : [];
        return topicsList.some((tp) => appliedTopics.includes(tp));
      });
    }

    return list;
  }, [rawTargetRooms, appliedLevels, appliedTopics]);

  // if (!isPlanLoading && !limits.allowCustomRooms) {
  //   return (
  //     <PlanRequiredState
  //       pageTitle={ct.myRoomsTitle || "My Custom Rooms"}
  //       subtext="Custom rooms allow you to create persistent, customizable rooms for your community. Upgrade to CatSpeak Pro to unlock custom rooms!"
  //       featureName="Custom Rooms"
  //       animationKey="custom-rooms-pro-required"
  //     />
  //   )
  // }

  return (
    <div className="flex flex-col gap-5 text-gray-800">
      <CreateRoomModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        initialMode="custom"
      />

      <EditRoomModal
        open={!!editingRoom}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
      />

      <WorkspaceRoomFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedLevels={appliedLevels}
        selectedTopics={appliedTopics}
        onApply={handleApplyFilter}
      />

      <WorkspaceRoomSortModal
        open={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        selectedSortField={appliedSortField}
        selectedSortOrder={appliedSortOrder}
        onApply={handleApplySort}
      />

      {id ? (
        <Outlet />
      ) : (
        <AnimatePresence mode="wait">
          <FluentAnimation
            animationKey={`workspace-rooms-${activeTab}`}
            direction="up"
            className="w-full"
          >
            {/* Top Bar: Tabs & Create Room Button */}
            <div className="flex justify-between items-center border-b border-border mb-4">
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                fullWidth={false}
                className="border-none mb-0"
              />
              {activeTab === "created" && (
                <PillButton
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={isQuotaFull}
                  startIcon={<Plus size={18} />}
                  className="h-10 text-sm mb-3 ml-4 shrink-0"
                >
                  {ct.create || "Tạo Phòng"}
                </PillButton>
              )}
            </div>

            {/* Action Controls Bar: Searchbar, Filter, Sort, Search Button */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
              {/* Searchbar (Left) */}
              <div className="flex-1 max-w-full md:max-w-xl">
                <SearchInput
                  value={searchInputValue}
                  onChange={handleSearchInputChange}
                  onSearch={handleSearch}
                  placeholder={
                    t.rooms?.searchPlaceholder || "Tìm kiếm theo tên phòng..."
                  }
                  className="h-12 border-border"
                />
              </div>

              {/* Right Side Buttons: Filter, Sort, "Tìm kiếm" */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {/* Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="relative flex items-center justify-center h-12 px-4 rounded-full bg-primaryBg hover:bg-gray-200 text-gray-700 font-medium transition-colors shrink-0 gap-2 text-sm"
                  title={t.rooms?.filters?.title || "Bộ lọc"}
                >
                  <SlidersHorizontal size={18} strokeWidth={2} />
                  {/* <span className="hidden sm:inline">
                    {t.rooms?.filters?.title || "Bộ lọc"}
                  </span> */}
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cath-red-700 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Button */}
                <button
                  type="button"
                  onClick={() => setIsSortOpen(true)}
                  className="relative flex items-center justify-center h-12 px-4 rounded-full bg-primaryBg hover:bg-gray-200 text-gray-700 font-medium transition-colors shrink-0 gap-2 text-sm"
                  title={t.rooms?.sortTitle || "Sắp xếp"}
                >
                  <ArrowUpDown size={18} strokeWidth={2} />
                  {/* <span className="hidden sm:inline">
                    {t.rooms?.sortTitle || "Sắp xếp"}
                  </span> */}
                  {appliedSortField && (
                    <span className="flex h-2 w-2 rounded-full bg-cath-red-700" />
                  )}
                </button>

                {/* "Tìm kiếm" Button (Far right) */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="h-12 px-6 bg-cath-red-700 hover:bg-cath-red-800 text-white font-semibold rounded-full text-sm transition-all shadow-md shadow-cath-red-700/10 flex items-center justify-center shrink-0"
                >
                  {t.rooms?.searchBtn || "Tìm kiếm"}
                </button>
              </div>
            </div>

            {/* Room Quota Counter (for Created Tab) */}
            {activeTab === "created" && (
              <p className="text-sm font-medium text-[#606060] mb-4 text-left">
                {(ct.quota || "{{used}}/{{max}} phòng đã dùng")
                  .replace("{{used}}", quota.used)
                  .replace("{{max}}", quota.max)}
              </p>
            )}

            {/* Room List Content */}
            {isLoading ? (
              <RoomsListSkeleton />
            ) : filteredAndSortedRooms.length === 0 ? (
              /* Empty state matching WorkspaceMyReelsTab.jsx style */
              <div className="flex flex-col items-center justify-center p-10 border border-dashed border-border rounded-2xl bg-gray-50/50 my-4">
                {activeTab === "created" ? (
                  <Crown size={48} className="text-gray-300 mb-3" />
                ) : (
                  <Bookmark size={48} className="text-gray-300 mb-3" />
                )}

                <h3 className="font-bold text-gray-700 mb-1 text-center">
                  {appliedSearch || activeFilterCount > 0
                    ? t.rooms?.noSearchResults || "Không tìm thấy phòng phù hợp"
                    : activeTab === "created"
                      ? ct.noRooms || "Bạn chưa tạo phòng tùy chỉnh nào"
                      : t.rooms?.noBookmarkedRooms ||
                        "Chưa có phòng nào được lưu"}
                </h3>

                <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
                  {appliedSearch || activeFilterCount > 0
                    ? t.rooms?.noSearchResultsDesc ||
                      "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn."
                    : activeTab === "created"
                      ? ct.noRoomsSubtext ||
                        "Tạo phòng vĩnh viễn đầu tiên với tối đa 100 người tham gia!"
                      : t.rooms?.noBookmarkedRoomsDesc ||
                        "Lưu các phòng yêu thích để truy cập nhanh chóng bất cứ lúc nào!"}
                </p>

                {activeTab === "created" &&
                  !(appliedSearch || activeFilterCount > 0) && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      disabled={isQuotaFull}
                      className="bg-cath-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cath-red-600 transition-colors flex items-center space-x-1 text-sm shadow disabled:opacity-50"
                    >
                      <Plus size={16} />
                      <span>{ct.create || "Tạo Phòng"}</span>
                    </button>
                  )}
              </div>
            ) : apiTab === "bookmark" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {filteredAndSortedRooms.map((room) => (
                  <RoomCard
                    key={room.id || room.roomId}
                    room={room}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {filteredAndSortedRooms.map((room) => (
                  <CustomRoomCard
                    key={room.id || room.roomId}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDelete}
                    onCopyLink={handleCopyLink}
                    onJoin={handleJoinRoom}
                    onToggleBookmark={handleToggleBookmark}
                    isBookmarkTab={false}
                    copiedId={copiedId}
                    isDeleting={isDeleting}
                    ct={ct}
                  />
                ))}
              </div>
            )}
          </FluentAnimation>
        </AnimatePresence>
      )}
    </div>
  );
};

const RoomsListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-border bg-white overflow-hidden animate-pulse flex flex-col"
      >
        <div className="aspect-video w-full bg-gray-200" />
        <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const WorkspaceRoomsPage = () => {
  return <WorkspaceRoomsContent />;
};

export default WorkspaceRoomsPage;
