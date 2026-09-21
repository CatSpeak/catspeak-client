import React, { useEffect, useRef, useState } from "react"
import { MoreVertical, Play, UploadCloud } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import {
  fileNameFromUrl,
  formatBytes,
  formatUtcDate,
  pick,
} from "./utils"

const VideoCard = ({
  profile,
  t,
  videoMeta,
  onPlay,
  onReplace,
  onRemove,
}) => {
  const ins = t.profile?.instructor || {}
  const videoUrl = pick(profile, "introVideoUrl", "IntroVideoUrl")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // The API returns neither the file size nor the upload date. Prefer those
  // fields if the backend ever provides them, otherwise fall back to the
  // metadata of a file replaced during this session (size + the moment it was
  // uploaded) — never fabricate a value.
  const rawSize = pick(profile, "introVideoSize", "IntroVideoSize")
  const size = typeof rawSize === "number" ? rawSize : videoMeta?.size
  const uploadedAt =
    pick(
      profile,
      "introVideoUploadedAt",
      "IntroVideoUploadedAt",
      "introVideoCreatedAt",
      "IntroVideoCreatedAt",
    ) || videoMeta?.uploadedAt
  const metaParts = []
  if (typeof size === "number") metaParts.push(formatBytes(size))
  const dateText = formatUtcDate(uploadedAt)
  if (dateText) metaParts.push(dateText)
  const metaLine = metaParts.join(" · ")

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen])

  return (
    <FluentCard
      rounded="rounded-[10px]"
      padding="px-5 py-3.5"
      className="!justify-start gap-2.5"
    >
      <h2 className="text-[15px] font-semibold text-[#101828]">
        {ins.uploadVideo || "Tải video giới thiệu bản thân"}
      </h2>

      {videoUrl ? (
        <div className="flex items-center gap-3 rounded-[7px] border border-[#D0D5DD] py-2.5 pl-2.5 pr-3.5">
          <button
            type="button"
            onClick={onPlay}
            aria-label={ins.videoLabel || "Video"}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[7px] bg-[#17302D] text-white transition-opacity hover:opacity-90"
          >
            <Play size={18} fill="currentColor" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-xs font-medium text-[#101828]">
              {fileNameFromUrl(videoUrl)}
            </span>
            {metaLine && (
              <span className="truncate text-[10px] text-[#667085]">
                {metaLine}
              </span>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={ins.approvedOptions || "Tùy chọn"}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#101828] transition-colors hover:bg-[#F2F4F7]"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-[#E2E2E2] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onReplace?.()
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-[#101828] transition-colors hover:bg-[#F9FAFB]"
                >
                  {ins.approvedReplaceVideo || "Thay video"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onRemove?.()
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-[#F52235] transition-colors hover:bg-[#FEF3F2]"
                >
                  {ins.approvedDeleteVideo || "Xóa video"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onReplace}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D0D5DD] py-6 text-center text-sm text-[#667085] transition-colors hover:border-[#990011] hover:bg-[#990011]/5"
        >
          <UploadCloud size={22} className="text-[#667085]" />
          <span>{ins.approvedNoVideo || "Chưa có video giới thiệu"}</span>
          <span className="text-xs font-semibold text-[#990011]">
            {ins.approvedUploadVideo || "Chọn video"}
          </span>
        </button>
      )}
    </FluentCard>
  )
}

export default VideoCard
