import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures";
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

const WorkspaceRoomsContent = () => {
  const { t } = useLanguage();
  const { limits } = usePlanFeatures();
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

  // Search state
  const [searchInputValue, setSearchInputValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Ticket 02 filters: server-side
  const [appliedRoomType, setAppliedRoomType] = useState("All"); // All | Temporary | Custom
  const [appliedVisibility, setAppliedVisibility] = useState("All"); // All | Public | Private
  const [appliedActivity, setAppliedActivity] = useState("All"); // All | InUse | Empty
  const [appliedLanguage, setAppliedLanguage] = useState("All");
  const [appliedSortField, setAppliedSortField] = useState("createdAt");
  const [appliedSortOrder, setAppliedSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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

  // Visibility tracking for polling 15s only when tab visible
  const [isTabVisible, setIsTabVisible] = useState(() => typeof document !== "undefined" ? document.visibilityState === "visible" : true);
  useEffect(() => {
    const onVis = () => setIsTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    const onFocus = () => setIsTabVisible(true);
    const onBlur = () => setIsTabVisible(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Reset page when filters/search/tab/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [apiTab, appliedSearch, apiSort, appliedRoomType, appliedVisibility, appliedActivity, appliedLanguage]);

  // Build query params: created vs bookmark differences
  const queryParams = useMemo(() => {
    const base = {
      tab: apiTab,
      search: appliedSearch.trim() || undefined,
      sort: apiSort,
      page: currentPage,
      pageSize,
    };
    if (apiTab === "bookmark") {
      // bookmark: only search/activity/language/sort
      return {
        ...base,
        activity: appliedActivity !== "All" ? appliedActivity : undefined,
        language: appliedLanguage !== "All" ? appliedLanguage : undefined,
      };
    }
    // created: full filters
    return {
      ...base,
      roomType: appliedRoomType !== "All" ? appliedRoomType : undefined,
      visibility: appliedVisibility !== "All" ? appliedVisibility : undefined,
      activity: appliedActivity !== "All" ? appliedActivity : undefined,
      language: appliedLanguage !== "All" ? appliedLanguage : undefined,
    };
  }, [apiTab, appliedSearch, apiSort, currentPage, appliedRoomType, appliedVisibility, appliedActivity, appliedLanguage]);

  // API Hooks with polling 15s only when visible
  const {
    data: myRoomsResponse,
    isLoading: isMyRoomsLoading,
    isError: isMyRoomsError,
    error: myRoomsError,
    refetch: refetchMyRooms,
  } = useGetMyRoomsQuery(queryParams, {
    pollingInterval: isTabVisible ? 15000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: customRoomsData } = useGetMyCustomRoomsQuery();

  const [deleteCustomRoom, { isLoading: isDeleting }] =
    useDeleteCustomRoomMutation();

  const [toggleBookmark] = useToggleBookmarkRoomMutation();

  const isLoading = isMyRoomsLoading && !myRoomsResponse;

  // Extract room list from getMyRooms response (paginated)
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
    // Fallback for customRooms endpoint shape (should not happen for paged)
    if (apiTab === "created" && Array.isArray(customRoomsData?.customRooms)) {
      return customRoomsData.customRooms;
    }
    return [];
  }, [myRoomsResponse, apiTab, customRoomsData]);

  const totalCount = myRoomsResponse?.data?.totalCount ?? myRoomsResponse?.totalCount ?? rawTargetRooms.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Quota for custom rooms
  const quota = {
    used:
      customRoomsData?.currentCustomRoomsCount ??
      myRoomsResponse?.data?.totalCount ??
      rawTargetRooms.length,
    max: limits.maxActiveCustomRooms,
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
        toast.success(res?.message || t.rooms?.bookmarkUpdated || "Đã cập nhật danh sách phòng đã lưu");
        refetchMyRooms();
      } catch (err) {
        console.error("Failed to toggle bookmark:", err);
        toast.error(err?.data?.message || t.rooms?.bookmarkUpdateError || "Không thể thay đổi lưu phòng");
      }
    },
    [toggleBookmark, refetchMyRooms, t.rooms?.bookmarkUpdated, t.rooms?.bookmarkUpdateError],
  );

  // Filter & Sort Application — new server-side filters
  const handleApplyFilter = useCallback((filters) => {
    // filters: { roomType, visibility, activity, language }
    if (filters.roomType !== undefined) setAppliedRoomType(filters.roomType);
    if (filters.visibility !== undefined) setAppliedVisibility(filters.visibility);
    if (filters.activity !== undefined) setAppliedActivity(filters.activity);
    if (filters.language !== undefined) setAppliedLanguage(filters.language);
  }, []);

  const handleApplySort = useCallback((field, order) => {
    setAppliedSortField(field);
    setAppliedSortOrder(order);
  }, []);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (apiTab === "created") {
      if (appliedRoomType !== "All") c++;
      if (appliedVisibility !== "All") c++;
    }
    if (appliedActivity !== "All") c++;
    if (appliedLanguage !== "All") c++;
    return c;
  }, [apiTab, appliedRoomType, appliedVisibility, appliedActivity, appliedLanguage]);

  // No client-side filtering — server already filtered. Keep raw list.
  const displayedRooms = rawTargetRooms;

  // Toast on error with retry
  useEffect(() => {
    if (isMyRoomsError) {
      toast.error(myRoomsError?.data?.message || t.rooms?.loadError || "Không thể tải danh sách phòng. Vui lòng thử lại.");
    }
  }, [isMyRoomsError, myRoomsError, t.rooms?.loadError]);

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
        activeTab={apiTab}
        selectedRoomType={appliedRoomType}
        selectedVisibility={appliedVisibility}
        selectedActivity={appliedActivity}
        selectedLanguage={appliedLanguage}
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
                    t.rooms?.searchPlaceholder || "Tìm kiếm theo tên phòng, chủ đề..."
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
                  title={t.rooms?.filters?.filterTooltip || t.rooms?.filters?.filterModalTitle || t.rooms?.filters?.title || "Bộ lọc"}
                >
                  <SlidersHorizontal size={18} strokeWidth={2} />
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
                  title={t.rooms?.sortTooltip || t.rooms?.sortTitle || "Sắp xếp"}
                >
                  <ArrowUpDown size={18} strokeWidth={2} />
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
            ) : isMyRoomsError ? (
              <div className="flex flex-col items-center justify-center p-10 border border-dashed border-border rounded-2xl bg-gray-50/50 my-4">
                <p className="text-sm text-gray-600 mb-4">{t.rooms?.loadError || "Không thể tải danh sách phòng. Vui lòng thử lại."}</p>
                <button
                  onClick={() => refetchMyRooms()}
                  className="bg-cath-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cath-red-600 transition-colors text-sm shadow"
                >
                  {t.rooms?.retry || "Thử lại"}
                </button>
              </div>
            ) : displayedRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 border border-dashed border-border rounded-2xl bg-gray-50/50 my-4">
                {activeTab === "created" ? (
                  <Crown size={48} className="text-gray-300 mb-3" />
                ) : (
                  <Bookmark size={48} className="text-gray-300 mb-3" />
                )}

                <h3 className="font-bold text-gray-700 mb-1 text-center">
                  {appliedSearch || activeFilterCount > 0
                    ? t.rooms?.noSearchResults || "Không tìm thấy kết quả phù hợp"
                    : activeTab === "created"
                      ? ct.noRooms || "Bạn chưa có phòng nào"
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {displayedRooms.map((room) => (
                    <RoomCard
                      key={room.id || room.roomId}
                      room={room}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40"
                    >
                      {t.rooms?.pagination?.prev || "Trước"}
                    </button>
                    <span className="text-sm text-gray-600">
                      {(t.rooms?.pagination?.pageOf || "Trang {page} / {totalPages}")
                        .replace("{page}", currentPage)
                        .replace("{totalPages}", totalPages)} {activeTab !== "bookmark" && `(${totalCount} ${t.rooms?.filters?.room || "phòng"})`}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40"
                    >
                      {t.rooms?.pagination?.next || "Tiếp"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {displayedRooms.map((room) => (
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40"
                    >
                      {t.rooms?.pagination?.prev || "Trước"}
                    </button>
                    <span className="text-sm text-gray-600">
                      {(t.rooms?.pagination?.pageOf || "Trang {page} / {totalPages}")
                        .replace("{page}", currentPage)
                        .replace("{totalPages}", totalPages)} ({totalCount} {t.rooms?.filters?.room || "phòng"})
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40"
                    >
                      {t.rooms?.pagination?.next || "Tiếp"}
                    </button>
                  </div>
                )}
              </>
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
