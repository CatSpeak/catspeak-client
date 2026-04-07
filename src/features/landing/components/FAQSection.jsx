import { useState } from "react"
import { Plus, Minus, Search } from "lucide-react"
import { FAQBackground, FAQDecorations } from "@/shared/assets/images/home"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

const FAQSection = () => {
  const { t } = useLanguage()
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Handle question expansion - Independent toggle for each question
  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 overflow-x-hidden">
      <div className="relative mx-auto max-w-screen-xl">
        {/* Background Ticket Image */}
        <div className="relative rounded-3xl min-h-[400px] sm:min-h-[500px] md:min-h-[600px] bg-gradient-to-b from-cath-red-500 via-cath-red-700 to-[#f08d1d] overflow-visible">
          {/* Layer 2: Top Right Decorations (New) */}
          {/* Layer 2: Top Right Decorations (New) - Manually Positioned */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
            <img
              src={FAQDecorations}
              alt="FAQ Decorations"
              className="absolute w-[200px] md:w-[300px] h-auto object-contain"
              style={{
                // Adjust these values to manually position the decorations
                top: "-80px", // Fixed px value to prevent shifting when accordion expands
                right: "-5%",
              }}
            />
          </div>

          {/* Old Decorative Frames - Hidden on larger screens where new decoration exists, visible on mobile/tablet if desired? 
             User said: "only show [decorative frames] on smaller screens"
          */}
          {/* Old Decorative Frames - Removed as we use FAQDecorations everywhere now */}

          {/* Content Overlay - Layer 3 (Top) */}
          <div className="relative z-20 p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16 flex flex-col h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 sm:mb-8 md:mb-10">
              <div className="flex-1 mb-6 md:mb-0">
                {/* Corner Label with underline */}
                <div className="relative inline-block mb-3">
                  <span
                    className="uppercase tracking-[0.15em] text-cath-yellow-400 font-bold text-xs sm:text-sm md:text-base"
                  >
                    {t.faq.corner}
                  </span>
                  <div
                    className="absolute bottom-0 left-0 h-0.5 bg-cath-yellow-400"
                    style={{ width: "50%" }}
                  />
                </div>
                {/* Main Title */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                >
                  {t.faq.title}
                </h2>
              </div>

              {/* Search Bar - Positioned to overlap */}
              <div className="md:absolute md:top-8 md:right-8 lg:top-12 lg:right-12 hidden">
                <div className="relative border-2 border-cath-red-800 rounded-xl px-5 py-3.5 shadow-search flex items-center gap-3 min-w-[240px] md:min-w-[280px] transition-all hover:border-cath-red-900 hover:shadow-lg">
                  <Search className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={t.faq.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-white placeholder-gray-400 text-sm md:text-base bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-0.5 sm:gap-y-1 gap-x-4 md:gap-x-6 flex-1 p-2 sm:p-3 md:p-4 items-start">
              {t.faq.questions.map((item, originalIndex) => {
                // Check if question matches search query
                const matchesSearch =
                  item.question
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  item.answer.toLowerCase().includes(searchQuery.toLowerCase())

                if (!matchesSearch) return null

                const isExpanded = expandedQuestions.has(originalIndex)

                return (
                  <div
                    key={originalIndex}
                    className="border border-white rounded-[24px] bg-transparent backdrop-blur-[8px] mb-2 p-4 transition-all duration-300"
                  >
                    <button
                      aria-controls={`panel${originalIndex}-content`}
                      id={`panel${originalIndex}-header`}
                      onClick={() => toggleQuestion(originalIndex)}
                      className="flex w-full items-center justify-between outline-none"
                    >
                      <span
                        className="flex-1 text-base md:text-lg font-bold leading-snug pr-4 transition-colors duration-200 text-white text-left break-words"
                      >
                        {item.question}
                      </span>
                      <div
                        className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ${isExpanded ? "bg-white" : "bg-[#FFB400]"}`}
                      >
                        {isExpanded ? (
                          <Minus className="w-5 h-5 text-black" />
                        ) : (
                          <Plus className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </button>

                    <div
                      className={`pt-4 pr-4 transition-all overflow-hidden ${isExpanded ? "block" : "hidden"}`}
                    >
                      <div
                        className="text-sm md:text-base leading-relaxed text-white text-left"
                      >
                        {item.answer.split("\n").map((line, idx) => (
                          <span key={idx}>
                            {line}
                            {idx < item.answer.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQSection
