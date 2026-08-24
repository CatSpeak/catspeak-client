import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const AvatarPlaceholder = ({ name, color }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
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
    <section className="relative w-full py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start px-4 sm:px-6">
        {/* Left: Title + Navigation */}
        <div className="lg:col-span-4 lg:pr-2">
          <h2 className="text-4xl font-black text-[#990011] mb-2 leading-none">
            {respT.title || "Phản hồi"}
          </h2>
          <p className="text-secondary leading-relaxed mb-8">
            {respT.subtitle}
          </p>

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
        </div>

        {/* Right: Native scrollable cards extending off-screen to the right on desktop and mobile */}
        <div className="lg:col-span-8 -mx-4 sm:-mx-6 lg:mx-0 lg:-mr-6 xl:-mr-[calc((100vw-1280px)/2+24px)] 2xl:-mr-[calc((100vw-1280px)/2+24px)] overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth py-3 px-4 sm:px-6 md:px-8 lg:px-1 snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-8 lg:scroll-pl-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[min(390px,85vw)] bg-white/80 backdrop-blur-md border border-[#990011] rounded-xl p-4 sm:p-6 flex flex-col gap-6 shadow-sm snap-start transition-all"
              >
                <p className="leading-relaxed flex-1">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <AvatarPlaceholder
                    name={review.name}
                    color={avatarColors[i % avatarColors.length]}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{review.name}</span>
                    <span className="text-sm text-secondary">
                      {review.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResponseSection
