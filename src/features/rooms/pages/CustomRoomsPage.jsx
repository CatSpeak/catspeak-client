import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import {
  Crown,
  Users,
  Copy,
  Check,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  X,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PageTitle from "@/shared/components/ui/PageTitle"
import { EmptyState } from "@/shared/components/ui/indicators"
import { toast } from "react-hot-toast"
import {
  useGetMyCustomRoomsQuery,
  useUpdateCustomRoomMutation,
  useDeleteCustomRoomMutation,
} from "@/store/api/roomsApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import CreateRoomModal from "../components/CreateRoomModal"
import EditRoomModal from "../components/EditRoomModal"
import CustomRoomCard from "../components/CustomRoomCard"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

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

const CustomRoomsPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const ct = t.rooms?.customRooms || {}
  const { isAuthenticated } = useAuth()

  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
  const userTier = profileResponse?.data?.tier?.toLowerCase()
  const isPro = userTier === "pro"

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  // API hooks
  const { data: customRoomsData, isLoading } = useGetMyCustomRoomsQuery()
  const [deleteCustomRoom, { isLoading: isDeleting }] =
    useDeleteCustomRoomMutation()

  const customRooms = customRoomsData?.customRooms || []
  const quota = {
    used: customRoomsData?.currentCustomRoomsCount ?? 0,
    max: customRoomsData?.maxCustomRooms ?? 3,
  }
  const isQuotaFull = customRoomsData?.canCreateCustomRoom === false

  // Local state
  const [copiedId, setCopiedId] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCopyLink = (roomId) => {
    const link = `${window.location.origin}/${supportedLangCode}/meet/${roomId}`
    navigator.clipboard.writeText(link)
    setCopiedId(roomId)
    toast.success(ct.linkCopied || "Link copied!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleJoinRoom = (roomId) => {
    navigate(`/${supportedLangCode}/meet/${roomId}`)
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
  }

  const handleDelete = async (roomId) => {
    try {
      await deleteCustomRoom(roomId).unwrap()
    } catch (err) {
      console.error("Failed to delete custom room:", err)
      toast.error(err?.data?.message || "Failed to delete room")
    }
  }

  const handleUpgradeNavigation = () => {
    navigate("/pricing", {
      state: { highlightPlan: "pro", featureName: "Custom Rooms" },
    })
  }

  if (!isLoadingProfile && !isPro) {
    return (
      <AnimatePresence mode="wait">
        <FluentAnimation
          animationKey="custom-rooms-pro-required"
          direction="up"
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <PageTitle>{ct.myRoomsTitle || "My Custom Rooms"}</PageTitle>
          </div>

          <EmptyState
            icon={Crown}
            iconClassName="w-12 h-12 mb-4 text-amber-500"
            title="Pro Plan Required"
            subtext="Custom rooms allow you to create persistent, customizable rooms for your community. Upgrade to CatSpeak Pro to unlock custom rooms!"
            action={
              <PillButton
                onClick={handleUpgradeNavigation}
                startIcon={<Crown size={18} />}
              >
                Upgrade to Pro
              </PillButton>
            }
            fullPage
          />
        </FluentAnimation>
      </AnimatePresence>
    )
  }

  return (
    <>
      <CreateRoomModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        initialMode="custom"
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        open={!!editingRoom}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
      />

      <AnimatePresence mode="wait">
        <FluentAnimation
          animationKey="custom-rooms-page"
          direction="up"
          className="w-full"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <PageTitle>{ct.myRoomsTitle || "My Custom Rooms"}</PageTitle>

            <PillButton
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isQuotaFull}
              startIcon={<Plus size={18} />}
              className="h-12"
            >
              {ct.create || "Create Room"}
            </PillButton>
          </div>

          {/* Room Quota Counter */}
          <p className="text-sm font-medium text-[#606060] mb-2 text-center sm:text-left">
            {(ct.quota || "{{used}}/{{max}} rooms used")
              .replace("{{used}}", quota.used)
              .replace("{{max}}", quota.max)}
          </p>

          {/* Room List */}
          {isLoading ? (
            <RoomsListSkeleton />
          ) : customRooms.length === 0 ? (
            <EmptyState
              icon={Crown}
              iconClassName="w-12 h-12 mb-4 text-amber-500"
              title={ct.noRooms || "You haven't created any custom rooms yet"}
              subtext={
                ct.noRoomsSubtext ||
                "Create your first persistent room with up to 100 participants!"
              }
              fullPage
            />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {customRooms.map((room) => (
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
    </>
  )
}

// --- Sub Components ---

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

export default CustomRoomsPage
