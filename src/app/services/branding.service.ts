import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { Agent, environment } from '../../environments/environment';
import { Brand } from './../models/brand.model';
import { CosignerService } from './cosigner.service';
import { DecentralandCosignerProvider } from '../providers/cosigners/decentraland-cosigner-provider';

@Injectable()
export class BrandingService {

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
      './assets/ripio.png',
      '',
      'Ripio',
      undefined
    )
  };
  constructor(
    private cosignerService: CosignerService
  ) {}

  getBrand(loan: Loan): Brand {
    if (this.cosignerService.getCosigner(loan) instanceof DecentralandCosignerProvider) {
      return this.static_brands.decentraland_mortgage;
    }

    if (environment.dir[loan.creator.toLowerCase()] === Agent.RipioCreator) {
      return this.static_brands.ripio;
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
