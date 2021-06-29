import { TestBed } from '@angular/core/testing';

import { ApplicationAdsService } from './application-ads.service';

describe('ApplicationAdsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApplicationAdsService = TestBed.inject(ApplicationAdsService);
    expect(service).toBeTruthy();
  });
});
