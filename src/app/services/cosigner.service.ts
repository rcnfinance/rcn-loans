import { Injectable } from '@angular/core';
import { Loan } from "./../models/loan.model";
import { CosignerOption, CosignerDetail, DecentralandCosigner } from "./../models/cosigner.model";
import { environment, Agent } from "./../../environments/environment";

@Injectable()
export class CosignerService {
  constructor() { }

  getCosignerOptions(loan: Loan): CosignerOption[] {
    console.log(environment.dir[Agent.MortgageCreator], loan.creator)
    if (environment.dir[loan.creator] === Agent.MortgageCreator) {
      let cosignerDetail = new Promise((resolve, reject) => {
        resolve(new DecentralandCosigner());
      }) as Promise<DecentralandCosigner>;
      return [new CosignerOption("Decentraland parcel mortgage", cosignerDetail)];
    }

    let result = [];
    return result;
  }
}