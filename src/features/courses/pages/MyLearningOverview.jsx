import React, { useState, useMemo } from 'react'
import ClassCard from '../components/overview/ClassCard'
import NextSessionCard from '../components/overview/NextSessionCard'
import Tabs from '@/shared/components/ui/navigation/Tabs'
import { EmptyState, LoadingSpinner } from '@/shared/components/ui/indicators'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import PageTitle from '@/shared/components/ui/PageTitle'
import { useNavigate } from 'react-router-dom'
import { PillButton } from '@/shared/components/ui/buttons'
import { useGetStudentScheduleSessionsQuery } from "@/store/api/coursesApi"
import { useTimezone } from '@/shared/hooks/useTimezone'
import { getClassLanguageCode } from "@/shared/utils/navigation"

import dayjs from 'dayjs'

const MyLearningOverview = ({ onShowAll }) => {
  const navigate = useNavigate()
  const { formatDate, formatScheduleTime, formatScheduleDays } = useTimezone()

  const [activeTab, setActiveTab] = useState("registered")

  const tabs = [
    { id: "registered", label: "Đã đăng ký" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã huỷ" },
  ]

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

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          { label: "Trang chủ", onClick: () => navigate("/") },
          { label: "Lớp học của tôi" },
        ]}
      />

      <PageTitle className="text-[#1A1A1A]">
        Buổi học sắp diễn ra
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
              : "Chưa có giờ"

            const now = dayjs();
            const startRaw = dayjs(session.rawStartTime || session.startTime);
            const endRaw = dayjs(session.rawEndTime || session.endTime);
            const isLive = now >= startRaw.subtract(15, 'minute') && now <= endRaw;

            return (
              <NextSessionCard
                key={session.id || index}
                title={classInfo.title || classInfo.name || "Lớp học"}
                language={classInfo.language || "Tiếng Anh"}
                date={formattedDate}
                time={timeDisplay}
                tags={classInfo.levels || []}
                status={isLive}
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
        <div className="py-4 text-gray-500">Không có buổi học nào sắp diễn ra.</div>
      )}

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === "registered" && (
          <>
            <ClassCard />
            <ClassCard title="Lớp giao tiếp cơ bản" progress={10} />
            <ClassCard title="Lớp tiếng anh thương mại" progress={60} />
          </>
        )}

        {activeTab === "completed" && (
          <ClassCard title="Phát âm chuẩn xác" progress={100} />
        )}

        {activeTab === "cancelled" && (
          <div className='w-full flex-1'>
            <EmptyState variant="page" />
          </div>
        )}
      </div>

      <div className='flex justify-center items-end'>
        <PillButton variant='secondary-no-outline' textColor={"#990011"} onClick={onShowAll}>
          Xem tất cả
        </PillButton>
      </div>
    </div>
  )
}

export default MyLearningOverview