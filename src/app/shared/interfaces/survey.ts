// ---- Table rows (from Supabase) ----
export interface Answer {
  id: number;
  created_at: string;
  group_id: number;
  text: string;
  user_id: string;
  position: number;
  question_id: number;
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
  group_id: number;
  question: string;
  allow_multiple: boolean;
  user_id: string;
}

export interface Vote {
  id: number;
  created_at: string;
  group_id: number;
  answer_id: number;
  user_id: string;
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
