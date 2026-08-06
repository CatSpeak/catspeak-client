import React, { useRef, useState } from "react"
import { BookOpen, Calendar, Clock, Layers, MoreVertical, PenSquare, Tag, Trash2, Users } from "lucide-react"
import useClickOutside from "@/shared/hooks/useClickOutside"
import CourseStatusPill from "./CourseStatusPill"
import CourseThumbnail from "./CourseThumbnail"

const MetaRow = ({ icon, children, strong = false }) => (
  <div className="flex items-center gap-2">
    {React.createElement(icon, { size: 13, className: "text-gray-400" })}
    <span className={strong ? "text-gray-900 font-extrabold" : ""}>{children}</span>
  </div>
)

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
        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-1 w-36 bg-white border border-gray-150 rounded-2xl shadow-lg py-1 z-30 text-left">
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(false)
              onEdit(item)
            }}
            className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <PenSquare size={13} className="text-gray-500" />
            <span>{labels.editCourse}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(false)
              onDelete(item)
            }}
            className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
          >
            <Trash2 size={13} />
            <span>{labels.deleteCourse}</span>
          </button>
        </div>
      )}
    </div>
  )
}

const CourseManagementCard = ({
  item,
  type,
  viewMode,
  labels,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const isCourse = type === "course"
  const isGrid = viewMode === "grid"

  return (
    <div
      onClick={() => onOpen(item)}
      className={`bg-white rounded-3xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex justify-between ${isGrid ? "flex-col min-h-[460px]" : "flex-row items-center p-4 gap-6"}`}
    >
      <CourseThumbnail
        item={item}
        title={item.title}
        className={isGrid ? "h-48 w-full bg-[#D9D9D9]" : "h-20 w-28 bg-[#D9D9D9] rounded-2xl"}
      >
        {isGrid && (
          <>
            {item.status && (
              <div className="absolute top-3 right-3">
                <CourseStatusPill status={item.status} />
              </div>
            )}
          </>
        )}
      </CourseThumbnail>

      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-1 hover:text-[#b20a1c] transition-colors" title={item.title}>
              <button
                type="button"
                className="text-left"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen(item)
                }}
              >
                {item.title}
              </button>
            </h4>

            {isGrid && isCourse && (
              <CourseActionMenu
                item={item}
                labels={labels}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>

          {isCourse ? (
            <>
              <span className="text-xs text-gray-400 font-bold block">
                {labels.courseLabel ? `${labels.courseLabel} ${item.title}` : `Course ${item.title}`}
              </span>
              {item.description && (
                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed mt-2" title={item.description ? item.description.replace(/<[^>]*>/g, " ").trim() : ""}>
                  {item.description ? item.description.replace(/<[^>]*>/g, " ").trim() : ""}
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-gray-500">
                <MetaRow icon={BookOpen}>
                  {(labels.classCount || "{{count}} classes")
                    .replace("{{count}}", String(item.classCount))}
                </MetaRow>
                <MetaRow icon={Users}>{item.students}</MetaRow>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400 font-bold block">
                {labels.classLabel ? `${labels.classLabel} ${item.title}` : `Class ${item.title}`}
              </span>

              <div className="mt-1.5 flex items-center gap-2">
                {item.courseId && item.courseTitle ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60" title={`Course: ${item.courseTitle}`}>
                    <Layers size={11} className="text-blue-500 flex-shrink-0" />
                    <span className="line-clamp-1">{item.courseTitle}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    {labels.standaloneClass || "Lớp độc lập"}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-gray-500">
                <MetaRow icon={Tag} strong>{item.price}</MetaRow>
                <MetaRow icon={Calendar}>{item.schedule}</MetaRow>
                <MetaRow icon={Clock}>{item.startDate} - {item.endDate}</MetaRow>
              </div>

              {(() => {
                let progressPercent = null
                if (item.progress != null) {
                  if (typeof item.progress === "number" || (typeof item.progress === "string" && !isNaN(Number(item.progress)))) {
                    progressPercent = Number(item.progress)
                  } else if (typeof item.progress === "object") {
                    if (item.progress.percentage != null && !isNaN(Number(item.progress.percentage))) {
                      progressPercent = Number(item.progress.percentage)
                    } else if (item.progress.totalSessions && !isNaN(Number(item.progress.completedSessions))) {
                      progressPercent = Math.round((Number(item.progress.completedSessions || 0) / Number(item.progress.totalSessions)) * 100)
                    }
                  }
                }
                return item.status !== "OPEN" && progressPercent != null && !isNaN(progressPercent) ? (
                  <div className="mt-5">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                      <span>{labels.progress}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-[#b20a1c] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                ) : null
              })()}
            </>
          )}
        </div>

        {isCourse && (
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 text-xs font-bold">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] leading-none mb-0.5">{labels.createdDate}</span>
                <span className="text-gray-900 font-black">{item.createdAt}</span>
              </div>
              <span className="text-[#b20a1c] hover:underline font-extrabold text-xs">{labels.manageDetails}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseManagementCard
