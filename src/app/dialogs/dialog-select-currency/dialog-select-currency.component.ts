import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { ContractsService } from '../../services/contracts.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dialog-select-currency',
  templateUrl: './dialog-select-currency.component.html',
  styleUrls: ['./dialog-select-currency.component.scss']
})
export class DialogSelectCurrencyComponent implements OnInit {
  loan: Loan;
  newAmount: any;
  rate: any;
  loanReturn: any;
  loanAmount: string;
  expectedReturn: string;
  loanCurrency: string;
  account: string;
  canLend: boolean;
  options = [
    { 'id': 1, name: 'RCN', img: '../../../assets/rcn.png' },
    { 'id': 2, name: 'DAI', img: '../../../assets/dai.png' },
    { 'id': 3, name: 'ETH', img: '../../../assets/eth.png' },
  ];
  selected = '-';

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
    // ---------------
    const currency = this.loan.currency;
    this.loanAmount = Utils.formatAmount(currency.fromUnit(this.loan.amount));
    this.expectedReturn = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
    this.getRate();

    this.account = await this.web3.getAccount();
    this.account = Utils.shortAddress(this.account);
  }

  async changeSelect() {
    const loanCurrency: any = this.loan.currency;
    const selectedCurrency: string = this.selected;

    if (loanCurrency === 'ARS') {
      this.calculateCurrencyLoanNoERC20(loanCurrency, selectedCurrency);
    } else {
      this.calculateCurrencyLoanERC20(loanCurrency, selectedCurrency);
    }
  }

  calculateCurrencyLoanNoERC20(loanCurrency, selectedCurrency) {
    console.info('This are the loan currency and selected currency')
    console.info(loanCurrency, selectedCurrency);
    // this.getOracleUrl();
  }

  calculateCurrencyLoanERC20(loanCurrency, selectedCurrency) {
    console.info(loanCurrency, selectedCurrency);
    // this.getOracleUrl();
  }

  async getRate() {
    // this.rate = await this.contractsService.getRate(this.loan);
    // this.rate = this.web3.web3.fromWei(this.rate);
    // console.info('rcn rate is:', this.rate);
  }

  async getOracleUrl() {
    let url = await this.contractsService.getOracleUrl(this.loan.oracle);
    console.info("This is the oracle url", url)
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }

}
