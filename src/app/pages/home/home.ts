import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CreateSurvey } from '../../shared/components/create-survey/create-survey';
import { EndingSurveys } from '../../shared/components/ending-surveys/ending-surveys';
import { SurveyList } from '../../shared/components/survey-list/survey-list';

@Component({
  imports: [CreateSurvey, EndingSurveys, SurveyList],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);
  isCreateOpen = signal(false);

  private endingSurveys = viewChild.required(EndingSurveys);
  private surveyList = viewChild.required(SurveyList);

  // Header button on the survey page links here with ?create=1
  ngOnInit() {
    if (this.route.snapshot.queryParamMap.has('create')) this.openCreateSurvey();
  }

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
