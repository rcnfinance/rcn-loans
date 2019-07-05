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

  // leftLabel: string;
  // leftValue: string;
  // rightLabel: string;
  // rightValue: string;
  // durationLabel: string;
  // durationValue: string;
  // canLend: boolean;
  rcnAmount: any;
  rate: any;
  daiAmount: string;
  ethAmount: string;
  rcnReturn: any;
  daiReturn: string;
  ethReturn: string;
  loanAmount: string;
  expectedReturn: string;
  loanCurrency: string;

  options = [
    { 'id': 1, name: 'RCN', img: '../../../assets/rcn.png' },
    { 'id': 2, name: 'DAI', img: '../../../assets/dai.png' },
    { 'id': 2, name: 'ETH', img: '../../../assets/eth.png' }
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
    this.loanAmount = this.formatAmount(this.loan.amount);
    this.expectedReturn = this.formatAmount(this.loan.expectedReturn);
    this.rcnAmount = await this.contractsService.estimateLendAmount(this.loan);
    this.rcnAmount = this.web3.web3.fromWei(this.rcnAmount);
    this.rcnAmount = parseInt(this.rcnAmount, 10);
    this.rcnReturn = await this.contractsService.estimatePayAmount(this.loan, parseInt(this.loanAmount, 10));
    // this.rcnReturn = this.web3.web3.fromWei(this.rcnReturn)
    // this.rcnReturn = parseInt(this.rcnReturn)
    console.info('rcn return is:', this.rcnReturn);

    this.getRate();

    // this.rcnAmount = this.formatAmount(this.rcnAmount);
    console.info('rcn amount is:', this.rcnAmount);

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
