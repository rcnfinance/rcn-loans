import { TestBed } from '@angular/core/testing';

import { InstallmentService } from './installment.service';

describe('InstallmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstallmentService = TestBed.get(InstallmentService);
    expect(service).toBeTruthy();
  });
});
