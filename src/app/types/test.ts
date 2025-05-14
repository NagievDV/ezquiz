export type TestType = 'quiz' | 'test';

export type QuestionType = "single" | "multiple" | "match" | "order";

export interface Tag {
  _id: string;
  name: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface BaseQuestion {
  _id?: string;
  type: QuestionType;
  question: string;
  points: number;
  imageUrl?: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single";
  options: string[];
  correctAnswer: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple";
  options: string[];
  correctAnswer: string[];
}

export interface OrderQuestion extends BaseQuestion {
  type: "order";
  order: string[];
}

export interface MatchQuestion extends BaseQuestion {
  type: "match";
  matchPairs: { left: string; right: string }[];
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | OrderQuestion | MatchQuestion;

export interface Test {
  _id?: string;
  title: string;
  description: string;
  type: "quiz" | "test";
  tags: Tag[];
  questions: Question[];
  imageUrl?: string;
  author?: string;
} 