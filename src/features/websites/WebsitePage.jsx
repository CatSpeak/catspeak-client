import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetWebsiteByIdQuery } from "@/store/api/websiteApi";
import { useLanguage } from "@/shared/context/LanguageContext";

const WebsitePage = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const { lang, id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    data: website,
    isLoading,
    error,
  } = useGetWebsiteByIdQuery(id, { skip: !id });

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
    <div className="relative w-full h-full">
      {showOverlay && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-slate-800/80 bg-opacity-80">
          <button
            onClick={() => setShowOverlay(false)}
            className="rounded-lg bg-red-100 px-6 py-2.5 font-medium text-slate-800 shadow-md transition-colors hover:bg-red-200 active:bg-red-200"
          >
            Connect
          </button>
        </div>
      )}
      <iframe
        src={website.url}
        title={website.label}
        className="w-full h-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
};

export default WebsitePage;
