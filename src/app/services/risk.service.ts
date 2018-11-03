import { Injectable } from '@angular/core';
import { Loan } from '../models/loan.model';
import { environment } from '../../environments/environment';
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
        resolve(Level.normal);
      } else {
        this.identityService.getIdentity(loan).then((identity) => {
          resolve(identity !== undefined ? Level.low : Level.high);
        });
      }
    }) as Promise<Level>;
  }
}
