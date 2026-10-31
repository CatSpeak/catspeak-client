import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { toast } from "@/components/ui/toast"
import { useAdjustLevelMutation } from "../api"
import { useChangeLevelMutation } from "@/features/learning-path/api/learningPathApi"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_PROFILE_PATH,
  PLACEMENT_TEST_SCORING_PATH,
} from "../constants/routes"
import {
  buildAdjustOptions,
  getAllDimensionScores,
  computeOverallScore,
  getBandDescriptor,
  getRoadmapDays,
  getStrengthDimension,
  getTargetRoadmapBand,
  getWeaknessDimension,
  isInsufficientEvidence,
} from "../utils/result"
import { formatTemplate } from "../utils/format"
import {
  clearActiveSession,
  clearResult,
  readActiveSession,
  readResult,
} from "../utils/sessionStorage"
import ResultTopbar from "../components/result/ResultTopbar"
import ResultHeroCard from "../components/result/ResultHeroCard"
import ResultFeedbackCard from "../components/result/ResultFeedbackCard"
import ResultRoadmapCard from "../components/result/ResultRoadmapCard"
import ResultSkillsCard from "../components/result/ResultSkillsCard"
import AdjustLevelModal from "../components/result/AdjustLevelModal"

const PlacementResultPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.result || {}
  const tierLabels = t.placementTest?.tiers || {}
  const successToast = t.placementTest?.adjust?.successToast
  const alreadyAdjustedToast = t.placementTest?.adjust?.alreadyAdjustedToast
  const errorToast = t.placementTest?.adjust?.errorToast
  const roadmapSyncErrorToast = t.placementTest?.adjust?.roadmapSyncErrorToast
  const navigate = useNavigate()
  const { user } = useAuth()

  const [result, setResult] = useState(readResult)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustChoice, setAdjustChoice] = useState("keep")
  const [adjustLevel, { isLoading: adjusting }] = useAdjustLevelMutation()
  const [changeLevel] = useChangeLevelMutation()

  useEffect(() => {
    if (result) return
    const session = readActiveSession()
    navigate(session ? PLACEMENT_TEST_SCORING_PATH : PLACEMENT_TEST_PATH, {
      replace: true,
    })
  }, [result, navigate])

  const view = useMemo(() => {
    if (!result) return null
    const descriptor = getBandDescriptor(result.band)
    const hasWeakness = Array.isArray(result.weaknesses) && result.weaknesses.length > 0
    const roadmapBand = getTargetRoadmapBand(result.band)

    return {
      descriptor,
      overall: computeOverallScore(result),
      strength: getStrengthDimension(result),
      weakness: hasWeakness ? getWeaknessDimension(result) : null,
      roadmapBand,
      options: buildAdjustOptions(result.band),
      skills: getAllDimensionScores(result).map((item) => ({
        ...item,
        label: copy.dimensions?.[item.key] || item.key,
        scoreText: item.measured
          ? formatTemplate(copy.scoreOf, { score: item.score })
          : copy.notMeasured || "Chưa đo được",
      })),
    }
  }, [result, copy.scoreOf, copy.dimensions, copy.notMeasured])

  const studentName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.nickname ||
    copy.studentFallback

  const handleShare = useCallback(() => {
    if (copy.shareNotice) toast.info(copy.shareNotice)
  }, [copy.shareNotice])

  const handleRetake = useCallback(() => {
    clearResult()
    clearActiveSession()
    navigate(PLACEMENT_TEST_PATH)
  }, [navigate])

  const handleStart = useCallback(() => {
    navigate(PLACEMENT_TEST_PROFILE_PATH)
  }, [navigate])

  const handleOpenAdjust = useCallback(() => {
    setAdjustChoice("keep")
    setAdjustOpen(true)
  }, [])

  const handleCloseAdjust = useCallback(() => {
    if (!adjusting) setAdjustOpen(false)
  }, [adjusting])

  const handleConfirmAdjust = useCallback(
    async (level) => {
      if (!result?.sessionId) return
      try {
        const response = await adjustLevel({
          sessionId: result.sessionId,
          level,
        }).unwrap()
        setResult(response.result)
        setAdjustOpen(false)
        toast.success(formatTemplate(successToast, { band: response.band }))

        // The modal promises a fresh 5-day roadmap for the adjusted level;
        // the placement service only owns the placement profile.
        try {
          await changeLevel({ newLevel: `HSK${response.band}` }).unwrap()
        } catch {
          toast.error(roadmapSyncErrorToast)
        }
      } catch (error) {
        if (error?.status === 409) {
          setResult((current) =>
            current ? { ...current, selfAdjusted: true } : current,
          )
          setAdjustOpen(false)
          toast.info(alreadyAdjustedToast)
          return
        }
        toast.error(errorToast)
      }
    },
    [
      result,
      adjustLevel,
      changeLevel,
      successToast,
      alreadyAdjustedToast,
      errorToast,
      roadmapSyncErrorToast,
    ],
  )

  if (!result || !view) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 rounded-2xl bg-white p-8 text-center shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07)]">
          <h1 className="text-xl font-bold leading-7 text-[#09090B]">
            {copy.emptyTitle}
          </h1>
          <p className="text-sm font-medium leading-[22px] text-slate-600">
            {copy.emptyBody}
          </p>
        </div>
      </div>
    )
  }

  if (isInsufficientEvidence(result)) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07)]">
          <h1 className="text-xl font-bold leading-7 text-[#09090B]">
            {copy.insufficientTitle}
          </h1>
          <p className="text-sm font-medium leading-[22px] text-slate-600">
            {copy.insufficientBody}
          </p>
          <button
            type="button"
            onClick={handleRetake}
            className="mt-1 h-11 rounded-xl bg-cath-red-700 px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(153,0,17,0.2)] transition hover:brightness-90"
          >
            {copy.insufficientRetakeCta}
          </button>
        </div>
      </div>
    )
  }

  const { descriptor } = view
  const tierLabel = tierLabels[descriptor.tierKey] || descriptor.tierKey

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
        <ResultTopbar
          copy={copy}
          subtitle={formatTemplate(copy.topbarSub, {
            name: studentName,
            code: result.code,
          })}
          onShare={handleShare}
        />

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-2.5 lg:w-[49%]">
            <ResultHeroCard
              copy={copy}
              band={descriptor.band}
              tierLabel={tierLabel}
              cefr={descriptor.cefr}
              score={view.overall}
              description={[
                formatTemplate(copy.heroDescription, { band: descriptor.band }),
                result.vocabulary >= 60 ? copy.heroVocabularyPraise : null,
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <ResultFeedbackCard
              copy={copy}
              strength={view.strength}
              weakness={view.weakness}
            />
            <ResultRoadmapCard
              copy={copy}
              band={view.roadmapBand}
              days={getRoadmapDays(copy, view.roadmapBand)}
            />
          </div>

          <div className="flex w-full flex-col gap-2.5 lg:w-[51%]">
            <ResultSkillsCard
              copy={copy}
              items={view.skills}
              band={descriptor.band}
              onStart={handleStart}
              onAdjust={handleOpenAdjust}
              adjustLocked={Boolean(result.selfAdjusted)}
            />
          </div>
        </div>

        <AdjustLevelModal
          open={adjustOpen}
          onClose={handleCloseAdjust}
          copy={t.placementTest?.adjust || {}}
          band={descriptor.band}
          aiTierLabel={tierLabel}
          options={view.options}
          selected={adjustChoice}
          onSelect={setAdjustChoice}
          confirming={adjusting}
          onConfirm={handleConfirmAdjust}
        />
      </div>
    </div>
  )
}

export default PlacementResultPage
