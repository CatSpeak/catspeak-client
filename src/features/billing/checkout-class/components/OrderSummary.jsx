import React from 'react'
import VoucherSection from './VoucherSection'
import { PillButton } from '@/shared/components/ui/buttons'

const OrderSummary = ({
  courseName,
  classCode,
  unitPrice,
  learnersCount,
  vouchers,
  suggestedTags,
  selectedVouchers,
  onToggleVoucher,
  onRemoveVoucher,
  onOpenModal
}) => {
  const subtotal = unitPrice * learnersCount

  // Calculate total discount from selected vouchers
  const calculateDiscount = (voucher) => {
    // In a real app, this logic would be more complex and likely handled by backend
    if (voucher.discountType === 'Percentage') {
      const discount = (subtotal * voucher.discountValue) / 100
      if (voucher.maxDiscountAmount) {
        return Math.min(discount, voucher.maxDiscountAmount)
      }
      return discount
    }
    return voucher.discountValue
  }

  const discountDetails = selectedVouchers.map(v => ({
    ...v,
    discountAmount: calculateDiscount(v)
  }))

  const totalDiscount = discountDetails.reduce((sum, v) => sum + v.discountAmount, 0)
  const totalPayment = Math.max(0, subtotal - totalDiscount)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6 sticky top-24 space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">Tóm tắt đơn hàng</h2>

      <div className="space-y-1">
        <h3 className="font-bold text-[#111827]">{courseName}</h3>
        <p className="text-sm text-[#6B7280]">Lớp: {classCode}</p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-[#6B7280]">
          <span>Đơn giá</span>
          <span className='text-[#111827]'>{formatCurrency(unitPrice)} / người</span>
        </div>
        <div className="flex justify-between text-[#6B7280]">
          <span>Số người học</span>
          <span className='text-[#111827]'>{learnersCount}</span>
        </div>
      </div>

      <div className='border-border border' />

      <div className="space-y-4">
        <div className="flex justify-between font-bold text-[#111827]">
          <span>Tạm tính</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {discountDetails.map(voucher => (
          <div key={voucher.id} className="flex justify-between text-[#00A854]">
            <span>Giảm giá ({voucher.code})</span>
            <span>-{formatCurrency(voucher.discountAmount)}</span>
          </div>
        ))}

        <div className="flex justify-between text-gray-600">
          <span>Học phí</span>
          <span>{formatCurrency(subtotal)}</span>
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
      />

      <div className='border-border border' />

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="font-bold text-[#111827]">Tổng thanh toán</span>
          <span className="text-2xl font-bold text-[#B20000]">{formatCurrency(totalPayment)}</span>
        </div>
        {totalDiscount > 0 && (
          <p className="text-right text-sm text-[#00A854]">
            Bạn tiết kiệm được {formatCurrency(totalDiscount)}!
          </p>
        )}
      </div>

      <PillButton
        onClick={() => { }}
        roundedClass='rounded-xl'
        className='flex-1 w-full'
        bgColor={"#B20000"}
      >
        Xác nhận thanh toán
      </PillButton>
    </div>
  )
}

export default OrderSummary
