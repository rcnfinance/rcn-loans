import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Loan, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';
import { environment } from '../../../environments/environment';
// App services
import { ContractsService } from '../../services/contracts.service';
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
  lendAmount: any;
  lendExpectedReturn: string;
  lendCurrency: string;
  lendToken: string;
  exchangeRcn: string;
  exchangeToken: string;
  exchangeTooltip: string;
  // general
  account: string;
  canLend: boolean;
  availableCurrencies: Array<{
    symbol: string,
    img: string,
    address: string
  }> = [];
  expectedReturnWarning: boolean;

  loading: boolean;
  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
  }

  async ngOnInit() {
    this.availableCurrencies = environment.usableCurrencies;
    if (this.loan.isRequest) {
      this.canLend = true;
    }

    // loan currency and amounts
    const web3 = this.web3Service.web3;
    const loanCurrency: Currency = this.loan.currency;
    const loanAmount = new web3.BigNumber(
      loanCurrency.fromUnit(this.loan.amount), 10
    );
    const loanExpectedReturn = new web3.BigNumber(
      loanCurrency.fromUnit(this.loan.descriptor.totalObligation), 10
    );

    // set user account
    const account = await this.web3Service.getAccount();
    this.account = Utils.shortAddress(account);

    // set loan amount and rate
    const rate = await this.getLoanRate();
    this.loanAmount = Utils.formatAmount(loanAmount);
    this.loanExpectedReturn = Utils.formatAmount(loanExpectedReturn);
    this.exchangeRcn = Utils.formatAmount(rate);

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
    const loanAmount: number = loan.currency.fromUnit(loan.amount);
    const loanCurrency: string = loan.currency.toString();
    const loanExpectedReturn: number = loan.currency.fromUnit(
      loan.descriptor.totalObligation
    );

    // set rate values
    const rcnRate = await this.getLoanRate();
    const rcnAmount = web3.toWei(loanAmount * rcnRate);
    const rcnExpectedReturn = web3.toWei(loanExpectedReturn * rcnRate);

    // set amount in selected currency
    const symbol: string = this.lendCurrency;
    const fromToken: string = environment.contracts.rcnToken;
    const toToken: string = this.getCurrencyByCode(symbol).address;
    const decimals = await this.contractsService.getTokenDecimals(toToken);
    this.lendToken = toToken;

    let lendAmount: number;
    // let lendExpectedReturn: number;

    if (fromToken === toToken) {
      // rcn -> rcn
      lendAmount = rcnAmount;
      // lendExpectedReturn = rcnExpectedReturn;

      // set expected return warn
      if (loanCurrency === 'RCN') {
        this.expectedReturnWarning = false;
      } else {
        this.expectedReturnWarning = true;
      }
    } else {
      lendAmount = await this.contractsService.getPriceConvertTo(
        toToken,
        fromToken,
        rcnAmount
      );

      // TODO: Expected return in selected currency
      // lendExpectedReturn = await this.contractsService.getPriceConvertFrom(
      //   fromToken,
      //   toToken,
      //   rcnExpectedReturn
      // );

      // set lending currency rate
      const lendCurrencyRateInWei = new web3.BigNumber(lendAmount).div(new web3.BigNumber(loanAmount));
      const lendCurrencyRate = new web3.BigNumber(lendCurrencyRateInWei).div(new web3.BigNumber(10 ** decimals));
      this.exchangeToken = Utils.formatAmount(lendCurrencyRate, 7);

      // set expected return warn
      this.expectedReturnWarning = true;
    }

    // set ui values
    this.lendAmount = Utils.formatAmount(
      Number(lendAmount / 10 ** decimals)
    );
    this.lendExpectedReturn = Utils.formatAmount(
      Number(web3.fromWei(rcnExpectedReturn))
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
   * @return Raw exchange loan and selected currency amount
   */
  async getLoanRate(): Promise<number> {
    const currency: any = this.loan.currency;
    const oracle: string = this.loan.oracle.address;

    let rate = await this.contractsService.getRate(oracle);
    rate = 1 / currency.fromUnit(rate);

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
