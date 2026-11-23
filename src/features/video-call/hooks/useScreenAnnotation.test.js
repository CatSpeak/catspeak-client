import { describe, expect, test } from "vitest"

import {
  ANNOTATION_POINT_BATCH_MS,
  applyAnnotationPacketToState,
  applySyncSnapshotToState,
  computeAnnotationPermissions,
  createAnnotationHistory,
  createAnnotationState,
  createDesktopAnnotationBridge,
  isLaserTrailExpired,
  pruneAnnotationLasers,
  recordAnnotationHistoryCommit,
  resetAnnotationStateForTrack,
  shouldFlushPointBatch,
  takeRedoEntry,
  takeUndoEntry,
} from "./useScreenAnnotation.js"
import {
  MAX_ANNOTATION_ITEMS,
  buildClearPacket,
  buildErasePacket,
  buildLaserMovePacket,
  buildRedoPacket,
  buildShapeCommitPacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
  buildTextCommitPacket,
  buildUndoPacket,
} from "../utils/annotationProtocol.js"
import { LASER_TTL_MS } from "../utils/annotationRenderer.js"

const TRACK = "TR_screen_1"

const makeItem = (id, authorId = "42") => ({
  id,
  kind: "stroke",
  tool: "pen",
  color: "#ef4444",
  width: 4,
  authorId,
  authorName: "An",
  pts: [
    [0.1, 0.1],
    [0.2, 0.2],
  ],
})

const startPacket = (id = "s1", authorId = "42") =>
  buildStrokeStartPacket({
    trackSid: TRACK,
    id,
    tool: "pen",
    color: "#ef4444",
    width: 4,
    authorId,
    authorName: "An",
    pt: [0.1, 0.1],
  })

describe("computeAnnotationPermissions", () => {
  const base = { accountId: "7", allowAnnotation: true }

  test("host and presenter can always annotate and moderate", () => {
    expect(computeAnnotationPermissions({ ...base, isHost: true })).toMatchObject(
      { canAnnotate: true, canModerateAnnotation: true },
    )
    expect(
      computeAnnotationPermissions({ ...base, isPresenter: true }),
    ).toMatchObject({ canAnnotate: true, canModerateAnnotation: true })
  })

  test("co-host with manage_student_share can annotate and moderate", () => {
    expect(
      computeAnnotationPermissions({
        ...base,
        coHost: {
          coHostAccountId: 7,
          permissions: ["manage_student_share"],
        },
      }),
    ).toMatchObject({ canAnnotate: true, canModerateAnnotation: true })
  })

  test("regular members annotate while the default policy is open", () => {
    expect(computeAnnotationPermissions(base)).toMatchObject({
      canAnnotate: true,
      canModerateAnnotation: false,
    })
  })

  test("the policy seam can close annotation for regular members", () => {
    expect(
      computeAnnotationPermissions({ ...base, allowAnnotation: false }),
    ).toMatchObject({ canAnnotate: false, canModerateAnnotation: false })
    expect(
      computeAnnotationPermissions({
        ...base,
        allowAnnotation: false,
        isHost: true,
      }),
    ).toMatchObject({ canAnnotate: true, canModerateAnnotation: true })
  })

  test("disabled annotation denies everyone", () => {
    expect(
      computeAnnotationPermissions({ ...base, isHost: true, enabled: false })
        .canAnnotate,
    ).toBe(false)
  })
})

describe("applyAnnotationPacketToState", () => {
  test("builds a live stroke then commits it on stroke-end", () => {
    let state = createAnnotationState(TRACK)

    state = applyAnnotationPacketToState(state, startPacket(), { now: 1000 })
    expect(state.liveStrokes.s1.pts).toEqual([[0.1, 0.1]])

    state = applyAnnotationPacketToState(
      state,
      buildStrokePointPacket({
        trackSid: TRACK,
        id: "s1",
        pts: [
          [0.2, 0.2],
          [0.3, 0.3],
        ],
      }),
      { now: 1010 },
    )
    expect(state.liveStrokes.s1.pts).toHaveLength(3)

    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("s1"),
      }),
      { now: 2000 },
    )

    expect(state.liveStrokes.s1).toBeUndefined()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({
      id: "s1",
      authorId: "42",
      createdAt: 2000,
    })
  })

  test("ignores packets for another screen track", () => {
    const state = createAnnotationState(TRACK)
    const other = buildStrokeStartPacket({
      trackSid: "TR_other",
      id: "s1",
      tool: "pen",
      color: "#fff",
      width: 2,
      authorId: "42",
      authorName: "An",
      pt: [0.1, 0.1],
    })

    expect(applyAnnotationPacketToState(state, other)).toBe(state)
  })

  test("enforces the 400 item FIFO cap on commits", () => {
    let state = createAnnotationState(TRACK)
    for (let i = 0; i < MAX_ANNOTATION_ITEMS + 1; i += 1) {
      state = applyAnnotationPacketToState(
        state,
        buildStrokeEndPacket({
          trackSid: TRACK,
          item: makeItem(`s${i}`),
        }),
        { now: i },
      )
    }

    expect(state.items).toHaveLength(MAX_ANNOTATION_ITEMS)
    expect(state.items[0].id).toBe("s1")
    expect(state.items.at(-1).id).toBe(`s${MAX_ANNOTATION_ITEMS}`)
  })

  test("clear mine removes the sender's strokes, never the receiver's", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("mine", "42"),
      }),
      { now: 1 },
    )
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("theirs", "99"),
      }),
      { now: 2 },
    )

    state = applyAnnotationPacketToState(
      state,
      buildClearPacket({
        trackSid: TRACK,
        scope: "mine",
        authorId: "42",
      }),
      { now: 3, selfAuthorId: "99" },
    )

    expect(state.items.map((i) => i.id)).toEqual(["theirs"])
  })

  test("clear others/all is ignored unless the receiver is a moderator", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("mine", "42"),
      }),
      { now: 1 },
    )
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("theirs", "99"),
      }),
      { now: 2 },
    )

    const clearAll = buildClearPacket({
      trackSid: TRACK,
      scope: "all",
      authorId: "42",
    })
    expect(
      applyAnnotationPacketToState(state, clearAll, {
        canModerate: false,
      }).items,
    ).toHaveLength(2)

    expect(
      applyAnnotationPacketToState(state, clearAll, {
        canModerate: true,
      }).items,
    ).toHaveLength(0)
  })

  test("erase removes committed and live strokes by id", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(state, startPacket("live"), {
      now: 1,
    })
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("done"),
      }),
      { now: 2 },
    )

    state = applyAnnotationPacketToState(
      state,
      buildErasePacket({ trackSid: TRACK, ids: ["live", "done"] }),
      { now: 3 },
    )

    expect(state.liveStrokes.live).toBeUndefined()
    expect(state.items).toHaveLength(0)
  })

  test("tracks presenter-lock state for ticket 04", () => {
    const state = createAnnotationState(TRACK)
    const locked = {
      v: 1,
      trackSid: TRACK,
      t: "presenter-lock",
      locked: true,
    }
    expect(
      applyAnnotationPacketToState(state, locked).presenterLocked,
    ).toBe(true)
  })
})

describe("track changes and late joiners", () => {
  test("changing trackSid clears every item and live stroke", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("s1"),
      }),
    )
    state = applyAnnotationPacketToState(state, startPacket("s2"), { now: 2 })

    const next = resetAnnotationStateForTrack(state, "TR_screen_2")

    expect(next.trackSid).toBe("TR_screen_2")
    expect(next.items).toEqual([])
    expect(next.liveStrokes).toEqual({})
    expect(next.presenterLocked).toBe(false)
  })

  test("resetting to the same track is a no-op", () => {
    const state = createAnnotationState(TRACK)
    expect(resetAnnotationStateForTrack(state, TRACK)).toBe(state)
  })

  test("a snapshot seeds a late joiner without author-pill timestamps", () => {
    const late = createAnnotationState(TRACK)
    const next = applySyncSnapshotToState(late, {
      items: [makeItem("a"), makeItem("b")],
      presenterLocked: true,
    })

    expect(next.items.map((i) => i.id)).toEqual(["a", "b"])
    expect(next.items.every((i) => i.createdAt === 0)).toBe(true)
    expect(next.presenterLocked).toBe(true)
  })

  test("a snapshot keeps local strokes that were not in the snapshot", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildStrokeEndPacket({
        trackSid: TRACK,
        item: makeItem("local"),
      }),
      { now: 500 },
    )

    const next = applySyncSnapshotToState(state, {
      items: [makeItem("remote")],
    })

    expect(next.items.map((i) => i.id)).toEqual(["remote", "local"])
  })
})

describe("point batching and desktop bridge", () => {
  test("batches stroke points at no more than 30fps", () => {
    expect(ANNOTATION_POINT_BATCH_MS).toBeGreaterThanOrEqual(33)
    expect(shouldFlushPointBatch(0, 20)).toBe(false)
    expect(shouldFlushPointBatch(0, ANNOTATION_POINT_BATCH_MS)).toBe(true)
  })

  test("the Electron bridge is an inert no-op outside Electron", () => {
    const bridge = createDesktopAnnotationBridge({})
    expect(bridge.available).toBe(false)
    expect(bridge.emit({ t: "stroke-start" })).toBe(false)
    expect(bridge.subscribe(() => {})).toBeTypeOf("function")
  })

  test("the Electron bridge forwards through the preload seam when present", () => {
    const sent = []
    const listeners = []
    const bridge = createDesktopAnnotationBridge({
      catspeakDesktop: {
        annotation: {
          send: (event) => sent.push(event),
          on: (channel, cb) => listeners.push({ channel, cb }),
          off: () => {},
        },
      },
    })

    expect(bridge.available).toBe(true)
    expect(bridge.emit({ t: "laser-move" })).toBe(true)
    expect(sent).toEqual([{ t: "laser-move" }])
    bridge.subscribe(() => {})
    expect(listeners[0].channel).toBe("annotation:event")
  })
})

const makeShape = (id, authorId = "42") => ({
  id,
  kind: "shape",
  tool: "arrow",
  color: "#3b82f6",
  width: 4,
  authorId,
  authorName: "An",
  x1: 0.1,
  y1: 0.1,
  x2: 0.5,
  y2: 0.5,
})

const makeText = (id, authorId = "42") => ({
  id,
  kind: "text",
  color: "#eab308",
  fontSize: 24,
  authorId,
  authorName: "An",
  x: 0.3,
  y: 0.4,
  text: "Hello\nWorld",
})

describe("ticket 03 reducer", () => {
  test("shape-commit appends a normalized shape item", () => {
    const state = applyAnnotationPacketToState(
      createAnnotationState(TRACK),
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("shape-1") }),
      { now: 500 },
    )

    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({
      id: "shape-1",
      kind: "shape",
      createdAt: 500,
    })
  })

  test("text-commit appends the note at its normalized position", () => {
    const state = applyAnnotationPacketToState(
      createAnnotationState(TRACK),
      buildTextCommitPacket({ trackSid: TRACK, item: makeText("text-1") }),
      { now: 600 },
    )

    expect(state.items[0]).toMatchObject({
      id: "text-1",
      kind: "text",
      text: "Hello\nWorld",
      x: 0.3,
      y: 0.4,
      createdAt: 600,
    })
  })

  test("repeated commits honour the 400 item FIFO cap", () => {
    let state = createAnnotationState(TRACK)
    for (let i = 0; i < MAX_ANNOTATION_ITEMS + 2; i += 1) {
      state = applyAnnotationPacketToState(
        state,
        buildShapeCommitPacket({
          trackSid: TRACK,
          item: makeShape(`shape-${i}`),
        }),
        { now: i },
      )
    }

    expect(state.items).toHaveLength(MAX_ANNOTATION_ITEMS)
    expect(state.items.at(-1).id).toBe(`shape-${MAX_ANNOTATION_ITEMS + 1}`)
  })

  test("undo removes the sender's own item only", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("mine", "42") }),
      { now: 1 },
    )
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({
        trackSid: TRACK,
        item: makeShape("theirs", "99"),
      }),
      { now: 2 },
    )

    const next = applyAnnotationPacketToState(
      state,
      buildUndoPacket({ trackSid: TRACK, id: "mine" }),
      { now: 3, senderAuthorId: "42" },
    )
    expect(next.items.map((item) => item.id)).toEqual(["theirs"])
  })

  test("undo ignores unknown ids and other authors' items", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({
        trackSid: TRACK,
        item: makeShape("theirs", "99"),
      }),
      { now: 1 },
    )

    expect(
      applyAnnotationPacketToState(
        state,
        buildUndoPacket({ trackSid: TRACK, id: "missing" }),
        { now: 2, senderAuthorId: "42" },
      ),
    ).toBe(state)
    expect(
      applyAnnotationPacketToState(
        state,
        buildUndoPacket({ trackSid: TRACK, id: "theirs" }),
        { now: 2, senderAuthorId: "42" },
      ),
    ).toBe(state)
  })

  test("redo re-adds a validated item once", () => {
    const state = createAnnotationState(TRACK)
    const packet = buildRedoPacket({
      trackSid: TRACK,
      item: makeText("text-1"),
    })

    const next = applyAnnotationPacketToState(state, packet, {
      now: 700,
      senderAuthorId: "42",
    })
    expect(next.items[0]).toMatchObject({ id: "text-1", createdAt: 700 })

    expect(
      applyAnnotationPacketToState(next, packet, {
        now: 800,
        senderAuthorId: "42",
      }),
    ).toBe(next)
  })

  test("redo refuses to restore another author's item", () => {
    const state = createAnnotationState(TRACK)
    const packet = buildRedoPacket({
      trackSid: TRACK,
      item: makeShape("theirs", "99"),
    })

    expect(
      applyAnnotationPacketToState(state, packet, {
        now: 1,
        senderAuthorId: "42",
      }),
    ).toBe(state)
  })

  test("laser moves never enter the annotation store", () => {
    const state = applyAnnotationPacketToState(
      createAnnotationState(TRACK),
      buildLaserMovePacket({
        trackSid: TRACK,
        authorName: "An",
        color: "#ef4444",
        x: 0.2,
        y: 0.3,
        ts: 1000,
      }),
      { now: 1000, senderAuthorId: "42" },
    )

    expect(state.items).toEqual([])
    expect(state.lasers["42"].trail).toEqual([{ x: 0.2, y: 0.3, ts: 1000 }])

    const next = applyAnnotationPacketToState(
      state,
      buildLaserMovePacket({
        trackSid: TRACK,
        authorName: "An",
        color: "#ef4444",
        x: 0.4,
        y: 0.5,
        ts: 1030,
      }),
      { now: 1030, senderAuthorId: "42" },
    )
    expect(next.lasers["42"].trail.map((point) => point.x)).toEqual([0.2, 0.4])
  })

  test("erase ignores unknown ids and protects others without moderation", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("mine", "42") }),
      { now: 1 },
    )
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({
        trackSid: TRACK,
        item: makeShape("theirs", "99"),
      }),
      { now: 2 },
    )

    const packet = buildErasePacket({
      trackSid: TRACK,
      ids: ["mine", "theirs", "unknown"],
    })
    const denied = applyAnnotationPacketToState(state, packet, {
      now: 3,
      senderAuthorId: "42",
      canModerate: false,
    })
    expect(denied.items.map((item) => item.id)).toEqual(["theirs"])

    const allowed = applyAnnotationPacketToState(state, packet, {
      now: 3,
      senderAuthorId: "42",
      canModerate: true,
    })
    expect(allowed.items).toEqual([])
  })

  test("clear mine cannot spoof another author's id", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({
        trackSid: TRACK,
        item: makeShape("theirs", "99"),
      }),
      { now: 1 },
    )
    const spoofed = buildClearPacket({
      trackSid: TRACK,
      scope: "mine",
      authorId: "99",
    })

    expect(
      applyAnnotationPacketToState(state, spoofed, {
        now: 2,
        senderAuthorId: "42",
      }),
    ).toBe(state)
    expect(
      applyAnnotationPacketToState(state, spoofed, {
        now: 2,
        senderAuthorId: "99",
      }).items,
    ).toEqual([])
  })

  test("receivers accept moderator clears even without local rights", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("a", "42") }),
      { now: 1 },
    )

    const next = applyAnnotationPacketToState(
      state,
      buildClearPacket({ trackSid: TRACK, scope: "all", authorId: "42" }),
      { now: 2, senderCanModerate: true, canModerate: false },
    )
    expect(next.items).toEqual([])
  })

  test("receivers ignore clear packets from non-moderators", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("a", "42") }),
      { now: 1 },
    )

    const next = applyAnnotationPacketToState(
      state,
      buildClearPacket({ trackSid: TRACK, scope: "all", authorId: "42" }),
      { now: 2, senderCanModerate: false, canModerate: true },
    )
    expect(next.items).toHaveLength(1)
  })

  test("clear others keeps the moderator's own annotations", () => {
    let state = createAnnotationState(TRACK)
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({ trackSid: TRACK, item: makeShape("mine", "42") }),
      { now: 1 },
    )
    state = applyAnnotationPacketToState(
      state,
      buildShapeCommitPacket({
        trackSid: TRACK,
        item: makeShape("theirs", "99"),
      }),
      { now: 2 },
    )

    const next = applyAnnotationPacketToState(
      state,
      buildClearPacket({ trackSid: TRACK, scope: "others", authorId: "42" }),
      { now: 3, canModerate: true },
    )
    expect(next.items.map((item) => item.id)).toEqual(["mine"])
  })
})

describe("undo/redo history", () => {
  test("a new commit clears the redo stack", () => {
    let history = createAnnotationHistory()
    history = recordAnnotationHistoryCommit(history, makeShape("a"))
    history = takeUndoEntry(history, [makeShape("a")], "42").history
    expect(history.redoStack).toHaveLength(1)

    history = recordAnnotationHistoryCommit(history, makeShape("b"))
    expect(history.undoStack.map((entry) => entry.id)).toEqual(["b"])
    expect(history.redoStack).toEqual([])
  })

  test("undo pops the newest own item and skips missing ones", () => {
    let history = createAnnotationHistory()
    history = recordAnnotationHistoryCommit(history, makeShape("a"))
    history = recordAnnotationHistoryCommit(history, makeShape("b"))

    const missing = takeUndoEntry(history, [makeShape("a")], "42")
    expect(missing.item.id).toBe("a")
    expect(missing.history.undoStack).toEqual([])
    expect(missing.history.redoStack.map((item) => item.id)).toEqual(["a"])
  })

  test("undo refuses items owned by another author", () => {
    let history = createAnnotationHistory()
    history = recordAnnotationHistoryCommit(history, makeShape("theirs", "99"))

    const result = takeUndoEntry(history, [makeShape("theirs", "99")], "42")
    expect(result.item).toBeNull()
    expect(result.history.redoStack).toEqual([])
  })

  test("redo re-inserts the item and returns it to the undo stack", () => {
    let history = createAnnotationHistory()
    history = recordAnnotationHistoryCommit(history, makeShape("a"))
    history = takeUndoEntry(history, [makeShape("a")], "42").history

    const redo = takeRedoEntry(history, [])
    expect(redo.item.id).toBe("a")
    expect(redo.history.redoStack).toEqual([])
    expect(redo.history.undoStack.map((entry) => entry.id)).toEqual(["a"])
    expect(takeRedoEntry(redo.history, [makeShape("a")]).item).toBeNull()
  })
})

describe("laser expiry", () => {
  test("trails expire two and a half seconds after the last point", () => {
    const trail = [{ x: 0.1, y: 0.1, ts: 1000 }]
    expect(isLaserTrailExpired({ trail }, 1000)).toBe(false)
    expect(isLaserTrailExpired({ trail }, 1000 + LASER_TTL_MS)).toBe(false)
    expect(isLaserTrailExpired({ trail }, 1000 + LASER_TTL_MS + 1)).toBe(true)
    expect(isLaserTrailExpired({ trail: [] }, 1000)).toBe(true)
  })

  test("pruning drops only expired trails", () => {
    const lasers = {
      a: { trail: [{ x: 0, y: 0, ts: 1000 }] },
      b: { trail: [{ x: 1, y: 1, ts: 2000 }] },
    }

    expect(Object.keys(pruneAnnotationLasers(lasers, 1000 + LASER_TTL_MS + 1))).toEqual([
      "b",
    ])
  })
})
