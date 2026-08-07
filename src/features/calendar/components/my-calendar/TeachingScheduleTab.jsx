import React, { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X } from 'lucide-react'
import { useGetScheduleSessionsQuery } from '@/store/api/coursesApi'
import DataTable from '@/shared/components/ui/DataTable'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import { IconButton } from '@/shared/components/ui/buttons'
import Pagination from '@/shared/components/ui/navigation/Pagination'
import DatePicker from '@/shared/components/ui/inputs/DatePicker'

const TeachingScheduleTab = ({ currentDate = dayjs(), onPrev, onNext }) => {
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
    ? rawSessions.filter(s => s.date && dayjs(s.date).format('YYYY-MM-DD') === dayjs(filterDate).format('YYYY-MM-DD'))
    : rawSessions

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const columns = [
    {
      key: 'class',
      label: 'Lớp học',
      render: (row) => <span className="font-medium text-gray-900">{row.class?.name || 'Không có tên lớp'}</span>
    },
    {
      key: 'sessionNumber',
      label: 'Buổi học',
      render: (row) => row.sessionNumber ? `${row.sessionNumber}/${row.totalSessions || '?'}` : '-'
    },
    {
      key: 'date',
      label: 'Ngày',
      render: (row) => row.date ? dayjs(row.date).format('DD/MM/YYYY') : '-'
    },
    {
      key: 'time',
      label: 'Thời gian',
      render: (row) => `${row.startTime || ''} - ${row.endTime || ''}`
    },
    {
      key: 'location',
      label: 'Hình thức / Địa điểm',
      render: (row) => row.isOnline ? 'Trực tuyến' : (row.location || 'Chưa xác định')
    }
  ]

  const monthNum = currentDate.format('M')
  const yearNum = currentDate.format('YYYY')
  const localizedMonth = `Tháng ${monthNum} ${yearNum}`

  if (isLoading) return <LoadingSpinner className="py-20 flex justify-center w-full" />

  const renderMobileCard = (row) => (
    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-start gap-4">
        <span className="font-semibold text-gray-900 line-clamp-2">
          {row.class?.name || 'Không có tên lớp'}
        </span>
        <span className="text-xs font-medium bg-[#990011]/10 text-[#990011] px-2 py-1 rounded-full whitespace-nowrap">
          Buổi {row.sessionNumber ? `${row.sessionNumber}/${row.totalSessions || '?'}` : '-'}
        </span>
      </div>
      <div className="text-sm text-gray-600 space-y-2 mt-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{row.date ? dayjs(row.date).format('DD/MM/YYYY') : '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{`${row.startTime || ''} - ${row.endTime || ''}`}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{row.isOnline ? 'Trực tuyến' : (row.location || 'Chưa xác định')}</span>
        </div>
      </div>
    </div>
  )

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
            placeholder="Lọc theo ngày"
            className="w-40 sm:w-48"
          />
          {filterDate && (
            <IconButton 
              variant="ghost" 
              onClick={() => setFilterDate(null)}
              title="Bỏ lọc"
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
          emptyTitle="Không có lịch giảng dạy"
          emptyDescription={`Bạn chưa có lịch dạy nào trong ${localizedMonth.toLowerCase()}.`}
          renderMobileCard={renderMobileCard}
        />
        {totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChangePage={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

export default TeachingScheduleTab