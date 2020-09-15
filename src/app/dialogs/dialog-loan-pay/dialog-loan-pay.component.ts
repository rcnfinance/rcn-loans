import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { timer } from 'rxjs';
import * as BN from 'bn.js';
import { environment } from './../../../environments/environment';
import { Installment } from '../../interfaces/installment';
import { Loan } from './../../models/loan.model';
import { Utils } from './../../utils/utils';
// App services
import { ContractsService } from './../../services/contracts.service';
import { InstallmentsService } from './../../services/installments.service';
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
  explorerAddress: string = environment.network.explorer.address;

  account: string;
  shortAccount: string;
  pendingAmount: string;
  currency: any;
  exchangeRcn: string;
  exchangeRcnWei: BN | string;
  exchangeTooltip: string;
  pendingAmountRcn: string;
  payAmountRcn: string;
  txCost: string;
  installmentsExpanded: boolean;
  nextInstallment: {
    installment: Installment,
    payNumber: string,
    dueDays: string
  };

  constructor(
    public dialogRef: MatDialogRef<any>,
    private contractsService: ContractsService,
    private installmentsService: InstallmentsService,
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
   * Returns if the chosen value is greater than or equal to the current debt
   * @return boolean
   */
  get sufficientPaymentAmount() {
    const pendingAmont = this.calculatePendingAmount();
    const { amount } = this.form.value;
    return amount >= pendingAmont;
  }

  /**
   * Set account address
   */
  async loadAccount() {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);
  }

  /**
   * Loan payment details
   */
  async loadDetail() {
    const loan: Loan = this.loan;
    const currency = loan.currency;
    const pendingAmont = this.calculatePendingAmount();

    this.currency = currency;
    this.pendingAmount = Utils.formatAmount(pendingAmont, 4);
    this.form.controls.amount.setValidators([Validators.required]);
    this.shortLoanId =
      String(this.loan.id).startsWith('0x') ? Utils.shortAddress(loan.id) : loan.id;

    // load installments
    this.loadInstallments();

    // set loan amount and rate
    const rate: BN = await this.getLoanRate();
    this.exchangeRcnWei = rate;

    const RCN_DECIMALS = 18;
    this.exchangeRcn = Utils.formatAmount(Number(rate) / 10 ** RCN_DECIMALS, 4);
    this.pendingAmountRcn = Utils.formatAmount(Number(this.exchangeRcn) * Number(this.pendingAmount), 4);

    await this.loadTxCost();
  }

  /**
   * Method called when the transaction was completed
   */
  async endPay() {
    await timer(1000).toPromise();
    this.dialogRef.close(true);
  }

  clickSetMaxAmount() {
    const pendingAmont = this.calculatePendingAmount();

    this.form.patchValue({
      amount: pendingAmont
    });
    this.onAmountChange();
  }

  onAmountChange() {
    const { amount } = this.form.value;
    if (amount <= 0) {
      return this.payAmountRcn = '0';
    }

    const payAmountRcn = (amount * Number(this.pendingAmountRcn)) / Number(this.pendingAmount);
    this.payAmountRcn = Utils.formatAmount(payAmountRcn, 4);
  }

  /**
   * Calculate the pending amount rounding up
   * @return Pending amount
   */
  private calculatePendingAmount() {
    const loan: Loan = this.loan;
    const currency = loan.currency;
    const pendingAmount = currency.fromUnit(loan.debt.model.estimatedObligation);

    // adds 0,001% to the amount for prevent a small due
    const additional = (0.001 * pendingAmount) / 100;
    const securePendingAmount = pendingAmount + additional;

    return securePendingAmount;
  }

  private loadExchangeTooltip() {
    const loanCurrency: string = this.loan.currency.toString();
    const oracle = this.loan.oracle.address;
    const urlOracle = environment.network.explorer.address.replace('${address}', oracle);

    if (loanCurrency !== 'RCN') {
      this.exchangeTooltip = `<a href="${ urlOracle }" target="_blank">RCN/${ loanCurrency }</a> Oracle.`;
      return;
    }
    this.exchangeTooltip = null;
    return;
  }

  private async loadTxCost() {
    this.txCost = null;

    const txCost = (await this.getTxCost()) / 10 ** 18;
    const rawEthUsd = await this.contractsService.latestAnswer();
    const ethUsd = rawEthUsd / 10 ** 8;

    this.txCost = Utils.formatAmount(txCost * ethUsd, 4);
  }

  /**
   * Calculate gas price * estimated gas
   * @return Tx cost
   */
  private async getTxCost() {
    const amount = String(this.pendingAmountRcn).replace(/,/g, '');
    if (!amount) {
      return;
    }

    const RCN_DECIMALS = 18;
    const amountInWei = Utils.getAmountInWei(Number(amount), RCN_DECIMALS).toString();

    const gasPrice = await this.web3Service.web3.eth.getGasPrice();
    const estimatedGas = await this.contractsService.payLoan(this.loan, amountInWei, true);
    const gasLimit = Number(estimatedGas) * 110 / 100;
    const txCost = gasLimit * gasPrice;
    return txCost;
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

  /**
   * Load next installment data
   */
  private async loadInstallments() {
    const loan: Loan = this.loan;
    const installment: Installment = await this.installmentsService.getCurrentInstallment(loan);
    if (!installment) {
      return;
    }

    const secondsInDay = 86400;
    const addSuffix = (n: number): string => ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';
    const payNumber = `${ installment.payNumber + addSuffix(installment.payNumber) } Pay`;
    const dueDate: number = new Date(installment.dueDate).getTime() / 1000;
    const nowDate: number = new Date().getTime() / 1000;
    const daysLeft: number = Math.round((dueDate - nowDate) / secondsInDay);

    let dueDays: string = Utils.formatDelta(dueDate - nowDate, 1);
    if (daysLeft > 1) {
      dueDays += ' left';
    } else if (daysLeft === 1 || daysLeft === 0) {
      dueDays += ' left';
    } else {
      dueDays += ' ago';
    }

    this.nextInstallment = {
      payNumber,
      dueDays,
      installment
    };
  }
}
