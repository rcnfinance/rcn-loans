import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Loan, Network, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  stateLoan: Loan;

  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  canLend: boolean;
  network: string;
  installments: string;
  interestRate: string;
  punitiveInterestRateRate: string;

  account: string;
  shortAddress = Utils.shortAddress;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service
  ) { }

  async ngOnInit() {
    this.stateLoan = this.loan;
    await this.getLoanDetails();

    this.loadAccount();
    this.handleLoginEvents();
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  /**
   * Load user account
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);

    this.checkCanLend();
  }

  /**
   * Check if lend is available
   */
  checkCanLend() {
    if (this.stateLoan.isRequest) {
      const isBorrower = this.stateLoan.borrower.toUpperCase() === this.account.toUpperCase();
      this.canLend = !isBorrower;
    }
  }

  /**
   * Refresh loan when lending status is updated
   */
  onUserAction(action: 'lend') {
    // TODO: update specific values according to the action taken
    console.info('user action detected', action);

    this.canLend = false;
  }

  /**
   * Load loan details
   */
  private async getLoanDetails() {
    if (this.stateLoan.isRequest) {
      const currency = this.stateLoan.currency;
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.amount));
      this.durationLabel = 'Duration';
      this.durationValue = Utils.formatDelta(this.stateLoan.descriptor.duration);
      this.rightLabel = 'Receive';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.descriptor.totalObligation));
    } else if (this.stateLoan instanceof Loan) {
      const currency = this.stateLoan.currency;
      this.leftLabel = 'Paid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.paid));
      this.durationLabel = 'Next payment in';
      this.durationValue = this.stateLoan.status !== Status.Paid ?
        Utils.formatDelta(this.stateLoan.debt.model.dueTime - (new Date().getTime() / 1000)) :
        '-';
      this.rightLabel = 'Due';
      const basaltPaid = this.stateLoan.network === Network.Basalt ? currency.fromUnit(this.stateLoan.debt.model.paid) : 0;
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.estimatedObligation) - basaltPaid);
      this.canLend = false;
      if (this.stateLoan.status === Status.Indebt) {
        this.durationLabel = 'Overdue for';
      } else {
        this.durationLabel = 'Next payment in';
      }
    }
    this.installments = this.getInstallments();
    this.interestRate = this.stateLoan.descriptor.interestRate.toFixed(2);
    this.punitiveInterestRateRate = this.stateLoan.descriptor.punitiveInterestRateRate.toFixed(2);
  }

  /**
   * Return installments quantity text
   */
  private getInstallments(): string {
    try {
      const installments = this.stateLoan.descriptor.installments;

      switch (installments) {
        case 0:
        case 1:
          return `1 Payment`;

        default:
          return `${ installments } Payments`;
      }
    } catch (e) {
      return '1 Payment';
    }
  }

}
