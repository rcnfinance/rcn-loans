import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyLogoComponent } from './currency-logo.component';
import { CurrenciesService } from '../../services/currencies.service';
import { SharedModule } from '../../shared/shared.module';
import { Web3Service } from '../../services/web3.service';

describe('CurrencyLogoComponent', () => {
  let component: CurrencyLogoComponent;
  let fixture: ComponentFixture<CurrencyLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      providers: [ CurrenciesService, Web3Service ]
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
