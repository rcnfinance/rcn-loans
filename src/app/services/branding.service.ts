import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { Agent, environment } from '../../environments/environment';
import { Utils } from './../utils/utils';
import { Brand } from './../models/brand.model';

@Injectable()
export class BrandingService {
  constructor() {}

  static_brands = {
    decentraland_mortgage: new Brand(
      'Mortgage creator',
      '#E59400',
      'https://avatars1.githubusercontent.com/u/12685795?s=400&v=4',
      '',
      'Decentraland',
      undefined 
    ),
    ripio: new Brand(
      'Ripio',
      '#009BDE',
      undefined,
      '',
      'Ripio',
      { // All options are optional
        seed: 'ripio.com', // seed used to generate icon data, default: random
        color: '#009BDE', // to manually specify the icon color, default: random
        bgcolor: '#333333', // choose a different background color, default: random
        size: 10, // width/height of the icon in blocks, default: 8
        scale: 4, // width/height of each block in pixels, default: 4
        spotcolor: '#3444cc' // each pixel has a 13% chance of being of a third color,
        // default: random. Set to -1 to disable it. These "spots" create structures
        // that look like eyes, mouths and noses.
      } 
    )
  }

  getBrand(loan: Loan): Brand {
    switch (environment.dir[loan.creator.toLowerCase()]) {
      case Agent.RipioCreator:
        return this.static_brands.ripio;
      case Agent.MortgageCreator:
        return this.static_brands.decentraland_mortgage;
    }

    if (loan.borrower === loan.creator) {
      return new Brand(
        loan.creator,
        undefined,
        undefined,
        'borrower',
        'Unknown',
        this.getBlockiesOptions(loan)
      );
    }

    return new Brand(
      loan.creator,
      undefined,
      undefined,
      '',
      'Unknown',
      this.getBlockiesOptions(loan)
    );
  }
  private getBlockiesOptions(loan: Loan): Object {
    return { // All options are optional
      seed: loan.creator, // seed used to generate icon data, default: random
      color: '#4155ff', // to manually specify the icon color, default: random
      bgcolor: '#333333', // choose a different background color, default: random
      size: 10, // width/height of the icon in blocks, default: 8
      scale: 4, // width/height of each block in pixels, default: 4
      spotcolor: '#3444cc' // each pixel has a 13% chance of being of a third color,
      // default: random. Set to -1 to disable it. These "spots" create structures
      // that look like eyes, mouths and noses.
    };
  }
}
