import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
import { Utils } from '../../utils/utils';
import { environment } from './../../../environments/environment';
// App components
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
// App services
import { Web3Service } from './../../services/web3.service';
import { ContractsService } from './../../services/contracts.service';
import { CollateralService } from './../../services/collateral.service';
import { TxService, Tx } from './../../services/tx.service';

@Component({
  selector: 'app-dialog-collateral',
  templateUrl: './dialog-collateral.component.html',
  styleUrls: ['./dialog-collateral.component.scss']
})
export class DialogCollateralComponent implements OnInit, OnDestroy {

  loan: Loan;
  collateral: Collateral;
  action: string;
  addPendingTx: Tx;
  withdrawPendingTx: Tx;

  form: FormGroup;
  account: string;
  shortAccount: string;
  startProgress: boolean;
  finishProgress: boolean;

  // subscriptions
  txSubscription: boolean;
  subscriptionAccount: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private txService: TxService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.loan = this.data.loan;
    this.collateral = this.data.collateral;
    this.action = data.action;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
    this.buildForm();

    this.loadAccount();
    this.handleLoginEvents();
    this.retrievePendingTx();
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      try {
        this.subscriptionAccount.unsubscribe();
      } catch (e) { }
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  /**
   * Build form controls
   */
  buildForm() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.required
      ])
    });
  }

  /**
   * Set account address
   */
  async loadAccount() {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();

    this.account = web3.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.addPendingTx = this.txService.getLastPendingAddCollateral(this.collateral);
    this.withdrawPendingTx = this.txService.getLastPendingWithdrawCollateral(this.collateral);
  }

  /**
   * Add collateral amount
   * @param amount Amount to add
   */
  async addCollateral(amount: number) {
    // validate approve
    const token = this.collateral.token;
    const contract = environment.contracts.collateral.collateral;
    const engineApproved = await this.contractsService.isApproved(contract, token);

    if (!await engineApproved) {
      const approve = await this.showApproveDialog(contract, token);
      if (!approve) {
        this.showMessage('You need to approve the collateral contract to continue.');
        return;
      }
    }

    this.handleAdd(amount);
  }

  /**
   * Withdraw collateral amount
   * @param amount Amount to withdraw
   */
  async withdrawCollateral(amount: number) {
    const token: string = this.collateral.token;

    if (token === environment.contracts.converter.ethAddress) {
      // TODO: approve entry
    }

    this.handleWithdraw(amount);
  }

  /**
   * If the validations were successful, manage the deposit transaction
   * @param amount Amount to add
   */
  async handleAdd(amount: number) {
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
   * If the validations were successful, manage the withdraw transaction
   * @param amount Amount to withdraw
   */
  async handleWithdraw(amount: number) {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const oracleData = await this.contractsService.getOracleData(loan.oracle);

    const tx: string = await this.contractsService.withdrawCollateral(
      this.collateral.id,
      this.collateral.token,
      this.account,
      web3.toWei(amount),
      oracleData,
      this.account
    );

    this.txService.registerWithdrawCollateralTx(tx, this.loan, this.collateral, web3.toWei(amount));
    this.showProgressbar();
  }

  /**
   * Method called when the transaction was completed
   */
  endAdd() {
    this.finishProgress = true;
    this.cdRef.detectChanges();
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
   * Hide progressbar and close dialog
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
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   * @return Promise<boolean>
   */
  async showApproveDialog(contract: string, token: string) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          onlyToken: token,
          onlyAddress: contract
        }
      }
    );

    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        }

        resolve();
      });
    });
  }

  /**
   * Show snackbar with a message
   * @param message The message to show in the snackbar
   */
  private showMessage(message: string) {
    this.snackBar.open(message , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }
}
