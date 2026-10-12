import React from "react"
import { useLearnerDashboard } from "../../hooks/useLearnerDashboard"
import LearnerDashboardHeader from "./LearnerDashboardHeader"
import LearnerFilterBar from "./LearnerFilterBar"
import LearnerKpiGrid from "./LearnerKpiGrid"
import LearningTimeSection from "./LearningTimeSection"
import StbSection from "./StbSection"
import AiSpeakingScoreSection from "./AiSpeakingScoreSection"
import OngoingCoursesSection from "./OngoingCoursesSection"
import CommunityOverviewSection from "./CommunityOverviewSection"
import PurchaseInfoSection from "./PurchaseInfoSection"
import RecentActivitiesSection from "./RecentActivitiesSection"
import LearnerDashboardSkeleton from "./LearnerDashboardSkeleton"
import LearnerDashboardError from "./LearnerDashboardError"

const LearnerDashboardPage = () => {
  const {
    preset,
    courseId,
    filterOptions,
    updateFilters,
    timeGranularity,
    setTimeGranularity,
    stbPreset,
    setStbPreset,
    isLoading,
    isError,
    errorMessage,
    refetch,
    kpis,
    activeStb,
    activeLearningTimePoints,
    aiSpeakingScore,
    ongoingCourses,
    community,
    purchase,
    recentActivities,
  } = useLearnerDashboard()

  if (isLoading && !kpis) {
    return <LearnerDashboardSkeleton />
  }

  if (isError && !kpis) {
    return <LearnerDashboardError message={errorMessage} onRetry={refetch} />
  }

  return (
    <div className="w-full flex flex-col pb-12">
      {/* 1. Header with Breadcrumb & Refresh */}
      <LearnerDashboardHeader onRefresh={refetch} isRefreshing={isLoading} />

      {/* 2. Global Filter Bar */}
      <LearnerFilterBar
        preset={preset}
        courseId={courseId}
        filterOptions={filterOptions}
        onFilterChange={updateFilters}
      />

      {/* 3. 6 Core KPI Summary Cards */}
      <LearnerKpiGrid kpis={kpis} />

      {/* 4. Row 1 Analytics: Learning Time Trend & STB */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <LearningTimeSection
          data={activeLearningTimePoints}
          timeGranularity={timeGranularity}
          onGranularityChange={setTimeGranularity}
        />
        <StbSection
          stbData={activeStb}
          stbPreset={stbPreset}
          onStbPresetChange={setStbPreset}
        />
      </div>

      {/* 5. Row 2: AI Speaking Score & Ongoing Courses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AiSpeakingScoreSection data={aiSpeakingScore} />
        <OngoingCoursesSection courses={ongoingCourses} />
      </div>

      {/* 6. Row 3: Community Engagement Overview */}
      <div className="mb-6">
        <CommunityOverviewSection data={community} />
      </div>

      {/* 7. Row 4: Purchase / Subscriptions & Recent Activities */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <PurchaseInfoSection data={purchase} />
        <RecentActivitiesSection activities={recentActivities} />
      </div>
    </div>
  )
}

export default LearnerDashboardPage
