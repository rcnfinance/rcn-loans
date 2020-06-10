import { async, TestBed } from '@angular/core/testing';
import { CurrenciesService } from './currencies.service';

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

    expect(result).toEqual(service.currencies[0]);
  });

  it('should return all currencies except one', () => {
    const key = 'symbol';
    const rcnSymbol = 'RCN';
    const result = service.getCurrenciesExcept(key, rcnSymbol);

    expect(result.length).toEqual(service.currencies.length - 1);
  });

  it('should return all currencies except two', () => {
    const key = 'symbol';
    const symbols = ['RCN', 'DAI'];
    const result = service.getCurrenciesExcept(key, symbols);

    expect(result.length).toEqual(service.currencies.length - 2);
  });

  it('should return the interest rate of the selected currency', () => {
    const rcnSymbol = 'RCN';
    const result = service.getBestInterest(rcnSymbol);
    expect(result.min).toEqual(0);
    expect(result.best).toEqual(10);
    expect(result.max).toEqual(20);
  });
});
