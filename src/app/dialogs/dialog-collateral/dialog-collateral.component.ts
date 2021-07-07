import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription, timer } from 'rxjs';
import * as BN from 'bn.js';
import { Type } from 'app/interfaces/tx';
import { Loan } from 'app/models/loan.model';
import { Collateral } from 'app/models/collateral.model';
import { Tx } from 'app/models/tx.model';
import { Utils } from 'app/utils/utils';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { TxService } from 'app/services/tx.service';
import { Web3Service } from 'app/services/web3.service';
import { ContractsService } from 'app/services/contracts.service';
import { ChainService } from 'app/services/chain.service';

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

  form: FormGroup;
  account: string;
  startProgress: boolean;
  finishProgress: boolean;

  // subscriptions
  subscriptionAccount: Subscription;
  private addTx: Tx;
  private addTxSubscription: Subscription;
  private withdrawTx: Tx;
  private withdrawTxSubscription: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private contractsService: ContractsService,
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
    const { subscriptionAccount, addTx, addTxSubscription, withdrawTx, withdrawTxSubscription } = this;
    if (addTxSubscription && addTx) {
      this.addTxSubscription.unsubscribe();
      this.txService.untrackTx(addTx.hash);
    }
    if (withdrawTxSubscription && withdrawTx) {
      this.withdrawTxSubscription.unsubscribe();
      this.txService.untrackTx(withdrawTx.hash);
    }
    if (subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
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
   * Add collateral amount
   * @param amount Amount to add in wei
   */
  async addCollateral(amount: BN) {
    // validate approve
    const { engine } = this.loan;
    const token = this.collateral.token.toLowerCase();
    const { config } = this.chainService;
    const contract = config.contracts[engine].collateral.collateral;
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
    const { config } = this.chainService;

    if (token === config.contracts.chainCurrencyAddress) {
      const collateral = config.contracts[engine].collateral.collateral;
      const operator = config.contracts[engine].collateral.wethManager;
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
    const hash: string = await this.contractsService.addCollateral(
      engine,
      id,
      token,
      amount.toString(),
      this.account
    );
    await this.registerTx(hash, Type.addCollateral, amount);

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
    const hash: string = await this.contractsService.withdrawCollateral(
      engine,
      id,
      token,
      this.account,
      amount.toString(),
      oracleData,
      this.account
    );
    await this.registerTx(hash, Type.withdrawCollateral, amount);

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
   * Register add/withdraw TX
   * @param hash TX hash
   * @param type TX type
   * @param amount New collateral amount
   */
  private async registerTx(hash: string, type: Type, amount: any) {
    const { collateral, loan } = this;
    const { engine } = loan;
    const { config } = this.chainService;
    const isChainCurrency = collateral.token === config.contracts.chainCurrencyAddress;
    const to: string = isChainCurrency ?
      config.contracts[engine].collateral.wethManager :
      config.contracts[engine].collateral.collateral;
    const tx = await this.txService.buildTx(hash, engine, to, type, { collateralId: collateral.id, amount });
    this.txService.addTx(tx);
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    const { id } = this.collateral;
    this.addTx = this.txService.getLastTxByType(Type.addCollateral, 'collateralId', id);
    this.withdrawTx = this.txService.getLastTxByType(Type.withdrawCollateral, 'collateralId', id);

    if (this.addTx) {
      this.trackAddTx();
    }
    if (this.withdrawTx) {
      this.trackWithdrawTx();
    }
  }

  /**
   * Track collateral add TX
   */
  private trackAddTx() {
    if (this.addTxSubscription) {
      this.addTxSubscription.unsubscribe();
    }

    const { hash } = this.addTx;
    this.addTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.endCollateral();
        this.addTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.addTxSubscription.unsubscribe();
      }
    });
  }

  /**
   * Track collateral withdraw TX
   */
  private trackWithdrawTx() {
    if (this.withdrawTxSubscription) {
      this.withdrawTxSubscription.unsubscribe();
    }

    const { hash } = this.withdrawTx;
    this.withdrawTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.endCollateral();
        this.addTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.addTxSubscription.unsubscribe();
      }
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

  /**
   * Get collateral TX
   * @return TX
   */
  get addPendingTx() {
    return this.addTx;
  }

  /**
   * Get collateral TX
   * @return TX
   */
  get withdrawPendingTx() {
    return this.withdrawTx;
  }
}
