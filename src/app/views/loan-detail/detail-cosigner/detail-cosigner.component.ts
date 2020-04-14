import { Component, Input, OnInit } from '@angular/core';
import { Loan, LoanType } from '../../../models/loan.model';
import { UnknownCosigner } from './../../../models/cosigner.model';
import { CosignerService } from '../../../services/cosigner.service';
import { LoanTypeService } from '../../../services/loan-type.service';
import { CosignerProvider } from '../../../providers/cosigner-provider';
import { DecentralandCosignerProvider } from '../../../providers/cosigners/decentraland-cosigner-provider';
import { environment, Agent } from '../../../../environments/environment';
import { Utils } from '../../../utils/utils';

@Component({
  selector: 'app-detail-cosigner',
  templateUrl: './detail-cosigner.component.html',
  styleUrls: ['./detail-cosigner.component.scss']
})
export class DetailCosignerComponent implements OnInit {
  @Input() loan: Loan;
  cosignerProvider: CosignerProvider;
  detailClass: string;
  shortCosignerAddress: string;

  constructor(
    private cosignerService: CosignerService,
    private loanTypeService: LoanTypeService
  ) {}
  ngOnInit() {
    this.cosignerProvider = this.cosignerService.getCosigner(this.loan);
    this.detailClass = this.buildDetailClass();
    console.info('Cosigner class', this.detailClass);
  }

  private buildDetailClass(): string {
    const type: LoanType = this.loanTypeService.getLoanType(this.loan);
    const cosignerAddress: string = this.getCosignerAddress(this.loan);
    if (type === LoanType.FintechOriginator && cosignerAddress !== Utils.address0x) {
      this.shortCosignerAddress = Utils.shortAddress(cosignerAddress);
      return 'collateral_auction';
    }

    if (this.cosignerProvider === undefined) { return 'not_available'; }
    switch (this.cosignerProvider.constructor) {
      case DecentralandCosignerProvider:
        return 'decentraland_mortgage';
      default:
      case UnknownCosigner:
        console.warn('Unknown cosigner retrieved', this.cosignerProvider);
        return 'unknown';
    }
  }

  get cosignerLinkExplorer(): string {
    const cosignerAddress = this.getCosignerAddress(this.loan);
    return environment.network.explorer.address.replace('${address}', cosignerAddress);
  }

  private getCosignerAddress(loan: Loan) {
    const creator: Agent = environment.dir[loan.creator.toLowerCase()];
    const cosignerAddress: string = this.loan.isRequest ? environment.cosigners[creator] : loan.cosigner;
    return cosignerAddress;
  }
}
