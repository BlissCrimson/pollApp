import { TestBed } from '@angular/core/testing';
import { Variables } from './variables';

describe('Variables', () => {
  let service: Variables;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Variables);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
