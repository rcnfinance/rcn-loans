import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';
import { environment } from '../../../environments/environment';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
// App services
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { CollateralService } from '../../services/collateral.service';
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

  txSubscription: boolean;
  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
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

    this.retrievePendingTx();
  }

  /**
   * Add collateral amount
   * @param amount Amount to add
   */
  async addCollateral(amount) {
    const web3: any = this.web3Service.web3;

    const tx: string = await this.contractsService.addCollateral(
      this.collateral.id,
      this.collateral.token,
      web3.toWei(amount),
      this.account
    );

    this.txService.registerAddCollateralTx(tx, this.loan, this.collateral, web3.toWei(amount));
    this.showProgressbar();
  }

  /**
   * Withdraw collateral amount
   */
  async withdrawCollateral(amount) {
    const web3: any = this.web3Service.web3;
    const token = this.collateral.token;
    let contract = environment.contracts.diaspore.collateral;

    if (token === environment.contracts.currencies.eth) {
      contract = environment.contracts.diaspore.collateralWethManager;

      // TODO: Show weth approve dialog
    } else {
      const isApproved: boolean = await this.contractsService.isApproved(contract, token);

      if (!isApproved) {
        this.showApproveDialog(contract, token);
        return;
      }
    }

    const tx: string = await this.contractsService.withdrawCollateral(
      this.collateral.id,
      this.collateral.token,
      this.account,
      web3.toWei(amount),
      null,
      this.account
    );

    this.txService.registerWithdrawCollateralTx(tx, this.loan, this.collateral, web3.toWei(amount));
    this.showProgressbar();
  }

  /**
   * Show loading progress bar
   */
  showProgressbar() {
    this.trackProgressbar();
    this.startProgress = true;
    this.retrievePendingTx();
  }

  /**
   * Hide progressbar
   */
  hideProgressbar() {
    this.startProgress = false;
    this.finishProgress = false;
    this.retrievePendingTx();
    this.dialogRef.close();
  }

  /**
   * Track progressbar value
   */
  trackProgressbar() {
    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => {
        if (this.collateralService.isCurrentCollateralTx(tx, this.collateral.id)) {
          this.finishProgress = true;
        }
      });
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.addPendingTx = this.txService.getLastPendingAddCollateral(this.collateral);
    this.withdrawPendingTx = this.txService.getLastPendingWithdrawCollateral(this.collateral);
  }

  /**
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   */
  showApproveDialog(contract: string, token: string) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.onlyAddress = contract;
    dialogRef.componentInstance.onlyToken = token;
  }
}
