import { describe, expect, test } from "vitest"

import {
  applyRoomSettingsChanged,
  canSeeAnnotationPolicyRow,
  resolveAllowAnnotation,
} from "./annotationPolicy.js"

describe("annotation policy from room state", () => {
  test("defaults to open when the snapshot has no value", () => {
    expect(resolveAllowAnnotation(null)).toBe(true)
    expect(resolveAllowAnnotation({ data: { settings: {} } })).toBe(true)
  })

  test("reads allowAnnotation from the ApiResponse envelope", () => {
    expect(
      resolveAllowAnnotation({
        success: true,
        data: { settings: { allowAnnotation: false } },
      }),
    ).toBe(false)
  })

  test("reads allowAnnotation from a raw state payload", () => {
    expect(resolveAllowAnnotation({ settings: { allowAnnotation: false } })).toBe(
      false,
    )
  })
})

describe("RoomSettingsChanged patch", () => {
  test("merges pushed settings into the cached envelope without mutation", () => {
    const state = {
      success: true,
      data: {
        roomId: 12,
        settings: { allowStudentShare: true, allowAnnotation: true },
      },
    }

    const next = applyRoomSettingsChanged(state, { allowAnnotation: false })

    expect(next.data.settings.allowAnnotation).toBe(false)
    expect(next.data.settings.allowStudentShare).toBe(true)
    expect(next.data.roomId).toBe(12)
    // The original cache entry is untouched.
    expect(state.data.settings.allowAnnotation).toBe(true)
    expect(resolveAllowAnnotation(next)).toBe(false)
  })

  test("patches a raw (non-enveloped) cache entry", () => {
    const next = applyRoomSettingsChanged(
      { settings: { allowAnnotation: true } },
      { allowAnnotation: false },
    )

    expect(next.settings.allowAnnotation).toBe(false)
  })

  test("ignores an empty or missing patch", () => {
    const state = { data: { settings: { allowAnnotation: true } } }
    expect(applyRoomSettingsChanged(state, null)).toBe(state)
    expect(applyRoomSettingsChanged(null, { allowAnnotation: false })).toBe(null)
  })
})

describe("annotation policy row visibility", () => {
  test("the host always sees the row", () => {
    expect(
      canSeeAnnotationPolicyRow({ isHost: true, accountId: 10 }),
    ).toBe(true)
  })

  test("a co-host holding manage_student_share sees the row", () => {
    expect(
      canSeeAnnotationPolicyRow({
        isHost: false,
        accountId: 20,
        coHost: {
          coHostAccountId: 20,
          permissions: ["manage_student_share"],
        },
      }),
    ).toBe(true)
  })

  test("a co-host without the permission and regular members do not", () => {
    expect(
      canSeeAnnotationPolicyRow({
        accountId: 20,
        coHost: {
          coHostAccountId: 20,
          permissions: ["mute_all"],
        },
      }),
    ).toBe(false)
    expect(
      canSeeAnnotationPolicyRow({
        accountId: 30,
        coHost: {
          coHostAccountId: 20,
          permissions: ["manage_student_share"],
        },
      }),
    ).toBe(false)
  })
})
