import { Component, computed, input } from '@angular/core';
import { AnswerResult, SurveyDetail } from '../../interfaces/survey';

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

  // A, B, C, ...
  getLetter(index: number) {
    return String.fromCharCode(65 + index);
  }
}
