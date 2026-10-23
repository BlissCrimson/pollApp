import { Component, inject, OnInit, signal } from '@angular/core';
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

  async ngOnInit() {
    try {
      this.surveys.set(await this.supabaseService.getSurveys());
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Surveys could not be loaded.');
    }
  }
}
