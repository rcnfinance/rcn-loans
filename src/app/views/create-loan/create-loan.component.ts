import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Subscription } from 'rxjs';
import { Loan } from './../../models/loan.model';
import { Collateral } from './../../models/collateral.model';
import { CollateralRequest } from './../../interfaces/collateral-request';
import { LoanRequest } from './../../interfaces/loan-request';
import { environment } from './../../../environments/environment';
// App Components
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogInsufficientfundsComponent } from '../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
// App Services
import { Web3Service } from '../../services/web3.service';
import { WalletConnectService } from './../../services/wallet-connect.service';
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from '../../services/currencies.service';
import { TxService, Tx, Type } from './../../services/tx.service';
import { Utils } from './../../utils/utils';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit, OnDestroy {

  loan: Loan;
  loanWasCreated: boolean;
  createPendingTx: Tx = undefined;
  collateral: Collateral;
  collateralRequest: CollateralRequest;
  collateralWasCreated: boolean;
  collateralPendingTx: Tx = undefined;
  account: string;

  // progress bar
  startProgress: boolean;
  finishProgress: boolean;
  cancelProgress: boolean;

  // subscriptions
  txSubscription: boolean;
  subscriptionAccount: Subscription;

  constructor(
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private walletConnectService: WalletConnectService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private txService: TxService
  ) { }

  async ngOnInit() {
    this.titleService.changeTitle('Borrow');
    this.handleLoginEvents();
    await this.loadAccount();
  }

  ngOnDestroy() {
    try {
      this.subscriptionAccount.unsubscribe();
    } catch (e) { }
  }

  /**
   * Update loan
   * @param loan Loan model
   */
  detectUpdateLoan(loan: Loan) {
    this.loan = loan;
  }

  /**
   * Detect loan was created
   * @param loan Loan model
   */
  detectLoanWasCreated() {
    this.finishLoanCreation();
  }

  /**
   * Create loan
   * @param loan Loan model
   * @param form Create loan form data
   */
  async detectCreateLoan({
    loan,
    form
  }) {
    const pendingTx: Tx = this.createPendingTx;
    this.loan = loan as Loan;

    if (pendingTx && pendingTx.confirmed) {
      return await this.router.navigate(['/', 'loan', loan.id]);
    }

    // unlogged user
    if (!this.web3Service.loggedIn) {
      await this.walletConnectService.connect();
    }

    this.handleCreateLoan(loan, form);
  }

  /**
   * Detect update collateral request
   * @param form Collateral form data
   */
  detectUpdateCollateralRequest(form: CollateralRequest) {
    const loan: Loan = this.loan;
    this.collateralRequest = form;
    this.collateral = new Collateral(
      null,
      loan.id,
      form.oracle,
      form.collateralToken,
      form.collateralAmount,
      form.liquidationRatio,
      form.balanceRatio,
      form.burnFee,
      form.rewardFee
    );
  }

  /**
   * Create collateral
   */
  async detectCreateCollateral() {
    const loanTx: Tx = this.createPendingTx;
    const collateralTx: Tx = this.collateralPendingTx;
    const loan: Loan = this.loan;
    const form: CollateralRequest = this.collateralRequest;

    if (loanTx && !loanTx.confirmed) {
      this.showMessage('Please wait for your loan to finish being created.', 'snackbar');
      return;
    }
    if (collateralTx) {
      if (collateralTx.confirmed) {
        this.router.navigate(['/', 'loan', loan.id]);
        return;
      }
      this.showMessage('Wait for the collateral to be created.', 'snackbar');
      return;
    }
    // unlogged user
    if (!this.web3Service.loggedIn) {
      await this.walletConnectService.connect();
    }
    // check collateral asset balance
    const balance = await this.contractsService.getUserBalanceInToken(form.collateralToken);
    const required = form.collateralAmount;
    if (Utils.bn(balance) < Utils.bn(required)) {
      const currency: CurrencyItem = this.currenciesService.getCurrencyByKey(
        'address',
        form.collateralToken
      );
      this.showInsufficientFundsDialog(Utils.bn(required), Number(balance), currency.symbol);
      return;
    }
    // validate approve
    const contractAddress: string = environment.contracts.collateral.collateral;
    const engineApproved = await this.contractsService.isApproved(contractAddress, form.collateralToken);
    if (!await engineApproved) {
      const approve = await this.showApproveDialog(contractAddress, form.collateralToken);
      if (!approve) {
        this.showMessage('You need to approve the collateral contract to continue.', 'snackbar');
        return;
      }
    }
    // TODO: collateralAsset === eth => approve for all ERC721

    this.showMessage('Please confirm the metamask transaction. Your Collateral is being processed.', 'snackbar');
    this.handleCreateCollateral(form);
  }

  /**
   * If the validations were successful, manage the loan creation
   * @param loan Loan model
   * @param form Create loan form data
   */
  private async handleCreateLoan(
    loan: Loan,
    form: LoanRequest
  ) {
    const web3: any = this.web3Service.web3;
    const account = web3.utils.toChecksumAddress(await this.web3Service.getAccount());

    try {
      const id: string = loan.id;
      const amount: number = loan.amount;
      const engine: string = environment.contracts.diaspore.loanManager;
      const tx: string = await this.contractsService.requestLoan(
        form.amount,
        form.model,
        form.oracle,
        account,
        form.callback,
        form.salt,
        form.expiration,
        form.encodedData
      );

      this.location.replaceState(`/create/${ id }`);
      this.txService.registerCreateTx(tx, {
        engine,
        id,
        amount
      });
      this.retrievePendingTx();
      this.loanWasCreated = true;
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        return this.showMessage('A problem occurred during loan creation', 'snackbar');
      }
      console.info('err creating loan', e);
      throw Error(e);
    }
  }

  /**
   * If the validations were successful, manage the collateral creation
   * @param form Collateral request form data
   */
  private async handleCreateCollateral(form: CollateralRequest) {
    const web3: any = this.web3Service.web3;
    const account = web3.utils.toChecksumAddress(await this.web3Service.getAccount());

    try {
      const tx: string = await this.contractsService.createCollateral(
        form.loanId,
        form.oracle,
        form.collateralToken,
        form.collateralAmount,
        form.liquidationRatio,
        form.balanceRatio,
        form.burnFee,
        form.rewardFee,
        account
      );
      this.txService.registerCreateCollateralTx(tx, this.loan);
      this.retrievePendingTx();
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        return this.showMessage('A problem occurred during collateral creation', 'snackbar');
      }
      throw Error(e);
    }
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    this.createPendingTx = this.txService.getLastPendingCreate(this.loan);
    this.collateralPendingTx = this.txService.getLastPendingCreateCollateral(this.loan);
    const loanId: string = this.loan.id;

    if (this.createPendingTx !== undefined) {
      this.location.replaceState(`/create/${ loanId }`);
      this.startProgress = true;
      this.trackProgressbar();
      return;
    }
    if (this.collateralPendingTx !== undefined) {
      this.startProgress = true;
      this.trackProgressbar();
    }
  }

  /**
   * Track progressbar value
   */
  private trackProgressbar() {
    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => {
        if (tx.type === Type.create && tx.tx === this.createPendingTx.tx) {
          this.finishLoanCreation();
          return;
        }
        if (tx.type === Type.createCollateral && tx.tx === this.collateralPendingTx.tx) {
          this.finishCollateralCreation();
          return;
        }
      });
    }
  }

  /**
   * Finish loan creation and check status
   */
  private async finishLoanCreation() {
    const loanWasCreated = await this.contractsService.loanWasCreated(this.loan.id);

    if (loanWasCreated) {
      this.finishProgress = true;
      this.loanWasCreated = true;
      this.startProgress = false;
    } else {
      this.cancelProgress = true;
      this.loanWasCreated = false;
      setTimeout(() => {
        this.showMessage('The loan could not be created', 'dialog');
        this.startProgress = false;
        this.createPendingTx = undefined;
      }, 1000);
    }
  }

  /**
   * Finish collateral creation and redirect to the loan detail
   */
  private finishCollateralCreation() {
    const loan: Loan = this.loan;
    this.finishProgress = true;
    this.loanWasCreated = true;
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
      this.router.navigate(['/', 'loan', loan.id]);
    }, 3000);
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const web3: any = this.web3Service.web3;
    const account: string = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);
  }

  /**
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   */
  private async showApproveDialog(contract: string, token: string = environment.contracts.rcnToken) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.onlyAddress = contract;
    dialogRef.componentInstance.onlyToken = token;
    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Show insufficient funds dialog
   * @param required Amount required
   * @param balance Actual user balance in selected currency
   * @param currency Currency symbol
   */
  private showInsufficientFundsDialog(required: BN | string, balance: number, currency: string) {
    this.dialog.open(DialogInsufficientfundsComponent, {
      data: {
        required,
        balance,
        currency
      }
    });
  }

  /**
   * Show dialog or snackbar with a message
   * @param message The message to show in the snackbar
   * @param type UI Format: dialog or snackbar
   */
  private showMessage(message: string, type: 'dialog' | 'snackbar') {
    switch (type) {
      case 'dialog':
        const error: Error = {
          name: 'Error',
          message: message
        };
        this.dialog.open(DialogGenericErrorComponent, {
          data: {
            error
          }
        });
        break;

      case 'snackbar':
        this.snackBar.open(message , null, {
          duration: 4000,
          horizontalPosition: 'center'
        });
        break;

      default:
        console.error(message);
        break;
    }
  }

}
