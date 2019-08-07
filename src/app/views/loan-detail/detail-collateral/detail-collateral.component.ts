import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from './../../../models/loan.model';

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit {

  @Input() loan: Loan;

  constructor() { }

  ngOnInit() {
    console.info('detail collateral', this.loan);
  }
}
