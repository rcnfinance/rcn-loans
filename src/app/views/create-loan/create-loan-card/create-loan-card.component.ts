import { Component, OnInit, Output, EventEmitter, OnChanges, Input } from '@angular/core';
import { Utils } from './../../../utils/utils';
import { Loan } from './../../../models/loan.model';
// App Services
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-create-loan-card',
  templateUrl: './create-loan-card.component.html',
  styleUrls: ['./create-loan-card.component.scss']
})
export class CreateLoanCardComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  @Input() disabled: boolean;
  @Input() collateralPendingTx: Tx;
  @Output() confirm = new EventEmitter();
  expanded: boolean;

  amount: string;
  expectedReturn: string;
  annualInterest: string;
  installments: number;
  durationDate: string;
  expirationDate: string;
  paysDetail = [];

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes) {
    console.info('changes in loan card', changes);
    const { loan } = changes;

    if (loan && loan.currentValue) {
      this.loadDetail();
    }
  }

  /**
   * Click on confirm button
   */
  clickConfirm() {
    if (this.disabled) {
      return;
    }

    this.confirm.emit();
  }

  /**
   * Load loan details
   */
  private loadDetail() {
    const loan: Loan = this.loan;

    const amount = loan.currency.fromUnit(loan.amount);
    this.amount = amount ? Utils.formatAmount(amount) : null;

    if (loan.descriptor) {
      const duration = loan.descriptor.duration;
      const expiration = loan.expiration;
      this.installments = loan.descriptor.installments;
      this.durationDate = duration ? Utils.formatDelta(duration, 2) : null;
      this.expirationDate = expiration ? Utils.formatDelta(expiration, 2) : null;
      this.annualInterest = Number(loan.descriptor.interestRate).toString();
      this.expectedReturn = this.calculateExpectedReturn();
      return;
    }

    this.installments = 1;
    this.annualInterest = null;
    this.durationDate = null;
    this.expirationDate = null;
  }

  /**
   * Calculate the return amount
   * @return Expected return
   */
  private calculateExpectedReturn() {
    const loan: Loan = this.loan;
    const installments: number = loan.descriptor.installments;
    const installmentAmount: any = this.expectedInstallmentAmount();
    const expectedReturn: number = installmentAmount * installments;

    return expectedReturn ? Utils.formatAmount(expectedReturn) : null;
  }

  /**
   * Calculate the installment amount
   * @return Installment amount
   */
  private expectedInstallmentAmount() {
    const loan: Loan = this.loan;
    const loanAmount: number = loan.currency.fromUnit(loan.amount);
    let installmentAmount: number;

    if (loan.descriptor.installments === 1) {
      const secondsInYear = 86400;
      const daysInYear = 360;
      const interest: number = loan.descriptor.interestRate;
      const annualInterest: number = (interest * loanAmount) / 100;
      const durationInDays: number = loan.descriptor.duration / secondsInYear;
      const returnInterest: number = (durationInDays * annualInterest) / daysInYear;
      installmentAmount = loanAmount + returnInterest;
    } else {
      const rate: number = loan.descriptor.interestRate / 100;
      const installmentDuration: number = loan.descriptor.frequency / 360;
      installmentAmount = - Utils.pmt(
        installmentDuration * rate,
        loan.descriptor.installments,
        loanAmount,
        0
      );
      this.updateInstallmentsDetails();
    }

    if (!installmentAmount) {
      return 0;
    }

    return Utils.formatAmount(installmentAmount);
  }

  /**
   * Fills out installment's details
   * @return Pay details
   */
  private updateInstallmentsDetails() {
    const paysDetail = [];
    const loan: Loan = this.loan;
    const installments = loan.descriptor.installments;
    const paymentAmount = loan.descriptor.firstObligation;

    for (let i = 0; i < installments; i++) {
      const pay = i + 1;
      let payLabel: string;

      switch (Number(pay)) {
        case 1:
          payLabel = 'st';
          break;
        case 2:
          payLabel = 'nd';
          break;
        default:
          payLabel = 'th';
          break;
      }

      const time = pay * 15;
      const amount = Utils.formatAmount(loan.currency.fromUnit(paymentAmount));
      const currency = loan.currency.toString();
      const payData = {
        pay: pay + payLabel,
        time: `${ time } days`,
        amount: `${ amount } ${ currency }`
      };
      paysDetail.push(payData);
    }

    this.paysDetail = paysDetail;
    return paysDetail;
  }

  /**
   * Get submit button text according to the loan creation status
   * @return Button text
   */
  get confirmButtonText(): string {
    const tx: Tx = this.collateralPendingTx;
    if (tx === undefined) {
      return 'Confirm';
    }
    if (tx.confirmed) {
      return 'Confirmed';
    }
    return 'Confirming...';
  }

}
