import React, { useState, useMemo } from "react"
import { CheckCircle2, XCircle, Zap } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"

const PlanFeaturesTable = ({ features = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { t } = useLanguage()
  const tableT = t?.planUsage?.table || {}

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return features
    return features.filter((f) =>
      (f.featureName || f.featureCode || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )
  }, [features, searchTerm])

  if (!features || features.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-10 border border-border dark:border-[#3F3F3F] shadow-sm text-center text-base text-gray-500 dark:text-neutral-400">
        {tableT.noData || "Chưa có dữ liệu tính năng gói dịch vụ."}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#3F3F3F] shadow-sm overflow-hidden mt-8">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border dark:border-[#3F3F3F] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500 shrink-0" />
            <span>{tableT.title || "Chi Tiết Hạn Ngạch & Đặc Quyền Gói"}</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400 mt-1.5">
            {tableT.subtitle ||
              "Danh sách đầy đủ các thông số giới hạn và tính năng đi kèm trong tài khoản của bạn."}
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 md:w-80 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
            placeholder={tableT.searchPlaceholder || "Tìm kiếm tính năng..."}
            className="h-11 sm:h-12"
            inputClassName="text-base"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-base text-gray-600 dark:text-neutral-300">
          <thead className="bg-gray-50/80 dark:bg-[#202020] text-gray-700 dark:text-neutral-300 text-sm font-semibold uppercase tracking-wider border-b border-border dark:border-[#3F3F3F]">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">
                {tableT.colCodeName || "Mã & Tên Tính Năng"}
              </th>
              <th className="px-6 py-4 whitespace-nowrap">
                {tableT.colLimit || "Mức Giới Hạn"}
              </th>
              <th className="px-6 py-4 whitespace-nowrap">
                {tableT.colUsed || "Đã Sử Dụng"}
              </th>
              <th className="px-6 py-4 whitespace-nowrap">
                {tableT.colRemaining || "Còn Lại"}
              </th>
              <th className="px-6 py-4 text-center whitespace-nowrap">
                {tableT.colStatus || "Trạng Thái"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-[#3F3F3F]">
            {filteredFeatures.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-base text-gray-400 dark:text-neutral-500"
                >
                  {tableT.noData || "Không tìm thấy tính năng khớp với"} "
                  {searchTerm}"
                </td>
              </tr>
            ) : (
              filteredFeatures.map((f, idx) => {
                const isBoolean =
                  f.unit === "boolean" ||
                  f.limitValue?.toLowerCase() === "true" ||
                  f.limitValue?.toLowerCase() === "false"
                const isBoolAllowed = f.limitValue?.toLowerCase() === "true"

                return (
                  <tr
                    key={f.featureCode || idx}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#222222] transition-colors"
                  >
                    {/* Feature Name & Code */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white text-base">
                        {f.featureName || f.featureCode}
                      </div>
                      <span className="text-xs sm:text-sm font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-tight block mt-0.5">
                        {f.featureCode}
                      </span>
                    </td>

                    {/* Limit Value */}
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-neutral-300 whitespace-nowrap text-base">
                      {isBoolean ? (
                        isBoolAllowed ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-base whitespace-nowrap">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />{" "}
                            {tableT.allowed || "Được Phép"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-gray-400 dark:text-neutral-500 text-base whitespace-nowrap">
                            <XCircle className="w-5 h-5 shrink-0" />{" "}
                            {tableT.notSupported || "Không Hỗ Trợ"}
                          </span>
                        )
                      ) : (
                        `${f.limitValue || "0"} ${f.unit || ""}`
                      )}
                    </td>

                    {/* Used Value */}
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap text-base">
                      {isBoolean
                        ? "N/A"
                        : `${f.usedValue || "0"} ${f.unit || ""}`}
                    </td>

                    {/* Remaining Value */}
                    <td className="px-6 py-4 font-medium text-gray-600 dark:text-neutral-300 whitespace-nowrap text-base">
                      {isBoolean ? (
                        "N/A"
                      ) : f.remainingValue != null ? (
                        <span
                          className={
                            f.isExceeded
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {f.remainingValue} {f.unit || ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center whitespace-nowrap min-w-[140px]">
                      {isBoolean ? (
                        isBoolAllowed ? (
                          <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap inline-block">
                            {tableT.statusActive || "Kích Hoạt"}
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-gray-100 dark:bg-[#272727] text-gray-600 dark:text-neutral-400 border border-border dark:border-[#3F3F3F] whitespace-nowrap inline-block">
                            {tableT.statusLocked || "Khóa"}
                          </span>
                        )
                      ) : f.isExceeded ? (
                        <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap inline-block">
                          {tableT.statusExceeded || "Hết Hạn Ngạch"}
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap inline-block">
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
