import { Component, signal, viewChild } from '@angular/core';
import { CreateSurvey } from '../../shared/components/create-survey/create-survey';
import { EndingSurveys } from '../../shared/components/ending-surveys/ending-surveys';
import { SurveyList } from '../../shared/components/survey-list/survey-list';

@Component({
  imports: [CreateSurvey, EndingSurveys, SurveyList],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  isCreateOpen = signal(false);

  private endingSurveys = viewChild.required(EndingSurveys);
  private surveyList = viewChild.required(SurveyList);

  // Open the create survey dialog (overlay, no route)
  openCreateSurvey() {
    this.isCreateOpen.set(true);
  }

  closeCreateSurvey() {
    this.isCreateOpen.set(false);
  }

  // Reload both lists so the new survey shows up
  reloadSurveys() {
    this.endingSurveys().loadSurveys();
    this.surveyList().loadSurveys();
  }
}
