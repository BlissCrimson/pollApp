import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../../supabase-service';
import { SURVEY_CATEGORIES } from '../../constants/categories';
import { SurveyOutput } from '../../interfaces/survey';
import { SurveyCard } from '../survey-card/survey-card';

@Component({
  imports: [SurveyCard],
  selector: 'app-survey-list',
  styleUrl: './survey-list.scss',
  templateUrl: './survey-list.html',
})
export class SurveyList implements OnInit {
  private supabaseService = inject(SupabaseService);

  surveys = signal<SurveyOutput[]>([]);
  errorMessage = signal('');
  activeFilter = signal<'active' | 'past'>('active');

  categories = SURVEY_CATEGORIES;
  // Empty string means "All surveys"
  selectedCategory = signal('');

  filteredSurveys = computed(() => {
    const category = this.selectedCategory();
    if (!category) return this.surveys();
    return this.surveys().filter((survey) => survey.category === category);
  });

  setCategory(event: Event) {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

  // Only switches the visual state of the filter buttons for now
  setFilter(filter: 'active' | 'past') {
    this.activeFilter.set(filter);
  }

  async ngOnInit() {
    try {
      this.surveys.set(await this.supabaseService.getSurveys());
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Surveys could not be loaded.');
    }
  }
}
