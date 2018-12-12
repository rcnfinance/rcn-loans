import { Component, OnInit, Input } from '@angular/core';

import { Loan } from './../../models/loan.model';

@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.scss']
})
export class PayButtonComponent implements OnInit {
  @Input() loan: Loan;
  constructor() { }

  handlePay() {}
  ngOnInit() {}

}
