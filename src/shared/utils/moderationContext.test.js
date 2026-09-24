// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"
import {
  MODERATION_CONTEXT,
  POST_FIELD_CONTEXTS,
  contextForKey,
} from "./moderationContext.js"

test("một chuỗi áp cho mọi trường", () => {
  assert.equal(contextForKey("chat-1-1", "content"), "chat-1-1")
  assert.equal(contextForKey("story", "Title"), "story")
})

test("bài viết tách tiêu đề và nội dung", () => {
  assert.equal(contextForKey(POST_FIELD_CONTEXTS, "title"), "post-title")
  assert.equal(contextForKey(POST_FIELD_CONTEXTS, "Title"), "post-title")
  assert.equal(contextForKey(POST_FIELD_CONTEXTS, "content"), "post-content")
  assert.equal(contextForKey(POST_FIELD_CONTEXTS, "caption"), "post-content")
})

test("không có context thì không gửi", () => {
  assert.equal(contextForKey(undefined, "content"), undefined)
  assert.equal(contextForKey({ title: "post-title" }, "content"), undefined)
})

test("tên context khớp danh sách catspeak-api cho phép", () => {
  assert.deepEqual(
    Object.values(MODERATION_CONTEXT).sort(),
    ["chat-1-1", "meet-chat", "post-comment", "post-content", "post-title", "story"],
  )
})
