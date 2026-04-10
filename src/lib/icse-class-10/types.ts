// ICSE Class 10 Domain Types

export interface Question {
  id: string;
  examId: string;
  sectionId: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface Option {
  id: string;
  text: string;
}

export interface Attempt {
  id: string;
  userId: string;
  examId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  responses: Response[];
}

export interface Response {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentMs: number;
}
