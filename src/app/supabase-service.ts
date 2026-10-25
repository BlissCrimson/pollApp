import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import {
  QuestionInput,
  SurveyDetailRow,
  SurveyInput,
  SurveyOutput,
  VoteRow,
} from './shared/interfaces/survey';

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

  // Loads a survey including its questions and answers
  async getSurveyWithQuestions(id: number): Promise<SurveyDetailRow> {
    const { data, error } = await this.supabase
      .from('groups')
      .select(
        'id, title, category, end_date, description, questions(id, question, allow_multiple, answers(id, text, position))',
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as SurveyDetailRow;
  }

  // Loads all votes of a survey
  async getVotesByGroup(groupId: number): Promise<VoteRow[]> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('answer_id, user_id')
      .eq('group_id', groupId);
    if (error) throw error;
    return data;
  }

  // Calls onChange for every new vote of a survey; returns a function that stops listening
  subscribeToVotes(groupId: number, onChange: () => void): () => void {
    const channel = this.supabase
      .channel(`votes-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes', filter: `group_id=eq.${groupId}` },
        onChange,
      )
      .subscribe();
    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  // Saves one vote per selected answer for the current user
  async insertVotes(groupId: number, answerIds: number[]) {
    const userId = await this.getUserId();
    const rows = answerIds.map((answerId) => ({
      group_id: groupId,
      answer_id: answerId,
      user_id: userId,
    }));
    const { error } = await this.supabase.from('votes').insert(rows);
    if (error) throw error;
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
  async getUserId() {
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
      q.answers.map((text, position) => ({ question_id: questionIds[qi], position, text })),
    );
    const { error } = await this.supabase.from('answers').insert(rows);
    if (error) throw error;
  }
}
