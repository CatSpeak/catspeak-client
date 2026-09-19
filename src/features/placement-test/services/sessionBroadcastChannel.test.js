import { describe, expect, it, vi } from "vitest"
import { SESSION_BROADCAST_CHANNEL } from "../constants/lifecycle"
import { createSessionBroadcast } from "./sessionBroadcastChannel"

const createFakeChannel = () => {
  const listeners = new Set()
  return {
    postMessage: vi.fn(),
    addEventListener: vi.fn((type, handler) => {
      if (type === "message") listeners.add(handler)
    }),
    removeEventListener: vi.fn((type, handler) => {
      if (type === "message") listeners.delete(handler)
    }),
    close: vi.fn(),
    emit: (data) => listeners.forEach((handler) => handler({ data })),
  }
}

describe("createSessionBroadcast", () => {
  it("posts typed messages with a timestamp", () => {
    const fake = createFakeChannel()
    const broadcast = createSessionBroadcast({
      createChannel: () => fake,
      now: () => 123,
    })

    expect(broadcast.post("PING", { tabId: "a" })).toBe(true)
    expect(fake.postMessage).toHaveBeenCalledWith({
      type: "PING",
      payload: { tabId: "a" },
      timestamp: 123,
    })
  })

  it("delivers only messages that carry data to subscribers", () => {
    const fake = createFakeChannel()
    const broadcast = createSessionBroadcast({ createChannel: () => fake })
    const handler = vi.fn()

    const unsubscribe = broadcast.subscribe(handler)
    fake.emit({ type: "PONG" })
    fake.emit(null)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ type: "PONG" })

    unsubscribe()
    expect(fake.removeEventListener).toHaveBeenCalledTimes(1)
    fake.emit({ type: "PONG" })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("recreates the channel after closing", () => {
    const fake = createFakeChannel()
    const createChannel = vi.fn(() => fake)
    const broadcast = createSessionBroadcast({ createChannel })

    broadcast.post("PING")
    broadcast.close()
    broadcast.post("PING")

    expect(fake.close).toHaveBeenCalledTimes(1)
    expect(createChannel).toHaveBeenCalledTimes(2)
  })

  it("no-ops when no BroadcastChannel is available", () => {
    const broadcast = createSessionBroadcast({ createChannel: () => null })

    expect(broadcast.post("PING")).toBe(false)
    const unsubscribe = broadcast.subscribe(() => {})
    expect(typeof unsubscribe).toBe("function")
    expect(() => unsubscribe()).not.toThrow()
    expect(() => broadcast.close()).not.toThrow()
  })
})

describe("session channel name", () => {
  it("is stable", () => {
    expect(SESSION_BROADCAST_CHANNEL).toBe("catspeak_placement_test_channel")
  })
})
