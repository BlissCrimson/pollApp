export interface QuestionInput {
  question: string;
  allowMultiple: boolean;
  answers: string[];
}

export interface SurveyInput {
  title: string;
  category: string | null;
  endDate: string | null;
  description: string | null;
  questions: QuestionInput[];
}

export interface SurveyOutput {
  id: number;
  title: string;
  category: string | null;
  endDate: string | null;
}
