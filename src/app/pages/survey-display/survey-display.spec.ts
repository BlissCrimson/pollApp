import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyDisplay } from './survey-display';

describe('SurveyDisplay', () => {
  let component: SurveyDisplay;
  let fixture: ComponentFixture<SurveyDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyDisplay],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
