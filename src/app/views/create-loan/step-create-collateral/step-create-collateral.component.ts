import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Utils } from '../../../utils/utils';
import { Currency } from '../../../utils/currencies';
import { Loan } from './../../../models/loan.model';
import { CollateralRequest } from './../../../interfaces/collateral-request';
// App Services
import { ContractsService } from './../../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';
import { EventsService } from './../../../services/events.service';
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-step-create-collateral',
  templateUrl: './step-create-collateral.component.html',
  styleUrls: ['./step-create-collateral.component.scss']
})
export class StepCreateCollateralComponent implements OnInit {

  pageId = 'step-create-collateral';
  currencies: CurrencyItem[];
  form: FormGroup;
  maxCollateralAdjustment = 400;
  @Input() loan: Loan;
  @Input() account: string; // TODO implement
  @Input() createPendingTx: Tx;
  @Input() collateralPendingTx: Tx;
  @Output() updateCollateralRequest = new EventEmitter<CollateralRequest>();

  constructor(
    private spinner: NgxSpinnerService,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.getCurrencies();
  }

  /**
   * Return value with percentage symbol
   * @param value Percentage
   * @return Percentage %
   */
  formatPercentage(value: number) {
    return `${ value } %`;
  }

  /**
   * Estimate the new collateral percentage
   */
  async onAmountChange() {
    this.spinner.show(this.pageId);

    try {
      const { currency, amount } = this.form.value.formUi;
      await this.calculateCollateralPercentage(this.loan, currency, amount);
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide(this.pageId);
    }
  }

  /**
   * Estimate the new collateral amount (when the rate changes)
   */
  async onCurrencyChange() {
    await this.onCollateralAdjustmentChange();
  }

  /**
   * Estimate the new collateral amount
   */
  async onCollateralAdjustmentChange() {
    this.spinner.show(this.pageId);

    try {
      const { currency, collateralAdjustment } = this.form.value.formUi;
      await this.calculateCollateralAmount(this.loan, currency, collateralAdjustment);
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide(this.pageId);
    }
  }

  /**
   * Create form object variables
   */
  private buildForm() {
    const DEFAULT_LIQUIDATION_RATIO = 150;
    const DEFAULT_BALANCE_RATIO = 200;

    this.form = new FormGroup({
      // form to send to the create method
      formCollateral: new FormGroup({
        debtId: new FormControl(null, Validators.required),
        oracle: new FormControl(null, Validators.required),
        amount: new FormControl(null, Validators.required),
        liquidationRatio: new FormControl(DEFAULT_LIQUIDATION_RATIO, Validators.required),
        balanceRatio: new FormControl(DEFAULT_BALANCE_RATIO, Validators.required)
      }),
      // form for handle the ui
      formUi: new FormGroup({
        currency: new FormControl(null, Validators.required),
        amount: new FormControl(null, Validators.required),
        liquidationRatio: new FormControl(DEFAULT_LIQUIDATION_RATIO, Validators.required),
        collateralAdjustment: new FormControl(null, Validators.required)
      })
    });

    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      await this.updateFormUi(formUi);
    });
  }

  /**
   * Detect changes on the UI and update controls
   * @param formUi Form UI values
   * @return new loan state
   */
  private async updateFormUi(formUi) {
    const currency: CurrencyItem = formUi.currency;
    const amount: number = formUi.amount;
    const liquidationRatio: number = formUi.liquidationRatio;
    const collateralAdjustment: number = formUi.collateralAdjustment;

    // set oracle
    if (currency) {
      const oracle: string =
        await this.contractsService.symbolToOracle(currency.symbol) ||
        Utils.address0x;

      this.form.controls.formCollateral.patchValue({ oracle });
    } else {
      this.form.controls.formCollateral.patchValue({ oracle: null });
    }

    // set amount
    if (currency && amount) {
      const { decimals } = new Currency(currency.symbol);
      const amountInWei: BN = Utils.getAmountInWei(amount, decimals);

      this.form.controls.formCollateral.patchValue({
        amount: amountInWei.toString()
      });
    } else {
      this.form.controls.formCollateral.patchValue({ amount: null });
    }

    // set liquidation and balance ratio
    if (liquidationRatio) {
      this.form.controls.formCollateral.patchValue({
        liquidationRatio: this.toRatio(liquidationRatio).toString(),
        balanceRatio: this.toRatio(liquidationRatio).toNumber() + 50
      });
    } else {
      this.form.controls.formCollateral.patchValue({
        liquidationRatio: null,
        balanceRatio: null
      });
    }

    // update collateral adjustment
    const MAX_COLLATERAL_ADJUSTMENT: number = this.maxCollateralAdjustment;
    const { balanceRatio } = this.form.value.formCollateral;
    const minAdjustment: number = this.toPercentage(balanceRatio).toNumber() + 50;

    if (collateralAdjustment < minAdjustment) {
      this.form.controls.formUi.patchValue({
        collateralAdjustment: minAdjustment
      });
      await this.onCollateralAdjustmentChange();
    } else if (collateralAdjustment > MAX_COLLATERAL_ADJUSTMENT) {
      this.form.controls.formUi.patchValue({
        collateralAdjustment: MAX_COLLATERAL_ADJUSTMENT
      });
      await this.onCollateralAdjustmentChange();
    }
  }

  /**
   * Return ratio
   * @param num Percentage %
   * @return Ratio value
   */
  private toRatio (percentage: number): BN {
    const securePercentage: BN = Utils.bn(percentage).mul(Utils.bn(2000));
    const secureRatio = Utils.bn(securePercentage)
        .mul(Utils.pow(2, 32))
        .div(Utils.bn(100));

    return secureRatio.div(Utils.bn(2000));
  }

  /**
   * Return percentage
   * @param num Ratio %
   * @return Percentage
   */
  private toPercentage (ratio: number): BN {
    const secureRatio: BN = Utils.bn(ratio).mul(Utils.bn(2000));
    const securePercentage = Utils.bn(secureRatio)
        .div(Utils.pow(2, 32))
        .mul(Utils.bn(100));

    return securePercentage.div(Utils.bn(2000));
  }

  /**
   * Get available currencies for loan and collateral select
   */
  private getCurrencies() {
    this.currencies = this.currenciesService.getCurrencies();
  }

  /**
   * Calculate required amount in collateral token
   * @param loan Loan
   * @param currency Collateral currency
   * @param percentage Collateral adjustment percentage
   * @return Collateral amount
   */
  private async calculateCollateralAmount(
    loan: Loan,
    currency: CurrencyItem,
    percentage: number
  ) {
    if (!currency || !percentage) {
      return;
    }

    const loanOracle: string = await this.contractsService.symbolToOracle(loan.currency.toString());
    const loanRate: BN | string = await this.contractsService.getRate(loanOracle, loan.currency.decimals);
    const loanAmountInRcn: BN = Utils.bn(loan.amount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, loan.currency.decimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(currency.symbol);
    const collateralDecimals: number = new Currency(currency.symbol).decimals;
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(percentage)
        .mul(Utils.bn(loanAmountInRcn))
        .div(Utils.bn(100));

    const amount: string = Utils.formatAmount(Number(collateralAmountInRcn) / Number(collateralRate));
    this.form.controls.formUi.patchValue({ amount });

    return amount;
  }

  /**
   * Calculate required amount in collateral token
   * @param loan Loan
   * @param currency Collateral currency
   * @param amount Collateral amount
   * @return Collateral percentage
   */
  private async calculateCollateralPercentage(
    loan: Loan,
    currency: CurrencyItem,
    amount: number
  ) {
    if (!currency || !amount) {
      return;
    }
    const loanOracle: string = await this.contractsService.symbolToOracle(loan.currency.toString());
    const loanRate: BN | string = await this.contractsService.getRate(loanOracle, loan.currency.decimals);
    const loanAmountInRcn: BN = Utils.bn(loan.amount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, loan.currency.decimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(currency.symbol);
    const collateralDecimals: number = new Currency(currency.symbol).decimals;
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(collateralRate)
        .mul(Utils.bn(amount).mul(Utils.pow(10, 18)))
        .div(Utils.pow(10, 18));

    const collateralPercentage: BN = Utils.bn(collateralAmountInRcn)
        .mul(Utils.bn(100))
        .div(Utils.bn(loanAmountInRcn));

    const collateralAdjustment: string = Utils.formatAmount(collateralPercentage);
    this.form.controls.formUi.patchValue({ collateralAdjustment });

    return collateralPercentage;
  }
}
