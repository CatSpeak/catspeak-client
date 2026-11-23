// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getUserPref,
  parsePrefValue,
  setUserPref,
  userPrefKey,
} from "./userPreferences.js"

const createStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _dump: () => Object.fromEntries(map),
  }
}

test("userPrefKey scopes by account id", () => {
  assert.equal(userPrefKey(42, "receiveSystemMsgs"), "catspeak_pref_42_receiveSystemMsgs")
  assert.equal(userPrefKey(null, "join_leave_sound"), "catspeak_pref_anon_join_leave_sound")
})

test("getUserPref reads the account-scoped value", () => {
  const storage = createStorage({ "catspeak_pref_7_showAiSuggestions": "false" })
  assert.equal(
    getUserPref(7, "showAiSuggestions", { defaultValue: true, storage }),
    false,
  )
})

test("getUserPref returns default when nothing is stored", () => {
  const storage = createStorage()
  assert.equal(getUserPref(7, "join_leave_sound", { defaultValue: false, storage }), false)
  assert.equal(getUserPref(7, "receiveSystemMsgs", { defaultValue: true, storage }), true)
})

test("getUserPref migrates the legacy global key once and removes it", () => {
  const storage = createStorage({ receiveSystemMsgs: "false" })

  const value = getUserPref(9, "receiveSystemMsgs", {
    defaultValue: true,
    legacyKey: "receiveSystemMsgs",
    storage,
  })

  assert.equal(value, false)
  assert.equal(storage.getItem("catspeak_pref_9_receiveSystemMsgs"), "false")
  assert.equal(storage.getItem("receiveSystemMsgs"), null)

  // Second read is served by the scoped key, not the (now gone) legacy one.
  assert.equal(
    getUserPref(9, "receiveSystemMsgs", {
      defaultValue: true,
      legacyKey: "receiveSystemMsgs",
      storage,
    }),
    false,
  )
})

test("getUserPref prefers the scoped key over the legacy key", () => {
  const storage = createStorage({
    receiveSystemMsgs: "false",
    "catspeak_pref_9_receiveSystemMsgs": "true",
  })

  assert.equal(
    getUserPref(9, "receiveSystemMsgs", {
      defaultValue: true,
      legacyKey: "receiveSystemMsgs",
      storage,
    }),
    true,
  )
})

test("getUserPref does not migrate without an account id", () => {
  const storage = createStorage({ receiveSystemMsgs: "false" })

  const value = getUserPref(null, "receiveSystemMsgs", {
    defaultValue: true,
    legacyKey: "receiveSystemMsgs",
    storage,
  })

  assert.equal(value, true)
  assert.equal(storage.getItem("catspeak_pref_anon_receiveSystemMsgs"), null)
})

test("setUserPref writes scoped boolean strings", () => {
  const storage = createStorage()
  setUserPref(11, "join_leave_sound", true, { storage })
  setUserPref(11, "showAiSuggestions", false, { storage })

  assert.equal(storage.getItem("catspeak_pref_11_join_leave_sound"), "true")
  assert.equal(storage.getItem("catspeak_pref_11_showAiSuggestions"), "false")
})

test("setUserPref ignores missing account or storage", () => {
  const storage = createStorage()
  setUserPref(null, "join_leave_sound", true, { storage })
  setUserPref(11, "join_leave_sound", true, { storage: null })
  assert.deepEqual(storage._dump(), {})
})

test("parsePrefValue only treats literal false as off", () => {
  assert.equal(parsePrefValue("false"), false)
  assert.equal(parsePrefValue("true"), true)
  assert.equal(parsePrefValue("0"), true)
  assert.equal(parsePrefValue(null), false)
})
