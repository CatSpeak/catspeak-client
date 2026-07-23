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

      {/* Private Room Toggle & Password (Custom Mode Only) */}
      {isCustomMode && (
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span>{t.rooms?.createRoom?.privateRoom || "Private Room"}</span>
            <Switch
              checked={formData.isPrivate}
              onChange={(e) => {
                handleChange("isPrivate", e.target.checked)
                if (!e.target.checked) handleChange("password", "")
              }}
              disabled={isQuotaFull}
            />
          </div>

          <TextInput
            id="custom-room-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder={
              passwordPlaceholder ||
              t.rooms?.createRoom?.passwordPlaceholder ||
              "Enter room password"
            }
            disabled={!formData.isPrivate || isQuotaFull}
            autoComplete="new-password"
            variant="rounded-xl"
          />
        </div>
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
