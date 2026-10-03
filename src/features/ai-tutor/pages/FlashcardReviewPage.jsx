import React, { useMemo } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { ReviewSession } from "../components/flashcard"
import { flashcardResultPath, parseReviewParams, resolveTimezone } from "../utils/flashcardReview"

/**
 * /:lang/ai-tutor/vocabulary-notebook/review?mode=due|early|free&deck=&source=&session=
 *
 * fc02. Lối vào (phần của Thái) dựng link bằng flashcardReviewPath() trong
 * utils/flashcardReview.js:
 *   fc01 "Bắt đầu ôn"   mode=due
 *   fc05 "Ôn tập"       mode=free&deck=<deck_id>
 *   ss11 "Ôn ngay"      mode=early&source=<speaking session_id>
 *   fc06 thông báo      mode=due
 */
const FlashcardReviewPage = () => {
  const { lang = "vi" } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const params = useMemo(() => parseReviewParams(search), [search])
  const timezone = useMemo(() => resolveTimezone(user), [user])
  const notebook = `/${lang}/ai-tutor/vocabulary-notebook`

  return (
    <ReviewSession
      mode={params.mode}
      deckId={params.deckId}
      sourceSessionId={params.sourceSessionId}
      resumeSessionId={params.sessionId}
      timezone={timezone}
      onExit={() => navigate(notebook)}
      onFinished={(sessionId, state) => navigate(flashcardResultPath(lang, sessionId), { replace: true, state })}
    />
  )
}

export default FlashcardReviewPage
