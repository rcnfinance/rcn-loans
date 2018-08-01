import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit {
  @Input() loan: Loan;

  constructor() { }

  ngOnInit() {
  }

  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
