import { Clock3, ExternalLink, Mail, Phone } from "lucide-react"
import { MainLogo } from "@/shared/assets/icons/logo"
import FooterBottom from "./FooterBottom"

const quickLinks = [
  { label: "Vấn đề người học", href: "#problem" },
  { label: "Giải pháp CAT SPEAK", href: "#solutions" },
  { label: "Tính năng cốt lõi (Room 1-1, AI)", href: "#features" },
  { label: "Cách hoạt động", href: "#how-it-works" },
  { label: "So sánh phương pháp học", href: "#solutions" },
  { label: "Câu hỏi thường gặp (FAQ)", href: "#faq" },
  { label: "Trạng thái hệ thống", href: "#contact" },
]

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="contact"
      className="scroll-mt-[72px] border-t border-white/10 bg-[#242424] text-white"
    >
      <div className="mx-auto max-w-[1280px] px-6 pb-7 pt-10 sm:px-8 sm:pt-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.85fr_1.15fr] lg:gap-16">
          <div>
            <a
              href="/"
              aria-label="CAT SPEAK - Trang chủ"
              className="inline-flex rounded-lg bg-white px-3 py-2"
            >
              <img src={MainLogo} alt="CAT SPEAK" className="h-8 w-auto" />
            </a>
            <p className="mt-5 max-w-[430px] text-sm leading-[1.7] text-gray-300">
              Nền tảng cộng đồng luyện nói 3 ngôn ngữ Anh - Trung - Nhật cùng
              người thật và AI linh hoạt theo nhu cầu. Biến kiến thức thành
              những cuộc trò chuyện thực tế.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              <span>Trạng thái: Nền tảng đang hoạt động trực tuyến 24/7</span>
            </div>
          </div>

          <nav aria-label="Điều hướng nhanh">
            <h2 className="text-xs font-bold uppercase tracking-wide text-white">
              Điều hướng nhanh
            </h2>
            <ul className="mt-4 space-y-2">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:catspeak.vn@gmail.com?subject=Li%C3%AAn%20h%E1%BB%87%20h%E1%BB%A3p%20t%C3%A1c"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
            >
              Trang liên hệ & hợp tác
              <span aria-hidden="true">→</span>
            </a>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-white">
              Thông tin liên hệ & kênh chính thức
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-300">
              <li>
                <a
                  href="mailto:catspeak.vn@gmail.com"
                  className="inline-flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  catspeak.vn@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:0868192604"
                  className="inline-flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  0868 192 604
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/CatSpeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors hover:text-white"
                >
                  <ExternalLink
                    className="h-4 w-4 text-amber-400"
                    aria-hidden="true"
                  />
                  facebook.com/CatSpeak
                </a>
              </li>
            </ul>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-gray-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Thời gian hỗ trợ: 08:30 - 21:00 (Thứ Hai - Chủ Nhật)
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-4 sm:mt-12">
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-gray-400 sm:flex-row sm:items-center">
            <p>
              © {currentYear} CAT SPEAK Community. Bản quyền thuộc về CAT SPEAK.
            </p>
            <FooterBottom />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
