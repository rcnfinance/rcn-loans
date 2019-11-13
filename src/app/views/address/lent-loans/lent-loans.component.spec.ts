import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from './../../../shared/shared.module';
import { MaterialModule } from './../../../material.module';
import { ContractsService } from './../../../services/contracts.service';
import { LentLoansComponent } from './lent-loans.component';

describe('LentLoansComponent', () => {
  let component: LentLoansComponent;
  let fixture: ComponentFixture<LentLoansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterModule.forRoot([]),
        SharedModule,
        MaterialModule
      ],
      declarations: [ LentLoansComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [ ContractsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LentLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
