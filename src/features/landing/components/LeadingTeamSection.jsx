import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const LeadingTeamSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated, isTeacher, user } = useAuth()
  const navigate = useNavigate()

  const isTeacherUser =
    isAuthenticated &&
    (isTeacher || String(user?.accountType).toLowerCase() === "teacher")

  const handleTeacherAction = () => {
    if (!isAuthenticated) {
      if (openAuthModal) {
        openAuthModal("login")
      } else {
        navigate("/setting/instructor")
      }
      return
    }

    navigate("/setting/instructor")
  }

  const sectionT = t?.landing?.leadingTeam || {}
  const recruitmentT = sectionT.recruitment || {}

  return (
    <section className="w-full overflow-hidden bg-white py-8 sm:py-10 dark:bg-[#0F0F0F]">
      <ScrollReveal stagger className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Teacher Recruitment Banner - only shown for non-teachers */}
        {!isTeacherUser && (
          <ScrollItem>
            <div className="relative overflow-hidden rounded-xl px-4 py-4 sm:px-8 lg:px-12">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-2xl text-center md:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#910B09] leading-tight">
                    {recruitmentT.title ||
                      "Bạn muốn trở thành một phần của đội ngũ giảng viên Cat Speak"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                    {recruitmentT.description ||
                      "Chia sẻ tri thức, kết nối cộng đồng toàn cầu và chủ động thời gian cùng nền tảng công nghệ hàng đầu."}
                  </p>
                </div>

                <button
                  onClick={handleTeacherAction}
                  className="flex-shrink-0 bg-[#910B09] hover:bg-[#7a0907] text-white font-semibold text-sm sm:text-base px-8 py-4 rounded-full transition-colors flex items-center gap-2 group/btn cursor-pointer"
                >
                  <span>
                    {recruitmentT.registerInstructor ||
                      "Đăng ký trở thành Giảng viên"}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </ScrollItem>
        )}
      </ScrollReveal>
    </section>
  )
}

export default LeadingTeamSection
