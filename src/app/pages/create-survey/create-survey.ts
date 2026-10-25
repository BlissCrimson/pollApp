import { Component, Inject, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../supabase-service';
import { Router } from '@angular/router';
import { SurveyInput } from '../../shared/interfaces/survey';
import { SURVEY_CATEGORIES } from '../../shared/constants/categories';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private supabaseService = inject(SupabaseService);
  private router = Inject(Router);

  categories = SURVEY_CATEGORIES;
  isSaving = false;
  errorMessage = '';

  survey = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl(''),
    endDate: new FormControl(''),
    description: new FormControl(''),
    questions: new FormArray([this.createQuestion()]),
  });

  private createQuestion() {
    return new FormGroup({
      question: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      allowMultiple: new FormControl(false),
      answers: new FormArray([this.createAnswer(), this.createAnswer()]),
    });
  }

  private createAnswer() {
    return new FormControl('', { nonNullable: true, validators: [Validators.required] });
  }

  get questions() {
    return this.survey.controls.questions;
  }

  answers(questionIndex: number) {
    return this.questions.at(questionIndex).controls.answers;
  }

  addQuestion() {
    this.questions.push(this.createQuestion());
  }

  addAnswer(questionIndex: number) {
    this.answers(questionIndex).push(this.createAnswer());
  }

  removeQuestion(questionIndex: number) {
    if (this.questions.length > 1) this.questions.removeAt(questionIndex);
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    if (this.answers(questionIndex).length > 2) this.answers(questionIndex).removeAt(answerIndex);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  letter(index: number) {
    return String.fromCharCode(65 + index);
  }

  private buildSurveyInput(): SurveyInput {
    const value = this.survey.getRawValue();
    return {
      title: value.title.trim(),
      category: value.category || null,
      endDate: value.endDate || null,
      description: value.description?.trim() || null,
      questions: value.questions.map((q) => ({
        question: q.question.trim(),
        allowMultiple: !!q.allowMultiple,
        answers: q.answers.map((text) => text.trim()),
      })),
    };
  }

  async publish() {
    if (this.survey.invalid) {
      this.survey.markAllAsTouched();
      this.errorMessage = 'failed';
      return;
    }
    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.supabaseService.createSurvey(this.buildSurveyInput());
      this.goToHome();
    } catch (error) {
      this.errorMessage = 'speichern fehl';
      console.error(error);
    } finally {
      this.isSaving = false;
    }
  }
}
