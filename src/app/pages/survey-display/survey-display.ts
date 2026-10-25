import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Results } from '../../shared/components/results/results';
import { SurveyAnswer } from '../../shared/components/survey-answer/survey-answer';
import {
  AnswerResult,
  QuestionDetail,
  Selections,
  SurveyDetail,
} from '../../shared/interfaces/survey';
import { SurveyService } from '../../shared/services/survey-service';

@Component({
  imports: [Results, SurveyAnswer],
  selector: 'app-survey-display',
  styleUrl: './survey-display.scss',
  templateUrl: './survey-display.html',
})
export class SurveyDisplay implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);

  survey = signal<SurveyDetail | null>(null);
  selections = signal<Selections>({});
  results = signal<AnswerResult[]>([]);
  hasVoted = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');

  isExpired = computed(() => this.surveyService.isExpired(this.survey()?.endDate ?? null));
  canSubmit = computed(() => {
    const survey = this.survey();
    return (
      !!survey &&
      !this.hasVoted() &&
      !this.isExpired() &&
      !this.isSaving() &&
      this.surveyService.isComplete(survey, this.selections())
    );
  });

  async ngOnInit() {
    const groupId = Number(this.route.snapshot.paramMap.get('group_id'));
    try {
      const survey = await this.surveyService.loadSurvey(groupId);
      this.survey.set(survey);
      await this.refreshVotes(survey);
    } catch (error) {
      console.error(error);
      this.errorMessage.set('The survey could not be loaded.');
    } finally {
      this.isLoading.set(false);
    }
  }

  isSelected(question: QuestionDetail, answerId: number) {
    return (this.selections()[question.id] ?? []).includes(answerId);
  }

  onSelect(question: QuestionDetail, answerId: number) {
    this.selections.update((current) =>
      this.surveyService.toggleSelection(current, question, answerId),
    );
  }

  async submit() {
    const survey = this.survey();
    if (!survey || !this.canSubmit()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    try {
      await this.surveyService.submitVotes(survey, this.selections());
      await this.refreshVotes(survey);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error instanceof Error ? error.message : 'Voting failed.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async refreshVotes(survey: SurveyDetail) {
    const state = await this.surveyService.loadVoteState(survey);
    this.results.set(state.results);
    this.hasVoted.set(state.hasVoted);
  }
}
