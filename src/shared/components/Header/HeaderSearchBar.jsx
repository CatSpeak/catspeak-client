import React, { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import HeaderFilter from "./HeaderFilter"

const HeaderSearchBar = () => {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useParams()

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchValue(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = () => {
    const trimmed = searchValue.trim()
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

    // Close the search overlay after searching
    setIsExpanded(false)
  }

  return (
    <>
      {/* Search Toggle Icon Button (Visible on screens smaller than lg) */}
      <div className="lg:hidden shrink-0">
        <IconButton
          variant="filled"
          onClick={() => setIsExpanded(true)}
          aria-label={t.header?.searchPlaceholder || "Search"}
        >
          <Search size={20} strokeWidth={2} />
        </IconButton>
      </div>

      {/* Desktop Search Bar Input (Visible on lg screens and above) */}
      <div className="hidden lg:flex relative items-center w-[200px] xl:w-[260px] shrink-0">
        <Search
          className="w-[17px] h-[17px] text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
          strokeWidth={2.5}
          onClick={handleSearch}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
          placeholder={t.header?.searchPlaceholder || "Tìm kiếm phòng"}
          className="w-full h-10 pl-11 pr-4 bg-primaryBg border-transparent focus:bg-white focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 rounded-full text-[14px] outline-none transition-all placeholder-gray-500"
        />
      </div>

      {/* Expanded Search Overlay (Mobile & Tablet overlay when toggled on) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-0 h-[64px] z-[100] bg-white px-4 flex items-center gap-3 shadow-md"
          >
            <IconButton
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </IconButton>

            <div className="relative flex-1">
              <Search
                className="w-[17px] h-[17px] text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
                strokeWidth={2.5}
                onClick={handleSearch}
              />
              <input
                type="text"
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                placeholder={t.header?.searchPlaceholder || "Tìm kiếm phòng"}
                className="w-full h-10 pl-11 pr-4 bg-primaryBg border-transparent focus:bg-white focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 rounded-full text-[15px] outline-none transition-all placeholder-gray-500"
              />
            </div>

            <div className="lg:hidden shrink-0">
              <HeaderFilter />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default HeaderSearchBar
