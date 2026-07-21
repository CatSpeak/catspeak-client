import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { FileText, Timer } from "lucide-react"

const CreatePostTypeModal = ({ open, onClose, onSelect }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const ce = c.createExam || {}

  const options = [
    {
      id: "assignment",
      title: ce.postTypeModalAssignmentTitle || "Bài tập",
      description: ce.postTypeModalAssignmentDesc || "Tạo bài tập tự luận hoặc nộp file cho học sinh",
      icon: FileText,
      color: "text-[#990011]",
      bgColor: "bg-red-50/40 border-red-100",
    },
    {
      id: "exam",
      title: ce.postTypeModalExamTitle || "Bài kiểm tra",
      description: ce.postTypeModalExamDesc || "Tạo bài kiểm tra trắc nghiệm, tự luận có tính điểm và hẹn giờ",
      icon: Timer,
      color: "text-[#990011]",
      bgColor: "bg-red-50/40 border-red-100",
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ce.postTypeModalTitle || "Tạo bài đăng mới"}
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4 py-4">
        {options.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.id)
                onClose()
              }}
              className="flex items-start gap-4 p-4 text-left border border-gray-150 rounded-2xl bg-white hover:bg-red-50/20 hover:border-red-200 transition-all duration-200 group active:scale-[0.99] shadow-xs"
            >
              <div className={`p-3 rounded-xl ${opt.bgColor} ${opt.color} group-hover:scale-105 transition-transform`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-gray-850 group-hover:text-[#990011] transition-colors leading-tight">
                  {opt.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1 leading-normal">
                  {opt.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

export default CreatePostTypeModal
