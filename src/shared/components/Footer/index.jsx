import React from "react"
import CommunitySection from "./CommunitySection"
import ContactSection from "./ContactSection"
import FooterBottom from "./FooterBottom"

const Footer = () => {
  return (
    <footer className="bg-cath-red-700 text-white">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <CommunitySection />
          <ContactSection />
        </div>

        <div className="mt-10 lg:mt-14">
          <FooterBottom />
        </div>
      </div>
    </footer>
  )
}

export default Footer
