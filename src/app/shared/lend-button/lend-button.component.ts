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
import { HttpClient } from '@angular/common/http';
import { Loan } from './../../models/loan.model';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';
import { CivicService } from '../../services/civic.service';
import { CivicAuthComponent } from '../civic-auth/civic-auth.component';
import { DialogInsufficientFoundsComponent } from '../../dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
import { CountriesService } from '../../services/countries.service';
import { EventsService, Category } from '../../services/events.service';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DecentralandCosignerProvider } from '../../providers/cosigners/decentraland-cosigner-provider';
import { CosignerService } from './../../services/cosigner.service';

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
    public decentralandCosignerProvider: DecentralandCosignerProvider,
    public cosignerService: CosignerService,
    private http: HttpClient
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
      const engineApproved = this.contractsService.isEngineApproved();
      const civicApproved = this.civicService.status();
      const balance = this.contractsService.getUserBalanceRCNWei();
      const required = this.contractsService.estimateLendAmount(this.loan);
      if (!await engineApproved) {
        this.showApproveDialog();
        return;
      }

      console.info('Try lend', await required, await balance);
      if (await balance < await required) {
        this.eventsService.trackEvent(
          'show-insufficient-funds-lend',
          Category.Account,
          'loan #' + this.loan.id,
          await required
        );

        this.showInsufficientFundsDialog(await required, await balance);
        return;
      }

      if (!await civicApproved) {
        this.showCivicDialog();
        return;
      }

      const tx = await this.contractsService.lendLoan(this.loan);

      this.eventsService.trackEvent(
        'lend',
        Category.Account,
        'loan #' + this.loan.id
      );

      this.txService.registerLendTx(this.loan, tx);
      this.pendingTx = this.txService.getLastLend(this.loan);
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
    dialogRef.componentInstance.autoClose = true;
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
        'loan #' + this.loan.id
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
    this.dialog.open(DialogInsufficientFoundsComponent, { data: {
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
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
  }

}
