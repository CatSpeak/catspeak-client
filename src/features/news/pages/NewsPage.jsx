import React, { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import { Breadcrumb } from "@/shared/components/ui/navigation"
import NewsCard from "../components/NewsCard"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/* ------------------------------------------------------------------ */
/*  Filter Tabs                                                        */
/* ------------------------------------------------------------------ */

const FILTER_TABS = [{ key: "all", label: "Tất cả" }]

const FilterTabs = ({ active, onChange }) => (
  <div className="flex items-center gap-3">
    {FILTER_TABS.map((tab) => {
      const isActive = active === tab.key
      return (
        <PillButton
          key={tab.key}
          onClick={() => onChange(tab.key)}
          variant={isActive ? "primary" : "secondary"}
        >
          {tab.label}
        </PillButton>
      )
    })}
  </div>
)

/* ------------------------------------------------------------------ */
/*  Responsive column count                                            */
/* ------------------------------------------------------------------ */

const useColumnCount = () => {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1280) setCols(4)
      else if (w >= 768) setCols(3)
      else if (w >= 480) setCols(2)
      else setCols(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return cols
}

/* ------------------------------------------------------------------ */
/*  NewsPage                                                           */
/* ------------------------------------------------------------------ */

const NewsPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const currentLang = lang || "vi"

  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState("all")
  const pageSize = 26

  const { data, error } = useGetPostsQuery({
    page,
    pageSize,
  })

  // Only public posts
  const publicPosts = useMemo(() => {
    return data?.data?.filter((post) => post.privacy === "Public") || []
  }, [data?.data])

  // console.log(publicPosts);

  const columnsCount = useColumnCount()

  // Distribute posts into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => [])
    publicPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post)
    })
    return colsArray
  }, [publicPosts, columnsCount])

  // Infinite scroll observer — trigger fetch when the second-to-last post appears
  const secondLastPostElementRef = useRef(null)
  useEffect(() => {
    if (!secondLastPostElementRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      {
        rootMargin: "200px",
      },
    )
    observer.observe(secondLastPostElementRef.current)
    return () => observer.disconnect()
  }, [publicPosts])

  // ── Error states ──────────────────────────────────────────────────
  if (error && page === 1) {
    if (error?.status === 404) return <EmptyState message="No posts found" />
    if (error?.status === 401)
      return <EmptyState message={t.catSpeak?.newsLoginPrompt} />
    return <ErrorMessage message="Error loading posts" />
  }

  // ── Breadcrumb items ──────────────────────────────────────────────
  const breadcrumbItems = [
    {
      label: "Trang chủ",
      onClick: () => navigate(`/${currentLang}/community`),
    },
    {
      label: "Cat Speak",
      onClick: () => navigate(`/${currentLang}/cat-speak/news`),
    },
    { label: "Bản tin CatSpeak" },
  ]

  const secondLastPostId =
    publicPosts[publicPosts.length - 2]?.postId ??
    publicPosts[publicPosts.length - 1]?.postId

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-6 p-4 sm:p-6">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Filter Tabs */}
      <FilterTabs active={activeFilter} onChange={setActiveFilter} />

      {/* Masonry Card Grid */}
      <div className="flex flex-row w-full gap-3 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col flex-1 gap-3 min-w-0">
            {col.map((post) => {
              const isSecondLast = post.postId === secondLastPostId
              return (
                <div
                  ref={isSecondLast ? secondLastPostElementRef : null}
                  key={post.postId}
                >
                  <NewsCard news={post} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsPage
