import { useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { Play, Users, Bot, MessageCircle, Sparkles } from "lucide-react"
import ValueCard from "./ValueCard"
import PencilDoodle from "./PencilDoodle"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const ValuesSection = () => {
  const { t } = useLanguage()
  const contentRef = useRef(null)

  const landingValues = t?.landing?.values || {}
  const homeValues = t?.home?.values || {}

  const valueMap = {
    practice: {
      key: "practice",
      icon: <Play />,
      title:
        landingValues.practice?.title ||
        homeValues.practice?.title ||
        "Thực hành trước, hoàn thiện sau",
      description:
        landingValues.practice?.description ||
        homeValues.practice?.description ||
        "Thực hành trước, hoàn thiện sau.",
      color: "orange",
    },
    aiSupport: {
      key: "aiSupport",
      icon: <Bot />,
      title:
        landingValues.aiSupport?.title ||
        homeValues.aiSupport?.title ||
        "Hỗ trợ AI",
      description:
        landingValues.aiSupport?.description ||
        homeValues.aiSupport?.description ||
        "Người bản xứ và chuyên gia cá nhân hóa lộ trình cho người học với sự hỗ trợ của Chatbox và AI.",
      color: "red",
    },
    community: {
      key: "community",
      icon: <Users />,
      title:
        landingValues.community?.title ||
        homeValues.community?.title ||
        "Thực hành giao tiếp cùng cộng đồng",
      description:
        landingValues.community?.description ||
        homeValues.community?.description ||
        "Thực hành giao tiếp cùng cộng đồng năng động, đa văn hóa.",
      color: "blue",
    },
    networking: {
      key: "networking",
      icon: <MessageCircle />,
      title:
        landingValues.networking?.title ||
        homeValues.networking?.title ||
        "Mở rộng kết nối",
      description:
        landingValues.networking?.description ||
        homeValues.networking?.description ||
        "Mở rộng kết nối cộng đồng bốn phương.",
      color: "green",
    },
    reallife: {
      key: "reallife",
      icon: <Sparkles />,
      title:
        landingValues.reallife?.title ||
        homeValues.reallife?.title ||
        "Giao tiếp thực tế",
      description:
        landingValues.reallife?.description ||
        homeValues.reallife?.description ||
        "Tự tin giao tiếp trong học tập, công việc & cuộc sống.",
      color: "purple",
    },
  }

  const valueList = [
    valueMap.practice,
    valueMap.community,
    valueMap.aiSupport,
    valueMap.networking,
    valueMap.reallife,
  ]

  const whyChooseUs =
    landingValues.whyChooseUs ||
    t.home?.whyChooseUs ||
    "Tại sao chọn chúng tôi ?"
  const valuesTitle =
    landingValues.title ||
    t.home?.valuesTitle ||
    "GIÁ TRỊ CỐT LÕI CAT SPEAK MANG LẠI"

  return (
    <section className="w-full py-8 sm:py-10 md:py-14 lg:py-16 relative overflow-hidden">
      {/* Hand-drawn SVG Doodle — Organic Butterfly Wing curve from Right to Left and Top to Bottom */}
      <PencilDoodle
        path="M 1480 140 C 1320 180, 1220 250, 1150 420 C 1080 580, 990 700, 880 640 C 790 590, 770 360, 720 370 C 670 380, 650 590, 560 640 C 450 700, 360 580, 290 420 C 220 250, 120 180, -50 780"
        viewBox="0 0 1440 850"
        targetRef={contentRef}
        duration={2.8}
        delay={200}
        direction="rtl"
        onComplete={() => {
          if (typeof window !== "undefined") {
            window.__catspeak_values_pencil_done = true
            window.dispatchEvent(new CustomEvent("catspeak-values-pencil-handoff"))
          }
        }}
      />

      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6"
      >
        <ScrollReveal stagger staggerDelay={0.09}>
          {/* Header */}
          <div className="mb-12 sm:mb-16 flex flex-col items-center justify-center space-y-3 text-center max-w-3xl mx-auto">
            <ScrollItem>
              <span className="text-sm font-semibold text-secondary tracking-wider uppercase">
                {whyChooseUs}
              </span>
            </ScrollItem>
            <ScrollItem>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#910B09] tracking-tight leading-tight">
                {valuesTitle}
              </h2>
            </ScrollItem>
          </div>

          {/* Playful Butterfly Wings Constellation Layout (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-center min-h-[580px]">
            {/* Left Wing (Cards 1 & 2) */}
            <div className="col-span-4 flex flex-col gap-10">
              <ScrollItem>
                <ValueCard
                  icon={valueMap.practice.icon}
                  title={valueMap.practice.title}
                  description={valueMap.practice.description}
                  color={valueMap.practice.color}
                  className="lg:-translate-x-2"
                />
              </ScrollItem>
              <ScrollItem>
                <ValueCard
                  icon={valueMap.community.icon}
                  title={valueMap.community.title}
                  description={valueMap.community.description}
                  color={valueMap.community.color}
                  className="lg:translate-x-4"
                />
              </ScrollItem>
            </div>

            {/* Center Hub: Elevated AI Support (Card 3) */}
            <div className="col-span-4 flex flex-col items-center justify-center lg:-translate-y-4">
              <ScrollItem className="w-full">
                <ValueCard
                  icon={valueMap.aiSupport.icon}
                  title={valueMap.aiSupport.title}
                  description={valueMap.aiSupport.description}
                  color={valueMap.aiSupport.color}
                  className="w-full"
                />
              </ScrollItem>
            </div>

            {/* Right Wing (Cards 4 & 5) */}
            <div className="col-span-4 flex flex-col gap-10">
              <ScrollItem>
                <ValueCard
                  icon={valueMap.reallife.icon}
                  title={valueMap.reallife.title}
                  description={valueMap.reallife.description}
                  color={valueMap.reallife.color}
                  className="lg:translate-x-2"
                />
              </ScrollItem>
              <ScrollItem>
                <ValueCard
                  icon={valueMap.networking.icon}
                  title={valueMap.networking.title}
                  description={valueMap.networking.description}
                  color={valueMap.networking.color}
                  className="lg:-translate-x-4"
                />
              </ScrollItem>
            </div>
          </div>

          {/* Mobile / Tablet Responsive Stagger (< lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
            {valueList.map((item, idx) => (
              <ScrollItem
                key={item.key}
                className={
                  idx === 4 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""
                }
              >
                <ValueCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  color={item.color}
                />
              </ScrollItem>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ValuesSection
