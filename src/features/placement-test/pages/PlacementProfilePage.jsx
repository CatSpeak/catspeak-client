import { useCallback, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { useGetPlacementPermissionQuery } from "@/store/api/plansApi"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"
import { PlanRequiredState } from "@/shared/components/ui/indicators"
import { toast } from "@/components/ui/toast"
import { useCreateSessionMutation, useGetRetakeStatusQuery } from "../api"
import { isPlanForbiddenError } from "../utils/planAccess"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_SESSION_PATH,
  getLearningPathDayPath,
  getLearningPathPath,
} from "../constants/routes"
import { DEFAULT_TARGET_BAND } from "../constants/bands"
import {
  DIMENSION_KEYS,
  computeOverallScore,
  getAllDimensionScores,
  getBandDescriptor,
  getTargetRoadmapBand,
  isInsufficientEvidence,
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

/** Bản `result`-shaped từ lần thi máy chủ giữ (GET /profile → lastAttempt). */
const serverAttemptResult = (lastAttempt) => {
  if (!lastAttempt) return null
  return {
    band: lastAttempt.finalHskLevel,
    code: lastAttempt.sessionId,
    scoredAt: lastAttempt.scoredAt,
    pronunciation: lastAttempt.scores?.pronunciation,
    vocabulary: lastAttempt.scores?.vocabulary,
    grammar: lastAttempt.scores?.grammar,
    fluency: lastAttempt.scores?.fluency,
  }
}

const fillAttempt = (primary, fallback) => {
  // Chỉ trộn khi chắc chắn cùng một lần thi. Một kết quả local cũ thiếu `code`
  // không được nhận điểm, mã hay ngày của phiên server khác (R-data-001).
  const sameAttempt = Boolean(
    primary.code && fallback.code && primary.code === fallback.code,
  )
  if (!sameAttempt) return { ...primary }
  const filled = {
    ...primary,
    scoredAt: primary.scoredAt ?? fallback.scoredAt,
  }
  for (const key of DIMENSION_KEYS) {
    filled[key] = primary[key] ?? fallback[key]
  }
  return filled
}

/**
 * Local là bản vừa thi trên máy này; server là bản còn lại sau khi xoá cache.
 * Chọn bản mới hơn theo `scoredAt`; thiếu mốc thời gian thì giữ local (hành vi cũ).
 * Chỉ vá chỗ trống từ bản kia khi hai bản cùng `code` (cùng một lần thi).
 */
const pickAttempt = (local, server) => {
  if (!local) return server
  if (!server) return local
  const localAt = Number(local.scoredAt)
  const serverAt = Number(server.scoredAt)
  const localHasTime = Number.isFinite(localAt) && localAt > 0
  const serverHasTime = Number.isFinite(serverAt) && serverAt > 0
  if (!localHasTime || !serverHasTime) return fillAttempt(local, server)
  return serverAt > localAt ? fillAttempt(server, local) : fillAttempt(local, server)
}

const PlacementProfilePage = () => {
  const { t } = useLanguage()
  const root = t.placementTest || {}
  const copy = root.profile || {}
  const resultCopy = root.result || {}
  const tierLabels = root.tiers || {}
  const dimensions = root.result?.dimensions
  const scoreOf = root.result?.scoreOf
  const studentFallback = root.result?.studentFallback
  const navigate = useNavigate()
  const { lang } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { hasFeature, isLoading: isPlanLoading } = usePlanFeatures()
  // Gate on the permission the AI API actually enforces (see PlacementTestPage).
  const { data: placementPermission, isLoading: isPermissionLoading } =
    useGetPlacementPermissionQuery(undefined, { skip: !isAuthenticated })
  const [createSession, { isLoading: creating, error: createError }] =
    useCreateSessionMutation()
  const planDenied = isPlanForbiddenError(createError)
  const canAccessPlacement =
    !planDenied &&
    (placementPermission?.isAllowed ??
      hasFeature(PLAN_FEATURES.ALLOW_PLACEMENT_TEST))

  const [result] = useState(readResult)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: retakeStatus } = useGetRetakeStatusQuery()

  const view = useMemo(() => {
    const attempt = pickAttempt(result, serverAttemptResult(retakeStatus?.lastAttempt))
    // Cấp hiện tại do hồ sơ quyết (HSK 2 sau tự điều chỉnh); cấp của lần thi đã
    // chấm chỉ còn trong ghi chú "từ HSK 1 sang HSK 2".
    const effectiveBand = retakeStatus?.currentHskLevel ?? attempt?.band
    if (!effectiveBand) return null
    const descriptor = getBandDescriptor(effectiveBand)
    const eligibility = retakeStatus
      ? {
          hasHistory: retakeStatus.hasHistory,
          // BUG-PT-16: khóa thi lại 14 ngày theo máy chủ, áp dụng cho mọi gói (v1).
          eligible: Boolean(retakeStatus.eligible),
          cooldownBypassed: Boolean(retakeStatus.cooldownBypassed),
          lastTestedAt: retakeStatus.lastTestedAt,
          eligibleAt: retakeStatus.eligibleRetakeAt,
          daysElapsed: retakeStatus.daysElapsed,
          daysRemaining: retakeStatus.eligible
            ? 0
            : Number(retakeStatus.daysRemaining) || 0,
          progress: retakeStatus.eligible
            ? 100
            : Number(retakeStatus.progress) || 0,
          totalDays: retakeStatus.totalDays,
        }
      : getRetakeEligibility({ lastTestedAt: attempt?.scoredAt })
    const roadmap = getRoadmapProgress(eligibility)
    const overall = attempt ? computeOverallScore(attempt) : null
    const roadmapBand = getTargetRoadmapBand(effectiveBand)
    const skills = attempt
      ? getAllDimensionScores(attempt).map((item) => ({
          ...item,
          label: dimensions?.[item.key] || item.key,
          scoreText: item.measured
            ? formatTemplate(scoreOf, { score: item.score })
            : root.result?.notMeasured || "Chưa đo được",
        }))
      : []
    const lastAttempt = retakeStatus?.lastAttempt
    const adjustmentNote =
      lastAttempt?.selfAdjusted &&
      lastAttempt.adjustedFromHskLevel !== null &&
      lastAttempt.adjustedFromHskLevel !== undefined &&
      Number(lastAttempt.adjustedFromHskLevel) !== Number(effectiveBand) &&
      copy.selfAdjustedNote
        ? formatTemplate(copy.selfAdjustedNote, {
            from: lastAttempt.adjustedFromHskLevel,
            to: effectiveBand,
          })
        : null

    return {
      descriptor,
      eligibility,
      roadmap,
      overall,
      roadmapBand,
      skills,
      code: attempt?.code || "",
      adjustmentNote,
      testDate: formatDate(attempt?.scoredAt || retakeStatus?.lastTestedAt),
      eligibleDate: formatDate(eligibility.eligibleAt),
    }
  }, [
    result,
    retakeStatus,
    dimensions,
    scoreOf,
    root.result?.notMeasured,
    copy.selfAdjustedNote,
  ])

  const studentName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.nickname ||
    studentFallback ||
    ""

  const handleContinue = useCallback(() => {
    navigate(getLearningPathPath(lang))
  }, [lang, navigate])

  const handleContinueRoadmapDay = useCallback(
    (day) => {
      navigate(getLearningPathDayPath(lang, day))
    },
    [lang, navigate],
  )

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
        studentId: user?.id ?? user?.accountId ?? null,
      }).unwrap()
      setConfirmOpen(false)
      navigate(PLACEMENT_TEST_SESSION_PATH)
    } catch (err) {
      if (!isPlanForbiddenError(err)) toast.error(copy.confirm?.errorToast)
    }
  }, [createSession, navigate, result, retakeStatus, user, copy.confirm])

  if (isPlanLoading || isPermissionLoading) {
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

  // Phiên không có câu trả lời thật nào: máy chủ đã đặt cờ, không được dựng
  // chứng chỉ HSK 1 và bốn thanh kỹ năng (trong đó phát âm là "Chưa đo được").
  if (isInsufficientEvidence(result)) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07)]">
          <h1 className="text-xl font-bold leading-7 text-[#09090B]">
            {resultCopy.insufficientTitle}
          </h1>
          <p className="text-sm font-medium leading-[22px] text-slate-600">
            {resultCopy.insufficientBody}
          </p>
          <button
            type="button"
            onClick={() => navigate(PLACEMENT_TEST_PATH)}
            className="mt-1 h-11 rounded-xl bg-cath-red-700 px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(153,0,17,0.2)] transition hover:brightness-90"
          >
            {resultCopy.insufficientRetakeCta}
          </button>
        </div>
      </div>
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
              code={view.code}
              adjustmentNote={view.adjustmentNote}
            />
            <ProfileRoadmapCard
              copy={copy}
              band={descriptor.band}
              progress={roadmap}
              onContinue={() => handleContinueRoadmapDay(roadmap.completed + 1)}
            />
            {view.skills.length > 0 && (
              <ProfileSkillsCard copy={copy} items={view.skills} />
            )}
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
