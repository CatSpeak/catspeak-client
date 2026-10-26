import { formatTemplate } from "../../utils/format"

const ProfileCertificateCard = ({
  copy = {},
  band,
  tierLabel,
  cefr,
  score,
  description,
  testDate,
  code,
}) => (
  <section className="flex w-full flex-col gap-2.5 rounded-[16px] bg-gradient-to-r from-[#881337] to-cath-red-700 px-[18px] py-4 shadow-[0_8px_20px_rgba(136,19,55,0.2)]">
    <div className="flex items-center justify-between gap-3">
      <span className="rounded-[6px] bg-[#FEF08A] px-2 py-[3px] text-[10px] font-bold leading-[14.5px] text-[#854D0E]">
        {copy.certificateBadge}
      </span>
      <span className="rounded-[6px] bg-white/20 px-2.5 py-[3px] text-[11px] font-bold text-white">
        {formatTemplate(copy.scoreLabel, { score })}
      </span>
    </div>

    <div className="flex flex-col gap-0.5">
      <p className="text-[22px] font-extrabold leading-[29.7px] text-white">
        {formatTemplate(copy.bandTitle, { band, tier: tierLabel })}
      </p>
      <p className="text-[11.5px] leading-[16.7px] text-[#FECACA]">
        {formatTemplate(copy.cefrLabel, { cefr })}
      </p>
    </div>

    <div className="rounded-[10px] bg-black/20 px-3 py-2.5">
      <p className="text-[11.5px] leading-[16.7px] text-[#FEF2F2]">
        {description}
      </p>
    </div>

    <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-[#FECACA]">
      <span>{formatTemplate(copy.testDate, { date: testDate })}</span>
      <span>{formatTemplate(copy.testCode, { code })}</span>
    </div>
  </section>
)

export default ProfileCertificateCard
