import { Component, OnInit, Input } from '@angular/core';
import { Loan, Status, Request } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit {
  @Input() loan: Request;

  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  canLend: boolean;

  shortAddress = Utils.shortAddress;

  constructor() { }

  ngOnInit() {
    if (this.loan.isRequest) {
      const currency = new Currency(this.loan.readCurrency());
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.amount));
      this.durationLabel = 'Duration';
      this.rightLabel = 'Return';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.getEstimatedReturn()));
      this.canLend = true;
    } else if(this.loan instanceof Loan) {
      const currency = new Currency(this.loan.readCurrency());
      this.leftLabel = 'Paid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.paid));
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.loan.remainingTime);
      this.rightLabel = 'Pending';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.estimated));
      this.canLend = false;
    }
  }

  getInterestRate(): string {
    if (this.loan.isRequest) {
      return this.loan.descriptor.getInterestRate(this.loan.amount);
    } else if (this.loan instanceof Loan) {
      return Utils.formatInterest(this.loan.interestRate).toFixed(0);
    }
  }

  getPunitiveInterestRate(): string {
    if (this.loan.isRequest) {
      return this.loan.descriptor.getPunitiveInterestRate();
    } else if (this.loan instanceof Loan) {
      return Utils.formatInterest(this.loan.punitiveInterestRate).toFixed(0);
    }
  }
}
