import { useMemo } from "react"
import { useGetMyUsageQuery } from "@/store/api/plansApi"
import { useAuth } from "@/features/auth"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

export const usePlanFeatures = () => {
  const { isAuthenticated } = useAuth()

  // GET /api/v1/Plans/my-usage is the direct source of truth for the logged-in user's plan & feature usage
  const { data: myUsageResponse, isLoading } = useGetMyUsageQuery(undefined, {
    skip: !isAuthenticated,
  })

  const usageData = myUsageResponse?.data || myUsageResponse

  const userFeatures = useMemo(() => {
    if (!usageData?.features || !Array.isArray(usageData.features)) {
      return []
    }
    return usageData.features.map((f) => ({
      featureCode: f.featureCode,
      featureName: f.featureName,
      limitValue: f.limitValue,
      usedValue: f.usedValue,
      remainingValue: f.remainingValue,
      isExceeded: f.isExceeded,
      unit: f.unit,
      isActive: f.isActive ?? true,
    }))
  }, [usageData])

  // Helper to check if a boolean feature is enabled
  const hasFeature = (featureCode) => {
    const feature = userFeatures.find((f) => f.featureCode === featureCode)
    if (!feature || !feature.isActive) return false
    if (feature.limitValue === null || feature.limitValue === undefined) return false

    const val = String(feature.limitValue).toLowerCase().trim()
    return val === "true" || val === "1"
  }

  const getFeatureLimit = (featureCode) => {
    const feature = userFeatures.find((f) => f.featureCode === featureCode)
    if (!feature || !feature.isActive) return null
    return feature.limitValue
  }

  // Helper to parse numeric limits safely
  const getNumericLimit = (featureCode, defaultValue = 0) => {
    const limit = getFeatureLimit(featureCode)
    if (limit === null || limit === undefined) return defaultValue
    const parsed = parseInt(limit, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Pre-parsed limits for easy access in components
  const limits = {
    maxActiveCustomRooms: getNumericLimit(PLAN_FEATURES.MAX_ACTIVE_CUSTOM_ROOMS, 0),
    maxParticipantsInCustomRooms: getNumericLimit(PLAN_FEATURES.MAX_PARTICIPANTS_IN_CUSTOM_ROOMS, 0),
    maxActiveStories: getNumericLimit(PLAN_FEATURES.MAX_ACTIVE_STORIES, 0),
    maxAiMessages: getNumericLimit(PLAN_FEATURES.MAX_AI_MESSAGES, 10),
    maxReelsUpload: getNumericLimit(PLAN_FEATURES.MAX_REELS_UPLOAD, 5),
    maxRecordingStorageMb: getNumericLimit(PLAN_FEATURES.MAX_RECORDING_STORAGE_MB, 0),
    maxStorageMb: getNumericLimit(PLAN_FEATURES.MAX_RECORDING_STORAGE_MB, 0),
    allowRecording: hasFeature(PLAN_FEATURES.ALLOW_RECORDING),
    allowCustomRooms: hasFeature(PLAN_FEATURES.ALLOW_CUSTOM_ROOMS),
    supportPriority: getFeatureLimit(PLAN_FEATURES.SUPPORT_PRIORITY) || "Standard",
  }

  return {
    hasFeature,
    getFeatureLimit,
    limits,
    userFeatures,
    planName: usageData?.planName || "Free",
    isPro: usageData?.isPro ?? false,
    isLoading,
  }
}
