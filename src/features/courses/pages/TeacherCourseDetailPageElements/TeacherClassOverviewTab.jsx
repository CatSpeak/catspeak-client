import React, { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import GeneralSection from "./GeneralSection"
import CurrentClassesSection from "./CurrentClassesSection"
import UpcomingSessionCard from "../../components/sessions/UpcomingSessionCard"
import TeachingTasksSection from "../../components/assignments/TeachingTasksSection"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetTeacherCourseTeachingTasksCombinedQuery } from "@/store/api/coursesApi"
import { mapTeachingTask } from "../../utils/courseTransforms"
import { ensureDate } from "@/shared/utils/dateUtils"

const TeacherClassOverviewTab = ({
  courseData = {},
  nextClass: propNextClass,
  teachingTasks: propTeachingTasks,
  isLoadingTasks: propIsLoadingTasks,
  onTaskAction: propOnTaskAction,
  className = "",
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const params = useParams()

  const c = t.courses || {}
  const cd = c.courseDetail || {}
  const taskText = c.grading || {}
  const id = courseData?.id || params.id

  const classes = useMemo(() => {
    return Array.isArray(courseData?.classes)
      ? courseData.classes.filter((item) => item && typeof item === "object")
      : []
  }, [courseData?.classes])

  // Tự tính toán lớp học có buổi học kế tiếp nếu không truyền từ ngoài vào
  const resolvedNextClass = useMemo(() => {
    if (propNextClass !== undefined) return propNextClass
    const nowMs = Date.now()
    const nextSessionCandidate = classes
      .map((cls) => {
        const ns = cls?.nextSession
        const datePart = ns?.date || cls?.startDate || ""
        let rawTs = ns?.rawStartTime || ns?.startTime || ""
        if (
          typeof rawTs === "string" &&
          !rawTs.includes("T") &&
          !rawTs.includes("-") &&
          datePart
        ) {
          const cleanDate = datePart.includes("T")
            ? datePart.split("T")[0]
            : datePart
          rawTs = `${cleanDate}T${rawTs}`
        } else if (!rawTs && datePart) {
          rawTs = datePart
        }
        const d = ensureDate(rawTs)
        const startTimeMs = d ? d.getTime() : NaN
        return { cls, startTimeMs }
      })
      .filter(({ startTimeMs }) => Number.isFinite(startTimeMs))
      .sort((left, right) => {
        const aUpcoming = left.startTimeMs >= nowMs ? 1 : 0
        const bUpcoming = right.startTimeMs >= nowMs ? 1 : 0
        if (aUpcoming !== bUpcoming) return bUpcoming - aUpcoming
        return (
          Math.abs(left.startTimeMs - nowMs) -
          Math.abs(right.startTimeMs - nowMs)
        )
      })[0]

    const nextSessionClass = nextSessionCandidate?.cls || null

    return nextSessionClass
      ? {
          ...nextSessionClass,
          nextSession: nextSessionClass.nextSession,
          startDate:
            nextSessionClass.nextSession?.date || nextSessionClass.startDate,
          schedule: {
            ...nextSessionClass.schedule,
            startTime:
              nextSessionClass.schedule?.startTime ||
              nextSessionClass.nextSession?.startTime,
            endTime:
              nextSessionClass.schedule?.endTime ||
              nextSessionClass.nextSession?.endTime,
          },
        }
      : null
  }, [classes, propNextClass])

  // Tự fetch teaching tasks nếu không truyền từ ngoài vào
  const { data: rawTasks = [], isLoading: internalLoadingTasks } =
    useGetTeacherCourseTeachingTasksCombinedQuery(id, {
      skip: !id || propTeachingTasks !== undefined,
    })

  const resolvedTeachingTasks = useMemo(() => {
    if (propTeachingTasks) return propTeachingTasks
    return Array.isArray(rawTasks)
      ? rawTasks
          .map((task) =>
            mapTeachingTask(task, {
              pendingCount: taskText.teachingTaskPendingCount,
              urgent: taskText.teachingTaskUrgent,
              required: taskText.teachingTaskRequired,
              gradeQuiz: taskText.teachingTaskGradeQuiz,
              gradeAssignment: taskText.teachingTaskGradeAssignment,
              unknown: taskText.statusUnknown,
            }),
          )
          .filter(Boolean)
      : []
  }, [
    propTeachingTasks,
    rawTasks,
    taskText.teachingTaskGradeAssignment,
    taskText.teachingTaskGradeQuiz,
    taskText.teachingTaskPendingCount,
    taskText.teachingTaskRequired,
    taskText.teachingTaskUrgent,
    taskText.statusUnknown,
  ])

  const resolvedIsLoadingTasks =
    propIsLoadingTasks !== undefined
      ? propIsLoadingTasks
      : internalLoadingTasks

  const handleTaskAction = (task) => {
    if (propOnTaskAction) {
      propOnTaskAction(task)
      return
    }
    if (!task?.classId) return
    let targetUrl = `/workspace/courses/class/${encodeURIComponent(String(task.classId))}?tab=grading`
    if (task.assignmentId) {
      targetUrl += `&assignmentId=${encodeURIComponent(String(task.assignmentId))}`
    } else if (task.quizId) {
      targetUrl += `&quizId=${encodeURIComponent(String(task.quizId))}`
    }
    navigate(targetUrl)
  }

  return (
    <div
      className={`flex flex-col sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}
    >
      {/* LEFT COLUMN: Visual Banner + Information Card & Current Classes */}
      <div className="contents sm:flex sm:flex-col sm:gap-4 lg:col-span-2">
        <div className="order-1 sm:order-none">
          <GeneralSection courseData={courseData} id={id} />
        </div>

        <div className="order-4 sm:order-none">
          <CurrentClassesSection courseData={courseData} />
        </div>
      </div>

      {/* RIGHT COLUMN: Upcoming Session & Teaching Tasks */}
      <div className="contents sm:flex sm:flex-col sm:gap-4 lg:col-span-1">
        <div className="order-2 sm:order-none">
          <UpcomingSessionCard
            nextClass={resolvedNextClass}
            courseData={courseData}
            upcomingSessionLabel={cd.upcomingSession || "Upcoming Session"}
            noUpcomingLabel={cd.noUpcoming || "No upcoming sessions"}
            createClassToScheduleLabel={
              cd.createClassToSchedule ||
              "Create a class to schedule your first session."
            }
            joinRoomLabel={c.joinRoom || "Join Room"}
            viewAllLabel={c.viewAll || "View All"}
            onJoin={() => {
              if (resolvedNextClass?.id) {
                navigate(
                  `/workspace/courses/class/${encodeURIComponent(String(resolvedNextClass.id))}`,
                )
              }
            }}
            onViewAll={() => navigate("/workspace/courses/schedule")}
          />
        </div>

        <div className="order-3 sm:order-none">
          <TeachingTasksSection
            teachingTasksLabel={c.teachingTasks || "Teaching Tasks"}
            viewAllLabel={c.viewAll || "View All"}
            tasks={resolvedTeachingTasks}
            isLoading={resolvedIsLoadingTasks}
            onViewAll={() => navigate("/workspace/courses/schedule")}
            onTaskAction={handleTaskAction}
          />
        </div>
      </div>
    </div>
  )
}

export default TeacherClassOverviewTab
