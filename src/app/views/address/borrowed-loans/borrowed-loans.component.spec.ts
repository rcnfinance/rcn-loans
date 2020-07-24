import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from './../../../shared/shared.module';
import { MaterialModule } from './../../../material.module';
import { ContractsService } from './../../../services/contracts.service';
import { BorrowedLoansComponent } from './borrowed-loans.component';

describe('BorrowedLoansComponent', () => {
  let component: BorrowedLoansComponent;
  let fixture: ComponentFixture<BorrowedLoansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterModule.forRoot([]),
        SharedModule,
        MaterialModule
      ],
      declarations: [ BorrowedLoansComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [ ContractsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowedLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
