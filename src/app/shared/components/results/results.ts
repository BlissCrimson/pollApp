import { Component, computed, input } from '@angular/core';
import { AnswerResult, SurveyDetail } from '../../interfaces/survey';

const FIRST_LETTER_CODE = 65;

/** Live results of a survey as bars per answer */
@Component({
  imports: [],
  selector: 'app-results',
  styleUrl: './results.scss',
  templateUrl: './results.html',
})
export class Results {
  survey = input<SurveyDetail | null>(null);
  results = input<AnswerResult[]>([]);

  percentByAnswer = computed(
    () => new Map(this.results().map((result) => [result.answerId, result.percent])),
  );

  /** True as soon as at least one vote exists */
  hasVotes = computed(() => this.results().some((result) => result.votes > 0));

  /** Returns the answer letter: A, B, C, ... */
  getLetter(index: number): string {
    return String.fromCharCode(FIRST_LETTER_CODE + index);
  }
}
