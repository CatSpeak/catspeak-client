import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetCurriculumByClassQuery, useGetStudentClassDetailQuery, useGetStudentCurriculumByClassQuery } from '@/store/api/coursesApi'
import { useGetUserProfileQuery } from '@/store/api/userApi'
import { ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { useLanguage } from "@/shared/context/LanguageContext"

const LinkYoutubePage = () => {
  const { id: classId, itemId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const dict = t.courses.lectureHall

  // Robust role check using accountId
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = profile.accountId?.toString() || ""

  const { data: detailResponse } = useGetStudentClassDetailQuery(classId, { skip: !classId })
  const classData = detailResponse?.data || detailResponse || {}

  const isOwner = currentUserId && (
    classData.instructorId?.toString() === currentUserId ||
    classData.instructor?.id?.toString() === currentUserId ||
    classData.teacherId?.toString() === currentUserId
  )
  const isStudent = !isOwner
  const basePath = `/workspace/${isStudent ? 'learning' : 'courses'}`

  const { data: teacherCurriculum, isLoading: teacherLoading } = useGetCurriculumByClassQuery(classId, { skip: !classId || isStudent })
  const { data: studentCurriculum, isLoading: studentLoading } = useGetStudentCurriculumByClassQuery(classId, { skip: !classId || !isStudent })

  const curriculum = isStudent ? studentCurriculum : teacherCurriculum
  const isLoading = isStudent ? studentLoading : teacherLoading

  const linkItem = useMemo(() => {
    if (!curriculum) return null
    for (const section of curriculum) {
      if (section.items) {
        const item = section.items.find(i => String(i.itemId) === String(itemId) && (i.itemType === 'Link' || i.type === 'link'))
        if (item) return item.link || { url: item.meta, title: item.title }
      }
    }
    return null
  }, [curriculum, itemId])

  const youtubeId = useMemo(() => {
    if (!linkItem?.url) return null
    let result = null
    try {
      const url = new URL(linkItem.url.trim())
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.includes("/watch")) result = url.searchParams.get("v")
        else if (url.pathname.startsWith("/embed/")) result = url.pathname.split("/")[2]
        else if (url.pathname.startsWith("/v/")) result = url.pathname.split("/")[2]
      } else if (url.hostname.includes("youtu.be")) {
        result = url.pathname.slice(1)
      }
    } catch {
      result = null
    }

    // Fallback if URL API didn't find anything
    if (!result) {
      const match = linkItem.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
      result = match ? match[1] : null
    }

    return result
  }, [linkItem])


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingSpinner text={dict.loading} />
      </div>
    )
  }

  if (!linkItem) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <button onClick={() => navigate(`${basePath}/class/${classId}?tab=lecture-hall`)} className="flex items-center gap-2 text-[#5B403C] hover:text-[#D94C38] transition-colors mb-6 font-medium">
          <ArrowLeft size={16} />
          <span>{dict.postDetail.back}</span>
        </button>
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          {dict.linkPage.notFound}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 w-full min-w-7xl mx-auto space-y-8">
        {/* ── Breadcrumb & Nút quay lại ── */}
        <div className="flex flex-col gap-4">
          <Breadcrumb
            className="text-[#7B7979] text-sm"
            items={[
              { label: dict.postDetail.breadcrumbs.home, onClick: () => navigate("/workspace") },
              { label: isStudent ? dict.postDetail.breadcrumbs.myLearning : dict.postDetail.breadcrumbs.myCourses, onClick: () => navigate(basePath) },
              { label: dict.postDetail.breadcrumbs.allCourses, onClick: () => navigate(basePath) },
              { label: dict.postDetail.breadcrumbs.courseDetail, onClick: () => navigate(`${basePath}/details/${classData?.courseId || ''}`) },
              { label: dict.postDetail.breadcrumbs.classDetail, onClick: () => navigate(`${basePath}/class/${classId}?tab=lecture-hall`) },
              { label: dict.curriculum.link, active: true },
            ]}
          />

          {/* <div
            className="inline-flex items-center gap-2 text-sm text-[#5B403C] hover:text-[#D94C38] cursor-pointer transition-colors w-fit font-medium"
            onClick={() => navigate(`${basePath}/class/${classId}?tab=lecture-hall`)}
          >
            <ArrowLeft size={16} /> {dict.postDetail.back}
          </div> */}
        </div>

        <div className="flex justify-center items-center">
          {youtubeId ? (
            <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-md">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                title={linkItem.title || dict.linkPage.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-12 text-center text-[#5B403C] w-full border border-dashed border-[#E2E2E2] rounded-xl bg-white">
              {dict.linkPage.invalidYoutube}
              <br />
              <a href={linkItem.url} target="_blank" rel="noopener noreferrer" className="text-[#D94C38] hover:underline mt-2 inline-block font-medium">
                {dict.linkPage.openInNewTab}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinkYoutubePage
