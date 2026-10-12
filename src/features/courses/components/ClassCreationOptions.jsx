import { useGetVouchersQuery } from "@/features/vouchers/api/vouchersApi"
import Dropdown from "@/shared/components/ui/Dropdown"
import InvititeDropdown from "@/shared/components/ui/InvititeDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

export default function ClassCreationOptions({ state, setField }) {
  const { t } = useLanguage()
  const cc = t.courses?.createClass || {}
  const { data, isLoading, error, refetch } = useGetVouchersQuery({ page: 1, pageSize: 100, sponsorType: "Instructor", scopeType: "SpecificClasses", status: "Draft" })
  const vouchers = (Array.isArray(data?.data) ? data.data : []).filter(v => v.status === "Draft")
  const labelStyle = "text-xs font-extrabold text-gray-700 uppercase tracking-wider"
  return (
    <div className="bg-white rounded-2xl p-4 border border-border flex flex-col gap-4">
      <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{cc.creationOptionsPreviewOnly || "These three options are previews. They will not be saved or applied when you create a class."}</p>
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.voucher || "Class voucher"}</label>
        <Dropdown value={state.voucherId} onChange={value => setField("voucherId", value)} disabled={isLoading || Boolean(error)}
          options={[{ value: "", label: cc.noVoucher || "No voucher" }, ...vouchers.map(v => ({ value: v.id, label: `${v.code} — ${v.title}` }))]} />
        <p className="text-xs text-gray-500">{cc.voucherCreationHint || "Preview a draft instructor voucher for this class."}</p>
        {error && <button type="button" onClick={refetch} className="text-xs text-[#990011] text-left">{cc.retryVouchers || "Vouchers could not be loaded. Try again."}</button>}
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.creationInviteStudents || "Invite students"}</label>
        <InvititeDropdown mode="all" selectionMode="multiple" value={state.invitedAccountIds} onChange={value => setField("invitedAccountIds", value)} placeholder={cc.selectStudents || "Select students (up to 50)"} />
        <p className="text-xs text-gray-500">{cc.creationInviteHint || "Preview the students to invite. No invitations will be sent from this form."}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>{cc.coHost || "Co-host"}</label>
        <InvititeDropdown mode="all" selectionMode="single" value={state.coHostAccountId} onChange={value => setField("coHostAccountId", value)} placeholder={cc.selectCoHost || "Select one co-host (optional)"} />
        {state.coHostAccountId && <button type="button" className="text-xs text-[#990011] text-left" onClick={() => setField("coHostAccountId", "")}>{cc.clearCoHost || "Clear co-host"}</button>}
        <p className="text-xs text-gray-500">{cc.coHostCreationHint || "Preview one co-host. Actual assignment requires a confirmed student in Class Details."}</p>
      </div>
    </div>
  )
}
