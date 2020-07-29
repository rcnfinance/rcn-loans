import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { InstallmentService } from './installment.service';
import { EventsService } from './events.service';
import { CommitsService } from './commits.service';

describe('InstallmentService', () => {
  let service: InstallmentService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [ InstallmentService, EventsService, CommitsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(InstallmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
