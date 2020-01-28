import { Component, OnInit } from '@angular/core';
// App services
import { Web3Service } from './../../../services/web3.service';

@Component({
  selector: 'app-loan-does-not-exist',
  templateUrl: './loan-does-not-exist.component.html',
  styleUrls: ['./loan-does-not-exist.component.scss']
})
export class LoanDoesNotExistComponent implements OnInit {

  account: string;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.loadAccount();
  }

  /**
   * Load user account
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
  }
}
