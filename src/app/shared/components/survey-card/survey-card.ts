import { Component, computed, input } from '@angular/core';
import { SurveyOutput } from '../../interfaces/survey';

@Component({
  imports: [],
  selector: 'app-survey-card',
  styleUrl: './survey-card.scss',
  templateUrl: './survey-card.html',
})
export class SurveyCard {
  survey = input.required<SurveyOutput>();
  variant = input<'light' | 'dark'>('dark');

  // Label like "Ends in 2 Days", "Ends today" or "Ended"
  endLabel = computed(() => {
    const endDate = this.survey().endDate;
    if (!endDate) return '';
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / msPerDay);
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    return `Ends in ${days} ${days === 1 ? 'Day' : 'Days'}`;
  });
}
