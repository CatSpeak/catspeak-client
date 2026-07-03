import React from "react"
import { Image, UploadCloud, Trash2, Hash, Loader2 } from "lucide-react"
import { TextInput } from "@/shared/components/ui/inputs"
import Avatar from "@/shared/components/ui/Avatar"
import { useCreateReelContext, DESCRIPTION_MAX_LENGTH, PRIVACY_OPTIONS, getMentionUsername, getHashtagName, renderHighlightedDescription } from "../../../contexts/CreateReelContext"

export const DetailsInputStep = () => {
  const {
    t,
    title, setTitle,
    description,
    validationErrors,
    mobileTab,
    privacy, setPrivacy,
    coverType, setCoverType,
    coverPreviewUrl,
    coverFile, setCoverFile, setCoverPreviewUrl,
    isCoverDragging, handleCoverDrag, handleCoverDrop, handleCoverSelect,
    coverInputRef,
    videoRef, videoPreviewUrl,
    handleVideoLoadedMetadata, handleVideoSeeked,
    currentTime, videoDuration, formatTime, isCapturing,
    handleSliderChange, handleSliderRelease, handleKeyframeSelect,
    isExtractingFilmstrip, filmstripFrames,
    descriptionInputRef, descriptionHighlightRef,
    handleDescriptionChange, handleDescriptionKeyDown, handleDescriptionCursorUpdate,
    handleDescriptionProtectedClipboard, handleDescriptionScroll,
    setActiveDescriptionTrigger, setDebouncedDescriptionTrigger,
    showDescriptionSuggestions, isFetchingDescriptionSuggestions,
    activeSuggestions, activeSuggestionIndex, applyDescriptionSuggestion,
    activeDescriptionTrigger
  } = useCreateReelContext()

  const renderDescriptionSuggestion = (item, index) => {
    const isActive = index === activeSuggestionIndex

    if (activeDescriptionTrigger?.type === "mention") {
      const username = getMentionUsername(item)
      const displayName = item.nickname || username

      return (
        <button
          key={`mention-${item.accountId || username}`}
          type="button"
          role="option"
          aria-selected={isActive}
          onMouseDown={(event) => {
            event.preventDefault()
            applyDescriptionSuggestion(item)
          }}
          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
            isActive
              ? "bg-red-50 text-cath-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Avatar
            size={30}
            src={item.avatarUrl}
            name={displayName}
            alt={displayName}
            className="shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{displayName}</span>
            <span className="block truncate text-xs text-gray-500">@{username}</span>
          </span>
        </button>
      )
    }

    const hashtagName = getHashtagName(item)

    return (
      <button
        key={`hashtag-${hashtagName}`}
        type="button"
        role="option"
        aria-selected={isActive}
        onMouseDown={(event) => {
          event.preventDefault()
          applyDescriptionSuggestion(item)
        }}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
          isActive
            ? "bg-red-50 text-cath-red-700"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-white" : "bg-gray-100"}`}>
          <Hash size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">#{hashtagName}</span>
          <span className="block truncate text-xs text-gray-500">
            {item.isChallenge ? "Challenge" : `${item.useCount || 0} uses`}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className={`md:col-span-2 flex-col gap-5 text-left ${mobileTab === "details" ? "flex" : "hidden md:flex"}`}>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
        {t?.catSpeak?.reels?.createModal?.details || "Details"}
      </h3>

      {/* Title */}
      <TextInput
        id="title"
        label={t?.catSpeak?.reels?.createModal?.title || "Title"}
        placeholder={t?.catSpeak?.reels?.createModal?.titlePlaceholder || "Give your Reel a catchy title..."}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="square"
        maxLength={100}
        showCount
        error={validationErrors.title}
        required
        className="rounded-xl border-gray-300"
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-semibold text-gray-700"
        >
          {t?.catSpeak?.reels?.createModal?.description || "Description"}
        </label>
        <div className="relative">
          <div className="relative rounded-xl border border-gray-300 bg-white shadow-sm transition-colors hover:border-cath-red-700 focus-within:border-cath-red-700 focus-within:ring-1 focus-within:ring-cath-red-700">
            <div
              ref={descriptionHighlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl p-3 text-sm leading-5 text-gray-800"
              style={{ fontFamily: "inherit", whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word" }}
            >
              {renderHighlightedDescription(description, "text-[#2b5db0]")}
            </div>
            <textarea
              ref={descriptionInputRef}
              id="description"
              placeholder={t?.catSpeak?.reels?.createModal?.descPlaceholder || "What's this video about? Add tags like #catspeak..."}
              value={description}
              onChange={(e) => {
                handleDescriptionChange(e)
                // Auto-resize textarea to fit content
                const el = e.target
                el.style.height = "auto"
                el.style.height = el.scrollHeight + "px"
              }}
              onKeyDown={handleDescriptionKeyDown}
              onKeyUp={handleDescriptionCursorUpdate}
              onClick={handleDescriptionCursorUpdate}
              onSelect={handleDescriptionCursorUpdate}
              onCut={handleDescriptionProtectedClipboard}
              onPaste={handleDescriptionProtectedClipboard}
              onScroll={handleDescriptionScroll}
              onBlur={() => {
                window.setTimeout(() => {
                  setActiveDescriptionTrigger(null)
                  setDebouncedDescriptionTrigger(null)
                }, 120)
              }}
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={3}
              className="relative z-10 min-h-[84px] w-full resize-none rounded-xl bg-transparent p-3 text-sm leading-5 text-transparent caret-gray-900 outline-none placeholder:text-gray-400"
              style={{ fontFamily: "inherit", overflowY: "hidden", overflowWrap: "break-word", wordBreak: "break-word" }}
            />
          </div>

          {showDescriptionSuggestions && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
            >
              {isFetchingDescriptionSuggestions ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                  <Loader2
                    size={15}
                    className="animate-spin text-cath-red-700"
                  />
                  <span>Searching...</span>
                </div>
              ) : activeSuggestions.length > 0 ? (
                activeSuggestions.map((item, index) => renderDescriptionSuggestion(item, index))
              ) : (
                <div className="px-3 py-3 text-sm text-gray-500">No matches found</div>
              )}
            </div>
          )}
        </div>
        <span className="self-end px-2 text-[10px] text-gray-400 font-semibold">
          {description.length} / {DESCRIPTION_MAX_LENGTH}
        </span>
      </div>

      {/* Privacy Badge Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          {t?.catSpeak?.reels?.createModal?.privacy || "Privacy"}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map((item) => {
            const IconComponent = item.icon
            const isSelected = privacy === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setPrivacy(item.value)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 ${
                  isSelected
                    ? "border-cath-red-700 bg-red-50/40 text-cath-red-700 shadow-sm font-medium scale-[1.01]"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50/50"
                }`}
              >
                <IconComponent
                  size={14}
                  className={
                    isSelected
                      ? "text-cath-red-700 mb-1"
                      : "text-gray-400 mb-1"
                  }
                />
                <span className="text-xs font-semibold">
                  {t?.catSpeak?.reels?.createModal?.privacyOptions?.[item.value] || item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cover selection layout */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Image size={15} className="text-gray-500" />
            {t?.catSpeak?.reels?.createModal?.coverThumbnail || "Cover Thumbnail"}
          </label>
          <div className="flex bg-gray-200/85 p-1 rounded-xl text-xs font-bold shadow-sm">
            <button
              type="button"
              onClick={() => setCoverType("frame")}
              className={`px-3 py-1.5 rounded-lg transition-all ${coverType === "frame" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t?.catSpeak?.reels?.createModal?.extractFrame || "Extract Frame"}
            </button>
            <button
              type="button"
              onClick={() => setCoverType("custom")}
              className={`px-3 py-1.5 rounded-lg transition-all ${coverType === "custom" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t?.catSpeak?.reels?.createModal?.customImage || "Custom Image"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 border border-gray-200/60 rounded-2xl mt-1.5 animate-fadeIn">
          {/* Video Player Container (always mounted, hidden if coverType !== 'frame') */}
          <div className={`relative aspect-[9/16] h-[160px] sm:h-[180px] rounded-xl overflow-hidden bg-black border border-gray-200/80 shadow-sm shrink-0 flex items-center justify-center mx-auto sm:mx-0 ${coverType !== "frame" ? "absolute -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none" : ""
            }`}>
            <video
              ref={videoRef}
              src={coverType === "frame" ? videoPreviewUrl : undefined}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={handleVideoLoadedMetadata}
              onDurationChange={handleVideoLoadedMetadata}
              onSeeked={handleVideoSeeked}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-mono text-white px-1.5 py-0.5 rounded border border-white/10 select-none">
              {formatTime(currentTime)}
            </div>
            {isCapturing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[0.5px]">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {coverType === "frame" ? (
            /* Frame Picker Controls & Filmstrip */
            <div className="flex-1 flex flex-col justify-between gap-3 text-left">
              {/* Title & Scrubbing timeline */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-wider">
                  <span>{t?.catSpeak?.reels?.createModal?.scrubTimeline || "SCRUB VIDEO TIMELINE"}</span>
                  <span className="font-mono text-cath-red-700">
                    {formatTime(currentTime)} /{" "}
                    {formatTime(videoDuration)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max={videoDuration || 100}
                  step="0.01"
                  value={currentTime}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cath-red-700 focus:outline-none shadow-inner cover-slider-range"
                />
              </div>

              {/* Quick Keyframes Filmstrip */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                  {t?.catSpeak?.reels?.createModal?.quickKeyframes || "Quick Keyframes"}
                </span>

                {isExtractingFilmstrip ? (
                  <div className="flex items-center justify-center h-14 bg-white border border-gray-150 rounded-xl gap-2 shadow-sm">
                    <div className="w-3.5 h-3.5 border-2 border-cath-red-700 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-gray-400 font-bold">
                      {t?.catSpeak?.reels?.createModal?.extractingKeyframes || "Extracting keyframes..."}
                    </span>
                  </div>
                ) : filmstripFrames.length > 0 ? (
                  <div className="grid grid-cols-6 gap-1 bg-white p-1 border border-gray-150 rounded-xl shadow-sm">
                    {filmstripFrames.map((frame, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          handleKeyframeSelect(frame.time)
                        }
                        className={`relative aspect-[9/16] rounded-md overflow-hidden bg-gray-100 border transition-all duration-200 hover:scale-[1.03] ${
                          Math.abs(currentTime - frame.time) < 0.15
                            ? "border-cath-red-700 ring-1 ring-cath-red-700 scale-[1.01]"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={frame.url}
                          alt={`Keyframe ${index + 1}`}
                          className="w-full h-full object-cover select-none"
                        />
                        <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[5px] font-mono text-center text-white bg-black/60 rounded p-0.2 select-none">
                          {formatTime(frame.time)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-14 bg-white border border-gray-150 rounded-xl shadow-sm">
                    <span className="text-[10px] text-gray-400 font-bold">
                      {t?.catSpeak?.reels?.createModal?.noFrames || "No frames available"}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[9px] text-gray-400 leading-normal font-medium mt-1">
                {t?.catSpeak?.reels?.createModal?.coverInstruction || "Scrub the timeline or select a quick keyframe to auto-update the cover image. Your chosen frame will be uploaded as the Reel's cover thumbnail."}
              </p>
            </div>
          ) : (
            /* Custom Image Selection Controls */
            <div className="flex-1 flex flex-col sm:flex-row gap-4 items-center w-full">
              <div className="relative w-[84px] h-[120px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                {coverPreviewUrl ? (
                  <img
                    src={coverPreviewUrl}
                    alt="Custom Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="text-gray-300" size={24} />
                )}
              </div>

              <div className="flex-1 text-left flex flex-col justify-center py-1 w-full">
                {!coverPreviewUrl || coverFile?.name === "cover.jpg" ? (
                  <div
                    onDragEnter={handleCoverDrag}
                    onDragOver={handleCoverDrag}
                    onDragLeave={handleCoverDrag}
                    onDrop={handleCoverDrop}
                    onClick={() => coverInputRef.current?.click()}
                    className={`border border-dashed rounded-xl h-[96px] flex flex-col items-center justify-center cursor-pointer transition-all duration-250 ${
                      isCoverDragging
                        ? "border-cath-red-700 bg-red-50/30"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={(e) => handleCoverSelect(e.target.files?.[0])}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                    />
                    <UploadCloud
                      size={18}
                      className="text-cath-red-700 mb-1"
                    />
                    <p className="text-[10px] font-bold text-gray-700">
                      {t?.catSpeak?.reels?.createModal?.uploadCustomCover || "Upload custom cover"}
                    </p>
                    <p className="text-[8px] text-gray-400 mt-0.5">
                      {t?.catSpeak?.reels?.createModal?.coverFormat || "PNG, JPG up to 5MB"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-cath-red-700 font-bold uppercase tracking-wider">
                      {t?.catSpeak?.reels?.createModal?.customImageUploaded || "Custom Image Uploaded"}
                    </span>
                    <div className="text-xs font-bold text-gray-700 truncate max-w-[200px] mt-0.5">
                      {coverFile?.name}
                    </div>
                    <div className="text-[9px] text-gray-400 font-semibold font-mono">
                      {(coverFile?.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null)
                        if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
                        setCoverPreviewUrl("")
                        setCoverType("frame") // Revert back to frame extraction
                        // Seek back to 0.1 to reset default frame preview
                        if (videoRef.current?.readyState > 0) {
                          videoRef.current.currentTime = 0.1
                        }
                      }}
                      className="mt-2 self-start px-2.5 py-1 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-colors flex items-center gap-1 shadow-sm border border-red-100/50 active:scale-95"
                    >
                      <Trash2 size={11} />
                      {t?.catSpeak?.reels?.createModal?.removeImage || "Remove Image"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
