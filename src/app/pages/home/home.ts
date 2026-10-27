import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CreateSurvey } from '../../shared/components/create-survey/create-survey';
import { EndingSurveys } from '../../shared/components/ending-surveys/ending-surveys';
import { SurveyList } from '../../shared/components/survey-list/survey-list';

/** Home page with hero, ending soon surveys, survey list and the create survey dialog */
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

  /** Opens the dialog when the header button links here with ?create=1 */
  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.has('create')) this.openCreateSurvey();
  }

  /** Opens the create survey dialog (overlay, no route) */
  openCreateSurvey(): void {
    this.isCreateOpen.set(true);
  }

  /** Closes the create survey dialog */
  closeCreateSurvey(): void {
    this.isCreateOpen.set(false);
  }

  /** Reloads both lists so the new survey shows up */
  reloadSurveys(): void {
    this.endingSurveys().loadSurveys();
    this.surveyList().loadSurveys();
  }
}
