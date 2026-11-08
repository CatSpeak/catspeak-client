import { BadgeCheck, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Hệ thống vận hành",
    description:
      "Nền tảng đã chính thức được hoạt động, luôn sẵn sàng hỗ trợ người học mọi lúc, mọi nơi với độ ổn định cao.",
    accent: "text-[#B3261E]",
    iconWrap: "bg-[#FDECEC] border-[#F3D0CD]",
  },
  {
    icon: LockKeyhole,
    title: "Bảo mật quyền riêng tư",
    description:
      "Thông tin cá nhân và dữ liệu học tập được bảo vệ nghiêm ngặt, không chia sẻ cho bên thứ ba mà không có sự đồng ý.",
    accent: "text-[#B3261E]",
    iconWrap: "bg-[#FDECEC] border-[#F3D0CD]",
  },
  {
    icon: BadgeCheck,
    title: "Môi trường an toàn",
    description:
      "Quy chuẩn phòng luyện văn minh, tôn trọng lẫn nhau, tạo ra không gian học tập tích cực và chuyên nghiệp.",
    accent: "text-[#2F8F5B]",
    iconWrap: "bg-[#ECF9F1] border-[#CCECD7]",
  },
  {
    icon: Sparkles,
    title: "Tiến độ thực chất",
    description:
      "Cam kết nội dung học tập đi đúng hướng, giảm vòng lặp giả tạo và mang lại kết quả rõ ràng cho mỗi người học.",
    accent: "text-[#D97706]",
    iconWrap: "bg-[#FFF7E8] border-[#F5E3B8]",
  },
]

const TrustSection = () => {
  return (
    <section className="w-full border-t border-[#d9d9d9] bg-[#f3f3f3] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#B3261E] sm:text-xs">
              MINH BẠCH & ĐỘT TIN CÂY
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3.2vw,3rem)] font-black leading-tight tracking-[-0.04em] text-[#121212]">
              Cam kết trải nghiệm học tập an toàn và trung thực
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-[14px] border border-[#d8d8d8] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#222] shadow-sm">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-[#2FBF71] shadow-[0_0_0_5px_rgba(47,191,113,0.14)]" />
            <span>Trạng thái hệ thống: Đang hoạt động trực tuyến 24/7</span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, description, accent, iconWrap }) => (
            <article
              key={title}
              className="flex min-h-[250px] flex-col rounded-[22px] border border-[#d8d8d8] bg-[#f8f8f8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
            >
              <div
                className={`mb-8 flex h-12 w-12 items-center justify-center rounded-xl border ${iconWrap}`}
              >
                <Icon className={`h-5 w-5 ${accent}`} strokeWidth={2.2} />
              </div>

              <h3 className="text-[1.03rem] font-semibold leading-snug text-[#171717]">
                {title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-[1.7] text-[#4a4a4a]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection
