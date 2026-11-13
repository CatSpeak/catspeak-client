import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { SlidersHorizontal } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import Label from "@/shared/components/ui/Label"
import ChipFilter from "@/shared/components/ChipFilter"
import Dropdown from "@/shared/components/ui/Dropdown"

const ROOM_TYPES = ["All", "Temporary", "Custom"]
const VISIBILITIES = ["All", "Public", "Private"]
const ACTIVITIES = ["All", "InUse", "Empty"]
const LANGUAGES = ["All", "English", "Chinese", "Japanese", "Vietnamese"]

const WorkspaceRoomFilterModal = ({
  open,
  onClose,
  activeTab = "created",
  selectedRoomType = "All",
  selectedVisibility = "All",
  selectedActivity = "All",
  selectedLanguage = "All",
  onApply,
  // Legacy props for backward compatibility
  selectedLevels = [],
  selectedTopics = [],
}) => {
  const { t } = useLanguage()

  const [localRoomType, setLocalRoomType] = useState(selectedRoomType)
  const [localVisibility, setLocalVisibility] = useState(selectedVisibility)
  const [localActivity, setLocalActivity] = useState(selectedActivity)
  const [localLanguage, setLocalLanguage] = useState(selectedLanguage)

  useEffect(() => {
    if (open) {
      setLocalRoomType(selectedRoomType || "All")
      setLocalVisibility(selectedVisibility || "All")
      setLocalActivity(selectedActivity || "All")
      setLocalLanguage(selectedLanguage || "All")
    }
  }, [
    open,
    selectedRoomType,
    selectedVisibility,
    selectedActivity,
    selectedLanguage,
  ])

  const isBookmark = activeTab === "bookmark"

  const handleClear = () => {
    setLocalRoomType("All")
    setLocalVisibility("All")
    setLocalActivity("All")
    setLocalLanguage("All")
  }

  const handleApply = () => {
    onApply?.({
      roomType: localRoomType,
      visibility: localVisibility,
      activity: localActivity,
      language: localLanguage,
    })

    onClose()
  }

  const totalSelected =
    (localRoomType !== "All" ? 1 : 0) +
    (!isBookmark && localVisibility !== "All" ? 1 : 0) +
    (localActivity !== "All" ? 1 : 0) +
    (localLanguage !== "All" ? 1 : 0)

  const renderOptionGroup = (title, options, value, setter, labelMap) => (
    <section className="h-[56px] flex items-center justify-between gap-2">
      <p className="text-base">{title}</p>

      <Dropdown
        options={options.map((opt) => ({
          value: opt,
          label: labelMap?.[opt] || opt,
        }))}
        value={value}
        onChange={setter}
        fitContent
        placeholder="Select..."
      />
    </section>
  )

  const roomTypeLabels = {
    All: t.rooms?.filters?.roomTypes?.All || "Tất cả",
    Temporary: t.rooms?.filters?.roomTypes?.Temporary || "Tạm thời",
    Custom: t.rooms?.filters?.roomTypes?.Custom || "Tùy chỉnh",
  }

  const visibilityLabels = {
    All: t.rooms?.filters?.visibilities?.All || "Tất cả",
    Public: t.rooms?.filters?.visibilities?.Public || "Công khai",
    Private: t.rooms?.filters?.visibilities?.Private || "Riêng tư",
  }

  const activityLabels = {
    All: t.rooms?.filters?.activities?.All || "Tất cả",
    InUse: t.rooms?.filters?.activities?.InUse || "Đang diễn ra",
    Empty: t.rooms?.filters?.activities?.Empty || "Đang trống",
  }

  const languageLabels = {
    All: t.rooms?.filters?.languages?.All || "Tất cả",
    English: t.rooms?.filters?.languages?.English || "Tiếng Anh",
    Chinese: t.rooms?.filters?.languages?.Chinese || "Tiếng Trung",
    Japanese: t.rooms?.filters?.languages?.Japanese || "Tiếng Nhật",
    Vietnamese: t.rooms?.filters?.languages?.Vietnamese || "Tiếng Việt",
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        t.rooms?.filters?.filterModalTitle ||
        t.rooms?.filters?.title ||
        "Bộ lọc phòng"
      }
      showCloseButton
      fullScreenOnMobile
      className="sm:!max-w-[560px] sm:!max-h-[85vh]"
      footer={
        <div className="flex gap-2">
          <PillButton
            type="button"
            onClick={handleClear}
            variant="secondary"
            className="flex-1"
          >
            {t.rooms?.filters?.clearAll ||
              t.rooms?.filters?.clear ||
              "Xóa tất cả"}
          </PillButton>

          <PillButton
            type="button"
            onClick={handleApply}
            variant="primary"
            className="flex-1"
          >
            <span>{t.rooms?.filters?.apply || "Áp dụng"}</span>

            {totalSelected > 0 && (
              <span className="flex items-center justify-center bg-white/20 px-2 py-0.5 rounded-md text-[12px]">
                {totalSelected}
              </span>
            )}
          </PillButton>
        </div>
      }
    >
      {!isBookmark &&
        renderOptionGroup(
          t.rooms?.filters?.roomTypeLabel || "Loại phòng",
          ROOM_TYPES,
          localRoomType,
          setLocalRoomType,
          roomTypeLabels,
        )}

      {!isBookmark &&
        renderOptionGroup(
          t.rooms?.filters?.visibilityLabel || "Hiển thị",
          VISIBILITIES,
          localVisibility,
          setLocalVisibility,
          visibilityLabels,
        )}

      {renderOptionGroup(
        t.rooms?.filters?.activityLabel || "Hoạt động",
        ACTIVITIES,
        localActivity,
        setLocalActivity,
        activityLabels,
      )}

      {renderOptionGroup(
        t.rooms?.filters?.languageLabel || "Ngôn ngữ",
        LANGUAGES,
        localLanguage,
        setLocalLanguage,
        languageLabels,
      )}
    </Modal>
  )
}

export default WorkspaceRoomFilterModal
