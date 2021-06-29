import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { PohService } from './poh.service';

describe('PohService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it('should be created', () => {
    const service: PohService = TestBed.inject(PohService);
    expect(service).toBeTruthy();
  });
});
