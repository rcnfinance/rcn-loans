import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Subscription, timer } from 'rxjs';
import { Loan } from 'app/models/loan.model';
import { Collateral } from 'app/models/collateral.model';
import { CollateralRequest } from 'app/interfaces/collateral-request';
import { LoanRequest } from 'app/interfaces/loan-request';
import { DialogGenericErrorComponent } from 'app/dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogInsufficientfundsComponent } from 'app/dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { Web3Service } from 'app/services/web3.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';
import { TitleService } from 'app/services/title.service';
import { NavrailService } from 'app/services/navrail.service';
import { ContractsService } from 'app/services/contracts.service';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';
import { TxService, Tx, Type } from 'app/services/tx.service';
import { ChainService } from 'app/services/chain.service';
import { Utils } from 'app/utils/utils';

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
    private chainService: ChainService,
    private navrailService: NavrailService,
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
    const { config } = this.chainService;

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
    const loanWasCreated = await this.contractsService.loanWasCreated(loan.engine, loan.id);
    if (!loanWasCreated) {
      this.showMessage('A problem occurred during loan creation. Please try again.', 'snackbar');
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
      const decimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
      return this.showInsufficientFundsDialog(required, balance, currency.symbol, decimals);
    }

    // validate ERC20 approve
    const contractAddress: string = config.contracts[loan.engine].collateral.collateral;
    const engineApproved = await this.contractsService.isApproved(contractAddress, collateral.token);
    if (!await engineApproved) {
      const approve = await this.showApproveDialog(contractAddress, collateral.token, 'onlyToken');
      if (!approve) {
        this.showMessage('You need to approve the collateral contract to continue.', 'snackbar');
        return;
      }
    }

    // validate ERC721 approve
    const { chainCurrencyAddress } = config.contracts;
    if (collateral.token === chainCurrencyAddress) {
      const collateralAddress = config.contracts[loan.engine].collateral.collateral;
      const operator = config.contracts[loan.engine].collateral.wethManager;
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
      const { config } = this.chainService;
      const engine: string = config.contracts[loan.engine].diaspore.loanManager;
      const tx: string = await this.contractsService.requestLoan(
        loan.engine,
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
      this.location.replaceState(`/borrow/${ id }`);
      this.retrievePendingTx();
      this.loanWasCreated = true;

      await this.navrailService.refreshNavrail();
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
   * @param isEth ETH Collateral
   */
  private async handleCreateCollateral(form: CollateralRequest) {
    const account = await this.web3Service.getAccount();

    try {
      const { engine } = this.loan;
      const tx: string = await this.contractsService.createCollateral(
        engine,
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
      this.location.replaceState(`/borrow/${ loanId }`);
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
    const { id, engine } = this.loan;
    const loanWasCreated = await this.contractsService.loanWasCreated(engine, id);

    if (loanWasCreated) {
      this.finishProgress = true;
      this.loanWasCreated = true;
      this.startProgress = false;
      this.showMessage(
        'Your loan request has been created. Please supply your collateral to continue.',
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

    await this.navrailService.refreshNavrail();
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

    const TIME_MS = 12000;
    await timer(TIME_MS).toPromise();

    this.spinner.hide();
    this.router.navigate(['/', 'loan', loan.id]);

    await this.navrailService.refreshNavrail();
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
    const { engine } = this.loan;
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
