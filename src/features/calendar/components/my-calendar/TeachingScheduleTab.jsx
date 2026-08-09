import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, MoreVertical, Edit, DoorOpen } from 'lucide-react'
import { useGetScheduleSessionsQuery } from '@/store/api/coursesApi'
import DataTable from '@/shared/components/ui/DataTable'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import { IconButton } from '@/shared/components/ui/buttons'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTimezone } from '@/shared/hooks/useTimezone'
import TablePagination from "@/features/courses/components/shared/TablePagination"
import DatePicker from '@/shared/components/ui/inputs/DatePicker'
import Popover from '@/shared/components/ui/Popover'
import MenuItem from '@/shared/components/ui/MenuItem'
import toast from 'react-hot-toast'

const TeachingScheduleTab = ({ currentDate = dayjs(), onPrev, onNext }) => {
  const { t, language } = useLanguage()
  const { formatDate, formatTime, formatScheduleTime, userTimeZone } = useTimezone()
  const navigate = useNavigate()
  const fromDate = currentDate.startOf('month').format('YYYY-MM-DD')
  const toDate = currentDate.endOf('month').format('YYYY-MM-DD')

  const { data: sessionsResponse, isLoading } = useGetScheduleSessionsQuery({ from: fromDate, to: toDate })

  const [filterDate, setFilterDate] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Safely extract the array of sessions from the response
  const rawSessions = Array.isArray(sessionsResponse?.data)
    ? sessionsResponse.data
    : (Array.isArray(sessionsResponse) ? sessionsResponse : [])

  const [prevMonth, setPrevMonth] = useState(currentDate.format('YYYY-MM'))

  const currentMonth = currentDate.format('YYYY-MM')
  if (currentMonth !== prevMonth) {
    setPrevMonth(currentMonth)
    setFilterDate(null)
    setCurrentPage(1)
  }

  // Filter by date
  const filteredSessions = filterDate
    ? rawSessions.filter(s => {
        const raw = s.rawStartTime || (s.startTime && (s.startTime.includes('T') || s.startTime.includes('-')) ? s.startTime : null) || s.date
        if (!raw) return false
        const sDate = raw.includes("T")
          ? dayjs(raw).tz(userTimeZone).format("YYYY-MM-DD")
          : dayjs(raw).format("YYYY-MM-DD")
        return sDate === dayjs(filterDate).format("YYYY-MM-DD")
      })
    : rawSessions

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const columns = [
    {
      key: 'class',
      label: t.courses?.class || 'Lớp học',
      render: (row) => <span className="font-medium text-gray-900">{row.class?.name || t.calendar?.noClassName || 'Không có tên lớp'}</span>
    },
    {
      key: 'sessionNumber',
      label: t.calendar?.sessionNumber || 'Buổi học',
      render: (row) => row.sessionNumber ? `${row.sessionNumber}/${row.totalSessions || '?'}` : '-'
    },
    {
      key: 'date',
      label: t.calendar?.day || 'Ngày',
      render: (row) => {
        const raw = row.rawStartTime || (row.startTime && (row.startTime.includes('T') || row.startTime.includes('-')) ? row.startTime : null) || (row.date && row.startTime ? `${row.date}T${row.startTime}:00Z` : row.date)
        return raw ? formatDate(raw) : '-'
      }
    },
    {
      key: 'time',
      label: t.calendar?.timeLabel || 'Thời gian',
      render: (row) => {
        const startStr = formatScheduleTime(row.startTime, row.date)
        const endStr = formatScheduleTime(row.endTime, row.date)
        return startStr && endStr ? `${startStr} - ${endStr}` : startStr || '-'
      }
    },
    {
      key: 'roomName',
      label: t.calendar?.room || 'Phòng',
      render: (row) => row.class?.id ? (
        <Link to={`/${language || 'vi'}/meet/class-${row.class.id}`} className="text-[#990011] hover:underline font-medium hover:text-[#80000e]">
          {row.roomName || t.calendar?.classRoom || 'Phòng học'}
        </Link>
      ) : (
        <span>{row.roomName || t.calendar?.notAssigned || 'Chưa xác định'}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <Popover
            trigger={
              <IconButton variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </IconButton>
            }
            content={(close) => (
              <div className="flex flex-col min-w-[200px] p-1 bg-white rounded-xl shadow-lg border border-gray-100">
                <MenuItem
                  onClick={() => {
                    navigate(`/workspace/courses/class/${row.class?.id}`)
                    close && close()
                  }}
                  icon={<DoorOpen className="w-4 h-4 text-gray-400" />}
                >
                  {t.calendar?.enterClassroom || 'Vào lớp học'}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    toast.success(t.comingSoon?.title || "Tính năng đang phát triển")
                    close && close()
                  }}
                  icon={<Edit className="w-4 h-4 text-gray-400" />}
                >
                  {t.calendar?.editSchedule || 'Chỉnh sửa lịch học'}
                </MenuItem>
              </div>
            )}
            placement="bottom-right"
          />
        </div>
      )
    }
  ]

  const monthNum = currentDate.format('M')
  const yearNum = currentDate.format('YYYY')

  let localizedMonth = `Tháng ${monthNum} ${yearNum}`
  if (language === 'en') {
    localizedMonth = `${currentDate.locale('en').format('MMMM')} ${yearNum}`
  } else if (language === 'zh') {
    localizedMonth = `${yearNum}年 ${monthNum}月`
  }

  if (isLoading) return <LoadingSpinner className="py-20 flex justify-center w-full" />

  const renderMobileCard = (row) => {
    const raw = row.rawStartTime || row.startTime || row.date
    const rawStart = row.rawStartTime || row.startTime
    const rawEnd = row.rawEndTime || row.endTime
    const startStr = rawStart && (rawStart.includes('T') || rawStart.includes('-')) ? formatTime(rawStart) : formatScheduleTime(row.startTime)
    const endStr = rawEnd && (rawEnd.includes('T') || rawEnd.includes('-')) ? formatTime(rawEnd) : formatScheduleTime(row.endTime)
    const timeText = startStr && endStr ? `${startStr} - ${endStr}` : startStr || '-'

    return (
      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <span className="font-semibold text-gray-900 line-clamp-2">
            {row.class?.name || t.calendar?.noClassName || 'Không có tên lớp'}
          </span>
          <span className="text-xs font-medium bg-[#990011]/10 text-[#990011] px-2 py-1 rounded-full whitespace-nowrap">
            {t.calendar?.session || 'Buổi'} {row.sessionNumber ? `${row.sessionNumber}/${row.totalSessions || '?'}` : '-'}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{raw ? formatDate(raw) : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{timeText}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onPrev}
            variant="ghost"
            innerClassName="!text-[#990011]"
          >
            <ChevronLeft />
          </IconButton>
          <span className="text-xl font-semibold text-[#1A1A1A] min-w-[150px] text-center">
            {localizedMonth}
          </span>
          <IconButton
            onClick={onNext}
            variant="ghost"
            innerClassName="!text-[#990011]"
          >
            <ChevronRight />
          </IconButton>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <DatePicker
            value={filterDate}
            onChange={(d) => { setFilterDate(d); setCurrentPage(1); }}
            placeholder={t.calendar?.filterByDate || "Lọc theo ngày"}
            className="w-40 sm:w-48"
          />
          {filterDate && (
            <IconButton
              variant="ghost"
              onClick={() => setFilterDate(null)}
              title={t.calendar?.clearFilter || "Bỏ lọc"}
            >
              <X className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={paginatedSessions}
          rowKey={(row) => row.id || `${row.date}-${row.startTime}`}
          emptyTitle={t.calendar?.noTeachingSchedule || "Không có lịch giảng dạy"}
          emptyDescription={`${t.calendar?.noTeachingScheduleDesc || "Bạn chưa có lịch dạy nào trong"} ${localizedMonth.toLowerCase()}.`}
          renderMobileCard={renderMobileCard}
        />
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredSessions.length}
            limit={pageSize}
            onPageChange={setCurrentPage}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

export default TeachingScheduleTab