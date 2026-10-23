import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../../supabase-service';
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

  // Unique, non-empty categories of the loaded surveys
  categories = computed(() => [
    ...new Set(this.surveys().map((survey) => survey.category).filter((category) => !!category)),
  ]);

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
