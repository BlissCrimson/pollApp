import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { QuestionInput, SurveyInput, SurveyOutput } from './shared/interfaces/survey';

@Service()
export class SupabaseService {
  readonly supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  // Loads all surveys, sorted by end date
  async getSurveys(): Promise<SurveyOutput[]> {
    const { data, error } = await this.supabase
      .from('groups')
      .select('id, title, category, end_date')
      .order('end_date', { ascending: true });
    if (error) throw error;
    return this.mapSurveys(data);
  }

  // Loads the next surveys that have not ended yet, earliest end date first
  async getEndingSoonSurveys(limit = 3): Promise<SurveyOutput[]> {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await this.supabase
      .from('groups')
      .select('id, title, category, end_date')
      .gte('end_date', today)
      .order('end_date', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return this.mapSurveys(data);
  }

  // Loads a single survey (group) by its id
  async getSurveyById(id: number): Promise<SurveyOutput> {
    const { data, error } = await this.supabase
      .from('groups')
      .select('id, title, category, end_date')
      .eq('id', id)
      .single();
    if (error) throw error;
    return this.mapSurveys([data])[0];
  }

  private mapSurveys(
    rows: { id: number; title: string; category: string | null; end_date: string | null }[],
  ): SurveyOutput[] {
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      endDate: row.end_date,
    }));
  }

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
