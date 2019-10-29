import { Component, Input, OnInit } from '@angular/core';
import { Loan } from '../../../models/loan.model';
import { UnknownCosigner } from './../../../models/cosigner.model';
import { CosignerService } from '../../../services/cosigner.service';
import { CosignerProvider } from '../../../providers/cosigner-provider';
import { DecentralandCosignerProvider } from '../../../providers/cosigners/decentraland-cosigner-provider';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detail-cosigner',
  templateUrl: './detail-cosigner.component.html',
  styleUrls: ['./detail-cosigner.component.scss']
})
export class DetailCosignerComponent implements OnInit {
  @Input() loan: Loan;
  cosignerProvider: CosignerProvider;
  detailClass: string;

  constructor(
    private cosignerService: CosignerService
  ) {}
  ngOnInit() {
    this.cosignerProvider = this.cosignerService.getCosigner(this.loan);
    this.detailClass = this.buildDetailClass();
    console.info('Cosigner class', this.detailClass);
  }

  private buildDetailClass(): string {
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
    return environment.network.explorer.address.replace('${address}', this.loan.cosigner);
  }
}
