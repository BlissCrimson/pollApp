import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../../supabase-service';
import { SurveyOutput } from '../../interfaces/survey';
import { SurveyCard } from '../survey-card/survey-card';

/** List of surveys that end soon, earliest end date first */
@Component({
  imports: [SurveyCard],
  selector: 'app-ending-surveys',
  styleUrl: './ending-surveys.scss',
  templateUrl: './ending-surveys.html',
})
export class EndingSurveys implements OnInit {
  private supabaseService = inject(SupabaseService);

  surveys = signal<SurveyOutput[]>([]);

  /** Loads the surveys that end soon */
  ngOnInit(): void {
    this.loadSurveys();
  }

  /** Reloads the surveys that end soon */
  async loadSurveys(): Promise<void> {
    try {
      this.surveys.set(await this.supabaseService.getEndingSoonSurveys());
    } catch (error) {
      console.error(error);
    }
  }
}
