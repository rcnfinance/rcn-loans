import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CurrenciesService } from './../../services/currencies.service';
import { CurrencyLogoComponent } from './currency-logo.component';

describe('CurrencyLogoComponent', () => {
  let component: CurrencyLogoComponent;
  let fixture: ComponentFixture<CurrencyLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyLogoComponent ],
      providers: [ CurrenciesService ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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
