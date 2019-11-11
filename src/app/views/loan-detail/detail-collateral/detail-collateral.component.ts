import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
// import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
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
  collateralRate: number;
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
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    const loanAmount = new web3.BigNumber(loan.currency.fromUnit(this.loan.amount), 10);
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
    this.collateralAmount = web3.fromWei(collateral.amount);
    this.collateralRate = await this.contractsService.getPriceConvertFrom(
      collateralCurrency.address,
      rcnToken,
      10 ** 18
    );
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
  calculateCollateralRatio(): Number {
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
  async calculateLiquidationPrice(): Promise<Number> {
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
  ): Promise<Number> {
    const web3: any = this.web3Service.web3;
    const amount = web3.toWei(new web3.BigNumber(1));

    if (loanCurrency === collateralAsset) {
      return amount;
    }

    const rcnToken: any = environment.contracts.rcnToken;
    const rate = await this.contractsService.getPriceConvertFrom(
      amount,
      collateralAsset,
      rcnToken
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
    if (this.addPendingTx || this.withdrawPendingTx) {
      return;
    }

    // TODO: open dialog
    console.info(action);
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
}
