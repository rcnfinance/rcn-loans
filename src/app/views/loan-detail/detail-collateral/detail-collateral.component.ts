import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { DialogCollateralComponent } from 'app/dialogs/dialog-collateral/dialog-collateral.component';
import { Type } from 'app/interfaces/tx';
import { Tx } from 'app/models/tx.model';
import { Utils } from 'app/utils/utils';
import { Loan } from 'app/models/loan.model';
import { Collateral } from 'app/models/collateral.model';
// App Services
import { TxService } from 'app/services/tx.service';
import { CollateralService } from 'app/services/collateral.service';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  @Input() collateral: Collateral;
  @Input() canAdjust: boolean;
  @Output() updateCollateral = new EventEmitter();

  collateralAmount: string;
  collateralAsset: string;
  collateralInRcn: string;
  liquidationRatio: string;
  balanceRatio: string;

  loanCurrency;
  loanInRcn: string;
  currentLoanToValue: string;
  currentExchangeRate: string;
  currentLiquidationPrice: string;

  private addTxSubscription: Subscription;
  private addTx: Tx;
  private withdrawTxSubscription: Subscription;
  private withdrawTx: Tx;

  constructor(
    private dialog: MatDialog,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService,
    private txService: TxService
  ) { }

  ngOnInit() {
    this.retrievePendingTx();
  }

  async ngOnChanges(changes) {
    if (changes.collateral && changes.collateral.currentValue) {
      await this.setCollateralPanel();

      const { amount } = changes.collateral.currentValue;
      if (Number(amount)) {
        this.setCollateralAdjustment();
      }

      this.retrievePendingTx();
    }
  }

  /**
   * Set collateral status values
   */
  async setCollateralPanel() {
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const collateralDecimals = this.currenciesService.getCurrencyDecimals('symbol', collateralCurrency.symbol);
    this.collateralAsset = collateralCurrency.symbol;
    this.collateralAmount = Utils.formatAmount(collateral.amount as any / 10 ** collateralDecimals);

    const liquidationRatio = this.collateralService.rawToPercentage(Number(collateral.liquidationRatio));
    const balanceRatio = this.collateralService.rawToPercentage(Number(collateral.balanceRatio));
    this.liquidationRatio = Utils.formatAmount(liquidationRatio);
    this.balanceRatio = Utils.formatAmount(balanceRatio);
  }

  /**
   * Set collateral adjustment values
   */
  async setCollateralAdjustment() {
    const loan: Loan = this.loan;
    const DECIMALS_TO_SHOW = 4;

    // set loan currency
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    this.loanCurrency = loanCurrency;

    // set loan to value
    const collateralRatio = await this.calculateCollateralRatio();
    this.currentLoanToValue = Utils.formatAmount(String(collateralRatio));

    // set exchange rate
    const rate = await this.collateralService.getCollateralRate(this.loan, this.collateral);
    this.currentExchangeRate = Utils.formatAmount(1 / (rate as any), DECIMALS_TO_SHOW);

    // set liquidation price
    const liquidationPrice = await this.collateralService.calculateLiquidationPrice(this.loan, this.collateral);
    this.currentLiquidationPrice = Utils.formatAmount(liquidationPrice, DECIMALS_TO_SHOW);
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  async calculateCollateralRatio(): Promise<string> {
    const loan: Loan = this.loan;
    const { token, amount } = loan.collateral;
    const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    return await this.collateralService.calculateCollateralPercentage(
      loan,
      currency,
      amount
    );
  }

  /**
   * Open add more / withdraw collateral dialog
   * @param action Add or Withdraw
   */
  async openDialog(action: 'add' | 'withdraw') {
    const { addTx, withdrawTx } = this;
    if (addTx || withdrawTx) {
      return;
    }

    const dialogConfig: MatDialogConfig = {
      data: {
        loan: this.loan,
        collateral: this.collateral,
        action
      }
    };

    const dialogRef = this.dialog.open(DialogCollateralComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => {
        this.retrievePendingTx();
      }
    );
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    if (!this.collateral) {
      return;
    }

    const { id } = this.collateral;
    this.addTx = this.txService.getLastTxByType(Type.addCollateral, 'collateralId', id);
    this.withdrawTx = this.txService.getLastTxByType(Type.withdrawCollateral, 'collateralId', id);

    if (this.addTx) {
      this.trackAddTx();
    }
    if (this.withdrawTx) {
      this.trackWithdrawTx();
    }
  }

  /**
   * Track collateral add TX
   */
  private trackAddTx() {
    if (this.addTxSubscription) {
      this.addTxSubscription.unsubscribe();
    }

    const { hash } = this.addTx;
    this.addTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.handleConfirmedTx(tx);
        this.addTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.addTxSubscription.unsubscribe();
      }
    });
  }

  /**
   * Track collateral withdraw TX
   */
  private trackWithdrawTx() {
    if (this.withdrawTxSubscription) {
      this.withdrawTxSubscription.unsubscribe();
    }

    const { hash } = this.withdrawTx;
    this.withdrawTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.handleConfirmedTx(tx);
        this.addTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.addTxSubscription.unsubscribe();
      }
    });
  }

  /**
   * Handle TX confirmed
   * @param tx TX
   * @fires updateCollateral New collateral amount and action
   */
  private handleConfirmedTx(tx: Tx) {
    const { type, data } = tx;
    const { collateralAmount } = data;
    this.updateCollateral.emit({ type, amount: collateralAmount });
  }

  /**
   * Get add collateral button text
   * @return Button text
   */
  get addButtonText(): string {
    return 'Deposit';
  }

  /**
   * Get add collateral button text
   * @return Button text
   */
  get withdrawButtonText(): string {
    return 'Withdraw';
  }

  /**
   * Get collateral TX
   * @return TX
   */
  get addPendingTx() {
    return this.addTx;
  }

  /**
   * Get collateral TX
   * @return TX
   */
  get withdrawPendingTx() {
    return this.withdrawTx;
  }
}
