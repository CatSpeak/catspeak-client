import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Clock, TriangleAlert } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { formatCurrency, translateIneligibleReason } from '../../utils/checkoutUtils'

const VoucherCard = ({ voucher, category, isSelected, canUse, onToggleVoucher, orderAmount, t }) => {
  const tc = t.billing.checkoutClass
  const { formatDate } = useTimezone()
  let Icon = CheckCircle2
  let iconColor = 'text-[#16A34A] dark:text-emerald-400'
  let bgClass = 'bg-[#F0FDF4] dark:bg-emerald-950/20 border-[#BBF7D0] dark:border-emerald-800/40'

  if (category === 'invalid_class' || category === 'ineligible') {
    Icon = AlertTriangle
    iconColor = 'text-[#F59F00] dark:text-amber-400'
    bgClass = 'bg-[#FFF8E6] dark:bg-amber-950/20 border-[#FDE3A7] dark:border-amber-800/40'
  } else if (category === 'expired' || category === 'out_of_uses') {
    Icon = XCircle
    iconColor = 'text-[#B20000] dark:text-red-400'
    bgClass = 'bg-[#FDF0F0] dark:bg-rose-950/20 border-[#F5C2C2] dark:border-rose-900/40 opacity-80'
  }

  return (
    <div className={`p-4 rounded-xl border ${bgClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
          <div className='space-y-1'>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0B1C30] dark:text-white">{voucher.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${voucher.sponsorType === 'CatSpeak' ? 'bg-[#F59F00] text-[#684000]' : 'bg-[#AECDF3] text-[#00479C]'}`}>
                {voucher.sponsorType === 'CatSpeak' ? 'CATSPEAK' : tc.sponsorInstructorBadge}
              </span>
            </div>
            <p className="text-sm text-[#5B403E] dark:text-neutral-300">{voucher.description}</p>
            {voucher.maxDiscountAmount && voucher.discountType?.toLowerCase() === 'percentage' && (
              <p className="text-xs text-[#5B403E] dark:text-neutral-300">
                {tc.maxDiscountLabel} {formatCurrency(voucher.maxDiscountAmount)}
              </p>
            )}
            <div className='flex items-center gap-1'>
              <Clock size={12} className="text-[#5B403E] dark:text-neutral-300" />
              <p className="text-xs font-bold text-[#5B403E] dark:text-neutral-300"> {tc.expiry} {voucher.isNeverExpired ? tc.neverExpires : formatDate(voucher.validTo)}</p>
            </div>

            {(category === 'invalid_class' || category === 'ineligible' || category === 'expired' || category === 'out_of_uses') && (
              <div className="mt-2 text-xs flex items-start gap-1">
                <div className='flex items-center gap-1'>
                  <TriangleAlert size={12} className={`${iconColor} shrink-0 mt-0.5`} />
                  <span className={`${iconColor} font-bold`}> {translateIneligibleReason(voucher, tc, { orderAmount, category })}</span>
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
            {isSelected ? tc.applied : tc.use}
          </PillButton>
        )}
      </div>
    </div>
  )
}

export default VoucherCard
