import { Injectable } from '@angular/core';
import { Agent } from 'environments/environment';
import { Loan, LoanType } from 'app/models/loan.model';
// App services
import { ChainService } from 'app/services/chain.service';
import { CosignerService } from 'app/services/cosigner.service';
import { DecentralandCosignerProvider } from 'app/providers/cosigners/decentraland-cosigner-provider';

@Injectable({
  providedIn: 'root'
})
export class LoanTypeService {
  constructor(
    private chainService: ChainService,
    private cosignerService: CosignerService
  ) { }

  /**
   * Get loan type
   * @param loan Loan
   * @return Loan type
   */
  getLoanType(loan: Loan): LoanType {
    const { config } = this.chainService;
    const creatorAddress: string = loan.creator.toLowerCase();
    const creatorAgent: Agent = config.dir[creatorAddress];
    if (creatorAgent) {
      return LoanType.FintechOriginator;
    }

    const cosigner = this.cosignerService.getCosigner(loan);
    if (cosigner instanceof DecentralandCosignerProvider) {
      return LoanType.NftCollateral;
    }

    if (loan.collateral) {
      return LoanType.UnknownWithCollateral;
    }

    return LoanType.Unknown;
  }

  /**
   * Return only the loans with the selected LoanType
   * @param loans Loans array
   * @param types Acccepted LoanTypes
   * @return Filtered loans array
   */
  filterLoanByType (loans: Loan[], types: LoanType[]) {
    return loans.filter((loan: Loan) => {
      return types.includes(this.getLoanType(loan));
    });
  }
}
