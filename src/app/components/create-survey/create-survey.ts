import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  survey = new FormControl('',{
    validators:[Validators.required]
  })
}
