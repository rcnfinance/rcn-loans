import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { timer } from 'rxjs';
import * as BN from 'bn.js';
import * as moment from 'moment';
import { Installment } from 'app/interfaces/installment';
import { Loan, Engine } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';
import { Currency } from 'app/utils/currencies';
// App services
import { CurrenciesService } from 'app/services/currencies.service';
import { ContractsService } from 'app/services/contracts.service';
import { InstallmentsService } from 'app/services/installments.service';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';

@Component({
  selector: 'app-dialog-loan-pay',
  templateUrl: './dialog-loan-pay.component.html',
  styleUrls: ['./dialog-loan-pay.component.scss']
})
export class DialogLoanPayComponent implements OnInit {
  FEE_AVERAGE = 0.15;

  loan: Loan;
  shortLoanId: string;
  loading: boolean;
  form: FormGroup;
  explorerAddress: string = this.chainService.config.network.explorer.address;

  account: string;
  shortAccount: string;
  pendingAmount: number;
  currency: any;
  engineCurrency: Currency;
  exchangeEngineToken: number;
  exchangeEngineTokenWei: BN | string;
  exchangeTooltip: string;
  pendingAmountEngineToken: number;
  payAmountEngineToken: number;
  txCost: string;
  feeCost: string;
  installmentsExpanded: boolean;
  hasFee: boolean;
  nextInstallment: {
    installment: Installment,
    payNumber: string,
    dueDays: string
  };

  constructor(
    public dialogRef: MatDialogRef<any>,
    private chainService: ChainService,
    private currenciesService: CurrenciesService,
    private contractsService: ContractsService,
    private installmentsService: InstallmentsService,
    private web3Service: Web3Service,
    @Inject(MAT_DIALOG_DATA) public data: {
      loan: Loan
    }
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
      ]),
      feeAmount: new FormControl(null)
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
    this.pendingAmount = pendingAmont;
    this.form.controls.amount.setValidators([Validators.required]);
    this.shortLoanId = Utils.shortAddress(loan.id);

    // load installments
    this.loadInstallments();

    // set loan amount and rate
    const rate: BN = await this.getLoanRate();
    this.exchangeEngineTokenWei = rate;

    const { engine } = loan;
    const engineCurrencySymbol = engine === Engine.RcnEngine ? 'RCN' : 'USDC';
    const engineCurrency = new Currency(engineCurrencySymbol);
    this.engineCurrency = engineCurrency;
    this.hasFee = engine === Engine.UsdcEngine;

    const ENGINE_TOKEN_DECIMALS = this.currenciesService.getCurrencyDecimals('symbol', engineCurrency.symbol);
    const exchangeEngineToken = Number(rate) / 10 ** ENGINE_TOKEN_DECIMALS;
    this.exchangeEngineToken = exchangeEngineToken;

    // add fee
    const pendingAmountEngineToken = exchangeEngineToken * pendingAmont;
    const feeAmount = this.getFeeAmount(pendingAmountEngineToken);
    this.pendingAmountEngineToken = pendingAmountEngineToken + feeAmount;

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
    const pendingAmount = this.calculatePendingAmount();
    const feeAmount = this.getFeeAmount(pendingAmount);

    this.form.patchValue({
      amount: pendingAmount,
      feeAmount
    });
    this.onAmountChange();
  }

  onAmountChange() {
    const { amount } = this.form.value;
    if (amount <= 0) {
      this.feeCost = null;
      return this.payAmountEngineToken = 0;
    }

    const feeCost = this.getFeeAmount(amount);
    this.feeCost = feeCost ? Utils.formatAmount(feeCost, 4) : null;
    this.payAmountEngineToken = (amount * Number(this.pendingAmountEngineToken)) / Number(this.pendingAmount);
  }

  /**
   * Calculate the pending amount rounding up
   * @return Pending amount
   */
  private calculatePendingAmount() {
    const loan: Loan = this.loan;
    const { symbol } = loan.currency;
    const { estimatedObligation } = loan.debt.model;
    const pendingAmount = this.currenciesService.getAmountFromDecimals(estimatedObligation, symbol);

    // adds 0,001% to the amount for prevent a small due
    const additional = (0.001 * pendingAmount) / 100;
    const securePendingAmount = pendingAmount + additional;

    return securePendingAmount;
  }

  private loadExchangeTooltip() {
    const { engine, currency } = this.loan;
    const { config } = this.chainService;
    const engineCurrency = this.currenciesService.getCurrencyByKey('address', config.contracts[engine].token);
    const oracle = this.loan.oracle.address;
    const urlOracle = config.network.explorer.address.replace('${address}', oracle);

    if (currency.symbol !== engineCurrency.symbol) {
      this.exchangeTooltip = `<a href="${ urlOracle }" target="_blank">${ engineCurrency.symbol }/${ currency.symbol }</a> Oracle.`;
      return;
    }
    this.exchangeTooltip = null;
    return;
  }

  private async loadTxCost() {
    this.txCost = null;

    try {
      const txCost = (await this.getTxCost()) / 10 ** 18;
      const rawChainCurrencyToUsd = await this.contractsService.latestAnswer();
      const chainCurrencyToUsd = rawChainCurrencyToUsd / 10 ** 8;
      this.txCost = Utils.formatAmount(txCost * chainCurrencyToUsd) + ' USD';
    } catch (err) {
      this.txCost = '-';
    }
  }

  /**
   * Calculate gas price * estimated gas
   * @return Tx cost
   */
  private async getTxCost() {
    const amount = String(this.pendingAmountEngineToken).replace(/,/g, '');
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
    const decimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
    const rate = await this.contractsService.getRate(oracle, decimals);
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
    const dueDate: number = new Date(moment(installment.dueDate).format()).getTime() / 1000;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
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

  /**
   * Return the engine fee amount
   * @param amount Amount to pay
   * @return Fee amount
   */
  private getFeeAmount(amount: number) {
    const { FEE_AVERAGE, hasFee } = this;
    if (hasFee) {
      return FEE_AVERAGE * amount / 100;
    }
    return 0;
  }
}
