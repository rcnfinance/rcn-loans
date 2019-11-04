import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyLogoComponent } from './currency-logo.component';
import { CurrenciesService } from '../../services/currencies.service';

describe('CurrencyLogoComponent', () => {
  let component: CurrencyLogoComponent;
  let fixture: ComponentFixture<CurrencyLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyLogoComponent ],
      providers: [ CurrenciesService ]
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
