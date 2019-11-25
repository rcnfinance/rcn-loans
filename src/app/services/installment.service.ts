import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Loan, Status } from './../models/loan.model';
import { Installment, InstallmentStatus } from './../interfaces/installment';

@Injectable()
export class InstallmentService {

  constructor() { }

  /**
   * Load installments and pay details
   * @param loan Loan
   * @return Installments with pays array
   */
  getInstallments(loan: Loan): Installment[] {
    let installments: Installment[] = [];

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

    for (let i = 0; i < loan.descriptor.installments; i++) {
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
      const totalAmount = loan.currency.fromUnit(loan.debt.model.estimatedObligation);
      const totalPaid = loan.currency.fromUnit(loan.debt.model.paid);
      const pendingAmount = totalAmount - totalPaid;
      const pays = [];
      const status = InstallmentStatus.OnTime;

      let isCurrent = false;
      if (startDate < todayTimestamp && dueDate > todayTimestamp) {
        isCurrent = true;
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

    // if there is no current installment mark the last one
    const hasCurrent = installments.filter(installment => installment.isCurrent);
    if (!hasCurrent.length) {
      installments[installments.length - 1].isCurrent = true;
    }

    return installments;
  }

  private unixToDate(unix: number) {
    return new DatePipe('en-US').transform(unix, 'yyyy-M-dd H:mm:ss z');
  }
}
