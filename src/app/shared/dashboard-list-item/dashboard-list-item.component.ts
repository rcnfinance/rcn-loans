import { Component, Input, OnInit } from '@angular/core';
import { Loan, Status } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';

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

  constructor() {}

  ngOnInit() {
    this.loadBasicData();
    this.loadPaymentProgress();
    this.loadTimeProgress();
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
}
