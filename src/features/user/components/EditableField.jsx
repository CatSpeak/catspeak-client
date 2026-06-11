import React from "react"
import { Check, X, Pencil } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const EditableField = ({
  label,
  value,
  name,
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  editLabel,
  saveLabel = "Lưu",
  cancelLabel = "Hủy",
  error,
  helperText,
  customInput,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <span>{label}</span>

      {isEditing && customInput ? (
        <div className="w-full">{customInput}</div>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          disabled={!isEditing}
          className={`w-full h-12 rounded-2xl border px-4 focus:outline-none transition-colors duration-200 ${
            isEditing
              ? error
                ? "border-red-600 focus:border-red-600 bg-white"
                : "border-[#e2e2e2] focus:border-red-900 bg-white"
              : "border-[#e2e2e2] bg-gray-50 text-gray-500 cursor-not-allowed"
          }`}
        />
      )}

      {isEditing && helperText && !error && (
        <p className="text-xs text-[#606060]">{helperText}</p>
      )}
      {isEditing && error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <PillButton
              onClick={onCancel}
              disabled={isUpdating}
              variant="outline"
              startIcon={<X size={18} />}
            >
              {cancelLabel}
            </PillButton>
            <PillButton
              onClick={onSave}
              disabled={isUpdating}
              loading={isUpdating}
              variant="primary"
              bgColor="#16a34a"
              startIcon={!isUpdating && <Check size={18} />}
            >
              {saveLabel}
            </PillButton>
          </>
        ) : (
          <PillButton
            onClick={() => onEdit(name)}
            variant="outline"
            startIcon={<Pencil size={18} />}
          >
            {editLabel}
          </PillButton>
        )}
      </div>
    </div>
  )
}

export default EditableField
