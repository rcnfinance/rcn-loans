import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { CollateralRequest } from 'app/interfaces/collateral-request';
import { LoanRequest } from 'app/interfaces/loan-request';
import { Type } from 'app/interfaces/tx';
import { Tx } from 'app/models/tx.model';
import { Loan } from 'app/models/loan.model';
import { TxService } from 'app/services/tx.service';
import { ContractsService } from 'app/services/contracts.service';
import { NavrailService } from 'app/services/navrail.service';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';
import { Utils } from 'app/utils/utils';

enum Steps {
  PendingCreateLoan,
  CreatingLoan,
  PendingCreateCollateral,
  CreatingCollateral,
  Finish
}

@Component({
  selector: 'app-dialog-borrow',
  templateUrl: './dialog-borrow.component.html',
  styleUrls: ['./dialog-borrow.component.scss']
})
export class DialogBorrowComponent implements OnInit, OnDestroy {
  loan: Loan;
  loanRequest: LoanRequest;
  collateralRequest: CollateralRequest;
  step: Steps;
  txCost: string;
  private loading: boolean;

  // subscriptions
  private createTx: Tx;
  private createTxSubscription: Subscription;
  private collateralTx: Tx;
  private collateralTxSubscription: Subscription;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogBorrowComponent>,
    private contractsService: ContractsService,
    private navrailService: NavrailService,
    private chainService: ChainService,
    private web3Service: Web3Service,
    private txService: TxService,
    @Inject(MAT_DIALOG_DATA) private data: {
      loan: Loan,
      loanRequest: LoanRequest,
      collateralRequest: CollateralRequest
    }
  ) {
    const { loanRequest, collateralRequest, loan } = this.data;
    this.loanRequest = loanRequest;
    this.collateralRequest = collateralRequest;
    this.loan = loan;
    this.step = Steps.PendingCreateLoan;
    this.loading = true;
  }

  async ngOnInit() {
    try {
      const { loan } = this;
      const loanWasCreated = await this.contractsService.loanWasCreated(loan.engine, loan.id);
      if (loanWasCreated) {
        this.step = Steps.PendingCreateCollateral;
      }
    } catch { } finally {
      this.loading = false;
    }
    this.loadTxCost();
  }

  ngOnDestroy() {
    const { createTx, createTxSubscription, collateralTx, collateralTxSubscription } = this;
    if (createTx && createTxSubscription) {
      this.createTxSubscription.unsubscribe();
      this.txService.untrackTx(createTx.hash);
    }
    if (collateralTx && collateralTxSubscription) {
      this.collateralTxSubscription.unsubscribe();
      this.txService.untrackTx(collateralTx.hash);
    }
  }

  clickConfirm() {
    const { step, loading } = this;
    if (loading) {
      return;
    }
    if (step === Steps.PendingCreateLoan) {
      return this.clickCreateLoan();
    }
    if (step === Steps.PendingCreateCollateral) {
      return this.clickCreateCollateral();
    }
    if (step === Steps.Finish) {
      this.router.navigate(['/dashboard']);
      return this.dialogRef.close();
    }
  }

  async clickCreateLoan() {
    try {
      const { loanRequest, loan } = this;
      const { config } = this.chainService;
      const hash: string = await this.contractsService.requestLoan(
        loan.engine,
        loanRequest.amount,
        loanRequest.model,
        loanRequest.oracle,
        loanRequest.account,
        loanRequest.callback,
        loanRequest.salt,
        loanRequest.expiration,
        loanRequest.encodedData
      );

      const { engine } = loan;
      const to: string = config.contracts[engine].diaspore.loanManager;
      const tx = await this.txService.buildTx(hash, engine, to, Type.create, { loanId: loan.id, loan });
      this.txService.addTx(tx);

      this.retrievePendingTx();

      await this.navrailService.refreshNavrail();
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.showMessage('A problem occurred during loan creation');
        throw Error(e);
      }
    }
  }

  async clickCreateCollateral() {
    try {
      const account = await this.web3Service.getAccount();
      const { loan, collateralRequest } = this;
      const hash: string = await this.contractsService.createCollateral(
        loan.engine,
        collateralRequest.debtId,
        collateralRequest.oracle,
        collateralRequest.amount,
        collateralRequest.liquidationRatio,
        collateralRequest.balanceRatio,
        account
      );

      const { config } = this.chainService;
      const { engine } = loan;
      const to: string = config.contracts[engine].collateral.collateral;
      const tx = await this.txService.buildTx(hash, engine, to, Type.createCollateral, { loanId: loan.id, loan });
      this.txService.addTx(tx);

      this.retrievePendingTx();
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.showMessage('A problem occurred during collateral creation');
        throw Error(e);
      }
    }
  }

  /**
   * Get submit button text according to the borrowing process status
   * @return Button text
   */
  get confirmButtonText(): string {
    const { step } = this;
    if (step === Steps.PendingCreateLoan) {
      return 'Create';
    }
    if (step === Steps.CreatingLoan) {
      return 'Creating';
    }
    if (step === Steps.PendingCreateCollateral) {
      return 'Create';
    }
    if (step === Steps.CreatingCollateral) {
      return 'Creating';
    }
    if (step === Steps.Finish) {
      return 'Close';
    }
  }

  /**
   * Load txCost
   */
  private async loadTxCost() {
    this.txCost = null;
    try {
      const txCost = (await this.getTxCost()) / 10 ** 18;
      const rawChainCurrencyToUsd = await this.contractsService.latestAnswer();
      const chainCurrencyToUsd = rawChainCurrencyToUsd / 10 ** 8;
      this.txCost = Utils.formatAmount(txCost * chainCurrencyToUsd) + ' USD';
    } catch (err) {
      this.txCost = '-';
    }
  }

  /**
   * Calculate gas price * estimated gas
   * @return Tx cost
   */
  private async getTxCost() {
    const { engine, address, collateral: { id, token, amount } } = this.loan;
    const gasPrice = await this.web3Service.web3.eth.getGasPrice();
    const estimatedGas = await this.contractsService.addCollateral(
      engine,
      id,
      token,
      amount.toString(),
      address,
      true
    );
    const gasLimit = Number(estimatedGas) * 110 / 100;
    const txCost = gasLimit * gasPrice;
    return txCost;
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    this.createTx = this.txService.getLastTxByType(Type.create);
    this.collateralTx = this.txService.getLastTxByType(Type.createCollateral);

    if (this.createTx) {
      this.step = Steps.CreatingLoan;
      this.trackLoanTx();
    }
    if (this.collateralTx) {
      this.step = Steps.CreatingCollateral;
      this.trackCollateralTx();
    }
  }

  /**
   * Track create loan TX
   */
  private trackLoanTx() {
    if (this.createTxSubscription) {
      this.createTxSubscription.unsubscribe();
    }

    const { hash } = this.createTx;
    this.createTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.finishLoanCreation();
        this.createTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.step = Steps.PendingCreateLoan;
      }
    });
  }

  /**
   * Track create collateral TX
   */
  private trackCollateralTx() {
    if (this.collateralTxSubscription) {
      this.collateralTxSubscription.unsubscribe();
    }

    const { hash } = this.collateralTx;
    this.collateralTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.finishCollateralCreation();
        this.collateralTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.step = Steps.PendingCreateCollateral;
      }
    });
  }

  private async finishLoanCreation() {
    this.step = Steps.PendingCreateCollateral;
    await this.navrailService.refreshNavrail();

    // simulate click on 'Create'
    this.clickCreateCollateral();
  }

  private async finishCollateralCreation() {
    this.step = Steps.Finish;
    await this.navrailService.refreshNavrail();
  }

  /**
   * Show dialog or snackbar with a message
   * @param message The message to show in the snackbar
   */
  private showMessage(message: string) {
    this.snackBar.open(message , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }
}
