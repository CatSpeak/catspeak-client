/**
 * Feature flag bật/tắt theo biến môi trường lúc build (REL-01).
 *
 *   VITE_FF_VOCAB_PRACTICE=1   trang Luyện tập từ vựng (4 chế độ ôn)
 *   VITE_FF_PRACTICE_FSRS=1    gửi nhãn chấm FSRS lên server (cần API BE-02)
 *   VITE_FF_VOCAB_GALAXY=1     Ngân hà từ vựng + mini Galaxy
 *   VITE_FF_GALAXY_API=1       đọc Galaxy từ API gọn BE-05 thay vì gom từ các deck
 *
 * Không đặt biến: bật ở môi trường dev, tắt ở bản build. Rollback = đặt biến về 0 rồi build lại.
 */
const flag = (value, fallback) => {
  if (value === undefined || value === "") return fallback
  return value === "1" || value === "true"
}

const DEV = Boolean(import.meta.env.DEV)
const env = import.meta.env

export const FEATURES = Object.freeze({
  vocabPractice: flag(env.VITE_FF_VOCAB_PRACTICE, DEV),
  practiceFsrs: flag(env.VITE_FF_PRACTICE_FSRS, false),
  vocabGalaxy: flag(env.VITE_FF_VOCAB_GALAXY, DEV),
  galaxyApi: flag(env.VITE_FF_GALAXY_API, false),
})

export const isFeatureEnabled = (name) => Boolean(FEATURES[name])
