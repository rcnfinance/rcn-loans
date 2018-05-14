import { Component, OnChanges, Input } from '@angular/core';
import { Loan } from '../../../models/loan.model';
import { CosignerOption, DecentralandCosigner } from './../../../models/cosigner.model';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-detail-cosigner',
  templateUrl: './detail-cosigner.component.html',
  styleUrls: ['./detail-cosigner.component.scss']
})
export class DetailCosignerComponent implements OnChanges {
  @Input() cosigner: CosignerOption;
  constructor() {}
  ngOnChanges() {
    // TODO Handle non-request loan
    console.log("Load cosigner", this.cosigner)
    this.cosigner.detail.then(result => {
      console.log(result);
      if (result instanceof DecentralandCosigner) {
        console.log(result.coordinates);
      }
    })
  }
}
