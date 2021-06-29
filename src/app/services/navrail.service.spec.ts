import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'app/shared/shared.module';
import { NavrailService } from './navrail.service';

describe('NavrailService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule, SharedModule]
  }));

  it('should be created', () => {
    const service: NavrailService = TestBed.inject(NavrailService);
    expect(service).toBeTruthy();
  });
});
