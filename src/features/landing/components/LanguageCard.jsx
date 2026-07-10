import { China, UK, VietNam } from "@/shared/assets/icons/flags";
import { MainLogo } from "@/shared/assets/icons/logo";

const languages = [
  {
    name: "Việt Nam",
    flag: VietNam,
    className: "left-[7%] top-[35%]",
  },
  {
    name: "Trung Quốc",
    flag: China,
    className: "left-[40%] top-[35%]",
  },
  {
    name: "Anh",
    flag: UK,
    className: "left-[73%] top-[35%]",
  },
];

export default function LanguageCard() {
  return (
    // Thêm h-[300px] md:h-auto để tránh khoảng trống thừa do hiệu ứng scale gây ra trên mobile
    <div className="flex justify-center items-center py-10 md:py-20 h-[320px] md:h-auto overflow-hidden">
      {/* Perspective container + Thêm scale:
        - Mobile: scale-[0.52] để vừa khít màn hình điện thoại dọc (~340px)
        - Tablet (sm): scale-[0.75]
        - Desktop (md): scale-100 quay về kích thước gốc
      */}
      <div className="relative perspective-[1200px] scale-[0.52] sm:scale-75 md:scale-100 transition-transform duration-300 origin-center">
        {/* Board */}
        <div className="relative h-[420px] w-[650px] rounded-[40px] bg-white/65 backdrop-blur-sm shadow-[0_30px_60px_rgba(0,0,0,0.14)] [transform:rotateX(55deg)_rotateZ(-45deg)] [transform-style:preserve-3d] overflow-visible">
          {/* Logo */}
          <img
            src={MainLogo}
            alt="logo"
            className="absolute left-[70px] top-[40px] w-[120px] [transform:translateZ(20px)]"
          />

          {/* AI Badge */}
          <div className="absolute left-[590px] top-[-10px]">
            {/* Shadow plate */}
            <div className="absolute -left-[25px] top-[25px] h-[60px] w-[60px] rounded-2xl bg-gray-400/40" />

            {/* Main badge */}
            <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9E0C1D] to-[#D06F7A] text-lg font-extrabold tracking-wide text-[#FFE66D] shadow-[0_8px_20px_rgba(0,0,0,0.18)] [transform:translateZ(60px)]">
              AI
            </div>
          </div>

          {/* Language Cards */}
          {languages.map((item) => (
            <div key={item.name} className={`absolute ${item.className}`}>
              {/* Shadow plate */}
              <div className="absolute left-[10px] top-[35px] h-[72px] w-[200px] rounded-2xl bg-gray-400/35" />

              {/* Main card */}
              <div className="relative flex w-[200px] items-center gap-4 rounded-2xl bg-white px-8 py-5 [transform:translateZ(40px)]">
                {/* highlight phía trên */}
                <div className="absolute inset-x-2 top-1 h-[2px] rounded-full bg-white/90" />

                {/* shadow cạnh trái */}
                <div className="absolute left-0 top-2 bottom-2 w-[6px] rounded-l-2xl bg-black/10 blur-sm [transform:translateZ(-2px)]" />

                {/* shadow cạnh dưới */}
                <div className="absolute bottom-0 left-2 right-2 h-[6px] rounded-b-2xl bg-black/10 blur-sm [transform:translateZ(-2px)]" />

                <img
                  src={item.flag}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover"
                />

                <span className="text-sm font-medium text-black">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
