import { useMemo } from "react"
import { useGetPlansQuery } from "@/store/api/plansApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

export const usePlanFeatures = () => {
  const { isAuthenticated } = useAuth()
  
  // 1. Get user profile
  const { data: profileResponse, isLoading: isProfileLoading } = 
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
    
  // 2. Get all plans
  const { data: plansResponse = [], isLoading: isPlansLoading } = 
    useGetPlansQuery(undefined, { skip: !isAuthenticated })
    
  const isLoading = isProfileLoading || isPlansLoading
  
  const userFeatures = useMemo(() => {
    if (!profileResponse?.data || !plansResponse.length) return []
    
    const userTierName = (profileResponse.data.tier || "Free").toLowerCase()
    
    const currentPlan = plansResponse.find(
      (plan) => plan.planName?.toLowerCase() === userTierName
    )
    
    if (!currentPlan?.subscriptionFeatures) return []
    
    return currentPlan.subscriptionFeatures
  }, [profileResponse, plansResponse])

  // Helper to check if a boolean feature is enabled
  const hasFeature = (featureCode) => {
    const feature = userFeatures.find(f => f.featureCode === featureCode)
    if (!feature || !feature.isActive) return false
    
    if (feature.valueType === "boolean") {
      return feature.limitValue === "true" || feature.limitValue === true
    }
    return !!feature.limitValue
  }

  const getFeatureLimit = (featureCode) => {
    const feature = userFeatures.find(f => f.featureCode === featureCode)
    if (!feature || !feature.isActive) return null
    return feature.limitValue
  }

  // Helper to parse numeric limits safely
  const getNumericLimit = (featureCode, defaultValue = 0) => {
    const limit = getFeatureLimit(featureCode)
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
    isLoading
  }
}
