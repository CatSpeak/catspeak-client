import React from "react"
import { Pencil } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Label from "@/shared/components/ui/Label"

const AccountCredentialsForm = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  errors,
  t,
}) => {
  const isEditing = editingField === "personalInfo"

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
        {t.profile?.personalInfo?.title || "Thông tin cá nhân"}
      </h2>

      <FluentCard className="flex flex-col w-full p-4 gap-4 border-border rounded-xl !justify-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            {!isEditing ? (
              <PillButton
                onClick={() => onEdit("personalInfo")}
                variant="outline"
                startIcon={<Pencil size={18} />}
              >
                {t.profile?.personalInfo?.edit || "Sửa"}
              </PillButton>
            ) : (
              <div className="flex items-center gap-2">
                <PillButton
                  onClick={onCancel}
                  variant="secondary"
                  disabled={isUpdating}
                >
                  {t.profile?.personalInfo?.cancel || "Hủy"}
                </PillButton>

                <PillButton
                  onClick={() => onSave("personalInfo")}
                  variant="primary"
                  disabled={isUpdating}
                  loading={isUpdating}
                  loadingText={t.profile?.personalInfo?.saving || "Đang lưu..."}
                >
                  {t.profile?.personalInfo?.save || "Lưu"}
                </PillButton>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>
                {t.profile?.personalInfo?.username || "Tên đăng nhập"}
              </Label>
              <TextInput
                name="username"
                value={formData.username}
                onChange={onChange}
                disabled={!isEditing || isUpdating}
                placeholder={
                  t.profile?.personalInfo?.enterUsername ||
                  "Nhập tên đăng nhập..."
                }
                error={errors?.username}
                className={`!rounded bg-gray-50/50 dark:bg-[#242424] border px-3 ${
                  errors?.username
                    ? "border-red-500"
                    : "border-border dark:border-[#3F3F3F]"
                }`}
                containerClassName="!gap-0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>{t.profile?.personalInfo?.nickname || "Biệt danh"}</Label>
              <TextInput
                name="nickname"
                value={formData.nickname}
                onChange={onChange}
                disabled={!isEditing || isUpdating}
                placeholder={
                  t.profile?.personalInfo?.enterNickname || "Nhập biệt danh..."
                }
                error={errors?.nickname}
                className={`!rounded bg-gray-50/50 dark:bg-[#242424] border px-3 ${
                  errors?.nickname
                    ? "border-red-500"
                    : "border-border dark:border-[#3F3F3F]"
                }`}
                containerClassName="!gap-0"
              />
            </div>
          </div>
        </div>
      </FluentCard>
    </div>
  )
}

export default AccountCredentialsForm
