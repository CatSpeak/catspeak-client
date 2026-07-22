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

  if (id !== prevId) {
    setPrevId(id);
    setIsIframeLoading(true);
    setShowOverlay(true);
  }

  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    data: website,
    isLoading,
    error,
  } = useGetWebsiteByIdQuery(id, { skip: !id });

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
    return (
      <div className="flex h-[calc(100dvh-64px)] lg:h-full flex-col items-center justify-center">
        <h5 className="mb-4 text-2xl font-bold">
          {t.website?.error?.notFound}
        </h5>
        <button
          onClick={() => navigate(`/${lang}/cat-speak/websites`)}
          className="rounded-full border border-white px-6 py-2 text-sm font-medium text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          {t.website?.error?.backToWebsites}
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full px-4 lg:h-full">
      {/* Container chứa iframe - chịu trách nhiệm bo góc, border và shadow */}
      <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-slate-200/80 shadow-md">
        {/* Overlay loading / button */}
        {(isIframeLoading || showOverlay) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/80">
            {isIframeLoading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
            ) : (
              <button
                onClick={() => setShowOverlay(false)}
                className="rounded-lg bg-white px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-100 active:bg-red-200"
              >
                Connect
              </button>
            )}
          </div>
        )}

        {/* Thẻ iframe sạch sẽ */}
        <iframe
          src={website.url}
          title={website.label}
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
          onLoad={() => setIsIframeLoading(false)}
        />
      </div>
    </div>
  );
};

export default WebsitePage;
