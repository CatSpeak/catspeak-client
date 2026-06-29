import React from "react"
import LogoDefault from "@/shared/assets/images/LogoDefault.png"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const ScholarshipWorkshopModal = ({ open, onClose, t }) => {
  const workshop = t.workshops.scholarshipWorkshop

  if (!workshop) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workshop.title}
      className="max-w-xl sm:max-w-2xl md:max-w-3xl flex flex-col max-h-[90vh]"
      headerClassName="flex items-center justify-between p-6"
      bodyClassName={`px-6 flex-1 overflow-y-auto ${scrollbarClasses}`}
      footer={
        <PillButton
          onClick={onClose}
          bgColor="#f5c518"
          textColor="#990011"
          className="w-full !text-base"
        >
          {workshop.closeButton}
        </PillButton>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Cover Image */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden rounded-xl sm:h-64">
          <img
            src={LogoDefault}
            alt="Cat Speak Workshop"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6 text-base leading-relaxed text-gray-800">
          {/* Intro Section */}
          <div className="space-y-4">
            <p>{workshop.introText}</p>
            <p className="font-bold text-[#b91c1c]">
              {workshop.contentLabel}
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              {(workshop.bulletPoints || []).map((point, idx) => (
                <li key={idx}>
                  <span className="ml-1">✨ {point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
             <p className="font-bold text-[#b91c1c]">{workshop.specialGiftsIntro}</p>
             <ul className="list-inside list-disc space-y-1 pl-4">
              {(workshop.specialGifts || []).map((point, idx) => (
                <li key={idx}>
                  <span className="ml-1">🎁 {point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
             <p className="font-bold text-lg">
                {workshop.speakerLabel} <span className="text-[#b91c1c]">{workshop.speakerName}</span>
             </p>
             <ul className="list-inside list-disc space-y-1 pl-4">
              {(workshop.speakerTitles || []).map((point, idx) => (
                <li key={idx}>
                  <span className="ml-1">🔹 {point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Section */}
          <div className="space-y-3 font-medium bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-start gap-2">
              <span className="text-lg">⏰</span>
              <p>
                <span className="font-bold text-[#b91c1c]">
                  {workshop.timeLabel}
                </span>{" "}
                {workshop.time}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💻</span>
              <p>
                <span className="font-bold text-[#b91c1c]">
                  {workshop.formatLabel}
                </span>{" "}
                {workshop.format}
              </p>
            </div>
          </div>

          {/* Registration Links */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="font-bold flex items-center gap-2 flex-wrap">
                <span className="text-blue-800">
                  {workshop.registerLinkLabel}
                </span>
                <a
                  href={workshop.registerLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-700 transition-colors"
                >
                  {workshop.registerLinkText}
                </a>
              </div>
            </div>
          </div>

          <div className="my-4 h-[1px] w-full bg-gray-200" />

          {/* Social Section */}
          <div className="space-y-4">
            <p className="font-medium whitespace-pre-wrap">{workshop.followPrompt}</p>

            <div className="space-y-3">
              {workshop.websiteLabel && (
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <p className="font-bold text-gray-800">
                    {workshop.websiteLabel?.replace("🌐", "").trim()}
                  </p>
                  <a
                    href={workshop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 break-all"
                  >
                    {workshop.website}
                  </a>
                </div>
              )}

              <div>
                <p className="font-bold text-[#b91c1c] flex items-center gap-2">
                  <span className="text-gray-800">👉</span>
                  {workshop.zaloGroupName?.replace("👉", "").trim()}
                </p>
                <a
                  href={workshop.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 pl-7 text-blue-600 underline hover:text-blue-800 break-all"
                >
                  {workshop.zaloLink}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1">📩</span>
                <span className="font-bold text-[#b91c1c]">
                  {workshop.inboxPrompt?.replace("📩", "").trim()}
                </span>
                <a
                  href={`mailto:${workshop.email}`}
                  className="text-gray-900 underline transition-colors hover:text-blue-600 break-all"
                >
                  {workshop.email}
                </a>
              </div>
            </div>
          </div>

          <p className="text-gray-700 italic border-l-4 border-[#b91c1c] pl-4 py-1">
            {workshop.closing}
          </p>

          {/* Hashtags */}
          <p className="text-sm font-medium leading-loose text-blue-600 sm:text-base bg-blue-50/50 p-3 rounded-lg">
            {workshop.hashtags}
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default ScholarshipWorkshopModal
