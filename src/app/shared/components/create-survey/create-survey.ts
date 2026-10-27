import { Component, HostListener, inject, output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../../../supabase-service';
import { SurveyInput } from '../../interfaces/survey';
import { SURVEY_CATEGORIES } from '../../constants/categories';

const FIRST_LETTER_CODE = 65;
const MIN_QUESTIONS = 1;
const MIN_ANSWERS = 2;

type AnswerControl = FormControl<string>;
type QuestionForm = FormGroup<{
  question: FormControl<string>;
  allowMultiple: FormControl<boolean | null>;
  answers: FormArray<AnswerControl>;
}>;

/** Overlay dialog with the form to create a new survey */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private supabaseService = inject(SupabaseService);

  closed = output<void>();
  created = output<void>();

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

  /** Creates a question group with the minimum number of answers */
  private createQuestion(): QuestionForm {
    return new FormGroup({
      question: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      allowMultiple: new FormControl(false),
      answers: new FormArray(Array.from({ length: MIN_ANSWERS }, () => this.createAnswer())),
    });
  }

  /** Creates a required answer control */
  private createAnswer(): AnswerControl {
    return new FormControl('', { nonNullable: true, validators: [Validators.required] });
  }

  /** All question groups of the form */
  get questions(): FormArray<QuestionForm> {
    return this.survey.controls.questions;
  }

  /** The answer controls of one question */
  answers(questionIndex: number): FormArray<AnswerControl> {
    return this.questions.at(questionIndex).controls.answers;
  }

  /** Appends an empty question */
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  /** Appends an empty answer to a question */
  addAnswer(questionIndex: number): void {
    this.answers(questionIndex).push(this.createAnswer());
  }

  /** Removes a question, but keeps at least one */
  removeQuestion(questionIndex: number): void {
    if (this.questions.length > MIN_QUESTIONS) this.questions.removeAt(questionIndex);
  }

  /** Removes an answer, but keeps the minimum number of answers */
  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answers(questionIndex);
    if (answers.length > MIN_ANSWERS) answers.removeAt(answerIndex);
  }

  /** Closes the dialog (also on Escape) */
  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  /** True if a required control was touched and is still invalid */
  showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  /** Returns the answer letter: A, B, C, ... */
  letter(index: number): string {
    return String.fromCharCode(FIRST_LETTER_CODE + index);
  }

  /** Maps the form value to the survey data that is saved */
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

  /** Validates the form and saves the survey */
  async publish(): Promise<void> {
    if (this.survey.invalid) return this.showInvalidForm();
    this.isSaving = true;
    this.errorMessage = '';
    await this.saveSurvey();
    this.isSaving = false;
  }

  /** Marks all fields as touched so their errors become visible */
  private showInvalidForm(): void {
    this.survey.markAllAsTouched();
    this.errorMessage = 'Please fill in all fields marked with *.';
  }

  /** Saves the survey and closes the dialog; shows an error message if that fails */
  private async saveSurvey(): Promise<void> {
    try {
      await this.supabaseService.createSurvey(this.buildSurveyInput());
      this.created.emit();
      this.close();
    } catch (error) {
      this.errorMessage = 'The survey could not be saved. Please try again.';
      console.error(error);
    }
  }
}
