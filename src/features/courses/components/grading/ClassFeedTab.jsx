import React, { useMemo, useState } from "react"
import { Send } from "lucide-react"
import { toast } from "react-hot-toast"

import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useCreateClassPostMutation,
  useGetClassFeedQuery,
} from "@/store/api/coursesApi"

const getFeedArray = (response) => {
  const payload = response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  return null
}

const getPostTime = (post, language) => {
  if (typeof post?.time === "string" && post.time.trim()) return post.time
  if (!post?.createdAt) return "—"

  const date = new Date(post.createdAt)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US")
}

const ClassFeedTab = ({ id, isStudent }) => {
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const [newPostText, setNewPostText] = useState("")

  const {
    currentData: feedResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClassFeedQuery(id, { skip: !id || isStudent })
  const [createPost, { isLoading: isCreatingPost }] = useCreateClassPostMutation()

  const rawFeedPosts = useMemo(
    () => getFeedArray(feedResponse),
    [feedResponse],
  )
  const feedPosts = useMemo(() => {
    if (!Array.isArray(rawFeedPosts)) return []

    const seenIds = new Set()
    return rawFeedPosts.filter((post) => {
      if (!post || typeof post !== "object" || post.id === undefined || post.id === null) {
        return false
      }
      const idKey = String(post.id)
      if (seenIds.has(idKey)) return false
      seenIds.add(idKey)
      return true
    })
  }, [rawFeedPosts])
  const hasMalformedFeed = (
    feedResponse !== undefined
    && (rawFeedPosts === null || feedPosts.length !== rawFeedPosts.length)
  )

  const handleCreatePost = async (event) => {
    event.preventDefault()
    const content = newPostText.trim()
    if (!content || isCreatingPost) return

    try {
      await createPost({ classId: id, content }).unwrap()
      setNewPostText("")
      toast.success(cd.postPublished || "Announcement published.")
    } catch {
      toast.error(
        language === "vi"
          ? "Không thể đăng thông báo. Vui lòng thử lại."
          : "Could not publish the announcement. Please try again.",
      )
    }
  }

  if (isStudent) {
    return (
      <div
        className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-xs font-bold text-gray-500"
        role="status"
      >
        {language === "vi"
          ? "Tính năng đang phát triển."
          : "Feature is under development."}
      </div>
    )
  }

  if ((isLoading || isFetching) && feedResponse === undefined) {
    return (
      <div
        className="flex justify-center items-center py-12"
        role="status"
        aria-label={language === "vi" ? "Đang tải bảng tin" : "Loading class feed"}
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || hasMalformedFeed) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm font-semibold text-red-700"
      >
        <span>
          {language === "vi"
            ? "Không thể tải bảng tin của lớp."
            : "Could not load the class feed."}
        </span>
        <button
          type="button"
          onClick={refetch}
          disabled={isFetching}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-extrabold disabled:opacity-50"
        >
          {language === "vi" ? "Thử lại" : "Retry"}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <form
        onSubmit={handleCreatePost}
        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
      >
        <label htmlFor="class-feed-post" className="sr-only">
          {cd.feedFormPlaceholder || "Share an announcement"}
        </label>
        <textarea
          id="class-feed-post"
          rows={3}
          placeholder={cd.feedFormPlaceholder || "Share announcements, links, study resources..."}
          value={newPostText}
          onChange={(event) => setNewPostText(event.target.value)}
          className="w-full p-3 bg-gray-50 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all resize-none placeholder:text-gray-400"
        />
        <div className="flex justify-between items-center border-t border-gray-50 pt-2">
          <span className="text-[10px] text-gray-400 font-bold">
            {cd.postingAsInstructor || "Posting as Instructor"}
          </span>
          <button
            type="submit"
            disabled={isCreatingPost || !newPostText.trim()}
            aria-busy={isCreatingPost}
            className="h-8 px-4 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:bg-gray-250 disabled:text-gray-400"
          >
            {isCreatingPost ? (
              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            ) : (
              <Send size={12} />
            )}
            <span>{cd.publishButton || "Publish"}</span>
          </button>
        </div>
      </form>

      {isFetching && (
        <p className="text-xs font-semibold text-gray-500" role="status" aria-live="polite">
          {language === "vi" ? "Đang cập nhật bảng tin…" : "Refreshing the feed…"}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {feedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-xs text-gray-400 font-bold">
            {cd.noAnnouncements || "No announcements posted yet."}
          </div>
        ) : feedPosts.map((item) => {
          const authorName = String(
            item.authorName
            ?? item.author?.name
            ?? item.author
            ?? (language === "vi" ? "Giảng viên" : "Instructor"),
          )
          const roleLabel = typeof item.role === "string" ? item.role : null

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
            >
              <header className="flex items-center gap-2.5 border-b border-gray-50 pb-2">
                <span
                  className="w-8 h-8 rounded-full bg-gray-150 text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200"
                  aria-hidden="true"
                >
                  {authorName.charAt(0).toLocaleUpperCase()}
                </span>
                <span className="flex flex-col">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-800">{authorName}</span>
                    {roleLabel && (
                      <span className="bg-red-50 text-[#990011] text-[8px] font-black px-1.5 py-0.5 rounded">
                        {roleLabel}
                      </span>
                    )}
                  </span>
                  <time className="text-[9px] text-gray-400 font-semibold">
                    {getPostTime(item, language)}
                  </time>
                </span>
              </header>

              <p className="whitespace-pre-wrap break-words text-xs text-gray-600 font-medium leading-relaxed">
                {typeof item.content === "string" ? item.content : ""}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ClassFeedTab
