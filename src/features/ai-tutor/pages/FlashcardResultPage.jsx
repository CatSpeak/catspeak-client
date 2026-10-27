import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { ReviewResult } from "../components/flashcard"
import { flashcardReviewPath } from "../utils/flashcardReview"

/**
 * /:lang/ai-tutor/vocabulary-notebook/review/:sessionId/result
 *
 * fc03. Mở lại link (tải lại trang) vẫn xem được: /finish idempotent.
 */
const FlashcardResultPage = () => {
  const { lang = "vi", sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  return (
    <ReviewResult
      sessionId={sessionId}
      localResults={state?.localResults || []}
      totalCards={state?.totalCards || 0}
      onContinue={() => navigate(flashcardReviewPath(lang, { mode: "due" }), { replace: true })}
      onHome={() => navigate(`/${lang}/ai-tutor/vocabulary-notebook`)}
    />
  )
}

export default FlashcardResultPage
