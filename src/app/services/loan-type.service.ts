import { Injectable } from '@angular/core';
import { environment, Agent } from './../../environments/environment';
import { Loan, LoanType } from './../models/loan.model';
// App services
import { CosignerService } from './cosigner.service';
import { DecentralandCosignerProvider } from './../providers/cosigners/decentraland-cosigner-provider';

@Injectable({
  providedIn: 'root'
})
export class LoanTypeService {

  constructor(
    private cosignerService: CosignerService
  ) { }

  /**
   * Get loan type
   * @param loan Loan
   * @return Loan type
   */
  getLoanType(loan: Loan): LoanType {
    const creatorAddress: string = loan.creator.toLowerCase();
    const creatorAgent: Agent = environment.dir[creatorAddress];
    if (creatorAgent) {
      return LoanType.FintechOriginator;
    }

    const cosigner = this.cosignerService.getCosigner(loan);
    if (cosigner instanceof DecentralandCosignerProvider) {
      return LoanType.NftCollateral;
    }

    // TODO: add LoanType.UnknownWithCollateral

    return LoanType.Unknown;
  }
}
