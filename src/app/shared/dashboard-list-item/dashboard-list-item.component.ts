import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Loan, Status } from 'app/models/loan.model';
import { Status as CollateralStatus } from 'app/models/collateral.model';
import { Utils } from 'app/utils/utils';
import { Installment } from 'app/interfaces/installment';
import { InstallmentsService } from 'app/services/installments.service';
import { Web3Service } from 'app/services/web3.service';
import { DialogLoanPayComponent } from 'app/dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { CurrenciesService } from 'app/services/currencies.service';

@Component({
  selector: 'app-dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
  styleUrls: ['./dashboard-list-item.component.scss']
})
export class DashboardListItemComponent implements OnInit {
  @Input() loan: Loan;
  @Input() showOptions: boolean;
  @Input() isCurrentLoans: boolean;
  @Input() isBorrowed: boolean;
  @Input() isLent: boolean;

  borrowed = '-';
  lent = '-';
  repaid = '-';
  interest = '-';
  anualRate = '-';
  paymentProgress = '-';
  timeProgress = '0%';
  scheduleTooltip: string;
  installmentTooltip: string;
  statusText: string;
  statusIcon: string;
  statusColor: string;

  canRedeem: boolean;
  canPay: boolean;
  canAdjustCollateral: boolean;

  constructor(
    private dialog: MatDialog,
    private installmentsService: InstallmentsService,
    private currenciesService: CurrenciesService,
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
    this.loadStatus();
  }

  /**
   * Load loan status text, icon and color
   */
  loadStatus() {
    let statusText: string;
    let statusIcon: string;
    let statusColor: string;

    const { status } = this.loan;
    switch (status) {
      case Status.Request:
        if (this.isCurrentLoans) {
          statusText = 'Requested';
          statusIcon = 'calendar';
          statusColor = '#FFFFFF';
        } else {
          statusText = 'Collateral Pending';
          statusIcon = 'exclamation';
          statusColor = '#A3A5A6';
        }
        break;
      case Status.Ongoing:
        statusText = 'Ongoing';
        statusIcon = 'angle-double-up';
        statusColor = '#4155FF';
        break;
      case Status.Paid:
        statusText = 'Fully Repaid';
        statusIcon = 'check';
        statusColor = '#59B159';
        break;
      case Status.Indebt:
        statusText = 'Overdue';
        statusIcon = 'exclamation';
        statusColor = '#D97D3A';
        break;
      case Status.Expired:
        statusText = 'Expired';
        statusIcon = 'times';
        statusColor = '#A3A5A6';
        break;
      default:
        break;
    }

    this.statusText = statusText;
    this.statusIcon = statusIcon;
    this.statusColor = statusColor;
  }

  /**
   * Open dialog on material menu for pay or add collateral
   * @param action can be 'pay' or 'add'
   */
  openDialog(action: 'add' | 'pay') {
    if (action === 'pay') {
      const dialog = this.dialog.open(DialogLoanPayComponent, {
        data: {
          loan: this.loan
        }
      });
      dialog.afterClosed().subscribe((update: boolean) => {
        if (update) {
          window.location.reload();
          // FIXME: use better methods
        }
      });
    } else if (action === 'add') {
      this.router.navigate(['/borrow', this.loan.id]);
    }
  }

  /**
   * Set can't redeem
   */
  startRedeem() {
    this.canRedeem = false;
  }

  /**
   * Load loan's basic data
   */
  private loadBasicData() {
    const { amount, currency, debt, descriptor, status } = this.loan;

    const formattedAmount = this.currenciesService.getAmountFromDecimals(amount, currency.symbol);
    const borrowedAndLent = `${ Utils.formatAmount(formattedAmount) } ${ currency.symbol }`;
    this.borrowed = borrowedAndLent;
    this.lent = borrowedAndLent;

    if (status !== Status.Request && status !== Status.Expired) {
      const formattedRepaid = this.currenciesService.getAmountFromDecimals(debt.model.paid, currency.symbol);
      this.repaid = `${ Utils.formatAmount(formattedRepaid) } ${ currency.symbol }`;

      const interest = descriptor.totalObligation - amount;
      const formattedInterest = this.currenciesService.getAmountFromDecimals(interest, currency.symbol);
      this.interest = `${ Utils.formatAmount(formattedInterest) } ${ currency.symbol }`;
    }
    this.anualRate = descriptor.interestRate + '%';
  }

  /**
   * Load loan's payment progress to show time
   */
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

  /**
   * Load loan's time progress
   */
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

  /**
   * Load loan's duration for the tooltip
   */
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

  /**
   * Load loan's installmanets
   */
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
