import { useCallback, useMemo, useState } from "react"
import { GALAXY_CLUSTERS, MOCK_GALAXY_WORDS } from "../mocks/mockGalaxyData"
import { GALAXY_STATE } from "../core/galaxyState"

// Chế độ mock: dùng dữ liệu giả lập khi ai-api staging còn chết (Cloudflare 1033).
// Bật bằng ?mock=1 trên URL, hoặc bằng biến môi trường VITE_GALAXY_FORCE_MOCK=1.
//
// Mục tiêu: demo được "học 1 từ → sao sáng" mà không cần API thật.
// Dữ liệu vẫn giữ đúng schema của API thật ({ id, word, pinyin, meaning, clusterId, aState })
// để khi thay bằng API, không phải sửa gì ở tầng render.

const STORAGE_KEY = "catspeak.galaxy.mock.states"

/** Đọc trạng thái học đã lưu từ lần trước (để demo xuyên suốt các lần reload). */
function loadStoredStates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function saveStoredStates(states) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  } catch {
    // localStorage bị chặn (private mode / quota) -> bỏ qua, không sao lỗi render.
  }
}

/**
 * Hook cung cấp dữ liệu Galaxy từ mock.
 *
 * @param {{ enabled?: boolean }} options
 * @returns {{ words: Array, clusters: Array, status: string, error: any, retry: () => void,
 *            markStudied: (wordId: string) => void, isMock: boolean }}
 */
export function useGalaxyWordsMock({ enabled = true } = {}) {
  // Map id -> aState, khởi tạo từ localStorage để trạng thái "đã học" còn nguyên sau reload.
  const [studied, setStudied] = useState(() => loadStoredStates())

  const words = useMemo(
    () => MOCK_GALAXY_WORDS.map((w) => ({ ...w, aState: studied[w.id] ?? w.aState })),
    [studied],
  )

  const clusters = GALAXY_CLUSTERS

  const markStudied = useCallback((wordId) => {
    setStudied((prev) => {
      const current = prev[wordId] ?? MOCK_GALAXY_WORDS.find((w) => w.id === wordId)?.aState ?? 0
      // Bấm lần 2 -> nâng lên mức cao hơn một bậc, tối đa 3 (giống FSRS tiến bộ dần).
      const next = Math.min(GALAXY_STATE.LONG_TERM, current + 1)
      const updated = { ...prev, [wordId]: next }
      saveStoredStates(updated)
      return updated
    })
  }, [])

  return {
    words,
    clusters,
    status: enabled ? "ready" : "loading",
    error: null,
    retry: () => {},
    markStudied,
    isMock: true,
  }
}
