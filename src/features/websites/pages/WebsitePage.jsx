import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react"
import { useGetWebsiteByIdQuery } from "@/features/websites/api/websiteApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { getSafeExternalHttpUrl } from "@/shared/utils/safeUrl"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"

const WebsitePage = () => {
  const { lang, id } = useParams()
  const { resolvePath, currentLang } = useActiveLink()
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const targetLang = lang || currentLang || "zh"

  const [prevParams, setPrevParams] = useState({ lang: targetLang, id })
  if (prevParams.lang !== targetLang || prevParams.id !== id) {
    setPrevParams({ lang: targetLang, id })
    setIsIframeLoading(true)
    setHasTimedOut(false)
    setIframeKey(0)
  }

  const { t } = useLanguage()

  const {
    data: website,
    isLoading,
    error,
  } = useGetWebsiteByIdQuery({ lang: targetLang, id }, { skip: !id })

  useEffect(() => {
    if (!isIframeLoading) return

    const timer = setTimeout(() => {
      setHasTimedOut(true)
    }, 8000)

    return () => clearTimeout(timer)
  }, [isIframeLoading, iframeKey, id, lang])

  const handleReload = () => {
    setHasTimedOut(false)
    setIsIframeLoading(true)
    setIframeKey((prev) => prev + 1)
  }

  const safeUrl = getSafeExternalHttpUrl(website?.url)

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-64px)] lg:h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cath-red-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !website) {
    return (
      <EmptyState
        message={
          t.websites?.detail?.error?.notFound ||
          t.website?.error?.notFound ||
          "No website found"
        }
      />
    )
  }

  const openExternallyLabel =
    t.websites?.detail?.openExternally || "Open externally"
  const isEmbeddable = website.embeddable === true && Boolean(safeUrl)

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full px-4 lg:h-full flex flex-col gap-2 pb-4">
      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-xl border border-border dark:border-[#3F3F3F] shadow-sm shrink-0">
        <Link
          to={resolvePath("/resources")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:text-cath-red-700 dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t.websites?.detail?.backToHub || "Back to Resource Hub"}</span>
        </Link>

        {safeUrl && (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors"
          >
            <span>{openExternallyLabel}</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {!isEmbeddable ? (
        <div className="flex flex-1 w-full items-center justify-center rounded-xl border-2 border-border/80 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-md">
          <div className="flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {website.label || id}
            </h1>
            <p className="text-sm text-slate-500 dark:text-neutral-400">
              {safeUrl
                ? t.websites?.detail?.notEmbeddable ||
                  "Trang này không cho phép nhúng trực tiếp trong CatSpeak. Hãy mở ở cửa sổ mới để sử dụng đầy đủ."
                : t.websites?.detail?.invalidUrl ||
                  "Đường dẫn của trang này không hợp lệ."}
            </p>
            {safeUrl && (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#990011] dark:bg-cath-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95"
              >
                <span>{t.websites?.detail?.openNewWindow || "Mở ở cửa sổ mới"}</span>
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex-1 w-full overflow-hidden rounded-xl border-2 border-border/80 dark:border-[#3F3F3F] shadow-md">
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 dark:bg-black/80">
              {hasTimedOut ? (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <p className="text-lg font-medium text-white">
                    {t.websites?.detail?.error?.timeout ||
                      t.website?.error?.timeout ||
                      "Loading taking longer than expected..."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleReload}
                      className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-md transition-colors hover:bg-slate-100 dark:bg-[#2A2A2A] dark:text-neutral-100 dark:hover:bg-[#3A3A3A]"
                    >
                      {t.websites?.detail?.error?.reload ||
                        t.website?.error?.reload ||
                        "Reload"}
                    </button>
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#990011] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-95"
                    >
                      <span>{openExternallyLabel}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
              )}
            </div>
          )}

          <iframe
            key={iframeKey}
            src={safeUrl}
            title={website.label || id}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            allow="fullscreen; autoplay; microphone"
            allowFullScreen
            onLoad={() => {
              setIsIframeLoading(false)
              setHasTimedOut(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default WebsitePage
