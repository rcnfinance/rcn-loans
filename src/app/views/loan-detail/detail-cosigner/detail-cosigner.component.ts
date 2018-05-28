import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { Loan } from '../../../models/loan.model';
import { CosignerOption, CosignerDetail } from './../../../models/cosigner.model';
import { DecentralandCosigner } from './../../../models/cosigners/decentraland-cosigner.model';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-detail-cosigner',
  templateUrl: './detail-cosigner.component.html',
  styleUrls: ['./detail-cosigner.component.scss']
})
export class DetailCosignerComponent implements OnChanges, OnInit {
  @Input() cosigner: CosignerOption;
  constructor() {}
  cosignerDetail: CosignerDetail;
  detail: any;
  detailClass(): string {
    if (this.cosignerDetail === undefined) { return undefined; }
    switch (this.cosignerDetail.constructor) {
      case DecentralandCosigner:
        return 'decentraland_mortgage';
    }
    return 'unknown';
  }
  ngOnInit() {
    this.detailClass();
  }
  ngOnChanges() {
    this.cosigner.detail.then(result => { this.cosignerDetail = result; });
  }
}
