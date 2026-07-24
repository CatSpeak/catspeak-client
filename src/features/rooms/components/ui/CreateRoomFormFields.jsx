import React from "react"
import Banner from "@/shared/components/ui/Banner"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import ImageUploadInput from "@/shared/components/ui/inputs/ImageUploadInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import TopicSelect from "./TopicSelect"
import LevelSelector from "./LevelSelector"
import { TOPICS, LEVELS } from "../../config/constants"
import { Crown } from "lucide-react"

/**
 * A centralized, DRY form component for room creation.
 * Renders shared fields (Name, Topics, Level) and conditional custom fields (Thumbnail, Password).
 */
const CreateRoomFormFields = ({
  mode,
  formData,
  thumbnailFile,
  setThumbnailFile,
  handleChange,
  handleTopicChange,
  isQuotaFull,
  selectedLanguage,
  passwordPlaceholder,
  t,
}) => {
  const ct = t.rooms?.customRooms || {}
  const isCustomMode = mode === "custom"

  return (
    <div className="flex flex-col gap-6">
      {isCustomMode && isQuotaFull && (
        <Banner
          variant="danger"
          icon={Crown}
          action={{
            label: ct.manageRooms || "Manage rooms",
            to: "/workspace/rooms",
          }}
        >
          {ct.maxRoomsReached || "Maximum rooms reached"}
        </Banner>
      )}

      {/* 16:9 Thumbnail Upload (Custom Mode Only) */}
      {isCustomMode && (
        <ImageUploadInput
          label={ct.roomThumbnail || "Room Thumbnail"}
          fullAspect={true}
          value={thumbnailFile}
          onChange={setThumbnailFile}
          disabled={isQuotaFull}
          uploadText={ct.uploadThumbnail || "Upload Image"}
          dragDropText={ct.dragDropHint || "Drag & drop thumbnail image here"}
          hintText={ct.imageHint || "PNG, JPG, WEBP up to 5MB"}
          changeText={ct.change || "Change"}
          removeText={ct.remove || "Remove"}
        />
      )}

      {/* Room Name Input (Shared) */}
      <TextInput
        id="room-name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        label={
          isCustomMode
            ? ct.roomName || "Room Name"
            : t.rooms?.createRoom?.nameLabel || "Room Name"
        }
        placeholder={
          isCustomMode
            ? ct.roomNamePlaceholder || "e.g. My Study Group"
            : t.rooms?.createRoom?.namePlaceholder || "e.g. Chill Practice"
        }
        autoFocus
        autoComplete="off"
        variant="rounded-xl"
        disabled={isCustomMode && isQuotaFull}
      />

      {/* Room Privacy Toggle (Custom Mode Only) */}
      {isCustomMode && (
        <div className="flex flex-col gap-2">
          <span>{t.rooms?.createRoom?.privateRoom || "Private Room"}</span>
          <div className="flex items-center justify-between gap-4 w-full rounded-xl border border-[#e5e5e5] px-4 min-h-[56px] bg-white transition-all duration-200 hover:border-[#8e0000]">
            <span className="flex-1">
              {formData.isPrivate
                ? ct.privateHint ||
                  "Hidden from public room list. Only accessible via link."
                : ct.publicHint ||
                  "Visible in public room list for anyone to join."}
            </span>
            <Switch
              checked={formData.isPrivate}
              onChange={(e) => handleChange("isPrivate", e.target.checked)}
              disabled={isQuotaFull}
            />
          </div>
        </div>
      )}

      {/* Room Password Input (Custom Mode Only) */}
      {isCustomMode && (
        <TextInput
          id="custom-room-password"
          type="password"
          label={t.rooms?.createRoom?.passwordLabel || "Password (Optional)"}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder={
            passwordPlaceholder ||
            t.rooms?.createRoom?.passwordPlaceholder ||
            "Enter room password"
          }
          disabled={isQuotaFull}
          autoComplete="new-password"
          variant="rounded-xl"
        />
      )}

      {/* Topics Selection (Shared) */}
      <TopicSelect
        value={formData.topics}
        onChange={handleTopicChange}
        options={TOPICS}
        t={t}
      />

      {/* Level Selection (Shared) */}
      <LevelSelector
        selectedLevel={formData.selectedLevel}
        onSelect={(level) => handleChange("selectedLevel", level)}
        levels={LEVELS[selectedLanguage]}
        t={t}
      />
    </div>
  )
}

export default CreateRoomFormFields
