import BigNumber from 'bignumber.js';
import { Component, OnInit } from '@angular/core';

// App Services
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  get balance(): string {
    if (this.rcnBalance === undefined) {
      return '...';
    }
    return this.removeTrailingZeros(this.rcnBalance.toFixed(18));
  }

  get available(): string {
    if (this.weiAvailable === undefined) {
      return '...';
    }
    return this.removeTrailingZeros((this.weiAvailable / this.ethWei).toFixed(18));
  }
  private ethWei = new BigNumber(10).pow(new BigNumber(18));
  lender: string;
  rcnBalance: BigNumber;
  weiAvailable: BigNumber;
  loansWithBalance: number[];
  constructor(
    private web3Service: Web3Service,
    private contractService: ContractsService
  ) { }

  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }

  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.rcnBalance = balance;
    });
  }

  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      this.weiAvailable = result[0];
      this.loansWithBalance = result[1];
    });
  }

  ngOnInit() {
    this.loadLender();
    this.loadRcnBalance();
    this.loadWithdrawBalance();
  }

  private removeTrailingZeros(value) {
    value = value.toString();

    if (value.indexOf('.') === -1) {
      return value;
    }

    while ((value.slice(-1) === '0' || value.slice(-1) === '.') && value.indexOf('.') !== -1) {
      value = value.substr(0, value.length - 1);
    }
    return value;
  }

}
