import { ChevronDown, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  default: "bg-slate-50 text-[#09090B]",
  noAudio: "bg-slate-50 text-[#09090B]",
}

const DeviceSelect = ({
  devices = [],
  value,
  onChange,
  title,
  caption,
  placeholder,
  variant = "default",
}) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-xl px-4 py-2.5",
      TONE_CLASSES[variant] || TONE_CLASSES.default,
    )}
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Mic size={15} strokeWidth={2} />
    </span>
    <label className="flex min-w-0 flex-1 flex-col">
      <span className="sr-only">{title}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent text-[13px] font-medium text-[#09090B] outline-none"
      >
        {devices.length === 0 && <option value="">{placeholder}</option>}
        {devices.map((device, index) => (
          <option key={device.deviceId || index} value={device.deviceId}>
            {device.label || `${title} ${index + 1}`}
          </option>
        ))}
      </select>
      {caption && (
        <span className="truncate text-[11px] font-medium text-slate-600">
          {caption}
        </span>
      )}
    </label>
    <ChevronDown size={16} className="shrink-0 text-slate-500" />
  </div>
)

export default DeviceSelect
