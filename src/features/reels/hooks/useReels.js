import { useState, useCallback, useMemo } from "react"
import { useGetReelsFeedQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../utils/mappers"

/**
 * Hook to manage reel grid data and tag filtering.
 *
 * Connected to live API with fallback mock data.
 *
 * @returns {{
 *   reels: Reel[],
 *   filteredReels: Reel[],
 *   activeTag: string|null,
 *   tags: string[],
 *   isLoading: boolean,
 *   setActiveTag: (tag: string|null) => void,
 * }}
 */
const useReels = (searchQuery = "") => {
  const [activeTag, setActiveTag] = useState(null)

  // Fetch live Reels feed from staging API
  const { data: feedResponse, isLoading: isApiLoading } = useGetReelsFeedQuery({
    search: searchQuery
  })

  // Map API data to UI structure, default to empty array if empty or loading
  const reels = useMemo(() => {
    if (feedResponse?.data && feedResponse.data.length > 0) {
      return feedResponse.data.map(mapReelDtoToFrontend)
    }
    return []
  }, [feedResponse])

  const isLoading = isApiLoading

  const tags = useMemo(() => {
    const tagSet = new Set()
    reels.forEach((v) => v.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [reels])

  const filteredReels = useMemo(
    () =>
      activeTag
        ? reels.filter((v) => v.tags.includes(activeTag))
        : reels,
    [reels, activeTag],
  )

  const handleSetActiveTag = useCallback(
    (tag) => setActiveTag((prev) => (prev === tag ? null : tag)),
    [],
  )

  return {
    reels,
    filteredReels,
    activeTag,
    tags,
    isLoading,
    setActiveTag: handleSetActiveTag,
  }
}

export default useReels
