import { TestBed } from '@angular/core/testing';

import { NavrailService } from './navrail.service';

describe('NavrailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavrailService = TestBed.get(NavrailService);
    expect(service).toBeTruthy();
  });
});
