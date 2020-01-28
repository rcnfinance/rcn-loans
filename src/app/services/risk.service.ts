import { Injectable } from '@angular/core';
import { Loan } from '../models/loan.model';
import { CosignerService } from './cosigner.service';
import { IdentityService } from './identity.service';

export enum Level { low, normal, high }

@Injectable()
export class RiskService {
  constructor(
    private cosignerService: CosignerService,
    private identityService: IdentityService
  ) { }
  estimateRisk(loan: Loan): Promise<Level> {
    return new Promise((resolve) => {
      if (this.cosignerService.getCosigner(loan) !== undefined) {
        resolve(Level.low);
      } else {
        this.identityService.getIdentity(loan).then((identity) => {
          resolve(identity !== undefined ? Level.normal : Level.high);
        });
      }
    }) as Promise<Level>;
  }
}
