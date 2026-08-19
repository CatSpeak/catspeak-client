import React, { useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetHonoredInstructorsQuery } from "@/store/api/instructorApi"
import InstructorCard from "./InstructorCard"
import InstructorSkeletonCard from "./InstructorSkeletonCard"

const LeadingTeamSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

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

    // Authenticated user
    if (role === "Teacher") {
      navigate("/workspace/courses")
    } else {
      navigate("/setting/instructor")
    }
  }

  const handleExploreCourses = () => {
    navigate("/explore-courses")
  }

  const sectionT = t?.landing?.leadingTeam || {}
  const recruitmentT = sectionT.recruitment || {}

  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            {sectionT.title || "Đội ngũ Dẫn dắt và Đồng hành"}
          </h2>
          <p className="text-xl font-bold text-[#910B09] mt-2">
            {sectionT.subtitle || "Chất lượng cao"}
          </p>
        </div>

        {/* Carousel Container with navigation arrows */}
        <div
          className={`relative ${
            isFewInstructors ? "px-2 sm:px-4" : "px-14 sm:px-16"
          }`}
        >
          {/* Navigation buttons - only shown if more than 4 instructors */}
          {!isFewInstructors && instructors.length > 0 && (
            <>
              <button
                onClick={() => handleScroll("left")}
                className="absolute left-0 top-[140px] sm:top-[160px] -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#910B09] bg-white text-[#910B09] flex items-center justify-center hover:bg-[#910B09] hover:text-white transition-colors cursor-pointer shadow-sm"
                aria-label={sectionT.prevInstructor || "Previous instructor"}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => handleScroll("right")}
                className="absolute right-0 top-[140px] sm:top-[160px] -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#910B09] bg-white text-[#910B09] flex items-center justify-center hover:bg-[#910B09] hover:text-white transition-colors cursor-pointer shadow-sm"
                aria-label={sectionT.nextInstructor || "Next instructor"}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Cards Scroll View with gap-4 sm:gap-6 */}
          <div
            ref={scrollRef}
            className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth py-2 px-2 ${
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
                  key={teacher.accountId || teacher.rank || index}
                  teacher={teacher}
                  index={index}
                  onExplore={handleExploreCourses}
                />
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm w-full">
                {sectionT.emptyText || "Chưa có danh sách giảng viên nổi bật."}
              </div>
            )}
          </div>
        </div>

        {/* Teacher Recruitment Banner */}
        <div className="mt-16 relative bg-[#FFF0F2] rounded-xl p-8 sm:p-10 lg:p-12 overflow-hidden border border-rose-100">
          {/* Top Decorative Sparkles */}
          <div className="absolute top-4 left-6 text-[#910B09] opacity-80 animate-pulse">
            <Sparkles size={28} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#910B09] leading-tight">
                {recruitmentT.title || "Bạn muốn trở thành một phần của Đội ngũ CatSpeak?"}
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
                {isAuthenticated && role === "Teacher"
                  ? recruitmentT.instructorArea || "Khu vực Giảng viên"
                  : recruitmentT.registerInstructor || "Đăng ký trở thành Giảng viên"}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LeadingTeamSection
