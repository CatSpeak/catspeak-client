import React, { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  Search,
  ArrowLeft,
  ArrowRight,
  History,
  X,
} from "lucide-react"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useSearchParams,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import useDebounce from "@/shared/hooks/useDebounce"
import { useGetRoomsQuery } from "@/store/api/roomsApi"

const RECENT_SEARCHES_KEY = "catspeak_recent_searches"

const getStoredSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    void err
    return []
  }
}

const HeaderSearchBar = () => {
  const { t, language } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const currentParamSearch = searchParams.get("search") || ""
  const [prevParam, setPrevParam] = useState(currentParamSearch)
  const [searchValue, setSearchValue] = useState(currentParamSearch)
  const [recentSearches, setRecentSearches] = useState(() =>
    getStoredSearches(),
  )
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useParams()
  const inputRef = useRef(null)

  // React pattern to adjust state when URL search param changes externally
  if (prevParam !== currentParamSearch) {
    setPrevParam(currentParamSearch)
    setSearchValue(currentParamSearch)
  }

  // Debounced search term for live query
  const debouncedSearch = useDebounce(searchValue, 250)
  const isQueryActive = debouncedSearch.trim().length > 0

  // Live rooms query
  const { data: searchResults, isFetching } = useGetRoomsQuery(
    {
      roomName: debouncedSearch.trim(),
      page: 1,
      pageSize: 5,
    },
    {
      skip: !isExpanded || !isQueryActive,
    },
  )

  const matchingRooms = searchResults?.items || []

  const handleOpen = () => {
    setRecentSearches(getStoredSearches())
    setIsExpanded(true)
  }

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (!isExpanded) return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [isExpanded])

  // Context-specific search placeholder
  const isVocabulary = /\/ai-tutor\/vocabulary-notebook(\/|$)/.test(
    location.pathname,
  )
  const isLearningPath = location.pathname.includes("/learning-path")
  const placeholder = isVocabulary
    ? "Tìm từ vựng…"
    : isLearningPath
      ? "Tìm chủ đề..."
      : t.header?.searchPlaceholder || "Tìm kiếm phòng"

  // Escape key listener to close overlay
  useEffect(() => {
    if (!isExpanded) return
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsExpanded(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded])

  const saveSearchTerm = useCallback((term) => {
    const trimmed = term?.trim()
    if (!trimmed) return
    try {
      const current = getStoredSearches()
      const updated = [
        trimmed,
        ...current.filter((s) => s.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 6)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      setRecentSearches(updated)
    } catch (err) {
      void err
    }
  }, [])

  const handleRemoveTerm = useCallback((termToRemove) => {
    try {
      const current = getStoredSearches()
      const updated = current.filter((s) => s !== termToRemove)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      setRecentSearches(updated)
    } catch (err) {
      void err
    }
  }, [])

  const handleClearAll = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
      setRecentSearches([])
    } catch (err) {
      void err
    }
  }, [])

  const handleSearch = (termToSearch) => {
    const query = typeof termToSearch === "string" ? termToSearch : searchValue
    const trimmed = query.trim()

    if (trimmed) {
      saveSearchTerm(trimmed)
    }

    if (isVocabulary) {
      const base = `/${lang || "vi"}/ai-tutor/vocabulary-notebook/decks`
      navigate(trimmed ? `${base}?search=${encodeURIComponent(trimmed)}` : base)
      setIsExpanded(false)
      return
    }

    const newParams = new URLSearchParams(searchParams)
    if (trimmed) {
      newParams.set("search", trimmed)
    } else {
      newParams.delete("search")
    }
    newParams.set("page", "1")

    const communityPath = `/${lang || "en"}/community`
    if (!location.pathname.startsWith(communityPath)) {
      navigate(`${communityPath}?${newParams.toString()}`)
    } else {
      setSearchParams(newParams, { preventScrollReset: true })
    }

    setIsExpanded(false)
  }

  const hasSuggestionsContent =
    searchValue.trim().length > 0 || recentSearches.length > 0

  return (
    <>
      {/* Universal Search Icon Button */}
      <IconButton
        variant="ghost"
        onClick={handleOpen}
        aria-label={
          isVocabulary || isLearningPath
            ? placeholder
            : t.header?.searchPlaceholder || "Search"
        }
        title={
          isVocabulary || isLearningPath
            ? placeholder
            : t.header?.searchPlaceholder || "Search"
        }
      >
        <Search />
      </IconButton>

      {/* Fullscreen Search Overlay via Portal (no scrollbar removal = zero layout shift) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isExpanded && (
              <div className="fixed inset-0 z-[1200] overflow-y-auto">
                {/* Backdrop */}
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                  onClick={() => setIsExpanded(false)}
                />

                {/* Responsive Search Interaction Surface */}
                <div className="relative z-10 w-full md:fixed md:top-[14vh] md:inset-x-0 md:max-w-2xl md:mx-auto md:px-4">
                  {/* Search Input Row (Clean floating input with NO outer card on desktop) */}
                  <Motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="w-full bg-white dark:bg-[#0F0F0F] md:bg-transparent md:dark:bg-transparent border-b border-border dark:border-[#3F3F3F] md:border-none shadow-md md:shadow-none px-3 py-2.5 md:p-0"
                  >
                    <div className="flex items-center gap-2">
                      {/* Mobile back button */}
                      <div className="md:hidden shrink-0">
                        <IconButton
                          variant="ghost"
                          onClick={() => setIsExpanded(false)}
                          aria-label="Back"
                          title="Close"
                        >
                          <ArrowLeft />
                        </IconButton>
                      </div>

                      {/* Centered Input Pill */}
                      <div className="flex-1 min-w-0 md:shadow-2xl md:rounded-full">
                        <SearchInput
                          inputRef={inputRef}
                          value={searchValue}
                          onChange={setSearchValue}
                          onSearch={() => handleSearch(searchValue)}
                          onClear={() => setSearchValue("")}
                          placeholder={placeholder}
                        />
                      </div>

                      {/* Desktop close button */}
                      <div className="hidden md:block shrink-0">
                        <IconButton
                          variant="secondary"
                          onClick={() => setIsExpanded(false)}
                          title="Close (Esc)"
                          aria-label="Close search"
                          className="shrink-0"
                        >
                          <X />
                        </IconButton>
                      </div>
                    </div>
                  </Motion.div>

                  {/* Suggestions / Results Container (Separate floating container below input) */}
                  {hasSuggestionsContent && (
                    <Motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="w-full md:mt-3 bg-white dark:bg-[#1A1A1A] border-b md:border border-border dark:border-[#3F3F3F] md:rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-80px)] md:max-h-[55vh] flex flex-col"
                    >
                      {/* Case 1: Active query with live search results */}
                      {isQueryActive ? (
                        <div className="flex flex-col overflow-y-auto">
                          {isFetching && matchingRooms.length === 0 ? (
                            <LoadingSpinner
                              size="sm"
                              className="flex flex-col items-center justify-center py-8 text-sm text-gray-500 dark:text-[#AAAAAA]"
                              text={
                                t.header?.searching ||
                                (language === "en"
                                  ? "Searching for rooms..."
                                  : "Đang tìm kiếm phòng...")
                              }
                            />
                          ) : matchingRooms.length > 0 ? (
                            <div>
                              <div className="pl-4 pr-4 h-[56px] flex items-center text-sm text-secondary dark:text-[#AAAAAA] border-b border-border dark:border-[#3F3F3F]">
                                <span>
                                  {t.header?.resultsFound
                                    ? (matchingRooms.length === 1 &&
                                      language === "en"
                                        ? t.header.resultsFound.replace(
                                            "results",
                                            "result",
                                          )
                                        : t.header.resultsFound
                                      ).replace(
                                        "{{count}}",
                                        matchingRooms.length,
                                      )
                                    : language === "en"
                                      ? `${matchingRooms.length} ${matchingRooms.length === 1 ? "result" : "results"} found`
                                      : `Tìm thấy ${matchingRooms.length} kết quả`}
                                </span>
                              </div>

                              <div>
                                {matchingRooms.map((room) => {
                                  const roomId = room.roomId || room.id
                                  const title =
                                    room.name ||
                                    room.roomName ||
                                    room.title ||
                                    "Phòng học"

                                  return (
                                    <div
                                      key={roomId}
                                      className="flex items-center justify-between pl-4 pr-4 h-[56px] hover:bg-[#F2F2F2] dark:hover:bg-[#272727] transition-colors cursor-pointer group"
                                      onClick={() => {
                                        setSearchValue(title)
                                        handleSearch(title)
                                      }}
                                    >
                                      <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                                        <Search className="text-secondary dark:text-[#AAAAAA] shrink-0 group-hover:text-cath-red-700 dark:group-hover:text-white transition-colors" />
                                        <span className="text-base dark:text-gray-200 truncate group-hover:text-cath-red-700 dark:group-hover:text-white transition-colors">
                                          {title}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Footer: View all community results */}
                              <div className="border-t border-border dark:border-[#3F3F3F]">
                                <div
                                  className="flex items-center justify-between pl-4 pr-4 h-[56px] hover:bg-[#F2F2F2] dark:hover:bg-[#272727] transition-colors cursor-pointer group text-cath-red-700 dark:text-white font-medium"
                                  onClick={() => handleSearch(searchValue)}
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                                    <Search className="shrink-0 text-cath-red-700 dark:text-white" />
                                    <span className="text-base truncate">
                                      Xem tất cả kết quả cho &quot;
                                      {searchValue}&quot;
                                    </span>
                                  </div>
                                  <ArrowRight className="shrink-0" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 px-4 text-center">
                              <p className="text-base text-gray-700 dark:text-gray-200">
                                Không tìm thấy phòng nào phù hợp với &quot;
                                {debouncedSearch}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Case 2: Empty query - Recent Searches */
                        recentSearches.length > 0 && (
                          <div>
                            <div className="pl-4 pr-2 h-[56px] flex items-center justify-between text-sm text-secondary dark:text-[#AAAAAA] border-b border-border dark:border-[#3F3F3F]">
                              <span>
                                {t.header?.recentSearches || "Tìm kiếm gần đây"}
                              </span>
                              <PillButton
                                variant="secondary-no-outline"
                                onClick={handleClearAll}
                                className="h-auto text-gray-500 hover:text-cath-red-700 dark:text-[#AAAAAA] dark:hover:text-white"
                              >
                                {t.header?.clearAll || "Xoá tất cả"}
                              </PillButton>
                            </div>

                            <div>
                              {recentSearches.map((term) => (
                                <div
                                  key={term}
                                  className="flex items-center justify-between pl-4 pr-1 h-[56px] hover:bg-[#F2F2F2] dark:hover:bg-[#272727] transition-colors cursor-pointer group"
                                  onClick={() => {
                                    setSearchValue(term)
                                    handleSearch(term)
                                  }}
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                                    <History className="text-secondary dark:text-[#AAAAAA] shrink-0 group-hover:text-cath-red-700 dark:group-hover:text-white transition-colors" />
                                    <span className="text-base dark:text-gray-200 truncate group-hover:text-cath-red-700 dark:group-hover:text-white transition-colors">
                                      {term}
                                    </span>
                                  </div>
                                  <IconButton
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveTerm(term)
                                    }}
                                    className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                    title="Xoá"
                                    aria-label={`Xoá ${term}`}
                                  >
                                    <X />
                                  </IconButton>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </Motion.div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

export default HeaderSearchBar
