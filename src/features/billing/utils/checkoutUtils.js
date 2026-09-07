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

import { VOUCHER_INELIGIBLE_REASON } from './billingErrorCodes'

/**
 * Dịch và format lý do không đủ điều kiện dùng voucher.
 *
 * Luôn ưu tiên mã máy `voucher.ineligibleReasonCode` (xem
 * `VOUCHER_INELIGIBLE_REASON`) để map sang i18n. Tuyệt đối không so khớp
 * nội dung message trả về từ backend vì message thay đổi theo thời gian
 * và không mang tính ổn định để rẽ nhánh.
 *
 * @param {object|string} voucher - voucher item hoặc chuỗi lý do legacy
 * @param {object} tc - `t.billing.checkoutClass`
 * @param {object} [context] - `{ orderAmount, category }`
 */
export const translateIneligibleReason = (voucher, tc, context = {}) => {
  const { orderAmount, category } = context
  const code = typeof voucher === 'object' && voucher !== null
    ? voucher.ineligibleReasonCode
    : undefined

  switch (code) {
    case VOUCHER_INELIGIBLE_REASON.expired:
      return tc.reasonExpired || tc.categoryExpired || tc.ineligible
    case VOUCHER_INELIGIBLE_REASON.exhausted:
      return tc.reasonExhausted || tc.categoryExhausted || tc.ineligible
    case VOUCHER_INELIGIBLE_REASON.perUserLimit:
      return tc.reasonPerUserLimit || tc.categoryExhausted || tc.ineligible
    case VOUCHER_INELIGIBLE_REASON.newUserOnly:
      return tc.reasonNewUserOnly || tc.ineligible
    case VOUCHER_INELIGIBLE_REASON.minLearners: {
      const count = voucher?.minLearners
      if (count === undefined || count === null) return tc.ineligible
      return (tc.reasonMinLearners || tc.ineligible).replace('{{count}}', String(count))
    }
    case VOUCHER_INELIGIBLE_REASON.minOrderAmount: {
      const minAmount = voucher?.minOrderAmount
      if (minAmount === undefined || minAmount === null || orderAmount === undefined || orderAmount === null) {
        return tc.ineligible
      }
      return (tc.reasonMinOrder || tc.ineligible)
        .replace('{{minAmount}}', formatCurrency(minAmount))
        .replace('{{currentAmount}}', formatCurrency(orderAmount))
    }
    default:
      break
  }

  // Fallback khi backend chưa gửi code (chênh phiên bản deploy):
  // suy ra từ category của danh sách, vốn đã là hằng nội bộ của UI.
  if (category === 'expired') return tc.reasonExpired || tc.categoryExpired || tc.ineligible
  if (category === 'out_of_uses') return tc.reasonExhausted || tc.categoryExhausted || tc.ineligible
  return tc.ineligible
}
