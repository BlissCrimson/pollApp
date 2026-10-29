import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);
  isCreateOpen = signal(false);
  /** Id of the survey that was just published; shows the confirmation overlay */
  createdSurveyId = signal<number | null>(null);

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

  /** Shows the confirmation overlay and refreshes the lists after a survey was published */
  onSurveyCreated(surveyId: number): void {
    this.createdSurveyId.set(surveyId);
    this.reloadSurveys();
  }

  /** Closes the confirmation overlay and opens the newly created survey */
  openCreatedSurvey(): void {
    const surveyId = this.createdSurveyId();
    if (surveyId === null) return;
    this.createdSurveyId.set(null);
    this.router.navigate(['/survey-display', surveyId]);
  }

  /** Reloads both lists so the new survey shows up */
  reloadSurveys(): void {
    this.endingSurveys().loadSurveys();
    this.surveyList().loadSurveys();
  }
}
