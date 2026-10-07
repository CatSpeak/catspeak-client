import React, { useState, useMemo } from "react"
import {
  useGetClassRecordingsQuery,
  useUpdateRecordingPublishStatusMutation,
  useDeleteClassRecordingMutation,
} from "@/store/api/social/teacherRecordingApi"
import { toast } from "react-hot-toast"
import {
  Video,
  Play,
  Trash2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  HardDrive,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Switch from "@/shared/components/ui/inputs/Switch"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import RecordingPlayerModal from "./RecordingPlayerModal"
import SaveOrPublishRecordingModal from "./SaveOrPublishRecordingModal"

/**
 * Format số giây thành chuỗi thời gian: hh:mm:ss hoặc mm:ss
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "--:--"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}h ${m}m ${s > 0 ? `${s}s` : ""}`
  }
  return `${m}m ${s}s`
}

/**
 * Format bytes thành MB hoặc GB
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "--"
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`
  }
  return `${mb.toFixed(1)} MB`
}

const ClassRecordingsTab = ({ classId, classData }) => {
  // ── Queries & Mutations ──────────────────────────────────────────────
  const {
    data: recordings = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetClassRecordingsQuery(classId, { skip: !classId })

  const [updatePublishStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRecordingPublishStatusMutation()
  const [deleteRecording, { isLoading: isDeleting }] =
    useDeleteClassRecordingMutation()

  // ── Local States ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // "all" | "published" | "draft"
  const [viewMode, setViewMode] = useState("grid") // "grid" | "table"

  // Modals state
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState(null)
  const [videoToDelete, setVideoToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // ── Filtered Recordings ─────────────────────────────────────────────
  const filteredRecordings = useMemo(() => {
    return recordings.filter((item) => {
      // Filter theo trạng thái
      if (statusFilter === "published" && !item.isPublished) return false
      if (statusFilter === "draft" && item.isPublished) return false

      // Filter theo tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = item.title?.toLowerCase().includes(q)
        const sessionMatch = String(item.sessionNumber ?? "").includes(q)
        const dateMatch = item.sessionDate?.toLowerCase().includes(q)
        return titleMatch || sessionMatch || dateMatch
      }

      return true
    })
  }, [recordings, statusFilter, searchQuery])

  // ── Thống kê ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = recordings.length
    const published = recordings.filter((r) => r.isPublished).length
    const draft = total - published
    const totalSeconds = recordings.reduce(
      (sum, r) => sum + (r.durationSeconds || 0),
      0,
    )
    return { total, published, draft, totalSeconds }
  }, [recordings])

  // ── Handlers ────────────────────────────────────────────────────────
  const handleTogglePublish = async (recording) => {
    const nextStatus = !recording.isPublished
    setUpdatingId(recording.id)
    try {
      await updatePublishStatus({
        classId,
        id: recording.id,
        isPublished: nextStatus,
      }).unwrap()

      toast.success(
        nextStatus
          ? "Đã đăng video lên Giảng đường thành công!"
          : "Đã chuyển video về kho lưu nháp!",
      )
    } catch (err) {
      const msg =
        err?.data?.message || err?.data || "Không thể cập nhật trạng thái video."
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return
    try {
      await deleteRecording({
        classId,
        id: videoToDelete.id,
      }).unwrap()
      toast.success("Đã xóa video bài giảng thành công!")
      setVideoToDelete(null)
    } catch (err) {
      const msg = err?.data?.message || err?.data || "Không thể xóa video."
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg))
    }
  }

  // ── Render Loading & Error ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 py-12">
        <LoadingSpinner />
        <span className="text-sm text-neutral-500 font-medium">
          Đang tải danh sách video bài giảng...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] p-6 bg-red-50/50 border border-red-200 rounded-2xl text-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-red-900">
            Không thể tải danh sách video bài giảng
          </p>
          <p className="text-xs text-red-600">
            {error?.data?.message ||
              "Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."}
          </p>
        </div>
        <PillButton variant="secondary" onClick={refetch} className="mt-2 text-xs">
          Thử lại
        </PillButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header & Banner Thống Kê ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#990011]/10 rounded-xl text-[#990011]">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              Quản lý Video Bài Giảng
            </h2>
          </div>
          <p className="text-xs text-neutral-500 ml-1">
            Lưu trữ, phát trực tiếp và xuất bản các video ghi hình buổi dạy cho học viên
          </p>
        </div>

        {/* Nút thêm video bài giảng */}
        <div className="flex items-center gap-3">
          <PillButton
            variant="primary"
            bgColor="#990011"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
            className="shadow-xs font-semibold text-xs sm:text-sm"
          >
            Thêm video bài giảng
          </PillButton>
        </div>
      </div>

      {/* ── Thống kê nhanh ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="flex flex-col p-4 bg-white border border-neutral-200/70 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Tổng video</span>
          <span className="text-xl font-bold text-neutral-900 mt-1">
            {stats.total}
          </span>
        </div>
        <div className="flex flex-col p-4 bg-white border border-neutral-200/70 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã đăng
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1">
            {stats.published}
          </span>
        </div>
        <div className="flex flex-col p-4 bg-white border border-neutral-200/70 rounded-xl shadow-xs">
          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Bản nháp
          </span>
          <span className="text-xl font-bold text-amber-700 mt-1">
            {stats.draft}
          </span>
        </div>
        <div className="flex flex-col p-4 bg-white border border-neutral-200/70 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Tổng thời lượng
          </span>
          <span className="text-xl font-bold text-neutral-800 mt-1">
            {formatDuration(stats.totalSeconds)}
          </span>
        </div>
      </div>

      {/* ── Thanh Công Cụ & Bộ Lọc ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-neutral-50/70 border border-neutral-200/70 rounded-xl">
        {/* Tìm kiếm */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, buổi số hoặc ngày học..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all"
          />
        </div>

        {/* Lọc trạng thái & Chuyển View */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filter Pills */}
          <div className="flex items-center bg-white border border-neutral-200 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-[#990011] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Tất cả ({recordings.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                statusFilter === "published"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Đã đăng ({stats.published})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                statusFilter === "draft"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Bản nháp ({stats.draft})
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-white border border-neutral-200 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Xem dạng Lưới"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Xem dạng Bảng"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Danh Sách Video ────────────────────────────────────────── */}
      {filteredRecordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-neutral-300 rounded-2xl text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Video className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-base font-semibold text-neutral-900">
              {searchQuery || statusFilter !== "all"
                ? "Không tìm thấy video nào phù hợp"
                : "Chưa có video bài giảng nào"}
            </h3>
            <p className="text-xs text-neutral-500">
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái để xem lại."
                : "Các buổi dạy khi kết thúc ghi hình hoặc video được thêm sẽ hiển thị tại đây để bạn đăng tải cho học viên."}
            </p>
          </div>
          <PillButton
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-xs"
          >
            Thêm video đầu tiên
          </PillButton>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecordings.map((recording) => {
            const isToggling = updatingId === recording.id
            const titleDisplay =
              recording.title ||
              (recording.sessionNumber
                ? `Buổi ${recording.sessionNumber}${recording.sessionDate ? ` - ${recording.sessionDate}` : ""}`
                : "Video bài giảng")

            return (
              <div
                key={recording.id}
                className="group flex flex-col bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-neutral-800 to-black opacity-80" />
                  
                  {/* Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setSelectedVideoToPlay(recording)}
                    className="relative z-10 w-12 h-12 rounded-full bg-[#990011] hover:bg-[#b00014] text-white flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 active:scale-95"
                    title="Xem video"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    {recording.sessionNumber != null && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-xs border border-white/10">
                        Buổi {recording.sessionNumber}
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-xs flex items-center gap-1 border ${
                        recording.isPublished
                          ? "bg-emerald-500/90 text-white border-emerald-400"
                          : "bg-amber-500/90 text-white border-amber-400"
                      }`}
                    >
                      {recording.isPublished ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Đã đăng
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Bản nháp
                        </>
                      )}
                    </span>
                  </div>

                  {/* Bottom Duration Badge */}
                  {recording.durationSeconds != null && recording.durationSeconds > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-black/75 text-white backdrop-blur-xs">
                      {formatDuration(recording.durationSeconds)}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <h3
                      className="font-bold text-neutral-900 text-sm line-clamp-1 group-hover:text-[#990011] transition-colors"
                      title={titleDisplay}
                    >
                      {titleDisplay}
                    </h3>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                      {recording.sessionDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {recording.sessionDate}
                        </span>
                      )}
                      {recording.fileSizeBytes != null && recording.fileSizeBytes > 0 && (
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                          {formatFileSize(recording.fileSizeBytes)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    {/* Switch Publish */}
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        checked={recording.isPublished}
                        onChange={() => handleTogglePublish(recording)}
                        disabled={isToggling}
                      />
                      <span className="text-xs font-medium text-neutral-600">
                        {recording.isPublished ? "Đăng giảng đường" : "Lưu nháp"}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setVideoToDelete(recording)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa video khỏi danh sách"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-700">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-semibold text-neutral-600 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Buổi</th>
                  <th className="px-4 py-3.5">Tiêu đề bài giảng</th>
                  <th className="px-4 py-3.5">Ngày học</th>
                  <th className="px-4 py-3.5">Thời lượng</th>
                  <th className="px-4 py-3.5">Dung lượng</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRecordings.map((recording) => {
                  const isToggling = updatingId === recording.id
                  const titleDisplay =
                    recording.title ||
                    `Buổi ${recording.sessionNumber || "N/A"}`

                  return (
                    <tr
                      key={recording.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-neutral-900 whitespace-nowrap">
                        Buổi {recording.sessionNumber ?? "--"}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900 max-w-xs truncate">
                        {titleDisplay}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 text-xs whitespace-nowrap">
                        {recording.sessionDate || "--"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 text-xs whitespace-nowrap font-mono">
                        {formatDuration(recording.durationSeconds)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 text-xs whitespace-nowrap">
                        {formatFileSize(recording.fileSizeBytes)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            checked={recording.isPublished}
                            onChange={() => handleTogglePublish(recording)}
                            disabled={isToggling}
                          />
                          <span
                            className={`text-xs font-medium ${
                              recording.isPublished
                                ? "text-emerald-700 font-semibold"
                                : "text-amber-700"
                            }`}
                          >
                            {recording.isPublished ? "Đã đăng" : "Nháp"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVideoToPlay(recording)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-[#990011] hover:bg-neutral-100 transition-colors"
                            title="Phát video"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoToDelete(recording)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Video Player Modal */}
      <RecordingPlayerModal
        open={Boolean(selectedVideoToPlay)}
        onClose={() => setSelectedVideoToPlay(null)}
        recording={selectedVideoToPlay}
      />

      {/* Modal Thêm hoặc Đăng video */}
      <SaveOrPublishRecordingModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        classId={classId}
        onSuccess={() => refetch()}
      />

      {/* Confirmation Modal khi Xóa */}
      <ConfirmationModal
        open={Boolean(videoToDelete)}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title="Xác nhận xóa video bài giảng"
        message={`Bạn có chắc chắn muốn xóa video "${
          videoToDelete?.title || `Buổi ${videoToDelete?.sessionNumber || ""}`
        }" khỏi danh sách lớp học? Thao tác này sẽ ẩn video khỏi giảng đường.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />
    </div>
  )
}

export default ClassRecordingsTab
