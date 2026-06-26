import React, { useState } from "react";
import { Send, Facebook, Youtube } from "lucide-react";
import { SiZalo } from "react-icons/si";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import TextInput from "@/shared/components/ui/inputs/TextInput.jsx";
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal";

const ContactSection = ({ isMobile = false }) => {
  const { t } = useLanguage();
  const footerText = t.footer;
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <>
      <div className="flex-1 w-full flex flex-col items-center lg:items-end z-30">
        <h2 className={`font-bold tracking-wide uppercase text-center w-full max-w-md text-lg mb-4 ${isMobile ? "text-[#910B09] text-2xl" : ""}`}>
          {footerText.contactUs}
        </h2>

        <div className="flex justify-center gap-6 mb-6 w-full max-w-md pl-4">
          <a
            href="https://www.facebook.com/share/1DzTNUSEAN/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <Facebook size={32} />
          </a>
          <a
            href="https://youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <Youtube size={32} />
          </a>
          <a
            href="https://zalo.me/g/gffkqu214"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <SiZalo size={32} />
          </a>
        </div>

        <div className="w-full max-w-md z-30">
          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <TextInput
                type="email"
                placeholder={footerText.emailPlaceholder}
                containerClassName="flex-1"
                className={`text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />
              <TextInput
                placeholder={footerText.namePlaceholder}
                containerClassName="flex-1"
                className={`text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />
            </div>
            <div className="flex items-center relative gap-5">
              <TextInput
                placeholder={footerText.contactPlaceholder}
                containerClassName="flex-1"
                className={`pr-12 text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />

              <button
                type="button"
                className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full transition ${
                  isMobile
                    ? "bg-[#910B09] text-[#FFE66D] hover:bg-[#7a0907]"
                    : "border border-[#FFE66D] text-[#FFE66D] hover:bg-[#b6a13a] hover:text-white"
                }`}
                aria-label={footerText.sendContact}
                onClick={() => setShowDevModal(true)}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <InDevelopmentModal
              open={showDevModal}
              onCancel={() => setShowDevModal(false)}
            />
          </form>
          <div className="mt-4 flex items-center text-sm">
            <div className={`flex-1 text-center sm:text-left ${isMobile ? "text-[#910B09]" : "text-white/90"}`}>
              <span className="font-black italic text-base">Cat Speak </span>
              <span className="text-sm italic">
                {footerText.contactMessage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSection;
