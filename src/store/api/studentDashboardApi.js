import { baseApi } from "./baseApi"

const unwrapData = (response) => response?.data ?? response

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toText = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""

const toSafeInternalPath = (value) => {
  const path = toText(value).trim()
  return path.startsWith("/") && !path.startsWith("//") ? path : ""
}

const normalizeActivityType = (value) =>
  toText(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase()

const toList = (response) => {
  const data = unwrapData(response)
  return Array.isArray(data) ? data : []
}

const buildPeriodParams = ({ period, timezoneId } = {}) => ({
  ...(period ? { Period: period } : {}),
  ...(timezoneId ? { TimezoneId: timezoneId } : {}),
})

const transformSummary = (response) => {
  const data = unwrapData(response) || {}

  return {
    totalLearningHours: {
      value: toNumber(data.totalLearningHours),
      unit: "giờ",
      unitEn: "hours",
      deltaPercent: toNullableNumber(data.totalLearningHoursGrowth),
    },
    roomsJoined: {
      value: toNumber(data.roomCount),
      unit: "phòng",
      unitEn: "rooms",
      deltaPercent: toNullableNumber(data.roomCountGrowth),
    },
    speakingStreak: {
      value: toNumber(data.speakingStreakDays),
      unit: "ngày",
      unitEn: "days",
      deltaPercent: toNullableNumber(data.speakingStreakGrowth),
    },
    totalPoints: {
      value: toNumber(data.totalPoints),
      unit: "điểm",
      unitEn: "points",
      deltaPercent: toNullableNumber(data.totalPointsGrowth),
    },
    aiSpeakingScore: {
      value: toNullableNumber(data.aiSpeakingScore),
      unit: "/ 100",
      unitEn: "/ 100",
      deltaPercent: toNullableNumber(data.aiSpeakingScoreGrowth),
    },
    averageRating: {
      value: toNullableNumber(data.averageRating),
      unit: "/ 5",
      unitEn: "/ 5",
      deltaPercent: toNullableNumber(data.averageRatingGrowth),
    },
  }
}

const transformTrend = (response) =>
  toList(response).map((item, index) => ({
    id: `${toText(item?.label) || "point"}-${index}`,
    label: toText(item?.label),
    value: toNumber(item?.value),
    tooltip: toText(item?.tooltip),
  }))

const transformLearningTime = (response) =>
  transformTrend(response).map((item) => ({
    ...item,
    hours: item.value,
  }))

const transformAiScore = (response) => {
  const trend = transformTrend(response).map((item) => ({
    ...item,
    week: item.label,
    weekEn: item.label,
    score: item.value,
  }))

  return {
    currentScore: trend.at(-1)?.score ?? null,
    trend,
  }
}

const getStbStatusKey = (status, score) => {
  const normalizedStatus = toText(status).toLowerCase()
  if (normalizedStatus.includes("excellent") || normalizedStatus.includes("xuất sắc")) {
    return "EXCELLENT"
  }
  if (normalizedStatus.includes("good") || normalizedStatus.includes("tốt")) {
    return "GOOD"
  }
  if (normalizedStatus) return "NEEDS_IMPROVEMENT"
  if (score >= 70) return "EXCELLENT"
  if (score >= 50) return "GOOD"
  return "NEEDS_IMPROVEMENT"
}

const formatMinutes = (minutes) => {
  const totalMinutes = Math.round(Math.max(0, toNumber(minutes)))
  const hours = Math.floor(totalMinutes / 60)
  const remainder = totalMinutes % 60
  if (!hours) return `${remainder}m`
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

const transformSpeakingBalance = (response) => {
  const data = unwrapData(response) || {}
  const score = toNumber(data.stbScore)
  const minutes = toNumber(data.totalSpeakingTimeMinutes)
  const words = toNumber(data.totalWordsSpoken)

  return {
    stbScore: score,
    status: toText(data.status),
    statusKey: getStbStatusKey(data.status, score),
    speakingTimeFormatted: formatMinutes(minutes),
    speakingTimeMinutes: minutes,
    wordsSpoken: words,
    averagePaceWpm: minutes > 0 ? Math.round(words / minutes) : null,
    deltaPercent: toNullableNumber(data.stbScoreGrowth),
    trend: Array.isArray(data.trendChart)
      ? data.trendChart.map((item, index) => ({
          id: `${toText(item?.label) || "point"}-${index}`,
          label: toText(item?.label),
          value: toNumber(item?.value),
          tooltip: toText(item?.tooltip),
        }))
      : [],
  }
}

const transformCourses = (response) =>
  toList(response).map((course) => {
    const id = toText(course?.courseId)
    const learnedHours = toNumber(course?.learnedDurationHours)

    return {
      id,
      title: toText(course?.courseName),
      level: toText(course?.level),
      progressPercent: Math.min(100, Math.max(0, toNumber(course?.progressPercentage))),
      learnedDuration: `${learnedHours.toLocaleString()}h`,
      learnedDurationHours: learnedHours,
      targetUrl: id
        ? `/workspace/explore-courses/details/${encodeURIComponent(id)}`
        : "/workspace/explore-courses",
    }
  })

const transformCommunity = (response) => {
  const data = unwrapData(response) || {}
  const newFriendsCount = toNumber(data.newFriendsCount)

  return {
    friends: {
      count: toNumber(data.friendsCount),
      newFriendsDelta: `+${newFriendsCount} bạn mới`,
      newFriendsDeltaEn: `+${newFriendsCount} new friends`,
      targetUrl: "/workspace/profile?tab=friends",
    },
    createdRooms: {
      count: toNumber(data.createdRoomsCount),
      targetUrl: "/workspace/rooms",
    },
    challengesJoined: {
      count: toNumber(data.participatedChallengesCount),
      targetUrl: "/games",
    },
    publishedVideos: {
      count: toNumber(data.publishedVideosCount),
      targetUrl: "/workspace/reels",
    },
    publishedArticles: {
      count: toNumber(data.publishedPostsCount),
      targetUrl: "/workspace/profile?tab=posts",
    },
  }
}

const transformPurchases = (response) => {
  const data = unwrapData(response) || {}
  const planName = toText(data.currentSubscriptionName)
  const remainingDays = toNullableNumber(data.subscriptionRemainingDays)

  return {
    vipPackagesBought: toNumber(data.vipPackagesBoughtCount),
    subscription: {
      isActive: Boolean(planName) && (remainingDays === null || remainingDays >= 0),
      planName,
      planNameEn: planName,
      daysRemaining: remainingDays,
    },
    paymentHistory: {
      targetUrl: "/billing",
    },
    rewards: {
      vouchersCount: toNumber(data.voucherCount),
      rewardPoints: toNumber(data.rewardPoints),
    },
  }
}

const transformActivities = (response) =>
  toList(response).map((activity, index) => {
    const type = normalizeActivityType(activity?.activityType)
    const title = toText(activity?.activityTitle)
    const relativeTime = toText(activity?.relativeTime)
    const occurredAt = toText(activity?.occurredAt)

    return {
      id: `${type || "activity"}-${occurredAt || index}-${index}`,
      type,
      titleVi: title,
      titleEn: title,
      timeAgoVi: relativeTime,
      timeAgoEn: relativeTime,
      occurredAt,
      targetUrl: toSafeInternalPath(activity?.targetUrl),
    }
  })

export const studentDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDashboardSummary: builder.query({
      query: (params) => ({
        url: "/StudentDashboard/summary",
        params: buildPeriodParams(params),
      }),
      transformResponse: transformSummary,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardLearningTime: builder.query({
      query: (params) => ({
        url: "/StudentDashboard/learning-time",
        params: buildPeriodParams(params),
      }),
      transformResponse: transformLearningTime,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardAiScore: builder.query({
      query: (params) => ({
        url: "/StudentDashboard/ai-score",
        params: buildPeriodParams(params),
      }),
      transformResponse: transformAiScore,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardSpeakingBalance: builder.query({
      query: (params) => ({
        url: "/StudentDashboard/speaking-balance",
        params: buildPeriodParams(params),
      }),
      transformResponse: transformSpeakingBalance,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardCourses: builder.query({
      query: () => "/StudentDashboard/enrolled-courses",
      transformResponse: transformCourses,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardCommunity: builder.query({
      query: (params) => ({
        url: "/StudentDashboard/community-overview",
        params: buildPeriodParams(params),
      }),
      transformResponse: transformCommunity,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardPurchases: builder.query({
      query: () => "/StudentDashboard/purchases",
      transformResponse: transformPurchases,
      providesTags: ["StudentDashboard"],
    }),
    getStudentDashboardRecentActivities: builder.query({
      query: (limit = 3) => ({
        url: "/StudentDashboard/recent-activities",
        params: { limit },
      }),
      transformResponse: transformActivities,
      providesTags: ["StudentDashboard"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetStudentDashboardSummaryQuery,
  useGetStudentDashboardLearningTimeQuery,
  useGetStudentDashboardAiScoreQuery,
  useGetStudentDashboardSpeakingBalanceQuery,
  useGetStudentDashboardCoursesQuery,
  useGetStudentDashboardCommunityQuery,
  useGetStudentDashboardPurchasesQuery,
  useGetStudentDashboardRecentActivitiesQuery,
} = studentDashboardApi
