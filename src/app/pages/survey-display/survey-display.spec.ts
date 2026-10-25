import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
