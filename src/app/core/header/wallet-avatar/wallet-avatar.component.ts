import { Component, OnInit, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { WalletLogo, WalletConnection } from './../../../interfaces/wallet.interface';
// App Component
import { DialogWalletSelectComponent } from './../../../dialogs/dialog-wallet-select/dialog-wallet-select.component';
// App services
import { Web3Service } from './../../../services/web3.service';

@Component({
  selector: 'app-wallet-avatar',
  templateUrl: './wallet-avatar.component.html',
  styleUrls: ['./wallet-avatar.component.scss']
})
export class WalletAvatarComponent implements OnInit, OnChanges {

  logo: string;

  constructor(
    private dialog: MatDialog,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.loadLogo();
    this.handleLoginEvents();
  }

  ngOnChanges(changes) {
    const { walletType } = changes;

    if (walletType && walletType.currentValue) {
      this.loadLogo();
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.web3Service.loginEvent.subscribe(() => this.loadLogo());
  }

  /**
   * Open dialog wallet select
   */
  openWalletSelect() {
    this.dialog.open(DialogWalletSelectComponent, {});
  }

  /**
   * Load the wallet logo url
   * @return Wallet logo
   */
  private loadLogo() {
    const walletConnected: string = window.localStorage.getItem('walletConnected');
    if (!walletConnected) {
      return;
    }

    const { wallet }: WalletConnection = JSON.parse(walletConnected);
    this.logo = WalletLogo[wallet];

    return this.logo;
  }

}
