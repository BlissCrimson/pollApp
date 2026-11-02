import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SupabaseService } from '../../supabase-service';
import { SurveyService } from '../../shared/services/survey-service';
import { SurveyDisplay } from './survey-display';

describe('SurveyDisplay', () => {
  let component: SurveyDisplay;
  let fixture: ComponentFixture<SurveyDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyDisplay],
      providers: [
        provideRouter([]),
        { provide: SurveyService, useValue: { loadSurvey: () => Promise.reject(new Error('test')) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error message when loading fails', () => {
    expect(component.errorMessage()).toBe('The survey could not be loaded.');
  });
});

describe('SurveyDisplay live preview', () => {
  let component: SurveyDisplay;
  let insertVotes: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    insertVotes = vi.fn();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await TestBed.configureTestingModule({
      imports: [SurveyDisplay],
      providers: [
        provideRouter([]),
        {
          provide: SupabaseService,
          useValue: {
            getSurveyWithQuestions: async () => ({
              id: 1,
              title: 'Team event',
              category: 'work',
              end_date: tomorrow,
              description: null,
              questions: [
                {
                  id: 10,
                  question: 'Which date?',
                  allow_multiple: false,
                  answers: [
                    { id: 100, text: 'Friday', position: 0 },
                    { id: 101, text: 'Saturday', position: 1 },
                  ],
                },
              ],
            }),
            getVotesByGroup: async () => [],
            getUserId: async () => 'user-1',
            subscribeToVotes: () => () => undefined,
            insertVotes,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SurveyDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  /** Percent shown for an answer in the displayed results */
  function percentOf(answerId: number): number | undefined {
    return component.displayedResults().find((result) => result.answerId === answerId)?.percent;
  }

  it('should show the selection in the results without saving it', () => {
    const question = component.survey()!.questions[0];
    expect(percentOf(100)).toBe(0);
    component.onSelect(question, 100);
    expect(percentOf(100)).toBe(100);
    component.onSelect(question, 101);
    expect(percentOf(100)).toBe(0);
    expect(percentOf(101)).toBe(100);
    expect(insertVotes).not.toHaveBeenCalled();
  });

  it('should clear the selection when the selected answer is chosen again', () => {
    const question = component.survey()!.questions[0];
    component.onSelect(question, 100);
    component.onSelect(question, 100);
    expect(percentOf(100)).toBe(0);
    expect(component.canSubmit()).toBe(false);
    expect(insertVotes).not.toHaveBeenCalled();
  });

  it('should save exactly once when the survey is submitted', async () => {
    component.onSelect(component.survey()!.questions[0], 100);
    await component.submit();
    expect(insertVotes).toHaveBeenCalledTimes(1);
    expect(insertVotes).toHaveBeenCalledWith(1, [100]);
  });
});
