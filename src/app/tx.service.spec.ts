import { TestBed, inject } from '@angular/core/testing';

import { TxService } from './tx.service';

describe('PendingOperationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TxService]
    });
  });

  it('should be created', inject([TxService], (service: TxService) => {
    expect(service).toBeTruthy();
  }));
});
