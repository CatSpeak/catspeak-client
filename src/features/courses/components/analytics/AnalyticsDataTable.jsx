import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetAllClassesQuery, useLazyGetAllClassesQuery } from "@/store/api/coursesApi"

const EXPAND_PAGE_SIZE = 5

const STATUS_COLOR_MAP = {
  UPCOMING: "bg-blue-50 text-blue-600",
  OPEN_FOR_ENROLLMENT: "bg-green-50 text-green-600",
  NOT_STARTED: "bg-gray-100 text-gray-500",
  TEACHING: "bg-orange-50 text-orange-600",
  ARCHIVED: "bg-gray-100 text-gray-400",
  FINISHED: "bg-gray-100 text-gray-400",
}

const StatusPill = ({ status, secT = {} }) => {
  const labelMap = {
    UPCOMING: secT.statusUpcoming || "Sắp mở",
    OPEN_FOR_ENROLLMENT: secT.statusOpen || "Đang mở ĐK",
    NOT_STARTED: secT.statusNotStarted || "Chưa bắt đầu",
    TEACHING: secT.statusTeaching || "Đang dạy",
    ARCHIVED: secT.statusArchived || "Đã lưu trữ",
    FINISHED: secT.statusFinished || "Đã kết thúc",
  }

  const label = labelMap[status] || status || "-"
  const colorClass = STATUS_COLOR_MAP[status] || "bg-gray-100 text-gray-500"

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

const SkeletonRows = ({ count }) => (
  <div className="flex flex-col gap-2 py-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-100 rounded animate-pulse w-full" />
    ))}
  </div>
)

const ClassExpandRow = ({ courseId, colSpan, pageSize = EXPAND_PAGE_SIZE }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const secT = t.courses?.analytics?.sections || {}
  const colT = t.courses?.analytics?.tableCols || {}
  const [page, setPage] = useState(1)

  const { data: responseData, isFetching } = useGetAllClassesQuery(
    { courseId: parseInt(courseId), page: 1, pageSize: page * pageSize },
    { skip: !courseId },
  )

  const classes = responseData?.data ?? (Array.isArray(responseData) ? responseData : [])
  const total = responseData?.pagination?.totalItems ?? responseData?.total ?? classes.length
  const hasMore = classes.length < total
  const isInitialLoad = isFetching && classes.length === 0

  return (
    <tr>
      <td colSpan={colSpan} className="bg-[#F8F9FA] border-b border-[#E8EBED] px-0 py-0">
        <div className="pl-8 pr-4 py-2">
          {isInitialLoad ? (
            <SkeletonRows count={pageSize} />
          ) : classes.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">{secT.noClasses || "Không có lớp học nào."}</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="py-1 text-left font-medium text-[#6E788C] w-[40%]">{colT.class || "Lớp học"}</th>
                  <th className="py-1 text-left font-medium text-[#6E788C]">{colT.status || "Trạng thái"}</th>
                  <th className="py-1 text-right font-medium text-[#6E788C]">{colT.totalStudents || "Học viên"}</th>
                  <th className="py-1 text-right font-medium text-[#6E788C] pr-1">{colT.progress || "Tiến độ"}</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cl) => {
                  const studentCount = cl.studentCount ?? cl.enrolledStudents ?? 0
                  const completed = cl.progress?.completedSessions ?? cl.completedSessions ?? 0
                  const totalSessions = cl.progress?.totalSessions ?? cl.totalSessions ?? 0
                  const progressStr = `${completed}/${totalSessions}`

                  return (
                    <tr
                      key={cl.id}
                      onClick={() => {
                        if (cl.id) {
                          navigate(`/workspace/analytics/class/${encodeURIComponent(cl.id)}`)
                        }
                      }}
                      className="border-t border-[#F0F1F3] cursor-pointer group"
                    >
                      <td className="py-1.5 text-[#333B47] group-hover:text-[#B20514] font-medium transition-colors truncate max-w-[200px]">
                        {cl.name || cl.title}
                      </td>
                      <td className="py-1.5"><StatusPill status={cl.status} secT={secT} /></td>
                      <td className="py-1.5 text-right text-[#333B47]">{studentCount}</td>
                      <td className="py-1.5 text-right text-[#333B47] pr-1">
                        {progressStr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {(hasMore || (isFetching && classes.length > 0)) && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="mt-2 flex items-center gap-1 text-[11px] text-[#B20514] font-medium hover:underline disabled:opacity-50 disabled:cursor-wait cursor-pointer"
            >
              {isFetching ? (secT.loading || "Đang tải...") : (
                <>{secT.seeMore || "Xem thêm"} <ChevronDown size={11} /></>
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

const AnalyticsDataTable = ({
  columns = [],
  data = [],
  pageSize = 5,
  emptyMessage,
  expandConfig,
}) => {
  const { language, t } = useLanguage()
  const secT = t.courses?.analytics?.sections || {}

  const defaultEmptyMsg = secT.noData || "Không có dữ liệu phù hợp."
  const showingStr = secT.showing || "Hiển thị"
  const ofStr = secT.of || "trong"

  const [sortKey, setSortKey] = useState(columns[0]?.key || "")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [openRows, setOpenRows] = useState(new Set())
  const [prefetchedCourseIds, setPrefetchedCourseIds] = useState(new Set())

  const [prefetchClasses] = useLazyGetAllClassesQuery()

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const col = columns.find((c) => c.key === sortKey)

    let left = col?.sortValue
      ? col.sortValue(a)
      : (a[`${sortKey}Raw`] !== undefined ? a[`${sortKey}Raw`] : a[sortKey])
    let right = col?.sortValue
      ? col.sortValue(b)
      : (b[`${sortKey}Raw`] !== undefined ? b[`${sortKey}Raw`] : b[sortKey])

    if (typeof left === "string" && typeof right === "string") {
      // Strip currency symbols, spaces, percent signs to attempt numeric comparison
      const cleanL = left.replace(/[^\d.-]/g, "")
      const cleanR = right.replace(/[^\d.-]/g, "")
      if (cleanL.length > 0 && cleanR.length > 0 && !isNaN(Number(cleanL)) && !isNaN(Number(cleanR)) && !/[a-zA-Z]{3,}/.test(left)) {
        left = Number(cleanL)
        right = Number(cleanR)
      }
    }

    let comp = 0
    if (typeof left === "number" && typeof right === "number" && !isNaN(left) && !isNaN(right)) {
      comp = left - right
    } else {
      comp = String(left ?? "").localeCompare(String(right ?? ""), language === "en" ? "en" : "vi", { numeric: true })
    }
    return sortDirection === "asc" ? comp : -comp
  })

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleRows = sortedData.slice(startIdx, startIdx + pageSize)
  const endIdx = Math.min(startIdx + pageSize, sortedData.length)

  const getVisiblePages = () => {
    const pages = []
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) {
        pages.push(p)
      }
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    setOpenRows(new Set())
  }

  const toggleRow = (courseId) => {
    if (!courseId) return
    setOpenRows((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }

  const handleExpandHover = (courseId) => {
    if (!courseId) return
    const id = parseInt(courseId)
    if (prefetchedCourseIds.has(id)) return

    setPrefetchedCourseIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    prefetchClasses({ courseId: id, page: 1, pageSize: expandConfig?.pageSize ?? EXPAND_PAGE_SIZE })
  }

  const effectiveColumns = expandConfig
    ? [
        ...columns.filter((c) => c.key !== "expand"),
        {
          key: "expand",
          label: "",
          align: "right",
          noSort: true,
        },
      ]
    : columns

  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Scrollable Table Area */}
      <div className="w-full overflow-x-auto border border-[#DEE0E5] rounded-xl scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-[#FBFBFC] border-b border-[#E8EBED]">
              {effectiveColumns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    className={`p-2.5 font-semibold text-[#616B80] whitespace-nowrap ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.noSort ? (
                      col.label
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1 font-semibold text-inherit hover:text-[#B20514] transition-colors cursor-pointer"
                      >
                        {col.label}
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ChevronUp size={14} className="text-[#B20514]" />
                          ) : (
                            <ChevronDown size={14} className="text-[#B20514]" />
                          )
                        ) : null}
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, rIdx) => {
                const courseId = expandConfig ? row[expandConfig.courseIdKey] : null
                const isOpen = courseId && openRows.has(courseId)
                return (
                  <React.Fragment key={rIdx}>
                    <tr className="border-b border-[#E8EBED] hover:bg-[#FBFBFC] transition-colors">
                      {effectiveColumns.map((col) => {
                        if (col.key === "expand") {
                          return (
                            <td key="expand" className="p-2.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onMouseEnter={() => handleExpandHover(courseId)}
                                onClick={() => toggleRow(courseId)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B20514] hover:text-[#8a0410] transition-colors cursor-pointer"
                              >
                                {secT.classesLabel || "Lớp học"}
                                {isOpen
                                  ? <ChevronUp size={12} />
                                  : <ChevronDown size={12} />}
                              </button>
                            </td>
                          )
                        }
                        return (
                          <td
                            key={col.key}
                            className={`p-2.5 text-[#333B47] whitespace-nowrap ${
                              col.align === "right" ? "text-right" : "text-left"
                            }`}
                          >
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </td>
                        )
                      })}
                    </tr>
                    {isOpen && (
                      <ClassExpandRow
                        courseId={courseId}
                        colSpan={effectiveColumns.length}
                        pageSize={expandConfig?.pageSize ?? EXPAND_PAGE_SIZE}
                      />
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={effectiveColumns.length}
                  className="p-8 text-center text-gray-400 font-medium"
                >
                  {emptyMessage || defaultEmptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between gap-4 pt-3 text-xs text-gray-500">
          <span>
            {showingStr} {sortedData.length === 0 ? 0 : startIdx + 1}–{endIdx} {ofStr} {sortedData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 rounded-lg border border-[#D6D9E0] bg-white hover:border-[#B20514] hover:text-[#B20514] disabled:opacity-40 disabled:hover:border-[#D6D9E0] disabled:hover:text-gray-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {visiblePages.map((pNum, pIdx) => {
              const prevP = visiblePages[pIdx - 1]
              const showEllipsis = prevP && pNum - prevP > 1
              return (
                <React.Fragment key={pNum}>
                  {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(pNum)}
                    className={`min-w-[28px] h-7 px-1.5 rounded-lg border font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      pNum === safePage
                        ? "bg-[#B20514] border-[#B20514] text-white"
                        : "bg-white border-[#D6D9E0] text-[#14171F] hover:border-[#B20514] hover:text-[#B20514]"
                    }`}
                  >
                    {pNum}
                  </button>
                </React.Fragment>
              )
            })}

            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 rounded-lg border border-[#D6D9E0] bg-white hover:border-[#B20514] hover:text-[#B20514] disabled:opacity-40 disabled:hover:border-[#D6D9E0] disabled:hover:text-gray-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDataTable
