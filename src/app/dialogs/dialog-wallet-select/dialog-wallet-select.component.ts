import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timer } from 'rxjs';
import {
  WalletType,
  WalletConnection,
  WalletLogo
} from './../../interfaces/wallet.interface';
// App services
import { WalletConnectService } from './../../services/wallet-connect.service';
import { ChainService } from './../../services/chain.service';
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
  loggedIn: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { walletType: WalletType },
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogWalletSelectComponent>,
    private walletConnectService: WalletConnectService,
    private chainService: ChainService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    const wallets = [
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

    const { wallets: availableWallets } = this.chainService;
    const filteredWallets = wallets.filter(({ type }) => {
      if (availableWallets.includes(type)) {
        return true;
      }
    });
    this.wallets = filteredWallets;

    this.loadActiveWallet();
    this.handleLoginEvents();

    const { data } = this;
    if (data && data.walletType) {
      this.selectWallet(data.walletType, false);
    }
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
      await timer(300).toPromise();
      this.dialogRef.close(loggedIn);
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
    this.loggedIn = loggedIn;

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
