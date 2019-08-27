import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
import { environment } from '../../../../environments/environment';
// App Models
import { Utils } from './../../../utils/utils';
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App Services
import { Web3Service } from './../../../services/web3.service';
import { ContractsService } from './../../../services/contracts.service';
import { CurrenciesService } from './../../../services/currencies.service';
import { Tx, TxService, Type } from './../../../tx.service';

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
  collateralRate: number;
  liquidationRatio: string;
  balanceRatio: string;

  loanCurrency; // FIXME: neccesary?
  loanRate: number; // FIXME: neccesary?
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
    private currenciesService: CurrenciesService,
    private txService: TxService
  ) { }

  ngOnInit() {
    this.txService.subscribeConfirmedTx(async (tx: Tx) => {
      if (tx.type === Type.addCollateral || tx.type === Type.withdrawCollateral) {
        if (this.addPendingTx || this.withdrawPendingTx) {
          this.updateCollateral.emit();
        }
        this.retrievePendingTx();
      }
    });
  }

  async ngOnChanges(changes) {
    if (changes.collateral && changes.collateral.currentValue) {
      await this.setCollateralPanel();

      if (this.loan.debt) {
        await this.getLoanDetails();
        this.setCollateralAdjustment();
        this.retrievePendingTx();
      }
    }
  }

  /**
   * Get loan parsed data
   */
  async getLoanDetails() {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    const loanAmount = new web3.BigNumber(loan.currency.fromUnit(this.loan.amount), 10);

    this.loanCurrency = loanCurrency;
    this.loanRate = await this.contractsService.getCostInToken(1, loanCurrency.address);
    this.loanInRcn = await this.contractsService.getCostInToken(loanAmount, loanCurrency.address);
  }

  /**
   * Set collateral status values
   */
  async setCollateralPanel() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    this.collateralAsset = collateralCurrency.symbol;
    this.collateralAmount = Utils.formatAmount(web3.fromWei(collateral.amount));
    this.collateralRate = await this.contractsService.getCostInToken(1, collateralCurrency.address);
    this.liquidationRatio = Utils.formatAmount(collateral.liquidationRatio / 100, 0);
    this.balanceRatio = Utils.formatAmount(collateral.balanceRatio / 100, 0);
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
    this.currentLoanToValue = Utils.formatAmount(collateralRatio);

    // set exchange rate
    // TODO: add support for more currencies than rcn
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', this.loanCurrency);
    let rate = await this.getRate(loanCurrency.address, collateral.token);
    rate = web3.fromWei(rate);
    this.currentExchangeRate = Utils.formatAmount(rate);

    // set liquidation price
    const liquidationPrice = await this.calculateLiquidationPrice();
    this.currentLiquidationPrice = Utils.formatAmount(liquidationPrice);
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  calculateCollateralRatio() {
    const web3: any = this.web3Service.web3;
    const loanInRcn = new web3.BigNumber(this.loanInRcn);
    const collateralInRcn = new web3.BigNumber(this.collateralRate).mul(this.collateralAmount);

    try {
      const collateralRatio = collateralInRcn.mul(100).div(loanInRcn);
      return collateralRatio;
    } catch (e) {
      return null;
    }
  }

  /**
   * Calculate liquidation price
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice() {
    const web3: any = this.web3Service.web3;
    const collateralRate = new web3.BigNumber(this.collateralRate);
    const liquidationRatio = this.liquidationRatio;
    let debtInRcn = await this.contractsService.getClosingObligation(this.loan.id);
    debtInRcn = new web3.BigNumber(debtInRcn || 0);

    try {
      let liquidationPrice = new web3.BigNumber(liquidationRatio).mul(debtInRcn).div(100);
      liquidationPrice = liquidationPrice.div(collateralRate);

      return liquidationPrice;
    } catch (e) {
      return null;
    }
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
  ) {
    const web3: any = this.web3Service.web3;
    const amount = web3.toWei(new web3.BigNumber(1));

    if (loanCurrency === collateralAsset) {
      return amount;
    }

    const uniswapProxy: any = environment.contracts.converter.uniswapProxy;
    const token: any = environment.contracts.rcnToken;
    const rate = await this.contractsService.getCost(
      amount,
      uniswapProxy,
      collateralAsset,
      token
    );
    const tokenCost = new web3.BigNumber(rate[0]);
    const etherCost = new web3.BigNumber(rate[1]);

    return tokenCost.isZero() ? etherCost : tokenCost;
  }

  /**
   * Open add more / withdraw collateral dialog
   * @param action Add or Withdraw
   */
  async openDialog(action: 'add' | 'withdraw') {
    switch (action) {
      case 'add':
        if (this.addPendingTx) return;
        break;

      case 'withdraw':
        if (this.withdrawPendingTx) return;
        break;

      default:
        break;
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
      () => this.retrievePendingTx()
    );
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
}
