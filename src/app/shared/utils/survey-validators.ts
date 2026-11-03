import { AbstractControl, ValidationErrors } from '@angular/forms';
import { todayString } from './date';

/** Fails if the selected date lies in the past (ISO dates compare as strings) */
export function notInPast(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value < todayString() ? { pastDate: true } : null;
}

/** Fails if a non-empty value consists only of whitespace */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && !value.trim() ? { blank: true } : null;
}
