import { inject, Service } from '@angular/core';
import { SupabaseService } from '../../supabase-service';
import {
  AnswerResult,
  QuestionDetail,
  Selections,
  SurveyDetail,
  VoteRow,
  VoteState,
} from '../interfaces/survey';

@Service()
export class SurveyService {
  private supabaseService = inject(SupabaseService);

  // Loads a survey and maps it for display; answers are sorted by position
  async loadSurvey(groupId: number): Promise<SurveyDetail> {
    const row = await this.supabaseService.getSurveyWithQuestions(groupId);
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      endDate: row.end_date,
      description: row.description,
      questions: [...row.questions]
        .sort((a, b) => a.id - b.id)
        .map((q) => ({
          id: q.id,
          question: q.question,
          allowMultiple: q.allow_multiple,
          answers: [...q.answers].sort((a, b) => a.position - b.position),
        })),
    };
  }

  // Loads the votes and returns the results plus whether the current user already voted
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

  // Share of votes per answer, relative to all votes of the same question
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

  isExpired(endDate: string | null): boolean {
    if (!endDate) return false;
    return endDate < new Date().toISOString().slice(0, 10);
  }

  // Returns new selections: single choice replaces the answer, multiple choice toggles it
  toggleSelection(selections: Selections, question: QuestionDetail, answerId: number): Selections {
    const current = selections[question.id] ?? [];
    if (!question.allowMultiple) return { ...selections, [question.id]: [answerId] };
    const next = current.includes(answerId)
      ? current.filter((id) => id !== answerId)
      : [...current, answerId];
    return { ...selections, [question.id]: next };
  }

  // True if every question has at least one selected answer
  isComplete(survey: SurveyDetail, selections: Selections): boolean {
    return survey.questions.every((question) => (selections[question.id] ?? []).length > 0);
  }

  async submitVotes(survey: SurveyDetail, selections: Selections) {
    if (this.isExpired(survey.endDate)) throw new Error('This survey has ended.');
    if (!this.isComplete(survey, selections)) throw new Error('Please answer every question.');
    const answerIds = survey.questions.flatMap((question) => selections[question.id]);
    await this.supabaseService.insertVotes(survey.id, answerIds);
  }
}
