import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"
import { PlanRequiredState } from "@/shared/components/ui/indicators"
import { toast } from "@/components/ui/toast"
import { useCreateSessionMutation, useGetRetakeStatusQuery } from "../api"
import {
  PLACEMENT_TEST_DASHBOARD_PATH,
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_SESSION_PATH,
} from "../constants/routes"
import { DEFAULT_TARGET_BAND } from "../constants/bands"
import {
  computeOverallScore,
  getBandDescriptor,
  getDimensionScores,
  getTargetRoadmapBand,
} from "../utils/result"
import { getRetakeEligibility, getRoadmapProgress } from "../utils/cooldown"
import { formatDate, formatTemplate } from "../utils/format"
import { readActiveSession, readResult } from "../utils/sessionStorage"
import ProfileTopbar from "../components/profile/ProfileTopbar"
import ProfileCertificateCard from "../components/profile/ProfileCertificateCard"
import ProfileRoadmapCard from "../components/profile/ProfileRoadmapCard"
import ProfileSkillsCard from "../components/profile/ProfileSkillsCard"
import ProfileCooldownCard from "../components/profile/ProfileCooldownCard"
import ProfileHistoryCard from "../components/profile/ProfileHistoryCard"
import ProfileAdviceCard from "../components/profile/ProfileAdviceCard"
import ConfirmRetakeModal from "../components/profile/ConfirmRetakeModal"

const targetBandForLevel = (band) => {
  const value = Number(band)
  if (!Number.isFinite(value)) return DEFAULT_TARGET_BAND
  if (value <= 2) return "hsk1_2"
  if (value <= 4) return "hsk3_4"
  return "hsk5_6"
}

const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "?"

const PlacementProfilePage = () => {
  const { t } = useLanguage()
  const root = t.placementTest || {}
  const copy = root.profile || {}
  const tierLabels = root.tiers || {}
  const dimensions = root.result?.dimensions
  const scoreOf = root.result?.scoreOf
  const studentFallback = root.result?.studentFallback
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasFeature, isLoading: isPlanLoading } = usePlanFeatures()
  const canAccessPlacement = hasFeature(PLAN_FEATURES.ALLOW_PLACEMENT_TEST)

  const [result] = useState(readResult)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: retakeStatus } = useGetRetakeStatusQuery()
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()

  const view = useMemo(() => {
    const effectiveBand = result?.band || retakeStatus?.currentHskLevel
    if (!effectiveBand) return null
    const descriptor = getBandDescriptor(effectiveBand)
    const eligibility = retakeStatus
      ? {
          hasHistory: retakeStatus.hasHistory,
          // eligible: retakeStatus.eligible,
          eligible: true,
          lastTestedAt: retakeStatus.lastTestedAt,
          eligibleAt: retakeStatus.eligibleRetakeAt,
          daysElapsed: retakeStatus.daysElapsed,
          daysRemaining: 0,
          progress: 100,
          totalDays: retakeStatus.totalDays,
        }
      : getRetakeEligibility({ lastTestedAt: result?.scoredAt })
    const roadmap = getRoadmapProgress(eligibility)
    const overall = result ? computeOverallScore(result) : 70
    const roadmapBand = getTargetRoadmapBand(effectiveBand)
    const skills = result
      ? getDimensionScores(result).map((item) => ({
          ...item,
          label: dimensions?.[item.key] || item.key,
          scoreText: formatTemplate(scoreOf, { score: item.score }),
        }))
      : []

    return {
      descriptor,
      eligibility,
      roadmap,
      overall,
      roadmapBand,
      skills,
      testDate: formatDate(result?.scoredAt || retakeStatus?.lastTestedAt || Date.now()),
      eligibleDate: formatDate(eligibility.eligibleAt),
    }
  }, [result, retakeStatus, dimensions, scoreOf])

  const studentName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.nickname ||
    studentFallback ||
    ""

  const handleContinue = useCallback(() => {
    navigate(PLACEMENT_TEST_DASHBOARD_PATH)
  }, [navigate])

  const handleOpenRetake = useCallback(() => {
    setConfirmOpen(true)
  }, [])

  const handleCloseRetake = useCallback(() => {
    if (!creating) setConfirmOpen(false)
  }, [creating])

  const handleConfirmRetake = useCallback(async () => {
    const active = readActiveSession()
    const targetBand =
      active?.targetBand || targetBandForLevel(result?.band || retakeStatus?.currentHskLevel) || DEFAULT_TARGET_BAND
    try {
      await createSession({
        targetBand,
        forceRetake: true,
        studentId: user?.id ?? user?.accountId ?? null,
      }).unwrap()
      setConfirmOpen(false)
      navigate(PLACEMENT_TEST_SESSION_PATH)
    } catch {
      toast.error(copy.confirm?.errorToast)
    }
  }, [createSession, navigate, result, retakeStatus, user, copy.confirm])

  if (isPlanLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cath-red-600 border-t-transparent" />
      </div>
    )
  }

  if (!canAccessPlacement) {
    return (
      <PlanRequiredState
        pageTitle={root.title || "Đánh giá trình độ"}
        title={root.planRequiredTitle || "Yêu cầu Gói Pro"}
        subtext={
          root.planRequiredSubtext ||
          "Tính năng Đánh giá trình độ (Placement Test) cùng AI chỉ dành cho người dùng gói Pro. Vui lòng nâng cấp gói để trải nghiệm tính năng này!"
        }
        featureName="Placement Test"
        animationKey="placement-profile-pro-required"
      />
    )
  }

  if (!view) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 rounded-2xl bg-white p-8 text-center shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07)]">
          <h1 className="text-xl font-bold leading-7 text-[#09090B]">
            {copy.emptyTitle}
          </h1>
          <p className="text-sm font-medium leading-[22px] text-slate-600">
            {copy.emptyBody}
          </p>
          <button
            type="button"
            onClick={() => navigate(PLACEMENT_TEST_PATH)}
            className="mx-auto mt-1 h-11 rounded-xl bg-cath-red-700 px-5 text-sm font-bold text-white transition hover:brightness-90"
          >
            {copy.emptyCta}
          </button>
        </div>
      </div>
    )
  }

  const { descriptor, eligibility, roadmap } = view
  const tierLabel = tierLabels[descriptor.tierKey] || descriptor.tierKey
  const adviceText = eligibility.eligible
    ? formatTemplate(copy.adviceEligible, {
        band: descriptor.band,
        nextBand: view.roadmapBand,
      })
    : formatTemplate(copy.adviceCooling, {
        percent: roadmap.percent,
        band: descriptor.band,
        nextBand: view.roadmapBand,
        date: view.eligibleDate,
      })

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
        <ProfileTopbar
          copy={copy}
          studentName={studentName}
          band={descriptor.band}
          initials={getInitials(studentName)}
        />

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-2.5 lg:w-[49%]">
            <ProfileCertificateCard
              copy={copy}
              band={descriptor.band}
              tierLabel={tierLabel}
              cefr={descriptor.cefr}
              score={view.overall}
              description={formatTemplate(copy.certificateDescription, {
                date: view.testDate,
              })}
              testDate={view.testDate}
              code={result.code}
            />
            <ProfileRoadmapCard
              copy={copy}
              band={view.roadmapBand}
              progress={roadmap}
            />
            <ProfileSkillsCard copy={copy} items={view.skills} />
          </div>

          <div className="flex w-full flex-col gap-2.5 lg:w-[51%]">
            <ProfileCooldownCard
              copy={copy}
              variant={eligibility.eligible ? "eligible" : "locked"}
              eligibility={eligibility}
              band={descriptor.band}
              unlockDate={view.eligibleDate}
              onRetake={handleOpenRetake}
              onContinue={handleContinue}
            />
            <ProfileHistoryCard
              copy={copy}
              band={descriptor.band}
              score={view.overall}
              testDate={view.testDate}
              eligible={eligibility.eligible}
              eligibleDate={view.eligibleDate}
            />
            <ProfileAdviceCard copy={copy} text={adviceText} />
          </div>
        </div>

        <ConfirmRetakeModal
          open={confirmOpen}
          onClose={handleCloseRetake}
          copy={copy.confirm || {}}
          confirming={creating}
          onConfirm={handleConfirmRetake}
        />
      </div>
    </div>
  )
}

export default PlacementProfilePage
