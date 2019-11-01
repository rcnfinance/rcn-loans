import { Component, OnInit } from '@angular/core';
import { Loan } from './../../models/loan.model';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {

  loan: Loan;

  constructor() { }

  ngOnInit() { }

  /**
   * Update loan
   */
  detectUpdateLoan(loan: Loan) {
    this.loan = loan;
  }

}
