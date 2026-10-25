import { Component, input, output } from '@angular/core';
import { AnswerDetail } from '../../interfaces/survey';

@Component({
  imports: [],
  selector: 'app-survey-answer',
  styleUrl: './survey-answer.scss',
  templateUrl: './survey-answer.html',
})
export class SurveyAnswer {
  answer = input.required<AnswerDetail>();
  allowMultiple = input(false);
  letter = input('');
  name = input.required<string>();
  checked = input(false);
  disabled = input(false);

  selected = output<number>();
}
