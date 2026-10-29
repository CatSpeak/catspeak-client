import { cn } from "@/lib/utils"

const StepCard = ({ className = "", children }) => (
  <section
    className={cn(
      "flex w-full flex-col rounded-2xl bg-white p-6 shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07),0_2px_6px_rgba(15,23,42,0.03)] md:p-7",
      className,
    )}
  >
    {children}
  </section>
)

export default StepCard
