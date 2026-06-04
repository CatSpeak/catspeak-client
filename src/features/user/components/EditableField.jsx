import React from "react"
import { Check, X } from "lucide-react"

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
  error,
  customInput,
}) => {
  return (
    <div className="flex flex-col border-b border-gray-100 py-3">
      <div className="flex items-center justify-between w-full">
        <span className="w-32 font-bold text-gray-900">{label}</span>
        {isEditing ? (
          customInput ? (
            customInput
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              className={`flex-1 rounded border px-2 py-1 mr-4 focus:outline-none ${
                error ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-red-900"
              }`}
            />
          )
        ) : (
          <span className="flex-1 text-gray-600">{value}</span>
        )}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                disabled={isUpdating}
                className="font-bold text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center justify-center min-w-5 cursor-pointer"
              >
                {isUpdating ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
                ) : (
                  <Check size={18} />
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isUpdating}
                className="font-bold text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onEdit(name)}
              className="font-bold text-red-800 hover:text-red-900"
            >
              {editLabel}
            </button>
          )}
        </div>
      </div>
      {isEditing && error && (
        <p className="mt-1 text-xs text-red-600 sm:ml-32">{error}</p>
      )}
    </div>
  )
}

export default EditableField
