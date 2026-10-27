import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../../supabase-service';
import { SURVEY_CATEGORIES } from '../../constants/categories';
import { SurveyOutput } from '../../interfaces/survey';
import { SurveyService } from '../../services/survey-service';
import { SurveyCard } from '../survey-card/survey-card';

/** List of all surveys, filterable by status and category */
@Component({
  imports: [SurveyCard],
  selector: 'app-survey-list',
  styleUrl: './survey-list.scss',
  templateUrl: './survey-list.html',
})
export class SurveyList implements OnInit {
  private supabaseService = inject(SupabaseService);
  private surveyService = inject(SurveyService);

  surveys = signal<SurveyOutput[]>([]);
  errorMessage = signal('');
  // Active and past surveys are never shown together
  activeFilter = signal<'active' | 'past'>('active');

  categories = SURVEY_CATEGORIES;
  // Empty string means "All surveys"
  selectedCategory = signal('');

  /** Surveys matching the selected status and category */
  filteredSurveys = computed(() => {
    const category = this.selectedCategory();
    const status = this.activeFilter();
    return this.surveys().filter((survey) => {
      if (category && survey.category !== category) return false;
      return this.surveyService.isExpired(survey.endDate) === (status === 'past');
    });
  });

  /** Sets the category filter from the select element */
  setCategory(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

  /** Switches between active and past surveys */
  setFilter(filter: 'active' | 'past'): void {
    this.activeFilter.set(filter);
  }

  /** Loads all surveys */
  ngOnInit(): void {
    this.loadSurveys();
  }

  /** Loads all surveys and shows an error message if that fails */
  async loadSurveys(): Promise<void> {
    try {
      this.surveys.set(await this.supabaseService.getSurveys());
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Surveys could not be loaded.');
    }
  }
}
