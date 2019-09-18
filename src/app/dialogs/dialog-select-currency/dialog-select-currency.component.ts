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
  selectedCurrency: string; // currency code
  exchangeDefault = 1;
  exchangeRcn;
  exchangeToken;
  lendPayload: {
    payableAmount: number,
    converter: string,
    fromToken: string,
    oracleData: any
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
    private web3: Web3Service,
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
    const web3 = this.web3.web3;
    const currency: Currency = this.loan.currency;
    const loanAmount = new web3.BigNumber(currency.fromUnit(this.loan.amount), 10);
    const loanExpectedReturn = new web3.BigNumber(currency.fromUnit(this.loan.descriptor.totalObligation), 10);
    const account = await this.web3.getAccount();
    this.account = Utils.shortAddress(account);

    this.setLoanValues(loanAmount, loanExpectedReturn);
    await this.getTokenRate();
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
    const selectedCurrency: string = this.selectedCurrency;

    this.exchangeToken = null;
    this.lendAmount = '0';
    this.lendExpectedReturn = '0';

    try {
      this.calculateAmounts(selectedCurrency);
    } catch (e) {
      throw Error('error calculating currency amounts');
    }
  }

  /**
   * Calculate the exchange token rate, lend amount and expected return amount in token
   * @param selectedCurrencyCode Selected currency code
   */
  async calculateAmounts(selectedCurrencyCode) {
    const web3 = this.web3.web3;

    // get RCN rate and amount
    const currency: Currency = this.loan.currency;
    const loanAmount = new web3.BigNumber(currency.fromUnit(this.loan.amount), 10);
    const loanReturn = new web3.BigNumber(currency.fromUnit(this.loan.descriptor.totalObligation), 10);
    const rcnRate: any = new web3.BigNumber(await this.getTokenRate(), 10);
    const costInRcn: any = new web3.BigNumber(rcnRate).mul(loanAmount);

    // get selected currency address
    const selectedCurrency = this.getCurrencyByCode(selectedCurrencyCode);
    const tokenAddress = selectedCurrency.address;

    // set conversion values
    const uniswapProxy: any = environment.contracts.converter.uniswapProxy;
    const fromToken: any = tokenAddress;
    const token: any = environment.contracts.rcnToken;
    let tokenRate;
    let requiredAmount;
    let expectedReturnAmount;
    let tokenCost;
    let etherCost;

    // get lend amount in another currency
    if (fromToken === token) {
      // RCN -> RCN
      tokenRate = rcnRate;
      requiredAmount = costInRcn;
      expectedReturnAmount = new web3.BigNumber(tokenRate).mul(loanReturn);
    } else {
      // Currency -> RCN
      const selectedTokenRate = await this.contractsService.getCost(
        web3.toWei(costInRcn),
        uniswapProxy,
        fromToken,
        token
      );
      tokenCost = new web3.BigNumber(selectedTokenRate[0]);
      etherCost = new web3.BigNumber(selectedTokenRate[1]);

      if (tokenCost.isZero()) {
        requiredAmount = web3.fromWei(etherCost);
      } else {
        requiredAmount = web3.fromWei(tokenCost);
      }

      tokenRate = new web3.BigNumber(requiredAmount).div(loanAmount);
      expectedReturnAmount = new web3.BigNumber(tokenRate).mul(loanReturn);
    }

    // set lend data
    this.lendPayload = {
      payableAmount: etherCost,
      converter: uniswapProxy,
      fromToken: fromToken,
      oracleData: null
    };

    this.exchangeToken = Utils.formatAmount(tokenRate);
    this.lendAmount = Utils.formatAmount(requiredAmount);
    this.lendExpectedReturn = Utils.formatAmount(expectedReturnAmount);
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
   * Get amount in RCN token
   * @return RCN rate
   */
  async getTokenRate() {
    const web3 = this.web3.web3;
    const rcnAmount = await this.contractsService.estimateLendAmount(this.loan);
    const currency = this.loan.currency;
    const loanAmount = new web3.BigNumber(currency.fromUnit(this.loan.amount), 10);
    const exchangeRcn = new web3.BigNumber(web3.fromWei(rcnAmount)).div(loanAmount);
    this.exchangeRcn = Utils.formatAmount(exchangeRcn);

    return exchangeRcn;
  }

}
