import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as BN from 'bn.js';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
// App services
import { ContractsService } from '../../services/contracts.service';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-dialog-loan-pay',
  templateUrl: './dialog-loan-pay.component.html',
  styleUrls: ['./dialog-loan-pay.component.scss']
})
export class DialogLoanPayComponent implements OnInit {

  loan: Loan;
  shortLoanId: string;
  loading: boolean;
  form: FormGroup;

  account: string;
  shortAccount: string;
  pendingAmount: string;
  currency: any;
  exchangeRcn: string;
  exchangeRcnWei: BN | string;
  exchangeTooltip: string;
  pendingAmountRcn: string;
  payAmountRcn: string;

  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    private cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<any>,
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.loan = this.data.loan;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
    this.buildForm();

    await this.loadDetail();
    this.loadExchangeTooltip();

    await this.loadAccount();
  }

  buildForm() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.required
      ])
    });
  }

  /**
   * Set account address
   */
  async loadAccount() {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();

    this.account = web3.utils.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);
  }

  /**
   * Loan payment details
   */
  async loadDetail() {
    const loan: Loan = this.loan;
    const currency = loan.currency;
    const pendingAmount = currency.fromUnit(loan.debt.model.estimatedObligation);

    // adds 0,001% to the amount for prevent a small due
    const additional = (0.001 * pendingAmount) / 100;
    const securePendingAmount = pendingAmount + additional;

    this.currency = currency;
    this.pendingAmount = Utils.formatAmount(securePendingAmount);
    this.form.controls.amount.setValidators([Validators.required]);
    this.shortLoanId =
      this.loan.id.startsWith('0x') ? Utils.shortAddress(loan.id) : loan.id;

    // set loan amount and rate
    const rate: BN = await this.getLoanRate();
    this.exchangeRcnWei = rate;

    const RCN_DECIMALS = 18;
    this.exchangeRcn = Utils.formatAmount(Number(rate) / 10 ** RCN_DECIMALS);
    this.pendingAmountRcn = Utils.formatAmount(Number(this.exchangeRcn) * Number(this.pendingAmount));

    console.info('pending amount', Utils.formatAmount(pendingAmount));
    console.info('secre pending amount', Utils.formatAmount(securePendingAmount));
  }

  /**
   * Method called when the transaction was completed
   */
  endPay() {
    this.finishProgress = true;
    this.cdRef.detectChanges();
  }

  /**
   * Show loading progress bar
   */
  showProgressbar() {
    this.startProgress = true;
    this.loading = true;
  }

  /**
   * Hide progressbar and close dialog
   */
  hideProgressbar() {
    this.startProgress = false;
    this.finishProgress = false;
    this.loading = false;

    this.dialogRef.close(true);
  }

  clickSetMaxAmount() {
    this.form.patchValue({
      amount: this.pendingAmount
    });
    this.onAmountChange();
  }

  onAmountChange() {
    const { amount } = this.form.value;
    if (amount <= 0) {
      return this.payAmountRcn = '0';
    }

    const payAmountRcn = (amount * Number(this.pendingAmountRcn)) / Number(this.pendingAmount);
    this.payAmountRcn = Utils.formatAmount(payAmountRcn);
  }

  private loadExchangeTooltip() {
    const loanCurrency: string = this.loan.currency.toString();
    const oracle = this.loan.oracle;

    if (loanCurrency !== 'RCN') {
      this.exchangeTooltip = `The RCN/${ loanCurrency } exchange rate for this loan is calculated using
      the ${ oracle } oracle.`;
      return;
    }
    this.exchangeTooltip = null;
    return;
  }

  /**
   * Load rates and exchange values
   * @return Loan rate in wei
   */
  private async getLoanRate(): Promise<BN> {
    const currency: any = this.loan.currency;
    const oracle: string = this.loan.oracle.address;
    const rate = await this.contractsService.getRate(oracle, currency.decimals);
    return rate;
  }
}
