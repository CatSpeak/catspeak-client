import { MAX_ASR_RETRIES } from "./constants"

export const canRetry = (retryCount, max = MAX_ASR_RETRIES) =>
  (Number(retryCount) || 0) < max

export const nextRetryCount = (retryCount, max = MAX_ASR_RETRIES) =>
  Math.min(max, (Number(retryCount) || 0) + 1)
