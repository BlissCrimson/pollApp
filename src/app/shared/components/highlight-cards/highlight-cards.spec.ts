import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightCards } from './highlight-cards';

describe('HighlightCards', () => {
  let component: HighlightCards;
  let fixture: ComponentFixture<HighlightCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightCards],
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightCards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
