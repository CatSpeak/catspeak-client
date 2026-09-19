import { GraduationCap } from "lucide-react"

const ProfileTopbar = ({ copy = {}, studentName, band, initials }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1F2] text-cath-red-700">
        <GraduationCap size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <h1 className="text-[17px] font-semibold leading-6 text-[#09090B]">
          {copy.topbarTitle}
        </h1>
        <p className="text-xs font-medium leading-4 text-slate-500">
          {copy.topbarSub}
        </p>
      </div>
    </div>

    <div className="flex w-fit items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white py-1.5 pl-2 pr-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#881337] text-[11px] font-bold text-white">
        {initials}
      </span>
      <span className="text-[13px] font-bold leading-[18.85px] text-[#0F172A]">
        {studentName}
      </span>
      <span className="rounded-[10px] bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-bold text-cath-red-700">
        {`HSK ${band}`}
      </span>
    </div>
  </div>
)

export default ProfileTopbar
