// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getParticipantIdentifier,
  getVolumeStorageKey,
  getSavedParticipantVolume,
  saveParticipantVolume,
  applySavedParticipantVolume,
} from "./participantVolumePreferences.js"

const createStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _dump: () => Object.fromEntries(map),
  }
}

test("getParticipantIdentifier handles string and object metadata", () => {
  const p1 = {
    identity: "ident-1",
    metadata: JSON.stringify({ accountId: 101 }),
  }
  assert.deepEqual(getParticipantIdentifier(p1), {
    accountId: "101",
    identity: "ident-1",
  })

  const p2 = {
    identity: "ident-2",
    metadata: { accountId: "202" },
  }
  assert.deepEqual(getParticipantIdentifier(p2), {
    accountId: "202",
    identity: "ident-2",
  })

  const p3 = {
    identity: "ident-3",
  }
  assert.deepEqual(getParticipantIdentifier(p3), {
    accountId: null,
    identity: "ident-3",
  })
})

test("getVolumeStorageKey scopes by user account id", () => {
  assert.equal(getVolumeStorageKey(42), "catspeak_participant_volumes_42")
  assert.equal(getVolumeStorageKey(null), "catspeak_participant_volumes_global")
  assert.equal(getVolumeStorageKey(""), "catspeak_participant_volumes_global")
})

test("saveParticipantVolume persists clamped volume for both accountId and identity", () => {
  const storage = createStorage()
  const participant = {
    identity: "user-alpha",
    metadata: JSON.stringify({ accountId: 77 }),
  }

  saveParticipantVolume(participant, 0.45, 12, { storage })

  const raw = storage.getItem("catspeak_participant_volumes_12")
  assert.ok(raw)
  const map = JSON.parse(raw)
  assert.equal(map["77"], 0.45)
  assert.equal(map["user-alpha"], 0.45)
})

test("saveParticipantVolume clamps between 0 and 1", () => {
  const storage = createStorage()
  const p1 = { identity: "p-high" }
  saveParticipantVolume(p1, 1.5, null, { storage })
  assert.equal(getSavedParticipantVolume(p1, null, { storage }), 1)

  const p2 = { identity: "p-low" }
  saveParticipantVolume(p2, -0.5, null, { storage })
  assert.equal(getSavedParticipantVolume(p2, null, { storage }), 0)
})

test("getSavedParticipantVolume retrieves volume by accountId or identity", () => {
  const storage = createStorage({
    catspeak_participant_volumes_12: JSON.stringify({
      "88": 0.3,
      "only-identity": 0.75,
    }),
  })

  // Match by accountId
  const p1 = {
    identity: "new-session-identity",
    metadata: JSON.stringify({ accountId: 88 }),
  }
  assert.equal(getSavedParticipantVolume(p1, 12, { storage }), 0.3)

  // Match by identity
  const p2 = {
    identity: "only-identity",
  }
  assert.equal(getSavedParticipantVolume(p2, 12, { storage }), 0.75)

  // Unknown participant
  const p3 = {
    identity: "unknown",
  }
  assert.equal(getSavedParticipantVolume(p3, 12, { storage }), null)
})

test("applySavedParticipantVolume invokes participant.setVolume if saved", () => {
  const storage = createStorage({
    catspeak_participant_volumes_12: JSON.stringify({ "99": 0.6 }),
  })

  let setVolumeCalledWith = null
  const participant = {
    identity: "p99",
    metadata: JSON.stringify({ accountId: 99 }),
    setVolume: (val) => {
      setVolumeCalledWith = val
    },
  }

  const result = applySavedParticipantVolume(participant, 12, { storage })
  assert.equal(result, 0.6)
  assert.equal(setVolumeCalledWith, 0.6)
})

test("applySavedParticipantVolume ignores local participant", () => {
  const storage = createStorage({
    catspeak_participant_volumes_global: JSON.stringify({ me: 0.5 }),
  })
  const localParticipant = {
    isLocal: true,
    identity: "me",
    setVolume: () => {
      assert.fail("Should not be called for local participant")
    },
  }

  const result = applySavedParticipantVolume(localParticipant, null, { storage })
  assert.equal(result, null)
})
