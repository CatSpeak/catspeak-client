import React, { useState, useMemo } from 'react'
import ClassCard from '../components/overview/ClassCard'
import NextSessionCard from '../components/overview/NextSessionCard'
import Tabs from '@/shared/components/ui/navigation/Tabs'
import { EmptyState, LoadingSpinner } from '@/shared/components/ui/indicators'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import PageTitle from '@/shared/components/ui/PageTitle'
import { useNavigate } from 'react-router-dom'
import { PillButton } from '@/shared/components/ui/buttons'
import { useGetStudentCompletedClassesQuery, useGetStudentJoinedClassesQuery, useGetStudentScheduleSessionsQuery } from "@/store/api/coursesApi"
import { useTimezone } from '@/shared/hooks/useTimezone'
import { getClassLanguageCode } from "@/shared/utils/navigation"
import { getSafeMediaUrl, defaultCourseThumbnail } from "../utils/courseUtils"
import { copyShareLink } from "@/shared/utils/shareUtils"

import dayjs from 'dayjs'
import { Calendar, BookOpen } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'

const MyLearningOverview = () => {
  const navigate = useNavigate()
  const { formatDate, formatScheduleTime, formatScheduleDays } = useTimezone()
  const { t } = useLanguage()
  const lo = t.courses?.student?.myLearningOverview || {}

  const [activeTab, setActiveTab] = useState("registered")
  const [showAll, setShowAll] = useState(false)

  // Get sessions from today to next 30 days
  const dateParams = useMemo(() => {
    return {
      from: dayjs().format('YYYY-MM-DD'),
      to: dayjs().add(30, 'day').format('YYYY-MM-DD')
    }
  }, [])

  const { data: sessionsRes, isLoading: isSessionsLoading } = useGetStudentScheduleSessionsQuery(dateParams)

  const sessions = useMemo(() => {
    if (!sessionsRes) return []
    const data = sessionsRes.data || sessionsRes
    return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
  }, [sessionsRes])

  const { data: joinedRes, isLoading: isJoinedLoading } = useGetStudentJoinedClassesQuery()

  const { data: completedRes, isLoading: isCompletedLoading } = useGetStudentCompletedClassesQuery()

  const joinedClasses = useMemo(() => {
    if (!joinedRes) return []
    const items = joinedRes.data || joinedRes
    const classes = Array.isArray(items) ? items : []

    return classes.filter(cls => {
      const status = (cls.status || "").toUpperCase()
      // ARCHIVED is read-only but stays visible to enrolled students (per spec);
      // only FINISHED is hidden from this tab (shown in the completed tab instead).
      return status !== "FINISHED"
    })
  }, [joinedRes])

  const completedClasses = useMemo(() => {
    if (!completedRes) return []
    const items = completedRes.data || completedRes
    return Array.isArray(items) ? items : []
  }, [completedRes])

  const tabs = [
    { id: "registered", label: lo.registered || "Đã đăng ký", badge: joinedClasses.length },
    { id: "completed", label: lo.completed || "Hoàn thành", badge: completedClasses.length },
    { id: "cancelled", label: lo.cancelled || "Đã huỷ" },
  ]

  const displayClasses =
    activeTab === "registered" ? joinedClasses :
      activeTab === "completed" ? completedClasses :
        []

  const isClassesLoading = isJoinedLoading || isCompletedLoading

  return (
    <div className="space-y-6">

      {joinedClasses.length > 0 && (
        <>
          <PageTitle className="text-[#1A1A1A]">
            {lo.upcomingSessions || "Buổi học sắp diễn ra"}
          </PageTitle>

          {isSessionsLoading ? (
            <div className="flex justify-center p-6"><LoadingSpinner /></div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sessions.slice(0, 3).map((session, index) => {
                const classInfo = session.class || {}

                const sessionDate = session.date || session.startTime || dateParams.from
                const formattedDate = formatDate ? formatDate(sessionDate) : sessionDate

                const startFormatted = formatScheduleTime && session.rawStartTime
                  ? formatScheduleTime(session.rawStartTime)
                  : session.startTime

                const endFormatted = formatScheduleTime && session.rawEndTime
                  ? formatScheduleTime(session.rawEndTime)
                  : session.endTime

                const timeDisplay = startFormatted && endFormatted
                  ? `${startFormatted} - ${endFormatted}`
                  : (lo.noTime || "Chưa có giờ")

                const now = dayjs();
                const startRaw = dayjs(session.rawStartTime || session.startTime);
                const endRaw = dayjs(session.rawEndTime || session.endTime);
                const isLive = now >= startRaw.subtract(15, 'minute') && now <= endRaw;

                return (
                  <NextSessionCard
                    key={session.id || index}
                    title={classInfo.title || classInfo.name || lo.defaultClassTitle || "Lớp học"}
                    language={classInfo.language || "Tiếng Anh"}
                    date={formattedDate}
                    time={timeDisplay}
                    tags={classInfo.levels || []}
                    status={isLive}
                    classStatus={classInfo.status}
                    onAction={() => {
                      if (isLive) {
                        navigate(`/${getClassLanguageCode(classInfo.language) || "en"}/meet/${encodeURIComponent(`class-${classInfo.id}`)}`)
                      } else {
                        navigate(`/workspace/learning/class/${classInfo.id}`)
                      }
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <div className='col-span-full w-full flex-1'>
              <EmptyState variant="page"
                icon={Calendar}
                iconClassName="w-10 h-10 mb-3 text-gray-300"
                message={lo.noUpcomingSessions || "Không có lớp học nào sắp diễn ra"} />
            </div>
          )}
        </>
      )}

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId)
          setShowAll(false)
        }}
        fullWidth={false}
      />

      {isClassesLoading ? (
        <div className="flex justify-center p-6"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayClasses.length > 0 ? (
            displayClasses.slice(0, showAll ? displayClasses.length : 3).map((cls) => {
              const progress = (cls.progress?.completedSessions && cls.progress?.totalSessions)
                ? Math.round((cls.progress.completedSessions / cls.progress.totalSessions) * 100)
                : 0

              const formattedStartDate = cls.startDate && formatDate ? formatDate(cls.startDate) : (cls.startDate || "?")
              const formattedEndDate = cls.endDate && formatDate ? formatDate(cls.endDate) : "?"
              const dateRange = cls.endDate ? `${formattedStartDate} - ${formattedEndDate}` : formattedStartDate

              // Handle transformed schedule object vs raw array
              let rawDays = []
              let rawStartTime = ""
              let rawEndTime = ""

              if (Array.isArray(cls.rawSchedule) && cls.rawSchedule.length > 0) {
                rawDays = cls.rawSchedule.map(s => s.dayOfWeek).filter(Boolean)
                rawStartTime = cls.rawSchedule[0].startTime
                rawEndTime = cls.rawSchedule[0].endTime
              } else if (Array.isArray(cls.schedule)) {
                rawDays = cls.schedule.map(s => s.dayOfWeek).filter(Boolean)
                rawStartTime = cls.schedule[0]?.startTime
                rawEndTime = cls.schedule[0]?.endTime
              } else if (cls.schedule && typeof cls.schedule === 'object') {
                rawDays = cls.schedule.days || []
                rawStartTime = cls.schedule.startTime
                rawEndTime = cls.schedule.endTime
              }

              const scheduleDays = formatScheduleDays && rawDays.length > 0
                ? formatScheduleDays(rawDays, lo.noSchedule || "Chưa có lịch", " - ", rawStartTime, cls.startDate)
                : (rawDays.length > 0 ? rawDays.join(' - ') : (lo.noSchedule || "Chưa có lịch"))

              const clsStartFormatted = formatScheduleTime && rawStartTime
                ? formatScheduleTime(rawStartTime, cls.startDate)
                : rawStartTime

              const clsEndFormatted = formatScheduleTime && rawEndTime
                ? formatScheduleTime(rawEndTime, cls.startDate)
                : rawEndTime

              const scheduleTime = clsStartFormatted && clsEndFormatted
                ? `${clsStartFormatted} - ${clsEndFormatted}`
                : (lo.noTime || "Chưa có giờ")

              return (
                <ClassCard
                  key={cls.id}
                  instructorId={cls.teacher?.accountId}
                  title={cls.title || cls.name || lo.defaultClassTitle || "Lớp học"}
                  subtitle={cls.courseTitle || cls.courseName || lo.defaultCourseTitle || "-"}
                  instructorName={cls.teacher?.name || lo.unassigned || "Chưa phân công"}
                  instructorAvatar={cls.teacher?.avatar || cls.teacher?.avatarImageUrl}
                  coverImage={getSafeMediaUrl(cls.thumbnailUrl) || defaultCourseThumbnail}
                  dateRange={dateRange}
                  scheduleDays={scheduleDays}
                  scheduleTime={scheduleTime}
                  progress={progress}
                  onEnter={() => navigate(`/workspace/learning/class/${cls.id}`)}
                  onShare={() => copyShareLink({
                    url: `/explore-courses/class/${cls.id}`,
                    successMessage: lo.copiedLink || "Đã sao chép link lớp học!"
                  })}
                />
              )
            })
          ) : (
            <div className='col-span-full w-full flex-1'>
              <EmptyState
                variant="page"
                icon={BookOpen}
                iconClassName="w-12 h-12 mb-3 text-gray-300"
                message={
                  activeTab === "registered" ? (lo.emptyRegistered || "Bạn chưa đăng ký lớp học nào") :
                    activeTab === "completed" ? (lo.emptyCompleted || "Bạn chưa hoàn thành lớp học nào") :
                      (lo.emptyCancelled || "Bạn không có lớp học nào đã huỷ")
                }
                description={
                  activeTab === "registered"
                    ? (lo.startJourney || "Hãy bắt đầu hành trình học tập của bạn bằng cách tham gia các khoá học của chúng tôi.")
                    : null
                }
                action={
                  activeTab === "registered" ? (
                    <PillButton variant="primary" onClick={() => navigate("/explore-courses")} className="mt-4">
                      {lo.exploreCourses || "Khám phá khóa học"}
                    </PillButton>
                  ) : null
                }
              />
            </div>
          )}
        </div>
      )}

      {displayClasses.length > 3 && (
        <div className='flex justify-center items-end'>
          <PillButton variant='secondary-no-outline' textColor={"#990011"} onClick={() => setShowAll(!showAll)}>
            {showAll ? (lo.showLess || "Thu gọn") : (lo.viewAll || "Xem tất cả")}
          </PillButton>
        </div>
      )}
    </div>
  )
}

export default MyLearningOverview