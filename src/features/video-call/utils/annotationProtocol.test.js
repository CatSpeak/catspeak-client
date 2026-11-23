import { describe, expect, test } from "vitest"

import {
  ANNOTATION_PROTOCOL_VERSION,
  ANNOTATION_TOPIC,
  MAX_ANNOTATION_ITEMS,
  MAX_SYNC_PACKET_BYTES,
  appendAnnotationItem,
  buildClearPacket,
  buildErasePacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
  buildSyncRequestPacket,
  buildSyncSnapshotChunks,
  canApplyClearScope,
  clearAnnotationItems,
  createAnnotationSyncBuffers,
  decodeAnnotationPacket,
  encodeAnnotationPacket,
  mergeSnapshotItems,
  prepareStrokePoints,
  reassembleSyncChunk,
  removeAnnotationItems,
  validateAnnotationPacket,
} from "./annotationProtocol.js"

const TRACK = "TR_screen_1"

const makeStrokeItem = (id, pointCount = 2) => ({
  id,
  kind: "stroke",
  tool: "pen",
  color: "#ef4444",
  width: 4,
  authorId: "42",
  authorName: "Nguyễn Văn Đạt",
  pts: Array.from({ length: pointCount }, (_, i) => [
    Number((i / Math.max(1, pointCount - 1)).toFixed(4)),
    Number((0.2 + i * 0.0001).toFixed(4)),
  ]),
})

const makeStrokeStart = (overrides = {}) =>
  buildStrokeStartPacket({
    trackSid: TRACK,
    id: "stroke-1",
    tool: "pen",
    color: "#ef4444",
    width: 4,
    authorId: "42",
    authorName: "Nguyễn Văn Đạt",
    pt: [0.25, 0.5],
    ...overrides,
  })

describe("topic and protocol version", () => {
  test("uses the agreed DataChannel topic", () => {
    expect(ANNOTATION_TOPIC).toBe("screen-annotation")
    expect(ANNOTATION_PROTOCOL_VERSION).toBe(1)
  })
})

describe("encode / decode", () => {
  test("round-trips a stroke-start packet as UTF-8 JSON", () => {
    const packet = makeStrokeStart()
    const encoded = encodeAnnotationPacket(packet)

    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(decodeAnnotationPacket(encoded)).toEqual(packet)
  })

  test("decodes JSON strings and already-decoded objects", () => {
    const packet = makeStrokeStart()
    expect(decodeAnnotationPacket(JSON.stringify(packet))).toEqual(packet)
    expect(decodeAnnotationPacket(packet)).toEqual(packet)
  })

  test("ignores malformed JSON and invalid payloads without throwing", () => {
    expect(decodeAnnotationPacket(new Uint8Array([123, 34]))).toBeNull()
    expect(decodeAnnotationPacket("not json")).toBeNull()
    expect(decodeAnnotationPacket(null)).toBeNull()
    expect(decodeAnnotationPacket(undefined)).toBeNull()
  })

  test("rejects packets without v: 1 or trackSid", () => {
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), v: 2 }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), trackSid: "" }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), trackSid: undefined }),
    ).toBeNull()
  })

  test("rejects unknown types and invalid coordinates", () => {
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), t: "not-a-thing" }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), pt: [1.2, 0.5] }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), tool: "eraser" }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({ ...makeStrokeStart(), width: 0 }),
    ).toBeNull()
  })

  test("encodeAnnotationPacket refuses to put an invalid packet on the wire", () => {
    expect(() =>
      encodeAnnotationPacket({ ...makeStrokeStart(), v: 2 }),
    ).toThrow()
  })

  test("validates stroke-point batches", () => {
    const packet = buildStrokePointPacket({
      trackSid: TRACK,
      id: "stroke-1",
      pts: [
        [0.1, 0.2],
        [0.2, 0.3],
      ],
    })
    expect(decodeAnnotationPacket(encodeAnnotationPacket(packet))).toEqual(
      packet,
    )
    expect(
      validateAnnotationPacket({ ...packet, pts: [[0.1]] }),
    ).toBeNull()
    expect(validateAnnotationPacket({ ...packet, pts: [] })).toBeNull()
  })

  test("validates a stroke-end item", () => {
    const packet = buildStrokeEndPacket({
      trackSid: TRACK,
      item: makeStrokeItem("stroke-1"),
    })
    expect(decodeAnnotationPacket(encodeAnnotationPacket(packet))).toEqual(
      packet,
    )
    expect(
      validateAnnotationPacket({
        ...packet,
        item: { ...packet.item, kind: "shape" },
      }),
    ).toBeNull()
    expect(
      validateAnnotationPacket({
        ...packet,
        item: { ...packet.item, authorId: null },
      }),
    ).toBeNull()
  })

  test("validates erase, clear, laser and sync-request packets", () => {
    expect(
      decodeAnnotationPacket(
        encodeAnnotationPacket(
          buildErasePacket({ trackSid: TRACK, ids: ["a", "b"] }),
        ),
      ).t,
    ).toBe("erase")

    const clear = buildClearPacket({
      trackSid: TRACK,
      scope: "mine",
      authorId: "42",
    })
    expect(decodeAnnotationPacket(encodeAnnotationPacket(clear))).toEqual(
      clear,
    )
    expect(
      validateAnnotationPacket({ ...clear, scope: "everyone" }),
    ).toBeNull()

    const laser = {
      v: 1,
      trackSid: TRACK,
      t: "laser-move",
      authorName: "An",
      color: "#fff",
      x: 0.5,
      y: 0.4,
      ts: 123,
    }
    expect(decodeAnnotationPacket(JSON.stringify(laser))).toEqual(laser)

    const request = buildSyncRequestPacket({
      trackSid: TRACK,
      requesterId: "7",
    })
    expect(request).toMatchObject({
      v: 1,
      trackSid: TRACK,
      t: "sync-req",
      requesterId: "7",
    })
  })
})

describe("store helpers", () => {
  test("keeps only the newest 400 items (FIFO)", () => {
    let items = []
    for (let i = 0; i < MAX_ANNOTATION_ITEMS + 1; i += 1) {
      items = appendAnnotationItem(items, makeStrokeItem(`s${i}`))
    }
    expect(items).toHaveLength(MAX_ANNOTATION_ITEMS)
    expect(items[0].id).toBe("s1")
    expect(items.at(-1).id).toBe(`s${MAX_ANNOTATION_ITEMS}`)
  })

  test("removes erased ids", () => {
    const items = [makeStrokeItem("a"), makeStrokeItem("b"), makeStrokeItem("c")]
    expect(removeAnnotationItems(items, ["a", "c"]).map((i) => i.id)).toEqual([
      "b",
    ])
  })

  test("clear mine only removes the sender's items", () => {
    const items = [
      { ...makeStrokeItem("a"), authorId: "42" },
      { ...makeStrokeItem("b"), authorId: "99" },
    ]
    expect(
      clearAnnotationItems(items, { scope: "mine", authorId: "42" }).map(
        (i) => i.id,
      ),
    ).toEqual(["b"])
  })

  test("clear others/all requires moderation permission", () => {
    const items = [
      { ...makeStrokeItem("a"), authorId: "42" },
      { ...makeStrokeItem("b"), authorId: "99" },
    ]
    expect(canApplyClearScope({ scope: "mine" })).toBe(true)
    expect(canApplyClearScope({ scope: "others", canModerate: false })).toBe(
      false,
    )
    expect(canApplyClearScope({ scope: "all", canModerate: false })).toBe(false)
    expect(canApplyClearScope({ scope: "all", canModerate: true })).toBe(true)

    expect(
      clearAnnotationItems(items, {
        scope: "others",
        authorId: "42",
        canModerate: false,
      }),
    ).toHaveLength(2)
    expect(
      clearAnnotationItems(items, {
        scope: "others",
        authorId: "42",
        canModerate: true,
      }).map((i) => i.id),
    ).toEqual(["a"])
    expect(
      clearAnnotationItems(items, {
        scope: "all",
        authorId: "42",
        canModerate: true,
      }),
    ).toEqual([])
  })

  test("merges a snapshot without dropping newer local items or duplicating ids", () => {
    const incoming = [
      { ...makeStrokeItem("snap-1"), createdAt: 0 },
      { ...makeStrokeItem("shared"), createdAt: 0 },
    ]
    const existing = [
      { ...makeStrokeItem("shared"), createdAt: 50 },
      { ...makeStrokeItem("local-new"), createdAt: 100 },
    ]

    const merged = mergeSnapshotItems(existing, incoming)

    expect(merged.map((i) => i.id)).toEqual([
      "snap-1",
      "shared",
      "local-new",
    ])
    expect(merged[0].createdAt).toBe(0)
    expect(merged.find((i) => i.id === "shared").createdAt).toBe(0)
    expect(merged.find((i) => i.id === "local-new").createdAt).toBe(100)
  })

  test("prepareStrokePoints rounds, simplifies and caps the point count", () => {
    const points = Array.from({ length: 100 }, (_, i) => [
      i / 99,
      i % 2 === 0 ? 0.1 : 0.9,
    ])
    const prepared = prepareStrokePoints(points, { maxPoints: 10 })

    expect(prepared.length).toBeLessThanOrEqual(10)
    expect(prepared[0]).toEqual([0, 0.1])
    expect(prepared.at(-1)).toEqual([1, 0.9])
  })
})

describe("sync snapshot chunking", () => {
  test("chunks a large snapshot into packets of at most 12 KB", () => {
    const items = Array.from({ length: 60 }, (_, i) =>
      makeStrokeItem(`s${i}`, 12),
    )
    const chunks = buildSyncSnapshotChunks({
      trackSid: TRACK,
      items,
      snapId: "snap-1",
      presenterLocked: false,
    })

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0]).toMatchObject({
      v: 1,
      trackSid: TRACK,
      t: "sync-snap",
      snapId: "snap-1",
    })
    chunks.forEach((chunk) => {
      expect(encodeAnnotationPacket(chunk).byteLength).toBeLessThanOrEqual(
        MAX_SYNC_PACKET_BYTES,
      )
    })
    expect(chunks.map((c) => c.chunkIndex)).toEqual(
      chunks.map((_, i) => i),
    )
    expect(chunks.every((c) => c.totalChunks === chunks.length)).toBe(true)
  })

  test("reassembles chunks received out of order", () => {
    const items = Array.from({ length: 40 }, (_, i) =>
      makeStrokeItem(`s${i}`, 8),
    )
    const chunks = buildSyncSnapshotChunks({
      trackSid: TRACK,
      items,
      snapId: "snap-2",
      presenterLocked: true,
    })

    let buffers = createAnnotationSyncBuffers()
    let result = null
    for (const chunk of [...chunks].reverse()) {
      result = reassembleSyncChunk(buffers, chunk)
      buffers = result.buffers
      if (result.complete) break
    }

    expect(result.complete).toBe(true)
    expect(result.presenterLocked).toBe(true)
    expect(result.items.map((i) => i.id)).toEqual(items.map((i) => i.id))
  })

  test("does not complete until every chunk arrived", () => {
    const items = Array.from({ length: 60 }, (_, i) =>
      makeStrokeItem(`s${i}`, 12),
    )
    const chunks = buildSyncSnapshotChunks({
      trackSid: TRACK,
      items,
      snapId: "snap-3",
    })
    expect(chunks.length).toBeGreaterThan(1)
    const first = reassembleSyncChunk(
      createAnnotationSyncBuffers(),
      chunks[0],
    )

    expect(first.complete).toBe(false)
    expect(first.items).toBeNull()
  })

  test("ignores mismatched totalChunks and empty item lists", () => {
    expect(
      buildSyncSnapshotChunks({ trackSid: TRACK, items: [], snapId: "x" }),
    ).toEqual([])

    const chunk = buildSyncSnapshotChunks({
      trackSid: TRACK,
      items: [makeStrokeItem("a")],
      snapId: "x",
    })[0]
    const buffers = {
      x: {
        totalChunks: 2,
        chunks: [null, null],
        presenterLocked: false,
      },
    }
    const result = reassembleSyncChunk(buffers, chunk)
    expect(result.complete).toBe(false)
  })
})
