import { async, TestBed } from '@angular/core/testing';
import { CurrenciesService } from './currencies.service';
import { environment } from '../../environments/environment';

describe('CurrenciesService', () => {
  let service: CurrenciesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CurrenciesService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(CurrenciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an list of currencies', () => {
    const result = service.getCurrencies();
    expect(result.length).toEqual(service.currencies.length);
  });

  it('should return an specific currency', () => {
    const key = 'symbol';
    const rcnSymbol = 'RCN';
    const result = service.getCurrencyByKey(key, rcnSymbol);

    expect(result).toEqual({
      symbol: rcnSymbol,
      address: environment.contracts.currencies.rcn
    });
  });

  it('should return all currencies except one', () => {
    const key = 'symbol';
    const rcnSymbol = 'RCN';
    const result = service.getCurrenciesExcept(key, rcnSymbol);

    expect(result.length).toEqual(service.currencies.length - 1);
  });
});
