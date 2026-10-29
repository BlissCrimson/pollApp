import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SupabaseService } from '../../supabase-service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: SupabaseService,
          useValue: { getSurveys: async () => [], getEndingSoonSurveys: async () => [] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the confirmation overlay after a survey was published', async () => {
    component.onSurveyCreated(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast')).toBeTruthy();
  });

  it('should open the created survey when the overlay is closed', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.onSurveyCreated(5);
    component.openCreatedSurvey();
    expect(navigate).toHaveBeenCalledWith(['/survey-display', 5]);
    expect(component.createdSurveyId()).toBeNull();
  });
});
