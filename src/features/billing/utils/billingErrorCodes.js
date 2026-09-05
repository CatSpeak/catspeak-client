/**
 * Machine-readable error/reason codes for the class-checkout flow.
 *
 * These mirror the backend catalogs and must stay in sync:
 * - `BILLING_ERROR_CODE` ↔ `cath_service.Constants.ErrorCodes`
 *   (catspeak-api) and the forwarded instructor gRPC codes.
 * - `VOUCHER_INELIGIBLE_REASON` ↔
 *   `catspeak_instructor_service.Exceptions.ErrorCode.Voucher`
 *   (sent as `ineligibleReasonCode` on each voucher item).
 *
 * Never compare backend messages or hardcode localized text to branch
 * on these cases — always switch on the codes below.
 */

export const BILLING_ERROR_CODE = Object.freeze({
  scheduleConflict: "CLASS_ENROLLMENT_SCHEDULE_CONFLICT",
  voucherUnavailable: "PAYMENT_VOUCHER_UNAVAILABLE",
  voucherDiscountChanged: "PAYMENT_VOUCHER_DISCOUNT_CHANGED",
})

export const VOUCHER_INELIGIBLE_REASON = Object.freeze({
  expired: "VOUCHER_EXPIRED",
  exhausted: "VOUCHER_EXHAUSTED",
  perUserLimit: "VOUCHER_PER_USER_LIMIT",
  newUserOnly: "VOUCHER_NEW_USER_ONLY",
  minLearners: "VOUCHER_MIN_LEARNERS",
  minOrderAmount: "VOUCHER_MIN_ORDER_AMOUNT",
})

/**
 * Backend embeds the offending voucher code in PAYMENT_VOUCHER_UNAVAILABLE
 * messages as `CODE:{voucherCode}|{detail}` so the client can drop exactly
 * that voucher from the order. Language-independent wire marker.
 */
export const VOUCHER_CODE_PREFIX = "CODE:"
