import { TestBed, inject } from '@angular/core/testing';

import { RcnContractsService } from './rcn-contracts.service';

describe('RcnContractsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RcnContractsService]
    });
  });

  it('should be created', inject([RcnContractsService], (service: RcnContractsService) => {
    expect(service).toBeTruthy();
  }));
});
