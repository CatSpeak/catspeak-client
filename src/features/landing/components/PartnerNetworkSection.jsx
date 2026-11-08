import Marquee from "react-fast-marquee"
import { Building2, Handshake } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PARTNERS = [
  {
    code: "YLC",
    name: "Youth Language Club",
    category: "Thanh niên",
    organization: "Cộng đồng người học",
  },
  {
    code: "USSH",
    name: "CLB Nhật Ngữ Sakura (USSH)",
    category: "Tiếng Nhật",
    organization: "ĐH Khoa học Xã hội & Nhân văn",
  },
  {
    code: "HNLC",
    name: "Cộng đồng Hoa Ngữ Giao Tiếp",
    category: "Tiếng Trung",
    organization: "Cộng đồng Tiếng Trung",
  },
  {
    code: "ETA",
    name: "EdTech Impact Accelerator",
    category: "Công nghệ AI",
    organization: "Vườn ươm Đổi mới Sáng tạo",
  },
  {
    code: "HUST",
    name: "CLB Tiếng Anh Bách Khoa",
    category: "Tiếng Anh",
    organization: "ĐH Bách Khoa Hà Nội",
  },
  {
    code: "THTE",
    name: "Tokyo - Hanoi Talent Exchange",
    category: "Hợp tác Quốc tế",
    organization: "Kết nối Việt Nam - Nhật Bản",
  },
]

const PartnerNetworkSection = () => {
  const { t } = useLanguage()
  const sectionT = t?.landing?.partnerNetwork || {}

  return (
    <section className="w-full overflow-hidden border-y border-white/10 bg-[#0d0e11] text-white">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-4 py-9 sm:px-6 sm:py-11 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#ff555b]">
            <Handshake size={16} className="text-amber-400" />
            <span>
              {sectionT.eyebrow || "Đối tác & mạng lưới đồng hành"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-[34px]">
            {sectionT.title ||
              "Đồng hành cùng các trường đại học & câu lạc bộ ngôn ngữ"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            {sectionT.description ||
              "CAT SPEAK hợp tác cùng các câu lạc bộ học thuật và tổ chức giáo dục để mang môi trường luyện nói thực tế đến cộng đồng người học trẻ trên toàn quốc."}
          </p>
        </div>

        <a
          href="mailto:catspeak.vn@gmail.com?subject=Đăng%20ký%20đối%20tác%20trường%20%2F%20CLB"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/15 lg:self-center"
        >
          <Building2 size={16} />
          <span>
            {sectionT.cta || "Đăng ký đối tác trường / CLB"}
          </span>
        </a>
      </div>

      <div className="border-t border-white/10 py-4 sm:py-5">
        <Marquee
          speed={28}
          gradient={false}
          pauseOnHover
          autoFill
          aria-label={sectionT.partnersLabel || "Mạng lưới đối tác"}
        >
          {PARTNERS.map((partner) => (
            <article
              key={partner.code}
              className="mx-2 flex h-[82px] w-[290px] items-center gap-3 rounded-2xl border border-white/10 bg-[#191a20] px-4 sm:mx-2.5 sm:w-[320px]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-800/50 bg-red-950/60 text-[11px] font-bold text-rose-400">
                {partner.code}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xs font-bold text-gray-100 sm:text-[13px]">
                    {partner.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-semibold text-rose-400">
                    {partner.category}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-gray-400">
                  {partner.organization}
                </p>
              </div>
            </article>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

export default PartnerNetworkSection
