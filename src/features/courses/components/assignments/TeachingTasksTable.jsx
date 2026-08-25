import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MoreVertical, Eye } from "lucide-react"
import useClickOutside from "@/shared/hooks/useClickOutside"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const TeachingTasksTable = ({ tasks, defaultCourseThumbnail }) => {
  const { t } = useLanguage()
  const { formatDate, formatScheduleTime } = useTimezone()
  const c = t.courses || {}
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setActiveDropdown(null), {
    enabled: activeDropdown !== null,
  })

  return (
    <div className="w-full">
      {/* ─── Mobile View ─── */}
      <div className="flex flex-col gap-3.5 md:hidden">
        {tasks.map((item, idx) => {
          const uniqueId = item.id || `${item.taskType}-${item.classId}-${idx}`
          const pendingLabel = (c.taskPendingCount || "Còn {{count}} bài").replace("{{count}}", item.pendingCount ?? 0)

          return (
            <div
              key={`mobile-${uniqueId}`}
              className="bg-white rounded-3xl border border-border/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col gap-3"
            >
              {/* Header: thumbnail + info + 3 dots */}
              <div className="flex items-start gap-3">
                <img
                  src={item.thumbnailUrl || defaultCourseThumbnail}
                  alt={item.className || "Thumbnail"}
                  className="w-20 h-16 min-w-[80px] max-w-[80px] rounded-2xl bg-gray-200 shadow-2xs shrink-0 object-cover"
                />
                <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                  <h4 className="font-bold text-sm text-gray-950 truncate leading-snug">
                    {item.className || c.course || "Khóa học"}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {item.taskName}
                  </p>
                  <p className="text-xs text-[#b20a1c] font-bold">
                    {pendingLabel}
                  </p>

                  <div className="mt-1 w-full">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                      <span>{c.progress || "Tiến độ"}</span>
                      <span>{item.progressPercent ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#990011] rounded-full transition-all duration-300" style={{ width: `${item.progressPercent ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* 3-dot menu always visible on mobile */}
                <div
                  className="relative shrink-0 -mt-1 -mr-1"
                  ref={activeDropdown === `m-${uniqueId}` ? dropdownRef : null}
                >
                  <IconButton
                    aria-label={c.taskColAction || "Hành động"}
                    aria-expanded={activeDropdown === `m-${uniqueId}`}
                    aria-haspopup="menu"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === `m-${uniqueId}` ? null : `m-${uniqueId}`
                      )
                    }
                    variant="ghost"
                    size="xs"
                    className="text-[#990011]"
                    innerClassName="hover:bg-red-50 text-[#990011]"
                  >
                    <MoreVertical size={16} />
                  </IconButton>

                  {activeDropdown === `m-${uniqueId}` && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-1 min-w-[152px] bg-white border border-border rounded-2xl shadow-lg py-1 z-30 text-left whitespace-nowrap"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActiveDropdown(null)
                          navigate(`/workspace/courses/class/${item.classId}`)
                        }}
                        className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Eye size={14} className="text-gray-500 shrink-0" />
                        <span>{c.taskViewDetails || "Xem chi tiết"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: time + date */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-gray-500 font-medium">
                <span>
                  {c.taskColDueTime || "Giờ hết"}: <strong className="text-gray-700">{formatScheduleTime(item.dueDate) || "—"}</strong>
                </span>
                <span>
                  {c.taskColDueDate || "Ngày hết"}: <strong className="text-gray-700">{formatDate(item.dueDate) || "—"}</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Desktop View ─── */}
      <div className="hidden md:block w-full overflow-x-auto rounded-3xl border border-border bg-white shadow-xs">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs font-semibold text-gray-500">
          <thead>
            <tr className="border-b border-border bg-gray-50/60 text-gray-800 font-bold">
              <th className="p-4 border-r border-border w-[170px] min-w-[150px] whitespace-nowrap">
                {c.taskColCoverImage || c.coverImage || "Ảnh đại diện"}
              </th>
              <th className="p-4 border-r border-border min-w-[200px]">
                {c.taskColBelongsToCourse || c.belongsToCourse || "Thuộc khóa học"}
              </th>
              <th className="p-4 border-r border-border min-w-[260px]">
                {c.taskColTaskDescription || "Mô tả việc"}
              </th>
              <th className="p-4 border-r border-border w-[130px] min-w-[120px] text-center whitespace-nowrap">
                {c.taskColDueTime || "Giờ hết"}
              </th>
              <th className="p-4 border-r border-border w-[130px] min-w-[120px] text-center whitespace-nowrap">
                {c.taskColDueDate || "Ngày hết"}
              </th>
              <th className="p-4 w-[110px] text-center whitespace-nowrap">
                {c.taskColAction || c.action || "Hành động"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-gray-700">
            {tasks.map((item, idx) => {
              const uniqueId = item.id || `${item.taskType}-${item.classId}-${idx}`
              const pendingLabel = (c.taskPendingCount || "Còn {{count}} bài").replace("{{count}}", item.pendingCount ?? 0)

              return (
                <tr
                  key={uniqueId}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Ảnh đại diện */}
                  <td className="p-4 border-r border-border align-middle">
                    <img
                      src={item.thumbnailUrl || defaultCourseThumbnail}
                      alt={item.className || "Thumbnail"}
                      className="w-[140px] h-[120px] min-w-[140px] max-w-[140px] rounded-2xl bg-gray-200 shadow-xs shrink-0 object-cover"
                    />
                  </td>

                  {/* Thuộc khóa học */}
                  <td className="p-4 border-r border-border align-middle">
                    <h4 className="font-bold text-sm text-gray-950 leading-snug">
                      {c.taskColBelongsToCourse || "Khóa học"} (ID: {item.courseId})
                    </h4>
                  </td>

                  {/* Mô tả việc */}
                  <td className="p-4 border-r border-border align-middle">
                    <div className="flex flex-col gap-2">
                      <h4 className="font-bold text-sm text-gray-950 leading-snug">
                        {item.className}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {item.taskName} — {pendingLabel}
                      </p>

                      <div className="mt-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                          <span>{c.progress || "Tiến độ"}</span>
                          <span>{item.progressPercent ?? 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#990011] rounded-full transition-all duration-300" style={{ width: `${item.progressPercent ?? 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Giờ hết */}
                  <td className="p-4 border-r border-border text-center text-sm font-semibold text-gray-800 align-middle whitespace-nowrap">
                    {formatScheduleTime(item.dueDate) || "—"}
                  </td>

                  {/* Ngày hết */}
                  <td className="p-4 border-r border-border text-center text-sm font-semibold text-gray-800 align-middle whitespace-nowrap">
                    {formatDate(item.dueDate) || "—"}
                  </td>

                  {/* Hành động */}
                  <td className="p-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="relative inline-block"
                        ref={activeDropdown === uniqueId ? dropdownRef : null}
                      >
                        <IconButton
                          aria-label={c.taskColAction || "Hành động"}
                          aria-expanded={activeDropdown === uniqueId}
                          aria-haspopup="menu"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDropdown(activeDropdown === uniqueId ? null : uniqueId)
                          }}
                          variant="ghost"
                          size="xs"
                          className="text-[#990011]"
                          innerClassName="hover:bg-red-50 text-[#990011]"
                        >
                          <MoreVertical size={17} />
                        </IconButton>
                        {activeDropdown === uniqueId && (
                          <div
                            role="menu"
                            className="absolute right-0 mt-1 min-w-[152px] bg-white border border-border rounded-2xl shadow-md py-1 z-30 text-left whitespace-nowrap"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveDropdown(null)
                                navigate(`/workspace/courses/class/${item.classId}`)
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              <Eye size={14} className="text-gray-500 shrink-0" />
                              <span>{c.taskViewDetails || "Xem chi tiết"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TeachingTasksTable
