import { Service } from '@angular/core';

@Service()
export class Variables {
  static readonly FIRST_LETTER_CODE = 65;
  static readonly MIN_QUESTIONS = 1;
  static readonly MIN_ANSWERS = 2;
  static readonly MAX_TITLE_LENGTH = 80;
  static readonly MAX_QUESTION_LENGTH = 150;
  static readonly MAX_ANSWER_LENGTH = 80;
}
