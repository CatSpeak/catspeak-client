import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useGetWebsiteByIdQuery } from "@/features/websites/api/websiteApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";
import EmptyState from "@/shared/components/ui/indicators/EmptyState";

const WebsitePage = () => {
  const { lang, id } = useParams();
  const { resolvePath, currentLang } = useActiveLink();
  const [showOverlay, setShowOverlay] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const targetLang = lang || currentLang || "zh";

  const [prevParams, setPrevParams] = useState({ lang: targetLang, id });
  if (prevParams.lang !== targetLang || prevParams.id !== id) {
    setPrevParams({ lang: targetLang, id });
    setIsIframeLoading(true);
    setShowOverlay(true);
    setHasTimedOut(false);
    setIframeKey(0);
  }

  const { t } = useLanguage();

  const {
    data: website,
    isLoading,
    error,
  } = useGetWebsiteByIdQuery({ lang: targetLang, id }, { skip: !id });

  useEffect(() => {
    if (!isIframeLoading) return;

    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isIframeLoading, iframeKey, id, lang]);

  const handleReload = () => {
    setHasTimedOut(false);
    setIsIframeLoading(true);
    setShowOverlay(true);
    setIframeKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-64px)] lg:h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cath-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !website) {
    return <EmptyState message={t.websites?.detail?.error?.notFound || t.website?.error?.notFound || "No website found"} />;
  }

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full px-4 lg:h-full flex flex-col gap-2 pb-4">
      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-border shadow-sm shrink-0">
        <Link
          to={resolvePath("/resources")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-cath-red-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t.websites?.detail?.backToHub || "Back to Resource Hub"}</span>
        </Link>

        {website.url && (
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>{t.websites?.detail?.openExternally || "Open externally"}</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Container chứa iframe */}
      <div className="relative flex-1 w-full overflow-hidden rounded-xl border-2 border-border/80 shadow-md">
        {/* Overlay loading / button */}
        {(isIframeLoading || showOverlay) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/80">
            {isIframeLoading ? (
              hasTimedOut ? (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <p className="text-lg font-medium text-white">
                    {t.websites?.detail?.error?.timeout || t.website?.error?.timeout || "Loading taking longer than expected..."}
                  </p>
                  <button
                    onClick={handleReload}
                    className="rounded-lg bg-white px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-100 active:bg-red-200"
                  >
                    {t.websites?.detail?.error?.reload || t.website?.error?.reload || "Reload"}
                  </button>
                </div>
              ) : (
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
              )
            ) : (
              <button
                onClick={() => setShowOverlay(false)}
                className="rounded-lg bg-white px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-100 active:bg-red-200"
              >
                {t.websites?.detail?.connect || t.website?.connect || "Connect"}
              </button>
            )}
          </div>
        )}

        {/* Thẻ iframe */}
        <iframe
          key={iframeKey}
          src={website.url}
          title={website.label || id}
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
          onLoad={() => {
            setIsIframeLoading(false);
            setHasTimedOut(false);
          }}
        />
      </div>
    </div>
  );
};

export default WebsitePage;
