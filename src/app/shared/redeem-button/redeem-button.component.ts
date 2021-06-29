import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Loan } from 'app//models/loan.model';
import { DialogGenericErrorComponent } from 'app/dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';
import { ContractsService } from 'app/services/contracts.service';
import { TxService, Tx, Type } from 'app/services/tx.service';
import { EventsService, Category } from 'app/services/events.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';

@Component({
  selector: 'app-redeem-button',
  templateUrl: './redeem-button.component.html',
  styleUrls: ['./redeem-button.component.scss']
})
export class RedeemButtonComponent implements OnInit, OnDestroy {
  @Input() name = 'Withdraw';
  @Input() className = '';
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
    private chainService: ChainService,
    private txService: TxService,
    private walletConnectService: WalletConnectService,
    public snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.retrievePendingTx();
  }

  ngOnDestroy() {
    if (this.txSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackRedeemTx(tx));
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingRedeemCollateral(this.loan);

    if (this.pendingTx) {
      this.startRedeem.emit();
      this.startProgress = true;
    }

    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackRedeemTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackRedeemTx(tx: Tx) {
    const { id } = this.loan.collateral;
    if (tx.type === Type.redeemCollateral && tx.data.id === id) {
      this.endRedeem.emit();
      this.txSubscription = false;
      this.finishProgress = true;
    }
  }

  async clickRedeem() {
    const { config } = this.chainService;
    // pending tx validation
    if (this.pendingTx) {
      window.open(config.network.explorer.tx.replace(
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
    const { collateral, engine } = this.loan;
    const token: string = collateral.token;
    if (token === config.contracts.chainCurrencyAddress) {
      const collateralAddress = config.contracts[engine].collateral.collateral;
      const operator = config.contracts[engine].collateral.wethManager;
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
      const { oracle, engine, collateral } = this.loan;
      const account: string = await this.web3Service.getAccount();
      const oracleData = await this.contractsService.getOracleData(oracle);
      const collateralAmount = String(collateral.amount);
      const tx: string = await this.contractsService.withdrawCollateral(
        engine,
        collateral.id,
        collateral.token,
        account,
        collateralAmount,
        oracleData,
        account
      );

      this.txService.registerRedeemCollateralTx(tx, this.loan);
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
    const { engine } = this.loan;
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(
      DialogApproveContractComponent, {
        data: {
          engine,
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
