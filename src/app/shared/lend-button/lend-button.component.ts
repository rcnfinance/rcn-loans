import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
import * as BN from 'bn.js';
import { Loan, Status } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';
import { LoanUtils } from 'app/utils/loan-utils';
import { ContractsService } from 'app/services/contracts.service';
import { TxLegacyService, Tx, Type } from 'app/services/tx-legacy.service';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { Web3Service } from 'app/services/web3.service';
import { DialogInsufficientfundsComponent } from 'app/dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { CountriesService } from 'app/services/countries.service';
import { EventsService, Category } from 'app/services/events.service';
import { DialogGenericErrorComponent } from 'app/dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogWrongCountryComponent } from 'app/dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogLoanLendComponent } from 'app/dialogs/dialog-loan-lend/dialog-loan-lend.component';
import { DialogFrontRunningComponent } from 'app/dialogs/dialog-front-running/dialog-front-running.component';
import { ChainService } from 'app/services/chain.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @Input() lendToken: string;
  @Input() showLendDialog: boolean;
  @Input() disabled: boolean;
  @Output() startLend = new EventEmitter();
  @Output() endLend = new EventEmitter();
  @Output() closeDialog = new EventEmitter();
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  startProgress: boolean;
  finishProgress: boolean;

  txSubscription: boolean;

  constructor(
    private contractsService: ContractsService,
    private txService: TxLegacyService,
    private proxyApiService: ProxyApiService,
    private web3Service: Web3Service,
    private countriesService: CountriesService,
    private eventsService: EventsService,
    private chainService: ChainService,
    private currenciesService: CurrenciesService,
    private walletConnectService: WalletConnectService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.retrievePendingTx();

    const lendEnabled = await this.countriesService.lendEnabled();
    this.lendEnabled = lendEnabled;
  }

  ngOnDestroy() {
    if (this.txSubscription && this.showLendDialog) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackLendTx(tx));
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingLend(this.loan);

    if (this.pendingTx) {
      this.startLend.emit();
      this.startProgress = true;
    }

    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackLendTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackLendTx(tx: Tx) {
    if (tx.type === Type.lend && tx.data.id === this.loan.id) {
      this.endLend.emit();
      this.web3Service.updateBalanceEvent.emit();
      this.txSubscription = false;
      this.finishProgress = true;
    }
  }

  /**
   * Handle click on lend button
   */
  async clickLend() {
    const { config } = this.chainService;

    // country validation
    if (!this.lendEnabled) {
      this.dialog.open(DialogWrongCountryComponent);
      return;
    }
    // pending tx validation
    if (this.pendingTx) {
      window.open(config.network.explorer.tx.replace(
        '${tx}',
        this.pendingTx.tx
      ), '_blank');
      return;
    }
    // disabled button validation
    if (this.disabled) {
      return;
    }
    // debt validation
    if (this.loan.debt) {
      this.openSnackBar('The loan has already been lend');
      return;
    }
    // unlogged user
    const loggedIn = await this.walletConnectService.connect();
    if (!loggedIn) {
      return;
    }
    // borrower validation
    const account: string = await this.web3Service.getAccount();
    if (this.loan.borrower.toLowerCase() === account.toLowerCase()) {
      this.openSnackBar('You can´t fund a loan that you have borrowed.');
      return;
    }
    // lend token validation
    const token = this.lendToken;
    if (!this.showLendDialog && !token) {
      this.openSnackBar('You must select an currency to continue');
      return;
    }
    // front running validation

    const { content } = await this.proxyApiService.getLoanById(this.loan.id);
    const { status } = LoanUtils.buildLoan(content, config);
    if (status !== Status.Request) {
      this.closeDialog.emit();
      return this.dialog.open(DialogFrontRunningComponent);
    }

    if (this.showLendDialog) {
      const dialogRef = this.dialog.open(DialogLoanLendComponent, {
        data: {
          loan: this.loan
        }
      });
      dialogRef.afterClosed().subscribe(() => {
        this.retrievePendingTx();
      });
      return;
    }

    this.eventsService.trackEvent(
      'click-lend',
      Category.Loan,
      'request ' + this.loan.id
    );
    this.handleLend();
  }

  /**
   * If the validations were successful, manage the lending transaction
   * @param forze TODO - Force lend
   */
  private async handleLend(forze = false) {
    if (this.opPending && !forze) {
      return;
    }

    this.startOperation();

    try {
      const {
        payableAmount,
        tokenConverter,
        lendToken,
        required,
        cosignerAddress,
        cosignerLimit,
        loanId,
        oracleData,
        cosignerData,
        callbackData,
        account
      } = await this.contractsService.getLendParams(this.loan, this.lendToken);
      const { config } = this.chainService;

      // set value in specified token
      const balance: BN = await this.contractsService.getUserBalanceInToken(lendToken);

      // validate balance amount
      if (balance.lte(Utils.bn(required))) {
        this.eventsService.trackEvent(
          'show-insufficient-funds-lend',
          Category.Account,
          'loan ' + loanId,
          Number(required)
        );
        const currency = config.currencies.usableCurrencies.find(token => token.address === lendToken);
        const decimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
        this.showInsufficientFundsDialog(required, balance, currency.symbol, decimals);
        return;
      }

      const { engine } = this.loan;
      let contractAddress: string;

      // set lend contract
      switch (lendToken) {
        case config.contracts[engine].token:
          contractAddress = this.loan.address;
          break;
        case config.contracts.chainCurrencyAddress:
          contractAddress = config.contracts[engine].converter.converterRamp;
          break;
        default:
          contractAddress = config.contracts[engine].converter.converterRamp;
          break;
      }

      let tx: string;

      // validate approve
      const engineApproved = await this.contractsService.isApproved(contractAddress, lendToken);
      if (!await engineApproved) {
        this.showApproveDialog(contractAddress, this.lendToken);
        return;
      }

      if (lendToken === config.contracts[engine].token) {
        tx = await this.contractsService.lendLoan(
          engine,
          cosignerAddress,
          this.loan.id,
          oracleData,
          cosignerData,
          callbackData,
          account
        );
      } else {
        tx = await this.contractsService.converterRampLend(
          engine,
          payableAmount,
          tokenConverter,
          lendToken,
          String(required),
          cosignerAddress,
          cosignerLimit,
          this.loan.id,
          oracleData,
          cosignerData,
          callbackData,
          account
        );
      }

      this.txService.registerLendTx(tx, config.contracts[engine].diaspore.loanManager, this.loan);

      this.eventsService.trackEvent(
        'lend',
        Category.Account,
        'loan ' + this.loan.id
      );

      this.retrievePendingTx();
    } catch (err) {
      // Don't show 'User denied transaction signature' error
      if (err.stack.indexOf('User denied transaction signature') < 0) {
        this.eventsService.trackError(err);
        this.dialog.open(DialogGenericErrorComponent, {
          data: { error: err }
        });
      }
    } finally {
      this.finishOperation();
    }
  }

  /**
   * Finish current lending operation
   */
  private finishOperation() {
    console.info('Lend finished');
    this.opPending = false;
  }

  /**
   * Start lend operation
   */
  private startOperation() {
    console.info('Started lend');
    this.openSnackBar('Your transaction is being processed. This might take a few second');
    this.opPending = true;
  }

  /**
   * Cancel or fail lend operation
   */
  private cancelOperation() {
    console.info('Cancel lend');
    this.openSnackBar('Hmm, It seems like your transaction has failed. Please try again.');
    this.opPending = false;
  }

  /**
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   */
  private showApproveDialog(
    contract: string,
    token: string = this.chainService.config.contracts[this.loan.engine].token
  ) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.onlyAddress = contract;
    dialogRef.componentInstance.onlyToken = token;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleLend(true);
      } else {
        this.cancelOperation();
      }
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
    requiredInWei: string,
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
    this.cancelOperation();
  }

  /**
   * Opens a snackbar with a message and an optional action
   * @param message The message to show in the snackbar
   * @param action The label for the snackbar action
   */
  private openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }

  get enabled(): Boolean {
    return this.txService.getLastPendingLend(this.loan) === undefined;
  }

  get buttonText(): string {
    const tx = this.pendingTx;
    if (tx === undefined) {
      return 'Lend';
    }
    if (tx.confirmed) {
      return 'Lent';
    }
    return 'Lending';
  }
}
