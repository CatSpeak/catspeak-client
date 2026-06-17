import React, { useRef, useState } from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { Pencil, Loader2 } from "lucide-react"

const ProfileHeader = ({ avatarImageUrl, onUpdateAvatarFile, username, t }) => {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleEditClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file && onUpdateAvatarFile) {
      setIsUploading(true)
      try {
        await onUpdateAvatarFile(file)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
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
              className={`border-4 border-white shadow-sm transition-opacity ${isUploading ? 'opacity-50' : ''}`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#990011] animate-spin" />
              </div>
            )}
            {!isUploading && (
              <button
                onClick={handleEditClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-600 hover:text-[#990011] hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={14} />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
