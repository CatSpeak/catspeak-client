/**
 * ISS-74: invoices created before `orderCode` existed render as "#null" /
 * "#undefined". Never leak those placeholders into the billing UI.
 *
 * @param {{ orderCode?: unknown, paymentId?: unknown } | null | undefined} invoice
 * @returns {string} display label, e.g. "#123456", "#PAY-99" or "—"
 */
export function formatOrderCode(invoice) {
  const code = invoice?.orderCode
  if (code != null && String(code).trim() !== "") {
    return `#${String(code).trim()}`
  }

  const paymentId = invoice?.paymentId
  if (paymentId != null && String(paymentId).trim() !== "") {
    return `#PAY-${String(paymentId).trim()}`
  }

  return "—"
}

export default formatOrderCode
