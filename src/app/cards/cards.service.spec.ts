import { TestBed, inject } from '@angular/core/testing';

import { CardsService } from './cards.service';

describe('CardsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardsService]
    });
  });

  it('should be created', inject([CardsService], (service: CardsService) => {
    expect(service).toBeTruthy();
  }));
});
