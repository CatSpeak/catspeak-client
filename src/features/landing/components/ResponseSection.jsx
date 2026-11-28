import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const AvatarPlaceholder = ({ name, color }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-neutral-900 flex-shrink-0"
      style={{ background: color }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

const avatarColors = ["#f7b2bd", "#b2d8f7", "#b2f7c1", "#f7e4b2"]

const ResponseSection = () => {
  const { t } = useLanguage()
  const scrollRef = useRef(null)

  const respT = t?.landing?.response || t.home?.responseSection || {}
  const reviews = respT.reviews || []

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -414 : 414
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="relative w-full py-10 sm:py-14 lg:py-16 overflow-hidden">
      <ScrollReveal stagger className="relative z-10 mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
        {/* Left: Title + Navigation */}
        <div className="min-w-0 lg:col-span-4 lg:pr-2">
          <ScrollItem>
            <h2 className="text-4xl font-black text-[#990011] dark:text-[#FF7A8A] mb-2 leading-none">
              {respT.title || "Phản hồi"}
            </h2>
          </ScrollItem>
          <ScrollItem>
            <p className="mb-8 leading-relaxed text-secondary dark:text-gray-300">
              {respT.subtitle}
            </p>
          </ScrollItem>

          <ScrollItem>
            <div className="hidden lg:flex gap-2">
              <IconButton
                onClick={() => handleScroll("left")}
                variant="cathOutline"
                size="sm"
                className="cursor-pointer"
                aria-label={respT.prevReview || "Previous review"}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => handleScroll("right")}
                variant="cathOutline"
                size="sm"
                className="cursor-pointer"
                aria-label={respT.nextReview || "Next review"}
              >
                <ChevronRight />
              </IconButton>
            </div>
          </ScrollItem>
        </div>

        {/* Keep the carousel inside the page grid and scroll cards within its own viewport. */}
        <ScrollItem className="w-full min-w-0 overflow-hidden lg:col-span-8">
          <div
            ref={scrollRef}
            className="flex w-full min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex w-[min(390px,85vw)] flex-shrink-0 snap-start flex-col gap-6 rounded-xl border border-[#990011] bg-white/80 p-4 shadow-sm backdrop-blur-md transition-all dark:border-[#702630] dark:bg-[#1c1c1c]/90 sm:p-6"
              >
                <p className="flex-1 leading-relaxed text-gray-800 dark:text-gray-200">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <AvatarPlaceholder
                    name={review.name}
                    color={avatarColors[i % avatarColors.length]}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{review.name}</span>
                    <span className="text-sm text-secondary dark:text-neutral-300">
                      {review.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollItem>
      </ScrollReveal>
    </section>
  )
}

export default ResponseSection
