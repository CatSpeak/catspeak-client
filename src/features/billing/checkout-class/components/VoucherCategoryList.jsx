import React from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'
import VoucherCard from './VoucherCard'

const VoucherCategoryList = ({ title, vouchers, category, selectedVouchers, onToggleVoucher }) => {
  if (vouchers.length === 0) return null

  let headerColor = 'text-[#111827]'
  if (category === 'invalid_class' || category === 'ineligible') headerColor = 'text-[#F59F00]'
  if (category === 'expired' || category === 'out_of_uses') headerColor = 'text-[#B20000]'

  return (
    <div className="mb-6">
      <h4 className={`text-sm font-bold mb-3 uppercase flex items-center gap-2 ${headerColor}`}>
        {category === 'invalid_class' || category === 'ineligible' ? <AlertTriangle size={14} /> : category === 'expired' || category === 'out_of_uses' ? <XCircle size={14} /> : null}
        {title} ({vouchers.length} mã)
      </h4>
      <div className='space-y-4'>
        {vouchers.map(voucher => {
          const isSelected = selectedVouchers.some(v => v.id === voucher.id)
          const canUse = category === 'valid' && !isSelected && selectedVouchers.length < 2

          return (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              category={category}
              isSelected={isSelected}
              canUse={canUse}
              onToggleVoucher={onToggleVoucher}
            />
          )
        })}
      </div>
    </div>
  )
}

export default VoucherCategoryList
