import React from "react"
import {
  Calendar,
  Monitor,
  Link as LinkIcon,
  Globe,
  MessageCircle,
  Mail,
  CheckCircle2
} from "lucide-react"
import LogoDefault from "@/shared/assets/images/LogoDefault.png"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const EnglishWorkshopModal = ({ open, onClose, t }) => {
  const workshop = t.workshops.englishWorkshop

  if (!workshop) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workshop.title}
      className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl flex flex-col max-sm:h-[100dvh] max-sm:max-h-screen sm:max-h-[90vh] max-sm:rounded-none max-sm:border-0"
      headerClassName="flex items-center justify-between p-4 border-b border-border dark:border-[#3F3F3F]"
      bodyClassName={scrollbarClasses}
      footer={
        <div className="w-full">
          <PillButton onClick={onClose} variant="primary" className="w-full">
            {workshop.closeButton}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Cover Image */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden rounded-xl sm:h-64">
          <img
            src={LogoDefault}
            alt="English Workshop"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-8 text-[15px] sm:text-base leading-relaxed text-gray-800 dark:text-gray-200">
          {/* Intro Section */}
          <div className="space-y-5">
            <p className="text-gray-700 dark:text-gray-300">{workshop.introText1}</p>
            <div className="pl-4 border-l-2 border-[#990011]/30 dark:border-[#FF6B6B]/40 font-medium text-gray-800 dark:text-gray-200 space-y-1">
              <p>{workshop.question1}</p>
              <p>{workshop.question2}</p>
            </div>

            <p className="text-gray-700 dark:text-gray-300">
              {workshop.speakerIntro1}
              <span className="font-bold text-[#990011] dark:text-[#FF6B6B]">
                {workshop.speakerName}
              </span>
              {workshop.speakerIntro2}
            </p>

            <ul className="space-y-2.5 pl-1 font-medium text-gray-800 dark:text-gray-200">
              {(workshop.speakerTitles || []).map((title, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#990011] dark:text-[#FF6B6B] shrink-0 mt-0.5" />
                  <span>{title}</span>
                </li>
              ))}
            </ul>

            <p className="text-gray-700 dark:text-gray-300 pt-2">{workshop.sharingIntro}</p>

            <ul className="space-y-2.5 pl-1">
              {(workshop.sharingPoints || []).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#990011]/60 dark:bg-[#FF6B6B]/80 shrink-0 mt-2.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="italic text-gray-700 dark:text-gray-300 border-l-2 border-[#990011] dark:border-[#FF6B6B] pl-4 py-1">
            <p>{workshop.notTipsText}</p>
            <p className="mt-2">{workshop.beyondText}</p>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-medium bg-gray-50/80 dark:bg-[#272727] p-5 rounded-xl border border-border dark:border-[#3F3F3F]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-border dark:border-[#3F3F3F] shrink-0">
                <Calendar className="w-5 h-5 text-[#990011] dark:text-[#FF6B6B]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{workshop.timeLabel}</p>
                <p className="text-gray-900 dark:text-white">{workshop.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm border border-border dark:border-[#3F3F3F] shrink-0">
                <Monitor className="w-5 h-5 text-[#990011] dark:text-[#FF6B6B]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{workshop.formatLabel}</p>
                <p className="text-gray-900 dark:text-white">{workshop.format}</p>
              </div>
            </div>
          </div>

          {/* Registration Links */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100/60 dark:border-blue-900/40 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-blue-900 dark:text-blue-200 font-semibold flex items-center gap-2.5 text-[15px]">
                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {workshop.registerLinkLabel?.replace("📝", "").trim() || workshop.registerLinkLabel}
              </span>
              <a
                href={workshop.registerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all hover:shadow-md text-center whitespace-nowrap"
              >
                {workshop.registerLinkText}
              </a>
            </div>
          </div>

          {/* Social Section */}
          <div className="pt-2">
            <p className="font-semibold text-gray-900 dark:text-white mb-4 whitespace-pre-line text-center">
              {workshop.followPrompt}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workshop.websiteLabel && (
                <a
                  href={workshop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border dark:border-[#3F3F3F] hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors group"
                >
                  <div className="p-2.5 bg-gray-50 dark:bg-[#272727] rounded-full group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/40 transition-colors">
                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {workshop.websiteLabel?.replace("🌐", "").trim() || workshop.websiteLabel}
                  </p>
                </a>
              )}

              <a
                href={workshop.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border dark:border-[#3F3F3F] hover:border-[#0068ff]/30 dark:hover:border-[#0068ff]/40 hover:bg-[#0068ff]/5 dark:hover:bg-[#0068ff]/10 transition-colors group"
              >
                <div className="p-2.5 bg-gray-50 dark:bg-[#272727] rounded-full group-hover:bg-[#0068ff]/10 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[#0068ff]" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm text-center">
                  {workshop.zaloGroupName?.replace("👉", "").trim() || workshop.zaloGroupName}
                </p>
              </a>

              <a
                href={`mailto:${workshop.email}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border dark:border-[#3F3F3F] hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors group sm:col-span-2 lg:col-span-1"
              >
                <div className="p-2.5 bg-gray-50 dark:bg-[#272727] rounded-full group-hover:bg-red-100/50 dark:group-hover:bg-red-950/40 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[#990011] dark:group-hover:text-[#FF6B6B]" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {workshop.inboxPrompt?.replace("📩", "").trim() || workshop.inboxPrompt}
                </p>
              </a>
            </div>
          </div>

          <div className="pt-4 pb-2 border-t border-border dark:border-[#3F3F3F]">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-center text-lg">
              {workshop.closing}
            </p>
          </div>

          {/* Hashtags */}
          <div className="bg-gray-50/80 dark:bg-[#272727] rounded-xl p-4 border border-border dark:border-[#3F3F3F]">
            <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400 text-center">
              {workshop.hashtags}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EnglishWorkshopModal
