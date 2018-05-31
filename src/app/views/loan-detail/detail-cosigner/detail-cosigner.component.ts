import { Component, Input, OnInit } from '@angular/core';
import { Loan, Status } from '../../../models/loan.model';
import { CosignerOption, CosignerDetail, UnknownCosigner } from './../../../models/cosigner.model';
import { DecentralandCosigner } from './../../../models/cosigners/decentraland-cosigner.model';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { CosignerService } from '../../../services/cosigner.service';

@Component({
  selector: 'app-detail-cosigner',
  templateUrl: './detail-cosigner.component.html',
  styleUrls: ['./detail-cosigner.component.scss']
})
export class DetailCosignerComponent implements OnInit {
  @Input() loan: Loan;
  cosignerDetail: CosignerDetail;
  detailClass: string;
  constructor(
    private cosignerService: CosignerService
  ) {}
  private buildDetailClass(): string {
    if (this.cosignerDetail === undefined) { return 'not_available'; }
    switch (this.cosignerDetail.constructor) {
      case DecentralandCosigner:
        return 'decentraland_mortgage';
      default:
      case UnknownCosigner:
        console.warn('Unknown cosigner retrieved', this.cosignerDetail);
        return 'unknown';
    }
  }
  ngOnInit() {
    if (this.loan.status === Status.Request) {
      // Should listen cosigner selector service
      const cosignerOptions = this.cosignerService.getCosignerOptions(this.loan);
      if (cosignerOptions) {
        cosignerOptions.detail.then((detail) => {
          this.cosignerDetail = detail;
          this.detailClass = this.buildDetailClass();
        });
      } else {
        this.detailClass = 'not_available';
      }
    } else {
      this.cosignerService.getCosigner(this.loan).then((detail) => {
        this.cosignerDetail = detail;
        this.detailClass = this.buildDetailClass();
      });
    }
  }
}
