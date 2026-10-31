import React from "react"
import Banner from "@/shared/components/ui/Banner"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import ImageUploadInput from "@/shared/components/ui/inputs/ImageUploadInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import Slider from "@/shared/components/ui/Slider"
import TopicSelect from "./TopicSelect"
import LevelSelector from "./LevelSelector"
import LanguageSelect from "./LanguageSelect"
import { TOPICS, LEVELS } from "../../config/constants"
import { Crown } from "lucide-react"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"

const labelClass = "text-xs"

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
  nameError,
  passwordError,
  t,
}) => {
  const ct = t.rooms?.customRooms || {}
  const cr = t.rooms?.createRoom || {}
  const isCustomMode = mode === "custom"
  const isDisabled = isCustomMode && isQuotaFull
  const { limits } = usePlanFeatures()
  const maxParticipantsLimit = limits.maxParticipantsInCustomRooms

  return (
    <div className="flex flex-col gap-5">
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

      <fieldset
        disabled={isDisabled}
        className="flex flex-col gap-4 border-0 p-0 m-0 min-w-0"
      >
        {/* Room Name Input (Shared) */}
        <TextInput
          id="room-name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={nameError}
          required
          label={
            isCustomMode
              ? ct.roomName || "Room Name"
              : cr.nameLabel || "Room Name"
          }
          labelClassName={labelClass}
          placeholder={
            isCustomMode
              ? ct.roomNamePlaceholder || "e.g. My Study Group"
              : cr.namePlaceholder || "e.g. Chill Practice"
          }
          autoFocus
          data-autofocus="true"
          autoComplete="off"
          variant="square"
          disabled={isDisabled}
          maxLength={isCustomMode ? 50 : 100}
          showCount
        />

        {/* Language Selection (Custom Mode Only, optional) */}
        {isCustomMode && (
          <LanguageSelect
            value={formData.languageType}
            onChange={(language) => handleChange("languageType", language)}
            disabled={isDisabled}
            labelClassName={labelClass}
            t={t}
          />
        )}

        {/* Topics Selection (Shared) */}
        <TopicSelect
          value={formData.topics}
          onChange={handleTopicChange}
          options={TOPICS}
          disabled={isDisabled}
          labelClassName={labelClass}
          t={t}
        />

        {/* Level Selection (Shared) */}
        <LevelSelector
          selectedLevel={formData.selectedLevel}
          onSelect={(level) => handleChange("selectedLevel", level)}
          levels={LEVELS[selectedLanguage]}
          disabled={isDisabled}
          labelClassName={labelClass}
          t={t}
        />

        {/* 16:9 Thumbnail Upload (Custom Mode Only) */}
        {isCustomMode && (
          <ImageUploadInput
            label={ct.roomThumbnail || "Room Thumbnail"}
            labelClassName={labelClass}
            fullAspect={true}
            frameClassName="aspect-video min-h-[240px] max-h-[240px]"
            value={thumbnailFile}
            onChange={setThumbnailFile}
            disabled={isDisabled}
            uploadText={ct.uploadThumbnail || "Upload Image"}
            dragDropText={ct.dragDropHint || "Drag & drop thumbnail image here"}
            hintText={ct.imageHint || "PNG, JPG, WEBP up to 5MB"}
            changeText={ct.change || "Change"}
            removeText={ct.remove || "Remove"}
          />
        )}

        {/* Room Settings (Custom Mode Only) */}
        {isCustomMode && (
          <>
            {/* Room Privacy & Password Group */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className={labelClass}>
                  {cr.privateRoom || "Private Room"}
                </span>
                <div className="flex items-center justify-between gap-4 w-full rounded-md border border-border dark:border-[#3F3F3F] px-4 min-h-[56px] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white transition-all duration-200">
                  <span className="flex-1">
                    {formData.isPrivate
                      ? ct.privateHint ||
                        "Require a password to join this room."
                      : ct.publicHint ||
                        "No password required. Anyone can join."}
                  </span>
                  <Switch
                    checked={formData.isPrivate}
                    onChange={(e) => {
                      const checked = e.target.checked
                      handleChange("isPrivate", checked)
                      if (!checked) {
                        handleChange("password", "")
                      }
                    }}
                    disabled={isDisabled}
                    aria-label={cr.privateRoom || "Private Room"}
                  />
                </div>
              </div>

              {formData.isPrivate && (
                <TextInput
                  id="custom-room-password"
                  type="password"
                  label={cr.passwordLabel || "Password"}
                  labelClassName={labelClass}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={passwordError}
                  placeholder={
                    passwordPlaceholder ||
                    cr.passwordPlaceholder ||
                    "Enter room password"
                  }
                  disabled={isDisabled}
                  autoComplete="new-password"
                  variant="square"
                />
              )}
            </div>

            {/* Max Participants Selection */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="custom-room-max-participants"
                className={labelClass}
              >
                {ct.maxParticipantsLabel || "Max Participants"}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Slider
                    id="custom-room-max-participants"
                    min={5}
                    max={maxParticipantsLimit}
                    step={1}
                    value={formData.maxParticipants || 10}
                    onChange={(e) =>
                      handleChange(
                        "maxParticipants",
                        parseInt(e.target.value, 10),
                      )
                    }
                    disabled={isDisabled}
                    aria-label={ct.maxParticipantsLabel || "Max Participants"}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <TextInput
                    id="custom-room-max-participants-input"
                    type="number"
                    min={5}
                    max={maxParticipantsLimit}
                    value={formData.maxParticipants ?? 10}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "") {
                        handleChange("maxParticipants", "")
                      } else {
                        const num = parseInt(val, 10)
                        if (!isNaN(num)) {
                          handleChange(
                            "maxParticipants",
                            Math.min(maxParticipantsLimit, num),
                          )
                        }
                      }
                    }}
                    onBlur={() => {
                      const num = parseInt(formData.maxParticipants, 10)
                      if (isNaN(num) || num < 5) {
                        handleChange("maxParticipants", 5)
                      } else if (num > maxParticipantsLimit) {
                        handleChange("maxParticipants", maxParticipantsLimit)
                      }
                    }}
                    disabled={isDisabled}
                    className="text-center"
                    containerClassName="shrink-0"
                    variant="square"
                    aria-label={ct.maxParticipantsLabel || "Max Participants"}
                  />
                  <span>/ {maxParticipantsLimit}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </fieldset>
    </div>
  )
}

export default CreateRoomFormFields
