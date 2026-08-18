import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Clock, TriangleAlert } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useTimezone } from '@/shared/hooks/useTimezone'

const VoucherCard = ({ voucher, category, isSelected, canUse, onToggleVoucher }) => {
  const { formatDate } = useTimezone()
  let Icon = CheckCircle2
  let iconColor = 'text-[#16A34A]'
  let bgClass = 'bg-[#F0FDF4] border-[#BBF7D0]'

  if (category === 'invalid_class' || category === 'ineligible') {
    Icon = AlertTriangle
    iconColor = 'text-[#F59F00]'
    bgClass = 'bg-[#FFF8E6] border-[#FDE3A7]'
  } else if (category === 'expired' || category === 'out_of_uses') {
    Icon = XCircle
    iconColor = 'text-[#B20000]'
    bgClass = 'bg-[#FDF0F0] border-[#F5C2C2] opacity-80'
  }

  return (
    <div className={`p-4 rounded-xl border ${bgClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
          <div className='space-y-1'>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0B1C30]">{voucher.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${voucher.sponsorType === 'CatSpeak' ? 'bg-[#F59F00] text-[#684000]' : 'bg-[#AECDF3] text-[#00479C]'}`}>
                {voucher.sponsorType === 'CatSpeak' ? 'CATSPEAK' : 'GIÁO VIÊN'}
              </span>
            </div>
            <p className="text-sm text-[#5B403E]">{voucher.description}</p>
            {voucher.maxDiscountAmount && voucher.discountType?.toLowerCase() === 'percentage' && (
              <p className="text-xs text-[#5B403E]">
                Giảm tối đa: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.maxDiscountAmount)}
              </p>
            )}
            <div className='flex items-center gap-1'>
              <Clock size={12} color='#5B403E' />
              <p className="text-xs font-bold text-[#5B403E]"> HSD: {voucher.isNeverExpired ? 'Không thời hạn' : formatDate(voucher.validTo)}</p>
            </div>

            {/* <div className='border-t border-[#E3BEBA] w-full' /> */}

            {(category === 'invalid_class' || category === 'ineligible' || category === 'expired' || category === 'out_of_uses') && (
              <div className="mt-2 text-xs flex items-start gap-1">
                <div className='flex items-center gap-1'>
                  <TriangleAlert size={12} className={`${iconColor} shrink-0 mt-0.5`} />
                  <span className={`${iconColor} font-bold`}> {voucher.ineligibleReason || 'Không đủ điều kiện'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {category === 'valid' && (
          <PillButton
            onClick={() => onToggleVoucher(voucher)}
            disabled={!canUse && !isSelected}
            roundedClass='rounded-xl'
            variant={isSelected ? 'outline' : 'primary'}
          >
            {isSelected ? 'Đã áp dụng' : 'Sử dụng'}
          </PillButton>
        )}
      </div>
    </div>
  )
}

export default VoucherCard
