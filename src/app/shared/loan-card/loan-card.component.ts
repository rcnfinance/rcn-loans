import { Component, OnInit, Input } from '@angular/core';
import { Loan, Network } from '../../models/loan.model';
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
  network: string;

  shortAddress = Utils.shortAddress;

  constructor() { }

  ngOnInit() {
    if (this.loan.isRequest) {
      const currency = this.loan.currency;
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.amount));
      this.durationLabel = 'Duration';
      this.durationValue = Utils.formatDelta(this.loan.descriptor.duration);
      this.rightLabel = 'Return';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
      this.canLend = true;
    } else if (this.loan instanceof Loan) {
      const currency = this.loan.currency;
      this.leftLabel = 'Paid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000));
      this.rightLabel = 'Pending';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation));
      this.canLend = false;
    }

    if (this.loan.network === Network.Basalt) {
      this.network = 'Basalt';
    } else {
      this.network = 'Diaspore';
    }
  }

  getInterestRate(): string {
    return this.loan.descriptor.interestRate.toFixed(2);
  }

  getPunitiveInterestRate(): string {
    return this.loan.descriptor.punitiveInterestRateRate.toFixed(2);
  }
}
