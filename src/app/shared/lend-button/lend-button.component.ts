import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';

import { Loan } from './../../models/loan.model';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';
import { CivicService } from '../../services/civic.service';
import { CivicAuthComponent } from '../civic-auth/civic-auth.component';
import { DialogInsufficientfundsComponent } from '../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { CountriesService } from '../../services/countries.service';
import { EventsService, Category } from '../../services/events.service';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { CosignerService } from './../../services/cosigner.service';
import { DecentralandCosignerProvider } from './../../providers/cosigners/decentraland-cosigner-provider';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private web3Service: Web3Service,
    private civicService: CivicService,
    private countriesService: CountriesService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public cosignerService: CosignerService,
    public decentralandCosignerProvider: DecentralandCosignerProvider
  ) {}

  async handleLend(forze = false) {
    if (this.opPending && !forze) { return; }

    if (!this.web3Service.loggedIn) {
      if (await this.web3Service.requestLogin()) {
        this.handleLend();
        return;
      }

      this.dialog.open(DialogClientAccountComponent);
      return;
    }

    if (!this.lendEnabled) {
      this.dialog.open(DialogGenericErrorComponent, { data: {
        error: new Error('Lending is not enabled in this region')
      }});
      return;
    }

    const cosigner = this.cosignerService.getCosigner(this.loan);
    if (cosigner instanceof DecentralandCosignerProvider) {
      const isParcelStatusOpen = await cosigner.getStatusOfParcel(this.loan);
      if (!isParcelStatusOpen) {
        this.dialog.open(DialogGenericErrorComponent, { data: {
          error: new Error('Not Available, Parcel is already sold')
        }});
        return;
      }
      const isMortgageCancelled = await cosigner.isMortgageCancelled(this.loan);
      if (isMortgageCancelled) {
        this.dialog.open(DialogGenericErrorComponent, { data: {
          error: new Error('Not Available, Mortgage has been cancelled')
        }});
        return;
      }
    }

    this.startOperation();

    try {
      const engineApproved = await this.contractsService.isApproved(this.loan.address);
      //const civicApproved = await this.civicService.status();
      const civicApproved = true;
      const balance = await this.contractsService.getUserBalanceRCNWei();
      console.info('balance', Number(balance));
      const required = await this.contractsService.estimateLendAmount(this.loan);
      console.info('required', required);

      if (!await engineApproved) {
        this.showApproveDialog();
        return;
      }

      if (!await civicApproved) {
        this.showCivicDialog();
        return;
      }

      console.info('Try lend', await required, await balance);
      if (balance > required) {
        const tx = await this.contractsService.lendLoan(this.loan);
        console.log(tx);
        this.eventsService.trackEvent(
          'lend',
          Category.Account,
          'loan #' + this.loan.id
        );

        this.txService.registerLendTx(this.loan, tx);
        this.pendingTx = this.txService.getLastLend(this.loan);
        return;
      }

      this.eventsService.trackEvent(
        'lend',
        Category.Account,
        'request #' + this.loan.id
      );

      this.eventsService.trackEvent(
        'show-insufficient-funds-lend',
        Category.Account,
        'loan #' + this.loan.id,
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

  showApproveDialog() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.onlyAddress = this.loan.address;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleLend(true);
      } else {
        this.cancelOperation();
      }
    });
  }

  clickLend() {
    if (this.pendingTx === undefined) {
      this.eventsService.trackEvent(
        'click-lend',
        Category.Loan,
        'request #' + this.loan.id
      );

      this.handleLend();
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  retrievePendingTx() {
    this.pendingTx = this.txService.getLastLend(this.loan);
  }

  showCivicDialog() {
    const dialogRef: MatDialogRef<CivicAuthComponent> = this.dialog.open(CivicAuthComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleLend(true);
      } else {
        this.cancelOperation();
      }
    });
  }

  showInsufficientFundsDialog(required: number, funds: number) {
    this.dialog.open(DialogInsufficientfundsComponent, { data: {
      required: required,
      balance: funds
    }});
    this.cancelOperation();
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

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }

  ngOnInit() {
    this.retrievePendingTx();
    this.lendEnabled = true;
    // this.countriesService.lendEnabled().then((lendEnabled) => {
    //   this.lendEnabled = lendEnabled;
    // });
  }

}
