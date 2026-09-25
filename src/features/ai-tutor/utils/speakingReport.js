/**
 * Dịch dữ liệu của ai-api sang props của các màn TASK-161 (ss10-ss13).
 *
 * Tách ra hàm thuần để test được mà không dựng React. Ba luật phải giữ, cùng luật
 * với màn kết quả bài thi đầu vào:
 *
 *   - scores.pronunciation = null là CHƯA ĐO: ẩn hẳn thanh "Phát âm & Thanh điệu",
 *     không vẽ thanh 0/100.
 *   - Cấp HSK trên ss11 là cấp của BUỔI NÓI (học viên chọn hoặc lấy từ bài thi đầu
 *     vào), không phải một lần xếp cấp mới. Không ghi "Đánh giá trình độ".
 *   - Không có câu nào của học viên (im lặng từ đầu, rớt mạng sớm) thì không hiện
 *     điểm 0 như một lời chê: isEmptySession để màn hiện lời động viên.
 */

export const formatDuration = (ms) => {
  if (ms == null || Number.isNaN(Number(ms))) return "--:--"
  const total = Math.max(0, Math.round(Number(ms) / 1000))
  const m = String(Math.floor(total / 60)).padStart(2, "0")
  const s = String(total % 60).padStart(2, "0")
  return `${m}:${s}`
}

export const formatDate = (iso) => {
  const d = iso ? new Date(iso) : new Date()
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const avg = (...xs) => {
  const vals = xs.filter((x) => typeof x === "number")
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
}

export const buildMetrics = (scores = {}) => {
  const metrics = [
    { key: "fluency", label: "Độ trôi chảy (Fluency)", score: scores.fluency, color: "bg-emerald-500" },
  ]
  if (scores.pronunciation != null) {
    metrics.push({
      key: "pronunciation",
      label: "Phát âm & Thanh điệu",
      score: scores.pronunciation,
      color: "bg-amber-500",
    })
  }
  metrics.push({
    key: "grammar_vocab",
    label: "Ngữ pháp & Vốn từ",
    score: avg(scores.grammar, scores.vocabulary),
    color: "bg-blue-500",
  })
  metrics.push({
    key: "task",
    label: "Hoàn thành chủ đề",
    score: scores.task_completion,
    color: "bg-rose-400",
  })
  return metrics.filter((m) => typeof m.score === "number")
}

export const improvementLines = (errors = []) => {
  if (!errors.length) {
    return ["Không có lỗi nào làm người nghe hiểu nhầm trong buổi này. Tiếp tục giữ phong độ nhé!"]
  }
  return errors.map((e) => `“${e.original}” ➔ “${e.corrected}”. ${e.note_vi || ""}`.trim())
}

export const vocabChips = (vocab = []) =>
  vocab.map((v) => ({
    hanzi: v.word,
    pinyin: v.pinyin || "",
    meaning: v.meaning_vi || v.meaning_en || "",
    isNew: v.new_card !== false,
  }))

export const levelLabel = (hskLevel) =>
  hskLevel ? `Buổi nói cấp HSK ${hskLevel}` : "Buổi luyện nói"

/** Props cho ResultPage (ss11). */
export const toResultPageProps = (report, { topicTitle } = {}) => {
  const isEmptySession = report?.learner_turn_count === 0
  return {
    topicTitle: topicTitle || report?.topic_id || "Luyện nói với AI",
    duration: formatDuration(report?.duration_ms),
    date: formatDate(report?.updated_at),
    overallScore: report?.overall_score ?? 0,
    cefrLevel: levelLabel(report?.hsk_level),
    metrics: buildMetrics(report?.scores),
    strengths: report?.strengths || [],
    improvements: isEmptySession ? [] : improvementLines(report?.errors),
    savedVocabs: vocabChips(report?.vocab),
    isPartial: report?.status === "partial",
    isEmptySession,
    pronunciationReady: Boolean(report?.pronunciation_detail_ready),
  }
}

/**
 * ss10: thanh tiến trình trong lúc chờ. Mục tiêu 3 giây, cắt cứng 5 giây (E-SS-007),
 * nên đi nhanh tới 90% trong 3 giây đầu rồi bò chậm; có báo cáo thì nhảy 100.
 */
export const waitProgress = (elapsedMs, hasReport) => {
  if (hasReport) return 100
  const t = Math.max(0, elapsedMs)
  if (t <= 3000) return Math.round((t / 3000) * 90)
  return Math.min(99, 90 + Math.round(((t - 3000) / 2000) * 9))
}

export const WAIT_CUTOFF_MS = 5000

/** Props cho DeepPronunciationAnalysisModal (ss12) từ một phần tử của words. */
export const toAnalysisData = (word, retryResult = null) => {
  if (!word) return null
  const syllables = (word.syllables || []).map((s) => ({
    index: s.index,
    syllable: s.pinyin,
    toneName: s.tone_name,
    status: s.status,
    score: s.accuracy,
    isCorrect: s.is_correct,
    note: s.note || undefined,
  }))
  return {
    hanzi: word.word,
    pinyin: word.pinyin,
    meaning: word.meaning_vi || word.meaning_en || "",
    accuracyScore: word.accuracy,
    accuracyStatus: word.accuracy_status,
    syllables,
    pitchComparison: {
      userPitch: word.pitch?.user_curve || "…",
      userNote: word.pitch?.user_note || "",
      aiPitch: word.pitch?.model_curve || "",
      aiNote: word.pitch?.model_note || "",
    },
    lastRetestScore: retryResult?.score ?? null,
    lastRetestResult: retryResult?.result_label ?? "",
    lastRetestDelta: retryResult?.delta ?? null,
  }
}

/** Props cho MouthShapeGuideModal (ss13). */
export const toGuideData = (guide) => {
  if (!guide) return null
  return {
    toneTitle: guide.title,
    videoTitle: guide.video?.title || "",
    videoDuration: guide.video?.duration || "",
    steps: guide.steps || [],
    aiTip: guide.ai_tip || "",
    youtubeId: guide.video?.youtube_id || null,
    startS: guide.video?.start_s || 0,
  }
}
