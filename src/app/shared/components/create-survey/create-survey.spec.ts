import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SupabaseService } from '../../../supabase-service';
import { CreateSurvey } from './create-survey';

const CREATED_SURVEY_ID = 7;

describe('CreateSurvey', () => {
  let component: CreateSurvey;
  let fixture: ComponentFixture<CreateSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSurvey],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: { createSurvey: async () => CREATED_SURVEY_ID } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** Fills the form with valid values and publishes it */
  async function publishValidSurvey(): Promise<void> {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    component.survey.patchValue({
      title: 'Team event',
      category: 'work',
      endDate: tomorrow,
      questions: [{ question: 'Which date?', answers: ['Friday', 'Saturday'] }],
    });
    await component.publish();
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should publish without end date and description', async () => {
    const createSurvey = vi.fn(async () => CREATED_SURVEY_ID);
    TestBed.inject(SupabaseService).createSurvey = createSurvey;
    component.survey.patchValue({
      title: 'Team event',
      category: 'work',
      questions: [{ question: 'Which date?', answers: ['Friday', 'Saturday'] }],
    });
    await component.publish();
    expect(createSurvey).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: null, description: null }),
    );
  });

  it('should not publish without category and show the error', async () => {
    const createSurvey = vi.fn(async () => CREATED_SURVEY_ID);
    TestBed.inject(SupabaseService).createSurvey = createSurvey;
    component.survey.patchValue({
      title: 'Team event',
      questions: [{ question: 'Which date?', answers: ['Friday', 'Saturday'] }],
    });
    await component.publish();
    fixture.detectChanges();
    expect(createSurvey).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please fill in all fields.');
    expect(fixture.nativeElement.querySelector('.survey__category .survey__field-error')).toBeTruthy();
  });

  it('should show the confirmation overlay and keep the dialog open after publishing', async () => {
    const closed = vi.fn();
    component.closed.subscribe(closed);
    await publishValidSurvey();
    expect(component.publishedSurveyId()).toBe(CREATED_SURVEY_ID);
    expect(fixture.nativeElement.querySelector('.toast')).toBeTruthy();
    component.close();
    expect(closed).not.toHaveBeenCalled();
  });

  it('should only open the new survey and close the dialog via the overlay close button', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const closed = vi.fn();
    component.closed.subscribe(closed);
    await publishValidSurvey();
    expect(navigate).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('.toast__close').click();
    expect(navigate).toHaveBeenCalledWith(['/survey-display', CREATED_SURVEY_ID]);
    expect(closed).toHaveBeenCalledTimes(1);
  });
});
