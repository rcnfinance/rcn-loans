import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { Agent, environment } from '../../environments/environment';
import { Utils } from './../utils/utils';
import * as Blockies from 'blockies';

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

    return short ? loan.creator : Utils.shortAddress(loan.creator);
  }
  getCreatorShortName(loan: Loan): string {
    if (loan.creator === loan.borrower) {
      return "borrower";
    } else {
      return "";
    }
  }
  getCreatorIcon(loan: Loan):any {
    return Blockies.create({ // All options are optional
      seed: 'randstring', // seed used to generate icon data, default: random
      color: '#dfe', // to manually specify the icon color, default: random
      bgcolor: '#aaa', // choose a different background color, default: random
      size: 15, // width/height of the icon in blocks, default: 8
      scale: 3, // width/height of each block in pixels, default: 4
      spotcolor: '#000' // each pixel has a 13% chance of being of a third color, 
      // default: random. Set to -1 to disable it. These "spots" create structures
      // that look like eyes, mouths and noses. 
    });  
  }
}
