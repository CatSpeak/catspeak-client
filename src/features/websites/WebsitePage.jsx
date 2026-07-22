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

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cath-red-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h5 className="mb-4 text-2xl font-bold">
          {t.website?.error?.notFound}
        </h5>
        <button
          onClick={() => navigate(`/${lang}/cat-speak/websites`)}
          className="rounded-full border border-cath-red-700 px-6 py-2 text-sm font-medium text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          {t.website?.error?.backToWebsites}
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-sm transition-colors hover:bg-slate-900/90 focus:outline-none shadow-md"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {(isIframeLoading || showOverlay) && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-slate-800/80 bg-opacity-80">
          {isIframeLoading ? (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cath-red-700 border-t-transparent" />
          ) : (
            <button
              onClick={() => setShowOverlay(false)}
              className="rounded-lg bg-red-100 px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-200 active:bg-red-200"
            >
              Connect
            </button>
          )}
        </div>
      )}
      <iframe
        src={website.url}
        title={website.label}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        onLoad={() => setIsIframeLoading(false)}
      />
    </div>
  );
};

export default WebsitePage;
