import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailInstallmentsComponent } from './detail-installments.component';

describe('DetailInstallmentsComponent', () => {
  let component: DetailInstallmentsComponent;
  let fixture: ComponentFixture<DetailInstallmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailInstallmentsComponent ]
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
