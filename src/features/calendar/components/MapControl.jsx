import { Plus, Minus } from "lucide-react";
import { useMap } from "react-leaflet";

export default function MapControl() {
  const map = useMap();

  return (
    <div className="absolute bottom-6 right-6 z-[1000] overflow-hidden rounded-full shadow-xl">
      <button
        onClick={() => map.zoomIn()}
        className="w-14 h-14 bg-[#990011] text-white flex items-center justify-center hover:bg-[#7d000d] transition"
      >
        <Plus size={26} />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="w-14 h-14 bg-[#990011] text-white flex items-center justify-center border-t border-white/20 hover:bg-[#7d000d] transition"
      >
        <Minus size={26} />
      </button>
    </div>
  );
}
