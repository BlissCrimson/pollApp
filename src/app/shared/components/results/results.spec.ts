import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerResult, SurveyDetail } from '../../interfaces/survey';
import { Results } from './results';

describe('Results', () => {
  let component: Results;
  let fixture: ComponentFixture<Results>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Results],
    }).compileComponents();

    fixture = TestBed.createComponent(Results);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const survey = {
    id: 1,
    title: 'Team event',
    category: null,
    endDate: null,
    description: null,
    questions: [
      {
        id: 10,
        question: 'Which date?',
        allowMultiple: false,
        answers: [
          { id: 100, text: 'Friday' },
          { id: 101, text: 'Saturday' },
        ],
      },
    ],
  } as unknown as SurveyDetail;

  /** Sets survey and results and renders the component */
  async function render(results: AnswerResult[]): Promise<void> {
    fixture.componentRef.setInput('survey', survey);
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty bars when there are no votes yet', async () => {
    await render([]);
    const percents = [...fixture.nativeElement.querySelectorAll('.results__percent')].map((el: HTMLElement) =>
      el.textContent?.trim(),
    );
    expect(percents).toEqual(['0%', '0%']);
    expect(fixture.nativeElement.querySelectorAll('.results__fill').length).toBe(2);
  });

  it('should keep the same bar elements when the first vote arrives', async () => {
    await render([]);
    const barBefore = fixture.nativeElement.querySelector('.results__fill');
    await render([
      { answerId: 100, votes: 1, percent: 100 },
      { answerId: 101, votes: 0, percent: 0 },
    ]);
    const barAfter = fixture.nativeElement.querySelector('.results__fill');
    expect(barAfter).toBe(barBefore);
    expect(barAfter.style.width).toBe('100%');
  });
});
