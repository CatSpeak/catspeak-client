import React from "react"
import Banner from "@/shared/components/ui/Banner"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import ImageUploadInput from "@/shared/components/ui/inputs/ImageUploadInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import TopicSelect from "./TopicSelect"
import LevelSelector from "./LevelSelector"
import LanguageSelect from "./LanguageSelect"
import { TOPICS, LEVELS } from "../../config/constants"
import { Crown } from "lucide-react"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"

const labelClass = "text-sm font-medium text-gray-800"

const SectionHeading = ({ children }) => (
  <div className="flex items-center gap-3 pt-1">
    <span className="text-sm font-semibold uppercase tracking-wide text-cath-red-700">
      {children}
    </span>
    <span
      className="h-px flex-1 bg-cath-red-700/20"
      aria-hidden="true"
    />
  </div>
)

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
        className="flex flex-col gap-5 border-0 p-0 m-0 min-w-0"
      >
        {isCustomMode && (
          <SectionHeading>
            {ct.sectionBasic || "Basic information"}
          </SectionHeading>
        )}

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
          variant="rounded-xl"
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
            <SectionHeading>
              {ct.sectionSettings || "Room settings"}
            </SectionHeading>

            {/* Room Privacy & Password Group */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className={labelClass}>
                  {cr.privateRoom || "Private Room"}
                </span>
                <div className="flex items-center justify-between gap-4 w-full rounded-xl border border-border px-4 min-h-[56px] bg-white transition-all duration-200">
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
                  variant="rounded-xl"
                />
              )}
            </div>

            {/* Max Participants Selection */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="custom-room-max-participants"
                className={labelClass}
              >
                {ct.maxParticipantsLabel || "Max Participants"}
              </label>
              <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-cath-red-700">
                    {formData.maxParticipants || 10}
                  </span>
                  <span className="text-sm text-gray-500">
                    {ct.maxParticipantsLimit?.replace("{max}", maxParticipantsLimit) || `Max: ${maxParticipantsLimit} participants`}
                  </span>
                </div>
                <input
                  id="custom-room-max-participants"
                  type="range"
                  min={5}
                  max={maxParticipantsLimit}
                  step={1}
                  value={formData.maxParticipants || 10}
                  onChange={(e) => handleChange("maxParticipants", parseInt(e.target.value, 10))}
                  disabled={isDisabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cath-red-700"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5</span>
                  <span>{maxParticipantsLimit}</span>
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
