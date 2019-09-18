import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatDialogConfig
} from '@angular/material';

import { Loan, Network } from './../../models/loan.model';
import { Utils } from '../../utils/utils';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';
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
  @Input() lendPayload: {
    payableAmount: number,
    converter: string,
    fromToken: string,
    oracleData: any
  };
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private web3Service: Web3Service,
    private countriesService: CountriesService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public cosignerService: CosignerService,
    public decentralandCosignerProvider: DecentralandCosignerProvider
  ) { }

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
      this.dialog.open(DialogGenericErrorComponent, {
        data: {
          error: new Error('Lending is not enabled in this region')
        }
      });
      return;
    }

    const cosigner = this.cosignerService.getCosigner(this.loan);
    if (cosigner instanceof DecentralandCosignerProvider) {
      const isParcelStatusOpen = await cosigner.getStatusOfParcel(this.loan);
      if (!isParcelStatusOpen) {
        this.dialog.open(DialogGenericErrorComponent, {
          data: {
            error: new Error('Not Available, Parcel is already sold')
          }
        });
        return;
      }

      const isMortgageCancelled = await cosigner.isMortgageCancelled(this.loan);
      if (isMortgageCancelled) {
        this.dialog.open(DialogGenericErrorComponent, {
          data: {
            error: new Error('Not Available, Mortgage has been cancelled')
          }
        });
        return;
      }
    }

    const oracleData = await this.contractsService.getOracleData(this.loan.oracle);

    this.startOperation();

    try {
      const engineApproved = await this.contractsService.isApproved(this.loan.address);
      const balance = await this.contractsService.getUserBalanceRCNWei();
      console.info('balance', Number(balance));
      const required = await this.contractsService.estimateLendAmount(this.loan);
      console.info('required', required);
      const inputLendPayload = this.lendPayload;

      if (!await engineApproved) {
        this.showApproveDialog();
        return;
      }

      if (!inputLendPayload) {
        throw Error('Please choose a currency');
      }

      if (balance > required) {
        const web3 = this.web3Service.web3;
        let tx: string;
        let account: string = await this.web3Service.getAccount();
        account = web3.toChecksumAddress(account);

        switch (this.loan.network) {
          case Network.Basalt:
            tx = await this.contractsService.lendLoan(this.loan);
            this.txService.registerLendTx(tx, environment.contracts.basaltEngine, this.loan);
            break;

          case Network.Diaspore:
            if (inputLendPayload.fromToken === environment.contracts.rcnToken) {
              tx = await this.contractsService.lendLoan(this.loan);
            } else {
              tx = await this.contractsService.converterRampLend(
                inputLendPayload.payableAmount,
                inputLendPayload.converter,
                inputLendPayload.fromToken,
                environment.contracts.diaspore.loanManager,
                Utils.address0x,
                environment.contracts.diaspore.debtEngine,
                this.loan.id,
                oracleData,
                '0x0',
                account,
                Utils.address0x
              );
            }
            this.txService.registerLendTx(tx, environment.contracts.diaspore.loanManager, this.loan);
            break;

          default:
            break;
        }

        this.eventsService.trackEvent(
          'lend',
          Category.Account,
          'loan #' + this.loan.id
        );

        if (this.loan.network === Network.Basalt) {
          this.txService.registerLendTx(tx, environment.contracts.basaltEngine, this.loan);
        } else {
          this.txService.registerLendTx(tx, environment.contracts.diaspore.loanManager, this.loan);
        }
        this.retrievePendingTx();
      } else {
        this.eventsService.trackEvent(
          'show-insufficient-funds-lend',
          Category.Account,
          'loan #' + this.loan.id,
          required
        );

        this.showInsufficientFundsDialog(required, balance);
      }
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
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      loan: this.loan
    };
    if (this.pendingTx === undefined) {
      // this.dialog.open(DialogSelectCurrencyComponent, dialogConfig);
      this.eventsService.trackEvent(
        'click-lend',
        Category.Loan,
        'request #' + this.loan.id
      );

      this.handleLend();
    } else {
      // this.dialog.open(DialogSelectCurrencyComponent, dialogConfig);
      // Logica selección de moneda
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingLend(this.loan);
  }

  showInsufficientFundsDialog(required: number, funds: number) {
    this.dialog.open(DialogInsufficientfundsComponent, {
      data: {
        required: required,
        balance: funds
      }
    });

    this.cancelOperation();
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
    return 'Lending...';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }

  ngOnInit() {
    this.retrievePendingTx();
    this.lendEnabled = true;
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
    this.canLend();
  }

  async canLend() {
    this.lendEnabled = await this.countriesService.lendEnabled();
  }

}
