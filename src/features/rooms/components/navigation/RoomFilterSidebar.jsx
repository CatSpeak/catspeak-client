import React, { useState } from "react"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import LevelFilter from "../filters/LevelFilter"
import TopicFilter from "../filters/TopicFilter"

const RoomFilterSidebar = () => {
  const { t } = useLanguage()
  const filtersText = t.rooms.filters
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = () => {
    // Add search functionality here
  }

  return (
    <aside className="rounded-xl bg-white shadow-sm overflow-hidden border border-[#C6C6C6]">
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
      <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5">
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
