// ---- Table rows (from Supabase) ----
export interface Answer {
  id: number;
  created_at: string;
  groups_id: number;
  text: string;
  user_id: string;
  position: number;
  questions_id: number;
}

export interface Groups {
  id: number;
  created_at: string;
  category: string;
  end_date: string;
  description: string;
  title: string;
  user_id: string;
}

export interface Question {
  id: number;
  created_at: string;
  groups_id: number;
  question: string;
  allow_multiple: boolean;
  user_id: string;
}

export interface Vote {
  id: number;
  created_at: string;
  groups_id: number;
  answer_id: number;
  user_id: string;
}

export interface Category {
  value: string;
  label: string;
}

// ---- Insert types (to Supabase) ----

// ---- Form data ----
export interface SurveyInput {
  title: string;
  category: string | null;
  endDate: string | null;
  description: string | null;
  questions: QuestionInput[];
}

export interface QuestionInput {
  question: string;
  allowMultiple: boolean;
  answers: string[];
}

// ---- Joined data for display ----

export interface SurveyOutput {
  id: number;
  title: string;
  category: string | null;
  endDate: string | null;
}

// Survey with its questions and answers, as returned by Supabase (snake_case)
export interface SurveyDetailRow {
  id: number;
  title: string;
  category: string | null;
  end_date: string | null;
  description: string | null;
  questions: {
    id: number;
    question: string;
    allow_multiple: boolean;
    answers: { id: number; text: string; position: number }[];
  }[];
}

export interface VoteRow {
  answer_id: number;
  user_id: string;
}

// Survey with its questions and answers, mapped for display
export interface SurveyDetail {
  id: number;
  title: string;
  category: string | null;
  endDate: string | null;
  description: string | null;
  questions: QuestionDetail[];
}

export interface QuestionDetail {
  id: number;
  question: string;
  allowMultiple: boolean;
  answers: AnswerDetail[];
}

export interface AnswerDetail {
  id: number;
  text: string;
  position: number;
}

// Selected answer ids per question id
export type Selections = Record<number, number[]>;

export interface AnswerResult {
  answerId: number;
  votes: number;
  percent: number;
}

export interface VoteState {
  results: AnswerResult[];
  hasVoted: boolean;
}
