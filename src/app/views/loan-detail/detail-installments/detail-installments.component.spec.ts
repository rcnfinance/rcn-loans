import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DetailInstallmentsComponent } from './detail-installments.component';
import { InstallmentService } from './../../../services/installment.service';
import { EventsService } from './../../../services/events.service';
import { CommitsService } from './../../../services/commits.service';
import { FormatAmountPipe } from './../../../pipes/format-amount.pipe';

describe('DetailInstallmentsComponent', () => {
  let component: DetailInstallmentsComponent;
  let fixture: ComponentFixture<DetailInstallmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ DetailInstallmentsComponent, FormatAmountPipe ],
      providers: [ InstallmentService, EventsService, CommitsService ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailInstallmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
