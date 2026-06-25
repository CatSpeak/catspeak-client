import React from "react"
import { Search } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const HeaderSearchBar = () => {
  const { t } = useLanguage()

  return (
    <div className="hidden md:flex items-center relative w-[260px]">
      <Search className="w-[17px] h-[17px] text-gray-500 absolute left-4" strokeWidth={2.5} />
      <input
        type="text"
        placeholder={t.header?.searchPlaceholder || "Tìm kiếm phòng hoặc chủ đề"}
        className="w-full h-10 pl-11 pr-4 bg-[#F0F0F0] border-transparent focus:bg-white focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 rounded-full text-[14px] outline-none transition-all placeholder-gray-500"
      />
    </div>
  )
}

export default HeaderSearchBar
