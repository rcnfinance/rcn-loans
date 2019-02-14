import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
import { environment } from 'environments/environment';
// App Model
import { Loan } from 'app/models/loan.model';
// App Component
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogInsufficientFoundsComponent } from 'app/dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
// App Services
import { Tx, TxService } from 'app/tx.service';
import { ContractsService } from './contracts.service';
import { CountriesService } from './countries.service';
import { Web3Service } from './web3.service';
import { EventsService, Category } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class ActionsTriggerService {
  loan: Loan;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;

  constructor(
    private txService: TxService,
    private contractsService: ContractsService,
    private countriesService: CountriesService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
  }

  // get enabled(): Boolean {
  //   return this.txService.getLastLend(this.loan) === undefined;
  // }

  // get buttonText(): string {
  //   const tx = this.pendingTx;
  //   if (tx === undefined) {
  //     return 'Lend';
  //   }
  //   if (tx.confirmed) {
  //     return 'Lent';
  //   }
  //   return 'Lending...';
  // }

  // clickLend() {
  //   if (this.pendingTx === undefined) {
  //     this.eventsService.trackEvent(
  //       'click-lend',
  //       Category.Loan,
  //       'loan #' + this.loan.id
  //     );

  //     this.handleLend();
  //   } else {
  //     window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
  //   }
  // }

  // async handleLend(forze = false) {
  //   if (this.opPending && !forze) { return; }

  //   if (!this.web3Service.loggedIn) {
  //     if (await this.web3Service.requestLogin()) {
  //       this.handleLend();
  //       return;
  //     }

  //     this.dialog.open(DialogClientAccountComponent);
  //     return;
  //   }

  //   if (!this.lendEnabled) {
  //     this.dialog.open(DialogGenericErrorComponent, { data: {
  //       error: new Error('Lending is not enabled in this region')
  //     }});
  //     return;
  //   }

  //   const cosigner = this.cosignerService.getCosigner(this.loan);
  //   if (cosigner instanceof DecentralandCosignerProvider) {
  //     const isParcelStatusOpen = await cosigner.getStatusOfParcel(this.loan);
  //     if (!isParcelStatusOpen) {
  //       this.dialog.open(DialogGenericErrorComponent, { data: {
  //         error: new Error('Not Available, Parcel is already sold')
  //       }});
  //       return;
  //     }
  //     const isMortgageCancelled = await cosigner.isMortgageCancelled(this.loan);
  //     if (isMortgageCancelled) {
  //       this.dialog.open(DialogGenericErrorComponent, { data: {
  //         error: new Error('Not Available, Mortgage has been cancelled')
  //       }});
  //       return;
  //     }
  //   }

  //   this.startOperation();

  //   try {
  //     const engineApproved = this.contractsService.isEngineApproved();
  //     const civicApproved = this.civicService.status();
  //     const balance = await this.contractsService.getUserBalanceRCNWei();
  //     const required = await this.contractsService.estimateLendAmount(this.loan);
  //     const ethBalance = await this.contractsService.getUserBalanceETHWei();
  //     const estimated = await this.contractsService.estimateEthRequiredAmount(this.loan);

  //     if (!await engineApproved) {
  //       this.showApproveDialog();
  //       return;
  //     }

  //     if (!await civicApproved) {
  //       this.showCivicDialog();
  //       return;
  //     }

  //     if (balance > required) {
  //       const tx = await this.contractsService.lendLoan(this.loan);
  //       this.eventsService.trackEvent(
  //         'lend',
  //         Category.Account,
  //         'loan #' + this.loan.id
  //       );

  //       this.txService.registerLendTx(this.loan, tx);
  //       this.pendingTx = this.txService.getLastLend(this.loan);
  //       return;
  //     }

  //     if (ethBalance.toNumber() >= estimated.toNumber()) {
  //       const tx = await this.contractsService.lendLoanWithSwap(this.loan, estimated);
  //       this.eventsService.trackEvent(
  //         'lend',
  //         Category.Account,
  //         'loan #' + this.loan.id
  //       );

  //       this.txService.registerLendTx(this.loan, tx);
  //       this.pendingTx = this.txService.getLastLend(this.loan);
  //       return;
  //     }

  //     this.eventsService.trackEvent(
  //       'show-insufficient-funds-lend',
  //       Category.Account,
  //       'loan #' + this.loan.id,
  //       required
  //     );

  //     this.showInsufficientFundsDialog(required, balance);

  //   } catch (e) {
  //     // Don't show 'User denied transaction signature' error
  //     if (e.message.indexOf('User denied transaction signature') < 0) {
  //       this.dialog.open(DialogGenericErrorComponent, {
  //         data: { error: e }
  //       });
  //     }
  //     console.error(e);
  //   } finally {
  //     this.finishOperation();
  //   }
  // }

  // finishOperation() {
  //   console.info('Lend finished');
  //   this.opPending = false;
  // }

  // startOperation() {
  //   console.info('Started lending');
  //   this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
  //   this.opPending = true;
  // }

  // cancelOperation() {
  //   console.info('Cancel lend');
  //   this.openSnackBar('Your transaction has failed', '');
  //   this.opPending = false;
  // }

  // showApproveDialog() {
  //   const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
  //   dialogRef.componentInstance.autoClose = true;
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.handleLend(true);
  //     } else {
  //       this.cancelOperation();
  //     }
  //   });
  // }

  // showInsufficientFundsDialog(required: number, funds: number) {
  //   this.dialog.open(DialogInsufficientFoundsComponent, { data: {
  //     required: required,
  //     balance: funds
  //   }});
  //   this.cancelOperation();
  // }

  // openSnackBar(message: string, action: string) {
  //   this.snackBar.open(message , action, {
  //     duration: 4000,
  //     horizontalPosition: this.horizontalPosition
  //   });
  // }
}
