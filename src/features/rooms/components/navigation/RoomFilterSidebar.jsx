import React, { useState } from "react"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import LevelFilter from "../filters/LevelFilter"
import TopicFilter from "../filters/TopicFilter"

const RoomFilterSidebar = ({ inDrawer = false }) => {
  const { t } = useLanguage()
  const filtersText = t.rooms.filters
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = () => {
    // Add search functionality here
  }

  return (
    <aside
      className={`rounded-xl bg-white overflow-hidden flex flex-col ${inDrawer ? "" : "shadow-sm border border-[#e5e5e5] lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6.5rem)]"}`}
    >
      {/* Search Header */}
      {/* <div className="border-b border-[#C6C6C6] p-5">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          placeholder={filtersText.searchPlaceholder}
        />
      </div> */}

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
