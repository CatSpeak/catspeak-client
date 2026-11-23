import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { flashcardApi, useGetFlashcardDecksQuery } from "@/features/ai-tutor/api/flashcardApi"
import { FEATURES } from "@/shared/config/featureFlags"
import { useGetGalaxyQuery } from "../api/galaxyApi"
import { toGalaxyState } from "../core/galaxyState"

// Bảng màu cho cụm (xoay vòng nếu nhiều deck hơn số màu).
const PALETTE = [
  "#f2c46d", "#7fc4ff", "#9be38f", "#ff9fa8", "#c6a7ff", "#8fd0c8", "#ffb38a", "#b5e48c",
  "#9fb8ff", "#ff8fc3", "#ffd36b", "#e0b0ff", "#ef8f6b", "#86e0b5", "#a8d8ff", "#d8c3a5",
]
const PAGE_SIZE = 100
const MAX_WORDS = 3000
const EXCLUDED_DECKS = new Set(["all", "recent-wrong"])

/**
 * Lấy từ vựng thật của người dùng từ API flashcard (catspeak-ai) cho Ngân hà.
 *  - Mỗi deck chủ đề là một cụm; nếu chưa có deck chủ đề thì dùng các deck HSK.
 *  - Một thẻ thuộc nhiều deck chỉ xuất hiện một lần (deck chủ đề được ưu tiên).
 *  - Đọc theo trang (cursor) để không phụ thuộc giới hạn limit của server.
 *
 * @returns {{ words: Array, clusters: Array, status: "loading"|"ready"|"empty"|"error", error: any, retry: () => void }}
 */
export function useGalaxyWords({ enabled = true } = {}) {
  const compact = useCompactGalaxy({ enabled: enabled && FEATURES.galaxyApi })
  const crawled = useDeckGalaxy({ enabled: enabled && !FEATURES.galaxyApi })
  return FEATURES.galaxyApi ? compact : crawled
}

/** Có BE-05: một payload gọn cho cả Ngân hà (có ETag). */
function useCompactGalaxy({ enabled }) {
  const q = useGetGalaxyQuery(undefined, { skip: !enabled })
  return useMemo(() => {
    const retry = () => q.refetch()
    if (q.isError) return { words: [], clusters: [], status: "error", error: q.error, retry }
    if (!q.data) return { words: [], clusters: [], status: "loading", error: null, retry }
    const clusters = (q.data.clusters ?? []).map((c, i) => ({
      id: String(c.id),
      label: c.label ?? c.name ?? String(c.id),
      color: c.color || PALETTE[i % PALETTE.length],
    }))
    const words = (q.data.words ?? []).slice(0, MAX_WORDS).map((w) => ({
      id: String(w.id),
      word: w.word,
      pinyin: w.pinyin || "",
      meaning: w.meaning ?? w.meaning_vi ?? "",
      clusterId: String(w.cluster_id ?? w.clusterId),
      aState: toGalaxyState(w),
    }))
    return { words, clusters, status: words.length ? "ready" : "empty", error: null, retry }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- q.refetch ổn định theo query
  }, [q.data, q.isError, q.error])
}

/** Chưa có BE-05: gom từ các deck của sổ từ vựng. */
function useDeckGalaxy({ enabled }) {
  const dispatch = useDispatch()
  const decksQuery = useGetFlashcardDecksQuery(undefined, { skip: !enabled })
  const [state, setState] = useState({ words: [], clusters: [], status: "loading", error: null })
  const [attempt, setAttempt] = useState(0)

  // Chỉ phụ thuộc vào tập deck (id + số thẻ) để không tải lại khi object đổi tham chiếu.
  const deckKey = useMemo(
    () => (decksQuery.data ?? []).map((d) => `${d.id}:${d.total_cards}:${d.category}`).join("|"),
    [decksQuery.data],
  )

  useEffect(() => {
    if (!enabled) return undefined
    if (decksQuery.isError) {
      setState({ words: [], clusters: [], status: "error", error: decksQuery.error })
      return undefined
    }
    if (!decksQuery.data) return undefined

    const usable = decksQuery.data.filter((d) => !EXCLUDED_DECKS.has(d.id) && d.total_cards > 0)
    const topics = usable.filter((d) => d.category === "topic")
    const decks = topics.length > 0 ? topics : usable
    if (decks.length === 0) {
      setState({ words: [], clusters: [], status: "empty", error: null })
      return undefined
    }

    let cancelled = false
    setState((s) => ({ ...s, status: "loading", error: null }))

    const loadDeck = async (deck) => {
      const items = []
      let cursor = null
      do {
        const sub = dispatch(
          flashcardApi.endpoints.getDeckCards.initiate({ deckId: deck.id, limit: PAGE_SIZE, cursor }),
        )
        try {
          const page = await sub.unwrap()
          items.push(...(page.items ?? []))
          cursor = page.next_cursor ?? null
        } finally {
          sub.unsubscribe()
        }
      } while (cursor && !cancelled && items.length < MAX_WORDS)
      return items
    }

    Promise.all(decks.map(loadDeck))
      .then((perDeck) => {
        if (cancelled) return
        const clusters = decks.map((d, i) => ({ id: d.id, label: d.name, color: PALETTE[i % PALETTE.length] }))
        const seen = new Set()
        const words = []
        perDeck.forEach((cards, i) => {
          cards.forEach((c) => {
            if (seen.has(c.card_id) || words.length >= MAX_WORDS) return
            seen.add(c.card_id)
            words.push({
              id: String(c.card_id),
              word: c.word,
              pinyin: c.pinyin || "",
              meaning: c.meaning_vi || "",
              clusterId: decks[i].id,
              isKnown: Boolean(c.is_known),
              isDue: Boolean(c.is_due),
              isLongTerm: Boolean(c.is_long_term),
              aState: toGalaxyState(c),
            })
          })
        })
        setState({
          words,
          clusters,
          status: words.length ? "ready" : "empty",
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) setState({ words: [], clusters: [], status: "error", error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deckKey đại diện cho decksQuery.data
  }, [enabled, deckKey, decksQuery.isError, attempt, dispatch])

  return {
    ...state,
    // decks chưa về thì vẫn coi là loading
    status: enabled && !decksQuery.data && !decksQuery.isError ? "loading" : state.status,
    retry: () => {
      decksQuery.refetch()
      setAttempt((n) => n + 1)
    },
  }
}
