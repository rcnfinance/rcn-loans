import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
// App services
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { Tx, TxService } from '../../tx.service';

@Component({
  selector: 'app-dialog-collateral',
  templateUrl: './dialog-collateral.component.html',
  styleUrls: ['./dialog-collateral.component.scss']
})
export class DialogCollateralComponent implements OnInit {
  loan: Loan;
  collateral: Collateral;
  action: 'add' | 'withdraw';
  account: string;
  addPendingTx: Tx;
  withdrawPendingTx: Tx;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private txService: TxService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
    this.collateral = data.collateral;
    this.action = data.action;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');

    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
  }

  /**
   * Add collateral amount
   * @param amount Amount to add
   */
  async addCollateral(amount) {
    const web3: any = this.web3Service.web3;

    const tx: string = await this.contractsService.addCollateral(
      this.collateral.id,
      web3.toWei(amount),
      this.account
    );

    this.txService.registerAddCollateralTx(tx, this.loan, this.collateral, web3.toWei(amount));
    this.dialogRef.close(tx);
  }

  /**
   * Withdraw collateral amount
   */
  async withdrawCollateral(amount) {
    const web3: any = this.web3Service.web3;

    const tx: string = await this.contractsService.withdrawCollateral(
      this.collateral.id,
      this.account,
      web3.toWei(amount),
      null,
      this.account
    );

    this.txService.registerWithdrawCollateralTx(tx, this.loan, this.collateral, web3.toWei(amount));
    this.dialogRef.close(tx);
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.addPendingTx = this.txService.getLastPendingAddCollateral(this.collateral);
    this.withdrawPendingTx = this.txService.getLastPendingWithdrawCollateral(this.collateral);
  }
}
