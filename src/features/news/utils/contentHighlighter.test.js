import test from "node:test"
import assert from "node:assert/strict"

import {
  escapeRegex,
  highlightTextString,
} from "./contentHighlighter.js"

test("escapeRegex escapes special regex characters", () => {
  assert.equal(escapeRegex("hello.world*test?"), "hello\\.world\\*test\\?")
  assert.equal(escapeRegex("[tag](link)"), "\\[tag\\]\\(link\\)")
})

test("highlightTextString parses hashtags correctly", () => {
  const result = highlightTextString("Check out #catspeak and #AI now!")
  assert.ok(result.includes('data-hashtag="#catspeak"'))
  assert.ok(result.includes('data-hashtag="#AI"'))
  assert.ok(result.includes('class="hashtag-token'))
})

test("highlightTextString highlights search keyword with <mark>", () => {
  const result = highlightTextString("Learning english with CatSpeak", "english")
  assert.ok(result.includes('<mark class="bg-amber-200/90 dark:bg-amber-500/30 text-inherit rounded-xs px-0.5">english</mark>'))
})

test("highlightTextString highlights hashtag matching search keyword", () => {
  const result = highlightTextString("Check out #english and #vietnamese", "english")
  assert.ok(result.includes('<mark'))
  assert.ok(result.includes('data-hashtag="#english"'))
})

test("highlightTextString returns safe escaped HTML for special characters", () => {
  const result = highlightTextString("<script>alert('xss')</script>")
  assert.ok(result.includes("&lt;script&gt;"))
  assert.ok(!result.includes("<script>"))
})
