import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';
import { CosignerOption, CosignerDetail, UnknownCosigner } from './../models/cosigner.model';
import { environment, Agent } from './../../environments/environment';
import { DecentralandCosigner } from './../models/cosigners/decentraland-cosigner.model';

import { DecentralandCosignerService } from './cosigners/decentraland-cosigner.service';
import { Utils } from '../utils/utils';

@Injectable()
export class CosignerService {
  loadedOption = {};
  constructor(
    private decentralandCosignerService: DecentralandCosignerService
  ) { }
  getCosignerOptions(loan: Loan): CosignerOption {
    if (this.loadedOption[loan.uid] !== undefined) {
      return this.loadedOption[loan.uid];
    }
    const result = this._getCosignerOption(loan);
    this.loadedOption[loan.uid] = result;
    return result;
  }
  getCosigner(loan: Loan): Promise<CosignerDetail> {
    return new Promise((resolve) => {
      const detectedOption = this.getCosignerOptions(loan);
      if (loan.cosigner === Utils.address_0) {
        resolve(undefined);
      } else {
        if (detectedOption !== undefined) {
          detectedOption.detail.then((cdetail: CosignerDetail) => {
            if (cdetail.contract === loan.cosigner) {
              resolve(cdetail);
            } else {
              resolve(new UnknownCosigner(loan.cosigner));
            }
          });
        } else {
          resolve(new UnknownCosigner(loan.cosigner));
        }
      }
    }) as Promise<CosignerDetail>;
  }
  private _getCosignerOption(loan: Loan): CosignerOption {
    // If the loan creator is the mortgage creator
    // the cosigner option is a mortgage
    if (environment.dir[loan.creator] === Agent.MortgageCreator) {
      return new CosignerOption(
        loan.id + loan.engine + 'mortgage',
        'Decentraland parcel mortgage',
        this.decentralandCosignerService.getDecentralandOption(loan)
      );
    }
    // There is no cosigner option
    return undefined;
  }
}
