import React from "react"
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
            alt="Cat Speak Logo"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6 text-base leading-relaxed text-gray-800">
          {/* Intro Section */}
          <div className="space-y-4">
            <p>
              {workshop.introText}{" "}
              <span className="text-[#b91c1c] font-bold">
                {workshop.introHighlight}
              </span>{" "}
              {workshop.introClosing}
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              {(workshop.bulletPoints || []).map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Workshop Title */}
          <div className="py-2">
            <div className="m-0">
              {workshop.workshopTitlePrefix}{" "}
              <span className="text-[#b91c1c] font-bold">
                {workshop.workshopTitle}
              </span>
            </div>
          </div>

          <p>
            {workshop.descriptionText}{" "}
            <span className="text-[#b91c1c] font-bold">
              {workshop.descriptionHighlight}
            </span>
            {workshop.descriptionClosing}
          </p>

          {/* Info Section */}
          <div className="space-y-3 font-medium">
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
              <span className="text-lg">📍</span>
              <p>
                <span className="font-bold text-[#b91c1c]">
                  {workshop.locationLabel}
                </span>{" "}
                {workshop.location}
              </p>
            </div>
          </div>

          {/* Registration Links */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <p className="font-bold italic text-[#b91c1c]">
              {workshop.joinLinkNote}
            </p>
            <p className="font-bold">
              <span className="text-[#b91c1c]">
                {workshop.registerLinkLabel}
              </span>{" "}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSflanRsWpM4EbY8ICXXHZ5Qms0X1lF2g4MR4ox_eY-W9eUHig/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {workshop.registerLinkText}
              </a>
            </p>
          </div>

          <div className="my-4 h-[1px] w-full bg-gray-200" />

          {/* Social Section */}
          <div className="space-y-4">
            <p>{workshop.followPrompt}</p>

            <div className="space-y-2">
              <p className="font-bold text-[#b91c1c]">
                <span className="mr-2 text-gray-800">👉</span>
                {workshop.zaloGroupName}
              </p>
              <a
                href={workshop.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all pl-7 text-blue-600 underline hover:text-blue-800"
              >
                {workshop.zaloLink}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1">📩</span>
              <span className="font-bold text-[#b91c1c]">
                {workshop.inboxPrompt}
              </span>
              <a
                href={`mailto:${workshop.email}`}
                className="text-gray-900 underline transition-colors hover:text-blue-600"
              >
                {workshop.email}
              </a>
            </div>
          </div>

          <p className="text-gray-700 italic">{workshop.closing}</p>

          {/* Hashtags */}
          <p className="text-sm font-medium leading-loose text-blue-600 sm:text-base">
            {workshop.hashtags}
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default ChinaWorkshopModal
