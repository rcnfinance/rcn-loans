import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { WalletLogo, WalletConnection, WalletType } from 'app/interfaces/wallet.interface';
// App Component
import { DialogWalletSelectComponent } from 'app/dialogs/dialog-wallet-select/dialog-wallet-select.component';
// App services
import { Web3Service } from 'app/services/web3.service';

@Component({
  selector: 'app-wallet-avatar',
  templateUrl: './wallet-avatar.component.html',
  styleUrls: ['./wallet-avatar.component.scss']
})
export class WalletAvatarComponent implements OnInit, OnChanges {
  @Input() size = 25;
  logo: string;
  label: string;

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
    this.dialog.open(DialogWalletSelectComponent, {
      panelClass: 'dialog-selector-wrapper'
    });
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

    let label: string;
    switch (wallet) {
      case WalletType.Metamask:
        label = 'MetaMask';
        break;
      case WalletType.WalletConnect:
        label = 'WalletConnect';
        break;
      case WalletType.WalletLink:
        label = 'WalletLink';
        break;
      default:
        break;
    }
    this.label = label;
  }

}
