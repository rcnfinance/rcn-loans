import { TestBed } from '@angular/core/testing';

import { PohService } from './poh.service';

describe('PohService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PohService = TestBed.get(PohService);
    expect(service).toBeTruthy();
  });
});
