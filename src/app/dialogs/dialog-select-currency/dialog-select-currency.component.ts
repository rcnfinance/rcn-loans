import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { ContractsService } from '../../services/contracts.service';
import { Web3Service } from '../../services/web3.service';
import { Currency } from '../../utils/currencies';

@Component({
  selector: 'app-dialog-select-currency',
  templateUrl: './dialog-select-currency.component.html',
  styleUrls: ['./dialog-select-currency.component.scss']
})
export class DialogSelectCurrencyComponent implements OnInit {
  loan: Loan;

  // leftLabel: string;
  // leftValue: string;
  // rightLabel: string;
  // rightValue: string;
  // durationLabel: string;
  // durationValue: string;
  // canLend: boolean;
  newAmount: any;
  rate: any;
  loanReturn: any;
  loanAmount: string;
  expectedReturn: string;
  loanCurrency: string;
  account: string;

  options = [
    { 'id': 1, name: 'RCN', img: '../../../assets/rcn.png' },
    { 'id': 2, name: 'DAI', img: '../../../assets/dai.png' },
    { 'id': 2, name: 'ETH', img: '../../../assets/eth.png' }
  ];

  selected: any = '-';
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
    const currency = this.loan.currency;
    this.loanAmount = Utils.formatAmount(currency.fromUnit(this.loan.amount));
    this.expectedReturn = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
    // this.rcnAmount = await this.contractsService.estimateLendAmount(this.loan);
    // this.rcnAmount = this.web3.web3.fromWei(this.rcnAmount);
    // this.rcnAmount = parseInt(this.rcnAmount, 10);
    // this.rcnReturn = await this.contractsService.estimatePayAmount(this.loan, parseInt(this.loanAmount, 10));

    this.getRate();

    // this.rcnAmount = this.formatAmount(this.rcnAmount);

    this.account = await this.web3.getAccount();
    this.account = Utils.shortAddress(this.account);
    console.info ('my account is:' + this.account);
  }

  async changeSelect() {
    const currency = this.loan.currency;
    let amount: any;
    let loanReturn: number;
    switch (this.selected) {
      case 'RCN':
        amount = await this.contractsService.estimateLendAmount(this.loan);
        amount = this.web3.web3.fromWei(amount);
        console.info('decimals', Currency.getDecimals(this.loan.oracle.currency));

        // amount = parseInt(amount, 10);
        this.newAmount = amount * 10 ** Currency.getDecimals(this.loan.oracle.currency);
        loanReturn = await this.contractsService.estimatePayAmount(this.loan, this.newAmount);

        break;
      case 'DAI':
        amount = 0;
        loanReturn = 0;
        break;
      case 'ETH':
        amount = 0;
        loanReturn = 0;
        break;
      default:
        break;
    }
    this.newAmount = Utils.formatAmount(currency.fromUnit(this.newAmount));
    this.loanReturn = Utils.formatAmount(currency.fromUnit(loanReturn));

  }

  async getRate() {
    this.rate = await this.contractsService.getRate(this.loan);
    this.rate = this.web3.web3.fromWei(this.rate);
    console.info('rcn rate is:', this.rate);
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }

}
