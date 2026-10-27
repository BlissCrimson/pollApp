// ---- Table rows (from Supabase) ----
/** Answer row as stored in Supabase */
export interface Answer {
  id: number;
  created_at: string;
  groups_id: number;
  text: string;
  user_id: string;
  position: number;
  questions_id: number;
}

/** Survey (group) row as stored in Supabase */
export interface Groups {
  id: number;
  created_at: string;
  category: string;
  end_date: string;
  description: string;
  title: string;
  user_id: string;
}

/** Question row as stored in Supabase */
export interface Question {
  id: number;
  created_at: string;
  groups_id: number;
  question: string;
  allow_multiple: boolean;
  user_id: string;
}

/** Vote row as stored in Supabase */
export interface Vote {
  id: number;
  created_at: string;
  groups_id: number;
  answer_id: number;
  user_id: string;
}

/** Selectable survey category */
export interface Category {
  value: string;
  label: string;
}

// ---- Insert types (to Supabase) ----

// ---- Form data ----
/** Data of the create survey form */
export interface SurveyInput {
  title: string;
  category: string | null;
  endDate: string | null;
  description: string | null;
  questions: QuestionInput[];
}

/** Question with its answer texts from the create survey form */
export interface QuestionInput {
  question: string;
  allowMultiple: boolean;
  answers: string[];
}

// ---- Joined data for display ----

/** Survey as shown in lists and cards */
export interface SurveyOutput {
  id: number;
  title: string;
  category: string | null;
  endDate: string | null;
}

/** Survey with questions and answers as returned by Supabase (snake_case) */
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

/** Minimal vote row used to calculate results */
export interface VoteRow {
  answer_id: number;
  user_id: string;
}

/** Survey with questions and answers, mapped for display */
export interface SurveyDetail {
  id: number;
  title: string;
  category: string | null;
  endDate: string | null;
  description: string | null;
  questions: QuestionDetail[];
}

/** Question with its answers, mapped for display */
export interface QuestionDetail {
  id: number;
  question: string;
  allowMultiple: boolean;
  answers: AnswerDetail[];
}

/** Answer option of a question */
export interface AnswerDetail {
  id: number;
  text: string;
  position: number;
}

/** Selected answer ids per question id */
export type Selections = Record<number, number[]>;

/** Vote count and percentage of one answer */
export interface AnswerResult {
  answerId: number;
  votes: number;
  percent: number;
}

/** Results of a survey plus whether the current user already voted */
export interface VoteState {
  results: AnswerResult[];
  hasVoted: boolean;
}
