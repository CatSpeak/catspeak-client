import { describe, expect, test } from "vitest"

import {
  ANNOTATION_POINT_BATCH_MS,
  applyAnnotationPacketToState,
  applySyncSnapshotToState,
  computeAnnotationPermissions,
  createAnnotationState,
  createDesktopAnnotationBridge,
  resetAnnotationStateForTrack,
  shouldFlushPointBatch,
} from "./useScreenAnnotation.js"
import {
  MAX_ANNOTATION_ITEMS,
  buildClearPacket,
  buildErasePacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
} from "../utils/annotationProtocol.js"

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
