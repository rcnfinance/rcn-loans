import { Component, OnInit, Output, EventEmitter, OnChanges, Input } from '@angular/core';
import * as BN from 'bn.js';
import { Utils } from './../../../utils/utils';
import { Currency } from './../../../utils/currencies';
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App Services
import { CurrenciesService } from './../../../services/currencies.service';
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-create-loan-card',
  templateUrl: './create-loan-card.component.html',
  styleUrls: ['./create-loan-card.component.scss']
})
export class CreateLoanCardComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  @Input() collateral: Collateral;
  @Input() disabled: boolean;
  @Input() collateralPendingTx: Tx;
  @Output() confirm = new EventEmitter();
  expanded: boolean;
  collateralExpanded: boolean;

  amount: string;
  expectedReturn: string;
  annualInterest: string;
  installments: number;
  durationDate: string;
  expirationDate: string;
  paysDetail = [];

  collateralAmount: string;
  collateralAsset: string;
  liquidationRatio: string;
  balanceRatio: string;

  constructor(
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes) {
    const {
      loan,
      collateral
    } = changes;

    if (loan && loan.currentValue) {
      this.loadDetail();
    }
    if (collateral && collateral.currentValue) {
      this.loadCollateral();
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
      const duration = loan.descriptor.frequency * loan.descriptor.installments;
      const now = new Date().getTime() / 1000;
      const expirationDate = now - loan.expiration;
      this.installments = loan.descriptor.installments;
      this.durationDate = duration ? Utils.formatDelta(duration, 2) : null;
      this.expirationDate = loan.expiration ? Utils.formatDelta(expirationDate, 2) : null;
      this.annualInterest = loan.descriptor.interestRate ?
        Number(loan.descriptor.interestRate).toString() :
        null;
      this.expectedReturn = this.calculateExpectedReturn();
      return;
    }

    this.installments = 1;
    this.annualInterest = null;
    this.durationDate = null;
    this.expirationDate = null;
  }

  /**
   * Load collateral details
   */
  private loadCollateral() {
    const collateral: Collateral = this.collateral;
    const liquidationRatio = this.toPercentage(Number(collateral.liquidationRatio));
    const balanceRatio = this.toPercentage(Number(collateral.balanceRatio));
    this.liquidationRatio = `${ Utils.formatAmount(liquidationRatio) } %`;
    this.balanceRatio = `${ Utils.formatAmount(balanceRatio) } %`;

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const collateralDecimals = new Currency(collateralCurrency.symbol).decimals;
    this.collateralAmount = Utils.formatAmount(collateral.amount as any / 10 ** collateralDecimals);
    this.collateralAsset = collateralCurrency.symbol;
  }

  /**
   * Return percentage
   * @param num Ratio %
   * @return Percentage
   */
  private toPercentage (ratio: number): BN {
    const secureRatio: BN = Utils.bn(ratio).mul(Utils.bn(2000));
    const securePercentage = Utils.bn(secureRatio)
        .div(Utils.pow(2, 32))
        .mul(Utils.bn(100));

    return securePercentage.div(Utils.bn(2000));
  }

  /**
   * Calculate the return amount
   * @return Expected return
   */
  private calculateExpectedReturn() {
    const loan: Loan = this.loan;
    const installments: number = loan.descriptor.installments;
    const installmentAmount: any = this.expectedInstallmentAmount();
    const expectedReturn: number = Number(installmentAmount) * installments;

    return expectedReturn ? Utils.formatAmount(expectedReturn) : null;
  }

  /**
   * Calculate the installment amount
   * @return Installment amount
   */
  private expectedInstallmentAmount() {
    const loan: Loan = this.loan;
    const amountInWei = loan.descriptor.firstObligation;
    const decimals = loan.currency.decimals;
    const amount = amountInWei / 10 ** decimals;

    this.updateInstallmentsDetails();

    if (!amountInWei) {
      return 0;
    }

    return amount;
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
    return 'Confirming';
  }

}
