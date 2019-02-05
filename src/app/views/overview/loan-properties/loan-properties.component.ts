import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan, Status } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';

@Component({
  selector: 'app-loan-properties',
  templateUrl: './loan-properties.component.html',
  styleUrls: ['./loan-properties.component.scss']
})
export class LoanPropertiesComponent implements OnInit {
  @Input() loan: Loan;

  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;

  constructor() { }

  ngOnInit() {
    if (this.loan.status === Status.Request) {
      this.leftLabel = 'Borrowing Amount';
      this.leftValue = this.formatAmount(this.loan.amount);
      this.rightLabel = 'Borrowing Return';
      this.rightValue = this.formatAmount(this.loan.expectedReturn);
      this.durationLabel = 'Duration';
      this.durationValue = this.loan.verboseDuration;
    } else {
      this.leftLabel = 'Borrowing Amount';
      this.leftValue = this.formatAmount(this.loan.paid);
      this.rightLabel = 'Borrowing Return';
      this.rightValue = this.formatAmount(this.loan.pendingAmount);
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.loan.remainingTime);
    }
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
