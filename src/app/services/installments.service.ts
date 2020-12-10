import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Loan, Status } from './../models/loan.model';
import {
  Installment,
  InstallmentStatus,
  Pay
} from './../interfaces/installment';
import { Commit, CommitTypes } from './../interfaces/commit.interface';
import { LoanUtils } from './../utils/loan-utils';
// App services
import { ApiService } from './api.service';

@Injectable()
export class InstallmentsService {

  constructor(
    private apiService: ApiService
  ) { }

  /**
   * Load installments and pay details
   * @param loan Loan
   * @return Installments with pays array
   */
  async getInstallments(loan: Loan): Promise<Installment[]> {
    let installments: Installment[] = [];

    if (!loan) {
      return [];
    }

    switch (loan.status) {
      case Status.Request:
        installments = this.getEstimatedInstallments(loan);
        break;

      case Status.Ongoing:
      case Status.Indebt:
        installments = await this.getCurrentInstallments(loan);
        break;

      default:
        break;
    }

    return installments;
  }

  /**
   * Load pay history
   * @param loan Loan
   * @param isCurrent Current installment
   * @param isPrev Prev installment
   * @param isNext Next installment
   * @param startDate Pays after this date
   * @param endDate Pays before this date (due installment date)
   * @return Pays array
   */
  async getPays(
    loan: Loan,
    isCurrent: boolean,
    isPrev: boolean,
    isNext: boolean,
    startDate?: string,
    endDate?: string
  ): Promise<Pay[]> {
    const { engine, id } = loan;
    const { content: commits } = await this.apiService.getHistories(engine, id).toPromise();
    const payCommits: Commit[] = commits.filter(({ opcode }) => opcode === CommitTypes.Paid);
    const pays: Pay[] = [];
    let pending = 0;
    let totalPaid = 0;

    switch (loan.status) {
      case Status.Request:
        pending = loan.currency.fromUnit(loan.descriptor.firstObligation);
        break;

      case Status.Ongoing:
      case Status.Indebt:
        if (isCurrent) {
          const quota = loan.descriptor.firstObligation || loan.debt.model.nextObligation;
          pending = loan.currency.fromUnit(quota);
          // TODO: add all results
        } else if (isNext) {
          pending = loan.currency.fromUnit(loan.debt.model.nextObligation);
        } else if (isPrev) {
          pending = loan.currency.fromUnit(loan.descriptor.firstObligation);
        }
        break;

      default:
        break;
    }

    payCommits.map(commit => {
      const { timestamp, nonce } = commit;
      const paid = LoanUtils.getCommitPaidAmount(commits, nonce);
      const amount = loan.currency.fromUnit(paid);

      if (startDate && startDate > this.unixToDate(Number(timestamp) * 1000)) {
        return;
      }
      if (endDate && endDate < this.unixToDate(Number(timestamp) * 1000)) {
        return;
      }

      totalPaid += Number(amount);
      pending -= Number(amount);

      if (pending < 0) {
        pending = 0;
      }

      pays.push({
        date: this.unixToDate(Number(timestamp) * 1000),
        punitory: 0, // TODO: add punitory
        pending,
        amount,
        totalPaid
      });
    });

    return pays;
  }

  /**
   * Get the current installment
   * @param installments Installments array
   * @return Current installment
   */
  async getCurrentInstallment(loan: Loan) {
    const installments: Installment[] = await this.getInstallments(loan);
    return installments.filter(installment => installment.isCurrent)[0];
  }

  /**
   * Return installments array with estimated information for loans in request status
   * @param loan Loan
   * @return Installments array
   */
  private getEstimatedInstallments(loan: Loan): Installment[] {
    const installments: Installment[] = [];
    const startDateUnix = new Date().getTime();

    for (let i = 0; i < loan.descriptor.installments; i++) {
      const isCurrent = i === 0;
      const payNumber = i + 1;
      const startDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * i)
      );
      const dueDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * payNumber)
      );
      const currency = loan.currency.toString();
      const amount = loan.currency.fromUnit(loan.descriptor.firstObligation);
      const punitory = loan.descriptor.punitiveInterestRateRate;
      const pendingAmount = amount;
      const totalPaid = 0;
      const pays = [];
      const status = InstallmentStatus.OnTime;
      const isLast = payNumber === loan.descriptor.installments;
      const isPrev = false;
      const isNext = true;

      installments.push({
        isCurrent,
        isLast,
        isPrev,
        isNext,
        startDate,
        payNumber,
        dueDate,
        currency,
        amount,
        punitory,
        pendingAmount,
        totalPaid,
        pays,
        status
      });
    }

    return installments;
  }

  /**
   * Return installments array with information for loans ongoing or in debt.
   * @param loan Loan
   * @return Installments array
   */
  private async getCurrentInstallments(loan: Loan): Promise<Installment[]> {
    const installments: Installment[] = [];
    let startDateUnix = (loan.debt.model.dueTime - loan.descriptor.duration) * 1000;

    if (loan.status === Status.Ongoing || loan.status === Status.Indebt) {
      startDateUnix = loan.config.lentTime * 1000;
    }

    const today = Math.round(new Date().getTime());
    const todayTimestamp = this.unixToDate(today);
    let hasCurrent: boolean;

    for (let i = 0; i < loan.descriptor.installments; i++) {
      const payNumber = i + 1;
      const startDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * i)
      );
      const dueDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * payNumber)
      );
      const currency = loan.currency.toString();
      const punitory = loan.descriptor.punitiveInterestRateRate;
      const isLast = payNumber === loan.descriptor.installments;
      const isPrev = startDate < todayTimestamp;
      const isNext = startDate > todayTimestamp;
      let status = InstallmentStatus.OnTime;
      let isCurrent = false;
      let amount = loan.currency.fromUnit(loan.descriptor.firstObligation);

      // future installments
      // if (hasCurrent) {
      //   amount = loan.currency.fromUnit(loan.debt.model.nextObligation);
      // }

      if (isCurrent) {
        const quota = loan.descriptor.firstObligation || loan.debt.model.nextObligation;
        amount = loan.currency.fromUnit(quota);
        // TODO: add all results
      } else if (isNext) {
        amount = loan.currency.fromUnit(loan.debt.model.nextObligation);
      } else if (isPrev) {
        amount = loan.currency.fromUnit(loan.descriptor.firstObligation);
      }

      // previous or latest installment
      if ((isPrev && dueDate > todayTimestamp) || (isLast && !hasCurrent)) {
        status = this.getDueStatus(dueDate);
        hasCurrent = true;
        isCurrent = true;
        amount = loan.currency.fromUnit(
          loan.debt.model.currentObligation || loan.debt.model.nextObligation
        );
      }

      // load payment information
      const endDate = !isLast ? dueDate : null;
      const pays = await this.getPays(
        loan,
        isCurrent,
        isPrev,
        isNext,
        startDate,
        endDate
      );
      let totalPaid = 0;
      pays.map((pay: Pay) => totalPaid += pay.amount);

      const pendingAmount = amount - totalPaid;
      const currentDate =
        new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString();
      if (isPrev && currentDate > dueDate && pendingAmount) {
        status = InstallmentStatus.OnDue;
      }

      installments.push({
        isCurrent,
        isLast,
        isPrev,
        isNext,
        startDate,
        payNumber,
        dueDate,
        currency,
        amount,
        punitory,
        pendingAmount,
        totalPaid,
        pays,
        status
      });
    }

    return installments;
  }

  /**
   * Return due status
   * @param dueDate Date in unix format
   * @return Installment status
   */
  private getDueStatus(dueDate: string): InstallmentStatus {
    const secondsInDay = 86400;
    const dueTimestamp = new Date(moment(dueDate).format()).getTime() / 1000;
    const nowTimestamp = new Date().getTime() / 1000;
    const daysLeft = Math.round((dueTimestamp - nowTimestamp) / secondsInDay);

    if (daysLeft > 1) {
      return InstallmentStatus.OnTime;
    }
    if (daysLeft === 1 || daysLeft === 0) {
      return InstallmentStatus.Warning;
    }
    return InstallmentStatus.OnDue;
  }

  /**
   * Return date in format ISO 8061
   * @param unix Date in unix format
   * @return Date in yyyy-MM-dd'T'HH:mm:ssZ format
   */
  private unixToDate(unix: number) {
    return new DatePipe('en-US').transform(unix, `yyyy-MM-dd'T'HH:mm:ssZ`);
  }
}
