import React, { useState, useMemo } from "react"
import { Send, MoreVertical, MessageSquare } from "lucide-react"
import { useGetClassFeedQuery, useCreateClassPostMutation } from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { toast } from "react-hot-toast"
import { MOCK_FEED } from "./classMockData"

// Toggle switch: set to false to use real API endpoint after backend is ready
const USE_MOCK = true

const ClassFeedTab = ({ id, isStudent, language, cd }) => {
  const { data: feedResponse, isLoading, error } = useGetClassFeedQuery(id, { skip: USE_MOCK })
  const [createPost, { isLoading: isCreatingPost }] = useCreateClassPostMutation()

  const [newPostText, setNewPostText] = useState("")
  const [localLikes, setLocalLikes] = useState({}) // { postId: { count, isLiked } }
  const [localPosts, setLocalPosts] = useState([])

  const feedPosts = useMemo(() => {
    const baseFeed = USE_MOCK
      ? MOCK_FEED
      : (feedResponse?.data || feedResponse?.items || feedResponse || [])
    return [...localPosts, ...baseFeed]
  }, [feedResponse, localPosts])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPostText.trim()) return

    if (USE_MOCK) {
      const newPost = {
        id: `f_${Date.now()}`,
        author: "John Doe",
        role: "Lead Instructor",
        time: "Just now",
        content: newPostText,
        commentsCount: 0,
        likes: 0,
        isLiked: false
      }
      setLocalPosts(prev => [newPost, ...prev])
      setNewPostText("")
      toast.success(cd.postPublished || "Đã đăng bảng tin thành công (Mock)!")
      return
    }

    try {
      await createPost({ classId: id, content: newPostText }).unwrap()
      setNewPostText("")
      toast.success(cd.postPublished || "Đã đăng bảng tin thành công!")
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to create post")
    }
  }

  const handleLikeToggle = (item) => {
    const current = localLikes[item.id] || { count: item.likes || 0, isLiked: item.isLiked || false }
    const newIsLiked = !current.isLiked
    const newCount = newIsLiked ? current.count + 1 : current.count - 1
    setLocalLikes(prev => ({
      ...prev,
      [item.id]: { count: newCount, isLiked: newIsLiked }
    }))
    toast.success(newIsLiked ? "Liked post" : "Unliked post")
  }

  if (!USE_MOCK && isLoading) {
    return <LoadingSpinner className="flex justify-center items-center py-12" />
  }

  if (!USE_MOCK && error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Failed to load class feed: {error.message || "Unknown error"}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Create Post Form (Hidden for students) */}
        {!isStudent && (
          <form onSubmit={handleCreatePost} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
            <textarea
              rows={3}
              placeholder={language === "vi" ? "Chia sẻ tin tức, tài liệu học tập với lớp..." : "Share announcements, links, study resources..."}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all resize-none placeholder:text-gray-400"
            />
            <div className="flex justify-between items-center border-t border-gray-50 pt-2">
              <span className="text-[10px] text-gray-400 font-bold">{language === "vi" ? "Đăng với tư cách giảng viên" : "Posting as Instructor"}</span>
              <button
                type="submit"
                disabled={isCreatingPost}
                className="h-8 px-4 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:bg-gray-250 disabled:text-gray-400"
              >
                {isCreatingPost ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <>
                    <Send size={12} />
                    <span>{language === "vi" ? "Đăng bài" : "Publish"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* List of feed items */}
        <div className="flex flex-col gap-3">
          {feedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-xs text-gray-400 font-bold">
              {language === "vi" ? "Chưa có thông báo nào." : "No announcements posted yet."}
            </div>
          ) : (
            feedPosts.map((item) => {
              const likesState = localLikes[item.id] || { count: item.likes || 0, isLiked: item.isLiked || false }
              const authorName = item.author || "John Doe"
              const roleLabel = item.role || "Lead Instructor"

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-150 text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200">
                        {authorName[0]}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-gray-800">{authorName}</span>
                          <span className="bg-red-50 text-[#990011] text-[8px] font-black px-1.5 py-0.5 rounded">
                            {roleLabel}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold">{item.time || "Just now"}</span>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-2 mt-1">
                    <button
                      onClick={() => handleLikeToggle(item)}
                      className={`hover:text-[#990011] transition-colors ${likesState.isLiked ? "text-[#990011]" : ""}`}
                    >
                      Like ({likesState.count})
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => toast.success("Opening comments...")}
                      className="hover:text-[#990011] transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={11} />
                      Comment ({item.commentsCount || 0})
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Side Announcements widgets */}
      <div className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit">
        <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest border-b border-gray-55 pb-1.5">
          {language === "vi" ? "Thông báo lớp học" : "Class Announcements"}
        </h4>
        <div className="flex flex-col gap-3 text-xs font-semibold">
          <div className="p-2.5 bg-yellow-50/40 border border-yellow-100 rounded-xl text-yellow-800">
            <span className="font-extrabold block mb-0.5">Quiz Notice:</span>
            Vocabulary quiz is scheduled on Next Monday. Make sure to complete revisions.
          </div>
          <div className="p-2.5 bg-purple-50/40 border border-purple-100 rounded-xl text-purple-800">
            <span className="font-extrabold block mb-0.5">Project Upload:</span>
            Submit your self-intro project PDF onto materials panel.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassFeedTab
