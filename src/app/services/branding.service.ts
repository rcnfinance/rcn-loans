import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { Agent, environment } from '../../environments/environment';
import { Brand } from './../models/brand.model';

@Injectable()
export class BrandingService {
  staticBrands = {
    ripio: new Brand(
      'Ripio',
      '#009BDE',
      './assets/logos/ripio.png',
      '',
      'Ripio',
      './assets/logos/logo-ripio-white.svg',
      undefined
    )
  };
  constructor() { }

  getBrand(loan: Loan): Brand {
    switch (environment.dir[loan.creator.toLowerCase()]) {
      case Agent.RipioArsCreator:
      case Agent.RipioUsdCreator:
        return this.staticBrands.ripio;
      default:
    }

    if (loan.borrower === loan.creator) {
      return new Brand(
        loan.creator,
        undefined,
        undefined,
        'borrower',
        'Collateral',
        undefined,
        this.getBlockiesOptions(loan)
      );
    }

    return new Brand(
      loan.creator,
      undefined,
      undefined,
      '',
      'Collateral',
      undefined,
      this.getBlockiesOptions(loan)
    );
  }
  private getBlockiesOptions(loan: Loan): Object {
    return { // All options are optional
      seed: loan.creator, // seed used to generate icon data, default: random
      color: '#4155ff', // to manually specify the icon color, default: random
      bgcolor: '#333333', // choose a different background color, default: random
      size: 10, // width/height of the icon in blocks, default: 8
      scale: 5, // width/height of each block in pixels, default: 5
      spotcolor: '#3444cc' // each pixel has a 13% chance of being of a third color,
      // default: random. Set to -1 to disable it. These "spots" create structures
      // that look like eyes, mouths and noses.
    };
  }
}
