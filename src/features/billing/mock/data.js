export const PLANS = {
  free: {
    id: "free",
    name: "Free Plan",
    price: 0,
    interval: "month",
    description: "Perfect for getting started with CatSpeak.",
    features: [
      "Access to basic public rooms",
      "Standard video quality",
      "Up to 5 friends",
      "Ad-supported experience",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    price: 9.99,
    interval: "month",
    description: "Unlock the full CatSpeak experience.",
    features: [
      "Create private rooms",
      "HD video quality",
      "Unlimited friends",
      "Ad-free experience",
      "Custom profile badges",
      "Priority support",
    ],
  },
}

export const INITIAL_USER_PLAN = "free"

export const INITIAL_INVOICES = [
  {
    id: "inv_1A2B3C",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    planName: "Free Plan",
    amount: 0,
    status: "paid",
  },
]
