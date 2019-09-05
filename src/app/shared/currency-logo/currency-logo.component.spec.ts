import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyLogoComponent } from './currency-logo.component';

describe('CurrencyLogoComponent', () => {
  let component: CurrencyLogoComponent;
  let fixture: ComponentFixture<CurrencyLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
