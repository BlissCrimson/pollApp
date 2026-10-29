import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getCategoryLabel } from '../../shared/constants/categories';
import { Results } from '../../shared/components/results/results';
import { SurveyAnswer } from '../../shared/components/survey-answer/survey-answer';
import {
  AnswerResult,
  QuestionDetail,
  Selections,
  SurveyDetail,
} from '../../shared/interfaces/survey';
import { SurveyService } from '../../shared/services/survey-service';

const REFRESH_DEBOUNCE_MS = 300;

/** Survey detail page: voting on the left, live results on the right */
@Component({
  imports: [DatePipe, Results, RouterLink, SurveyAnswer],
  selector: 'app-survey-display',
  styleUrl: './survey-display.scss',
  templateUrl: './survey-display.html',
})
export class SurveyDisplay implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private destroyRef = inject(DestroyRef);
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  getCategoryLabel = getCategoryLabel;
  letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  survey = signal<SurveyDetail | null>(null);
  selections = signal<Selections>({});
  results = signal<AnswerResult[]>([]);
  hasVoted = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');
  /** Mobile only: the results can be collapsed below the survey */
  resultsOpen = signal(true);

  /** True if the survey end date has passed */
  isExpired = computed(() => this.surveyService.isExpired(this.survey()?.endDate ?? null));
  /** True if the user may submit: not voted, not expired, not saving and all questions answered */
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

  /** Loads the survey and its votes, then listens for new votes */
  async ngOnInit(): Promise<void> {
    const groupId = Number(this.route.snapshot.paramMap.get('groups_id'));
    try {
      const survey = await this.surveyService.loadSurvey(groupId);
      this.survey.set(survey);
      await this.refreshVotes(survey);
      this.listenForVotes(survey);
    } catch (error) {
      console.error(error);
      this.errorMessage.set('The survey could not be loaded.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** True if the answer is currently selected for the question */
  isSelected(question: QuestionDetail, answerId: number): boolean {
    return (this.selections()[question.id] ?? []).includes(answerId);
  }

  /** Updates the selection when the user picks an answer */
  onSelect(question: QuestionDetail, answerId: number): void {
    this.selections.update((current) =>
      this.surveyService.toggleSelection(current, question, answerId),
    );
  }

  /** Shows or hides the results (mobile) */
  toggleResults(): void {
    this.resultsOpen.update((open) => !open);
  }

  /** Saves the selected answers and shows the updated results */
  async submit(): Promise<void> {
    const survey = this.survey();
    if (!survey || !this.canSubmit()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    await this.saveVotes(survey);
    this.isSaving.set(false);
  }

  /** Submits the votes and reloads the results; shows an error message if that fails */
  private async saveVotes(survey: SurveyDetail): Promise<void> {
    try {
      await this.surveyService.submitVotes(survey, this.selections());
      await this.refreshVotes(survey);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error instanceof Error ? error.message : 'Voting failed.');
    }
  }

  /** Live results: reloads the votes when anyone votes (debounced, one vote may insert several rows) */
  private listenForVotes(survey: SurveyDetail): void {
    const stopWatching = this.surveyService.watchVotes(survey, () => {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => this.refreshVotes(survey).catch(console.error), REFRESH_DEBOUNCE_MS);
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.refreshTimer);
      stopWatching();
    });
  }

  /** Reloads the votes and updates results and voted state */
  private async refreshVotes(survey: SurveyDetail): Promise<void> {
    const state = await this.surveyService.loadVoteState(survey);
    this.results.set(state.results);
    this.hasVoted.set(state.hasVoted);
  }
}
