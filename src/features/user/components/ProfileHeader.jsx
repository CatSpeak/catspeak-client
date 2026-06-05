import React, { useState } from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { Pencil, Check, X } from "lucide-react"

const ProfileHeader = ({ avatarImageUrl, onUpdateAvatarUrl, username, t }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputUrl, setInputUrl] = useState("")

  const handleEditClick = () => {
    setInputUrl(avatarImageUrl || "")
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onUpdateAvatarUrl) {
      onUpdateAvatarUrl(inputUrl)
    }
    setIsEditing(false)
  }

  return (
    <div className="relative mb-10">
      {/* Cover Image — same as RoomCard for visual consistency */}
      <div className="h-48 w-full overflow-hidden rounded-xl bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
          alt="Cover"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Avatar Section */}
      <div className="absolute -bottom-12 left-8 flex items-end gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <Avatar
              size={96}
              src={avatarImageUrl}
              alt="Avatar"
              name={username}
              className="border-4 border-white shadow-sm"
            />
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-600 hover:text-[#990011] hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-2 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="px-3 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-[#990011] w-64"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1.5 bg-[#990011] text-white rounded hover:bg-[#7a000d]"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileHeader
