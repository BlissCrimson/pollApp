import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

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

@Service()
export class SupabaseService {
  readonly supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  // Saves survey, questions and answers; removes the survey again if a later step fails
  async createSurvey(survey: SurveyInput) {
    const surveyId = await this.insertSurvey(survey);
    try {
      const questionIds = await this.insertQuestions(surveyId, survey.questions);
      await this.insertAnswers(questionIds, survey.questions);
    } catch (error) {
      await this.supabase.from('groups').delete().eq('id', surveyId);
      throw error;
    }
    return surveyId;
  }

  // Returns the current user id; signs in anonymously if there is no session yet
  private async getUserId() {
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (sessionData.session) return sessionData.session.user.id;
    const { data, error } = await this.supabase.auth.signInAnonymously();
    if (error || !data.user) throw error ?? new Error('Anonymous sign-in failed');
    return data.user.id;
  }

  private async insertSurvey(survey: SurveyInput) {
    const userId = await this.getUserId();
    const { data, error } = await this.supabase
      .from('groups')
      .insert({
        user_id: userId,
        title: survey.title,
        category: survey.category,
        end_date: survey.endDate,
        description: survey.description,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  private async insertQuestions(surveyId: number, questions: QuestionInput[]) {
    const rows = questions.map((q) => ({
      group_id: surveyId,
      question: q.question,
      allow_multiple: q.allowMultiple,
    }));
    const { data, error } = await this.supabase.from('questions').insert(rows).select('id');
    if (error) throw error;
    return data.map((row) => row.id);
  }

  private async insertAnswers(questionIds: number[], questions: QuestionInput[]) {
    const rows = questions.flatMap((q, qi) =>
      q.answers.map((text, position) => ({ group_id: questionIds[qi], position, text })),
    );
    const { error } = await this.supabase.from('answers').insert(rows);
    if (error) throw error;
  }
}
