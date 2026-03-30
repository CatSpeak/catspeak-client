import React, { useState } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import TextInput from "@/shared/components/ui/inputs/TextInput.jsx"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const ContactSection = () => {
  const { t } = useLanguage()
  const footerText = t.footer
  const [showDevModal, setShowDevModal] = useState(false)

  return (
    <>
      {/* 
      <div className="flex-1 w-full flex flex-col items-center lg:items-end">
        <h2 className="font-normal uppercase text-center w-full max-w-md mb-4 text-base">
          {footerText.contactUs}
        </h2>

        <div className="w-full max-w-md">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <TextInput
                type="email"
                placeholder={footerText.emailPlaceholder}
                containerClassName="flex-1"
                className="!text-[16px]"
              />
              <TextInput
                placeholder={footerText.namePlaceholder}
                containerClassName="flex-1"
                className="!text-[16px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <TextInput
                placeholder={footerText.contactPlaceholder}
                containerClassName="flex-1"
                className="!text-[16px]"
              />
              <button
                type="button"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-300 text-[#bc1e46] shadow-lg transition hover:bg-yellow-400 hover:shadow-xl"
                aria-label={footerText.sendContact}
                onClick={() => setShowDevModal(true)}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <InDevelopmentModal
              open={showDevModal}
              onCancel={() => setShowDevModal(false)}
            />
          </form>

          <div className="mt-4 flex items-center text-sm text-white/90">
            <div className="flex-1 text-center sm:text-left italic text-white/90">
              <span className="font-bold text-base">Cat Speak </span>
              <span className="text-sm">{footerText.contactMessage}</span>
            </div>
          </div>
        </div>
      </div>
      */}
    </>
  )
}

export default ContactSection
