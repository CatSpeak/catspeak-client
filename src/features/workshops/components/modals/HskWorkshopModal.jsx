import LogoDefault from "@/shared/assets/images/LogoDefault.png"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const HskWorkshopModal = ({ open, onClose, t }) => {
  const workshop = t.workshops.hskWorkshop

  if (!workshop) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workshop.title}
      className="max-w-xl sm:max-w-2xl md:max-w-3xl"
    >
      <div className="flex flex-col gap-6 py-2 max-h-[75vh] overflow-y-auto px-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5">
        {/* Cover Image */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden rounded-xl sm:h-64">
          <img
            src={LogoDefault}
            alt="Cat Speak Workshop"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6 px-2 text-[15px] sm:text-base leading-relaxed text-gray-800">
          {/* Intro Section */}
          <div className="space-y-4">
            <p>{workshop.introText1}</p>
            <p>{workshop.introText2}</p>
            <p className="font-bold text-[#b91c1c]">{workshop.workshopBenefitsIntro}</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              {(workshop.bulletPoints || []).map((point, idx) => (
                <li key={idx}>
                  <span className="ml-1">✨ {point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="italic text-gray-700">{workshop.closingText}</p>

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
              <span className="text-lg">📍</span>
              <p>
                <span className="font-bold text-[#b91c1c]">
                  {workshop.locationLabel}
                </span>{" "}
                {workshop.location}
              </p>
            </div>
            {workshop.targetLabel && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <p>
                  <span className="font-bold text-[#b91c1c]">
                    {workshop.targetLabel?.replace("🎯", "").trim()}
                  </span>{" "}
                  {workshop.target}
                </p>
              </div>
            )}
          </div>

          {/* Registration Links */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <p className="font-bold italic text-[#b91c1c]">
              {workshop.joinLinkNote}
            </p>
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
            <p className="font-medium">{workshop.followPrompt}</p>

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
          <p className="text-sm font-medium leading-loose text-blue-600 sm:text-[15px] bg-blue-50/50 p-3 rounded-lg">
            {workshop.hashtags}
          </p>

          <PillButton
            onClick={onClose}
            bgColor="#f5c518"
            textColor="#990011"
            className="w-full"
          >
            {workshop.closeButton}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default HskWorkshopModal
