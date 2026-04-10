import { describe, it, expect } from "vitest";
import { canAccessQuestion, getRemainingFreeQuestions } from "@/lib/icse-class-10/entitlement";

describe("Entitlement", () => {
  it("allows premium users unlimited access", () => {
    expect(canAccessQuestion({ isAuthenticated: true, premiumActive: true, dailyQuestionsUsed: 100, dailyQuestionsLimit: 10 })).toBe(true);
  });

  it("blocks free users at daily limit", () => {
    expect(canAccessQuestion({ isAuthenticated: true, premiumActive: false, dailyQuestionsUsed: 10, dailyQuestionsLimit: 10 })).toBe(false);
  });

  it("returns remaining free questions", () => {
    expect(getRemainingFreeQuestions({ isAuthenticated: true, premiumActive: false, dailyQuestionsUsed: 7, dailyQuestionsLimit: 10 })).toBe(3);
  });

  it("returns Infinity for premium", () => {
    expect(getRemainingFreeQuestions({ isAuthenticated: true, premiumActive: true, dailyQuestionsUsed: 0, dailyQuestionsLimit: 10 })).toBe(Infinity);
  });
});
