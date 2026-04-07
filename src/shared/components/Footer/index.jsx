import React from "react"

import { Tower, Mountain, FooterBG } from "@/shared/assets/images/home/footer"
import { IconLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

import { Facebook } from "lucide-react"
import { SiZalo } from "react-icons/si"

import CommunitySection from "./CommunitySection"

import ContactSection from "./ContactSection"
import FooterBottom from "./FooterBottom"

const Footer = () => {
  const { t } = useLanguage()
  const footerText = t.footer

  const languages = [
    footerText.languages.vietnamese,
    footerText.languages.english,
    footerText.languages.chinese,
  ]

  return (
    <footer className="relative overflow-hidden bg-white pt-24">
      {/* Title */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="uppercase text-black font-black tracking-[0.2em] text-center text-4xl"
        >
          {footerText.title}
        </div>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cath-red-600 to-orange-400 rounded-full" />
      </div>

      {/* Tower & Mountain images */}
      <img
        src={Tower}
        alt="Tower"
        className="hidden lg:block absolute bottom-0 left-0 z-0 w-[1100px]"
      />

      <img
        src={Mountain}
        alt="Mountain"
        className="hidden lg:block absolute bottom-0 right-0 z-0 w-[350px]"
      />

      {/* Content Area */}
      <div className="relative flex w-full justify-center px-4 lg:px-8 pt-6 lg:pt-12 pb-4">
        {/* Mobile: Gradient BG, Desktop: Transparent (uses FooterBG image inside) */}
        <div className="relative w-full max-w-screen-xl min-h-0 lg:aspect-[1788/434] justify-center flex flex-col lg:block bg-gradient-to-b from-cath-red-500 via-cath-red-700 to-[#f08d1d] lg:from-transparent lg:to-transparent rounded-[32px] lg:rounded-none p-6 lg:p-0">
          {/* Background FooterBG - Desktop Only */}
          <div
            className="hidden lg:block absolute inset-0 bg-cover bg-center lg:bg-contain bg-no-repeat z-10"
            style={{ backgroundImage: `url(${FooterBG})` }}
          />

          {/* Social Icons - Top Right Overlapping on Desktop, Centered on Mobile */}
          <div className="relative z-30 flex justify-center lg:absolute lg:-top-7 lg:right-[10%] mb-8 lg:mb-0 gap-6 mt-[-28px] lg:mt-0">
            <a
              href="https://www.facebook.com/share/1DzTNUSEAN/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
            >
              <Facebook size={32} />
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

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 z-20 h-full p-6 pb-16 lg:p-0">
            {/* Logo - Hidden on mobile or centered? Let's hide on mobile to save space or stack it up */}
            <div className="hidden lg:block col-span-1 w-full pb-4 pr-4">
              <img src={IconLogo} alt="logo" className="w-full" />
            </div>

            <div className="flex flex-col justify-between w-full lg:col-span-11 gap-8 lg:gap-4">
              <div className="w-full flex flex-col lg:flex-row justify-around gap-8 lg:gap-1 px-0 lg:px-8 text-white pt-4 lg:pt-10">
                <CommunitySection languages={languages} />
                {/* <ContactSection /> */}
              </div>

              {/* Bottom policy links and copyright */}
              <div className="mt-8 lg:mt-0">
                <FooterBottom />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
