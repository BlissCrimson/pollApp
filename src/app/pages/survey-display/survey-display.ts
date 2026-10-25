import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Results } from '../../shared/components/results/results';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyOutput } from '../../shared/interfaces/survey';
import { SupabaseService } from '../../supabase-service';
import { SurveyAnswer } from '../../shared/components/survey-answer/survey-answer';

@Component({
  imports: [Results, SurveyCard, SurveyAnswer],
  selector: 'app-survey-display',
  styleUrl: './survey-display.scss',
  templateUrl: './survey-display.html',
})
export class SurveyDisplay implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  survey = signal<SurveyOutput | null>(null);

  async ngOnInit() {
    const groupId = Number(this.route.snapshot.paramMap.get('group_id'));
    try {
      this.survey.set(await this.supabaseService.getSurveyById(groupId));
    } catch (error) {
      console.error(error);
    }
  }
}
