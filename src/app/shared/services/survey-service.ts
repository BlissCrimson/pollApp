import { inject, Service } from '@angular/core';
import { SupabaseService, todayIsoDate } from '../../supabase-service';
import {
  AnswerResult,
  QuestionDetail,
  Selections,
  SurveyDetail,
  SurveyDetailRow,
  VoteRow,
  VoteState,
} from '../interfaces/survey';

/** Survey logic: mapping, vote results, selections and voting rules */
@Service()
export class SurveyService {
  private supabaseService = inject(SupabaseService);

  /** Loads a survey and maps it for display; answers are sorted by position */
  async loadSurvey(groupId: number): Promise<SurveyDetail> {
    const row = await this.supabaseService.getSurveyWithQuestions(groupId);
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      endDate: row.end_date,
      description: row.description,
      questions: [...row.questions].sort((a, b) => a.id - b.id).map((q) => this.mapQuestion(q)),
    };
  }

  /** Maps a question row for display; answers are sorted by position */
  private mapQuestion(question: SurveyDetailRow['questions'][number]): QuestionDetail {
    return {
      id: question.id,
      question: question.question,
      allowMultiple: question.allow_multiple,
      answers: [...question.answers].sort((a, b) => a.position - b.position),
    };
  }

  /** Loads the votes and returns the results plus whether the current user already voted */
  async loadVoteState(survey: SurveyDetail): Promise<VoteState> {
    const [votes, userId] = await Promise.all([
      this.supabaseService.getVotesByGroup(survey.id),
      this.supabaseService.getUserId(),
    ]);
    return {
      results: this.calculateResults(votes, survey),
      hasVoted: votes.some((vote) => vote.user_id === userId),
    };
  }

  /** Calls onChange when someone votes; returns a function that stops listening */
  watchVotes(survey: SurveyDetail, onChange: () => void): () => void {
    return this.supabaseService.subscribeToVotes(survey.id, onChange);
  }

  /** Share of votes per answer, relative to all votes of the same question */
  calculateResults(votes: VoteRow[], survey: SurveyDetail): AnswerResult[] {
    return survey.questions.flatMap((question) => {
      const counts = question.answers.map(
        (answer) => votes.filter((vote) => vote.answer_id === answer.id).length,
      );
      const total = counts.reduce((sum, count) => sum + count, 0);
      return question.answers.map((answer, i) => ({
        answerId: answer.id,
        votes: counts[i],
        percent: total ? Math.round((counts[i] / total) * 100) : 0,
      }));
    });
  }

  /** True if the end date lies before today; surveys without end date never expire */
  isExpired(endDate: string | null): boolean {
    if (!endDate) return false;
    return endDate < todayIsoDate();
  }

  /** Returns new selections: single choice replaces the answer, multiple choice toggles it */
  toggleSelection(selections: Selections, question: QuestionDetail, answerId: number): Selections {
    const current = selections[question.id] ?? [];
    if (!question.allowMultiple) return { ...selections, [question.id]: [answerId] };
    const next = current.includes(answerId)
      ? current.filter((id) => id !== answerId)
      : [...current, answerId];
    return { ...selections, [question.id]: next };
  }

  /** True if every question has at least one selected answer */
  isComplete(survey: SurveyDetail, selections: Selections): boolean {
    return survey.questions.every((question) => (selections[question.id] ?? []).length > 0);
  }

  /** Saves the selected answers as votes; throws if the survey ended or is incomplete */
  async submitVotes(survey: SurveyDetail, selections: Selections): Promise<void> {
    if (this.isExpired(survey.endDate)) throw new Error('This survey has ended.');
    if (!this.isComplete(survey, selections)) throw new Error('Please answer every question.');
    const answerIds = survey.questions.flatMap((question) => selections[question.id]);
    await this.supabaseService.insertVotes(survey.id, answerIds);
  }
}
