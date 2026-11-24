import { describe, expect, it, vi } from "vitest"
import { fetchPaginatedInstructorCollection } from "./coursesApi"

describe("coursesApi instructor bounded pagination", () => {
  it("clamps pageSize to 100 and fetches all pages when fetchAll is true", async () => {
    const mkCourses = (start, count) =>
      Array.from({ length: count }, (_, idx) => ({
        id: start + idx,
        name: `Course ${start + idx}`,
      }))

    const baseQuery = vi.fn(async ({ params }) => {
      expect(params.pageSize).toBeLessThanOrEqual(100)
      if (params.page === 1) {
        return {
          data: {
            items: mkCourses(1, 100),
            total: 125,
            page: 1,
            pageSize: 100,
            totalPages: 2,
          },
        }
      }
      return {
        data: {
          items: mkCourses(101, 25),
          total: 125,
          page: 2,
          pageSize: 100,
          totalPages: 2,
        },
      }
    })

    const result = await fetchPaginatedInstructorCollection(
      {
        url: "/teacher/courses",
        params: { page: 1, pageSize: 500, fetchAll: true },
        transformer: (c) => c,
      },
      baseQuery,
    )

    expect(baseQuery).toHaveBeenCalledTimes(2)
    expect(result.data.data).toHaveLength(125)
    expect(result.data.data[0].id).toBe(1)
    expect(result.data.data[124].id).toBe(125)
  })

  it("clamps oversized single-page requests strictly to 100", async () => {
    const baseQuery = vi.fn(async ({ params }) => {
      expect(params.pageSize).toBe(100)
      return {
        data: {
          items: [{ id: 10 }],
          total: 101,
          page: 2,
          pageSize: 100,
          totalPages: 2,
        },
      }
    })

    const result = await fetchPaginatedInstructorCollection(
      {
        url: "/teacher/classes",
        params: { page: 2, pageSize: 500 },
        transformer: (c) => c,
      },
      baseQuery,
    )

    expect(baseQuery).toHaveBeenCalledTimes(1)
    expect(result.data.data).toHaveLength(1)
  })
})
