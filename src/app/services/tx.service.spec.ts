import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'app/shared/shared.module';
import { TxService } from './tx.service';

describe('TxService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedModule]
  }));

  it('should be created', () => {
    const service: TxService = TestBed.get(TxService);
    expect(service).toBeTruthy();
  });
});
