// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  moderationNoticeSeverity,
  resolveBlockAllMicsNotice,
  resolveRestrictionNotice,
} from "./moderationNotice.js"

const free = { isChatRestricted: false, isVoiceRestricted: false }

test("a restriction change with no cached previous state is not announced", () => {
  assert.equal(
    resolveRestrictionNotice(undefined, {
      isChatRestricted: true,
      isVoiceRestricted: false,
    }),
    null,
  )
})

test("restricting chat is announced as a chat restriction notification", () => {
  assert.deepEqual(
    resolveRestrictionNotice(free, {
      isChatRestricted: true,
      isVoiceRestricted: false,
    }),
    { severity: "info", messageKey: "hostRestrictedChat" },
  )
})

test("restricting voice is announced as a voice restriction notification", () => {
  assert.deepEqual(
    resolveRestrictionNotice(free, {
      isChatRestricted: false,
      isVoiceRestricted: true,
    }),
    { severity: "info", messageKey: "hostRestrictedVoice" },
  )
})

test("lifting a chat restriction is announced as a chat notification", () => {
  assert.deepEqual(
    resolveRestrictionNotice(
      { isChatRestricted: true, isVoiceRestricted: false },
      free,
    ),
    { severity: "info", messageKey: "hostUnrestrictedChat" },
  )
})

test("lifting a voice restriction is announced as a voice notification", () => {
  assert.deepEqual(
    resolveRestrictionNotice(
      { isChatRestricted: false, isVoiceRestricted: true },
      free,
    ),
    { severity: "info", messageKey: "hostUnrestrictedVoice" },
  )
})

test("a snapshot whose flags did not change is not announced", () => {
  assert.equal(
    resolveRestrictionNotice(
      { isChatRestricted: true, isVoiceRestricted: true },
      { isChatRestricted: true, isVoiceRestricted: true },
    ),
    null,
  )
  assert.equal(resolveRestrictionNotice(free, free), null)
})

test("when both flags change at once the voice restriction wins", () => {
  assert.deepEqual(
    resolveRestrictionNotice(
      { isChatRestricted: true, isVoiceRestricted: false },
      { isChatRestricted: false, isVoiceRestricted: true },
    ),
    { severity: "info", messageKey: "hostRestrictedVoice" },
  )

  assert.deepEqual(
    resolveRestrictionNotice(
      { isChatRestricted: true, isVoiceRestricted: true },
      free,
    ),
    { severity: "info", messageKey: "hostUnrestrictedVoice" },
  )
})

test("Block All Mics notifies a member who was restricted by it", () => {
  assert.deepEqual(resolveBlockAllMicsNotice([7, 8], 8), {
    severity: "info",
    messageKey: "hostRestrictedVoiceAll",
  })
  assert.deepEqual(resolveBlockAllMicsNotice(["7"], "7"), {
    severity: "info",
    messageKey: "hostRestrictedVoiceAll",
  })
})

test("a member outside the Block All Mics list is not notified", () => {
  assert.equal(resolveBlockAllMicsNotice([7, 8], 9), null)
  assert.equal(resolveBlockAllMicsNotice([], 9), null)
})

test("Block All Mics ignores a missing list or a missing self id", () => {
  assert.equal(resolveBlockAllMicsNotice(null, 7), null)
  assert.equal(resolveBlockAllMicsNotice([7], null), null)
})

test("a host moderation notice is never an error", () => {
  const actions = [
    "MUTE_ALL",
    "CAMERA_OFF_ALL",
    "MUTE_PARTICIPANT",
    "LOWER_ALL_HANDS",
    "SELF_UNMUTE_POLICY",
    "SELF_CAMERA_POLICY",
    "STUDENT_SHARE_POLICY",
    "MEMBER_RECORDING_POLICY",
    "TOGGLE_MEMBER_RECORDING",
    "TOGGLE_MEMBER_PRIVATE_AI",
    "ROOM_LOCK_CHANGED",
    "HIGH_QUALITY_POLICY",
    "GAME_POLICY",
  ]

  for (const action of actions) {
    assert.equal(moderationNoticeSeverity(action), "info", action)
  }
})

test("being kicked or having the live ended stays error-level", () => {
  assert.equal(moderationNoticeSeverity("KICK_PARTICIPANT"), "error")
  assert.equal(moderationNoticeSeverity("ROOM_ENDED"), "error")
})

test("an unknown action is not escalated to an error", () => {
  assert.equal(moderationNoticeSeverity("SOMETHING_NEW"), "info")
  assert.equal(moderationNoticeSeverity(undefined), "info")
})
