import React from "react"
import { Pencil } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"

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
    <FluentCard className="flex flex-col w-full h-full p-6 sm:p-8 gap-8 border-border rounded-xl shadow-sm !justify-start">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t.profile?.personalInfo?.title || "Thông tin cá nhân"}
          </h2>
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
              <button
                onClick={onCancel}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.cancel || "Hủy"}
              </button>
              <button
                onClick={() => onSave("personalInfo")}
                className="px-4 py-1.5 rounded-full bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.save || "Lưu"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.username || "Tên đăng nhập"}
            </label>
            <TextInput
              name="username"
              value={formData.username}
              onChange={onChange}
              disabled={!isEditing || isUpdating}
              placeholder={t.profile?.personalInfo?.enterUsername || "Nhập tên đăng nhập..."}
              error={errors?.username}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.username ? "border-red-500" : "border-border"}`}
              containerClassName="!gap-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.nickname || "Biệt danh"}
            </label>
            <TextInput
              name="nickname"
              value={formData.nickname}
              onChange={onChange}
              disabled={!isEditing || isUpdating}
              placeholder={t.profile?.personalInfo?.enterNickname || "Nhập biệt danh..."}
              error={errors?.nickname}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.nickname ? "border-red-500" : "border-border"}`}
              containerClassName="!gap-0"
            />
          </div>
        </div>
      </div>
    </FluentCard>
  )
}

export default AccountCredentialsForm
