import { describe, expect, test } from "vitest"

import {
  ANNOTATION_TEXT_MAX_LENGTH,
  normalizeAnnotationText,
  resolveAnnotationTextKey,
  shouldCommitAnnotationText,
} from "./annotationText.js"

describe("annotation text editor helpers", () => {
  test("Enter commits, Shift+Enter keeps typing and Escape cancels", () => {
    expect(resolveAnnotationTextKey({ key: "Enter" })).toBe("commit")
    expect(resolveAnnotationTextKey({ key: "Enter", shiftKey: true })).toBeNull()
    expect(resolveAnnotationTextKey({ key: "Escape" })).toBe("cancel")
    expect(resolveAnnotationTextKey({ key: "a" })).toBeNull()
    expect(resolveAnnotationTextKey(null)).toBeNull()
  })

  test("IME composition Enter never commits the note", () => {
    expect(resolveAnnotationTextKey({ key: "Enter", isComposing: true }))
      .toBeNull()
    expect(
      resolveAnnotationTextKey({
        key: "Enter",
        nativeEvent: { isComposing: true },
      }),
    ).toBeNull()
  })

  test("normalizes CRLF, trims and bounds the text note", () => {
    expect(normalizeAnnotationText("  line 1\r\nline 2  ")).toBe(
      "line 1\nline 2",
    )
    expect(normalizeAnnotationText("x".repeat(ANNOTATION_TEXT_MAX_LENGTH + 20)))
      .toHaveLength(ANNOTATION_TEXT_MAX_LENGTH)
    expect(normalizeAnnotationText(null)).toBe("")
  })

  test("only non-empty notes commit", () => {
    expect(shouldCommitAnnotationText("hello")).toBe(true)
    expect(shouldCommitAnnotationText("  \n  ")).toBe(false)
    expect(shouldCommitAnnotationText("")).toBe(false)
  })
})
