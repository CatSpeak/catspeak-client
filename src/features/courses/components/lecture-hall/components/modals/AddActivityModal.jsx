import React, { useMemo, useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { Checkbox, TextInput } from "@/shared/components/ui/inputs"
import { Search, ChevronDown, FileText, CheckSquare, MessageSquare } from "lucide-react"
import { useGetTeacherAssignmentsQuery, useGetTeacherQuizzesQuery } from "@/store/api/coursesApi"
import { getAssignmentTitle, getAssignmentStatus } from "../../../../utils/assignmentUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

const AddActivityModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  classId,
  existingActivityIds = [],
}) => {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearchQuery("")
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]
    )
  }

  const { data: assignmentsResponse, isLoading: isLoadingAssignments } = useGetTeacherAssignmentsQuery(
    { classId },
    { skip: !classId || !open }
  )

  const { data: quizzesResponse, isLoading: isLoadingQuizzes } = useGetTeacherQuizzesQuery(
    { classId },
    { skip: !classId || !open }
  )

  const isLoading = isLoadingAssignments || isLoadingQuizzes

  const activities = useMemo(() => {
    const rawAssignments = assignmentsResponse?.data || assignmentsResponse || []
    const assignmentsList = (Array.isArray(rawAssignments) ? rawAssignments : []).map(a => ({ ...a, _activityType: "assignment" }))

    const rawQuizzes = quizzesResponse?.data || quizzesResponse || []
    const quizzesList = (Array.isArray(rawQuizzes) ? rawQuizzes : []).map(q => ({ ...q, _activityType: "quiz" }))

    return [...assignmentsList, ...quizzesList]
  }, [assignmentsResponse, quizzesResponse])

  const filteredActivities = activities.filter((act) => {
    const uid = `${act._activityType}-${act.id}`
    if (existingActivityIds.includes(uid)) return false
    const title = act._activityType === "quiz" ? (act.title || act.name || "Bài kiểm tra") : getAssignmentTitle(act)
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSubmit = () => {

    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hoạt động")
      return
    }

    const chosenActivities = activities
      .filter((a) => selectedIds.includes(`${a._activityType}-${a.id}`))
      .map((act) => ({
        id: act.id,
        _activityType: act._activityType,
        title: act._activityType === "quiz" ? (act.title || act.name || "Bài kiểm tra") : getAssignmentTitle(act),
        dueDate: act.dueDate
          ? new Date(act.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
          : "Chưa thiết lập",
      }))
    onSubmit(chosenActivities)
    onClose()
  }

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "submission":
        return "bg-[#FFDAD6] text-[#93000A]"
      case "quiz":
        return "bg-[#FFDCBD] text-[#2C1600]"
      default:
        return "bg-[#FFDBCF] text-[#380D00]"
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm hoạt động học tập"
      className="md:max-w-[900px] rounded-xl"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <PillButton
            type="button"
            variant="outline"
            onClick={onClose}
            bgColor={"white"}
            textColor={"#72000d"}
            borderColor={"#E2E2E2"}
            className="flex-1"
          >
            Hủy
          </PillButton>
          <PillButton
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="flex-1"
          >
            Thêm các hoạt động đã chọn ({selectedIds.length})
          </PillButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Filter Tabs & Search Bar Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full">
            <TextInput
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hoạt động..."
              className="rounded-xl !h-[40px] px-4 text-sm"
            />
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Không tìm thấy bài tập nào.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const uid = `${act._activityType}-${act.id}`
              const isChecked = selectedIds.includes(uid)
              const title = act._activityType === "quiz" ? (act.title || act.name || "Bài kiểm tra") : getAssignmentTitle(act)
              const status = act._activityType === "quiz" ? (act.status || "published") : getAssignmentStatus(act)
              const statusLabel = status === "published" ? "Đã phát hành" : (status === "draft" ? "Nháp" : "Đóng")

              const type = act._activityType === "quiz" ? "quiz" : "submission"
              const typeLabel = act._activityType === "quiz" ? "Bài kiểm tra" : "Bài tập"
              const dueDateLabel = act.dueDate
                ? new Date(act.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
                : "Chưa thiết lập"

              return (
                <div
                  key={uid}
                  onClick={() => handleToggleSelect(uid)}
                  className={`border rounded-lg p-4 flex items-center justify-between transition-all ${isChecked
                    ? "border-cath-red-700 shadow-faq-card cursor-pointer"
                    : "border-[#E2E2E2] bg-white hover:border-[#F3F4F5] cursor-pointer"
                    }`}
                >
                  {/* Checkbox & Left info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => { }}
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-h-5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${getTypeBadgeStyle(
                            type
                          )}`}
                        >
                          {type === "submission" && <FileText size={12} />}
                          {type === "quiz" && <CheckSquare size={10} />}
                          {type === "forum" && <MessageSquare size={10} />}
                          {typeLabel}
                        </span>

                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#E2E2E2] text-[#5B403C]">
                          {statusLabel}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-[#191C1D] truncate">
                        {title}
                      </h5>
                    </div>
                  </div>

                  {/* Right info (Due Date) */}
                  <div className="text-right">
                    <span className="text-xs text-[#5B403C] block font-medium">
                      Hạn nộp
                    </span>
                    <span className="text-sm text-[#191C1D] font-normal">
                      {dueDateLabel}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AddActivityModal
