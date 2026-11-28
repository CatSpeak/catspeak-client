// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PostMediaGallery from "./PostMediaGallery"

const mocks = vi.hoisted(() => ({
  authCalls: [],
  authResult: { url: null, isLoading: false },
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: { profile: { post: {} } } }),
}))

vi.mock("@/shared/utils/authenticatedMedia", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthenticatedMediaUrl: (rawUrl) => {
      mocks.authCalls.push(rawUrl)
      return mocks.authResult
    },
  }
})

const publicPost = {
  postMediaId: 1,
  mediaType: "Image",
  mediaUrl: "/api/Post/1/media/2",
  fileName: "public.jpg",
}

const externalPost = {
  postMediaId: 2,
  mediaType: "Image",
  mediaUrl: "https://cdn.example.com/pic.jpg",
  fileName: "external.jpg",
}

const mount = (element) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return { container, root }
}

beforeEach(() => {
  mocks.authCalls.length = 0
  mocks.authResult = { url: null, isLoading: false }
})

describe("ISS-68: PostMediaGallery public vs protected media", () => {
  it("loads Public post media directly without the authenticated gateway", () => {
    const { container, root } = mount(
      <PostMediaGallery media={[publicPost]} isPublicPost />,
    )

    const img = container.querySelector("img")
    expect(img).toBeTruthy()
    expect(img.getAttribute("src")).toContain("/Post/1/media/2")
    expect(mocks.authCalls).toEqual([null])

    act(() => root.unmount())
    container.remove()
  })

  it("keeps the authenticated fetch for non-public posts (CS-07)", () => {
    mocks.authResult = { url: null, isLoading: true }
    const { container, root } = mount(
      <PostMediaGallery media={[publicPost]} isPublicPost={false} />,
    )

    expect(mocks.authCalls).toEqual(["/api/Post/1/media/2"])
    expect(container.textContent).not.toContain("Không thể tải hình ảnh")

    act(() => root.unmount())
    container.remove()
  })

  it("renders the resolved authenticated blob when loading completes", () => {
    mocks.authResult = { url: "blob:protected-image", isLoading: false }
    const { container, root } = mount(
      <PostMediaGallery media={[publicPost]} isPublicPost={false} />,
    )

    const img = container.querySelector("img")
    expect(img.getAttribute("src")).toBe("blob:protected-image")

    act(() => root.unmount())
    container.remove()
  })

  it("uses a high-contrast fallback when an image fails to load", () => {
    const { container, root } = mount(
      <PostMediaGallery media={[externalPost]} isPublicPost />,
    )

    const img = container.querySelector("img")
    act(() => {
      img.dispatchEvent(new Event("error", { bubbles: true }))
    })

    expect(container.textContent).toContain("Không thể tải hình ảnh")
    const fallback = container.querySelector(".text-gray-600")
    expect(fallback).toBeTruthy()
    expect(fallback.className).toContain("dark:text-neutral-300")
    expect(container.innerHTML).not.toContain("text-gray-400")

    act(() => root.unmount())
    container.remove()
  })
})
