import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Subscription, timer } from 'rxjs';
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
import { Currency } from './../../utils/currencies';
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
  }: {
    loan: Loan,
    form: LoanRequest
  }) {
    const pendingTx: Tx = this.createPendingTx;
    this.loan = loan;

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
  detectUpdateCollateralRequest({
    form,
    collateral
  }: {
    form: CollateralRequest,
    collateral: Collateral
  }) {
    this.collateralRequest = form;
    this.collateral = collateral;
    this.loan.collateral = collateral;
  }

  /**
   * Create collateral
   */
  async detectCreateCollateral() {
    const loanTx: Tx = this.createPendingTx;
    const collateralTx: Tx = this.collateralPendingTx;
    const loan: Loan = this.loan;
    const collateral: Collateral = this.collateral;
    const form: CollateralRequest = this.collateralRequest;

    if (loanTx && !loanTx.confirmed) {
      this.showMessage('Please wait until your loan requesting transaction is completed to supply your collateral.', 'snackbar');
      return;
    }
    if (collateralTx) {
      if (collateralTx.confirmed) {
        this.router.navigate(['/', 'loan', loan.id]);
        return;
      }
      this.showMessage('Please wait until your collateral supplying transaction is completed.', 'snackbar');
      return;
    }
    // unlogged user
    if (!this.web3Service.loggedIn) {
      await this.walletConnectService.connect();
    }
    // check collateral asset balance
    const balance: BN = await this.contractsService.getUserBalanceInToken(collateral.token);
    const required: BN = Utils.bn(form.amount);

    if (required.gte(balance)) {
      const currency: CurrencyItem = this.currenciesService.getCurrencyByKey(
        'address',
        collateral.token
      );
      const decimals = Currency.getDecimals(currency.symbol);
      return this.showInsufficientFundsDialog(required, balance, currency.symbol, decimals);
    }

    // validate ERC20 approve
    const contractAddress: string = environment.contracts.collateral.collateral;
    const engineApproved = await this.contractsService.isApproved(contractAddress, collateral.token);
    if (!await engineApproved) {
      const approve = await this.showApproveDialog(contractAddress, collateral.token, 'onlyToken');
      if (!approve) {
        this.showMessage('You need to approve the collateral contract to continue.', 'snackbar');
        return;
      }
    }

    // validate ERC721 approve
    const { ethAddress } = environment.contracts.converter;
    if (collateral.token === ethAddress) {
      const collateralAddress = environment.contracts.collateral.collateral;
      const operator = environment.contracts.collateral.wethManager;
      const erc721approved = await this.contractsService.isApprovedERC721(
        collateralAddress,
        operator
      );
      if (!erc721approved) {
        const approve = await this.showApproveDialog(operator, collateralAddress, 'onlyAsset');
        if (!approve) {
          this.showMessage('You need to approve the collateral WETH manager to continue.', 'snackbar');
          return;
        }
      }
    }

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
    try {
      const engine: string = environment.contracts.diaspore.loanManager;
      const tx: string = await this.contractsService.requestLoan(
        form.amount,
        form.model,
        form.oracle,
        form.account,
        form.callback,
        form.salt,
        form.expiration,
        form.encodedData
      );

      const { id, amount } = loan;
      this.txService.registerCreateTx(tx, { engine, id, amount });
      this.location.replaceState(`/create/${ id }`);
      this.retrievePendingTx();
      this.loanWasCreated = true;
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.showMessage('A problem occurred during loan creation', 'snackbar');
        throw Error(e);
      }
    }
  }

  /**
   * If the validations were successful, manage the collateral creation
   * @param form Collateral request form data
   */
  private async handleCreateCollateral(form: CollateralRequest) {
    const account = await this.web3Service.getAccount();

    try {
      const tx: string = await this.contractsService.createCollateral(
        form.debtId,
        form.oracle,
        form.amount,
        form.liquidationRatio,
        form.balanceRatio,
        account
      );
      this.txService.registerCreateCollateralTx(tx, this.loan);
      this.retrievePendingTx();
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.showMessage('A problem occurred during collateral creation', 'snackbar');
        throw Error(e);
      }
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
      this.showMessage(
        'Your loan request has been created. Please supply your collateral to continue the process.',
        'snackbar'
      );
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
  private async finishCollateralCreation() {
    const loan: Loan = this.loan;
    this.finishProgress = true;
    this.loanWasCreated = true;
    this.showMessage(`Congratulations! You've successfully requested a loan.`, 'snackbar');

    this.spinner.show();

    const TIME_MS = 8000;
    await timer(TIME_MS).toPromise();

    this.spinner.hide();
    this.router.navigate(['/', 'loan', loan.id]);
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
   * @param type ERC20 or ERC721
   */
  private async showApproveDialog(
    contract: string,
    token: string,
    type: 'onlyToken' | 'onlyAsset'
  ) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          [type]: token,
          onlyAddress: contract
        }
      }
    );

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
   * @param requiredInWei Amount required
   * @param balanceInWei Actual user balance in selected currency
   * @param currency Currency symbol
   * @param decimals Currency decimals
   */
  private async showInsufficientFundsDialog(
    requiredInWei: BN,
    balanceInWei: BN,
    currency: string,
    decimals: number
  ) {
    const required = requiredInWei.toString() as any / 10 ** decimals;
    const balance = balanceInWei.toString() as any / 10 ** decimals;

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
