import React from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { Crown } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PageTitle from "@/shared/components/ui/PageTitle"
import EmptyState from "./EmptyState"

const PlanRequiredState = ({
  pageTitle,
  title = "Pro Plan Required",
  subtext,
  featureName = "Pro Features",
  highlightPlan = "pro",
  animationKey = "plan-required-page",
}) => {
  const navigate = useNavigate()

  const handleUpgradeNavigation = () => {
    navigate("/pricing", {
      state: { highlightPlan, featureName },
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <PageTitle>{pageTitle}</PageTitle>
          </div>
        )}

        <EmptyState
          icon={Crown}
          iconClassName="w-12 h-12 mb-4 text-amber-500"
          title={title}
          subtext={subtext}
          action={
            <PillButton
              onClick={handleUpgradeNavigation}
              startIcon={<Crown size={18} />}
            >
              Upgrade to Pro
            </PillButton>
          }
          fullPage
        />
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default PlanRequiredState
