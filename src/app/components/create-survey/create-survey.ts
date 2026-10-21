import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase-service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  isSaving = false;
  errorMessage = '';

  survey = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl(''),
    endDate: new FormControl(''),
    description: new FormControl(''),
    questions: new FormArray([this.createQuestion()]),
  });

  get questions() {
    return this.survey.controls.questions;
  }

  answers(questionIndex: number) {
    return this.questions.at(questionIndex).controls.answers;
  }

  // Turns an index into a letter (0 -> A, 1 -> B, ...)
  letter(index: number) {
    return String.fromCharCode(65 + index);
  }

  addQuestion() {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(questionIndex: number) {
    if (this.questions.length > 1) this.questions.removeAt(questionIndex);
  }

  addAnswer(questionIndex: number) {
    this.answers(questionIndex).push(this.createAnswer());
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    if (this.answers(questionIndex).length > 2) this.answers(questionIndex).removeAt(answerIndex);
  }

  async publish() {
    if (this.survey.invalid) {
      this.survey.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.supabaseService.createSurvey(this.buildSurveyInput());
      await this.router.navigate(['/']);
    } catch {
      this.errorMessage = 'Survey could not be saved. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  private buildSurveyInput() {
    const value = this.survey.getRawValue();
    return {
      title: value.title.trim(),
      category: value.category || null,
      endDate: value.endDate || null,
      description: value.description?.trim() || null,
      questions: value.questions.map((q) => ({
        question: (q.question ?? '').trim(),
        allowMultiple: !!q.allowMultiple,
        answers: (q.answers ?? []).map((text) => text.trim()),
      })),
    };
  }

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
}
