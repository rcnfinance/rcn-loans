import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef } from '@angular/material';
import { environment } from './../../../environments/environment';
import { Loan } from './../../models/loan.model';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
// App Services
import { Web3Service } from './../../services/web3.service';
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx, Type } from './../../services/tx.service';
import { EventsService, Category } from '../../services/events.service';
import { WalletConnectService } from './../../services/wallet-connect.service';

@Component({
  selector: 'app-redeem-button',
  templateUrl: './redeem-button.component.html',
  styleUrls: ['./redeem-button.component.scss']
})
export class RedeemButtonComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @Input() disabled: boolean;
  @Output() startRedeem = new EventEmitter();
  @Output() endRedeem = new EventEmitter();
  pendingTx: Tx = undefined;
  opPending = false;
  startProgress: boolean;
  finishProgress: boolean;

  txSubscription: boolean;

  constructor(
    private dialog: MatDialog,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private eventsService: EventsService,
    private txService: TxService,
    private walletConnectService: WalletConnectService,
    public snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.retrievePendingTx();
  }

  ngOnDestroy() {
    if (this.txSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackLendTx(tx));
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingLend(this.loan);

    if (this.pendingTx) {
      this.startRedeem.emit();
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
    if (tx.type === Type.withdrawCollateral && tx.data.id === this.loan.id) {
      this.endRedeem.emit();
      this.txSubscription = false;
      this.finishProgress = true;
    }
  }

  async clickRedeem() {
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
    // unlogged user
    const loggedIn = await this.walletConnectService.connect();
    if (!loggedIn) {
      return;
    }
    // approve validation
    const { collateral } = this.loan;
    const token: string = collateral.token;
    if (token === environment.contracts.converter.ethAddress) {
      const collateralAddress = environment.contracts.collateral.collateral;
      const operator = environment.contracts.collateral.wethManager;
      const operatorApproved = await this.contractsService.isApprovedERC721(
        collateralAddress,
        operator
      );
      if (!await operatorApproved) {
        const approve = await this.showApproveDialog(operator, collateralAddress, 'onlyAsset');
        if (!approve) {
          this.showMessage('You need to approve the collateral WETH manager to continue.');
          return;
        }
      }
    }

    this.eventsService.trackEvent(
      'click-redeem',
      Category.Loan,
      'request ' + this.loan.id
    );
    this.handleRedeem();
  }

  /**
   * If the validations were successful, manage the lending transaction
   * @param forze TODO - Force lend
   */
  async handleRedeem(forze = false) {
    if (this.opPending && !forze) {
      return;
    }

    this.startOperation();

    try {
      const loan: Loan = this.loan;
      const { collateral } = loan;
      const account: string = await this.web3Service.getAccount();
      const oracleData = await this.contractsService.getOracleData(loan.oracle);
      const collateralAmount = String(collateral.amount);
      const tx: string = await this.contractsService.withdrawCollateral(
        collateral.id,
        collateral.token,
        account,
        collateralAmount,
        oracleData,
        account
      );

      this.txService.registerWithdrawCollateralTx(tx, this.loan, collateral, collateralAmount as any);
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
  finishOperation() {
    console.info('Lend finished');
    this.opPending = false;
  }

  /**
   * Start lend operation
   */
  startOperation() {
    console.info('Started redeem');
    this.showMessage('Your transaction is being processed. This might take a few second');
    this.opPending = true;
  }

  /**
   * Show snackbar with a message
   * @param message The message to show in the snackbar
   */
  private showMessage(message: string) {
    this.snackBar.open(message , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }

  /**
   * Show approve dialog
   * @param contract Contract address
   * @param token Token address
   * @param type ERC20 or ERC721
   * @return Promise<boolean>
   */
  private async showApproveDialog(
    contract: string,
    token: string,
    type: 'onlyToken' | 'onlyAsset'
  ) {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          [type]: token,
          onlyAddress: contract
        }
      }
    );

    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        }

        resolve();
      });
    });
  }
}
