// ICSE Class 10 Pricing Configuration

export const PRICING = {
  free: {
    dailyQuestions: 10,
    features: ["Basic practice", "Score tracking"],
  },
  premium: {
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    currency: "USD",
    features: [
      "Unlimited questions",
      "AI tutor & explanations",
      "Full mock exams",
      "Score prediction",
      "Offline mode",
      "Priority support",
    ],
  },
} as const;
