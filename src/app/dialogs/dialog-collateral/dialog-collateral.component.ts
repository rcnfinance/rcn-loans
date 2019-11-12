import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
import { Utils } from '../../utils/utils';
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
    // TODO: withdraw pending tx
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

}
