import { BookOpen, FileText, Flame, Mic } from "lucide-react"

const DIMENSION_COLORS = {
  pronunciation: "#2563EB",
  vocabulary: "#16A34A",
  grammar: "#7C3AED",
  fluency: "#EA580C",
}

const DIMENSION_ICONS = {
  pronunciation: Mic,
  vocabulary: BookOpen,
  grammar: FileText,
  fluency: Flame,
}

const ProfileSkillsCard = ({ copy = {}, items = [] }) => (
  <section className="flex w-full flex-col gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-white px-[18px] py-3.5">
    <h2 className="text-[12.5px] font-bold leading-[18px] text-[#334155]">
      {copy.skillsTitle}
    </h2>

    {items.map((item) => {
      const color = DIMENSION_COLORS[item.key] || DIMENSION_COLORS.pronunciation
      const Icon = DIMENSION_ICONS[item.key] || Mic
      return (
        <div key={item.key} className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium leading-4 text-[#475569]">
              <Icon size={12} strokeWidth={2} style={{ color }} />
              {item.label}
            </span>
            <span className="text-[11px] font-bold leading-4" style={{ color }}>
              {item.scoreText}
            </span>
          </div>
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#F1F5F9]">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.score}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )
    })}
  </section>
)

export default ProfileSkillsCard
