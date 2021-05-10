import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Web3Service } from 'app/services/web3.service';
import { TitleService } from 'app/services/title.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';
import { WalletType } from 'app/interfaces/wallet.interface';
import { DialogWalletSelectComponent } from 'app/dialogs/dialog-wallet-select/dialog-wallet-select.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInSlow', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(2000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInFast', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInRight', [
      transition('* => *', [
        style({ opacity: .3, transform: 'translateX(100%)' }),
        animate(1000, style({ transform: 'translateX(0%)' })),
        animate(2000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition('* => *', [
        style({ opacity: .3, transform: 'translateX(-100%)' }),
        animate(1000, style({ transform: 'translateX(0%)' })),
        animate(2000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInBottom', [
      transition('* => *', [
        style({ opacity: .3, transform: 'translateY(-100%)' }),
        animate(1000, style({ transform: 'translateY(0%)' })),
        animate(2000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private account: string;
  private subscriptionAccount: Subscription;

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
