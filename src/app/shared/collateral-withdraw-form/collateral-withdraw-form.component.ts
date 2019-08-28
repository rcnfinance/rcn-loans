import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
// App services
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { CollateralService } from '../../services/collateral.service';
import { CurrenciesService } from '../../services/currencies.service';

@Component({
  selector: 'app-collateral-withdraw-form',
  templateUrl: './collateral-withdraw-form.component.html',
  styleUrls: ['./collateral-withdraw-form.component.scss']
})
export class CollateralWithdrawFormComponent implements OnInit {
  @Input() loan: Loan;
  @Input() collateral: Collateral;
  @Output() submitWithdraw = new EventEmitter<number>();

  form: FormGroup;
  collateralAmount: string;
  collateralAsset: any;
  collateralSymbol: string;
  collateralRate: string;
  collateralInRcn: string;
  loanCurrency: any;
  loanRate: string;
  loanInRcn: string;
  liquidationRatio: number;
  liquidationPrice: string;
  collateralRatio: number;
  balanceRatio: number;
  shortAccount: string;
  maxWithdraw: string;

  estimatedCollateralAmount: string;
  estimatedCollateralRatio: number;

  constructor(
    private snackBar: MatSnackBar,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.createFormControls();
    this.getAccount();
    await this.getLoanDetails();
    await this.getCollateralDetails();
  }

  /**
   * Create form controls and define values
   */
  createFormControls() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.min(0)
      ])
    });
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
   * Get collateral parsed data
   */
  async getCollateralDetails() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const currencyDecimals = new Currency(collateralCurrency.symbol);
    const collateralAmount = new web3.BigNumber(currencyDecimals.fromUnit(collateral.amount), 10);
    this.collateralAmount = Utils.formatAmount(collateralAmount);
    this.collateralAsset = collateralCurrency;
    this.collateralSymbol = collateralCurrency.symbol;
    this.collateralRate = await this.contractsService.getCostInToken(1, collateralCurrency.address);
    this.collateralInRcn = await this.contractsService.getCostInToken(collateralAmount, collateralCurrency.address);
    this.balanceRatio = collateral.balanceRatio / 100;
    this.liquidationRatio = collateral.liquidationRatio / 100;
    this.collateralRatio = this.calculateCollateralRatio();

    const liquidationPrice = await this.calculateLiquidationPrice();
    this.liquidationPrice = Utils.formatAmount(liquidationPrice);

    const maxWithdraw = this.calculateMaxWithdraw();
    this.maxWithdraw = Utils.formatAmount(maxWithdraw);
  }

  /**
   * Get short account address
   */
  async getAccount() {
    const web3: any = this.web3Service.web3;
    let account = await this.web3Service.getAccount();
    account = web3.toChecksumAddress(account);

    this.shortAccount = Utils.shortAddress(account);
  }

  /**
   * Update collateral values when currency is updated
   */
  onAmountChange() {
    const form: FormGroup = this.form;

    if (!form.valid) {
      this.estimatedCollateralAmount = null;
      return;
    }

    const estimatedAmount = this.calculateAmount(form);
    this.estimatedCollateralAmount = Utils.formatAmount(estimatedAmount);

    const newCollateralRatio = this.calculateCollateralRatio();
    this.estimatedCollateralRatio = newCollateralRatio;
  }

  /**
   * Emitted when form is submitted
   * @param form Form group
   * @fires submitWithdraw
   */
  onSubmit(form: FormGroup) {
    const collateralRatio = Number(this.estimatedCollateralRatio);
    const balanceRatio = Number(this.balanceRatio);
    const amount = form.value.amount;

    if (collateralRatio < balanceRatio) {
      this.showMessage(`The collateral is too low, make sure it is greater than ${ balanceRatio }%`);
      return;
    }
    if (amount <= 0) {
      this.showMessage(`The collateral amount must be greater than 0`);
      return;
    }

    this.submitWithdraw.emit(amount);
  }

  /**
   * Set max withdraw amount
   */
  setMaxWithdraw() {
    const web3: any = this.web3Service.web3;
    const maxWithdraw: number = new web3.BigNumber(this.maxWithdraw);

    this.form.patchValue({
      amount: maxWithdraw
    });

    this.onAmountChange();
  }

  /**
   * Calculate liquidation price
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice() {
    return this.collateralService.calculateLiquidationPrice(
      this.loan.id,
      this.collateralRate,
      this.liquidationRatio,
      this.loanInRcn
    );
  }

  /**
   * Calculate the new collateral amount
   * @param form Form group
   * @return Collateral amount
   */
  private calculateAmount(form: FormGroup) {
    const web3: any = this.web3Service.web3;
    const amountToWithdraw: number = form.value.amount || 0;
    const collateralAmount = new web3.BigNumber(this.collateralAmount);

    try {
      const estimated: number = collateralAmount.sub(amountToWithdraw);
      if (estimated < 0) {
        return 0;
      }
      return estimated;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  private calculateCollateralRatio() {
    return this.collateralService.calculateCollateralRatio(
      this.loanInRcn,
      this.collateralRate,
      this.estimatedCollateralAmount || this.collateralAmount
    );
  }

  /**
   * Calculate the max withdraw amount
   * @return Max amount to withdraw
   */
  private calculateMaxWithdraw() {
    const web3: any = this.web3Service.web3;
    const balanceRatio = this.balanceRatio;
    const collateralRatio = this.calculateCollateralRatio();
    const diffRatio = collateralRatio.sub(balanceRatio);

    if (diffRatio <= 0) {
      return 0;
    }

    const collateralAmount = this.collateralInRcn;
    const collateralRate = this.collateralRate;
    const diffAmount = new web3.BigNumber(diffRatio).mul(collateralAmount).div(collateralRatio);

    return diffAmount.div(collateralRate);
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
}
