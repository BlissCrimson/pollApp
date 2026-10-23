import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../../supabase-service';
import { SurveyOutput } from '../../interfaces/survey';

@Component({
  imports: [],
  selector: 'app-ending-surveys',
  styleUrl: './ending-surveys.scss',
  templateUrl: './ending-surveys.html',
})
export class EndingSurveys implements OnInit {
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

  // Returns a label like "Ends in 2 Days", "Ends today" or "Ended"
  getEndLabel(endDate: string | null) {
    if (!endDate) return '';
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / msPerDay);
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    return `Ends in ${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
}
