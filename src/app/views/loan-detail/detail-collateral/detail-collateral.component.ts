import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
import { environment } from '../../../../environments/environment';
// App Models
import { Utils } from './../../../utils/utils';
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App Services
import { Web3Service } from './../../../services/web3.service';

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  @Input() collateral: Collateral;

  currencies: any = [
    {
      currency: 'RCN',
      address: environment.contracts.rcnToken
    },
    {
      currency: 'MANA',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    },
    {
      currency: 'ETH',
      address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      currency: 'DAI',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    }
  ];

  collateralAmount: string;
  collateralAsset: string;
  liquidationRatio: string;
  balanceRatio: string;

  constructor(
    private dialog: MatDialog,
    private web3Service: Web3Service
  ) { }

  ngOnInit() { }

  ngOnChanges(changes) {
    if (changes.collateral && changes.collateral.currentValue) {
      this.setCollateralPanel();
    }
  }

  /**
   * Set collateral status values
   */
  setCollateralPanel() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    this.collateralAmount = web3.fromWei(collateral.amount);
    this.liquidationRatio = Utils.formatAmount(collateral.liquidationRatio / 100, 0);
    this.balanceRatio = Utils.formatAmount(collateral.balanceRatio / 100, 0);

    const collateralAsset = this.currencies.filter(currency => currency.address.toLowerCase() === collateral.token.toLowerCase());
    if (collateralAsset.length) {
      this.collateralAsset = collateralAsset[0].currency;
    }
  }

  /**
   * Open add more / withdraw collateral dialog
   * @param action Add or Withdraw
   */
  async openDialog(action: string) {
    const dialogConfig: MatDialogConfig = {
      data: {
        loan: this.loan,
        collateral: this.collateral,
        action
      }
    };

    this.dialog.open(DialogCollateralComponent, dialogConfig);
  }
}
