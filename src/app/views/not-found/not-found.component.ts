import { Component, OnInit } from '@angular/core';
// App Services
import { TitleService } from '../../services/title.service';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  account: string;

  constructor(
    private titleService: TitleService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Not found');
    this.loadAccount();
  }

  /**
   * Load user account
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);
  }
}
