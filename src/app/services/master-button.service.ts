import { Injectable, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
// App Model
import { Loan } from 'app/models/loan.model';
// App Component
import { DialogInsufficientFoundsComponent } from 'app/dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
// App Services
import { Tx, TxService } from 'app/tx.service';
import { ContractsService } from './contracts.service';
import { CountriesService } from './countries.service';
import { EventsService, Category } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class MasterButtonService {
  @Input() loan: Loan;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;

  private loanSource$ = new Subject<Loan>();

  loan$ = this.loanSource$.asObservable();

  constructor(
    private txService: TxService,
    private contractsService: ContractsService,
    private countriesService: CountriesService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
  }

  updateLoan(loan: Loan) {
    this.loanSource$.next(loan);
  }

  get enabled(): Boolean {
    return this.txService.getLastLend(this.loan) === undefined;
  }

  get buttonText(): string {
    const tx = this.pendingTx;
    if (tx === undefined) {
      return 'Lend';
    }
    if (tx.confirmed) {
      return 'Lent';
    }
    return 'Lending...';
  }

  clickLend() {
    console.info(this.loanSource$);
    if (this.pendingTx === undefined) {
      this.eventsService.trackEvent(
        'click-lend',
        Category.Loan,
        'loan #' + this.loan.id
      );

      this.handleLend();
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  async handleLend(forze = false) {

  }

  finishOperation() {
    console.info('Lend finished');
    this.opPending = false;
  }

  startOperation() {
    console.info('Started lending');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPending = true;
  }

  cancelOperation() {
    console.info('Cancel lend');
    this.openSnackBar('Your transaction has failed', '');
    this.opPending = false;
  }

  showInsufficientFundsDialog(required: number, funds: number) {
    this.dialog.open(DialogInsufficientFoundsComponent, { data: {
      required: required,
      balance: funds
    }});
    this.cancelOperation();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }
}
