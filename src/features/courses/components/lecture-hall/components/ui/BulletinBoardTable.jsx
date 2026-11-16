import React from "react"
import { Pin, MoreVertical, Eye, EyeOff, MessageSquare, Search, SlidersHorizontal, Edit3, Trash2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

const BulletinBoardTable = ({ posts, dict, language, isStudent, onRowClick, onAction }) => {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#3F3F3F]">
      <table className="w-full border-collapse text-left text-sm text-[#191C1D] dark:text-gray-200">
        <thead>
          <tr className="bg-[#F8F9FA] dark:bg-[#222222] text-[#5B403C] dark:text-gray-300 border-b border-[#E2E2E2] dark:border-[#3F3F3F]">
            <th className="p-4 py-6 font-semibold text-center border-r border-[#E2E2E2] dark:border-[#3F3F3F] w-[80px]">
              Ghim
            </th>
            <th className="p-4 py-6 font-semibold border-r border-[#E2E2E2] dark:border-[#3F3F3F] min-w-[250px]">
              <div className="flex items-center justify-between">
                <span>Tiêu đề bài viết</span>
                <Search size={14} className="text-[#990011] dark:text-[#FF6B6B]" strokeWidth={2.5} />
              </div>
            </th>
            <th className="p-4 py-6 font-semibold border-r border-[#E2E2E2] dark:border-[#3F3F3F] w-[180px]">
              <div className="flex items-center justify-between">
                <span>Ngày tạo</span>
                <SlidersHorizontal size={14} className="text-[#990011] dark:text-[#FF6B6B]" strokeWidth={2.5} />
              </div>
            </th>
            <th className="p-4 py-6 font-semibold border-r border-[#E2E2E2] dark:border-[#3F3F3F] w-[300px]">
              <div className="flex items-center justify-between">
                <span>Người đăng</span>
                <SlidersHorizontal size={14} className="text-[#990011] dark:text-[#FF6B6B]" strokeWidth={2.5} />
              </div>
            </th>
            <th className="p-4 py-6 font-semibold border-r border-[#E2E2E2] dark:border-[#3F3F3F] w-[120px]">
              <div className="flex items-center justify-between">
                <span>Phản hồi</span>
                <SlidersHorizontal size={14} className="text-[#990011] dark:text-[#FF6B6B]" strokeWidth={2.5} />
              </div>
            </th>
            <th className="p-4 py-6 font-semibold text-center w-[160px]">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#3F3F3F]">
          {posts.map((post) => {
            const dateStr = post.date || "31/08/2026"
            const timeStr = "10:30"
            
            return (
              <tr
                key={post.id}
                onClick={() => onRowClick(post)}
                className="hover:bg-gray-50/50 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors"
              >
                {/* Pin cell */}
                <td className="p-6 border-r border-[#E2E2E2] dark:border-[#3F3F3F] text-center align-middle">
                  {post.isPinned && (
                    <Pin
                      size={20}
                      className="inline-block text-[#E2B60A]"
                      strokeWidth={2}
                    />
                  )}
                </td>

                {/* Title cell */}
                <td className="p-6 border-r border-[#E2E2E2] dark:border-[#3F3F3F] align-middle">
                  <span className="font-bold text-base text-[#191C1D] dark:text-white line-clamp-2">
                    {post.title}
                  </span>
                </td>

                {/* Date cell */}
                <td className="p-6 border-r border-[#E2E2E2] dark:border-[#3F3F3F] align-middle">
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-medium text-[#191C1D] dark:text-white">{dateStr}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{timeStr}</span>
                  </div>
                </td>

                {/* Author cell */}
                <td className="p-6 border-r border-[#E2E2E2] dark:border-[#3F3F3F] align-middle">
                  {post.author === "Tôi" || post.author === "ChatGPT" ? (
                    <span className="text-[15px] font-medium text-[#191C1D] dark:text-white">{post.author}</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-[#333333] rounded-full flex-shrink-0" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-medium text-[#191C1D] dark:text-white">
                          {post.author || "Người dùng"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="text-[10px]">🕒</span> Last update: 3 min ago
                        </span>
                      </div>
                    </div>
                  )}
                </td>

                {/* Replies cell */}
                <td className="p-6 border-r border-[#E2E2E2] dark:border-[#3F3F3F] text-center align-middle">
                  <span className="text-[15px] font-medium text-[#191C1D] dark:text-white">
                    {post.replies > 0 ? post.replies : "–"}
                  </span>
                </td>

                {/* Actions cell */}
                <td className="p-6 text-center align-middle">
                  <div className="flex items-center justify-center gap-4 text-[#990011] dark:text-[#FF6B6B]" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button" 
                      className="hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-full transition-colors"
                      onClick={() => onAction('toggleReply', post.id)}
                    >
                      <MessageSquare size={18} strokeWidth={2} />
                    </button>
                    <button 
                      type="button" 
                      className="hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-full transition-colors"
                      onClick={() => onAction('toggleVisibility', post.id)}
                    >
                      {post.status === dict.bulletinBoard?.visibility?.visible ? (
                        <Eye size={18} strokeWidth={2} />
                      ) : (
                        <EyeOff size={18} strokeWidth={2} />
                      )}
                    </button>
                    
                    <Dropdown
                      trigger={
                        <button 
                          type="button" 
                          className="hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-full transition-colors"
                        >
                          <MoreVertical size={18} strokeWidth={2} />
                        </button>
                      }
                      options={[
                        {
                          value: 'edit',
                          label: dict.bulletinBoard?.edit || "Chỉnh sửa",
                          icon: <Edit3 size={14} />
                        },
                        {
                          value: 'togglePin',
                          label: post.isPinned ? "Bỏ ghim" : "Ghim bài",
                          icon: <Pin size={14} />
                        },
                        {
                          value: 'delete',
                          label: dict.bulletinBoard?.delete || "Xóa",
                          icon: <Trash2 size={14} color="#EF4444" />,
                          color: "#EF4444"
                        }
                      ]}
                      onChange={(val) => onAction(val, post.id)}
                      align="right"
                      dropdownClassName="w-48"
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default BulletinBoardTable
