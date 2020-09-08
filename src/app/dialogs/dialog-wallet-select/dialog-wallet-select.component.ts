import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { timer } from 'rxjs';
import {
  WalletType,
  WalletConnection,
  WalletLogo
} from './../../interfaces/wallet.interface';
// App services
import { WalletConnectService } from './../../services/wallet-connect.service';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-dialog-wallet-select',
  templateUrl: './dialog-wallet-select.component.html',
  styleUrls: ['./dialog-wallet-select.component.scss']
})
export class DialogWalletSelectComponent implements OnInit {
  wallets: {
    image: string;
    title: string;
    type: WalletType;
    active?: boolean;
  }[];

  constructor(
    private dialogRef: MatDialogRef<DialogWalletSelectComponent>,
    public dialog: MatDialog,
    private walletConnectService: WalletConnectService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.wallets = [
      {
        image: WalletLogo[WalletType.Metamask],
        title: 'MetaMask',
        type: WalletType.Metamask
      },
      {
        image: WalletLogo[WalletType.WalletLink],
        title: 'Coinbase Wallet',
        type: WalletType.WalletLink
      },
      {
        image: WalletLogo[WalletType.WalletConnect],
        title: 'WalletConnect',
        type: WalletType.WalletConnect
      }
    ];

    this.loadActiveWallet();
    this.handleLoginEvents();
  }

  /**
   * Request login with the selected wallet
   * @param wallet Selected wallet
   * @param connected Currently connected
   */
  async selectWallet(wallet: WalletType, connected: boolean) {
    if (connected) {
      return;
    }

    const loggedIn = await this.web3Service.requestLogin(wallet, true);
    if (loggedIn) {
      timer(300).subscribe(() => this.dialogRef.close(loggedIn));
    }
  }

  /**
   * Logout
   */
  async clickLogout() {
    await this.web3Service.logout();
    this.loadActiveWallet();
    this.walletConnectService.disconnect();
    this.dialogRef.close();
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.web3Service.loginEvent.subscribe(() => this.loadActiveWallet());
  }

  /**
   * Load active wallet
   */
  private loadActiveWallet() {
    const loggedIn = this.web3Service.loggedIn;
    if (!loggedIn) {
      return this.setWalletConnected();
    }

    const walletConnected: WalletConnection = this.walletConnectService.walletConnected;
    if (!walletConnected) {
      return this.setWalletConnected();
    }

    const { wallet }: WalletConnection = walletConnected;
    this.setWalletConnected(wallet);
  }

  /**
   * Set wallet connected
   * @param wallet Wallet type
   */
  private setWalletConnected(walletType?: WalletType) {
    this.wallets.map((item) => {
      item.active = walletType === item.type || false;
    });
  }
}
