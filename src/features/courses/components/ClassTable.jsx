import React from "react"
import { useNavigate } from "react-router-dom"
import { MoreVertical, Calendar, Users, Clock } from "lucide-react"
import StatusBadge from "./StatusBadge"
import ProgressBar from "./ProgressBar"
import CourseThumbnail from "./CourseThumbnail"

const ClassTable = ({ classes, t, handleAction }) => {
  const c = t.courses || {}
  const navigate = useNavigate()

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-700 font-extrabold uppercase tracking-wider">
            <th className="p-4 border-r border-gray-200 w-[140px]">{c.coverImage || "Ảnh đại diện"}</th>
            <th className="p-4 border-r border-gray-200 w-[180px]">{c.belongsToCourse || "Thuộc khóa học"}</th>
            <th className="p-4 border-r border-gray-200">{c.classInfo || "Thông tin lớp học"}</th>
            <th className="p-4 border-r border-gray-200 w-[130px]">{c.startDate || "Ngày mở"}</th>
            <th className="p-4 border-r border-gray-200 w-[130px]">{c.endDate || "Ngày hết"}</th>
            <th className="p-4 border-r border-gray-200 w-[120px]">{c.price || "Giá cả"}</th>
            <th className="p-4 w-[90px] text-center">{c.action || "Hành động"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-700">
          {classes.map((item) => (
            <tr key={item.id} onClick={() => navigate(`/workspace/courses/class/${item.id}`)} className="hover:bg-gray-50/60 cursor-pointer transition-colors">

              {/* Cover Image cell */}
              <td className="p-4 border-r border-gray-200">
                <CourseThumbnail
                  item={item}
                  title={item.classTitle || item.title}
                  iconSize={22}
                  className="w-24 h-16 rounded-xl border border-gray-100"
                />
              </td>

              {/* Belongs to Course cell */}
              <td className="p-4 border-r border-gray-200 text-xs font-bold text-gray-700 min-w-[150px]">
                {item.courseTitle || "Luyện viết hiệu quả"}
              </td>

              {/* Class Info cell */}
              <td className="p-4 border-r border-gray-200 min-w-[280px]">
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <StatusBadge
                      status={item.status}
                      label={
                        item.status === "TEACHING"
                          ? c.allClasses?.tabTeaching || "Teaching"
                          : item.status === "OPEN"
                            ? c.allClasses?.tabOpen || "Open Enrollment"
                            : item.status === "ARCHIVED"
                              ? c.allClasses?.tabArchived || "Archived"
                              : undefined
                      }
                    />
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                    {item.classTitle || item.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-400 font-bold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Calendar size={11} />
                      {item.schedule}
                    </span>
                    <span className="flex items-center gap-1.5 justify-end truncate">
                      <Users size={11} />
                      {item.students}
                    </span>
                    <span className="flex items-center gap-1.5 col-span-2 truncate">
                      <Clock size={11} />
                      {item.time}
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
              <td className="p-4 text-center">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction("Options", item.classTitle || item.title); }}
                  className="text-gray-400 hover:text-gray-600 inline-flex p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClassTable
