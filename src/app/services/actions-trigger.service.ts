import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
// App Model
import { Loan } from 'app/models/loan.model';
// App Component
import { CivicAuthComponent } from 'app/shared/civic-auth/civic-auth.component';
import { DialogClientAccountComponent } from 'app/dialogs/dialog-client-account/dialog-client-account.component';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogInsufficientFoundsComponent } from 'app/dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
import { DialogGenericErrorComponent } from 'app/dialogs/dialog-generic-error/dialog-generic-error.component';
// App Services
import { DecentralandCosignerProvider } from 'app/providers/cosigners/decentraland-cosigner-provider';
import { Tx, TxService } from 'app/tx.service';
import { ContractsService } from './contracts.service';
import { Web3Service } from './web3.service';
import { CosignerService } from './cosigner.service';
import { CivicService } from './civic.service';
import { EventsService, Category } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class ActionsTriggerService {
  private buttonTextSource$ = new BehaviorSubject<string>('Lend');
  currentbuttonText = this.buttonTextSource$.asObservable();

  private opPendingSource$ = new BehaviorSubject<boolean>(false);
  currentOpPending = this.opPendingSource$.asObservable();

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  pendingTx: Tx = undefined;

  constructor(
    private txService: TxService,
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private cosignerService: CosignerService,
    private civicService: CivicService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {}

  enabled(loan: Loan): Boolean { // get boolean if enable to operate in your region Region
    return this.txService.getLastLend(loan) === undefined;
  }

  get changeButtonText() { // get button text depending on Tx state
    const tx = this.pendingTx;
    if (tx === undefined) {
      this.buttonTextSource$.next('Lend');
      return 'Lend';
    }
    if (tx.confirmed) {
      this.buttonTextSource$.next('Lent');
      return 'Lent';
    }
    this.buttonTextSource$.next('Lending...');
    return 'Lending...';
  }

  clickLend(loan: Loan, enableRegion: Boolean) {
    if (this.pendingTx === undefined) { // Track click
      this.eventsService.trackEvent(
        'click-lend',
        Category.Loan,
        'loan #' + loan.id
      );

      this.handleLend(loan, enableRegion); // Init lend Tx after track click
    } else {
      // Tx is pending so redirect to Tx link Etherscan
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  async handleLend(loan: Loan, enableRegion: Boolean) {
    if (this.opPendingSource$.value) { return; } // Return if Tx is pending state

    if (!this.web3Service.loggedIn) { // check and wait for account login
      if (await this.web3Service.requestLogin()) {
        this.handleLend(loan, enableRegion);
        return;
      }

      this.dialog.open(DialogClientAccountComponent); // Account is not logged
      return;
    }

    if (!enableRegion) { // Check boolean if enable to operate in your region Region
      this.dialog.open(DialogGenericErrorComponent, { data: {
        error: new Error('Lending is not enabled in this region')
      }});
      return;
    }

    const cosigner = this.cosignerService.getCosigner(loan);
    if (cosigner instanceof DecentralandCosignerProvider) {
      const isParcelStatusOpen = await cosigner.getStatusOfParcel(loan);
      if (!isParcelStatusOpen) {
        this.dialog.open(DialogGenericErrorComponent, { data: {
          error: new Error('Not Available, Parcel is already sold')
        }});
        return;
      }
      const isMortgageCancelled = await cosigner.isMortgageCancelled(loan);
      if (isMortgageCancelled) {
        this.dialog.open(DialogGenericErrorComponent, { data: {
          error: new Error('Not Available, Mortgage has been cancelled')
        }});
        return;
      }
    }

    this.startOperation(); // Start Tx Operation

    try {
      const engineApproved = this.contractsService.isEngineApproved();
      const civicApproved = this.civicService.status();
      const balance = await this.contractsService.getUserBalanceRCNWei();
      const required = await this.contractsService.estimateLendAmount(loan);
      const ethBalance = await this.contractsService.getUserBalanceETHWei();
      const estimated = await this.contractsService.estimateEthRequiredAmount(loan);

      if (!await engineApproved) {
        this.showApproveDialog(loan, enableRegion);
        return;
      }

      if (!await civicApproved) { // Check if Civic ID is approved
        this.showCivicDialog(loan, enableRegion);
        return;
      }
      if (balance > required) { // Yout Balance is > than required by Tx
        const tx = await this.contractsService.lendLoan(loan);
        this.eventsService.trackEvent(
          'lend',
          Category.Account,
          'loan #' + loan.id
        );

        this.txService.registerLendTx(loan, tx); // Register Tx Operation

        this.pendingTx = this.txService.getLastLend(loan); // Get Tx object
        return;
      }

      if (ethBalance.toNumber() >= estimated.toNumber()) { // RCN to ETH
        const tx = await this.contractsService.lendLoanWithSwap(loan, estimated);
        this.eventsService.trackEvent(
          'lend',
          Category.Account,
          'loan #' + loan.id
        );

        this.txService.registerLendTx(loan, tx); // Register Tx Operation
        this.pendingTx = this.txService.getLastLend(loan);
        return;
      }

      this.eventsService.trackEvent(
        'show-insufficient-funds-lend',
        Category.Account,
        'loan #' + loan.id,
        required
      );

      this.showInsufficientFundsDialog(required, balance);

    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.message.indexOf('User denied transaction signature') < 0) {
        this.dialog.open(DialogGenericErrorComponent, {
          data: { error: e }
        });
      }
      console.error(e);
    } finally {
      this.finishOperation();
    }
  }

  finishOperation() {
    console.info('Lend finished');
    this.opPendingSource$.next(this.opPendingSource$.value === false); // TODO
    this.buttonTextSource$.next('Lent'); // TODO
  }

  startOperation() {
    console.info('Started lending');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPendingSource$.next(this.opPendingSource$.value === true); // TODO
    this.buttonTextSource$.next('Lending'); // TODO
  }

  cancelOperation() {
    console.info('Cancel lend');
    this.openSnackBar('Your transaction has failed', '');
    this.opPendingSource$.next(this.opPendingSource$.value === false); // TODO
    this.buttonTextSource$.next('Lend'); // TODO
  }

  showCivicDialog(loan: Loan, enableRegion: Boolean) {
    const dialogRef: MatDialogRef<CivicAuthComponent> = this.dialog.open(CivicAuthComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleLend(loan, enableRegion);
      } else {
        this.cancelOperation();
      }
    });
  }

  showApproveDialog(loan: Loan, enableRegion: Boolean) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.autoClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleLend(loan, enableRegion);
      } else {
        this.cancelOperation();
      }
    });
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
