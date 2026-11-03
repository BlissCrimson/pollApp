import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type AnswerControl = FormControl<string>;
export type QuestionForm = FormGroup<{
  question: FormControl<string>;
  allowMultiple: FormControl<boolean | null>;
  answers: FormArray<AnswerControl>;
}>;
