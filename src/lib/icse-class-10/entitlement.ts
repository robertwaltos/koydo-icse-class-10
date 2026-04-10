// Premium Gate Logic

export interface UserEntitlement {
  isAuthenticated: boolean;
  premiumActive: boolean;
  dailyQuestionsUsed: number;
  dailyQuestionsLimit: number;
}

export function canAccessQuestion(entitlement: UserEntitlement): boolean {
  if (entitlement.premiumActive) return true;
  return entitlement.dailyQuestionsUsed < entitlement.dailyQuestionsLimit;
}

export function getRemainingFreeQuestions(entitlement: UserEntitlement): number {
  if (entitlement.premiumActive) return Infinity;
  return Math.max(0, entitlement.dailyQuestionsLimit - entitlement.dailyQuestionsUsed);
}
