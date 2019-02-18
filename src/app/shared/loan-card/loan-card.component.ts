import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ActionsTriggerService } from 'app/services/actions-trigger.service';
import { Loan, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit, OnChanges {
  @Input() loan: Loan;

  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  canLend: boolean;

  // Button Properties
  enabledButton: Boolean;
  opPending: boolean;
  buttonText: any;

  constructor(
    private actionsTriggerService: ActionsTriggerService
  ) {}

  receiveClickEvent(action: any) {
    console.info(action);
  }

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
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.loan.remainingTime);
      this.canLend = false;
    }
  }

  ngOnChanges() {
    this.enabledButton = this.actionsTriggerService.enabled;
    this.opPending = this.actionsTriggerService.opPending;
    this.buttonText = this.actionsTriggerService.changeButtonText;
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
