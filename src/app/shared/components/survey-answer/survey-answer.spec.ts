import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyAnswer } from './survey-answer';

describe('SurveyAnswer', () => {
  let component: SurveyAnswer;
  let fixture: ComponentFixture<SurveyAnswer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyAnswer],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyAnswer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
