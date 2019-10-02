import { Component, OnInit, Input } from '@angular/core';
import { Loan, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit {
  @Input() loan: Loan;

  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  canLend: boolean;

  constructor() { }

  ngOnInit() {
    if (this.loan.status === Status.Request) {
      this.leftLabel = 'Lend';
      this.leftValue = this.formatAmount(this.loan.amount);
      this.rightLabel = 'Return';
      this.rightValue = this.formatAmount(this.loan.expectedReturn);
      this.durationLabel = 'Duration';
      this.durationValue = this.loan.verboseDuration;
      this.canLend = true;
    } else {
      this.leftLabel = 'Paid';
      this.leftValue = this.formatAmount(this.loan.paid);
      this.rightLabel = 'Pending';
      this.rightValue = this.formatAmount(this.loan.pendingAmount);
      this.durationValue = Utils.formatDelta(this.loan.remainingTime);
      const timeLeft = Utils.formatDelta(this.loan.remainingTime);
      if (timeLeft.startsWith('-')) {
        this.durationLabel = 'In debt for';
        this.durationValue = timeLeft.substr(2);
      }
      this.canLend = false;
      if (this.loan.status === Status.Indebt) {
        this.durationLabel = 'In debt for';
      } else {
        this.durationLabel = 'Remaining';
      }
    }
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
