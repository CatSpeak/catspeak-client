import { Link } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PLACEMENT_TEST_PATH } from "../constants/routes"
import { readActiveSession } from "../utils/sessionStorage"

const PlacementSessionPage = () => {
  const { t } = useLanguage()
  const copy = t.placementTest?.session || {}
  const session = readActiveSession()

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_10px_24px_-3px_rgba(15,23,42,0.07),0_2px_6px_rgba(15,23,42,0.03)] md:p-8">
        <h1 className="text-xl font-bold leading-7 text-[#09090B]">
          {copy.title}
        </h1>
        <p className="text-sm font-medium leading-[22px] text-slate-600">
          {copy.body}
        </p>
        {session && (
          <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-xs font-medium text-slate-500">
              {copy.codeLabel}
            </span>
            <span className="text-base font-semibold text-[#09090B]">
              #{session.code}
            </span>
          </div>
        )}
        <Link
          to={PLACEMENT_TEST_PATH}
          className="w-fit text-sm font-semibold text-cath-red-700"
        >
          {copy.backCta}
        </Link>
      </div>
    </div>
  )
}

export default PlacementSessionPage
