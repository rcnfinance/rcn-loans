import { TestBed } from '@angular/core/testing';

import { InstallmentsService } from './installments.service';

describe('InstallmentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstallmentsService = TestBed.get(InstallmentsService);
    expect(service).toBeTruthy();
  });
});
