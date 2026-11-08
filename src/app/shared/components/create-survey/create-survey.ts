import { Component, ElementRef, HostListener, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import {
  FIRST_LETTER_CODE,
  MAX_ANSWER_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_ANSWERS,
  MIN_QUESTIONS,
} from '../../constants/variables';
import { todayString } from '../../utils/date';
import { notBlank, notInPast } from '../../utils/survey-validators';
import { AnswerControl, QuestionForm } from '../../interfaces/survey-forms';

/** Overlay dialog with the form to create a new survey */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-survey',
  styleUrl: './create-survey.scss',
  templateUrl: './create-survey.html',
})
export class CreateSurvey {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  closed = output<void>();
  /** Emits the id of the newly created survey */
  created = output<number>();

  /** Id of the published survey; while set, the confirmation overlay locks the dialog */
  publishedSurveyId = signal<number | null>(null);

  categories = SURVEY_CATEGORIES;
  maxTitleLength = MAX_TITLE_LENGTH;
  maxQuestionLength = MAX_QUESTION_LENGTH;
  maxAnswerLength = MAX_ANSWER_LENGTH;
  minDate = todayString();
  isSaving = false;
  errorMessage = '';

  survey = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(MAX_TITLE_LENGTH)],
    }),
    category: new FormControl('', { validators: [Validators.required] }),
    endDate: new FormControl('', { validators: [notInPast] }),
    description: new FormControl(''),
    questions: new FormArray([this.createQuestion()]),
  });

  /**
   * Creates a question group with the minimum number of answers.
   *
   * @returns A new question form group.
   */
  private createQuestion(): QuestionForm {
    return new FormGroup({
      question: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.maxLength(MAX_QUESTION_LENGTH)],
      }),
      allowMultiple: new FormControl(false),
      answers: new FormArray(Array.from({ length: MIN_ANSWERS }, () => this.createAnswer())),
    });
  }

  /**
   * Creates a required answer control with a maximum length.
   *
   * @returns A new answer form control.
   */
  private createAnswer(): AnswerControl {
    return new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(MAX_ANSWER_LENGTH)],
    });
  }

  /**
   * All question groups of the form.
   *
   * @returns The form array of question groups.
   */
  get questions(): FormArray<QuestionForm> {
    return this.survey.controls.questions;
  }

  /**
   * The answer controls of one question.
   *
   * @param questionIndex - Index of the question.
   * @returns The form array of answer controls.
   */
  answers(questionIndex: number): FormArray<AnswerControl> {
    return this.questions.at(questionIndex).controls.answers;
  }

  /** Appends an empty question */
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  /**
   * Appends an empty answer to a question.
   *
   * @param questionIndex - Index of the question.
   */
  addAnswer(questionIndex: number): void {
    this.answers(questionIndex).push(this.createAnswer());
  }

  /**
   * Clears a question that has text; removes an empty one, but keeps at least one question.
   *
   * @param questionIndex - Index of the question.
   */
  removeQuestion(questionIndex: number): void {
    const question = this.questions.at(questionIndex).controls.question;
    if (question.value) {
      question.reset();
      question.markAsUntouched();
    } else if (this.questions.length > MIN_QUESTIONS) {
      this.questions.removeAt(questionIndex);
    }
  }

  /**
   * Clears an answer that has text; removes an empty one, but keeps the minimum number of answers.
   *
   * @param questionIndex - Index of the question.
   * @param answerIndex - Index of the answer within the question.
   */
  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answers(questionIndex);
    const answer = answers.at(answerIndex);
    if (answer.value) {
      answer.reset();
      answer.markAsUntouched();
    } else if (answers.length > MIN_ANSWERS) {
      answers.removeAt(answerIndex);
    }
  }

  /** Closes the dialog (also on Escape); not possible while the confirmation overlay is open */
  @HostListener('document:keydown.escape')
  close(): void {
    if (this.publishedSurveyId() !== null) return;
    this.closed.emit();
  }

  /** Closes the confirmation overlay and the dialog, then shows the new survey */
  openPublishedSurvey(): void {
    const surveyId = this.publishedSurveyId();
    if (surveyId === null) return;
    this.router.navigate(['/survey-display', surveyId]);
    this.closed.emit();
  }

  /**
   * Checks whether a control was touched and is still invalid.
   *
   * @param control - The form control to check.
   * @returns `true` if an error should be shown.
   */
  showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  /**
   * Returns the answer letter: A, B, C, ...
   *
   * @param index - Zero-based index of the answer.
   * @returns The letter for the answer.
   */
  letter(index: number): string {
    return String.fromCharCode(FIRST_LETTER_CODE + index);
  }

  /**
   * Maps the form value to the survey data that is saved.
   *
   * @returns The trimmed survey data ready to be saved.
   */
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

  /** Moves the keyboard focus to the overlay's close button once it is rendered */
  private focusOverlayClose(): void {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('.toast__close')?.focus());
  }

  /** Marks all fields as touched so their errors become visible */
  private showInvalidForm(): void {
    this.survey.markAllAsTouched();
    this.errorMessage = 'Please fill in all fields.';
  }

  /** Saves the survey and shows the confirmation overlay; shows an error message if that fails */
  private async saveSurvey(): Promise<void> {
    try {
      const surveyId = await this.supabaseService.createSurvey(this.buildSurveyInput());
      this.created.emit(surveyId);
      this.publishedSurveyId.set(surveyId);
      this.focusOverlayClose();
    } catch (error) {
      this.errorMessage = 'The survey could not be saved. Please try again.';
      console.error(error);
    }
  }
}
