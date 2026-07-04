import React from "react";

import { Tower, Mountain, FooterBG } from "@/shared/assets/images/home/footer";
import { IconLogo } from "@/shared/assets/icons/logo";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { LandingPageIcon } from "@/features/landing/assets";

import CommunitySection from "./CommunitySection";
import ContactSection from "./ContactSection";
import FooterBottom from "./FooterBottom";

const Footer = () => {
  const { t } = useLanguage();
  const footerText = t.footer;

  const languages = [
    footerText.languages.vietnamese,
    footerText.languages.english,
    footerText.languages.chinese,
  ];

  return (
    <footer className="relative overflow-hidden bg-white pt-10 z-50">
      <div className="block lg:hidden w-full max-w-screen-xl mx-auto px-6 pb-10">
        <ContactSection isMobile={true} />
      </div>

      {/* Title */}
      {/* <div className="flex flex-col items-center justify-center gap-3">
        <div className="uppercase text-black font-bold tracking-[0.2em] text-center text-4xl">
          {footerText.title}
        </div>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cath-red-600 to-orange-400 rounded-full" />
      </div> */}

      {/* Tower & Mountain images */}
      {/* <img
        src={Tower}
        alt="Tower"
        className="hidden lg:block absolute bottom-0 left-0 z-0 w-[1100px]"
      />

      <img
        src={Mountain}
        alt="Mountain"
        className="hidden lg:block absolute bottom-0 right-0 z-0 w-[350px]"
      /> */}

      {/* Content Area */}
      <div className="relative w-full bg-[#990011]">
        {/* Mobile: Gradient BG, Desktop: Transparent (uses FooterBG image inside) */}
        <div className="relative w-full max-w-screen-xl mx-auto min-h-0 justify-center flex flex-col lg:block p-6 lg:p-0 lg:py-10">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 z-20 h-full p-6 pb-16 lg:p-0">
            {/* Logo - Hidden on mobile or centered? Let's hide on mobile to save space or stack it up */}
            {/* <div className="hidden lg:block col-span-1 w-full pb-4 pr-4">
              <img src={IconLogo} alt="logo" className="w-full" />
            </div> */}

            <div className="flex flex-col justify-between w-full lg:col-span-12 gap-8 lg:gap-4">
              <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-start gap-0 lg:gap-8 px-0 lg:px-8 text-white pt-4 lg:pt-10">
                <div className="w-full flex flex-col">
                  <div className="w-full pb-6 lg:pb-8">
                    <img
                      src={LandingPageIcon}
                      alt="logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[84px] lg:h-[84px]"
                    />
                  </div>
                  <div className="w-full flex flex-row justify-between items-start gap-4">
                    <div className="relative z-10">
                      <CommunitySection languages={languages} />
                    </div>

                    <div className="relative z-50 lg:hidden w-1/2 pt-[2px]">
                      <FooterBottom mode="mobile-policies" />
                    </div>
                  </div>
                </div>
                <div className="w-[45%] hidden lg:block">
                  <ContactSection />
                </div>
              </div>
              {/* Bottom policy links and copyright */}
              <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 px-0 lg:px-8 text-white pt-4 lg:pt-10">
                <FooterBottom mode="desIktop-copyright" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
