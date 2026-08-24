import { useRef } from "react"
import { Bot, Crown, BookOpen, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PencilDoodle from "./PencilDoodle"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const ECOSYSTEM_CONFIGS = [
  {
    key: "ai",
    icon: Bot,
    cardClass:
      "bg-[#F4EEFF]/75 backdrop-blur-md border border-purple-200/60 shadow-sm",
    accentBgClass: "bg-[#DDD6FE]/80",
    iconColorClass: "text-[#7C3AED]",
    accentTextColorClass: "text-[#6D28D9]",
    defaultBadge: "Hỏi gì cũng được!",
    defaultTitle: "Trợ lý AI",
    defaultDesc:
      "Có bài khó? Có điều mò mẫm? Hỏi AI ngay để được giải thích thật dễ hiểu và vui hơn.",
  },
  {
    key: "gamification",
    icon: Crown,
    cardClass:
      "bg-[#FEFCE8]/75 backdrop-blur-md border border-yellow-200/60 shadow-sm",
    accentBgClass: "bg-[#FEF08A]/80",
    iconColorClass: "text-[#CA8A04]",
    accentTextColorClass: "text-[#A16207]",
    defaultBadge: "Học mà vui, chơi mà giỏi!",
    defaultTitle: "Vừa học vừa chơi",
    defaultDesc:
      "Thử thách nhỏ, trò chơi hay và nhiệm vụ thú vị đang chờ bạn khám phá.",
  },
  {
    key: "resources",
    icon: BookOpen,
    cardClass:
      "bg-[#F0FDF4]/75 backdrop-blur-md border border-emerald-200/60 shadow-sm",
    accentBgClass: "bg-[#BBF7D0]/80",
    iconColorClass: "text-[#16A34A]",
    accentTextColorClass: "text-[#15803D]",
    defaultBadge: "Kho báu kiến thức đầy rồi!",
    defaultTitle: "Nguồn tài nguyên",
    defaultDesc:
      "Tìm sách, bài học, hình ảnh và những điều hay ho để học thêm mỗi ngày.",
  },
  {
    key: "community",
    icon: Users,
    cardClass:
      "bg-[#FDF2F8]/75 backdrop-blur-md border border-pink-200/60 shadow-sm",
    accentBgClass: "bg-[#FBCFE8]/80",
    iconColorClass: "text-[#DB2777]",
    accentTextColorClass: "text-[#BE185D]",
    defaultBadge: "Cùng học, cùng vui!",
    defaultTitle: "Kết nối cộng đồng",
    defaultDesc:
      "Chia sẻ điều bạn biết, xem thành quả của bạn bè và tìm thêm những người cùng sở thích.",
  },
]

const ExploreEcosystemSection = () => {
  const { t } = useLanguage()
  const contentRef = useRef(null)

  const ecoT = t?.landing?.ecosystem || {}
  const bubblesT = ecoT.bubbles || {}
  const featuresT = ecoT.features || {}

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Hand-drawn SVG Doodle — Organic Loop path across and behind the cards */}
      <PencilDoodle
        path="M -30 460 C 140 420, 290 520, 460 480 C 560 460, 630 380, 650 310 C 665 240, 595 230, 545 280 C 490 330, 500 440, 590 490 C 690 550, 840 520, 990 480 C 1140 440, 1260 580, 1340 680 C 1390 750, 1440 730, 1490 710"
        viewBox="0 0 1440 900"
        targetRef={contentRef}
        duration={2.8}
        delay={250}
        direction="ltr"
      />

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal stagger staggerDelay={0.09}>
          {/* Top Layered Speech Bubbles Cluster */}
          <ScrollItem>
            <div className="relative w-[370px] h-[120px] mx-auto mb-8 select-none">
              {/* Bubble 1: Top Left (Soft Pink Fill, Overlaps Bubble 2) */}
              <div className="absolute top-0 left-0 z-20 bg-[#FEECEF] text-[#800A08] font-bold text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-[22px] rounded-bl-[4px] shadow-sm whitespace-nowrap">
                {bubblesT.naturalCommunication || "Giao tiếp tự nhiên"}
              </div>

              {/* Bubble 2: Middle Right (Red Outline, Underneath 1 & 3) */}
              <div className="absolute top-[18px] left-[140px] z-10 bg-white border-2 border-[#910B09] text-[#800A08] font-bold text-sm sm:text-base pl-8 pr-6 sm:pl-9 sm:pr-7 py-2.5 sm:py-3 rounded-[22px] rounded-tr-[36px] rounded-l-[8px] whitespace-nowrap">
                {bubblesT.communityCommunication || "Giao tiếp cộng đồng"}
              </div>

              {/* Bubble 3: Bottom Center/Left (Soft Cream Fill, Overlaps Bubble 2) */}
              <div className="absolute top-[64px] left-[35px] z-30 bg-[#FFF8E7] text-[#800A08] font-bold text-sm sm:text-base px-6 sm:px-7 py-2.5 sm:py-3 rounded-[22px] rounded-bl-[4px] shadow-sm whitespace-nowrap">
                {bubblesT.realtimePractice || "Thực Hành Real-time"}
              </div>
            </div>
          </ScrollItem>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <ScrollItem>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                {ecoT.title || "Khám phá hệ sinh thái học tập"}
              </h2>
            </ScrollItem>
            <ScrollItem>
              <p className="text-gray-600 text-base sm:text-lg mt-4 leading-relaxed">
                {ecoT.subtitle ||
                  "Kết nối tri thức, tối ưu lộ trình và phát triển ngôn ngữ bền vững."}
              </p>
            </ScrollItem>
          </div>

          {/* 4 Feature Cards Grid — Sequential Reveal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ECOSYSTEM_CONFIGS.map((config) => {
              const Icon = config.icon
              const feature = featuresT[config.key] || {}
              const badge = feature.badge || config.defaultBadge
              const title = feature.title || config.defaultTitle
              const description = feature.description || config.defaultDesc

              return (
                <ScrollItem key={config.key}>
                  <div
                    className={`rounded-xl p-4 sm:p-6 flex flex-col justify-between h-full ${config.cardClass}`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${config.accentBgClass} ${config.iconColorClass}`}
                        >
                          <Icon />
                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${config.accentBgClass} ${config.accentTextColorClass}`}
                        >
                          {badge}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mt-6 mb-2">{title}</h3>
                      <p className="text-secondary">{description}</p>
                    </div>
                  </div>
                </ScrollItem>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ExploreEcosystemSection
