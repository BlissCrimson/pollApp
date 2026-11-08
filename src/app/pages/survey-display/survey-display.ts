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
import { REFRESH_DEBOUNCE_MS } from '../../shared/constants/variables';

/**
 * Survey detail page: voting on the left, live results on the right.
 *
 * @remarks
 * The survey is identified by the `groups_id` route parameter. After loading,
 * the component subscribes to vote changes and refreshes the results
 * automatically. Until the user has voted, the current selection is previewed
 * in the displayed results.
 */
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
  /** Pending timer for the debounced results refresh. */
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  /** Template helper: maps a category key to its display label. */
  getCategoryLabel = getCategoryLabel;

  /** Letters A-Z used to label the answer options in the template. */
  letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  /** The loaded survey, or `null` while loading or if loading failed. */
  survey = signal<SurveyDetail | null>(null);

  /** Answer IDs currently selected by the user, keyed by question ID. */
  selections = signal<Selections>({});

  /** Vote results as last loaded from the backend. */
  results = signal<AnswerResult[]>([]);

  /** Whether the current user has already voted in this survey. */
  hasVoted = signal(false);

  /** `true` while the survey is being loaded. */
  isLoading = signal(true);

  /** `true` while votes are being submitted. */
  isSaving = signal(false);

  /** Error message to display; empty string if there is no error. */
  errorMessage = signal('');

  /** Whether the results panel is expanded (relevant on mobile). */
  resultsOpen = signal(true);

  /** Whether the survey's end date has passed. */
  isExpired = computed(() => this.surveyService.isExpired(this.survey()?.endDate ?? null));

  /**
   * Whether the vote can be submitted.
   *
   * @remarks
   * Requires a loaded survey, no previous vote, a non-expired survey, no
   * running save and a complete selection.
   */
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

  /**
   * Loads the survey and its votes, then listens for new votes.
   *
   * @remarks
   * On failure an error message is set. The loading flag is always reset.
   */
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

  /**
   * Checks whether an answer is currently selected for a question.
   *
   * @param question - The question the answer belongs to.
   * @param answerId - ID of the answer to check.
   * @returns `true` if the answer is selected.
   */
  isSelected(question: QuestionDetail, answerId: number): boolean {
    return (this.selections()[question.id] ?? []).includes(answerId);
  }

  /**
   * Updates the selection when the user picks an answer.
   *
   * @param question - The question the answer belongs to.
   * @param answerId - ID of the picked answer.
   */
  onSelect(question: QuestionDetail, answerId: number): void {
    this.selections.update((current) =>
      this.surveyService.toggleSelection(current, question, answerId),
    );
  }

  /** Shows or hides the results (mobile). */
  toggleResults(): void {
    this.resultsOpen.update((open) => !open);
  }

  /**
   * Saves the selected answers and shows the updated results.
   *
   * @remarks
   * Does nothing if there is no survey or {@link SurveyDisplay.canSubmit} is `false`.
   */
  async submit(): Promise<void> {
    const survey = this.survey();
    if (!survey || !this.canSubmit()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    await this.saveVotes(survey);
    this.isSaving.set(false);
  }

  /**
   * Submits the votes and reloads the results; shows an error message if that fails.
   *
   * @param survey - The survey the votes belong to.
   */
  private async saveVotes(survey: SurveyDetail): Promise<void> {
    try {
      await this.surveyService.submitVotes(survey, this.selections());
      await this.refreshVotes(survey);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error instanceof Error ? error.message : 'Voting failed.');
    }
  }

  /**
   * Live results: reloads the votes when anyone votes.
   *
   * @remarks
   * Refreshes are debounced by `REFRESH_DEBOUNCE_MS`, because one vote may
   * insert several rows. The subscription and pending timer are cleaned up
   * when the component is destroyed.
   *
   * @param survey - The survey to watch.
   */
  private listenForVotes(survey: SurveyDetail): void {
    const stopWatching = this.surveyService.watchVotes(survey, () => {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(
        () => this.refreshVotes(survey).catch(console.error),
        REFRESH_DEBOUNCE_MS,
      );
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.refreshTimer);
      stopWatching();
    });
  }

  /**
   * Reloads the votes and updates results and voted state.
   *
   * @param survey - The survey to load the votes for.
   */
  private async refreshVotes(survey: SurveyDetail): Promise<void> {
    const state = await this.surveyService.loadVoteState(survey);
    this.results.set(state.results);
    this.hasVoted.set(state.hasVoted);
  }

  /**
   * Results shown on the page.
   *
   * @remarks
   * Until the user has voted (and while the survey is not expired), the
   * current selection is included as a preview. Otherwise the loaded results
   * are shown unchanged.
   */
  displayedResults = computed(() => {
    const survey = this.survey();
    if (!survey || this.hasVoted() || this.isExpired()) return this.results();
    return this.surveyService.previewResults(this.results(), survey, this.selections());
  });
}
