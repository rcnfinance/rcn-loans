import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';
import { environment } from '../../../environments/environment';
import { ContractsService } from '../../services/contracts.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dialog-select-currency',
  templateUrl: './dialog-select-currency.component.html',
  styleUrls: ['./dialog-select-currency.component.scss']
})
export class DialogSelectCurrencyComponent implements OnInit {
  // loan
  loan: Loan;
  loanAmount: string;
  loanExpectedReturn: any;
  loanCurrency: string;
  // lend
  lendAmount: any;
  lendExpectedReturn: string;
  selectedCurrency: string;
  exchangeRcn;
  exchangeToken;
  lendPayload: {
    payableAmount: number,
    lendToken: string,
    amountInToken: string
  };
  // general
  account: string;
  canLend: boolean;
  availableCurrencies: Array<{
    symbol: string,
    img: string,
    address: string
  }> = [];

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
    console.info(data.loan);
  }

  async ngOnInit() {
    if (this.loan.isRequest) {
      this.canLend = true;
    } else if (this.loan instanceof Loan) {
      this.canLend = false;
    }

    this.availableCurrencies = environment.usableCurrencies;
    const web3 = this.web3Service.web3;
    const currency: Currency = this.loan.currency;
    const loanAmount = new web3.BigNumber(currency.fromUnit(this.loan.amount), 10);
    const loanExpectedReturn = new web3.BigNumber(currency.fromUnit(this.loan.descriptor.totalObligation), 10);
    const account = await this.web3Service.getAccount();
    this.account = Utils.shortAddress(account);

    this.setLoanValues(loanAmount, loanExpectedReturn);
    await this.loadExchange();
  }

  /**
   * Set loan amount and return values
   * @param loanAmount Loan amount
   * @param loanExpectedReturn Expected return amount
   */
  setLoanValues(loanAmount, loanExpectedReturn) {
    this.loanAmount = Utils.formatAmount(loanAmount);
    this.loanExpectedReturn = Utils.formatAmount(loanExpectedReturn);
  }

  /**
   * Calculate new amounts when the currency select is toggled
   */
  async onChangeCurrency() {
    this.exchangeToken = null;
    this.lendAmount = '0';
    this.lendExpectedReturn = '0';

    try {
      this.calculateAmounts();
    } catch (e) {
      throw Error('error calculating currency amounts');
    }
  }

  /**
   * Calculate the exchange token rate, lend amount and expected return amount in token
   */
  async calculateAmounts() {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const loanAmount: number = loan.currency.fromUnit(loan.amount);
    const loanExpectedReturn: number = loan.currency.fromUnit(loan.descriptor.totalObligation);
    const ethAddress: string = environment.contracts.converter.ethAddress;

    // set rate values
    const rates = await this.loadExchange();
    const rcnRate = rates.exchangeLoanCurrency;
    const rcnAmount = web3.toWei(loanAmount * rcnRate);
    const rcnExpectedReturn = web3.toWei(loanExpectedReturn * rcnRate);

    // set amount in selected currency
    const symbol: string = this.selectedCurrency;
    const fromToken: string = environment.contracts.rcnToken;
    const toToken: string = this.getCurrencyByCode(symbol).address;

    let lendAmount: number;
    let lendExpectedReturn: number;
    let payableAmount: number;

    if (fromToken === toToken) {
      // rcn -> rcn
      lendAmount = rcnAmount;
      lendExpectedReturn = rcnExpectedReturn;
    } else {
      // rcn -> currency
      lendAmount = await this.contractsService.getPriceConvertFrom(
        fromToken,
        toToken,
        rcnAmount
      );
      lendExpectedReturn = await this.contractsService.getPriceConvertFrom(
        fromToken,
        toToken,
        rcnExpectedReturn
      );
      // rcn -> eth
      if (toToken === ethAddress) {
        payableAmount = lendAmount;
      }
    }

    // set ui values
    this.lendAmount = Utils.formatAmount(
      Number(web3.fromWei(lendAmount))
    );
    this.lendExpectedReturn = Utils.formatAmount(
      Number(web3.fromWei(lendExpectedReturn))
    );

    // set lend data
    this.lendPayload = {
      payableAmount: payableAmount,
      lendToken: toToken,
      amountInToken: rcnAmount
    };
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
    const currency: Array<any> = this.availableCurrencies.filter(item => item.symbol === symbol);
    return currency[0] || null;
  }

  /**
   * Load rates and exchange values
   * @return Raw exchange loan and selected currency amount
   */
  async loadExchange(): Promise<{
    exchangeLoanCurrency: number,
    exchangeSelectedCurrency: number
  }> {
    const loanCurrency: any = this.loan.currency;
    const selectedCurrency: string = this.selectedCurrency;

    let rateLoanCurrency: number;
    let rateSelectedCurrency: number;
    let exchangeLoanCurrency: number;
    let exchangeSelectedCurrency: number;

    // rcn exchange value
    rateLoanCurrency = await this.getParsedRate(loanCurrency);
    exchangeLoanCurrency = 1 / rateLoanCurrency;
    this.exchangeRcn = Utils.formatAmount(exchangeLoanCurrency);

    // selected currency exchange value
    if (selectedCurrency) {
      rateSelectedCurrency = await this.getParsedRate(
        new Currency(selectedCurrency)
      );
      exchangeSelectedCurrency = rateSelectedCurrency / rateLoanCurrency;
      this.exchangeToken = Utils.formatAmount(exchangeSelectedCurrency);
    }

    return {
      exchangeLoanCurrency,
      exchangeSelectedCurrency
    };
  }

  /**
   * Get rate with parsed decimals
   * @param oracleAddress Oracle address
   * @param currency Currency model
   */
  private async getParsedRate(
    currency: Currency
  ) {
    const oracle = await this.contractsService.symbolToOracle(currency.toString());
    const rate = await this.contractsService.getRate(oracle);

    return currency.fromUnit(rate);
  }

}
