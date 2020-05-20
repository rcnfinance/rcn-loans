import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import * as BN from 'bn.js';
import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
import { environment } from '../../../../environments/environment';
// App Models
import { Utils } from './../../../utils/utils';
import { Currency } from '../../../utils/currencies';
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App Services
import { Web3Service } from './../../../services/web3.service';
import { ContractsService } from './../../../services/contracts.service';
import { CollateralService } from './../../../services/collateral.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';
import { Tx, TxService } from './../../../services/tx.service';

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
  collateralRate: string;
  liquidationRatio: string;
  balanceRatio: string;

  loanCurrency;
  loanInRcn: string;
  currentLoanToValue: string;
  currentExchangeRate: string;
  currentLiquidationPrice: string;

  addPendingTx: Tx;
  withdrawPendingTx: Tx;

  constructor(
    private dialog: MatDialog,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService,
    private txService: TxService
  ) { }

  ngOnInit() {
    this.trackCollateralTx();
  }

  async ngOnChanges(changes) {
    if (changes.collateral && changes.collateral.currentValue) {
      await this.setCollateralPanel();

      if (this.loan.debt) {
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
    const collateralDecimals = new Currency(collateralCurrency.symbol).decimals;
    const rcnToken: string = environment.contracts.rcnToken;
    this.collateralAsset = collateralCurrency.symbol;
    this.collateralAmount = Utils.formatAmount(collateral.amount as any / 10 ** collateralDecimals);
    this.collateralRate = await this.contractsService.getPriceConvertFrom(
      collateralCurrency.address,
      rcnToken,
      Utils.pow(10, 18).toString()
    );

    const liquidationRatio = this.toPercentage(Number(collateral.liquidationRatio));
    const balanceRatio = this.toPercentage(Number(collateral.balanceRatio));
    this.liquidationRatio = Utils.formatAmount(liquidationRatio);
    this.balanceRatio = Utils.formatAmount(balanceRatio);
  }

  /**
   * Set collateral adjustment values
   */
  async setCollateralAdjustment() {
    const loan: Loan = this.loan;

    // set loan currency
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    this.loanCurrency = loanCurrency;

    // set loan to value
    const collateralRatio = await this.calculateCollateralRatio();
    this.currentLoanToValue = Utils.formatAmount(String(collateralRatio));

    // set exchange rate
    // TODO: add support for more currencies than rcn
    const rate = await this.getRate();
    this.currentExchangeRate = rate;

    // set liquidation price
    const liquidationPrice = await this.calculateLiquidationPrice();
    this.currentLiquidationPrice = Utils.formatAmount(liquidationPrice);
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
   * Calculate liquidation price
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice(): Promise<number> {
    const loan: Loan = this.loan;
    const collateral: Collateral = this.collateral;
    const { liquidationRatio, amount, token } = collateral;
    const currency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const liquidationPercentage: string =
      this.collateralService.rawToPercentage(liquidationRatio).toString();
    const collateralPercentage =
      await this.collateralService.calculateCollateralPercentage(loan, currency, amount);

    const decimals: number = new Currency(currency.symbol).decimals;
    const liquidationPrice: BN = Utils.bn(liquidationPercentage)
        .mul(Utils.bn(amount))
        .div(Utils.bn(collateralPercentage));
    const formattedLiquidationPrice: number =
      (liquidationPrice as any / 10 ** decimals);

    return formattedLiquidationPrice;
  }

  /**
   * Get rate in rcn
   * @return Exchange rate
   */
  async getRate(): Promise<string> {
    const loan: Loan = this.loan;
    const { decimals } = loan.currency;
    const amount = Utils.getAmountInWei(1, decimals);
    const { token } = this.collateral;
    const { symbol } = this.loan.currency;
    const loanCurrency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('symbol', symbol);

    if (token === loanCurrency.address) {
      return amount.toString();
    }

    const rate = await this.contractsService.getPriceConvertFrom(
      loanCurrency.address,
      token,
      amount.toString()
    );

    const formattedRate = Utils.formatAmount(1 / loan.currency.fromUnit(rate));
    return formattedRate;
  }

  /**
   * Open add more / withdraw collateral dialog
   * @param action Add or Withdraw
   */
  async openDialog(action: 'add' | 'withdraw') {
    if (this.addPendingTx || this.withdrawPendingTx) {
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
   * Track confirmed add or withdraw collateral tx
   */
  trackCollateralTx() {
    this.txService.subscribeConfirmedTx(async (tx: Tx) => {
      if (this.collateralService.isCurrentCollateralTx(tx, this.collateral.id)) {
        this.updateCollateral.emit({
          type: tx.type,
          amount: tx.data.collateralAmount
        });
        this.retrievePendingTx();
      }
    });
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.addPendingTx = this.txService.getLastPendingAddCollateral(this.collateral);
    this.withdrawPendingTx = this.txService.getLastPendingWithdrawCollateral(this.collateral);
  }

  /**
   * Get add collateral button text
   * @return Button text
   */
  get addButtonText(): string {
    return 'Add more';
  }

  /**
   * Get add collateral button text
   * @return Button text
   */
  get withdrawButtonText(): string {
    return 'Withdraw';
  }

  /**
   * Return percentage
   * @param num Ratio %
   * @return Percentage
   */
  private toPercentage (ratio: number): BN {
    // TODO: move to utils
    const secureRatio: BN = Utils.bn(ratio).mul(Utils.bn(2000));
    const securePercentage = Utils.bn(secureRatio)
        .div(Utils.pow(2, 32))
        .mul(Utils.bn(100));

    return securePercentage.div(Utils.bn(2000));
  }
}
