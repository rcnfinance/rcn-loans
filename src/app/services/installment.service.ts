import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Loan, Status } from './../models/loan.model';
import {
  Installment,
  InstallmentStatus,
  Pay
} from './../interfaces/installment';
// App services
import { CommitsService } from './commits.service';

@Injectable()
export class InstallmentService {

  constructor(
    private commitsService: CommitsService
  ) { }

  /**
   * Load installments and pay details
   * @param loan Loan
   * @return Installments with pays array
   */
  getInstallments(loan: Loan): Installment[] {
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
        installments = this.getCurrentInstallments(loan);
        break;

      default:
        break;
    }

    return installments;
  }

  /**
   * Load pay history
   * @param loan Loan
   * @return Pays array
   */
  async getPays(loan: Loan): Promise<Pay[]> {
    const commits = await this.commitsService.getCommits(loan.id, loan.network);
    const payCommits = commits.filter(commit => commit.opcode === 'paid_debt_engine');
    const pays: Pay[] = [];
    let pending = 0;
    let totalPaid = 0;

    switch (loan.status) {
      case Status.Request:
        pending = Number(loan.descriptor.totalObligation);
        break;

      case Status.Ongoing:
      case Status.Indebt:
        pending = Number(loan.debt.model.estimatedObligation);
        break;

      default:
        break;
    }

    payCommits.map(commit => {
      const {
        data,
        timestamp
      }: any = commit;
      const { paid } = data;

      totalPaid += Number(paid);
      pending -= Number(totalPaid);

      pays.push({
        date: this.unixToDate(timestamp * 1000),
        punitory: 0, // TODO: add punitory
        pending,
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
  getCurrentInstallment(loan: Loan) {
    const installments: Installment[] = this.getInstallments(loan);
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

      installments.push({
        isCurrent,
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
  private getCurrentInstallments(loan: Loan): Installment[] {
    const installments: Installment[] = [];
    const startDateUnix = (loan.debt.model.dueTime - loan.descriptor.duration) * 1000;
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
      const totalAmount = loan.currency.fromUnit(loan.debt.model.estimatedObligation);
      const totalPaid = loan.currency.fromUnit(loan.debt.model.paid);
      const pendingAmount = totalAmount - totalPaid;
      const pays = [];
      let status = InstallmentStatus.OnTime;

      let isCurrent = false;
      let amount = loan.currency.fromUnit(loan.descriptor.firstObligation);

      // future installments
      if (hasCurrent) {
        amount = loan.currency.fromUnit(loan.debt.model.nextObligation);
      }

      // previous or latest installment
      if (
        (startDate < todayTimestamp && dueDate > todayTimestamp) ||
        (payNumber === loan.descriptor.installments && !hasCurrent)
      ) {
        status = this.getDueStatus(dueDate);
        hasCurrent = true;
        isCurrent = true;
        amount = loan.currency.fromUnit(loan.debt.model.currentObligation);
      }

      installments.push({
        isCurrent,
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
    const dueTimestamp = new Date(dueDate).getTime() / 1000;
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
   * Return date in format yyyy-M-dd H:mm:ss z
   * @param unix Date in unix format
   * @return Date in yyyy-M-dd H:mm:ss z format
   */
  private unixToDate(unix: number) {
    return new DatePipe('en-US').transform(unix, 'yyyy-M-dd H:mm:ss z');
  }
}
