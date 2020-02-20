import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as BN from 'bn.js';
import { environment } from '../../../environments/environment';
import { Loan, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';
// App services
import { ContractsService } from '../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from '../../services/currencies.service';
import { Web3Service } from '../../services/web3.service';
import { EventsService } from '../../services/events.service';

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
  exchangeRcn: string;
  exchangeToken: string;
  exchangeTooltip: string;
  // general
  account: string;
  canLend: boolean;
  availableCurrencies: CurrencyItem[];
  expectedReturnWarning: boolean;

  loading: boolean;
  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
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
    this.account = Utils.shortAddress(account);

    // set loan amount and rate
    const web3: any = this.web3Service.web3;
    const rate: BN = await this.getLoanRate();
    this.loanAmount = Utils.formatAmount(loanCurrency.fromUnit(loanAmount));
    this.loanExpectedReturn = Utils.formatAmount(loanCurrency.fromUnit(loanExpectedReturn));
    this.exchangeRcn = Utils.formatAmount(web3.utils.fromWei(rate));

    // set loan status
    this.isCanceled = this.loan.status === Status.Destroyed;
    this.isRequest = this.loan.status === Status.Request;

    this.loadExchangeTooltip();
    this.shortLoanId =
      this.loan.id.startsWith('0x') ? Utils.shortAddress(this.loan.id) : this.loan.id;
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
    } catch (e) {
      this.eventsService.trackError(e);
      throw Error('error calculating currency amounts');
    }
  }

  /**
   * Calculate the exchange token rate, lend amount and expected return
   * amount in token
   */
  async calculateAmounts() {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const loanCurrency: string = loan.currency.toString();
    const loanAmount: BN = Utils.bn(loan.amount);
    const loanExpectedReturn: BN = Utils.bn(loan.descriptor.totalObligation);

    // set rate values
    const rcnRate: BN = await this.getLoanRate();
    const rcnAmountInWei: BN = Utils.bn(loanAmount.mul(rcnRate));
    const rcnExpectedReturnInWei: BN = Utils.bn(loanExpectedReturn.mul(rcnRate));
    const loanCurrencyDecimals: number = loan.currency.decimals;
    const rcnAmount: BN = rcnAmountInWei.div(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));
    const rcnExpectedReturn: BN = rcnExpectedReturnInWei.div(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));

    // set amount in selected currency
    const symbol: string = this.lendCurrency;
    const fromToken: string = environment.contracts.rcnToken;
    const toToken: string = await this.currenciesService.getCurrencyByKey('symbol', symbol).address;
    const lendCurrencyDecimals: number = await this.contractsService.getTokenDecimals(toToken);
    this.lendToken = toToken;

    let lendAmount: BN | string;
    // let lendExpectedReturn: number;

    if (fromToken === toToken) {
      // rcn -> rcn
      lendAmount = rcnAmount;
      // lendExpectedReturn = rcnExpectedReturn;

      // set expected return warn
      this.expectedReturnWarning = loanCurrency === 'RCN' || false;
    } else {
      lendAmount = await this.contractsService.getPriceConvertTo(
        toToken,
        fromToken,
        rcnAmount.toString()
      );

      // TODO: Expected return in selected currency
      // lendExpectedReturn = await this.contractsService.getPriceConvertFrom(
      //   fromToken,
      //   toToken,
      //   rcnExpectedReturn
      // );

      // set lending currency rate
      const lendAmountInWei: BN = Utils.bn(lendAmount).mul(Utils.bn(10).pow(Utils.bn(loanCurrencyDecimals)));
      const lendOverAmount: BN = Utils.bn(lendAmountInWei).div(Utils.bn(loanAmount));
      const lendCurrencyRate: number = lendOverAmount.toString() as any / 10 ** lendCurrencyDecimals;
      this.exchangeToken = Utils.formatAmount(lendCurrencyRate, 7);

      // set expected return warn
      this.expectedReturnWarning = true;
    }

    // set ui values
    this.lendAmount = Utils.formatAmount(
      lendAmount.toString() as any / 10 ** lendCurrencyDecimals
    );
    this.lendExpectedReturn = Utils.formatAmount(
      web3.utils.fromWei(rcnExpectedReturn)
    );
  }

  loadExchangeTooltip() {
    const loanCurrency: string = this.loan.currency.toString();
    const lendCurrency: string = this.lendCurrency;
    const oracle = this.loan.oracle;
    const tokenConverter = environment.contracts.converter.tokenConverter;

    if (!this.exchangeToken) {
      if (loanCurrency !== 'RCN') {
        this.exchangeTooltip = `The RCN/${ loanCurrency } exchange rate for this loan is calculated using
        the ${ oracle } oracle.`;
        return;
      }
      this.exchangeTooltip = null;
      return;
    }

    if (loanCurrency !== 'RCN' && lendCurrency !== 'RCN') {
      this.exchangeTooltip = `The RCN/${ loanCurrency } exchange rate for this loan is calculated using
      the ${ oracle } oracle. The RCN/${ lendCurrency } exchange rate for this loan is calculated
      using the ${ tokenConverter } token converter contract.`;
      return;
    }
    if (loanCurrency !== 'RCN') {
      this.exchangeTooltip = `The RCN/${ loanCurrency } exchange rate for this loan is calculated using
      the ${ oracle } oracle.`;
      return;
    }
    if (lendCurrency !== 'RCN') {
      this.exchangeTooltip = `The RCN/${ lendCurrency } exchange rate for this loan is calculated using
      the ${ tokenConverter } token converter contract.`;
      return;
    }
  }

  /**
   * Get currency data by code
   * @param symbol Currency symbol
   * @return Currency data
   */
  getCurrencyByCode(symbol): {
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

    this.dialogRef.close();
  }

}
