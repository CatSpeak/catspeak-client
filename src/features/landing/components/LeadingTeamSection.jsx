import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetHonoredInstructorsQuery } from "@/store/api/instructorApi"
import InstructorCard from "./InstructorCard"
import InstructorSkeletonCard from "./InstructorSkeletonCard"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const LeadingTeamSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated, isTeacher, user } = useAuth()
  const navigate = useNavigate()

  const isTeacherUser =
    isAuthenticated &&
    (isTeacher || String(user?.accountType).toLowerCase() === "teacher")

  const { data, isLoading } = useGetHonoredInstructorsQuery({ limit: 8 })

  const instructors = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data)) return data
    return []
  }, [data])

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

  const handleInstructorClick = (teacher) => {
    if (teacher?.accountId) {
      navigate(`/workspace/profile/${teacher.accountId}`)
    }
  }

  const sectionT = t?.landing?.leadingTeam || {}
  const recruitmentT = sectionT.recruitment || {}

  return (
    <section className="w-full mt-6 sm:mt-0 pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-8 sm:pb-10 md:pb-14 lg:pb-16 bg-white overflow-hidden">
      <ScrollReveal stagger className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <ScrollItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              {sectionT.title || "Đội ngũ giảng viên"}
            </h2>
          </ScrollItem>
          <ScrollItem>
            <p className="text-xl font-bold text-[#910B09] mt-2">
              {sectionT.subtitle || "Giảng viên của tuần"}
            </p>
          </ScrollItem>
        </div>

        {/* Instructor Grid */}
        <ScrollItem>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              <>
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
                <InstructorSkeletonCard />
              </>
            ) : instructors.length > 0 ? (
              instructors.map((teacher, index) => (
                <InstructorCard
                  key={teacher.accountId || index}
                  teacher={teacher}
                  index={index}
                  onClick={() => handleInstructorClick(teacher)}
                />
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm w-full col-span-full">
                {sectionT.emptyText || "Chưa có danh sách giảng viên nổi bật."}
              </div>
            )}
          </div>
        </ScrollItem>

        {/* Teacher Recruitment Banner - only shown for non-teachers */}
        {!isTeacherUser && (
          <ScrollItem>
            <div className="mt-16 relative rounded-xl px-8 sm:px-10 lg:px-12 overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-2xl text-center md:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#910B09] leading-tight">
                    {recruitmentT.title ||
                      "Bạn muốn trở thành một phần của đội ngũ giảng viên Cat Speak"}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed">
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
