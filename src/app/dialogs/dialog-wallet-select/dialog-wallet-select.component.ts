import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WalletType } from './../../interfaces/wallet.interface';
// App services
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
    active: boolean;
  }[];

  constructor(
    private dialogRef: MatDialogRef<DialogWalletSelectComponent>,
    public dialog: MatDialog,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.wallets = [
      {
        image: 'assets/logo-metamask.svg',
        title: 'Metamask',
        type: WalletType.Metamask,
        active: false
      },
      {
        image: 'assets/logo-coinbase.png',
        title: 'Coinbase Wallet',
        type: WalletType.WalletLink,
        active: false
      },
      {
        image: 'assets/logo-walletconnect.svg',
        title: 'WalletConnect',
        type: WalletType.WalletConnect,
        active: false
      }
    ];
  }

  /**
   * Request login with the selected wallet
   * @param wallet Selected wallet
   */
  async selectWallet(wallet: WalletType) {
    const loggedIn = await this.web3Service.requestLogin(wallet);
    this.dialogRef.close(loggedIn);
  }

}
