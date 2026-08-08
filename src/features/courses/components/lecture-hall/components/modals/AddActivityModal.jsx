import React, { useMemo, useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { Checkbox, TextInput } from "@/shared/components/ui/inputs"
import { Search, FileText, CheckSquare, Inbox } from "lucide-react"
import { useGetTeacherAssignmentsQuery, useGetTeacherQuizzesQuery } from "@/store/api/coursesApi"
import { getAssignmentTitle, getAssignmentStatus } from "../../../../utils/assignmentUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import toast from "react-hot-toast"

const AddActivityModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  classId,
}) => {
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall.modals.addActivity || {}
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedIds, setSelectedIds] = useState([])
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearchQuery("")
      setFilterType("all")
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]
    )
  }

  const { data: assignmentsResponse, isLoading: isLoadingAssignments } = useGetTeacherAssignmentsQuery(
    { classId, onlyUnassigned: true },
    { skip: !classId || !open }
  )

  const { data: quizzesResponse, isLoading: isLoadingQuizzes } = useGetTeacherQuizzesQuery(
    { classId, onlyUnassigned: true },
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

  console.log(activities)

  const filteredActivities = activities.filter((act) => {
    if (filterType !== "all" && act._activityType !== filterType) return false

    const title = act._activityType === "quiz"
      ? (act.title || act.name || dict.defaultQuizName)
      : getAssignmentTitle(act, dict.defaultAssignmentName)
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSubmit = () => {

    if (selectedIds.length === 0) {
      toast.error(dict.toastSelectionRequired)
      return
    }

    const chosenActivities = activities
      .filter((a) => selectedIds.includes(`${a._activityType}-${a.id}`))
      .map((act) => ({
        id: act.id,
        _activityType: act._activityType,
        title: act._activityType === "quiz"
          ? (act.title || act.name || dict.defaultQuizName)
          : getAssignmentTitle(act, dict.defaultAssignmentName),
        dueDate: act.dueDate
          ? formatDateTime(act.dueDate)
          : dict.noDueDate,
      }))
    onSubmit(chosenActivities)
    onClose()
  }

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "assignment":
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
      title={dict.title}
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
            {dict.cancel}
          </PillButton>
          <PillButton
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="flex-1"
          >
            {dict.add} ({selectedIds.length})
          </PillButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Filter Tabs & Search Bar Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
          {/* Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-[#F3F4F5] p-1 rounded-xl">
            {["all", "assignment", "quiz"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${filterType === type
                  ? "bg-white text-[#191C1D] border-[#E2E2E2] shadow-faq-card"
                  : "border-transparent text-[#5B403C] hover:text-[#191C1D]"
                  }`}
              >
                {type === "all" ? dict.filterAll || "Tất cả" : type === "assignment" ? dict.filterAssignment || "Bài nộp" : dict.filterQuiz || "Bài kiểm tra"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[300px]">
            <TextInput
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="rounded-xl !h-[40px] px-4 text-sm"
            />
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner text={t.courses.lectureHall.loading} />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
              <Inbox size={48} className="mb-3 opacity-50" strokeWidth={1.5} />
              <p className="text-sm font-medium">{dict.noActivitiesFound}</p>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const uid = `${act._activityType}-${act.id}`
              const isChecked = selectedIds.includes(uid)
              const title = act._activityType === "quiz"
                ? (act.title || act.name || dict.defaultQuizName)
                : getAssignmentTitle(act, dict.defaultAssignmentName)
              const rawStatus = act._activityType === "quiz" ? (act.status || "Published") : getAssignmentStatus(act)
              const statusLower = String(rawStatus).toLowerCase()
              const statusLabel = statusLower === "published"
                ? (dict.statusPublished || "Đã xuất bản")
                : statusLower === "draft"
                  ? (dict.statusDraft || "Bản nháp")
                  : statusLower === "upcoming"
                    ? (dict.statusUpcoming || "Sắp tới")
                    : (dict.statusClosed || "Đã đóng")

              const type = act._activityType
              const typeLabel = act._activityType === "quiz" ? dict.typeQuiz : dict.typeSubmission
              let timeInfo = null
              if (act._activityType === "assignment") {
                const dueDateLabel = act.dueDate
                  ? formatDateTime(act.dueDate)
                  : dict.noDueDate
                timeInfo = (
                  <div className="text-right">
                    <span className="text-xs text-[#5B403C] block font-medium">
                      {dict.dueDate || "Hạn nộp"}
                    </span>
                    <span className="text-sm text-[#191C1D] font-normal">
                      {dueDateLabel}
                    </span>
                  </div>
                )
              } else if (act._activityType === "quiz") {
                const openTimeStr = act.openTime
                  ? formatDateTime(act.openTime)
                  : "-"
                const closeTimeStr = act.closeTime
                  ? formatDateTime(act.closeTime)
                  : "-"
                timeInfo = (
                  <div className="text-right flex flex-col gap-0.5 justify-end">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-[#5B403C] font-medium">{dict.openTime || "Mở:"}</span>
                      <span className="text-sm text-[#191C1D] font-normal">{openTimeStr}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-[#5B403C] font-medium">{dict.closeTime || "Đóng:"}</span>
                      <span className="text-sm text-[#191C1D] font-normal">{closeTimeStr}</span>
                    </div>
                  </div>
                )
              }

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
                      aria-label={dict.selectActivityAriaLabel ? dict.selectActivityAriaLabel.replace("{{title}}", title) : ""}
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-h-5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${getTypeBadgeStyle(
                            type
                          )}`}
                        >
                          {type === "assignment" && <FileText size={12} />}
                          {type === "quiz" && <CheckSquare size={10} />}
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

                  {/* Right info (Times) */}
                  {timeInfo}
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
