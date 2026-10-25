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
    fixture.componentRef.setInput('answer', { id: 1, text: 'Option A', position: 0 });
    fixture.componentRef.setInput('name', 'question-1');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a radio input for single choice', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('radio');
  });

  it('should emit the answer id on change', () => {
    let emitted: number | undefined;
    component.selected.subscribe((id) => (emitted = id));
    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('change'));
    expect(emitted).toBe(1);
  });
});
