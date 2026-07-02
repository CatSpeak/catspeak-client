import React from "react"
import {
  Clock,
  MapPin,
  Link as LinkIcon,
  MessageCircle,
  Mail,
  CheckCircle2
} from "lucide-react"
import LogoDefault from "@/shared/assets/images/LogoDefault.png"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const ChinaWorkshopModal = ({ open, onClose, t }) => {
  const workshop = t.workshops.chinaWorkshop

  if (!workshop) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workshop.title}
      className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl flex flex-col max-sm:h-[100dvh] max-sm:max-h-screen sm:max-h-[90vh] max-sm:rounded-none max-sm:border-0"
      headerClassName="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100"
      bodyClassName={`p-4 sm:p-6 flex-1 overflow-y-auto ${scrollbarClasses}`}
      footer={
        <div className="w-full sm:px-2">
          <PillButton
            onClick={onClose}
            className="w-full !text-base bg-[#990011] text-white hover:bg-[#7a000d] border border-transparent"
          >
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
            alt="Cat Speak Logo"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-8 text-[15px] sm:text-base leading-relaxed text-gray-800">
          {/* Intro Section */}
          <div className="space-y-5">
            <p className="text-gray-700">
              {workshop.introText}{" "}
              <span className="text-[#990011] font-bold">
                {workshop.introHighlight}
              </span>{" "}
              {workshop.introClosing}
            </p>
            <ul className="space-y-2.5 pl-1">
              {(workshop.bulletPoints || []).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#990011] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Workshop Title */}
          <div className="py-3 px-4 bg-gray-50/80 rounded-xl border border-gray-100">
            <p className="m-0 text-gray-800 font-medium">
              {workshop.workshopTitlePrefix}{" "}
              <span className="text-[#990011] font-bold">
                {workshop.workshopTitle}
              </span>
            </p>
          </div>

          <p className="text-gray-700">
            {workshop.descriptionText}{" "}
            <span className="text-[#990011] font-bold">
              {workshop.descriptionHighlight}
            </span>
            {workshop.descriptionClosing}
          </p>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-medium bg-gray-50/80 p-5 rounded-xl border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                <Clock className="w-5 h-5 text-[#990011]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{workshop.timeLabel}</p>
                <p className="text-gray-900">{workshop.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                <MapPin className="w-5 h-5 text-[#990011]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{workshop.locationLabel}</p>
                <p className="text-gray-900">{workshop.location}</p>
              </div>
            </div>
          </div>

          {/* Registration Links */}
          <div className="space-y-4">
            <p className="font-bold italic text-[#990011] text-center">
              {workshop.joinLinkNote}
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/60 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-blue-900 font-semibold flex items-center gap-2.5 text-[15px]">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  {workshop.registerLinkLabel}
                </span>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSflanRsWpM4EbY8ICXXHZ5Qms0X1lF2g4MR4ox_eY-W9eUHig/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all hover:shadow-md text-center whitespace-nowrap"
                >
                  {workshop.registerLinkText}
                </a>
              </div>
            </div>
          </div>

          {/* Social Section */}
          <div className="pt-2">
            <p className="font-semibold text-gray-900 mb-4 whitespace-pre-line text-center">
              {workshop.followPrompt}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={workshop.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#0068ff]/20 hover:bg-[#0068ff]/5 transition-colors group"
              >
                <div className="p-2.5 bg-gray-50 rounded-full group-hover:bg-[#0068ff]/10 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-[#0068ff]" />
                </div>
                <p className="font-semibold text-gray-900 text-sm text-center">
                  {workshop.zaloGroupName?.replace("👉", "").trim() || workshop.zaloGroupName}
                </p>
              </a>

              <a
                href={`mailto:${workshop.email}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-colors group"
              >
                <div className="p-2.5 bg-gray-50 rounded-full group-hover:bg-red-100/50 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600 group-hover:text-[#990011]" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {workshop.inboxPrompt?.replace("📩", "").trim() || workshop.inboxPrompt}
                </p>
              </a>
            </div>
          </div>

          <div className="pt-4 pb-2 border-t border-gray-100">
            <p className="font-bold text-gray-800 text-center text-lg italic">
              {workshop.closing}
            </p>
          </div>

          {/* Hashtags */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium leading-relaxed text-gray-500 text-center">
              {workshop.hashtags}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ChinaWorkshopModal
