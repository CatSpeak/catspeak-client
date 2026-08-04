import React, { useState, useMemo, useCallback } from "react"
import { useNavigate, useParams, Outlet } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import {
  Crown,
  Bookmark,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  DoorOpen,
} from "lucide-react"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PageTitle from "@/shared/components/ui/PageTitle"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { PlanRequiredState } from "@/shared/components/ui/indicators"
import { toast } from "react-hot-toast"
import {
  useGetMyCustomRoomsQuery,
  useDeleteCustomRoomMutation,
} from "@/store/api/roomsApi"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import CreateRoomModal from "../components/CreateRoomModal"
import EditRoomModal from "../components/EditRoomModal"
import CustomRoomCard from "../components/CustomRoomCard"
import WorkspaceRoomFilterModal from "../components/WorkspaceRoomFilterModal"
import WorkspaceRoomSortModal from "../components/WorkspaceRoomSortModal"

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

const WorkspaceRoomsContent = () => {
  const { t } = useLanguage()
  const { lang, id } = useParams()
  const navigate = useNavigate()
  const ct = t.rooms?.customRooms || {}
  const { limits, isLoading: isPlanLoading } = usePlanFeatures()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"

  // Tab State
  const [activeTab, setActiveTab] = useState("created")

  // API Hooks
  const { data: customRoomsData, isLoading } = useGetMyCustomRoomsQuery()
  const [deleteCustomRoom, { isLoading: isDeleting }] =
    useDeleteCustomRoomMutation()

  const rawCustomRooms = useMemo(
    () => customRoomsData?.customRooms || [],
    [customRoomsData]
  )
  const quota = {
    used: customRoomsData?.currentCustomRoomsCount ?? 0,
    max: customRoomsData?.maxCustomRooms ?? 3,
  }
  const isQuotaFull = customRoomsData?.canCreateCustomRoom === false

  // Temporary bookmarked rooms data source (same API for now as requested)
  const rawBookmarkedRooms = useMemo(() => [], [])

  // Modals & Card Interaction States
  const [copiedId, setCopiedId] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Search, Filter & Sort States
  const [searchInputValue, setSearchInputValue] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [appliedLevels, setAppliedLevels] = useState([])
  const [appliedTopics, setAppliedTopics] = useState([])
  const [appliedSortField, setAppliedSortField] = useState("createdAt")
  const [appliedSortOrder, setAppliedSortOrder] = useState("desc")

  // Tab definition
  const tabs = useMemo(
    () => [
      {
        id: "created",
        label: t.rooms?.workspace?.createdRooms || "Phòng đã tạo",
        icon: DoorOpen,
      },
      {
        id: "bookmarked",
        label: t.rooms?.workspace?.bookmarkedRooms || "Phòng đã lưu",
        icon: Bookmark,
      },
    ],
    [t]
  )

  // Handle Search trigger
  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInputValue)
  }, [searchInputValue])

  // Handle Search Input Change with instant reset if cleared
  const handleSearchInputChange = useCallback((val) => {
    setSearchInputValue(val)
    if (val === "") {
      setAppliedSearch("")
    }
  }, [])

  // Action handlers
  const handleCopyLink = useCallback(
    (roomId) => {
      const link = `${window.location.origin}/${supportedLangCode}/meet/${roomId}`
      navigator.clipboard.writeText(link)
      setCopiedId(roomId)
      toast.success(ct.linkCopied || "Link copied!")
      setTimeout(() => setCopiedId(null), 2000)
    },
    [supportedLangCode, ct.linkCopied]
  )

  const handleJoinRoom = useCallback(
    (roomId) => {
      navigate(`/${supportedLangCode}/meet/${roomId}`)
    },
    [navigate, supportedLangCode]
  )

  const handleEditRoom = useCallback((room) => {
    setEditingRoom(room)
  }, [])

  const handleDelete = useCallback(
    async (roomId) => {
      try {
        await deleteCustomRoom(roomId).unwrap()
        toast.success(ct.deleteSuccess || "Đã xóa phòng thành công")
      } catch (err) {
        console.error("Failed to delete custom room:", err)
        toast.error(err?.data?.message || "Failed to delete room")
      }
    },
    [deleteCustomRoom, ct.deleteSuccess]
  )

  // Filter & Sort Application
  const handleApplyFilter = useCallback((levels, topics) => {
    setAppliedLevels(levels)
    setAppliedTopics(topics)
  }, [])

  const handleApplySort = useCallback((field, order) => {
    setAppliedSortField(field)
    setAppliedSortOrder(order)
  }, [])

  const activeFilterCount = appliedLevels.length + appliedTopics.length

  // Target rooms array according to active tab
  const rawTargetRooms = activeTab === "created" ? rawCustomRooms : rawBookmarkedRooms

  // Client-side filtering & sorting
  const filteredAndSortedRooms = useMemo(() => {
    let list = [...rawTargetRooms]

    // 1. Approximate case-insensitive search by room name
    if (appliedSearch.trim()) {
      const query = appliedSearch.trim().toLowerCase()
      list = list.filter((room) =>
        (room.name || "").toLowerCase().includes(query)
      )
    }

    // 2. Filter by Level
    if (appliedLevels.length > 0) {
      list = list.filter(
        (room) =>
          room.requiredLevel && appliedLevels.includes(room.requiredLevel)
      )
    }

    // 3. Filter by Topic
    if (appliedTopics.length > 0) {
      list = list.filter((room) => {
        const topicsList = Array.isArray(room.topics)
          ? room.topics
          : room.topic
            ? [room.topic]
            : []
        return topicsList.some((tp) => appliedTopics.includes(tp))
      })
    }

    // 4. Sort by selected column attribute
    if (appliedSortField) {
      list.sort((a, b) => {
        let valA = a[appliedSortField]
        let valB = b[appliedSortField]

        if (appliedSortField === "name") {
          valA = (valA || "").toLowerCase()
          valB = (valB || "").toLowerCase()
          const cmp = valA.localeCompare(valB)
          return appliedSortOrder === "asc" ? cmp : -cmp
        }

        if (appliedSortField === "createdAt") {
          valA = valA ? new Date(valA).getTime() : 0
          valB = valB ? new Date(valB).getTime() : 0
        } else {
          valA = Number(valA) || 0
          valB = Number(valB) || 0
        }

        if (valA < valB) return appliedSortOrder === "asc" ? -1 : 1
        if (valA > valB) return appliedSortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    return list
  }, [
    rawTargetRooms,
    appliedSearch,
    appliedLevels,
    appliedTopics,
    appliedSortField,
    appliedSortOrder,
  ])

  if (!isPlanLoading && !limits.allowCustomRooms) {
    return (
      <PlanRequiredState
        pageTitle={ct.myRoomsTitle || "My Custom Rooms"}
        subtext="Custom rooms allow you to create persistent, customizable rooms for your community. Upgrade to CatSpeak Pro to unlock custom rooms!"
        featureName="Custom Rooms"
        animationKey="custom-rooms-pro-required"
      />
    )
  }

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
            <div className="flex justify-between items-center border-b border-gray-200 mb-4">
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
                  className="h-12 border-[#e5e5e5]"
                />
              </div>

              {/* Right Side Buttons: Filter, Sort, "Tìm kiếm" */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {/* Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="relative flex items-center justify-center h-12 px-4 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 font-medium transition-colors shrink-0 gap-2 text-sm"
                  title={t.rooms?.filters?.title || "Bộ lọc"}
                >
                  <SlidersHorizontal size={18} strokeWidth={2} />
                  <span className="hidden sm:inline">
                    {t.rooms?.filters?.title || "Bộ lọc"}
                  </span>
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
                  className="relative flex items-center justify-center h-12 px-4 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 font-medium transition-colors shrink-0 gap-2 text-sm"
                  title={t.rooms?.sortTitle || "Sắp xếp"}
                >
                  <ArrowUpDown size={18} strokeWidth={2} />
                  <span className="hidden sm:inline">
                    {t.rooms?.sortTitle || "Sắp xếp"}
                  </span>
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
              <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 my-4">
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
                      : t.rooms?.noBookmarkedRooms || "Chưa có phòng nào được lưu"}
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
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {filteredAndSortedRooms.map((room) => (
                  <CustomRoomCard
                    key={room.id || room.roomId}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDelete}
                    onCopyLink={handleCopyLink}
                    onJoin={handleJoinRoom}
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
  )
}

const RoomsListSkeleton = () => (
  <div className="flex flex-col gap-4 w-full">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-2xl border border-[#e5e5e5] p-5 animate-pulse"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-100 rounded-full w-16" />
              <div className="h-5 bg-gray-100 rounded-full w-14" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const WorkspaceRoomsPage = () => {
  return <WorkspaceRoomsContent />
}

export default WorkspaceRoomsPage
