// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useStories from "./useStories"

const api = vi.hoisted(() => ({
  getStories: vi.fn(() => ({ data: [] })),
  getMyStories: vi.fn(() => ({ data: [] })),
}))

let mockIsAuthenticated = false

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal()),
  useDispatch: () => vi.fn(),
  useSelector: () => mockIsAuthenticated,
}))

vi.mock("@/features/chat/context/useConversationSignalRContext.js", () => ({
  useConversationSignalRContext: () => null,
}))

vi.mock("../api/storiesApi", () => ({
  useGetStoriesQuery: api.getStories,
  useGetMyStoriesQuery: api.getMyStories,
  useCreateStoryMutation: () => [vi.fn(), { isLoading: false }],
  useInteractWithStoryMutation: () => [vi.fn()],
  useDeleteStoryMutation: () => [vi.fn()],
  useReportStoryMutation: () => [vi.fn()],
}))

const Probe = () => {
  useStories("Chinese")
  return <div>probe</div>
}

describe("ISS-09: useStories skips personal queries for guests", () => {
  beforeEach(() => {
    api.getStories.mockClear()
    api.getMyStories.mockClear()
  })

  it("keeps the public list but skips my-stories when unauthenticated", () => {
    mockIsAuthenticated = false

    renderToStaticMarkup(<Probe />)

    expect(api.getStories).toHaveBeenCalledWith("Chinese")
    expect(api.getMyStories).toHaveBeenCalledWith("Chinese", { skip: true })
  })

  it("loads my-stories when authenticated", () => {
    mockIsAuthenticated = true

    renderToStaticMarkup(<Probe />)

    expect(api.getMyStories).toHaveBeenCalledWith("Chinese", { skip: false })
  })
})
