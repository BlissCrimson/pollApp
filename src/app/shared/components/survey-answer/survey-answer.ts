import { Component, inject, output, signal } from '@angular/core';
import { SurveyOutput } from '../../interfaces/survey';

@Component({
  imports: [],
  selector: 'app-survey-answer',
  styleUrl: './survey-answer.scss',
  templateUrl: './survey-answer.html',
})
export class SurveyAnswer {

  answers = signal([])
  survey = signal<SurveyOutput | null>(null);
}
