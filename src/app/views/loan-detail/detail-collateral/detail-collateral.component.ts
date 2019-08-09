import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit {

  @Input() loan: Loan;
  @Input() collateral: Collateral;

  constructor() { }

  ngOnInit() {
    console.info('detail collateral', this.loan);
  }
}
