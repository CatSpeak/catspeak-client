/**
 * Định dạng số tiền sang chuẩn VND
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

/**
 * Tính toán số tiền được giảm giá của một voucher
 */
export const calculateVoucherDiscount = (voucher, subtotal) => {
  if (voucher.estimatedDiscountAmount) {
    return voucher.estimatedDiscountAmount
  }
  
  const isPercentage = voucher.discountType?.toLowerCase() === 'percentage'
  if (isPercentage) {
    const discount = (subtotal * voucher.discountValue) / 100
    if (voucher.maxDiscountAmount) {
      return Math.min(discount, voucher.maxDiscountAmount)
    }
    return discount
  }
  
  return voucher.discountValue || 0
}

/**
 * Dịch và format lý do không đủ điều kiện dùng voucher (ineligibleReason)
 */
export const translateIneligibleReason = (reason, tc) => {
  if (!reason) return tc.ineligible

  // Pattern: "Yêu cầu tối thiểu X người học trong đơn hàng"
  const minLearnersMatch = reason.match(/(\d+)\s*(người học|learner|学员)/i)
  if (minLearnersMatch) {
    return tc.reasonMinLearners.replace('{{count}}', minLearnersMatch[1])
  }

  // Pattern: "Đơn hàng tối thiểu từ X đ (Tạm tính: Y đ)"
  const minOrderMatch = reason.match(/([\d.,]+)\s*đ.*?([\d.,]+)\s*đ/i)
  if (minOrderMatch) {
    return tc.reasonMinOrder
      .replace('{{minAmount}}', minOrderMatch[1] + ' đ')
      .replace('{{currentAmount}}', minOrderMatch[2] + ' đ')
  }

  // If no pattern matched, return the original reason from API
  return reason
}
