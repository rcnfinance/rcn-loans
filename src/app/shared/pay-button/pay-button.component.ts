import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
// App Services
import { environment } from '../../../environments/environment';
import { TxService, Tx, Type } from '../../tx.service';
import { ContractsService } from '../../services/contracts.service';
import { Loan, Network } from '../../models/loan.model';
import { Currency } from '../../utils/currencies';
import { EventsService, Category } from '../../services/events.service';
import { Web3Service } from '../../services/web3.service';
import { CountriesService } from '../../services/countries.service';
import { DialogLoanPayComponent } from '../../dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogInsufficientfundsComponent } from '../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogWrongCountryComponent } from '../../dialogs/dialog-wrong-country/dialog-wrong-country.component';

@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.scss']
})
export class PayButtonComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @Input() isOngoing: boolean;
  @Input() amount: number;
  @Input() showPayDialog: boolean;
  @Input() disabled: boolean;
  @Output() startPay = new EventEmitter();
  @Output() endPay = new EventEmitter();

  pendingTx: Tx = undefined;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  opPending = false;
  lendEnabled: Boolean;

  txSubscription: boolean;

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private eventsService: EventsService,
    private web3Service: Web3Service,
    public snackBar: MatSnackBar,
    private countriesService: CountriesService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.retrievePendingTx();

    const lendEnabled = await this.countriesService.lendEnabled();
    this.lendEnabled = lendEnabled;
  }

  ngOnDestroy() {
    if (this.txSubscription && this.showPayDialog) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackPayTx(tx));
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingPay(this.loan);

    if (this.pendingTx) {
      this.startPay.emit();
    }

    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackPayTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackPayTx(tx: Tx) {
    if (tx.type === Type.pay && tx.data.id === this.loan.id) {
      this.endPay.emit();
    }
  }

  /**
   * Handle click on pay button
   */
  async clickPay() {
    // country validation
    if (!this.lendEnabled) {
      this.dialog.open(DialogWrongCountryComponent);
      return;
    }
    // disabled button validation
    if (this.disabled) {
      return;
    }
    // pending tx validation
    if (this.pendingTx) {
      if (this.pendingTx.confirmed) {
        window.open(environment.network.explorer.tx.replace(
          '${tx}',
          this.pendingTx.tx
        ), '_blank');
      }
      return;
    }
    // unlogged user
    if (!this.web3Service.loggedIn) {
      const hasClient = await this.web3Service.requestLogin();
      if (this.web3Service.loggedIn) {
        this.handlePay();
        return;
      }
      if (!hasClient) {
        this.dialog.open(DialogClientAccountComponent);
      }
      return;
    }
    // debt validation
    if (!this.loan.debt) {
      this.openSnackBar('The loan was not yet lended', '');
      return;
    }
    // borrower validation
    const account: string = await this.web3Service.getAccount();
    if (this.loan.debt.owner.toLowerCase() === account.toLowerCase()) {
      this.openSnackBar('The sender cannot be the same as the lender', '');
      return;
    }

    if (this.showPayDialog) {
      const dialogRef = this.dialog.open(DialogLoanPayComponent, {
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
      'click-pay',
      Category.Loan,
      'loan #' + this.loan.id
    );
    this.handlePay();
  }

  /**
   * If the validations were successful, manage the payment transaction
   * @param forze TODO - Force payment
   */
  async handlePay(forze = false) {
    if (this.opPending && !forze) {
      return;
    }

    this.startOperation();

    try {
      const balance = await this.contractsService.getUserBalanceRCNWei();
      let amount = this.amount;

      if (amount) {
        const currency = this.loan.oracle.currency;
        amount = amount * 10 ** Currency.getDecimals(currency);

        // balance validation
        const requiredTokens = await this.contractsService.estimatePayAmount(this.loan, amount);
        if (balance < requiredTokens) {
          this.eventsService.trackEvent(
            'show-insufficient-funds-lend',
            Category.Account,
            'loan #' + this.loan.id,
            requiredTokens
          );
          this.showInsufficientFundsDialog(requiredTokens, balance, currency);
          return;
        }

        // approve validation
        let engineApproved: boolean;

        switch (this.loan.network) {
          case Network.Basalt:
            engineApproved = await this.contractsService.isApproved(this.loan.address);
            break;
          case Network.Diaspore:
            const debtEngineAddress = environment.contracts.diaspore.debtEngine;
            engineApproved = await this.contractsService.isApproved(debtEngineAddress);
            break;
          default:
            this.cancelOperation();
            return;
        }

        if (!engineApproved) {
          await this.showApproveDialog();
          return;
        }

        // track event and pay loan
        this.eventsService.trackEvent(
          'set-to-pay-loan',
          Category.Loan,
          'loan #' + this.loan.id + ' of ' + amount
        );

        const tx = await this.contractsService.payLoan(this.loan, amount);

        this.eventsService.trackEvent(
          'pay-loan',
          Category.Loan,
          'loan #' + this.loan.id + ' of ' + amount
        );

        let engine: string;

        switch (this.loan.network) {
          case Network.Basalt:
            engine = environment.contracts.basaltEngine;
            break;

          case Network.Diaspore:
            engine = environment.contracts.diaspore.debtEngine;
            break;

          default:
            break;
        }

        this.txService.registerPayTx(
          tx,
          engine,
          this.loan,
          amount
        );

        this.startPay.emit();
        this.retrievePendingTx();
      }
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.dialog.open(DialogGenericErrorComponent, {
          data: { error: e }
        });
      }
      console.error(e);
    } finally {
      this.finishOperation();
    }
  }

  /**
   * Show insufficient funds dialog
   * @param required Required amount
   * @param balance Balance amount
   * @param currency Pay currency
   */
  showInsufficientFundsDialog(required: number, balance: number, currency: string) {
    this.dialog.open(DialogInsufficientfundsComponent, { data: {
      required,
      balance,
      currency
    }});
    this.cancelOperation();
  }

  /**
   * Show approve contract dialog
   */
  async showApproveDialog() {
    const onlyToken: string = environment.contracts.rcnToken;
    let onlyAddress: string;

    switch (this.loan.network) {
      case Network.Basalt:
        onlyAddress = this.loan.address;
        break;
      case Network.Diaspore:
        const debtEngineAddress = environment.contracts.diaspore.debtEngine;
        onlyAddress = debtEngineAddress;
        break;
      default:
        this.cancelOperation();
        break;
    }

    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          onlyToken,
          onlyAddress
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handlePay(true);
      } else {
        this.cancelOperation();
      }
    });
  }

  /**
   * Start lend operation
   */
  startOperation() {
    console.info('Started pay');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPending = true;
  }

  /**
   * Cancel pay operation
   */
  cancelOperation() {
    this.openSnackBar('Your transaction has failed', '');
    this.opPending = false;
  }

  /**
   * Finish current lending operation
   */
  finishOperation() {
    console.info('Pay finished');
    this.opPending = false;
  }

  /**
   * Opens a snackbar with a message and an optional action
   * @param message The message to show in the snackbar
   * @param action The label for the snackbar action
   */
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }

  /**
   * Pay button text
   * @return Button text
   */
  get buttonText(): string {
    const tx = this.pendingTx;
    if (tx === undefined) {
      return 'Pay';
    }
    if (tx.confirmed) {
      return 'Payed';
    }
    return 'Paying...';
  }

}
