import { Component, OnInit, OnChanges, Input } from '@angular/core';
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

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  @Input() collateral: Collateral;

  collateralAmount: string;
  collateralAsset: string;
  liquidationRatio: string;
  balanceRatio: string;

  loanCurrency: string;
  currentLoanToValue: string;
  currentExchangeRate: string;
  currentLiquidationPrice: string;

  constructor(
    private dialog: MatDialog,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes) {
    if (changes.collateral && changes.collateral.currentValue) {
      this.setCollateralPanel();
      this.setCollateralAdjustment();
    }
  }

  /**
   * Set collateral status values
   */
  setCollateralPanel() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    this.collateralAsset = collateralCurrency.symbol;
    this.collateralAmount = Utils.formatAmount(web3.fromWei(collateral.amount));
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
    let debt = await this.contractsService.getClosingObligation(loan.id);
    let collateralAmount = new web3.BigNumber(collateral.amount);
    debt = web3.fromWei(debt);
    collateralAmount = web3.fromWei(collateralAmount);

    const loanToValue = collateralAmount.div(debt);
    this.currentLoanToValue = Utils.formatAmount(loanToValue);

    // set exchange rate
    // TODO: add support for more currencies than rcn
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', this.loanCurrency);
    let rate = await this.getRate(loanCurrency.address, collateral.token);
    rate = web3.fromWei(rate);
    this.currentExchangeRate = Utils.formatAmount(rate);

    // set liquidation price
    const liquidationRatio = new web3.BigNumber(this.liquidationRatio);
    const liquidationPrice = (liquidationRatio.mul(debt)).div(100);
    this.currentLiquidationPrice = Utils.formatAmount(liquidationPrice);
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
    const rate = await this.contractsService.getCostInToken(
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
  async openDialog(action: string) {
    const dialogConfig: MatDialogConfig = {
      data: {
        loan: this.loan,
        collateral: this.collateral,
        action
      }
    };

    this.dialog.open(DialogCollateralComponent, dialogConfig);
  }
}
