import LandingContactForm from "./LandingContactForm"

const LandingContactSection = () => (
  <section
    id="landing-contact"
    className="w-full bg-white px-4 py-8 transition-colors dark:bg-[#0F0F0F] sm:px-6 sm:py-12 lg:px-8"
  >
    <div className="mx-auto max-w-[1280px] rounded-[26px] bg-[#A90016] px-5 py-8 shadow-[0_16px_40px_rgba(169,0,22,0.16)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <header className="mx-auto mb-6 max-w-[760px] text-center text-white">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Cộng đồng luyện nói 3 ngôn ngữ · Đang hoạt động trực tuyến
        </p>
        <h2 className="mt-4 text-[clamp(1.7rem,4vw,2.4rem)] font-black leading-tight tracking-[-0.03em]">
          Bắt đầu biến kiến thức thành giao tiếp thực tế
        </h2>
        <p className="mx-auto mt-2 max-w-[620px] text-xs leading-5 text-white/85 sm:text-sm">
          Đăng ký tài khoản tham gia CAT SPEAK để bắt đầu luyện nói ngay hôm
          nay. Hệ thống sẽ kích hoạt tài khoản và gửi tài liệu luyện phản xạ
          3 ngôn ngữ đến bạn ngay lập tức.
        </p>
      </header>

      <div className="mx-auto max-w-[640px]">
        <LandingContactForm />
      </div>
    </div>
  </section>
)

export default LandingContactSection
