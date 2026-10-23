import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EndingSurveys } from '../../shared/components/ending-surveys/ending-surveys';
import { SurveyList } from '../../shared/components/survey-list/survey-list';

@Component({
  imports: [EndingSurveys, SurveyList],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private router = inject(Router);

  // Navigate to the create survey page
  goToCreateSurvey() {
    this.router.navigate(['/create-survey']);
  }
}
