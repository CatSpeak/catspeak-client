import { useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetHonoredInstructorsQuery } from "@/store/api/instructorApi"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import InstructorCard from "./InstructorCard"
import InstructorSkeletonCard from "./InstructorSkeletonCard"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const LeadingTeamSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated, isTeacher, user } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const isTeacherUser =
    isAuthenticated &&
    (isTeacher || String(user?.accountType).toLowerCase() === "teacher")

  const { data, isLoading } = useGetHonoredInstructorsQuery({ limit: 12 })

  const instructors = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data)) return data
    return []
  }, [data])

  const isFewInstructors = instructors.length <= 4

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -270 : 270
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

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
    <section className="w-full mt-6 sm:mt-0 py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      <ScrollReveal stagger className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <ScrollItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              {sectionT.title || "Đội ngũ Dẫn dắt và Đồng hành"}
            </h2>
          </ScrollItem>
          <ScrollItem>
            <p className="text-xl font-bold text-[#910B09] mt-2">
              {sectionT.subtitle || "Chất lượng cao"}
            </p>
          </ScrollItem>
        </div>

        {/* Carousel Container with navigation arrows */}
        <ScrollItem>
          <div
            className={`relative -mx-4 sm:-mx-6 lg:mx-0 ${
              isFewInstructors ? "px-2 sm:px-4" : "px-0 lg:px-16"
            }`}
          >
            {/* Navigation buttons - only shown if more than 4 instructors (hidden on mobile and tablet < lg) */}
            {!isFewInstructors && instructors.length > 0 && (
              <>
                <IconButton
                  onClick={() => handleScroll("left")}
                  variant="cathOutline"
                  size="sm"
                  className="hidden lg:flex absolute left-0 top-[140px] sm:top-[160px] -translate-y-1/2 z-20 cursor-pointer"
                  aria-label={sectionT.prevInstructor || "Previous instructor"}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={() => handleScroll("right")}
                  variant="cathOutline"
                  size="sm"
                  className="hidden lg:flex absolute right-0 top-[140px] sm:top-[160px] -translate-y-1/2 z-20 cursor-pointer"
                  aria-label={sectionT.nextInstructor || "Next instructor"}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}

            {/* Cards Scroll View with gap-4 sm:gap-6, edge bleed padding on mobile/tablet, and snap-x */}
            <div
              ref={scrollRef}
              className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth py-2 px-4 sm:px-6 md:px-8 lg:px-2 snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-8 lg:scroll-pl-2 ${
                isFewInstructors ? "justify-center" : "justify-start"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {isLoading ? (
                <>
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
                <div className="py-8 text-center text-gray-400 text-sm w-full">
                  {sectionT.emptyText || "Chưa có danh sách giảng viên nổi bật."}
                </div>
              )}
            </div>
          </div>
        </ScrollItem>

        {/* Teacher Recruitment Banner - only shown for non-teachers */}
        {!isTeacherUser && (
          <ScrollItem>
            <div className="mt-16 relative bg-[#FFF0F2] rounded-xl p-8 sm:p-10 lg:p-12 overflow-hidden border border-rose-100">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-2xl text-center md:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#910B09] leading-tight">
                    {recruitmentT.title ||
                      "Bạn muốn trở thành một phần của Đội ngũ CatSpeak?"}
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
