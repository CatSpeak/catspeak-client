import React, { useState } from "react"
import { Globe, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useShareStudentClassMutation } from "@/store/api/coursesApi"
import Modal from "@/shared/components/ui/Modal"
import Switch from "@/shared/components/ui/inputs/Switch"
import { PillButton } from "@/shared/components/ui/buttons"

const ShareCompletedClassModal = ({
  open,
  onClose,
  classItem,
  onToggleShare,
}) => {
  const { t } = useLanguage()
  const cc = t?.profile?.completedClass || {}

  const [shareStudentClass] = useShareStudentClassMutation()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!classItem) return null

  const isShared = Boolean(classItem.isShared)

  const handleToggle = async (e) => {
    e?.stopPropagation?.()
    if (!classItem?.id || isUpdating) return

    if (onToggleShare) {
      return onToggleShare(e, classItem)
    }

    const nextShared = !isShared
    try {
      setIsUpdating(true)
      await shareStudentClass({
        classId: classItem.id,
        isShared: nextShared,
      }).unwrap()
    } catch (err) {
      console.error("Failed to toggle completed class share:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleShareToPost = () => {
    toast(cc.featureInDev || "Tính năng đang được phát triển!")
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cc.shareAchievement || "Chia sẻ thành tích"}
      className="max-w-md"
      fullScreenOnMobile={false}
      bodyClassName="px-4 sm:px-6 py-0 flex-1 overflow-y-auto"
      footer={
        <div className="w-full">
          <PillButton
            variant="primary"
            onClick={handleShareToPost}
            className="w-full"
          >
            {cc.shareToPost || "Chia sẻ lên bài viết"}
          </PillButton>
        </div>
      }
    >
      {/* Profile Visibility Switch Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            {isShared ? (
              <Globe className="shrink-0 text-emerald-600" />
            ) : (
              <Lock className="shrink-0 text-gray-400" />
            )}

            <div className="flex flex-col">
              <span>{cc.allowProfileSharing || "Hiển thị trên hồ sơ"}</span>
              <span className="text-sm text-secondary">
                {isShared
                  ? cc.allowProfileSharingDesc || "Công khai trên hồ sơ của bạn"
                  : cc.allowProfileSharingDescOff || "Đã ẩn khỏi hồ sơ của bạn"}
              </span>
            </div>
          </div>
        </div>

        <Switch
          size="md"
          checked={isShared}
          disabled={isUpdating}
          onChange={handleToggle}
        />
      </div>
    </Modal>
  )
}

export default ShareCompletedClassModal
