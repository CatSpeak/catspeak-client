export const INITIAL_INVOICES = [
  {
    id: "inv_1A2B3C",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    planName: "Free Plan",
    amount: 0,
    status: "paid",
  },
]
