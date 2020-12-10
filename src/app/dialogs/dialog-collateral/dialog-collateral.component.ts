import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription, timer } from 'rxjs';
import * as BN from 'bn.js';
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
  shortLoanId: string;
  collateral: Collateral;
  action: string;
  addPendingTx: Tx;
  withdrawPendingTx: Tx;

  form: FormGroup;
  account: string;
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
    @Inject(MAT_DIALOG_DATA) public data: {
      loan: Loan,
      collateral: Collateral,
      action: string
    }
  ) {
    this.loan = this.data.loan;
    this.collateral = this.data.collateral;
    this.action = data.action;
    this.shortLoanId = Utils.shortAddress(this.loan.id);

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
    if (this.txSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackCollateralTx(tx));
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
    this.account = web3.utils.toChecksumAddress(account);
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.addPendingTx = this.txService.getLastPendingAddCollateral(this.collateral);
    this.withdrawPendingTx = this.txService.getLastPendingWithdrawCollateral(this.collateral);

    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackCollateralTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackCollateralTx(tx: Tx) {
    if (this.collateralService.isCurrentCollateralTx(tx, this.collateral.id)) {
      this.endCollateral();
    }
  }

  /**
   * Add collateral amount
   * @param amount Amount to add in wei
   */
  async addCollateral(amount: BN) {
    // validate approve
    const { engine } = this.loan;
    const token = this.collateral.token.toLowerCase();
    const contract = environment.contracts[engine].collateral.collateral;
    const engineApproved = await this.contractsService.isApproved(contract, token);

    if (!await engineApproved) {
      const approve = await this.showApproveDialog(contract, token, 'onlyToken');
      if (!approve) {
        this.showMessage('You need to approve the collateral contract to continue.');
        return;
      }
    }

    this.handleAdd(amount);
  }

  /**
   * Withdraw collateral amount
   * @param amount Amount to withdraw in wei
   */
  async withdrawCollateral(amount: BN) {
    const token: string = this.collateral.token;
    const { engine } = this.loan;

    if (token === environment.contracts[engine].converter.ethAddress) {
      const collateral = environment.contracts[engine].collateral.collateral;
      const operator = environment.contracts[engine].collateral.wethManager;
      const operatorApproved = await this.contractsService.isApprovedERC721(
        collateral,
        operator
      );
      if (!await operatorApproved) {
        const approve = await this.showApproveDialog(operator, collateral, 'onlyAsset');
        if (!approve) {
          this.showMessage('You need to approve the collateral WETH manager to continue.');
          return;
        }
      }
    }

    this.handleWithdraw(amount);
  }

  /**
   * If the validations were successful, manage the deposit transaction
   * @param amount Amount to add in wei
   */
  async handleAdd(amount: BN) {
    const { engine } = this.loan;
    const { id, token } = this.collateral;
    const tx: string = await this.contractsService.addCollateral(
      engine,
      id,
      token,
      amount.toString(),
      this.account
    );

    this.txService.registerAddCollateralTx(tx, this.loan, this.collateral, amount as any);
    this.showProgressbar();
  }

  /**
   * If the validations were successful, manage the withdraw transaction
   * @param amount Amount to withdraw in wei
   */
  async handleWithdraw(amount: BN) {
    const { engine, oracle } = this.loan;
    const { id, token } = this.collateral;
    const oracleData = await this.contractsService.getOracleData(oracle);
    const tx: string = await this.contractsService.withdrawCollateral(
      engine,
      id,
      token,
      this.account,
      amount.toString(),
      oracleData,
      this.account
    );

    this.txService.registerWithdrawCollateralTx(tx, this.loan, this.collateral, amount.toString() as any);
    this.showProgressbar();
  }

  /**
   * Method called when the transaction was completed
   */
  async endCollateral() {
    this.finishProgress = true;
    this.cdRef.detectChanges();

    await timer(1000).toPromise();
    this.dialogRef.close();
  }

  /**
   * Show loading progress bar
   */
  showProgressbar() {
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
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   * @param type ERC20 or ERC721
   * @return Promise<boolean>
   */
  async showApproveDialog(
    contract: string,
    token: string,
    type: 'onlyToken' | 'onlyAsset'
  ) {
    const { engine } = this.loan;
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          engine,
          [type]: token,
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
