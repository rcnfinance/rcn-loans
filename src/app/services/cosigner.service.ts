import { Injectable } from '@angular/core';
import { Loan } from "./../models/loan.model";
import { CosignerOption, CosignerDetail, DecentralandCosigner } from "./../models/cosigner.model";
import { environment, Agent } from "./../../environments/environment";

import { DecentralandCosignerService } from './cosigners/decentraland-cosigner.service';

@Injectable()
export class CosignerService {
  constructor(
    private decentralandCosignerService: DecentralandCosignerService
  ) { }

  getCosignerOptions(loan: Loan): CosignerOption[] {
    if (environment.dir[loan.creator] === Agent.MortgageCreator) {
      return [new CosignerOption(
        loan.id + loan.engine + "mortgage",
        "Decentraland parcel mortgage",
        this.decentralandCosignerService.getDecentralandOption(loan)
      )];  
    }
    let result = [];
    return result;
  }
}