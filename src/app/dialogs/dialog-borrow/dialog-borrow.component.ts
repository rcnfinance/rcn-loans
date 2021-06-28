import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollateralRequest } from 'app/interfaces/collateral-request';
import { LoanRequest } from 'app/interfaces/loan-request';
import { Loan } from 'app/models/loan.model';
import { ContractsService } from 'app/services/contracts.service';
import { NavrailService } from 'app/services/navrail.service';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';
import { TxLegacyService, Tx, Type } from 'app/services/tx-legacy.service';
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
export class DialogBorrowComponent implements OnInit {
  loan: Loan;
  loanRequest: LoanRequest;
  collateralRequest: CollateralRequest;
  step: Steps;
  createPendingTx: Tx = undefined;
  collateralPendingTx: Tx = undefined;
  txCost: string;
  private loading: boolean;

  // subscriptions
  private txSubscription: boolean;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogBorrowComponent>,
    private contractsService: ContractsService,
    private navrailService: NavrailService,
    private chainService: ChainService,
    private web3Service: Web3Service,
    private txService: TxLegacyService,
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
      const engine: string = config.contracts[loan.engine].diaspore.loanManager;
      const tx: string = await this.contractsService.requestLoan(
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

      const { id, amount } = loan;
      this.txService.registerCreateTx(tx, { engine, id, amount });
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
      const tx: string = await this.contractsService.createCollateral(
        loan.engine,
        collateralRequest.debtId,
        collateralRequest.oracle,
        collateralRequest.amount,
        collateralRequest.liquidationRatio,
        collateralRequest.balanceRatio,
        account
      );
      this.txService.registerCreateCollateralTx(tx, this.loan);
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
  // FIXME: change copy
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
    this.createPendingTx = this.txService.getLastPendingCreate(this.loan);
    this.collateralPendingTx = this.txService.getLastPendingCreateCollateral(this.loan);

    if (this.createPendingTx !== undefined) {
      this.step = Steps.CreatingLoan;
      this.trackProgressbar();
      return;
    }
    if (this.collateralPendingTx !== undefined) {
      this.step = Steps.CreatingCollateral;
      this.trackProgressbar();
    }
  }

  /**
   * Track progressbar value
   */
  private trackProgressbar() {
    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => {
        if (tx.type === Type.create && tx.tx === this.createPendingTx.tx) {
          this.finishLoanCreation();
          return;
        }
        if (tx.type === Type.createCollateral && tx.tx === this.collateralPendingTx.tx) {
          this.finishCollateralCreation();
          return;
        }
      });
    }
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
