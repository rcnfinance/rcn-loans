import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Loan, Status } from './../models/loan.model';
import { Installment, InstallmentStatus } from './../interfaces/installment';
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
   * Load payments history
   * @param loan Loan
   * @return Payments array
   */
  async getPayments(loan: Loan): Promise<{timestamp: string, paid: number}[]> {
    const { engine, id } = loan;
    const { content: commits } = await this.apiService.getHistories(engine, id).toPromise();
    const paymentCommits: Commit[] = commits.filter(({ opcode }) => opcode === CommitTypes.Paid);
    const payments = [];

    paymentCommits.map((commit) => {
      const { timestamp } = commit;
      const paid = LoanUtils.getCommitPaidAmount(commits, timestamp);
      payments.push({ timestamp, paid });
    });

    return payments;
  }

  /**
   * Get the current installment
   * @param installments Installments array
   * @return Current installment
   */
  async getCurrentInstallment(loan: Loan): Promise<Installment> {
    const installments: Installment[] = await this.getInstallments(loan);
    return installments.find(installment => installment.isCurrent);
  }

  /**
   * Return installments array with estimated information for loans in request status
   * @param loan Loan
   * @return Installments array
   */
  private getEstimatedInstallments(loan: Loan, startDateUnix?: number): Installment[] {
    const installments: Installment[] = [];

    // set start date
    const TODAY_DATE_UNIX = moment().add(3, 'd').unix() * 1000;
    startDateUnix = startDateUnix ? startDateUnix : TODAY_DATE_UNIX;

    // iterate installments
    for (let i = 0; i < loan.descriptor.installments; i++) {
      const payNumber = i + 1;
      const startDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * i)
      );
      const dueDate = this.unixToDate(
        startDateUnix + (loan.descriptor.frequency * 1000 * payNumber)
      );
      const isLast = payNumber === loan.descriptor.installments;
      const isCurrent =
        isLast && this.unixToDate(TODAY_DATE_UNIX) >= dueDate ||
        this.unixToDate(TODAY_DATE_UNIX) >= startDate &&
        this.unixToDate(TODAY_DATE_UNIX) <= dueDate;

      const currency = loan.currency.toString();
      const amount = loan.currency.fromUnit(loan.descriptor.firstObligation);
      const punitory = loan.descriptor.punitiveInterestRate;
      const pendingAmount = amount;
      const totalPaid = 0;
      const pays = [];
      const status = InstallmentStatus.OnTime;
      const isPrev = this.unixToDate(TODAY_DATE_UNIX) > startDate;
      const isNext = this.unixToDate(TODAY_DATE_UNIX) < startDate;

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
   * Return installments array with real information (including payments) for active loans
   * @param loan Loan
   * @return Installments array
   */
  private async getCurrentInstallments(loan: Loan): Promise<Installment[]> {
    // get current payments
    const { firstObligation: amountRequiredByInstallment } = loan.descriptor;
    const payments = await this.getPayments(loan);

    // assign payments by installment according to the amount paid
    const amountPaidByInstallment: {[installmentIndex: number]: number} = {};
    let totalPaid = 0;
    payments.map(({ paid }) => totalPaid = totalPaid + paid);

    const { installments } = loan.config;
    let totalAvailable = totalPaid;
    Array.from({ length: installments }).map((_, index) => {
      if (amountRequiredByInstallment < totalAvailable) {
        amountPaidByInstallment[index] = amountRequiredByInstallment;
        totalAvailable = totalAvailable - amountRequiredByInstallment;
      } else {
        amountPaidByInstallment[index] = totalAvailable;
        totalAvailable = 0;
      }
    });

    const paymentsByInstallment: {[installmentIndex: number]: {timestamp: string, amountUsed: number}[]} = {};
    const setPaymentToInstallment = (index: number, amountUsed: number, timestamp: string) => {
      if (!paymentsByInstallment[index]) {
        paymentsByInstallment[index] = [];
      }
      paymentsByInstallment[index].push({ amountUsed, timestamp });
    };

    // assigns all payments to the first installment to then iterate and organize them
    const DEFAULT_INDEX = 0;
    payments.map(({ timestamp, paid }) => {
      setPaymentToInstallment(DEFAULT_INDEX, paid, timestamp);
    });

    // iterates and reorganizes the extra payments. when the amount paid for the current
    // installment exceeds the required amount, the payment is awarded to the next installment.
    let paymentsByInstallmentAligned: boolean;
    while (!paymentsByInstallmentAligned) {
      let changed: boolean;

      Array.from({ length: installments }).map((_, index) => {
        if (!paymentsByInstallment[index]) {
          paymentsByInstallment[index] = [];
        }

        let paidAccumulated = 0;
        let canEach = true;

        paymentsByInstallment[index].map(({ amountUsed, timestamp }, paymentIndex) => {
          if (!canEach) {
            return;
          }

          paidAccumulated = paidAccumulated + amountUsed;

          // if paidAccumulated > amountRequiredByInstallment, all next payments are
          // moved to the next installment
          if (paidAccumulated > amountRequiredByInstallment) {
            if (!paymentsByInstallment[index + 1]) {
              paymentsByInstallment[index + 1] = [];
            }
            const futurePayments = paymentsByInstallment[index].filter((__, i) => i > paymentIndex);
            paymentsByInstallment[index + 1].unshift(...futurePayments);

            // there are only the payments with paymentIndex <= to which the value is passed
            paymentsByInstallment[index] = paymentsByInstallment[index].filter((__, i) => i <= paymentIndex);

            // how much should be moved and how much is left of the current paymentIndex is calculated
            const surplusForNextInstallment = paidAccumulated - amountRequiredByInstallment;
            paymentsByInstallment[index + 1].unshift({
              amountUsed: surplusForNextInstallment,
              timestamp
            });

            let amountForThisInstallment = amountUsed - surplusForNextInstallment;
            if (amountForThisInstallment < 0) {
              amountForThisInstallment = 0;
            }

            if (amountForThisInstallment <= 0) {
              delete paymentsByInstallment[index][paymentIndex];
            } else {
              paymentsByInstallment[index][paymentIndex].amountUsed = amountForThisInstallment;
            }

            canEach = false;
            changed = true;
          }
        });
      });

      if (!changed) {
        paymentsByInstallmentAligned = true;
      }
    }

    // remove empty payments
    Object.keys(paymentsByInstallment).map((i) => {
      paymentsByInstallment[i] = paymentsByInstallment[i].filter(({ amountUsed }) => amountUsed);
    });

    // get estimated installments calendar
    const { lentTime } = loan.config;
    const estimatedInstallments = this.getEstimatedInstallments(loan, lentTime * 1000);

    // assign calculated payments to the estimated installments
    let accumulatorTotalPaid = 0;
    estimatedInstallments.map((installment, index) => {
      if (!paymentsByInstallment[index]) {
        return;
      }

      // set payments
      let accumulatorLocaleTotalPaid = 0;
      paymentsByInstallment[index].map(({ timestamp, amountUsed }) => {
        // update locale accumulators
        accumulatorLocaleTotalPaid = accumulatorLocaleTotalPaid + amountUsed;
        accumulatorTotalPaid = accumulatorTotalPaid + amountUsed;

        installment.pays.push({
          date: new DatePipe('en-US').transform(timestamp as any * 1000, `yyyy-MM-dd'T'HH:mm:ssZ`),
          punitory: 0,
          pending: loan.currency.fromUnit(amountRequiredByInstallment - accumulatorLocaleTotalPaid),
          amount: loan.currency.fromUnit(amountUsed),
          totalPaid: loan.currency.fromUnit(accumulatorTotalPaid)
        });
      });

      // set installment paid
      const paid = accumulatorLocaleTotalPaid;
      installment.totalPaid = loan.currency.fromUnit(paid);
      installment.pendingAmount = loan.currency.fromUnit(amountRequiredByInstallment - paid);

      // set installment status
      let status: InstallmentStatus;
      if (installment.isNext) {
        status = InstallmentStatus.OnTime;
      } else if (installment.isCurrent) {
        status = this.getDueStatus(installment.dueDate);
      } else {
        status = installment.pendingAmount ?
          InstallmentStatus.OnDue :
          InstallmentStatus.OnTime;
      }
      installment.status = status;
    });

    return estimatedInstallments;
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

    if (daysLeft > 5) {
      return InstallmentStatus.OnTime;
    }
    if (daysLeft >= 0) {
      return InstallmentStatus.Warning;
    }
    return InstallmentStatus.OnDue;
  }

  /**
   * Return date in format ISO 8061
   * @param unix Date in unix format
   * @return Date in yyyy-MM-dd'T'HH:mm:ssZ format
   */
  private unixToDate(unix: number): string {
    return new DatePipe('en-US').transform(unix, `yyyy-MM-dd'T'HH:mm:ssZ`);
  }
}
