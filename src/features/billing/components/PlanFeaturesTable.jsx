import React, { useState, useMemo } from "react"
import { Search, CheckCircle2, XCircle, Zap } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PlanFeaturesTable = ({ features = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { t } = useLanguage()
  const tableT = t?.planUsage?.table || {}

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return features
    return features.filter((f) =>
      (f.featureName || f.featureCode || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  }, [features, searchTerm])

  if (!features || features.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center text-gray-500">
        {tableT.noData || "Chưa có dữ liệu tính năng gói dịch vụ."}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mt-8">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            {tableT.title || "Chi Tiết Hạn Ngạch & Đặc Quyền Gói"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {tableT.subtitle || "Danh sách đầy đủ các thông số giới hạn và tính năng đi kèm trong tài khoản của bạn."}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tableT.searchPlaceholder || "Tìm kiếm tính năng..."}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cath-red-700/20 focus:border-cath-red-700 transition-all"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-3.5 whitespace-nowrap">{tableT.colCodeName || "Mã & Tên Tính Năng"}</th>
              <th className="px-6 py-3.5 whitespace-nowrap">{tableT.colLimit || "Mức Giới Hạn"}</th>
              <th className="px-6 py-3.5 whitespace-nowrap">{tableT.colUsed || "Đã Sử Dụng"}</th>
              <th className="px-6 py-3.5 whitespace-nowrap">{tableT.colRemaining || "Còn Lại"}</th>
              <th className="px-6 py-3.5 text-center whitespace-nowrap">{tableT.colStatus || "Trạng Thái"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFeatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  {tableT.noData || "Không tìm thấy tính năng khớp với"} "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredFeatures.map((f, idx) => {
                const isBoolean = f.unit === "boolean" || f.limitValue?.toLowerCase() === "true" || f.limitValue?.toLowerCase() === "false"
                const isBoolAllowed = f.limitValue?.toLowerCase() === "true"

                return (
                  <tr key={f.featureCode || idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* Feature Name & Code */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{f.featureName || f.featureCode}</div>
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-tight">{f.featureCode}</span>
                    </td>

                    {/* Limit Value */}
                    <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                      {isBoolean ? (
                        isBoolAllowed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4" /> {tableT.allowed || "Được Phép"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
                            <XCircle className="w-4 h-4" /> {tableT.notSupported || "Không Hỗ Trợ"}
                          </span>
                        )
                      ) : (
                        `${f.limitValue || "0"} ${f.unit || ""}`
                      )}
                    </td>

                    {/* Used Value */}
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {isBoolean ? "N/A" : `${f.usedValue || "0"} ${f.unit || ""}`}
                    </td>

                    {/* Remaining Value */}
                    <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                      {isBoolean ? (
                        "N/A"
                      ) : f.remainingValue != null ? (
                        <span className={f.isExceeded ? "text-rose-600 font-bold" : "text-emerald-600"}>
                          {f.remainingValue} {f.unit || ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center whitespace-nowrap min-w-[130px]">
                      {isBoolean ? (
                        isBoolAllowed ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-block">
                            {tableT.statusActive || "Kích Hoạt"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap inline-block">
                            {tableT.statusLocked || "Khóa"}
                          </span>
                        )
                      ) : f.isExceeded ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap inline-block">
                          {tableT.statusExceeded || "Hết Hạn Ngạch"}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap inline-block">
                          {tableT.statusNormal || "Bình Thường"}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlanFeaturesTable
