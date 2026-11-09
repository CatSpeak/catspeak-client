import { Element3, Element6 } from "@/features/landing/assets/index.jsx"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const FAQSection = () => {
  const { t } = useLanguage()
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

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

  const faqT = t?.landing?.faq || t.faq || t.home?.faq || {}

  const faqCorner = faqT.corner || "FAQ"
  const faqTitle = faqT.title || "Câu hỏi thường gặp"
  const faqDescription =
    faqT.description ||
    "Giải đáp nhanh những băn khoăn của bạn về lộ trình học và cộng đồng."
  const questions = faqT.questions || []

  return (
    <section
      id="faq"
      className="relative w-full scroll-mt-[72px] pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-10 sm:pb-16 md:pb-20 lg:pb-24 overflow-hidden"
    >
      {/* Background sketch element */}
      <img
        src={Element6}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-0 z-0 w-[500px] select-none opacity-60 pointer-events-none dark:opacity-20 sm:w-[700px] md:w-[900px] lg:w-[1100px]"
      />

      {/* Main Container - Edge-to-edge on the right, aligned with breathing room on the left */}
      <div className="relative z-10 ml-4 mr-0 min-h-[500px] rounded-l-3xl rounded-r-none border-y border-l border-[#E29B9F] bg-[#FFF0EE] transition-colors dark:border-[#633238] dark:bg-[#21191a] sm:ml-8 md:ml-12 md:rounded-l-[40px] lg:ml-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] xl:ml-[max(3.5rem,calc((100vw-1320px)/2+3.5rem))]">
        {/* Inner Content Grid */}
        <ScrollReveal
          stagger
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 p-6 sm:p-10 md:p-12 lg:py-16 lg:pl-16 xl:pl-20 lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))] xl:pr-[max(3rem,calc((100vw-1320px)/2+3rem))] relative z-10 items-start"
        >
          {/* Left Column: Titles, Description & Cat Illustration */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between self-stretch h-full">
            <div>
              <ScrollItem>
                <span className="text-sm font-bold text-[#990011] uppercase tracking-wider block mb-2">
                  {faqCorner}
                </span>
              </ScrollItem>
              <ScrollItem>
                <h2 className="mb-4 text-balance text-3xl font-extrabold leading-tight text-black dark:text-gray-100 sm:text-4xl lg:text-5xl">
                  {faqTitle}
                </h2>
              </ScrollItem>
              {faqDescription && (
                <ScrollItem>
                  <p className="max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
                    {faqDescription}
                  </p>
                </ScrollItem>
              )}
            </div>

            {/* Cat Decorative Element (Desktop) */}
            <ScrollItem className="hidden lg:flex mt-auto pt-10">
              <img
                src={Element3}
                alt=""
                aria-hidden="true"
                className="w-56 xl:w-64 opacity-85 pointer-events-none select-none object-contain"
              />
            </ScrollItem>
          </div>

          {/* Right Column: Accordion */}
          <ScrollItem className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center w-full">
            <div className="w-full border-t border-[#E6C6C6] dark:border-[#4a3436]">
              {questions.map((item, originalIndex) => {
                const isExpanded = expandedQuestions.has(originalIndex)

                return (
                  <div
                    key={originalIndex}
                    className="border-b border-[#E6C6C6] py-3.5 transition-all dark:border-[#4a3436] sm:py-4.5"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`panel${originalIndex}-content`}
                      id={`panel${originalIndex}-header`}
                      onClick={() => toggleQuestion(originalIndex)}
                      className="group flex w-full cursor-pointer items-center justify-between py-1 text-left outline-none"
                    >
                      <span className="flex-1 pr-4 text-left font-medium leading-snug text-black transition-colors group-hover:text-[#990011] dark:text-gray-100 dark:group-hover:text-[#ff7a8a] sm:pr-6">
                        {item.question}
                      </span>

                      <IconButton
                        as="div"
                        size="sm"
                        variant={isExpanded ? "white" : "primary"}
                        className={`ml-2 shrink-0 ${
                          isExpanded
                            ? "dark:border-[#444] dark:bg-[#2b2b2b] dark:text-gray-100"
                            : ""
                        }`}
                      >
                        {isExpanded ? <Minus /> : <Plus />}
                      </IconButton>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <Motion.div
                          id={`panel${originalIndex}-content`}
                          role="region"
                          aria-labelledby={`panel${originalIndex}-header`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            transition: {
                              height: {
                                duration: 0.3,
                                ease: [0.16, 1, 0.3, 1],
                              },
                              opacity: {
                                duration: 0.25,
                                delay: 0.05,
                                ease: "easeOut",
                              },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: {
                                duration: 0.25,
                                ease: [0.16, 1, 0.3, 1],
                              },
                              opacity: { duration: 0.15, ease: "easeIn" },
                            },
                          }}
                          className="overflow-hidden w-full"
                        >
                          <div className="pt-3 pb-1">
                            <div className="bg-[#990011] rounded-2xl p-5 sm:p-6 leading-relaxed text-white text-left shadow-md">
                              {item.answer.split("\n").map((line, idx) => (
                                <span key={idx}>
                                  {line}
                                  {idx <
                                    item.answer.split("\n").length - 1 && (
                                    <br />
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </ScrollItem>

          {/* Cat Decorative Element (Mobile) */}
          <div className="lg:hidden flex justify-center mt-6">
            <img
              src={Element3}
              alt=""
              aria-hidden="true"
              className="w-48 opacity-80 pointer-events-none select-none"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default FAQSection
