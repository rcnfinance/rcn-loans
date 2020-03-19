import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import * as BN from 'bn.js';
import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
import { environment } from '../../../../environments/environment';
// App Models
import { Utils } from './../../../utils/utils';
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App Services
import { Web3Service } from './../../../services/web3.service';
import { ContractsService } from './../../../services/contracts.service';
import { CollateralService } from './../../../services/collateral.service';
import { CurrenciesService } from './../../../services/currencies.service';
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
        await this.getLoanDetails();
        this.setCollateralAdjustment();
      }

      this.retrievePendingTx();
    }
  }

  /**
   * Get loan parsed data
   */
  async getLoanDetails() {
    const loan: Loan = this.loan;
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    const loanAmount = Utils.bn(loan.currency.fromUnit(this.loan.amount), 10);
    const rcnToken: string = environment.contracts.rcnToken;

    this.loanCurrency = loanCurrency;
    this.loanInRcn = await this.contractsService.getPriceConvertFrom(
      loanCurrency.address,
      rcnToken,
      loanAmount
    );
  }

  /**
   * Set collateral status values
   */
  async setCollateralPanel() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const rcnToken: string = environment.contracts.rcnToken;
    this.collateralAsset = collateralCurrency.symbol;
    this.collateralAmount = web3.utils.fromWei(collateral.amount);
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
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const loan: Loan = this.loan;

    // set loan currency
    this.loanCurrency = loan.currency.toString();

    // set loan to value
    const collateralRatio = this.calculateCollateralRatio();
    this.currentLoanToValue = Utils.formatAmount(String(collateralRatio));

    // set exchange rate
    // TODO: add support for more currencies than rcn
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', this.loanCurrency);
    let rate = await this.getRate(loanCurrency.address, collateral.token);
    rate = web3.utils.fromWei(rate);
    this.currentExchangeRate = Utils.formatAmount(String(rate));

    // set liquidation price
    const liquidationPrice = await this.calculateLiquidationPrice();
    this.currentLiquidationPrice = Utils.formatAmount(String(liquidationPrice));
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  calculateCollateralRatio(): BN {
    return this.collateralService.calculateCollateralRatio(
      this.loanInRcn,
      this.collateralRate,
      this.collateralAmount
    );
  }

  /**
   * Calculate liquidation price
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice(): Promise<BN> {
    return this.collateralService.calculateLiquidationPrice(
      this.loan.id,
      this.collateralRate,
      this.liquidationRatio,
      this.loanInRcn
    );
  }

  /**
   * Get rate in rcn
   * @param loanCurrency Loan currency token address
   * @param collateralAsset Collateral currency token address
   * @return Exchange rate
   */
  async getRate(
    loanCurrency: string,
    collateralAsset: string
  ): Promise<BN> {
    const web3: any = this.web3Service.web3;
    const amount = web3.utils.toWei(Utils.bn(1));

    if (loanCurrency === collateralAsset) {
      return amount;
    }

    const rcnToken: any = environment.contracts.rcnToken;
    const rate = await this.contractsService.getPriceConvertFrom(
      amount,
      collateralAsset,
      rcnToken
    );
    const tokenCost = Utils.bn(rate[0]);
    const etherCost = Utils.bn(rate[1]);

    return tokenCost.isZero() ? etherCost : tokenCost;
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