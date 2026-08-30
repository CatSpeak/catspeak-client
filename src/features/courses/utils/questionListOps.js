/**
 * Pure reordering/duplication logic for the exam builder's question list.
 * Kept dependency-free so node:test can run it without @/ alias resolution
 * (same reason as catalogLayout.js).
 *
 * Every operation returns the SAME array reference when nothing changes, and
 * leaves untouched question objects referentially identical when something
 * does. <QuestionCard> is memoized on that identity, so preserving it is not
 * cosmetic — it is what keeps editing one question from re-rendering the rest.
 */

/**
 * Swap a question with its neighbour.
 * @param {Array<object>} questions
 * @param {number} index
 * @param {"up" | "down"} direction
 * @returns {Array<object>} A new array, or `questions` unchanged at the bounds.
 */
export const moveQuestion = (questions, index, direction) => {
  const targetIndex = direction === "up" ? index - 1 : index + 1
  if (index < 0 || index >= questions.length) return questions
  if (targetIndex < 0 || targetIndex >= questions.length) return questions

  const updated = [...questions]
  updated[index] = questions[targetIndex]
  updated[targetIndex] = questions[index]
  return updated
}

/**
 * Insert a copy of a question directly below the original.
 * @param {Array<object>} questions
 * @param {number} index
 * @param {string} newId Caller-supplied id, so this stays pure.
 * @returns {Array<object>} A new array, or `questions` unchanged if out of range.
 */
export const duplicateQuestion = (questions, index, newId) => {
  const source = questions[index]
  if (!source) return questions

  const copy = {
    ...source,
    id: newId,
    // Drop the server-side id: the copy is a new question, not an edit.
    questionId: undefined,
    options: source.options ? [...source.options] : undefined,
    correctAnswers: source.correctAnswers ? [...source.correctAnswers] : [],
  }

  const updated = [...questions]
  updated.splice(index + 1, 0, copy)
  return updated
}

/**
 * Lift a question out of the list and drop it at another position.
 * @param {Array<object>} questions
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array<object>} A new array, or `questions` unchanged for a no-op move.
 */
export const reorderQuestion = (questions, fromIndex, toIndex) => {
  if (fromIndex === null || fromIndex === toIndex) return questions
  if (fromIndex < 0 || fromIndex >= questions.length) return questions
  if (toIndex < 0 || toIndex >= questions.length) return questions

  const updated = [...questions]
  const [moved] = updated.splice(fromIndex, 1)
  updated.splice(toIndex, 0, moved)
  return updated
}
