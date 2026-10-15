import { useGetVouchersQuery } from "@/features/vouchers/api/vouchersApi"
import Dropdown from "@/shared/components/ui/Dropdown"
import InvititeDropdown from "@/shared/components/ui/InvititeDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { CO_HOST_PRESETS } from "@/features/co-host/constants"

export default function ClassCreationOptions({ state, setField }) {
  const { t } = useLanguage()
  const cc = t.courses?.createClass || {}
  const { currentData: data, isLoading, error, refetch } = useGetVouchersQuery(
    { page: 1, pageSize: 100, forClassCreation: true },
    { refetchOnMountOrArgChange: true },
  )
  const vouchers = (Array.isArray(data?.data) ? data.data : []).filter(v => v.status === "Draft")
  const labelStyle = "text-xs font-extrabold text-gray-700 uppercase tracking-wider"
  return (
    <div className="bg-white rounded-2xl p-4 border border-border flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.voucher || "Class voucher"}</label>
        <Dropdown value={state.voucherId} onChange={value => setField("voucherId", value)} loading={isLoading} dropdownClassName="w-full"
          options={[{ value: "", label: cc.noVoucher || "No voucher" }, ...vouchers.map(v => ({ value: v.id, label: `${v.code} — ${v.title}` }))]} />
        {error && <button type="button" onClick={refetch} className="text-xs text-[#990011] text-left">{cc.retryVouchers || "Vouchers could not be loaded. Try again."}</button>}
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.creationInviteStudents || "Invite students"}</label>
        <InvititeDropdown mode="all" selectionMode="multiple" value={state.invitedAccountIds} onChange={value => setField("invitedAccountIds", value)} placeholder={cc.selectStudents || "Select students"} />
        {/* <p className="text-xs text-gray-500">{cc.creationInvitationNotice || "Invitations are sent after the class is created. Students still need to enroll."}</p> */}
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.coHost || "Co-host"}</label>
        <InvititeDropdown mode="all" selectionMode="single" value={state.coHostAccountId} onChange={value => setField("coHostAccountId", value)} placeholder={cc.selectCoHost || "Select one co-host"} />
        {/* <p className="text-xs text-gray-500">{cc.creationCoHostNotice || "Your co-host is invited now and gains the selected permissions after enrolling."}</p> */}
        {state.coHostAccountId && <>
          <label className={labelStyle}>{cc.creationCoHostPermissions || "Co-host permissions"}</label>
          <Dropdown value={state.coHostPermissions?.length === CO_HOST_PRESETS.ALL.length ? "all" : state.coHostPermissions?.length === CO_HOST_PRESETS.ASSISTANT.length ? "assistant" : "share"}
            dropdownClassName="w-full"
            onChange={value => setField("coHostPermissions", value === "all" ? [...CO_HOST_PRESETS.ALL] : value === "assistant" ? [...CO_HOST_PRESETS.ASSISTANT] : ["share_screen"])}
            options={[{ value: "share", label: cc.coHostShareScreen || "Screen sharing" }, { value: "assistant", label: cc.coHostAssistant || "Teaching assistant" }, { value: "all", label: cc.coHostFullPermissions || "All co-host permissions" }]} />
        </>}
        {state.coHostAccountId && <button type="button" className="text-xs text-[#990011] text-left" onClick={() => setField("coHostAccountId", "")}>{cc.clearCoHost || "Clear co-host"}</button>}
      </div>
    </div>
  )
}
