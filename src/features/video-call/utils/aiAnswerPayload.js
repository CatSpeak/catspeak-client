const JSON_ESCAPES = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
}

const decodeJsonFragment = (fragment) => {
  try {
    return JSON.parse(`"${fragment}"`)
  } catch {
    return fragment
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\(.)/g, (_, char) => JSON_ESCAPES[char] ?? char)
  }
}

/**
 * Unwrap an AI answer that still carries raw JSON
 * (`{"answer": "...", "follow_up_questions": [...]}`), as sent by older
 * backends or LiveKit data packets. Truncated JSON is salvaged best-effort so
 * the bubble never renders `{"answer":` to the user.
 *
 * @param {unknown} rawAnswer
 * @param {Array} [existingFollowUps]
 * @returns {{ answer: unknown, followUps: Array }}
 */
export const unwrapAiAnswerPayload = (rawAnswer, existingFollowUps = []) => {
  const followUps = Array.isArray(existingFollowUps) ? existingFollowUps : []

  if (typeof rawAnswer !== "string") {
    return { answer: rawAnswer ?? "", followUps }
  }

  const trimmed = rawAnswer.trim()
  if (!trimmed.startsWith("{")) {
    return { answer: rawAnswer, followUps }
  }

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed.answer === "string") {
      const nestedFollowUps = Array.isArray(parsed.follow_up_questions)
        ? parsed.follow_up_questions
        : followUps
      return unwrapAiAnswerPayload(parsed.answer, nestedFollowUps)
    }
  } catch {
    const match = trimmed.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)/)
    if (match) {
      const answer = decodeJsonFragment(match[1]).trim()
      if (answer) return { answer, followUps }
    }
  }

  return { answer: rawAnswer, followUps }
}

export default unwrapAiAnswerPayload
