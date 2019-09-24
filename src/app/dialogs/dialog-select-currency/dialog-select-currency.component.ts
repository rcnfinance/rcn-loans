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
  lendCurrency: string;
  lendToken: string;
  exchangeRcn;
  exchangeToken;
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
    } catch (e) {
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
    this.lendToken = toToken;

    let lendAmount: number;
    let lendExpectedReturn: number;

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

      // set lending currency rate
      let lendCurrencyRate = new web3.BigNumber(web3.fromWei(lendAmount / loanAmount));

      // set slippage
      const aditionalSlippage = new web3.BigNumber(
        environment.contracts.converter.params.aditionalSlippage
      );
      lendCurrencyRate = lendCurrencyRate.mul(
        new web3.BigNumber(100).add(aditionalSlippage)
      ).div(
        new web3.BigNumber(100)
      );

      this.exchangeToken = Utils.formatAmount(lendCurrencyRate, 7);
    }

    // set ui values
    this.lendAmount = Utils.formatAmount(
      Number(web3.fromWei(lendAmount))
    );
    this.lendExpectedReturn = Utils.formatAmount(
      Number(web3.fromWei(lendExpectedReturn))
    );
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

}
