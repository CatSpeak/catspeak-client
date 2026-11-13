import React, { useState, useEffect, useMemo } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import Label from "@/shared/components/ui/Label"

const EMPTY_FILTER = { accountType: "all", level: "" }

const ProfileFriendsFilterModal = ({
  open,
  isOpen,
  onClose,
  initialFilters = EMPTY_FILTER,
  onApply,
  onClear,
}) => {
  const { t } = useLanguage()
  const isModalOpen = open ?? isOpen
  const [draft, setDraft] = useState({
    accountType: initialFilters?.accountType || "all",
    level: initialFilters?.level || "",
  })

  useEffect(() => {
    if (isModalOpen) {
      setDraft({
        accountType: initialFilters?.accountType || "all",
        level: initialFilters?.level || "",
      })
    }
  }, [isModalOpen, initialFilters])

  const handleApply = () => {
    onApply?.(draft)
    onClose?.()
  }

  const handleClear = () => {
    const cleared = { accountType: "all", level: "" }
    setDraft(cleared)
    onClear ? onClear() : onApply?.(cleared)
    onClose?.()
  }

  const roleOptions = useMemo(
    () => [
      { value: "all", label: t.profile?.friends?.allRoles || "Tất cả" },
      { value: "teacher", label: t.profile?.friends?.teacher || "Giảng viên" },
      { value: "student", label: t.profile?.friends?.member || "Thành viên" },
    ],
    [t],
  )

  return (
    <Modal
      open={isModalOpen}
      onClose={onClose}
      title={t.profile?.friends?.filterTitle || "Lọc bạn bè"}
      fullScreenOnMobile={false}
      bodyClassName="flex flex-col gap-4"
      footer={
        <div className="flex items-center gap-2">
          <PillButton
            variant="secondary"
            className="flex-1"
            onClick={handleClear}
          >
            {t.profile?.friends?.clearFilter || "Xóa lọc"}
          </PillButton>
          <PillButton
            variant="primary"
            className="flex-1"
            onClick={handleApply}
          >
            {t.profile?.friends?.applyFilter || "Áp dụng"}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-1">
        <Label>{t.profile?.friends?.accountType || "Vai trò"}</Label>
        <Dropdown
          options={roleOptions}
          value={draft.accountType || "all"}
          onChange={(val) => setDraft((d) => ({ ...d, accountType: val }))}
          fullWidth
          roundedClass="rounded"
          triggerClassName="h-14 min-h-[56px] text-base"
        />
      </div>

      <TextInput
        label="Level"
        placeholder="vd: N5, N4..."
        value={draft.level || ""}
        onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))}
        variant="square"
      />
    </Modal>
  )
}

export default ProfileFriendsFilterModal
