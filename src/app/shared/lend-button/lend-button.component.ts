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

import { Loan, Network } from './../../models/loan.model';
import { Utils } from '../../utils/utils';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx, Type } from './../../services/tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';
import { DialogInsufficientfundsComponent } from '../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { CountriesService } from '../../services/countries.service';
import { EventsService, Category } from '../../services/events.service';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogWrongCountryComponent } from '../../dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogLoanLendComponent } from '../../dialogs/dialog-loan-lend/dialog-loan-lend.component';
import { CosignerService } from './../../services/cosigner.service';
import { DecentralandCosignerProvider } from './../../providers/cosigners/decentraland-cosigner-provider';

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
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  opPending = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';

  txSubscription: boolean;

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
    }
  }

  /**
   * Handle click on lend button
   */
  async clickLend() {
    // country validation
    if (!this.lendEnabled) {
      this.dialog.open(DialogWrongCountryComponent);
      return;
    }
    // pending tx validation
    if (this.pendingTx) {
      window.open(environment.network.explorer.tx.replace(
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
      this.openSnackBar('The loan has already been lend', '');
      return;
    }
    // cosigner validation
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
    // unlogged user
    if (!this.web3Service.loggedIn) {
      const hasClient = await this.web3Service.requestLogin();
      if (this.web3Service.loggedIn) {
        this.handleLend();
        return;
      }
      if (!hasClient) {
        this.dialog.open(DialogClientAccountComponent);
      }
      return;
    }
    // borrower validation
    const account: string = await this.web3Service.getAccount();
    if (this.loan.borrower.toLowerCase() === account.toLowerCase()) {
      this.openSnackBar('The lender cannot be the same as the borrower', '');
      return;
    }
    if (this.loan.network === Network.Basalt) {
      this.handleLend();
      return;
    }
    // lend token validation
    const token = this.lendToken;
    if (!this.showLendDialog && !token) {
      this.openSnackBar('Please choose a currency', '');
      return;
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
      'request #' + this.loan.id
    );
    this.handleLend();
  }

  /**
   * If the validations were successful, manage the lending transaction
   * @param forze TODO - Force lend
   */
  async handleLend(forze = false) {
    if (this.opPending && !forze) {
      return;
    }

    this.startOperation();

    try {
      const oracleData = await this.contractsService.getOracleData(this.loan.oracle);

      // set input lend token
      const web3: any = this.web3Service.web3;
      let lendToken: string = this.lendToken;
      if (this.loan.network === Network.Basalt) {
        lendToken = environment.contracts.rcnToken;
      }

      // set value in specified token
      const balance = await this.contractsService.getUserBalanceInToken(lendToken);
      let required: any = await this.contractsService.estimateLendAmount(this.loan, lendToken);
      let contractAddress: string;
      let payableAmount: any;

      // set slippage
      const aditionalSlippage = new web3.BigNumber(
        environment.contracts.converter.params.aditionalSlippage
      );
      required = new web3.BigNumber(required, 10).mul(
        new web3.BigNumber(100).add(aditionalSlippage)
      ).div(
        new web3.BigNumber(100)
      );
      required = Number(required);

      // set lend contract
      switch (lendToken) {
        case environment.contracts.rcnToken:
          contractAddress = this.loan.address;
          break;

        case environment.contracts.converter.ethAddress:
          contractAddress = environment.contracts.converter.converterRamp;

          required = Number(required).toFixed(0);
          payableAmount = required;
          break;

        default:
          contractAddress = environment.contracts.converter.converterRamp;
          break;
      }

      // validate balance amount
      if (Number(balance) > Number(required)) {
        let tx: string;

        // validate approve
        const engineApproved = await this.contractsService.isApproved(contractAddress, lendToken);
        if (!await engineApproved) {
          this.showApproveDialog(contractAddress, this.lendToken);
          return;
        }

        let account: string = await this.web3Service.getAccount();
        account = web3.toChecksumAddress(account);

        switch (this.loan.network) {
          case Network.Basalt:
            tx = await this.contractsService.lendLoan(this.loan);
            this.txService.registerLendTx(tx, environment.contracts.basaltEngine, this.loan);
            break;

          case Network.Diaspore:
            if (lendToken === environment.contracts.rcnToken) {
              tx = await this.contractsService.lendLoan(this.loan);
            } else {
              const tokenConverter = environment.contracts.converter.tokenConverter;

              tx = await this.contractsService.converterRampLend(
                payableAmount,
                tokenConverter,
                lendToken,
                required,
                Utils.address0x,
                this.loan.id,
                oracleData,
                '0x',
                '0x',
                account
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

        this.retrievePendingTx();
      } else {
        this.eventsService.trackEvent(
          'show-insufficient-funds-lend',
          Category.Account,
          'loan #' + this.loan.id,
          required
        );

        const currency = environment.usableCurrencies.filter(token => token.address === lendToken)[0];
        this.showInsufficientFundsDialog(required, balance, currency.symbol);
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
   * Finish current lending operation
   */
  finishOperation() {
    console.info('Lend finished');
    this.opPending = false;
  }

  /**
   * Start lend operation
   */
  startOperation() {
    console.info('Started lend');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPending = true;
  }

  /**
   * Cancel or fail lend operation
   */
  cancelOperation() {
    console.info('Cancel lend');
    this.openSnackBar('Your transaction has failed', '');
    this.opPending = false;
  }

  /**
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   */
  showApproveDialog(contract: string, token: string = environment.contracts.rcnToken) {
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
   * @param required Amount required
   * @param balance Actual user balance in selected currency
   * @param currency Currency symbol
   */
  showInsufficientFundsDialog(required: number, balance: number, currency: string) {
    this.dialog.open(DialogInsufficientfundsComponent, {
      data: {
        required,
        balance,
        currency
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

}
