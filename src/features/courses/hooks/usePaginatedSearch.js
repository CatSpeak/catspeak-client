import { useCallback, useEffect, useState } from "react"

export const usePaginatedSearch = (delay = 400) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setCurrentPage(1)
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, searchQuery])

  const updateSearchQuery = useCallback((value) => {
    setSearchQuery(value)
  }, [])

  return {
    searchQuery,
    debouncedSearchQuery,
    currentPage,
    setSearchQuery: updateSearchQuery,
    setCurrentPage,
  }
}
