import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanPropertiesComponent } from './icon-block.component';

describe('LoanPropertiesComponent', () => {
  let component: LoanPropertiesComponent;
  let fixture: ComponentFixture<LoanPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
