import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
  MatSnackBar,
  MatDialog,
  MatSnackBarHorizontalPosition
} from '@angular/material';
// App Service
import { EventsService, Category } from '../../services/events.service';
import { ContractsService } from '../../services/contracts.service';
import { TxService, Tx, Type } from '../../services/tx.service';
// App Component
import { environment } from '../../../environments/environment';
import { Loan } from '../../models/loan.model';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogLoanTransferComponent } from '../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-transfer-button',
  templateUrl: './transfer-button.component.html',
  styleUrls: ['./transfer-button.component.scss']
})
export class TransferButtonComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @Input() address: string;
  @Input() showTransferDialog: boolean;
  @Input() disabled: boolean;
  @Output() startTransfer = new EventEmitter();
  @Output() endTransfer = new EventEmitter();

  pendingTx: Tx = undefined;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  opPending = false;

  txSubscription: boolean;

  constructor(
    private contractService: ContractsService,
    private txService: TxService,
    private eventsService: EventsService,
    private web3Service: Web3Service,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.retrievePendingTx();
  }

  ngOnDestroy() {
    if (this.txSubscription && this.showTransferDialog) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackTransferTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackTransferTx(tx: Tx) {
    // FIXME: review data: { id }
    if (tx.type === Type.transfer) {
      this.endTransfer.emit();
      this.txSubscription = false;
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingTransfer(
      environment.contracts.basaltEngine,
      this.loan
    );

    if (this.pendingTx) {
      this.startTransfer.emit();
    }

    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackTransferTx(tx));
    }
  }

  /**
   * Handle click on transfer button
   */
  async clickTransfer() {
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
      if (!hasClient) {
        this.dialog.open(DialogClientAccountComponent);
        return;
      }
      if (!this.web3Service.loggedIn) {
        return;
      }
    }
    // borrower validation
    const account: string = await this.web3Service.getAccount();
    if (this.loan.debt.owner.toLowerCase() !== account.toLowerCase()) {
      this.openSnackBar('You can´t transfer a loan that you haven´t funded.', '');
      return;
    }
    // address validation
    const web3 = this.web3Service.web3;
    if (!this.showTransferDialog && !web3.utils.isAddress(this.address)) {
      this.openSnackBar('The address is not valid', '');
      return;
    }

    if (this.showTransferDialog) {
      const dialogRef = this.dialog.open(DialogLoanTransferComponent, {
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
      'click-transfer-loan',
      Category.Loan,
      'loan ' + this.loan.id
    );
    this.handleTransfer();
  }

  /**
   * If the validations were successful, manage the transfer transaction
   */
  async handleTransfer() {
    const to: string = this.address;

    this.eventsService.trackEvent(
      'set-to-transfer-loan',
      Category.Loan,
      'loan ' + this.loan.id + ' to ' + to
    );

    this.startOperation();

    try {
      const tx = await this.contractService.transferLoan(this.loan, to);

      this.eventsService.trackEvent(
        'transfer-loan',
        Category.Loan,
        'loan ' + this.loan.id + ' to ' + to
      );

      this.txService.registerTransferTx(
        tx,
        environment.contracts.basaltEngine,
        this.loan,
        to
      );

      this.startTransfer.emit();
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
   * Start transfer operation
   */
  startOperation() {
    console.info('Started transfer');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPending = true;
  }

  /**
   * Cancel transfer operation
   */
  cancelOperation() {
    this.openSnackBar('Your transaction has failed', '');
    this.opPending = false;
  }

  /**
   * Finish current transfer operation
   */
  finishOperation() {
    console.info('Transfer finished');
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
   * Transfer button text
   * @return Button text
   */
  get buttonText(): string {
    const tx = this.pendingTx;
    if (tx === undefined) {
      return 'Transfer';
    }
    if (tx.confirmed) {
      return 'Transferred';
    }
    return 'Transferring';
  }
}
