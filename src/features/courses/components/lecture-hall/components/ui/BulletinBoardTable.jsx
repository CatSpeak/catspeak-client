import React from "react"
import { Pin, MoreVertical, Eye, EyeOff, PinOff, MessageSquare, MessageSquareOff, Edit3, Trash2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { IconButton } from "@/shared/components/ui/buttons"

const BulletinBoardTable = ({ posts, dict, language, isStudent, onRowClick, onAction }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-xs font-semibold text-[#5B403C]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-700 font-extrabold uppercase tracking-wider">
            <th className="p-4 border-r border-gray-200 w-[50px] text-center"></th>
            <th className="p-4 border-r border-gray-200 min-w-[250px]">{dict.bulletinBoard?.topic || "Topic"}</th>
            <th className="p-4 border-r border-gray-200 w-[200px]">{dict.bulletinBoard?.creator || "Creator"}</th>
            <th className="p-4 border-r border-gray-200 w-[150px]">{dict.bulletinBoard?.createdAt || "Created at"}</th>
            <th className="p-4 border-r border-gray-200 w-[100px] text-center">{dict.bulletinBoard?.replies || "Replies"}</th>
            {!isStudent && (
              <>
                <th className="p-4 border-r border-gray-200 w-[140px]">{language === 'vi' ? "Bình luận" : "Comments"}</th>
                <th className="p-4 border-r border-gray-200 w-[130px]">{dict.bulletinBoard?.status || "Status"}</th>
                <th className="p-4 w-[60px] text-center"></th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-[#191C1D]">
          {posts.map((post) => (
            <tr
              key={post.id}
              onClick={() => onRowClick(post)}
              className="hover:bg-gray-50/60 cursor-pointer transition-colors"
            >
              {/* Pin cell */}
              <td className="p-4 border-r border-gray-200 text-center">
                {post.isPinned && (
                  <Pin
                    size={16}
                    className="inline-block text-[#FEA53F] fill-[#FEA53F]"
                    aria-label={dict.bulletinBoard?.pinnedPostTooltip}
                  />
                )}
              </td>

              {/* Title cell */}
              <td className="p-4 border-r border-gray-200">
                <span className="font-bold text-sm text-[#A00000] hover:underline hover:text-[#750000] transition-colors line-clamp-2">
                  {post.title}
                </span>
              </td>

              {/* Author cell */}
              <td className="p-4 border-r border-gray-200 text-sm font-normal">
                {post.author}
              </td>

              {/* Date cell */}
              <td className="p-4 border-r border-gray-200 text-sm font-normal text-gray-600">
                {post.date}
              </td>

              {/* Replies cell */}
              <td className="p-4 border-r border-gray-200 text-center">
                <span className="inline-flex items-center justify-center bg-[#E7E8E9] text-[#191C1D] font-bold text-xs h-6 px-2.5 py-1 rounded-md">
                  {post.replies}
                </span>
              </td>

              {/* Teacher only columns */}
              {!isStudent && (
                <>
                  {/* Allow Reply */}
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.allowReply ? 'bg-[#750000]' : 'bg-[#E2E2E2]'}`} />
                      <span className={`font-medium ${post.allowReply ? 'text-[#750000]' : 'text-[#5B403C]'}`}>
                        {post.allowReply
                          ? (language === 'vi' ? "Cho phép" : "Allowed")
                          : (language === 'vi' ? "Không cho phép" : "Not allowed")}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.status === dict.bulletinBoard?.visibility?.visible ? 'bg-[#750000]' : 'bg-[#E2E2E2]'}`} />
                      <span className={`font-medium ${post.status === dict.bulletinBoard?.visibility?.visible ? 'text-[#750000]' : 'text-[#5B403C]'}`}>
                        {post.status}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <IconButton
                            variant="ghost"
                            title={dict.bulletinBoard?.postActionsTooltip || "Actions"}
                            aria-label={dict.bulletinBoard?.postActionsTooltip || "Actions"}
                          >
                            <MoreVertical size={18} color="#5B403C" />
                          </IconButton>
                        }
                        options={[
                          {
                            value: 'toggleVisibility',
                            label: post.isVisibleToStudents ? dict.bulletinBoard?.visibility?.hideItem : dict.bulletinBoard?.visibility?.showItem,
                            icon: post.isVisibleToStudents ? <EyeOff size={14} /> : <Eye size={14} />
                          },
                          {
                            value: 'togglePin',
                            label: post.isPinned ? dict.bulletinBoard?.visibility?.unpin : dict.bulletinBoard?.visibility?.pin,
                            icon: post.isPinned ? <PinOff size={14} /> : <Pin size={14} />
                          },
                          {
                            value: 'toggleReply',
                            label: post.allowReply ? dict.bulletinBoard?.visibility?.disableReply : dict.bulletinBoard?.visibility?.enableReply,
                            icon: post.allowReply ? <MessageSquareOff size={14} /> : <MessageSquare size={14} />
                          },
                          {
                            value: 'edit',
                            label: dict.bulletinBoard?.edit,
                            icon: <Edit3 size={14} />
                          },
                          {
                            value: 'delete',
                            label: dict.bulletinBoard?.delete,
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
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BulletinBoardTable
