import React, { useState } from "react"
import { Facebook, Send, Youtube } from "lucide-react"
import { SiZalo } from "react-icons/si"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/share/1DzTNUSEAN/",
    label: "Facebook",
    Icon: Facebook,
    isLucide: true,
  },
  {
    href: "https://www.youtube.com/@CatSpeak",
    label: "YouTube",
    Icon: Youtube,
    isLucide: true,
  },
  {
    href: "https://zalo.me/g/gffkqu214",
    label: "Zalo",
    Icon: SiZalo,
    isLucide: false,
  },
]

const footerInputClass =
  "h-10 w-full rounded-full border-0 bg-white/95 px-4 text-sm text-headingColor placeholder:text-[#9CA0AB] outline-none transition-shadow focus:ring-2 focus:ring-[#FFB400]/60"

const ContactSection = () => {
  const { t } = useLanguage()
  const footerText = t.footer
  const [showDevModal, setShowDevModal] = useState(false)

  return (
    <>
      <div className="flex w-full max-w-lg flex-col items-center gap-5 text-center lg:max-w-none lg:items-end lg:text-right">
        <h2 className="w-full text-base font-bold uppercase tracking-wide text-white sm:text-lg">
          {footerText.contactUs}
        </h2>

        <div className="flex items-center justify-center gap-4 lg:justify-end">
          {SOCIAL_LINKS.map((social) => {
            const SocialIcon = social.Icon
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-cath-red-700 shadow-md transition-colors hover:bg-[#FFB400] hover:text-cath-red-700"
              >
                {social.isLucide ? (
                  <SocialIcon size={22} strokeWidth={2} />
                ) : (
                  <SocialIcon size={24} />
                )}
              </a>
            )
          })}
        </div>

        <form
          className="flex w-full max-w-md flex-col gap-3 lg:max-w-lg"
          onSubmit={(e) => {
            e.preventDefault()
            setShowDevModal(true)
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={footerText.emailPlaceholder}
              className={footerInputClass}
            />
            <input
              type="text"
              placeholder={footerText.namePlaceholder}
              className={footerInputClass}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={footerText.contactPlaceholder}
              className={`${footerInputClass} flex-1`}
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFB400] text-cath-red-700 shadow-lg transition hover:bg-[#ffc933] hover:shadow-xl"
              aria-label={footerText.sendContact}
            >
              <Send className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </form>

        <p className="w-full max-w-md text-center text-sm italic text-white/90 lg:max-w-lg lg:text-right">
          *<span className="font-bold not-italic">Cat Speak </span>
          {footerText.contactMessage}*
        </p>
      </div>

      <InDevelopmentModal
        open={showDevModal}
        onCancel={() => setShowDevModal(false)}
      />
    </>
  )
}

export default ContactSection
