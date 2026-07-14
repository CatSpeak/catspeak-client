import React from "react"

const RecipientInfoBox = ({
  t,
  bank = "Vietcombank",
  accountNo = "Cat Speak",
  accountOwner = "Cat Speak",
  memo,
  onMemoChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {t.billing?.checkout?.recipientInfo || "Thông tin bên nhận"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t.billing?.checkout?.bank || "Ngân hàng"}
          </label>
          <select
            value={bank}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 cursor-not-allowed font-medium"
          >
            <option value="Vietcombank">Vietcombank</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t.billing?.checkout?.accountNo || "Số tài khoản"}
          </label>
          <input
            type="text"
            value={accountNo}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t.billing?.checkout?.accountOwner || "Chủ tài khoản"}
          </label>
          <input
            type="text"
            value={accountOwner}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t.billing?.checkout?.memo || "Nội dung chuyển khoản (tùy chọn)"}
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder="Lorem Ipsum"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cath-red-700/20 focus:border-cath-red-700 font-medium"
          />
        </div>
      </div>
    </div>
  )
}

export default RecipientInfoBox
