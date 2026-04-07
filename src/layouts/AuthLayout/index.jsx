import React from "react"
import { MainLogo } from "@/shared/assets/icons/logo"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <>
      <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
        {/* Left side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative bg-gradient-to-br from-cath-red-900 via-cath-red-700 to-cath-orange-500 text-white p-12 h-full">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={MainLogo}
              alt="Cat Speak Logo"
              className="w-48 mb-8 drop-shadow-2xl"
            />
            <h1 className="text-5xl font-black mb-6 tracking-tight">
              {title || "Welcome"}
            </h1>
            <p className="text-lg opacity-90 max-w-md font-medium leading-relaxed">
              {subtitle || "Connect with cat lovers around the world."}
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative bg-white h-screen overflow-y-auto">
          {/* Language Switcher - Sticky Header */}
          <div className="sticky top-0 right-0 z-50 flex justify-end p-6 bg-white/80 backdrop-blur-sm">
            <LanguageSwitcher />
          </div>

          <div className="flex-1 flex flex-col items-center p-6 sm:p-12 lg:p-12 xl:p-24 pt-0">
            <div className="w-full max-w-xl space-y-8">{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout
