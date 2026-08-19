import React from 'react'
import VoucherSection from './VoucherSection'
import { PillButton } from '@/shared/components/ui/buttons'
import { formatCurrency, calculateVoucherDiscount } from '../../utils/checkoutUtils'

const OrderSummary = ({
  className,
  unitPrice,
  learnersCount,
  vouchers,
  suggestedTags,
  selectedVouchers,
  onToggleVoucher,
  onRemoveVoucher,
  onOpenModal,
  onCheckout,
  isProcessing,
  isVoucherLoading,
  t
}) => {
  const tc = t.billing.checkoutClass
  const subtotal = unitPrice * learnersCount

  const discountDetails = selectedVouchers.map(v => ({
    ...v,
    discountAmount: calculateVoucherDiscount(v, subtotal)
  }))

  const totalDiscount = discountDetails.reduce((sum, v) => sum + v.discountAmount, 0)
  const totalPayment = Math.max(0, subtotal - totalDiscount)

  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6 sticky top-24 space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">{tc.orderSummary}</h2>

      <div className="space-y-1">
        <h3 className="font-bold text-[#111827]">{className}</h3>
        {/* <p className="text-sm text-[#6B7280]">Lớp: {classCode}</p> */}
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-[#6B7280]">
          <span>{tc.unitPrice}</span>
          <span className='text-[#111827]'>
            {unitPrice === 0 ? tc.free : `${formatCurrency(unitPrice)} ${tc.perPerson}`}
          </span>
        </div>
        <div className="flex justify-between text-[#6B7280]">
          <span>{tc.learnerCount}</span>
          <span className='text-[#111827]'>{learnersCount}</span>
        </div>
      </div>

      <div className='border-border border' />

      <div className="space-y-4">
        <div className="flex justify-between font-bold text-[#111827]">
          <span>{tc.subtotal}</span>
          <span>{subtotal === 0 ? tc.free : formatCurrency(subtotal)}</span>
        </div>

        {discountDetails.map(voucher => (
          <div key={voucher.id} className="flex justify-between text-[#00A854]">
            <div className="flex flex-col">
              <span>{tc.discount} ({voucher.code})</span>
              {voucher.maxDiscountAmount && voucher.discountType?.toLowerCase() === 'percentage' && (
                <span className="text-xs opacity-80">{tc.maxDiscount} {formatCurrency(voucher.maxDiscountAmount)}</span>
              )}
            </div>
            <span>-{formatCurrency(voucher.discountAmount)}</span>
          </div>
        ))}

        <div className="flex justify-between text-gray-600">
          <span>{tc.tuition}</span>
          <span>{totalPayment === 0 ? tc.free : formatCurrency(totalPayment)}</span>
        </div>
      </div>

      <div className='border-border border' />

      <VoucherSection
        vouchers={vouchers}
        suggestedTags={suggestedTags}
        selectedVouchers={selectedVouchers}
        onToggleVoucher={onToggleVoucher}
        onRemoveVoucher={onRemoveVoucher}
        onOpenModal={onOpenModal}
        isLoading={isVoucherLoading}
        t={t}
      />

      <div className='border-border border' />

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="font-bold text-[#111827]">{tc.totalPayment}</span>
          <span className="text-2xl font-bold text-[#B20000]">{totalPayment === 0 ? tc.free : formatCurrency(totalPayment)}</span>
        </div>
        {totalDiscount > 0 && (
          <p className="text-right text-sm text-[#00A854]">
            {tc.youSaved.replace('{{amount}}', formatCurrency(totalDiscount))}
          </p>
        )}
      </div>

      <PillButton
        fullWidth
        roundedClass='rounded-xl'
        className='flex-1 w-full'
        bgColor={"#B20000"}
        onClick={() => onCheckout(false)}
        disabled={isProcessing}
        loading={isProcessing}
        loadingText={tc.processing}
      >
        {tc.confirmPayment}
      </PillButton>
    </div>
  )
}

export default OrderSummary