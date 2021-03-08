import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Web3Service } from 'app/services/web3.service';
import { TitleService } from 'app/services/title.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';
import { WalletType } from 'app/interfaces/wallet.interface';
import { DialogWalletSelectComponent } from 'app/dialogs/dialog-wallet-select/dialog-wallet-select.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  account: string;
  subscriptionAccount: Subscription;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private web3Service: Web3Service,
    private titleService: TitleService,
    private walletConnectService: WalletConnectService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('RCN');
    this.loadAccount();
    this.listenLoginEvents();
  }

  ngOnDestroy() {
    this.subscriptionAccount.unsubscribe();
  }

  async clickManage() {
    const { account } = this;
    if (account) {
      const MY_LOANS_URL = `/address/${account}`;
      return this.router.navigate([MY_LOANS_URL]);
    }

    await this.walletConnectService.connect();
  }

  clickWallet(walletType: WalletType) {
    this.dialog.open(DialogWalletSelectComponent, {
      panelClass: 'dialog-wallet-select-wrapper',
      data: { walletType }
    });
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private listenLoginEvents() {
    this.subscriptionAccount =
        this.web3Service.loginEvent.subscribe(async () => {
          this.loadAccount();
        });
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.account = account;
  }
}
