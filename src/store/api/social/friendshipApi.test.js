import { describe, expect, it, vi } from "vitest"
import {
  executeSocialListQuery,
  MAX_SOCIAL_PAGE_SIZE,
} from "./friendshipApi"

describe("friendshipApi bounded pagination", () => {
  it("pages bare legacy ID callers at PageSize <= 50 until all items are collected", async () => {
    const mkUsers = (start, count) =>
      Array.from({ length: count }, (_, idx) => ({
        accountId: start + idx,
        username: `user_${start + idx}`,
      }))

    const baseQuery = vi.fn(async ({ params }) => {
      expect(params.PageSize).toBeLessThanOrEqual(MAX_SOCIAL_PAGE_SIZE)
      if (params.Page === 1) return { data: { data: mkUsers(1, 50) } }
      if (params.Page === 2) return { data: { data: mkUsers(51, 50) } }
      return { data: { data: mkUsers(101, 10) } }
    })

    const result = await executeSocialListQuery(
      { url: "/friendships/user/42", arg: 42 },
      baseQuery,
    )

    expect(baseQuery).toHaveBeenCalledTimes(3)
    expect(result.data.data).toHaveLength(110)
    expect(result.data.hasMore).toBe(false)
    expect(result.data.data[0].accountId).toBe(1)
    expect(result.data.data[109].accountId).toBe(110)
  })

  it("keeps explicit paged requests single-shot and clamped to 50", async () => {
    const baseQuery = vi.fn(async () => ({
      data: { data: [{ accountId: 7 }], page: 2, pageSize: 20 },
    }))

    const result = await executeSocialListQuery(
      {
        url: "/friendships/user/42",
        arg: { accountId: 42, page: 2, pageSize: 20 },
      },
      baseQuery,
    )

    expect(baseQuery).toHaveBeenCalledTimes(1)
    expect(baseQuery).toHaveBeenCalledWith({
      url: "/friendships/user/42",
      method: "GET",
      params: { Page: 2, PageSize: 20 },
    })
    expect(result.data.data).toHaveLength(1)
  })

  it("collects all pending requests cleanly when called with null/undefined", async () => {
    const baseQuery = vi.fn(async ({ params }) => {
      expect(params.PageSize).toBe(MAX_SOCIAL_PAGE_SIZE)
      if (params.Page === 1) {
        return {
          data: {
            data: Array.from({ length: 50 }, (_, i) => ({ friendshipId: i + 1 })),
          },
        }
      }
      return { data: { data: [{ friendshipId: 51 }] } }
    })

    const result = await executeSocialListQuery(
      {
        url: "/friendships/requests",
        arg: undefined,
        defaultFetchAllOnNull: true,
        idOf: (u) => u?.friendshipId,
      },
      baseQuery,
    )

    expect(baseQuery).toHaveBeenCalledTimes(2)
    expect(result.data.data).toHaveLength(51)
  })
})
