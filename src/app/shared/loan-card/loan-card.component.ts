import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Loan, Network, Status } from '../../models/loan.model';
import { DialogSelectCurrencyComponent } from '../../dialogs/dialog-select-currency/dialog-select-currency.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { Utils } from '../../utils/utils';
import { Web3Service } from '../../services/web3.service';

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

  account: string;
  shortAddress = Utils.shortAddress;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service
  ) { }

  async ngOnInit() {
    if (this.loan.isRequest) {
      const currency = this.loan.currency;
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.amount));
      this.durationLabel = 'Duration';
      this.durationValue = Utils.formatDelta(this.loan.descriptor.duration);
      this.rightLabel = 'Return';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
    } else if (this.loan instanceof Loan) {
      const currency = this.loan.currency;
      this.leftLabel = 'Paid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
      this.durationLabel = 'Remaining';
      this.durationValue = Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000));
      this.rightLabel = 'Pending';
      const basaltPaid = this.loan.network === Network.Basalt ? currency.fromUnit(this.loan.debt.model.paid) : 0;
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation) - basaltPaid);
      this.canLend = false;
      if (this.loan.status === Status.Indebt) {
        this.durationLabel = 'In debt for';
      } else {
        this.durationLabel = 'Remaining';
      }
    }

    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);

    this.checkCanLend();
  }

  /**
   * Check if lend is available
   */
  checkCanLend() {
    if (this.loan.isRequest) {
      const isBorrower = this.loan.borrower.toUpperCase() === this.account.toUpperCase();
      this.canLend = !isBorrower;
    }
  }

  /**
   * Open lend dialog
   */
  async lend() {
    // open dialog
    const openLendDialog = () => {
      const dialogConfig = {
        data: { loan: this.loan }
      };
      this.dialog.open(DialogSelectCurrencyComponent, dialogConfig);
    };

    // check user account
    if (!this.web3Service.loggedIn) {
      const hasClient = await this.web3Service.requestLogin();

      if (this.web3Service.loggedIn) {
        openLendDialog();
        return;
      }

      if (!hasClient) {
        this.dialog.open(DialogClientAccountComponent);
      }
      return;
    }

    openLendDialog();
  }

  getInterestRate(): string {
    return this.loan.descriptor.interestRate.toFixed(2);
  }

  getPunitiveInterestRate(): string {
    return this.loan.descriptor.punitiveInterestRateRate.toFixed(2);
  }

  /**
   * Return installments quantity text
   */
  getInstallments(): string {
    try {
      const installments = this.loan.descriptor.installments;

      switch (installments) {
        case 0:
        case 1:
          return `1 pay`;

        default:
          return `${ installments } pays`;
      }

      return `${ installments } pays`;
    } catch (e) {
      return '1 pay';
    }
  }
}
