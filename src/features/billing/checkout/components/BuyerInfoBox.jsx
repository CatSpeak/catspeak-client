import React from "react"
import { User, Mail, Phone } from "lucide-react"

const BuyerInfoBox = ({
  t,
  fullName,
  email,
  phone,
  onFullNameChange,
  onEmailChange,
  onPhoneChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {t.billing?.checkout?.buyerInfo || "Thông tin người mua"}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t.billing?.checkout?.fullName || "Họ và tên"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cath-red-700/20 focus:border-cath-red-700 font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <User size={16} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {t.billing?.checkout?.email || "Email"}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cath-red-700/20 focus:border-cath-red-700 font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {t.billing?.checkout?.phone || "SĐT"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cath-red-700/20 focus:border-cath-red-700 font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Phone size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerInfoBox
