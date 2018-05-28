import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
import { ContractsService } from '../../services/contracts.service';
import { Utils } from '../../utils/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private ethWei = new BigNumber(10).pow(new BigNumber(18));
  lender: string;
  weiBalance: BigNumber;
  weiAvailable: BigNumber;
  loansWithBalance: number[];
  constructor(
    private web3Service: Web3Service,
    private contractService: ContractsService
  ) { }

  get balance(): string {
    if (this.weiBalance   )
    return this.weiBalance.div(this.ethWei);
  }

  get available(): string {
    return this.weiAvailable.div(this.ethWei);
  }

  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }

  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.weiBalance = balance;
    });
  }

  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      console.log(result);
      this.weiAvailable = result[0];
      this.loansWithBalance = result[1];
    });
  }

  ngOnInit() {
    this.loadLender();
    this.loadRcnBalance();
    this.loadWithdrawBalance();
  }

}
