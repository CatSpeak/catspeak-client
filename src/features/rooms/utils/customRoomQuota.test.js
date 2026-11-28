import { describe, expect, it } from "vitest"
import {
  buildCustomRoomQuota,
  formatWorkspaceRoomsSummary,
} from "./customRoomQuota"

describe("ISS-14: custom room quota summary", () => {
  it("never prints 0/0 for a Free plan and reports the active room count", () => {
    const quota = buildCustomRoomQuota({
      customRoomsData: { currentCustomRoomsCount: 0 },
      limits: { maxActiveCustomRooms: 0 },
      fallbackUsed: 1,
    })

    const summary = formatWorkspaceRoomsSummary({
      totalActiveRooms: 1,
      customQuota: quota,
    })

    expect(summary).toBe("1 phòng đang hoạt động")
    expect(summary).not.toContain("0/0")
    expect(quota.hasCustomQuota).toBe(false)
  })

  it("shows both the active room total and the fixed-room quota on Pro", () => {
    const quota = buildCustomRoomQuota({
      customRoomsData: { currentCustomRoomsCount: 1 },
      limits: { maxActiveCustomRooms: 3 },
    })

    const summary = formatWorkspaceRoomsSummary({
      totalActiveRooms: 2,
      customQuota: quota,
      ct: {},
    })

    expect(summary).toContain("2 phòng đang hoạt động")
    expect(summary).toContain("1/3")
    expect(quota.hasCustomQuota).toBe(true)
  })
})
