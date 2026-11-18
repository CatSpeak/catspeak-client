import { useEffect, useRef } from "react"
import { useTrackRecommendationMutation } from "@/store/api/social/recommendationsApi"

export const useRecommendationTracking = ({
  itemType,
  targetId,
  placement = "in_feed",
  languageCommunity = 0,
}) => {
  const [trackMutation] = useTrackRecommendationMutation()
  const elementRef = useRef(null)
  const hasTrackedImpression = useRef(false)

  // BR-DX-13: Ghi nhận impression khi card hiển thị trong viewport
  useEffect(() => {
    if (!elementRef.current || hasTrackedImpression.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpression.current) {
          hasTrackedImpression.current = true
          trackMutation({
            eventType: "Impression",
            itemType,
            targetId,
            placement,
            languageCommunity,
          }).unwrap().catch(() => {
            // Fail silently
          })
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [trackMutation, itemType, targetId, placement, languageCommunity])

  const trackCardClick = () => {
    trackMutation({
      eventType: "CardClick",
      itemType,
      targetId,
      placement,
      languageCommunity,
      actionName: "CardClick",
    }).unwrap().catch(() => {})
  }

  const trackActionClick = (actionName) => {
    trackMutation({
      eventType: "ActionClick",
      itemType,
      targetId,
      placement,
      languageCommunity,
      actionName,
    }).unwrap().catch(() => {})
  }

  return {
    elementRef,
    trackCardClick,
    trackActionClick,
  }
}

export default useRecommendationTracking
