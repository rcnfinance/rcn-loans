import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WalletType } from './../../interfaces/wallet.interface';

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
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.wallets = [
      {
        image: 'assets/logo-metamask.svg',
        title: 'Metamask',
        type: WalletType.Metamask,
        active: true
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

  selectWallet(wallet: WalletType) {
    this.dialogRef.close(wallet);
  }

}
