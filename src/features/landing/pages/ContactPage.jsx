import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import LandingContactForm from "../components/LandingContactForm"

const contactItems = [
  {
    icon: Mail,
    label: "EMAIL HỖ TRỢ & HỢP TÁC",
    value: "catspeak.vn@gmail.com",
    description: "Phản hồi trong vòng 24 giờ làm việc",
    href: "mailto:catspeak.vn@gmail.com",
  },
  {
    icon: Phone,
    label: "HOTLINE TƯ VẤN & HỖ TRỢ",
    value: "0868 192 604",
    description: "Hỗ trợ trực tiếp từ 08:30 đến 21:00 hằng ngày",
    href: "tel:0868192604",
  },
  {
    icon: ExternalLink,
    label: "CỘNG ĐỒNG & FANPAGE CHÍNH THỨC",
    value: "facebook.com/CatSpeak",
    description: "Cập nhật lịch phòng luyện và sự kiện đàm thoại",
    href: "https://www.facebook.com/CatSpeak",
  },
]

const ContactPage = () => (
  <div className="w-full bg-white px-4 pb-10 pt-8 text-[#222] dark:bg-[#0F0F0F] dark:text-gray-100 sm:px-6 sm:pb-12 lg:px-8">
    <div className="mx-auto max-w-[1160px]">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff1f2] px-3 py-2 text-xs font-semibold text-[#A90016] transition-colors hover:bg-[#ffe4e7] dark:bg-[#35181d] dark:text-[#ff9aa8] dark:hover:bg-[#482027]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Quay lại trang chủ CAT SPEAK
      </Link>

      <header className="mt-7 max-w-[690px]">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#A90016] dark:text-[#ff8599] sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A90016] dark:bg-[#ff8599]" />
          KÊNH LIÊN HỆ CHÍNH THỨC · CAT SPEAK COMMUNITY
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[40px]">
          Liên hệ với đội ngũ CAT SPEAK
        </h1>
        <p className="mt-2 max-w-[650px] text-sm leading-6 text-gray-600 dark:text-gray-400">
          Bạn có câu hỏi về phòng luyện 3 ngôn ngữ Anh - Trung - Nhật, cần hỗ trợ
          tài khoản và tham gia phòng luyện, hoặc muốn tìm hiểu cơ hội hợp tác đào
          tạo cùng trung tâm/doanh nghiệp? Đội ngũ CAT SPEAK luôn sẵn sàng lắng
          nghe.
        </p>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)]">
        <aside className="rounded-2xl border border-[#e8e8e8] bg-[#f3f3f3] p-5 dark:border-[#343434] dark:bg-[#1b1b1b] sm:p-6">
          <h2 className="mb-4 text-base font-bold">Thông tin kết nối trực tiếp</h2>
          <div className="space-y-3">
            {contactItems.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={
                    item.href.startsWith("https://") ? "_blank" : undefined
                  }
                  rel={
                    item.href.startsWith("https://")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex min-h-[74px] items-start gap-3 rounded-xl border border-[#e8e8e8] bg-white p-3 transition-colors hover:border-[#d7a0a6] dark:border-[#383838] dark:bg-[#242424] dark:hover:border-[#75323b]"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      index === 2
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-rose-50 text-[#A90016] dark:bg-rose-950/40 dark:text-[#ff9aa8]"
                    }`}
                  >
                    <ItemIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span
                      className={`mt-0.5 block break-words text-xs font-bold ${
                        index === 2 ? "text-[#A90016] dark:text-[#ff9aa8]" : ""
                      }`}
                    >
                      {item.value}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  </span>
                </a>
              )
            })}

            <div className="flex min-h-[74px] items-start gap-3 rounded-xl border border-[#e8e8e8] bg-white p-3 dark:border-[#383838] dark:bg-[#242424]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-[#333] dark:text-gray-300">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                  THỜI GIAN LÀM VIỆC
                </span>
                <span className="mt-0.5 block text-xs font-bold">
                  08:30 - 21:00 (Thứ Hai - Chủ Nhật)
                </span>
                <span className="mt-0.5 block text-[10px] text-gray-500 dark:text-gray-400">
                  Phòng AI hoạt động tự động 24/7
                </span>
              </span>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-white p-3 dark:border-[#383838] dark:bg-[#242424]">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#A90016] dark:text-[#ff9aa8]">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                3 NGÔN NGỮ LUYỆN NÓI TRỌNG TÂM
              </p>
              <p className="mt-1.5 text-[10px] leading-4 text-gray-600 dark:text-gray-400">
                CAT SPEAK hiện hỗ trợ chuyên sâu các chương trình luyện nói:
                Tiếng Anh (IELTS / Giao tiếp công sở), Tiếng Trung (HSK / Khẩu
                ngữ thương mại), và Tiếng Nhật (JLPT / Giao tiếp Kaiwa).
              </p>
            </div>
          </div>
        </aside>

        <LandingContactForm />
      </div>
    </div>
  </div>
)

export default ContactPage
