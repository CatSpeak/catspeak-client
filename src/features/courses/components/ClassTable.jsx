import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Users, Clock, Eye, MoreVertical, PenSquare, Trash2 } from "lucide-react"
import useClickOutside from "@/shared/hooks/useClickOutside"
import { IconButton } from "@/shared/components/ui/buttons"
import CourseThumbnail from "./CourseThumbnail"
import CourseStatusPill from "./CourseStatusPill"

const ClassTable = ({ classes, t, onEdit, onDelete }) => {
  const c = t.courses || {}
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setActiveDropdown(null), {
    enabled: activeDropdown !== null,
  })

  return (
    <div className="w-full">
      {/* ─── Mobile View (< md): Clean, Responsive Cards without horizontal scrolling ─── */}
      <div className="flex flex-col gap-3.5 md:hidden">
        {classes.map((item) => {
          const isFree =
            item.isFree ||
            item.price === "0đ" ||
            item.price === "Miễn phí" ||
            item.price === "Free" ||
            item.price === "免费" ||
            item.price === c.free

          return (
            <div
              key={`mobile-${item.id}`}
              onClick={() => navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)}
              className="bg-white rounded-3xl border border-border/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-3 group"
            >
              {/* Header: Thumbnail + Title + Status + 3-dots */}
              <div className="flex items-start gap-3">
                <CourseThumbnail
                  item={item}
                  title={item.classTitle || item.title}
                  className="w-20 h-16 min-w-[80px] max-w-[80px] rounded-2xl bg-slate-100 shadow-2xs shrink-0 overflow-hidden"
                  imageClassName="w-full h-full object-cover"
                />
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CourseStatusPill status={item.status} />
                    {item.level && (
                      <span className="h-6 min-w-[24px] px-1.5 rounded-full bg-[#F59E0B] text-white font-bold text-[11px] inline-flex items-center justify-center shrink-0 shadow-xs leading-none aspect-square">
                        {item.level}
                      </span>
                    )}
                  </div>
                  <h4
                    className="font-bold text-sm text-gray-950 truncate group-hover:text-[#990011] transition-colors leading-snug"
                    title={item.classTitle || item.title}
                  >
                    {item.classTitle || item.title}
                  </h4>
                </div>

                {/* Mobile Action Menu */}
                <div className="relative shrink-0 -mt-1 -mr-1" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    aria-label={(c.actionsForClass || "Actions for {{title}}")
                      .replace("{{title}}", item.classTitle || item.title || c.classLabel || "class")}
                    aria-expanded={activeDropdown === `m-${item.id}`}
                    aria-haspopup="menu"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === `m-${item.id}` ? null : `m-${item.id}`)
                    }}
                    variant="ghost"
                    size="xs"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                  {activeDropdown === `m-${item.id}` && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-1 min-w-[152px] bg-white border border-border rounded-2xl shadow-lg py-1 z-30 text-left whitespace-nowrap"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdown(null)
                          navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)
                        }}
                        className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Eye size={14} className="text-gray-500 shrink-0" />
                        <span>{c.viewDetails || "Xem chi tiết"}</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdown(null)
                          if (onEdit) onEdit(item)
                          else navigate(`/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`)
                        }}
                        className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-border/60 cursor-pointer"
                      >
                        <PenSquare size={14} className="text-gray-500 shrink-0" />
                        <span>{c.editClass || "Chỉnh sửa"}</span>
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDropdown(null)
                            onDelete(item.id)
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-border/60 cursor-pointer"
                        >
                          <Trash2 size={14} className="shrink-0" />
                          <span>{c.deleteClass || "Xóa"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Info Panel */}
              <div className="bg-gray-50/80 rounded-2xl p-2.5 text-xs text-gray-600 flex flex-col gap-1.5 border border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 font-medium text-[11px]">{c.belongsToCourse || "Thuộc khóa học"}:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[180px]">
                    {item.courseTitle || c.standaloneClass || "Lớp độc lập"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={13} className="text-gray-400 shrink-0" />
                    <span>{item.schedule || "—"}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <Users size={13} className="text-gray-400 shrink-0" />
                    <span>{item.students || "0"}</span>
                  </span>
                </div>

                {(item.startDate || item.endDate) && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <span className="text-gray-400">{c.startDate || "Ngày mở"}: <strong className="text-gray-700 font-semibold">{item.startDate || "—"}</strong></span>
                    <span className="text-gray-400">{c.endDate || "Ngày hết"}: <strong className="text-gray-700 font-semibold">{item.endDate || "—"}</strong></span>
                  </div>
                )}
              </div>

              {/* Footer: Price & Progress */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">{c.price || "Giá cả"}:</span>
                    <span className={`text-sm font-bold ${isFree ? "text-[#16A34A]" : "text-gray-950"}`}>
                      {isFree ? (c.free || "Miễn phí") : (item.price || "—")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <span>{c.progress || "Tiến độ"}:</span>
                    <span className="font-bold text-[#8B0000]">{item.progress ?? 0}%</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
                    style={{ width: `${item.progress ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Desktop View (>= md): Full 7-Column Table ─── */}
      <div className="hidden md:block w-full overflow-x-auto rounded-3xl border border-border bg-white shadow-xs">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs font-semibold text-gray-500">
          <thead>
            <tr className="border-b border-border bg-gray-50/60 text-gray-800 font-bold">
              <th className="p-4 border-r border-border w-[170px] min-w-[150px]">
                {c.coverImage || "Ảnh đại diện"}
              </th>
              <th className="p-4 border-r border-border w-[160px] min-w-[140px]">
                {c.belongsToCourse || "Thuộc khóa học"}
              </th>
              <th className="p-4 border-r border-border min-w-[280px]">
                {c.classInfo || "Thông tin lớp học"}
              </th>
              <th className="p-4 border-r border-border w-[130px] min-w-[110px]">
                {c.startDate || "Ngày mở"}
              </th>
              <th className="p-4 border-r border-border w-[130px] min-w-[110px]">
                {c.endDate || "Ngày hết"}
              </th>
              <th className="p-4 border-r border-border w-[140px] min-w-[120px]">
                {c.price || "Giá cả"}
              </th>
              <th className="p-4 w-[110px] text-center">{c.action || "Hành động"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-gray-700">
            {classes.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)}
                onKeyDown={(event) => {
                  if (event.currentTarget === event.target && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault()
                    navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)
                  }
                }}
                tabIndex={0}
                className="hover:bg-gray-50/70 cursor-pointer transition-colors group"
              >
                {/* Cover Image cell with fixed frame */}
                <td className="p-4 border-r border-border align-middle">
                  <CourseThumbnail
                    item={item}
                    title={item.classTitle || item.title}
                    className="w-[140px] h-[88px] min-w-[140px] max-w-[140px] min-h-[88px] max-h-[88px] rounded-2xl bg-slate-100 shadow-xs shrink-0 overflow-hidden"
                    imageClassName="w-full h-full object-cover"
                  />
                </td>

                {/* Belongs to Course cell */}
                <td className="p-4 border-r border-border text-xs font-bold text-gray-700 min-w-[150px] align-middle">
                  {item.courseTitle || c.standaloneClass || "Lớp độc lập"}
                </td>

                {/* Class Info cell */}
                <td className="p-4 border-r border-border min-w-[280px] align-middle">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <CourseStatusPill status={item.status} />
                      {item.level && (
                        <span className="h-6 min-w-[24px] px-1.5 rounded-full bg-[#F59E0B] text-white font-bold text-[11px] inline-flex items-center justify-center shrink-0 shadow-xs leading-none aspect-square">
                          {item.level}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-gray-950 leading-snug group-hover:text-[#990011] transition-colors line-clamp-1" title={item.classTitle || item.title}>
                      {item.classTitle || item.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 truncate">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        {item.schedule}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Users size={13} className="text-gray-400 shrink-0" />
                        {item.students}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <Clock size={13} className="text-gray-400 shrink-0" />
                      <span>{item.time}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700">
                        <span>{c.progress || "Tiến độ"}</span>
                        <span className="font-bold text-gray-950">{item.progress ?? 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>

                {/* Start Date */}
                <td className="p-4 border-r border-border text-sm font-semibold text-gray-800 align-middle">
                  {item.startDate || "—"}
                </td>

                {/* End Date */}
                <td className="p-4 border-r border-border text-sm font-semibold text-gray-800 align-middle">
                  {item.endDate || "—"}
                </td>

                {/* Price */}
                <td className="p-4 border-r border-border text-sm sm:text-base font-extrabold text-gray-950 align-middle">
                  {item.isFree || item.price === "0đ" || item.price === "Miễn phí" || item.price === "Free" || item.price === "免费" || item.price === c.free ? (
                    <span className="text-[#16A34A]">{c.free || "Miễn phí"}</span>
                  ) : (
                    item.price || "—"
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    {/* View Details Eye button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)
                      }}
                      title={c.viewDetails || "Xem chi tiết"}
                      variant="ghost"
                      size="xs"
                      className="text-[#990011]"
                      innerClassName="hover:bg-red-50 text-[#990011]"
                    >
                      <Eye size={17} />
                    </IconButton>

                    {/* 3-dots Menu button */}
                    <div className="relative inline-block" ref={activeDropdown === item.id ? dropdownRef : null}>
                      <IconButton
                        aria-label={(c.actionsForClass || "Actions for {{title}}")
                          .replace("{{title}}", item.classTitle || item.title || c.classLabel || "class")}
                        aria-expanded={activeDropdown === item.id}
                        aria-haspopup="menu"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdown(activeDropdown === item.id ? null : item.id)
                        }}
                        variant="ghost"
                        size="xs"
                        className="text-[#990011]"
                        innerClassName="hover:bg-red-50 text-[#990011]"
                      >
                        <MoreVertical size={17} />
                      </IconButton>
                      {activeDropdown === item.id && (
                        <div role="menu" className="absolute right-0 mt-1 min-w-[152px] bg-white border border-border rounded-2xl shadow-md py-1 z-30 text-left whitespace-nowrap">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(null)
                              if (onEdit) onEdit(item)
                              else navigate(`/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                          >
                            <PenSquare size={14} className="text-gray-500 shrink-0" />
                            <span>{c.editClass || "Chỉnh sửa"}</span>
                          </button>
                          {onDelete && (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveDropdown(null)
                                onDelete(item.id)
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-border cursor-pointer whitespace-nowrap"
                            >
                              <Trash2 size={14} className="shrink-0" />
                              <span>{c.deleteClass || "Xóa"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClassTable
