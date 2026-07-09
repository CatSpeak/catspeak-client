import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MoreVertical, Layers, Users, Trash2, PenSquare } from "lucide-react"
import StatusBadge from "./StatusBadge"
import ProgressBar from "./ProgressBar"
import useClickOutside from "@/shared/hooks/useClickOutside"
import CourseThumbnail from "./CourseThumbnail"

const CourseTable = ({ courses, t, onDelete }) => {
  const c = t.courses || {}
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setActiveDropdown(null), {
    enabled: activeDropdown !== null,
  })

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-700 font-extrabold uppercase tracking-wider">
            <th className="p-4 border-r border-gray-200 w-[160px]">{c.coverImage || "Ảnh đại diện"}</th>
            <th className="p-4 border-r border-gray-200">{c.courseInfo || "Thông tin khóa học"}</th>
            <th className="p-4 border-r border-gray-200 w-[140px]">{c.startDate || "Ngày mở"}</th>
            <th className="p-4 border-r border-gray-200 w-[140px]">{c.endDate || "Ngày hết"}</th>
            <th className="p-4 border-r border-gray-200 w-[130px]">{c.price || "Giá cả"}</th>
            <th className="p-4 w-[100px] text-center">{c.action || "Hành động"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-700">
          {courses.map((item) => (
            <tr key={item.id} onClick={() => navigate(`/workspace/courses/details/${item.id}`)} className="hover:bg-gray-50/60 cursor-pointer transition-colors">

              {/* Cover Image cell */}
              <td className="p-4 border-r border-gray-200">
                <CourseThumbnail
                  item={item}
                  title={item.title}
                  iconSize={28}
                  className="w-32 h-20 rounded-xl border border-gray-100"
                />
              </td>

              {/* Course Info cell */}
              <td className="p-4 border-r border-gray-200 min-w-[280px]">
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <StatusBadge
                      status={item.status}
                      label={
                        item.status === "TEACHING"
                          ? c.allCourses?.tabTeaching || "Teaching"
                          : item.status === "OPEN"
                            ? c.allCourses?.tabOpen || "Open Enrollment"
                            : item.status === "ARCHIVED"
                              ? c.allCourses?.tabArchived || "Archived"
                              : undefined
                      }
                    />
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Layers size={11} />
                      {item.classCount || "5 classes"}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {item.students}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar progress={item.progress} label={c.progress || "Tiến độ"} />
                </div>
              </td>

              {/* Start Date */}
              <td className="p-4 border-r border-gray-200 text-sm font-extrabold text-gray-800">
                {item.startDate}
              </td>

              {/* End Date */}
              <td className="p-4 border-r border-gray-200 text-sm font-extrabold text-gray-800">
                {item.endDate}
              </td>

              {/* Price */}
              <td className="p-4 border-r border-gray-200 text-sm font-extrabold text-gray-900">
                {item.price}
              </td>

              {/* Actions */}
              <td className="p-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                <div className="inline-block" ref={activeDropdown === item.id ? dropdownRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === item.id ? null : item.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 inline-flex p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdown === item.id && (
                    <div className="absolute right-4 mt-1 w-36 bg-white border border-gray-250 rounded-xl shadow-lg py-1 z-30 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(null);
                          navigate(`/workspace/courses/edit/${item.id}`);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <PenSquare size={13} className="text-gray-500" />
                        <span>{c.editCourse || "Edit Course"}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(null);
                          if (onDelete) onDelete(item.id);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <Trash2 size={13} />
                        <span>{c.courseDetail?.deleteCourse || "Delete Course"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CourseTable
