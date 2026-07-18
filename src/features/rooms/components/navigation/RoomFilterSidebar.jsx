import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import LevelFilter from "../filters/LevelFilter"
import TopicFilter from "../filters/TopicFilter"

const RoomFilterSidebar = ({ inDrawer = false }) => {
  const { t } = useLanguage()
  const filtersText = t.rooms.filters
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams)
    const trimmed = searchValue.trim()
    if (trimmed) {
      newParams.set("search", trimmed)
    } else {
      newParams.delete("search")
    }
    // Also reset page to 1 when searching
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  return (
    <aside
      className={`rounded-xl bg-white overflow-hidden flex flex-col ${inDrawer ? "" : "shadow-sm border border-[#e5e5e5] lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6.5rem)]"}`}
    >
      {/* Search Header */}
      <div className="border-b border-[#C6C6C6] p-5">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          placeholder={filtersText.searchPlaceholder || "Search..."}
        />
      </div>

      {/* Filters Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 scrollbar-app">
        {/* Level Filter */}
        <LevelFilter />

        <hr className="my-2 border-[#C6C6C6]" />

        {/* Topic Filter */}
        <TopicFilter />
      </div>
    </aside>
  )
}

export default RoomFilterSidebar
