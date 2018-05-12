import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { Agent, environment } from '../../environments/environment';
import { Utils } from './../utils/utils';

@Injectable()
export class BrandingService {
  constructor() {}

  getBrand(loan: Loan): string {
    switch(environment.dir[loan.creator.toLowerCase()]) {
      case Agent.RipioCreator:
        return "Ripio";
      case Agent.MortgageCreator:
        return "Decentraland";
    }

    return "Unknown";
  }
  getCreatorName(loan: Loan, short: Boolean = false): string {
    switch(environment.dir[loan.creator.toLowerCase()]) {
      case Agent.RipioCreator:
        return "Ripio";
      case Agent.MortgageCreator:
        return "Mortgage creator";
    }

    return short ? Utils.shortAddress(loan.creator) : loan.creator;
  }
  getCreatorShortName(loan: Loan): string {
    if (loan.creator === loan.borrower) {
      return "borrower";
    } else {
      return "";
    }
  }
  getCreatorIcon(loan: Loan): string {
    switch(environment.dir[loan.creator.toLowerCase()]) {
      case Agent.RipioCreator:
        return undefined;
      case Agent.MortgageCreator:
        return "https://avatars1.githubusercontent.com/u/12685795?s=400&v=4";
    }
    return undefined;
  }
  getBlockiesOptions(loan: Loan): Object {
    return { // All options are optional
      seed: loan.creator, // seed used to generate icon data, default: random
      color: '#4155ff', // to manually specify the icon color, default: random
      bgcolor: '#333333', // choose a different background color, default: random
      size: 10, // width/height of the icon in blocks, default: 8
      scale: 5, // width/height of each block in pixels, default: 4
      spotcolor: '#3444cc' // each pixel has a 13% chance of being of a third color,
      // default: random. Set to -1 to disable it. These "spots" create structures
      // that look like eyes, mouths and noses.
    }
  }
}
