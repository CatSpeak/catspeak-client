import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useCreateClassRecordingMutation } from "@/store/api/social/teacherRecordingApi"
import { toast } from "react-hot-toast"
import { Video, CheckCircle2, FileText, Send, Clock, HardDrive, Link as LinkIcon, Hash } from "lucide-react"

/**
 * SaveOrPublishRecordingModal
 * 
 * Đáp ứng luồng:
 * 1. Pop-up Kết Thúc Buổi Học (LiveKit/Room): "Buổi học đã được ghi hình thành công"
 * 2. Form thêm video bài giảng thủ công từ Teacher Dashboard
 * Có 2 nút hành động:
 * - [Lưu vào kho nháp] (isPublished: false)
 * - [Đăng lên Giảng đường] (isPublished: true)
 */
const SaveOrPublishRecordingModal = ({
  open,
  onClose,
  classId,
  initialData = null,
  isPostMeeting = false,
  onSuccess,
}) => {
  const [createRecording, { isLoading }] = useCreateClassRecordingMutation()

  const [form, setForm] = useState({
    classSessionId: "",
    recordingId: "",
    title: "",
    videoUrl: "",
    durationMinutes: "",
    durationSeconds: "",
    fileSizeMb: "",
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        const totalSec = initialData.durationSeconds || 0
        setForm({
          classSessionId: initialData.classSessionId ?? initialData.sessionId ?? "",
          recordingId: initialData.recordingId ?? initialData.id ?? "",
          title: initialData.title || "",
          videoUrl: initialData.videoUrl || initialData.fileUrl || "",
          durationMinutes: totalSec > 0 ? Math.floor(totalSec / 60) : "",
          durationSeconds: totalSec > 0 ? totalSec % 60 : "",
          fileSizeMb:
            initialData.fileSizeBytes && initialData.fileSizeBytes > 0
              ? (initialData.fileSizeBytes / (1024 * 1024)).toFixed(1)
              : "",
        })
      } else {
        setForm({
          classSessionId: "",
          recordingId: "",
          title: "",
          videoUrl: "",
          durationMinutes: "",
          durationSeconds: "",
          fileSizeMb: "",
        })
      }
    }
  }, [open, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (isPublished) => {
    if (!classId) {
      toast.error("Thiếu thông tin lớp học.")
      return
    }

    if (!form.classSessionId) {
      toast.error("Vui lòng nhập ID hoặc số buổi học (Class Session ID).")
      return
    }

    if (!form.videoUrl || !form.videoUrl.trim()) {
      toast.error("Vui lòng nhập đường dẫn video (Video URL).")
      return
    }

    // Tính tổng thời lượng theo giây
    const mins = Number(form.durationMinutes) || 0
    const secs = Number(form.durationSeconds) || 0
    const totalDurationSeconds = mins * 60 + secs

    // Tính dung lượng file theo bytes
    const mb = Number(form.fileSizeMb) || 0
    const fileSizeBytes = mb > 0 ? Math.round(mb * 1024 * 1024) : null

    try {
      await createRecording({
        classId,
        classSessionId: Number(form.classSessionId),
        recordingId: form.recordingId ? Number(form.recordingId) : null,
        title: form.title?.trim() || null,
        isPublished,
        videoUrl: form.videoUrl.trim(),
        durationSeconds: totalDurationSeconds > 0 ? totalDurationSeconds : null,
        fileSizeBytes,
      }).unwrap()

      toast.success(
        isPublished
          ? "Đã đăng video bài giảng lên giảng đường thành công!"
          : "Đã lưu video bài giảng vào kho nháp!",
      )

      onSuccess?.()
      onClose?.()
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data ||
        "Có lỗi xảy ra khi lưu hoặc đăng video bài giảng."
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg))
    }
  }

  return (
    <Modal
      open={open}
      onClose={isLoading ? undefined : onClose}
      title={
        isPostMeeting
          ? "Buổi học đã được ghi hình thành công"
          : "Thêm video bài giảng"
      }
      className="md:max-w-2xl"
      bodyClassName="px-4 sm:px-6 py-4 flex flex-col gap-5"
      footerClassName="px-4 sm:px-6 py-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 rounded-b-2xl"
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-3">
          <PillButton
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Đóng
          </PillButton>

          <div className="flex items-center gap-2.5">
            {/* Nút 1: Lưu vào kho nháp */}
            <PillButton
              variant="secondary"
              icon={<FileText className="w-4 h-4 text-amber-600" />}
              onClick={() => handleSubmit(false)}
              loading={isLoading}
              className="border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 text-neutral-700"
            >
              Lưu vào kho nháp
            </PillButton>

            {/* Nút 2: Đăng lên Giảng đường */}
            <PillButton
              variant="primary"
              bgColor="#990011"
              icon={<Send className="w-4 h-4" />}
              onClick={() => handleSubmit(true)}
              loading={isLoading}
              className="shadow-sm hover:opacity-95"
            >
              Đăng lên Giảng đường
            </PillButton>
          </div>
        </div>
      }
    >
      {/* Banner thông báo */}
      {isPostMeeting ? (
        <div className="flex items-start gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-900 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-emerald-900">
              Buổi học đã hoàn tất ghi hình!
            </p>
            <p className="text-xs text-emerald-700">
              Bạn có thể đăng ngay video lên Giảng đường cho học viên xem lại, hoặc lưu tạm vào kho nháp để kiểm tra trước.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-500">
          Điền thông tin bản ghi hình của buổi học để xuất bản hoặc lưu trữ vào lớp học.
        </p>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Class Session ID */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-neutral-400" />
            <span>ID Buổi học (Session ID) *</span>
          </label>
          <input
            type="number"
            name="classSessionId"
            value={form.classSessionId}
            onChange={handleChange}
            placeholder="Ví dụ: 12"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
            required
          />
        </div>

        {/* Recording ID (LiveKit) */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-neutral-400" />
            <span>LiveKit Recording ID (Tùy chọn)</span>
          </label>
          <input
            type="number"
            name="recordingId"
            value={form.recordingId}
            onChange={handleChange}
            placeholder="Ví dụ: 42"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
          />
        </div>

        {/* Tiêu đề video */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>Tiêu đề video (Tùy chọn)</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Bỏ trống để tự động đặt theo 'Buổi X - Ngày'"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
          />
        </div>

        {/* Video URL */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>Đường dẫn Video (URL) *</span>
          </label>
          <input
            type="url"
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            placeholder="https://cdn.example.com/videos/v1.mp4"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
            required
          />
        </div>

        {/* Thời lượng */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Thời lượng (Phút : Giây)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              placeholder="Phút"
              min="0"
              disabled={isLoading}
              className="w-1/2 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
            />
            <span className="text-neutral-400 font-bold">:</span>
            <input
              type="number"
              name="durationSeconds"
              value={form.durationSeconds}
              onChange={handleChange}
              placeholder="Giây"
              min="0"
              max="59"
              disabled={isLoading}
              className="w-1/2 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
            />
          </div>
        </div>

        {/* Dung lượng file (MB) */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
            <span>Dung lượng file (MB)</span>
          </label>
          <input
            type="number"
            step="0.1"
            name="fileSizeMb"
            value={form.fileSizeMb}
            onChange={handleChange}
            placeholder="Ví dụ: 120"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all bg-white"
          />
        </div>
      </div>
    </Modal>
  )
}

export default SaveOrPublishRecordingModal
