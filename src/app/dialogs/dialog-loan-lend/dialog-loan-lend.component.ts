import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { timer } from 'rxjs';
import * as BN from 'bn.js';
import { Loan, Engine, Status } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';
import { Currency } from 'app/utils/currencies';
// App services
import { ChainService } from 'app/services/chain.service';
import { ContractsService } from 'app/services/contracts.service';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';
import { Web3Service } from 'app/services/web3.service';
import { EventsService } from 'app/services/events.service';

@Component({
  selector: 'app-dialog-loan-lend',
  templateUrl: './dialog-loan-lend.component.html',
  styleUrls: ['./dialog-loan-lend.component.scss']
})
export class DialogLoanLendComponent implements OnInit {
  // loan
  loan: Loan;
  shortLoanId: string;
  loanAmount: string;
  loanExpectedReturn: any;
  isRequest: boolean;
  isCanceled: boolean;
  // lend
  lendAmount: string;
  lendExpectedReturn: string;
  lendCurrency: string;
  lendToken: string;
  exchangeEngineToken: string;
  exchangeToken: string;
  exchangeTooltips: string[];
  engineCurrency: Currency;
  txCost: string;
  // general
  account: string;
  canLend: boolean;
  availableCurrencies: CurrencyItem[];
  explorerAddress: string = this.chainService.config.network.explorer.address;

  loading: boolean;

  constructor(
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private eventsService: EventsService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data: {loan: Loan}
  ) {
    this.loan = data.loan;
  }

  async ngOnInit() {
    this.availableCurrencies = await this.currenciesService.getCurrencies(true);
    if (this.loan.isRequest) {
      this.canLend = true;
    }

    // loan currency and amounts
    const loanCurrency: Currency = this.loan.currency;
    const loanAmount: BN = Utils.bn(this.loan.amount);
    const loanExpectedReturn = Utils.bn(this.loan.descriptor.totalObligation);

    // set user account
    const account: string = await this.web3Service.getAccount();
    this.account = account;

    // set engine token
    const { engine } = this.loan;
    const engineCurrencySymbol = engine === Engine.RcnEngine ? 'RCN' : 'USDC';
    const engineCurrency = new Currency(engineCurrencySymbol);
    this.engineCurrency = engineCurrency;

    // set loan amount and rate
    const rate: BN = await this.getLoanRate();
    this.loanAmount = Utils.formatAmount(loanCurrency.fromUnit(loanAmount));
    this.loanExpectedReturn = Utils.formatAmount(loanCurrency.fromUnit(loanExpectedReturn));
    this.exchangeEngineToken = Utils.formatAmount(rate as any / 10 ** engineCurrency.decimals, 4);

    // set loan status
    this.isCanceled = this.loan.status === Status.Destroyed;
    this.isRequest = this.loan.status === Status.Request;

    this.loadExchangeTooltip();
    this.shortLoanId = Utils.shortAddress(this.loan.id);
  }

  /**
   * Calculate new amounts when the currency select is toggled
   */
  async onChangeCurrency() {
    this.exchangeToken = null;
    this.lendAmount = '0';
    this.lendExpectedReturn = '0';

    try {
      await this.calculateAmounts();
      this.loadExchangeTooltip();
      this.loadTxCost();
    } catch (e) {
      this.eventsService.trackError(e);
      throw Error('error calculating currency amounts');
    }
  }

  /**
   * Calculate the exchange token rate, lend amount and expected return
   * amount in token
   */
  // FIXME: review for loans RCN->RCN (with USDC Engine)
  async calculateAmounts() {
    const loan: Loan = this.loan;
    const loanAmount: BN = Utils.bn(loan.amount);
    const loanExpectedReturn: BN = Utils.bn(loan.descriptor.totalObligation);

    // set rate values
    const engineTokenRate: BN = await this.getLoanRate();
    const engineTokenAmountInWei: BN = Utils.bn(loanAmount.mul(engineTokenRate));
    const engineTokenExpectedReturnInWei: BN = Utils.bn(loanExpectedReturn.mul(engineTokenRate));
    const loanCurrencyDecimals: number = loan.currency.decimals;
    const engineTokenAmount: BN = engineTokenAmountInWei.div(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));
    const engineTokenExpectedReturn: BN = engineTokenExpectedReturnInWei.div(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));

    // set amount in selected currency
    const { engine } = this.loan;
    const symbol: string = this.lendCurrency;
    const { config } = this.chainService;
    const fromToken: string = config.contracts[engine].token;
    const toToken: string = await this.currenciesService.getCurrencyByKey('symbol', symbol).address;
    const { decimals: engineDecimals } = this.engineCurrency;
    const { decimals: lendDecimals } = new Currency(symbol);
    this.lendToken = toToken;

    let lendAmount: BN | string;
    // let lendExpectedReturn: number;

    if (fromToken === toToken) {
      // engineToken -> engineToken
      lendAmount = engineTokenAmount;
      // lendExpectedReturn = engineTokenExpectedReturn;
    } else {
      lendAmount = await this.contractsService.estimateLendAmount(loan, toToken);

      // TODO: Expected return in selected currency
      // lendExpectedReturn = await this.contractsService.getPriceConvertFrom(
      //   fromToken,
      //   toToken,
      //   engineTokenExpectedReturn
      // );

      // set lending currency rate
      const lendAmountInWei: BN = Utils.bn(lendAmount).mul(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));
      const lendOverAmount: BN = Utils.bn(lendAmountInWei).div(Utils.bn(loanAmount));
      const lendCurrencyRate: number = lendOverAmount.toString() as any / 10 ** lendDecimals;
      const formattedRate = Utils.formatAmount(lendCurrencyRate, 4);

      // TODO: reuse this technique
      // add one more decimal if the number is too small
      this.exchangeToken = Number(formattedRate) ? formattedRate : Utils.formatAmount(lendCurrencyRate, 5);
    }

    // set ui values
    this.lendAmount = Utils.formatAmount(
      lendAmount.toString() as any / 10 ** lendDecimals, 4
    );
    this.lendExpectedReturn = Utils.formatAmount(
      engineTokenExpectedReturn as any / 10 ** engineDecimals, 4
    );
  }

  loadExchangeTooltip() {
    const loanCurrency: string = this.loan.currency.toString();
    const lendCurrency: string = this.lendCurrency;
    const oracle = this.loan.oracle.address;
    const { engine } = this.loan;
    const { config } = this.chainService;
    const tokenConverter = config.contracts[engine].converter.uniswapConverter;
    const urlOracle = config.network.explorer.address.replace('${address}', oracle);
    const urlTokenConverter = config.network.explorer.address.replace('${address}', tokenConverter);
    const { symbol: engineCurrencySymbol } = this.engineCurrency;
    this.exchangeTooltips = [];

    if (!this.exchangeToken) {
      if (loanCurrency !== engineCurrencySymbol) {
        this.exchangeTooltips.push(`<a href="${ urlOracle }" target="_blank">${ engineCurrencySymbol }/${ loanCurrency }</a> Oracle.`);
      }
      return;
    }

    if (loanCurrency !== engineCurrencySymbol && lendCurrency !== engineCurrencySymbol && loanCurrency !== lendCurrency) {
      this.exchangeTooltips.push(`<a href="${ urlOracle }" target="_blank">${ engineCurrencySymbol }/${ loanCurrency }</a> Oracle.`);
      this.exchangeTooltips.push(`<a href="${ urlTokenConverter }" target="_blank">${ engineCurrencySymbol }/${ lendCurrency }</a> Token Converter.`);
      return;
    }
    if (loanCurrency !== engineCurrencySymbol) {
      this.exchangeTooltips.push(`<a href="${ urlOracle }" target="_blank">${ engineCurrencySymbol }/${ loanCurrency }</a> Oracle.`);
      return;
    }
    if (lendCurrency !== engineCurrencySymbol) {
      this.exchangeTooltips.push(`<a href="${ urlTokenConverter }" target="_blank">${ engineCurrencySymbol }/${ lendCurrency }</a> Token Converter.`);
      return;
    }
  }

  async loadTxCost() {
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
   * Get currency data by code
   * @param symbol Currency symbol
   * @return Currency data
   */
  getCurrencyByCode(symbol: string): {
    symbol: string,
    img: string,
    address: string
  } {
    const currency: Array<any> = this.availableCurrencies.filter(
      item => item.symbol === symbol
    );
    return currency[0] || null;
  }

  /**
   * Load rates and exchange values
   * @return Loan rate in wei
   */
  async getLoanRate(): Promise<BN> {
    const currency: any = this.loan.currency;
    const oracle: string = this.loan.oracle.address;
    const rate = await this.contractsService.getRate(oracle, currency.decimals);
    return rate;
  }

  /**
   * Calculate gas price * estimated gas
   * @return Tx cost
   */
  async getTxCost() {
    const {
      payableAmount,
      tokenConverter,
      lendToken,
      required,
      cosignerAddress,
      cosignerLimit,
      loanId,
      oracleData,
      cosignerData,
      callbackData,
      account
    } = await this.contractsService.getLendParams(this.loan, this.lendToken);
    const { engine } = this.loan;
    const gasPrice = await this.web3Service.web3.eth.getGasPrice();
    const estimatedGas = await this.contractsService.converterRampLend(
      engine,
      payableAmount,
      tokenConverter,
      lendToken,
      required,
      cosignerAddress,
      cosignerLimit,
      loanId,
      oracleData,
      cosignerData,
      callbackData,
      account,
      true
    );
    const gasLimit = Number(estimatedGas) * 110 / 100;
    const txCost = gasLimit * gasPrice;
    return txCost;
  }

  /**
   * Method called when the transaction was completed
   */
  async endLend() {
    await timer(1000).toPromise();
    this.dialogRef.close(true);
  }

  /**
   * Close dialog
   */
  closeDialog() {
    this.dialogRef.close();
  }
}
