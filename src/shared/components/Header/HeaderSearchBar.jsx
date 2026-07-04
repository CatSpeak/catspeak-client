import React, { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom"

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
  }

  return (
    <>
      {/* Mobile Search Button */}
      <button 
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
        onClick={() => setIsExpanded(true)}
      >
        <Search size={20} strokeWidth={2} />
      </button>

      {/* Expanded Search for Mobile (Absolute Overlay) or Desktop (Relative) */}
      <div className={`
        ${isExpanded ? "absolute inset-y-0 left-0 right-0 z-[100] bg-white px-4 flex items-center" : "hidden md:flex relative"} 
        items-center w-full md:w-[260px]
      `}>
        {isExpanded && (
           <button onClick={() => setIsExpanded(false)} className="mr-3 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full shrink-0">
             <ArrowLeft size={22} strokeWidth={2} />
           </button>
        )}
        <div className="relative flex-1">
          <Search 
            className="w-[17px] h-[17px] text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer" 
            strokeWidth={2.5} 
            onClick={handleSearch}
          />
          <input
            type="text"
            autoFocus={isExpanded}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            placeholder={t.header?.searchPlaceholder || "Tìm kiếm phòng hoặc chủ đề"}
            className="w-full h-10 pl-11 pr-4 bg-[#F0F0F0] border-transparent focus:bg-white focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 rounded-full text-[14px] outline-none transition-all placeholder-gray-500"
          />
        </div>
      </div>
    </>
  )
}

export default HeaderSearchBar
