import { Component, computed, inject, input } from '@angular/core';
import { getCategoryLabel } from '../../constants/categories';
import { SurveyOutput } from '../../interfaces/survey';
import { Router } from '@angular/router';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Card for one survey; opens the detail page on click */
@Component({
  imports: [],
  selector: 'app-survey-card',
  styleUrl: './survey-card.scss',
  templateUrl: './survey-card.html',
})
export class SurveyCard {
  private router = inject(Router);
  survey = input.required<SurveyOutput>();
  variant = input<'light' | 'dark'>('dark');

  /** Display label of the survey category */
  categoryLabel = computed(() => getCategoryLabel(this.survey().category));

  /** Label like "Ends in 2 Days", "Ends today" or "Ended" */
  endLabel = computed(() => {
    const endDate = this.survey().endDate;
    if (!endDate) return '';
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / MS_PER_DAY);
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    return `Ends in ${days} ${days === 1 ? 'Day' : 'Days'}`;
  });

  /** Opens the detail page of this survey */
  goToSurvey(): void {
    this.router.navigate(['/survey-display', this.survey().id]);
  }
}
