import { useState, useEffect, useRef, useMemo } from "react"

/**
 * Custom hook to manage responsive video grid capacity and smart active speaker reordering.
 *
 * Requirements:
 * 1. Fixed grid capacities:
 *    - Mobile (<640px): 4 tiles max
 *    - Tablet (640px-1024px): 6 tiles max
 *    - Desktop (>=1024px): 9 tiles max (or user maxTiles setting)
 * 2. Smart speaker reordering:
 *    - User speaks while INSIDE overflow tile (index >= maxCapacity - 1):
 *      Move user to 1st slot (index 0), shift existing visible users down by 1.
 *    - User speaks while ALREADY VISIBLE in grid (index < maxCapacity - 1):
 *      Keep user in current spot (do not move) to avoid UI jitter.
 *
 * @param {Array} allItems - Combined array of { type: 'screen'|'video', key: string, data: Participant|TrackRef }
 * @param {number} [customMaxTiles] - Optional user override for desktop capacity
 * @returns {{
 *   visibleItems: Array,
 *   overflowItems: Array,
 *   overflowCount: number,
 *   maxCapacity: number
 * }}
 */
export const useGridParticipants = (allItems = [], customMaxTiles) => {
  // 1. Detect viewport width and calculate max capacity
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxCapacity = useMemo(() => {
    let screenLimit = 16 // Bigger desktop screens (>=1280px): 16 tiles (4x4)
    if (windowWidth < 640) {
      screenLimit = customMaxTiles === 3 ? 3 : 6 // Phone (<640px): 6 tiles (2x3)
    } else if (windowWidth < 1280) {
      screenLimit = 9 // Tablet & Small Laptop (640px-1280px): 9 tiles (3x3)
    }

    if (typeof customMaxTiles === "number" && customMaxTiles > 0) {
      return Math.min(customMaxTiles, screenLimit)
    }

    return screenLimit
  }, [windowWidth, customMaxTiles])

  // 2. Maintain a stable ordered list of keys
  const orderedKeysRef = useRef([])
  const prevSpeakingMapRef = useRef(new Map())
  const prevHandRaisedMapRef = useRef(new Map())

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  // Create a map for quick item lookup by key
  const itemsByKeyMap = useMemo(() => {
    const map = new Map()
    allItems.forEach((item) => {
      if (item?.key) {
        map.set(String(item.key), item)
      }
    })
    return map
  }, [allItems])

  // Process item ordering & speaking / hand-raising updates
  const orderedItems = useMemo(() => {
    const currentKeys = allItems.map((item) => String(item.key))
    const currentKeySet = new Set(currentKeys)

    // Filter out keys of participants that left
    let updatedOrder = orderedKeysRef.current.filter((k) =>
      currentKeySet.has(k),
    )

    // Append newly joined participants / screen shares to the end
    // (If it's a screen share, place it near the top at index 0 if new)
    currentKeys.forEach((key) => {
      if (!updatedOrder.includes(key)) {
        const item = itemsByKeyMap.get(key)
        if (item?.type === "screen") {
          updatedOrder.unshift(key) // Screen share goes to front when newly shared
        } else {
          updatedOrder.push(key)
        }
      }
    })

    // 3. Check speaking and hand-raised status changes for each participant
    allItems.forEach((item) => {
      if (!item?.key) return
      const key = String(item.key)

      // Get speaking state (LiveKit participant isSpeaking property)
      const isSpeaking = item.type === "video" && item.data?.isSpeaking === true

      const wasSpeaking = prevSpeakingMapRef.current.get(key) === true
      prevSpeakingMapRef.current.set(key, isSpeaking)

      // Get hand raised state
      const meta =
        item.type === "video" ? parseMetadata(item.data?.metadata) : {}
      const isHandRaised = meta.handRaised === true
      const wasHandRaised = prevHandRaisedMapRef.current.get(key) === true
      prevHandRaisedMapRef.current.set(key, isHandRaised)

      const handJustRaised = isHandRaised && !wasHandRaised
      const speechJustStarted = isSpeaking && !wasSpeaking

      // Trigger reorder when hand is raised OR when speaking starts while in overflow
      if (handJustRaised || speechJustStarted) {
        const currentIndex = updatedOrder.indexOf(key)

        // Hand raise ALWAYS moves to Slot 1 (index 0). Speaking moves to Slot 1 if currently in overflow.
        if (handJustRaised || currentIndex >= maxCapacity - 1) {
          if (currentIndex !== -1) {
            updatedOrder.splice(currentIndex, 1)
            updatedOrder.unshift(key)
          }
        }
      }
    })

    orderedKeysRef.current = updatedOrder

    // Map ordered keys back to complete item objects
    const result = []
    updatedOrder.forEach((key) => {
      const item = itemsByKeyMap.get(key)
      if (item) {
        result.push(item)
      }
    })
    return result
  }, [allItems, itemsByKeyMap, maxCapacity])

  // 4. Split into visible and overflow lists
  if (orderedItems.length <= maxCapacity) {
    return {
      visibleItems: orderedItems,
      overflowItems: [],
      overflowCount: 0,
      maxCapacity,
    }
  }

  // When total > maxCapacity: display (maxCapacity - 1) visible tiles + 1 OverflowTile
  const visibleCount = maxCapacity - 1
  const visibleItems = orderedItems.slice(0, visibleCount)
  const overflowItems = orderedItems.slice(visibleCount)
  const overflowCount = overflowItems.length

  return {
    visibleItems,
    overflowItems,
    overflowCount,
    maxCapacity,
  }
}
