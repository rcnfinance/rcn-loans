import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { DialogCollateralComponent } from 'app/dialogs/dialog-collateral/dialog-collateral.component';
import { Loan, Status } from 'app/models/loan.model';
import { Status as CollateralStatus } from 'app/models/collateral.model';
import { Utils } from 'app/utils/utils';
import { Installment } from 'app/interfaces/installment';
import { InstallmentsService } from 'app/services/installments.service';
import { Web3Service } from 'app/services/web3.service';
import { DialogLoanPayComponent } from 'app/dialogs/dialog-loan-pay/dialog-loan-pay.component';

@Component({
  selector: 'app-dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
  styleUrls: ['./dashboard-list-item.component.scss']
})
export class DashboardListItemComponent implements OnInit {
  @Input() loan: Loan;
  @Input() showOptions: boolean;
  @Input() isCurrentLoans: boolean;

  borrowed = '-';
  repaid = '-';
  anualRate = '-';
  paymentProgress = '-';
  timeProgress = '0%';
  scheduleTooltip: string;
  installmentTooltip: string;

  canRedeem: boolean;
  canPay: boolean;
  canAdjustCollateral: boolean;

  constructor(
    private dialog: MatDialog,
    private installmentsService: InstallmentsService,
    private web3Service: Web3Service,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBasicData();
    this.loadPaymentProgress();
    this.loadTimeProgress();
    this.loadDuration();
    this.loadInstallments();
    this.checkValidations();
  }

  getBorderColorByStatus = () => {
    switch (this.loan.status) {
      case Status.Request:
        if (this.isCurrentLoans) return '#FFFFFF';
        return '#A3A5A6';
      case Status.Ongoing:
        return '#4155FF';
      case Status.Paid:
        return '#59B159';
      case Status.Indebt:
        return '#D97D3A';
      case Status.Expired:
        return '#A3A5A6';
      default:
        return '#000000';
    }
  }

  getStatusTextByStatus = () => {
    switch (this.loan.status) {
      case Status.Request:
        if (this.isCurrentLoans) return 'Requested';
        return 'Collateral Pending';
      case Status.Ongoing:
        return 'Ongoing';
      case Status.Paid:
        return 'Fully Repaid';
      case Status.Indebt:
        return 'Overdue';
      case Status.Expired:
        return 'Expired';
      default:
        return '';
    }
  }

  getIconByStatus = () => {
    switch (this.loan.status) {
      case Status.Request:
        if (this.isCurrentLoans) return 'calendar';
        return 'exclamation';
      case Status.Ongoing:
        return 'angle-double-up';
      case Status.Paid:
        return 'check';
      case Status.Indebt:
        return 'exclamation';
      case Status.Expired:
        return 'times';
      default:
        return '';
    }
  }

  async openDialog(action: 'add' | 'withdraw' | 'pay') {
    if (action === 'pay') {
      const dialog = this.dialog.open(DialogLoanPayComponent, {
        data: {
          loan: this.loan
        }
      });
      dialog.afterClosed().subscribe(() => {

      });
    } else if (action === 'add') {
      this.router.navigate(['/borrow', this.loan.id]);
    } else {
      const dialogConfig: MatDialogConfig = {
        data: {
          loan: this.loan,
          collateral: this.loan.collateral,
          action
        }
      };
      this.dialog.open(DialogCollateralComponent, dialogConfig);
    }
  }

  private loadBasicData() {
    const { amount, currency, debt, descriptor, status } = this.loan;

    this.borrowed =
      Utils.formatAmount(amount / 10 ** currency.decimals, 2) +
      ' ' +
      currency.symbol;
    if (status !== Status.Request && status !== Status.Expired) {
      this.repaid =
        Utils.formatAmount(debt.model.paid / 10 ** currency.decimals, 2) +
        ' ' +
        currency.symbol;
    }
    this.anualRate = descriptor.interestRate + '%';
  }

  private loadPaymentProgress() {
    const { descriptor, debt, status } = this.loan;

    if (status === Status.Ongoing || status === Status.Indebt) {
      const endProgress = descriptor.totalObligation;
      const currentProgress = debt.model.paid;
      this.paymentProgress =
        Utils.formatAmount((currentProgress * 100) / endProgress, 0) + '%';
    }
    if (status === Status.Request || status === Status.Expired) {
      this.paymentProgress = 0 + '%';
    }
    if (status === Status.Paid) {
      this.paymentProgress = 100 + '%';
    }
  }

  private loadTimeProgress() {
    const loan: Loan = this.loan;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
    const { installments = 1, frequency } = loan.descriptor;
    const installmentDays = ['0'];

    // load installments days
    Array.from(Array(installments)).map((_: any, i: number) => {
      const installmentNumber = i + 1;
      installmentDays.push(Utils.formatDelta(frequency * installmentNumber));
    });

    // load installments average
    const startDate = [Status.Request, Status.Expired].includes(loan.status)
      ? nowDate
      : loan.config.lentTime;
    const endDate = startDate + installments * frequency;

    const MAX_AVERAGE = 100;
    const SECONDS_IN_DAY = 24 * 60 * 60;
    const diffDays = (endDate - startDate) / SECONDS_IN_DAY;
    const diffToNowDays = (endDate - nowDate) / SECONDS_IN_DAY;
    const daysAverage = 100 - (diffToNowDays * 100) / diffDays;
    this.timeProgress = `${
      daysAverage > MAX_AVERAGE ? MAX_AVERAGE : daysAverage
    }%`;
  }

  private loadDuration() {
    const loan: Loan = this.loan;
    if (loan.status === Status.Ongoing || loan.status === Status.Indebt) {
      const durationDynamic = Utils.formatDelta(
        loan.debt.model.dueTime - new Date().getTime() / 1000
      );
      this.scheduleTooltip =
        loan.status === Status.Indebt
          ? `Overdue for ${durationDynamic}`
          : `Next payment in ${durationDynamic}`;
    }
  }

  private async loadInstallments() {
    const loan: Loan = this.loan;
    if (loan.status === Status.Ongoing || loan.status === Status.Indebt) {
      const installment: Installment = await this.installmentsService.getCurrentInstallment(
        loan
      );
      if (!installment) {
        return;
      }

      const payNumber = installment.payNumber;
      this.installmentTooltip = `Instalments: ${payNumber} of ${loan.config.installments}`;
    }
  }

  /**
   * Check if collateral can withdraw all
   */
  private async checkValidations() {
    const account: string = await this.web3Service.getAccount();

    if ([Status.Paid, Status.Expired].includes(this.loan.status)) {
      const isBorrower = this.loan.borrower.toUpperCase() === account.toUpperCase();
      const { collateral } = this.loan;

      this.canRedeem =
        isBorrower &&
        collateral &&
        [CollateralStatus.ToWithdraw, CollateralStatus.Created].includes(collateral.status) &&
        Number(collateral.amount) > 0;
    }
    if (this.loan.status === Status.Ongoing || this.loan.status === Status.Indebt && this.loan.debt && this.loan.debt.balance) {
      this.canPay = true;
    }
    if (!this.loan.collateral && this.loan.status === Status.Request) {
      this.canAdjustCollateral = true;
    }
  }

}
