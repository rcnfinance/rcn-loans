import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Loan, Network, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';

interface LoanAction {
  handler: void;
  title: string;
  disabled: boolean;
}

@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss']
})
export class LoanCardComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  stateLoan: Loan;

  isBorrower: boolean;
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
  loanActions: LoanAction[];

  account: string;
  shortAddress = Utils.shortAddress;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private contractsService: ContractsService
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
    this.account = web3.toChecksumAddress(account);

    const borrower = this.stateLoan.borrower;
    this.isBorrower = borrower.toLowerCase() === account.toLowerCase();

    this.checkCanLend();
  }

  /**
   * Check if lend is available
   */
  checkCanLend() {
    if (this.stateLoan.isRequest) {
      this.canLend = !this.isBorrower;
    } else {
      this.canLend = false;
    }
  }

  /**
   * Refresh loan when lending status is updated
   */
  onUserAction(action: 'lend') {
    const miliseconds = 7000;
    console.info('user action detected', action);

    setTimeout(async() => {
      await this.refreshLoan();

      // dynamic loan information
      this.loadAccount();
    }, miliseconds);
  }

  private async refreshLoan() {
    const loan: Loan = await this.contractsService.getLoan(this.loan.id);
    this.stateLoan = loan;

    await this.getLoanDetails();
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
      this.rightLabel = 'Return';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.descriptor.totalObligation));
    } else if (this.stateLoan instanceof Loan) {
      const currency = this.stateLoan.currency;
      this.leftLabel = 'Paid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.paid));
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.stateLoan.debt.model.dueTime - (new Date().getTime() / 1000));
      this.rightLabel = 'Pending';
      const basaltPaid = this.stateLoan.network === Network.Basalt ? currency.fromUnit(this.stateLoan.debt.model.paid) : 0;
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.estimatedObligation) - basaltPaid);
      this.canLend = false;
      if (this.stateLoan.status === Status.Indebt) {
        this.durationLabel = 'In debt for';
      } else {
        this.durationLabel = 'Remaining';
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
          return `1 pay`;

        default:
          return `${ installments } pays`;
      }
    } catch (e) {
      return '1 pay';
    }
  }

}
