import React from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { Crown } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PageTitle from "@/shared/components/ui/PageTitle"
import { useLanguage } from "@/shared/context/LanguageContext"
import EmptyState from "./EmptyState"

const PlanRequiredState = ({
  pageTitle,
  title,
  subtext,
  featureName,
  highlightPlan = "pro",
  animationKey = "plan-required-page",
}) => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const resolvedTitle =
    title || t?.recordings?.planRequiredTitle || "Pro Plan Required"
  const resolvedSubtext = subtext || t?.recordings?.planRequired
  const resolvedFeatureName = featureName || t?.recordings?.title || "Pro Features"
  const upgradeLabel =
    t?.billing?.pricing?.upgradeToPro || t?.recordings?.upgradeToPro || "Upgrade to Pro"

  const handleUpgradeNavigation = () => {
    navigate("/pricing", {
      state: { highlightPlan, featureName: resolvedFeatureName },
    })
  }

  return (
    <AnimatePresence mode="wait">
      <FluentAnimation
        animationKey={animationKey}
        direction="up"
        className="w-full"
      >
        {pageTitle && (
          <div className="p-4">
            <PageTitle>{pageTitle}</PageTitle>
          </div>
        )}

        <EmptyState
          icon={Crown}
          iconClassName="w-12 h-12 mb-4 text-amber-500"
          title={resolvedTitle}
          subtext={resolvedSubtext}
          action={
            <div className="mt-4">
              <PillButton onClick={handleUpgradeNavigation}>
                {upgradeLabel}
              </PillButton>
            </div>
          }
          fullPage
        />
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default PlanRequiredState
