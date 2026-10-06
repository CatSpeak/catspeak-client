import { useCallback, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { getBrowserTimeZone } from "@/shared/constants/timezones"
import {
  useGetStudentDashboardAiScoreQuery,
  useGetStudentDashboardCommunityQuery,
  useGetStudentDashboardCoursesQuery,
  useGetStudentDashboardLearningTimeQuery,
  useGetStudentDashboardPurchasesQuery,
  useGetStudentDashboardRecentActivitiesQuery,
  useGetStudentDashboardSpeakingBalanceQuery,
  useGetStudentDashboardSummaryQuery,
} from "@/store/api/studentDashboardApi"
import {
  PERIOD_PRESETS,
  TIME_GRANULARITY,
  STB_PRESETS,
  ALL_COURSES_FILTER_ID,
} from "../constants/learnerDashboardConstants"

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.title ||
  error?.error ||
  "Không thể tải dữ liệu Dashboard. Vui lòng thử lại."

export const useLearnerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const userTimezone = useSelector((state) => state.auth?.user?.timeZone)

  const preset = searchParams.get("p") || PERIOD_PRESETS.MONTH
  const courseId = searchParams.get("course") || ALL_COURSES_FILTER_ID
  const [timeGranularity, setTimeGranularity] = useState(TIME_GRANULARITY.MONTH)
  const [stbPreset, setStbPreset] = useState(STB_PRESETS.TODAY)
  const timezoneId = userTimezone || getBrowserTimeZone()

  const updateFilters = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const globalPeriodParams = useMemo(
    () => ({ period: preset, timezoneId }),
    [preset, timezoneId],
  )
  const learningTimeParams = useMemo(
    () => ({ period: timeGranularity, timezoneId }),
    [timeGranularity, timezoneId],
  )
  const speakingBalanceParams = useMemo(
    () => ({ period: stbPreset, timezoneId }),
    [stbPreset, timezoneId],
  )

  const summaryQuery = useGetStudentDashboardSummaryQuery(globalPeriodParams)
  const learningTimeQuery = useGetStudentDashboardLearningTimeQuery(learningTimeParams)
  const aiScoreQuery = useGetStudentDashboardAiScoreQuery(globalPeriodParams)
  const speakingBalanceQuery = useGetStudentDashboardSpeakingBalanceQuery(
    speakingBalanceParams,
  )
  const coursesQuery = useGetStudentDashboardCoursesQuery()
  const communityQuery = useGetStudentDashboardCommunityQuery(globalPeriodParams)
  const purchasesQuery = useGetStudentDashboardPurchasesQuery()
  const activitiesQuery = useGetStudentDashboardRecentActivitiesQuery(3)

  const queries = [
    summaryQuery,
    learningTimeQuery,
    aiScoreQuery,
    speakingBalanceQuery,
    coursesQuery,
    communityQuery,
    purchasesQuery,
    activitiesQuery,
  ]
  const isInitialLoading = queries.some((query) => query.isLoading)
  const isLoading = queries.some((query) => query.isFetching)
  const failedQuery = queries.find((query) => query.isError)

  const refetch = useCallback(
    () =>
      Promise.allSettled([
        summaryQuery.refetch(),
        learningTimeQuery.refetch(),
        aiScoreQuery.refetch(),
        speakingBalanceQuery.refetch(),
        coursesQuery.refetch(),
        communityQuery.refetch(),
        purchasesQuery.refetch(),
        activitiesQuery.refetch(),
      ]),
    [
      summaryQuery,
      learningTimeQuery,
      aiScoreQuery,
      speakingBalanceQuery,
      coursesQuery,
      communityQuery,
      purchasesQuery,
      activitiesQuery,
    ],
  )

  const courses = useMemo(() => coursesQuery.data || [], [coursesQuery.data])
  const filterOptions = useMemo(
    () => ({
      courses: courses.map((course) => ({
        id: course.id,
        nameVi: course.title,
        nameEn: course.title,
      })),
    }),
    [courses],
  )
  const ongoingCourses = useMemo(
    () =>
      courseId === ALL_COURSES_FILTER_ID
        ? courses
        : courses.filter((course) => course.id === courseId),
    [courseId, courses],
  )
  const aiSpeakingScore = useMemo(
    () => ({
      ...aiScoreQuery.data,
      deltaPercent:
        summaryQuery.data?.aiSpeakingScore?.deltaPercent ?? null,
    }),
    [aiScoreQuery.data, summaryQuery.data],
  )

  return {
    preset,
    courseId,
    filterOptions,
    updateFilters,
    timeGranularity,
    setTimeGranularity,
    stbPreset,
    setStbPreset,
    isLoading: isInitialLoading || isLoading,
    isError: Boolean(failedQuery),
    errorMessage: failedQuery ? getErrorMessage(failedQuery.error) : "",
    refetch,
    kpis: isInitialLoading ? undefined : summaryQuery.data,
    activeStb: speakingBalanceQuery.data,
    activeLearningTimePoints: learningTimeQuery.data || [],
    aiSpeakingScore,
    ongoingCourses,
    community: communityQuery.data,
    purchase: purchasesQuery.data,
    recentActivities: activitiesQuery.data || [],
  }
}
