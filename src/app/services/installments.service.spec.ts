import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { InstallmentsService } from './installments.service';
import { CommitsService } from './commits.service';
import { EventsService } from './events.service';

describe('InstallmentsService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [InstallmentsService, CommitsService, EventsService]
    })
    .compileComponents();
  }));

  it('should be created', () => {
    const service: InstallmentsService = TestBed.get(InstallmentsService);
    expect(service).toBeTruthy();
  });
});
