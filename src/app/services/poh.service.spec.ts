import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { PohService } from './poh.service';

describe('PohService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it('should be created', () => {
    const service: PohService = TestBed.get(PohService);
    expect(service).toBeTruthy();
  });
});
