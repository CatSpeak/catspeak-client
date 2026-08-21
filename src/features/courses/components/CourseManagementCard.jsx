import React, { useRef, useState } from "react"
import { Calendar, Check, Clock, GraduationCap, MoreVertical, PenSquare, Share2, Tag, Trash2, Users } from "lucide-react"
import useClickOutside from "@/shared/hooks/useClickOutside"
import CourseStatusPill from "./CourseStatusPill"
import CourseThumbnail from "./CourseThumbnail"
import { stripHtmlToText } from "../utils/courseUtils"

const CourseActionMenu = ({ item, labels, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useClickOutside(menuRef, () => setIsOpen(false), { enabled: isOpen })

  return (
    <div ref={menuRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={(labels.actionsFor || "Actions for {{title}}")
          .replace("{{title}}", item.title || labels.courseLabel || "course")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen((current) => !current)
        }}
        className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-1 min-w-[152px] bg-white border border-border rounded-2xl shadow-md py-1 z-30 text-left whitespace-nowrap">
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(false)
              onEdit(item)
            }}
            className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <PenSquare size={14} className="text-gray-500 shrink-0" />
            <span>{labels.editCourse || "Chỉnh sửa"}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(false)
              onDelete(item)
            }}
            className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-border cursor-pointer whitespace-nowrap"
          >
            <Trash2 size={14} className="shrink-0" />
            <span>{labels.deleteCourse || "Xóa"}</span>
          </button>
        </div>
      )}
    </div>
  )
}

const CourseManagementCard = ({
  item,
  type,
  viewMode = "grid",
  labels = {},
  onOpen,
  onEdit,
  onDelete,
  onShare,
}) => {
  const isCourse = type === "course"
  const isGrid = viewMode === "grid"
  const [linkCopied, setLinkCopied] = useState(false)

  // Extract real progress percentage from API data
  let progressPercent = 0
  if (item.progress != null) {
    if (typeof item.progress === "number" || (typeof item.progress === "string" && !isNaN(Number(item.progress)))) {
      progressPercent = Math.min(100, Math.max(0, Math.round(Number(item.progress))))
    } else if (typeof item.progress === "object") {
      if (item.progress.percentage != null && !isNaN(Number(item.progress.percentage))) {
        progressPercent = Math.min(100, Math.max(0, Math.round(Number(item.progress.percentage))))
      } else {
        const completed = Number(item.progress.completedSessions ?? item.progress.completed ?? 0)
        const total = Number(item.progress.totalSessions ?? item.progress.total ?? 0)
        if (total > 0) {
          progressPercent = Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
        }
      }
    }
  }

  const slotCount = item.slots ?? item.studentCount ?? 0
  const minPriceFormatted = item.minPrice || item.price || (labels.tba || "—")
  const maxPriceFormatted = item.maxPrice || item.price || (labels.tba || "—")
  const scheduleText = item.schedule || (labels.tba || "—")
  const dateRangeText = item.dateRange || (labels.tba || "—")
  const subtitleText = item.subtitle || ""

  const isFree = item.price === "0đ" || item.price === "0" || item.price === 0 || item.price === "0 VND"
  const priceDisplay = isFree
    ? (labels.free || "Miễn phí")
    : (item.price || (labels.tba || "—"))

  if (!isGrid) {
    // List View Mode (Optimized for both Mobile and Desktop)
    return (
      <div
        onClick={() => onOpen(item)}
        className="bg-white rounded-3xl border border-border hover:border-border p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
      >
        {/* Top / Left: Thumbnail and Main Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 flex-1 min-w-0">
          <CourseThumbnail
            item={item}
            title={item.title}
            className="h-20 w-28 sm:h-24 sm:w-36 rounded-2xl bg-slate-100 shadow-xs shrink-0"
          >
            <div className="absolute top-2 left-2 bg-[#F59E0B] text-gray-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Users size={11} className="text-gray-950" />
              <span>{slotCount}</span>
            </div>
          </CourseThumbnail>

          <div className="flex flex-col min-w-0 flex-1 gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-gray-950 truncate group-hover:text-[#990011] transition-colors">
                  {item.title}
                </h3>
                <CourseStatusPill status={item.status} />
              </div>
              {/* On mobile: 3-dots action menu in header */}
              <div className="md:hidden shrink-0" onClick={(e) => e.stopPropagation()}>
                <CourseActionMenu item={item} labels={labels} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>

            {subtitleText && <p className="text-xs font-medium text-gray-500 truncate">{subtitleText}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-0.5 sm:mt-1">
              <span className="flex items-center gap-1.5">
                {isCourse ? <GraduationCap size={14} className="text-gray-500 shrink-0" /> : <Clock size={13} className="text-gray-500 shrink-0" />}
                <span className="truncate">{scheduleText}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-500 shrink-0" />
                <span className="truncate">{dateRangeText}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom / Right: Pricing, Progress & Desktop Action Menu */}
        <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-3 md:pt-0 border-t border-border md:border-t-0 shrink-0">
          {isCourse ? (
            <div className="flex items-center md:flex-col md:items-end justify-between w-full md:w-auto gap-1 text-left md:text-right">
              <span className="text-[11px] text-gray-400 font-bold">{labels.createdDate || "Ngày tạo"}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-900">{item.createdAt || (labels.tba || "—")}</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start md:items-end gap-0.5 text-left md:text-right">
                <span className="text-[11px] text-gray-500">{labels.price || "Giá cả"}</span>
                <span className={`text-xs sm:text-sm font-bold ${isFree ? "text-[#16A34A]" : "text-gray-950"}`}>{priceDisplay}</span>
              </div>

              <div className="w-32 sm:w-36 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                  <span>{labels.progress || "Tiến độ"}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B0000] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </>
          )}

          {/* Desktop 3-dots action menu */}
          <div className="hidden md:block shrink-0" onClick={(e) => e.stopPropagation()}>
            <CourseActionMenu item={item} labels={labels} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      </div>
    )
  }

  // Grid View Mode (Exact match to the screenshot)
  return (
    <div
      onClick={() => onOpen(item)}
      className="bg-white rounded-3xl border border-border hover:border-border overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none h-full"
    >
      {/* ─── Top Thumbnail Banner ─── */}
      <CourseThumbnail
        item={item}
        title={item.title}
        className="h-44 w-full bg-slate-100"
      >
        {/* Top-Left Slot/Capacity Badge */}
        <div className="absolute top-3.5 left-3.5 bg-[#F59E0B] text-gray-950 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs z-10">
          <Users size={13} className="text-gray-950" />
          <span>{slotCount}</span>
        </div>

        {/* Top-Right Status Badge */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <CourseStatusPill status={item.status} />
        </div>

        {/* Share Button */}
        {onShare && (
          <button
            type="button"
            onClick={async (event) => {
              event.stopPropagation()
              try {
                await onShare(item)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              } catch (e) {
                console.error("Share failed", e)
              }
            }}
            className="absolute bottom-3 right-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100 cursor-pointer"
            title={labels.share || "Chia sẻ"}
          >
            {linkCopied ? <Check size={13} /> : <Share2 size={13} />}
          </button>
        )}
      </CourseThumbnail>

      {/* ─── Bottom Content Area ─── */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3.5 bg-white">
        {/* Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3
              className="font-bold text-lg text-gray-950 leading-snug line-clamp-1 group-hover:text-[#990011] transition-colors"
              title={item.title}
            >
              {item.title}
            </h3>

            <div onClick={(e) => e.stopPropagation()}>
              <CourseActionMenu
                item={item}
                labels={labels}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>

          {subtitleText && (
            <p className="text-xs text-gray-500 font-normal line-clamp-1">
              {subtitleText}
            </p>
          )}
        </div>

        {/* Schedule Info (2 Rows with Icons) */}
        <div className="flex flex-col gap-1.5 text-xs font-normal text-gray-700">
          <div className="flex items-center gap-2.5">
            {isCourse ? (
              <GraduationCap size={15} className="text-gray-800 shrink-0" />
            ) : (
              <Clock size={14} className="text-gray-800 shrink-0" />
            )}
            <span className="truncate">{scheduleText}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar size={14} className="text-gray-800 shrink-0" />
            <span className="truncate">{dateRangeText}</span>
          </div>
        </div>

        {/* Progress Bar (Only for Classes) */}
        {!isCourse && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold text-gray-800">
              <span>{labels.progress || "Tiến độ"}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Single "Giá cả" for Classes, Created Date & Details for Courses */}
        {isCourse ? (
          <div className="pt-2.5 border-t border-border flex justify-between items-center text-xs font-bold">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] leading-none mb-0.5">{labels.createdDate || "Ngày tạo"}</span>
              <span className="text-gray-900 font-black">{item.createdAt || (labels.tba || "—")}</span>
            </div>
            <span className="text-[#b20a1c] hover:underline font-extrabold text-xs">{labels.manageDetails || "Quản lý chi tiết"}</span>
          </div>
        ) : (
          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Tag size={14} className="text-gray-700 shrink-0" />
              <span>{labels.price || "Giá cả"}</span>
            </div>
            <span className={`text-sm font-bold ${isFree ? "text-[#16A34A]" : "text-gray-950"}`}>{priceDisplay}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseManagementCard
