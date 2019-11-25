import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DetailInstallmentsComponent } from './detail-installments.component';
import { InstallmentService } from './../../../services/installment.service';
import { CommitsService } from './../../../services/commits.service';

describe('DetailInstallmentsComponent', () => {
  let component: DetailInstallmentsComponent;
  let fixture: ComponentFixture<DetailInstallmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ DetailInstallmentsComponent ],
      providers: [ InstallmentService, CommitsService ]
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
