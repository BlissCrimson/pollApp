import { Component, computed, input } from '@angular/core';
import { AnswerResult, SurveyDetail } from '../../interfaces/survey';

const FIRST_LETTER_CODE = 65;

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

  /** Returns the answer letter: A, B, C, ... */
  getLetter(index: number): string {
    return String.fromCharCode(FIRST_LETTER_CODE + index);
  }
}
