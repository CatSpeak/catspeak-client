import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import {
  Crown,
  Users,
  Zap,
  Copy,
  Check,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  X,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import TopicSelect from "../components/ui/TopicSelect"
import LevelSelector from "../components/ui/LevelSelector"
import Switch from "@/shared/components/ui/inputs/Switch"
import Modal from "@/shared/components/ui/Modal"
import { TOPICS, LEVELS } from "../config/constants"
import { toast } from "react-hot-toast"
import {
  useGetMyCustomRoomsQuery,
  useUpdateCustomRoomMutation,
  useDeleteCustomRoomMutation,
} from "@/store/api/roomsApi"
import CreateCustomRoomModal from "../components/CreateCustomRoomModal"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh": return "Chinese"
    case "vi": return "Vietnamese"
    case "en": return "English"
    default: return "English"
  }
}

const CustomRoomsPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const ct = t.rooms?.customRooms || {}

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  // API hooks
  const { data: customRoomsData, isLoading } = useGetMyCustomRoomsQuery()
  const [updateCustomRoom, { isLoading: isUpdating }] = useUpdateCustomRoomMutation()
  const [deleteCustomRoom, { isLoading: isDeleting }] = useDeleteCustomRoomMutation()

  const customRooms = customRoomsData?.rooms || customRoomsData?.data || []
  const quota = customRoomsData?.quota || { used: customRooms.length, max: 3 }
  const isQuotaFull = quota.used >= quota.max

  // Local state
  const [copiedId, setCopiedId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })

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
    setEditFormData({
      name: room.name || "",
      description: room.description || "",
      topics: room.topics || [],
      selectedLevel: room.requiredLevel || "",
      isPrivate: room.isPrivate || room.privacy === "Private",
      password: "",
    })
  }

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditTopicChange = (event) => {
    const newValue = event.target ? event.target.value : event
    if (Array.isArray(newValue) && newValue.length <= 3) {
      handleEditChange("topics", newValue)
    }
  }

  const handleUpdate = async () => {
    if (!editingRoom || !editFormData.name.trim()) return

    try {
      const body = {
        id: editingRoom.id || editingRoom.roomId,
        name: editFormData.name,
        description: editFormData.description,
        languageType: selectedLanguage,
        requiredLevel: editFormData.selectedLevel || undefined,
        topics: editFormData.topics.length > 0 ? editFormData.topics : ["Other"],
        isPrivate: editFormData.isPrivate,
        password: editFormData.isPrivate ? editFormData.password : undefined,
      }

      await updateCustomRoom(body).unwrap()
      toast.success(ct.updateSuccess || "Room updated successfully")
      setEditingRoom(null)
    } catch (err) {
      console.error("Failed to update custom room:", err)
      toast.error(err?.data?.message || "Failed to update room")
    }
  }

  const handleDelete = async (roomId) => {
    try {
      await deleteCustomRoom(roomId).unwrap()
      toast.success(ct.deleteSuccess || "Room deleted successfully")
      setDeleteConfirmId(null)
    } catch (err) {
      console.error("Failed to delete custom room:", err)
      toast.error(err?.data?.message || "Failed to delete room")
    }
  }

  const isEditDisabled =
    !editFormData.name.trim() ||
    isUpdating ||
    (editFormData.isPrivate && !editFormData.password.trim())

  return (
    <>
      <CreateCustomRoomModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        open={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        formData={editFormData}
        handleChange={handleEditChange}
        handleTopicChange={handleEditTopicChange}
        selectedLanguage={selectedLanguage}
        onSave={handleUpdate}
        isUpdating={isUpdating}
        isDisabled={isEditDisabled}
        ct={ct}
        t={t}
      />

      <AnimatePresence mode="wait">
        <FluentAnimation
          animationKey="custom-rooms-page"
          direction="up"
          className="w-full"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-200/50">
                <Crown size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {ct.myRoomsTitle || "My Custom Rooms"}
                </h1>
                <QuotaBar quota={quota} ct={ct} />
              </div>
            </div>

            <PillButton
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isQuotaFull}
              startIcon={<Plus size={18} />}
              className="h-12"
            >
              {ct.create || "Create Room"}
            </PillButton>
          </div>

          {/* Pro Features Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 text-amber-700 text-sm font-medium border border-amber-200/60">
              <Users size={14} />
              {ct.capacity || "Capacity: 100 participants"}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 text-emerald-700 text-sm font-medium border border-emerald-200/60">
              <Zap size={14} />
              {ct.persistent || "Persistent Room"}
            </div>
          </div>

          {/* Room List */}
          {isLoading ? (
            <RoomsListSkeleton />
          ) : customRooms.length === 0 ? (
            <EmptyState ct={ct} onCreateClick={() => setIsCreateModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {customRooms.map((room) => (
                <RoomCard
                  key={room.id || room.roomId}
                  room={room}
                  onEdit={handleEditRoom}
                  onDelete={handleDelete}
                  onCopyLink={handleCopyLink}
                  onJoin={handleJoinRoom}
                  copiedId={copiedId}
                  deleteConfirmId={deleteConfirmId}
                  setDeleteConfirmId={setDeleteConfirmId}
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

const QuotaBar = ({ quota, ct }) => {
  const isFull = quota.used >= quota.max
  const percent = quota.max > 0 ? (quota.used / quota.max) * 100 : 0

  return (
    <div className="flex items-center gap-3 mt-1">
      <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isFull ? "bg-red-400" : percent > 60 ? "bg-amber-500" : "bg-emerald-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-medium ${isFull ? "text-red-500" : "text-[#606060]"}`}>
        {(ct.quota || "{{used}}/{{max}} rooms used")
          .replace("{{used}}", quota.used)
          .replace("{{max}}", quota.max)}
      </span>
    </div>
  )
}

const RoomsListSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-[#e5e5e5] p-5 animate-pulse">
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

const EmptyState = ({ ct, onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 mb-6 shadow-lg shadow-amber-100/50">
      <Crown size={36} className="text-amber-600" />
    </div>
    <p className="text-xl font-semibold text-gray-800 mb-2">
      {ct.noRooms || "You haven't created any custom rooms yet"}
    </p>
    <p className="text-sm text-[#606060] max-w-[360px] mb-6">
      {ct.noRoomsSubtext || "Create your first persistent room with up to 100 participants!"}
    </p>
    <PillButton
      onClick={onCreateClick}
      startIcon={<Plus size={18} />}
      className="h-12"
    >
      {ct.create || "Create Room"}
    </PillButton>
  </motion.div>
)

const RoomCard = ({
  room,
  onEdit,
  onDelete,
  onCopyLink,
  onJoin,
  copiedId,
  deleteConfirmId,
  setDeleteConfirmId,
  isDeleting,
  ct,
}) => {
  const roomId = room.id || room.roomId
  const isConfirmingDelete = deleteConfirmId === roomId
  const isCopied = copiedId === roomId

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative flex flex-col p-5 rounded-2xl border border-[#e5e5e5] hover:border-[#d0d0d0] transition-all hover:shadow-md bg-white"
    >
      <div className="flex items-start gap-4">
        {/* Room icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cath-red-700/10 to-cath-red-700/5 shrink-0">
          <Users size={20} className="text-cath-red-700" />
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold truncate">{room.name}</h3>
            {(room.isPrivate || room.privacy === "Private") && (
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">
                Private
              </span>
            )}
          </div>
          {room.description && (
            <p className="text-sm text-[#606060] mt-1 line-clamp-2">{room.description}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {room.topics?.map((topic) => (
          <span
            key={topic}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f5f5f5] text-[#606060]"
          >
            {topic}
          </span>
        ))}
        {room.languageType && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            {room.languageType}
          </span>
        )}
        {room.requiredLevel && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">
            {room.requiredLevel}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f0f0f0]">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-red-500 flex-1">
              {ct.deleteConfirm || "Are you sure?"}
            </span>
            <PillButton
              onClick={() => onDelete(roomId)}
              loading={isDeleting}
              className="h-9 !text-xs"
              bgColor="#ef4444"
            >
              {ct.delete || "Delete"}
            </PillButton>
            <PillButton
              onClick={() => setDeleteConfirmId(null)}
              variant="secondary"
              className="h-9 !text-xs"
            >
              Cancel
            </PillButton>
          </div>
        ) : (
          <>
            <PillButton
              onClick={() => onJoin(roomId)}
              className="h-9 !text-xs"
              startIcon={<ExternalLink size={14} />}
            >
              {ct.join || "Join"}
            </PillButton>
            <button
              onClick={() => onCopyLink(roomId)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
              title={ct.copyLink || "Copy Link"}
            >
              {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={() => onEdit(room)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#f3f3f3] text-[#606060] transition-colors"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirmId(roomId)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-red-50 text-red-400 transition-colors"
              title={ct.delete || "Delete"}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

const EditRoomModal = ({
  open,
  onClose,
  formData,
  handleChange,
  handleTopicChange,
  selectedLanguage,
  onSave,
  isUpdating,
  isDisabled,
  ct,
  t,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={null}
    showCloseButton={false}
    className="max-w-sm sm:max-w-[850px] w-full max-sm:!fixed max-sm:!inset-0 max-sm:!m-0 max-sm:!max-w-none max-sm:!h-full max-sm:!w-full max-sm:!rounded-none max-sm:flex max-sm:flex-col sm:rounded-3xl"
    bodyClassName="flex flex-col flex-1 overflow-hidden"
  >
    {/* Header */}
    <div className="flex items-center justify-between p-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
          <Pencil size={18} className="text-white" />
        </div>
        <h2 className="text-[28px] font-medium leading-tight">
          {ct.editTitle || "Edit Custom Room"}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="flex shrink-0 items-center justify-center h-12 w-12 hover:bg-[#E5E5E5] rounded-full transition-colors"
      >
        <X size={24} />
      </button>
    </div>

    {/* Form */}
    <div className={`flex flex-col gap-6 max-h-[50vh] overflow-y-auto px-6 py-6 max-sm:max-h-none max-sm:flex-1 ${scrollbarClasses}`}>
      <TextInput
        id="edit-room-name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        label={ct.roomName || "Room Name"}
        placeholder={ct.roomNamePlaceholder || "e.g. My Study Group"}
        autoFocus
        autoComplete="off"
        containerClassName="gap-3"
        labelClassName="text-base"
        className="!h-12 !text-base !px-4 min-h-[48px]"
      />

      <TextInput
        id="edit-room-description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        label={ct.description || "Description"}
        placeholder={ct.descriptionPlaceholder || "What's this room about?"}
        autoComplete="off"
        multiline
        containerClassName="gap-3"
        labelClassName="text-base"
        className="!text-base !px-4 min-h-[48px]"
        maxLength={200}
        showCount
      />

      {/* Private room toggle */}
      <div className="flex items-center justify-between">
        <span className="text-base">
          {t.rooms?.createRoom?.privateRoom || "Private Room"}
        </span>
        <Switch
          checked={formData.isPrivate}
          onChange={(e) => {
            handleChange("isPrivate", e.target.checked)
            if (!e.target.checked) handleChange("password", "")
          }}
        />
      </div>

      {formData.isPrivate && (
        <TextInput
          id="edit-room-password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          label={t.rooms?.createRoom?.passwordLabel || "Password"}
          placeholder={t.rooms?.createRoom?.passwordPlaceholder || "Enter room password"}
          autoComplete="new-password"
          containerClassName="gap-3"
          labelClassName="text-base"
          className="!h-12 !text-base !px-4 min-h-[48px]"
        />
      )}

      <TopicSelect
        value={formData.topics}
        onChange={handleTopicChange}
        options={TOPICS}
        t={t}
      />

      <LevelSelector
        selectedLevel={formData.selectedLevel}
        onSelect={(level) => handleChange("selectedLevel", level)}
        levels={LEVELS[selectedLanguage]}
        t={t}
      />
    </div>

    {/* Footer */}
    <div className="p-6 flex flex-wrap justify-end gap-4 shrink-0 border-t border-[#f0f0f0]">
      <PillButton
        onClick={onClose}
        variant="secondary"
        className="h-12 text-base max-sm:flex-1"
      >
        {t.back || "Back"}
      </PillButton>
      <PillButton
        onClick={onSave}
        className="h-12 text-base max-sm:flex-1"
        loading={isUpdating}
        loadingText={ct.saving || "Saving..."}
        disabled={isDisabled}
      >
        {ct.save || "Save Changes"}
      </PillButton>
    </div>
  </Modal>
)

export default CustomRoomsPage
