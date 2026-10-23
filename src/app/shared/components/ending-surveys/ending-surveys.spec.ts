import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndingSurveys } from './ending-surveys';

describe('EndingSurveys', () => {
  let component: EndingSurveys;
  let fixture: ComponentFixture<EndingSurveys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndingSurveys],
    }).compileComponents();

    fixture = TestBed.createComponent(EndingSurveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
