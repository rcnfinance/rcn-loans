import { TestBed } from '@angular/core/testing';

import { LoanTypeService } from './loan-type.service';

describe('LoanTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoanTypeService = TestBed.get(LoanTypeService);
    expect(service).toBeTruthy();
  });
});
