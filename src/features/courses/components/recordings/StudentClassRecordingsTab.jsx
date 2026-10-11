import React, { useState, useMemo } from "react"
import { useGetStudentClassRecordingsQuery } from "@/store/api/social/teacherRecordingApi"
import {
  Video,
  Play,
  Calendar,
  Clock,
  HardDrive,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import RecordingPlayerModal from "./RecordingPlayerModal"

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

/**
 * StudentClassRecordingsTab — Màn hình xem video bài giảng dành cho Học Viên
 * Dựa trên API GET /api/student/classes/{classId}/recordings?page=1&pageSize=10
 */
const StudentClassRecordingsTab = ({ classId, classData }) => {
  const [page, setPage] = useState(1)
  const pageSize = 9
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStudentClassRecordingsQuery(
    { classId, page, pageSize },
    { skip: !classId },
  )

  const recordings = useMemo(() => {
    return Array.isArray(data?.recordings) ? data.recordings : []
  }, [data])

  const pagination = useMemo(() => {
    return (
      data?.pagination || {
        page: 1,
        pageSize,
        total: recordings.length,
        totalPages: Math.max(1, Math.ceil(recordings.length / pageSize)),
      }
    )
  }, [data, recordings.length])

  // Filter video theo từ khóa tìm kiếm
  const filteredRecordings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return recordings
    return recordings.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(query)
      const sessionMatch = String(item.sessionNumber ?? "").includes(query)
      const dateMatch = item.sessionDate?.toLowerCase().includes(query)
      return titleMatch || sessionMatch || dateMatch
    })
  }, [recordings, searchQuery])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 py-12">
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
            Không thể tải video bài giảng của lớp học
          </p>
          <p className="text-xs text-red-600">
            {error?.data?.message ||
              "Vui lòng kiểm tra lại kết nối mạng hoặc quyền truy cập của bạn."}
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
      {/* ── Banner Giới Thiệu ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#990011]/10 rounded-xl text-[#990011]">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              Video Bài Giảng Lớp Học
            </h2>
          </div>
          <p className="text-xs text-neutral-500 ml-1">
            Xem lại các buổi học đã được ghi hình và công bố bởi giảng viên
            {classData?.name ? ` của lớp ${classData.name}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#990011]" />
            <span>Tổng cộng: {pagination.total ?? recordings.length} video</span>
          </div>
        </div>
      </div>

      {/* ── Thanh Tìm Kiếm ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-neutral-50/70 border border-neutral-200/70 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm video theo tiêu đề, buổi số hoặc ngày học..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all"
          />
        </div>

        {isFetching && (
          <span className="text-xs text-neutral-400 italic self-end sm:self-auto">
            Đang đồng bộ...
          </span>
        )}
      </div>

      {/* ── Danh Sách Video Cards ───────────────────────────────────── */}
      {filteredRecordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-neutral-300 rounded-2xl text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Video className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-base font-semibold text-neutral-900">
              {searchQuery
                ? "Không tìm thấy video bài giảng phù hợp"
                : "Chưa có video bài giảng nào"}
            </h3>
            <p className="text-xs text-neutral-500">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác như số buổi học hoặc ngày học."
                : "Các buổi dạy đã hoàn thành sẽ hiển thị tại đây sau khi giảng viên công bố lên lớp học."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecordings.map((recording) => {
            const titleDisplay =
              recording.title ||
              (recording.sessionNumber
                ? `Buổi ${recording.sessionNumber}${recording.sessionDate ? ` - ${recording.sessionDate}` : ""}`
                : "Video bài giảng")

            let formattedDate = recording.sessionDate || ""
            if (recording.createdAt) {
              const d = new Date(recording.createdAt)
              formattedDate = d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }

            return (
              <div
                key={recording.id}
                onClick={() => setSelectedVideoToPlay(recording)}
                className="group flex flex-col bg-white border border-neutral-200/80 hover:border-[#990011]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Thumbnail & Video Preview */}
                <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:opacity-75 transition-opacity" />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 w-13 h-13 rounded-full bg-[#990011] text-white flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-transform duration-200">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    {recording.sessionNumber != null && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-xs border border-white/10">
                        Buổi {recording.sessionNumber}
                      </span>
                    )}
                  </div>

                  {/* Bottom Duration Badge */}
                  {recording.durationSeconds != null && recording.durationSeconds > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-black/75 text-white backdrop-blur-xs flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-300" />
                      <span>{formatDuration(recording.durationSeconds)}</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <h3
                      className="font-bold text-neutral-900 text-sm line-clamp-2 group-hover:text-[#990011] transition-colors"
                      title={titleDisplay}
                    >
                      {titleDisplay}
                    </h3>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-500">
                      {formattedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {formattedDate}
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

                  {/* Action Link */}
                  <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#990011] group-hover:underline flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Xem bài giảng
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ID: #{recording.id}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Phân Trang (Pagination) ─────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200/80 pt-4 px-1 mt-2">
          <div className="text-xs text-neutral-500">
            Hiển thị trang <span className="font-semibold text-neutral-900">{pagination.page}</span> / <span className="font-semibold text-neutral-900">{pagination.totalPages}</span> (Tổng số {pagination.total} video)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
              // Hiển thị gọn nếu quá nhiều trang
              if (
                pagination.totalPages > 6 &&
                Math.abs(p - page) > 2 &&
                p !== 1 &&
                p !== pagination.totalPages
              ) {
                if (Math.abs(p - page) === 3) {
                  return (
                    <span key={p} className="px-1 text-xs text-neutral-400">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={p}
                  type="button"
                  disabled={isFetching}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    p === page
                      ? "bg-[#990011] text-white shadow-xs"
                      : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              type="button"
              disabled={page >= pagination.totalPages || isFetching}
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Video Player Modal ─────────────────────────────────────── */}
      <RecordingPlayerModal
        open={Boolean(selectedVideoToPlay)}
        onClose={() => setSelectedVideoToPlay(null)}
        recording={selectedVideoToPlay}
      />
    </div>
  )
}

export default StudentClassRecordingsTab
