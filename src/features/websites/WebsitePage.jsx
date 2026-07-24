import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetWebsiteByIdQuery } from "@/store/api/websiteApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Maximize, Minimize } from "lucide-react";

const WebsitePage = () => {
  const { lang, id } = useParams();
  const [showOverlay, setShowOverlay] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [prevId, setPrevId] = useState(id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const [prevParams, setPrevParams] = useState({ lang, id });
  if (prevParams.lang !== lang || prevParams.id !== id) {
    setPrevParams({ lang, id });
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
  } = useGetWebsiteByIdQuery({ lang, id }, { skip: !id || !lang });

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-64px)] lg:h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !website) {
    return <EmptyState message="No websites found" />;
  }

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full px-4 lg:h-full">
      {/* Container chứa iframe - chịu trách nhiệm bo góc, border và shadow */}
      <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-slate-200/80 shadow-md">
        {/* Overlay loading / button */}
        {(isIframeLoading || showOverlay) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/80">
            {isIframeLoading ? (
              hasTimedOut ? (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <p className="text-lg font-medium text-white">
                    {t.website?.error?.timeout}
                  </p>
                  <button
                    onClick={handleReload}
                    className="rounded-lg bg-white px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-100 active:bg-red-200"
                  >
                    {t.website?.error?.reload}
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
                {t.website?.connect || "Connect"}
              </button>
            )}
          </div>
        )}

        {/* Thẻ iframe sạch sẽ */}
        <iframe
          key={iframeKey}
          src={website.url}
          title={website.label}
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
