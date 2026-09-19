const ProfileAdviceCard = ({ copy = {}, text }) => (
  <section className="flex w-full flex-col gap-1.5 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
    <h2 className="text-xs font-bold leading-[17px] text-[#1D4ED8]">
      {copy.adviceTitle}
    </h2>
    <p className="text-[11.5px] leading-[16.7px] text-[#1E40AF]">{text}</p>
  </section>
)

export default ProfileAdviceCard
