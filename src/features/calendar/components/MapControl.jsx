import { IconButton } from "@/shared/components/ui/buttons"
import { Plus, Minus } from "lucide-react"
import { useMap } from "react-leaflet"

export default function MapControl() {
  const map = useMap()

  return (
    <div className="absolute bottom-4 right-4 z-[1000] overflow-hidden flex flex-col gap-2">
      <IconButton onClick={() => map.zoomIn()} variant="secondary">
        <Plus />
      </IconButton>

      <IconButton onClick={() => map.zoomOut()} variant="secondary">
        <Minus />
      </IconButton>
    </div>
  )
}
