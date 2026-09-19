import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { toast } from "@/components/ui/toast"
import { useAdjustLevelMutation } from "../api"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_PROFILE_PATH,
  PLACEMENT_TEST_SCORING_PATH,
} from "../constants/routes"
import {
  buildAdjustOptions,
  computeOverallScore,
  getBandDescriptor,
  getDimensionScores,
  getStrengthDimension,
  getTargetRoadmapBand,
  getWeaknessDimension,
} from "../utils/result"
import { formatTemplate } from "../utils/format"
import { readActiveSession, readResult } from "../utils/sessionStorage"
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
  const navigate = useNavigate()
  const { user } = useAuth()

  const [result, setResult] = useState(readResult)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustChoice, setAdjustChoice] = useState("keep")
  const [adjustLevel, { isLoading: adjusting }] = useAdjustLevelMutation()

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

    return {
      descriptor,
      overall: computeOverallScore(result),
      strength: getStrengthDimension(result),
      weakness: hasWeakness ? getWeaknessDimension(result) : null,
      roadmapBand: getTargetRoadmapBand(result.band),
      options: buildAdjustOptions(result.band),
      skills: getDimensionScores(result).map((item) => ({
        ...item,
        label: copy.dimensions?.[item.key] || item.key,
        scoreText: formatTemplate(copy.scoreOf, { score: item.score }),
      })),
    }
  }, [result, copy.scoreOf, copy.dimensions])

  const studentName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.nickname ||
    copy.studentFallback

  const handleShare = useCallback(() => {
    if (copy.shareNotice) toast.info(copy.shareNotice)
  }, [copy.shareNotice])

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
    [result, adjustLevel, successToast, alreadyAdjustedToast, errorToast],
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
              description={formatTemplate(copy.heroDescription, {
                band: descriptor.band,
              })}
            />
            <ResultFeedbackCard
              copy={copy}
              strength={view.strength}
              weakness={view.weakness}
            />
            <ResultRoadmapCard
              copy={copy}
              band={view.roadmapBand}
              days={copy.roadmapDays}
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
