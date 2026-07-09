import React, { useState } from "react"
import { 
  X, Plus, Globe, Copy, Check, ShieldAlert, Award, CalendarDays,
  Facebook, Send, MessageSquareCode
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import toast from "react-hot-toast"
import { 
  useGetPlaylistsQuery, 
  useCreatePlaylistMutation, 
  useBookmarkReelMutation,
  useReportReelMutation,
  useGetAboutAccountQuery,
  useHideReelPreferenceMutation
} from "@/store/api/reelsApi"

/* ==========================================================================
   1. BOOKMARK / PLAYLIST MODAL
   ========================================================================== */
export function BookmarkModal({ isOpen, onClose, reelId }) {
  const { data: playlists = [], isLoading } = useGetPlaylistsQuery(undefined, { skip: !isOpen })
  const [createPlaylist] = useCreatePlaylistMutation()
  const [bookmarkReel] = useBookmarkReelMutation()
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  if (!isOpen) return null

  const handleToggle = async (playlistId) => {
    try {
      const res = await bookmarkReel({ reelId, playlistId }).unwrap()
      toast.success(res.message || "Đã cập nhật bộ sưu tập")
    } catch (err) {
      toast.error(err.data?.message || "Lỗi lưu video")
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return
    try {
      await createPlaylist(newPlaylistName.trim()).unwrap()
      setNewPlaylistName("")
      setShowCreate(false)
      toast.success("Đã tạo danh sách phát mới")
    } catch (err) {
      toast.error(err.data?.message || "Lỗi tạo danh sách phát")
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Lưu vào bộ sưu tập</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full border-none outline-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-60 overflow-y-auto space-y-3">
          {isLoading ? (
            <p className="text-gray-400 text-sm text-center py-4">Đang tải...</p>
          ) : playlists.length === 0 && !showCreate ? (
            <p className="text-gray-400 text-sm text-center py-4">Chưa có danh sách phát nào.</p>
          ) : (
            playlists.map((playlist) => {
              const isSaved = playlist.bookmarksCount > 0 // Or check from API if reel is in playlist
              return (
                <label key={playlist.playlistId} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">{playlist.name}</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-cath-red-700 border-gray-300 focus:ring-cath-red-600"
                    onChange={() => handleToggle(playlist.playlistId)}
                  />
                </label>
              )
            })
          )}
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm outline-none"
            >
              <Plus size={16} />
              Tạo danh sách phát mới
            </button>
          ) : (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Tên danh sách phát..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-cath-red-700 text-sm"
              />
              <button
                type="submit"
                className="bg-cath-red-700 text-white font-semibold px-4 rounded-xl hover:bg-cath-red-600 transition-all cursor-pointer text-sm border-none outline-none"
              >
                Tạo
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="bg-white border border-gray-200 text-gray-600 px-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer text-sm outline-none"
              >
                Hủy
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. SHARE MODAL
   ========================================================================== */
export function ShareModal({ isOpen, onClose, reel }) {
  const [copied, setCopied] = useState(false)
  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/reels/${reel?.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Đã sao chép liên kết!")
    setTimeout(() => setCopied(false), 2000)
  }

  const platforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Messenger",
      icon: Send,
      color: "bg-[#0084FF]",
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=12345`
    },
    {
      name: "Zalo",
      icon: MessageSquareCode,
      color: "bg-[#0068FF]",
      url: `https://chat.zalo.me/?url=${encodeURIComponent(shareUrl)}`
    }
  ]

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Chia sẻ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full border-none outline-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Direct Platform Intents */}
          <div className="grid grid-cols-3 gap-4">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group decoration-none"
              >
                <div className={`w-12 h-12 ${p.color} text-white rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                  <p.icon size={22} />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{p.name}</span>
              </a>
            ))}
          </div>

          {/* Copy URL */}
          <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent border-none text-xs text-gray-500 outline-none px-2 min-w-0"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-cath-red-700 hover:bg-cath-red-600 text-white font-semibold text-xs rounded-lg transition-all border-none outline-none cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Đã chép" : "Sao chép"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   3. NOT INTERESTED PREFERENCE MODAL
   ========================================================================== */
export function NotInterestedModal({ isOpen, onClose, reel, onNext }) {
  const [hidePreference] = useHideReelPreferenceMutation()
  if (!isOpen) return null

  const handleAction = async (type, value) => {
    try {
      await hidePreference({ reelId: reel.id, type, value }).unwrap()
      toast.success("Chúng tôi sẽ hạn chế hiển thị nội dung này.")
      onClose()
      if (onNext) onNext()
    } catch {
      toast.error("Lỗi cập nhật tùy chọn.")
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Ẩn nội dung</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full border-none outline-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => handleAction("Video")}
            className="w-full text-left p-3.5 hover:bg-gray-50 rounded-xl transition-colors font-semibold text-gray-800 border-none bg-transparent cursor-pointer outline-none"
          >
            Không quan tâm video này
          </button>
          {reel.accountId && (
            <button
              onClick={() => handleAction("Creator", reel.accountId)}
              className="w-full text-left p-3.5 hover:bg-gray-50 rounded-xl transition-colors font-semibold text-gray-800 border-none bg-transparent cursor-pointer outline-none"
            >
              Ẩn tất cả video từ @{reel.username}
            </button>
          )}
          {reel.hashtags && reel.hashtags.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-wider block mb-2">Ẩn hashtag</span>
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {reel.hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAction("Hashtags", tag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full border-none outline-none cursor-pointer transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   4. ABOUT THIS ACCOUNT MODAL
   ========================================================================== */
export function AboutAccountModal({ isOpen, onClose, accountId }) {
  const { data: about, isLoading } = useGetAboutAccountQuery(accountId, { skip: !isOpen || !accountId })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Giới thiệu tài khoản</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full border-none outline-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <p className="text-gray-400 text-sm">Đang tải...</p>
          </div>
        ) : !about ? (
          <div className="p-10">
            <p className="text-gray-400 text-sm">Không thể tải thông tin.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Header info */}
            <div className="flex flex-col items-center mb-6">
              <Avatar src={about.avatarUrl} alt={about.username} size="lg" className="mb-3 border border-gray-100 shadow-sm" />
              <h4 className="font-bold text-gray-900 text-base">{about.nickname || about.username}</h4>
              <span className="text-xs text-gray-500">@{about.username}</span>
            </div>

            {/* Profile authority info */}
            <div className="flex justify-around items-center p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
              <div className="text-center">
                <span className="text-[20px] font-bold text-gray-800 block">{about.totalReelsUploaded}</span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Video</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <span className="text-[20px] font-bold text-gray-800 block">{about.totalReelLikesReceived}</span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Yêu thích</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <span className="text-[20px] font-bold text-gray-800 block">{about.followersCount}</span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Followers</span>
              </div>
            </div>

            {/* Account Metadata details */}
            <div className="space-y-4 text-left border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" />
                  Ngày tham gia
                </span>
                <span className="text-gray-800 font-bold">{new Date(about.joinedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold flex items-center gap-2">
                  <Award size={16} className="text-gray-400" />
                  Trạng thái
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  about.standing === "Good" ? "bg-green-50 text-green-700" :
                  about.standing === "Restricted" ? "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {about.standing === "Good" ? "Xuất sắc" : 
                   about.standing === "Restricted" ? "Hạn chế" : "Bị đình chỉ"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold flex items-center gap-2">
                  <Globe size={16} className="text-gray-400" />
                  Quốc gia
                </span>
                <span className="text-gray-800 font-bold">Việt Nam</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   5. REPORT REEL MODAL
   ========================================================================== */
export function ReportReelModal({ isOpen, onClose, reelId }) {
  const [reportReel] = useReportReelMutation()
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const categories = [
    { value: "Inappropriate", label: "Nội dung 18+ / Nhạy cảm" },
    { value: "Violence", label: "Bạo lực / Máu me" },
    { value: "HateSpeech", label: "Ngôn từ thù hận / Phân biệt" },
    { value: "Spam", label: "Spam / Tin giả" },
    { value: "Harassment", label: "Quấy rối / Bắt nạt" }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category) {
      toast.error("Vui lòng chọn lý do báo cáo.")
      return
    }
    setSubmitting(true)
    try {
      await reportReel({ reelId, category, description }).unwrap()
      toast.success("Báo cáo thành công. Cảm ơn đóng góp của bạn!")
      onClose()
    } catch {
      toast.error("Gửi báo cáo thất bại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Báo cáo vi phạm</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full border-none outline-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">Chọn lý do</span>
            {categories.map((c) => (
              <label key={c.value} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="reportCategory"
                  value={c.value}
                  checked={category === c.value}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-4 h-4 text-cath-red-700 focus:ring-cath-red-600"
                />
                <span className="text-sm font-semibold text-gray-700">{c.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">Mô tả thêm (tùy chọn)</span>
            <textarea
              placeholder="Nhập mô tả chi tiết vi phạm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 border border-gray-200 rounded-xl outline-none focus:border-cath-red-700 p-3 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cath-red-700 hover:bg-cath-red-600 text-white font-semibold rounded-xl transition-all cursor-pointer text-sm border-none outline-none disabled:bg-gray-400"
          >
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </form>
      </div>
    </div>
  )
}
