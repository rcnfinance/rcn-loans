import { Component, OnInit, OnChanges, Input } from '@angular/core';
// App Services
import { ActionsTriggerService } from 'app/services/actions-trigger.service';
import { Tx } from 'app/tx.service';
import { CountriesService } from '../../services/countries.service';
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
  opPending: boolean;
  buttonText: string;
  enableRegion: Boolean; // Check user country and define if is able to lend

  pendingTx: Tx;

  constructor(
    private actionsTriggerService: ActionsTriggerService,
    private countriesService: CountriesService
  ) {}

  receiveClickEvent(action: any) {
    console.info('Your action is to ' , action);
    this.actionsTriggerService.clickLend(this.loan, this.enableRegion);
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
    this.enableRegion = this.actionsTriggerService.enabled(this.loan);

    this.actionsTriggerService.currentbuttonText.subscribe(buttonText => this.buttonText = buttonText);
    this.actionsTriggerService.currentOpPending.subscribe(opPending => this.opPending = opPending);

    this.countriesService.lendEnabled().then((enableRegion) => {
      this.enableRegion = enableRegion;
    });
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
