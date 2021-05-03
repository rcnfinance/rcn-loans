import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Utils } from 'app/utils/utils';
import { Loan, Engine } from 'app/models/loan.model';
import { Collateral, Status as CollateralStatus } from 'app/models/collateral.model';
import { CollateralRequest } from 'app/interfaces/collateral-request';
// App Services
import { ContractsService } from 'app/services/contracts.service';
import { CollateralService } from 'app/services/collateral.service';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';
import { EventsService } from 'app/services/events.service';
import { ChainService } from 'app/services/chain.service';
import { Tx } from 'app/services/tx.service';

@Component({
  selector: 'app-step-create-collateral',
  templateUrl: './step-create-collateral.component.html',
  styleUrls: ['./step-create-collateral.component.scss']
})
export class StepCreateCollateralComponent implements OnInit, OnChanges {
  pageId = 'step-create-collateral';
  currencies: CurrencyItem[];
  form: FormGroup;
  showSuggestions: boolean;
  collateralSuggestions = [200, 250, 300, 350, 400];
  @Input() loan: Loan;
  @Input() account: string; // TODO implement
  @Input() createPendingTx: Tx;
  @Input() collateralPendingTx: Tx;
  @Output() updateCollateralRequest = new EventEmitter<{
    collateral: Collateral,
    form: CollateralRequest
  }>();
  @Output() createCollateral = new EventEmitter();
  DEFAULT_LIQUIDATION_RATIO = 150;
  DEFAULT_BALANCE_RATIO = 250;
  COLLATERAL_AVERAGE_LOW = 200;
  COLLATERAL_AVERAGE_HIGH = 400;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService,
    private eventsService: EventsService,
    private chainService: ChainService
  ) { }

  async ngOnInit() {
    this.buildForm();
    this.getCurrencies();
    this.updateCollateralMockup();

    const loanId: string = this.route.snapshot.params.id;
    this.autocompleteForm(loanId);

    await this.setDefaultCollateralValues();
  }

  ngOnChanges() {
    if (!this.form || !this.loan) {
      return;
    }

    const { id } = this.loan;
    this.form.controls.formCollateral.patchValue({
      debtId: id
    });
  }

  /**
   * Return collateral ratio slider label
   * @param value Percentage
   * @return Label
   */
  formatCollateralRatio(value: number) {
    return `Collateral Ratio
${ value } %`;
  }

  /**
   * Return safety ratio slider label
   * @param value Percentage
   * @return Label
   */
  formatSafetyRatio(value: number) {
    return `Safety Ratio
${ value } %`;
  }

  /**
   * Return liquidation ratio slider label
   * @param value Percentage
   * @return Label
   */
  formatLiquidationRatio(value: number) {
    return `Liquidation Ratio
${ value } %`;
  }

  /**
   * Estimate the new collateral percentage
   * @param amount Entry amount
   */
  async onAmountChange(amount: number) {
    const { currency, amount: previousAmount } = this.form.value.formUi;
    if (amount === previousAmount) {
      return;
    }

    try {
      this.spinner.show(this.pageId);
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
   * Click on confirm button
   */
  async submit() {
    // validate inputs
    if (!this.form.controls.formCollateral.valid) {
      return this.showMessage('Please check the fields and try again.');
    }

    // validate min amount
    const { COLLATERAL_AVERAGE_LOW } = this;
    const { collateralAdjustment } = this.form.value.formUi;
    if (collateralAdjustment < COLLATERAL_AVERAGE_LOW) {
      return this.showMessage(`This amount is not enough to collateralize your loan. Please increase it until the Collateral Ratio is ${ COLLATERAL_AVERAGE_LOW }% or higher.`);
    }

    this.createCollateral.emit();
  }

  /**
   * Click on 'see suggestions' button
   */
  clickSuggestions() {
    this.showSuggestions = !this.showSuggestions;
  }

  /**
   * Click on 'collateral suggestion' button
   */
  clickCollateralSuggestion(collateralAdjustment: number) {
    this.form.controls.formUi.patchValue({ collateralAdjustment });
    this.onCollateralAdjustmentChange();
  }

  /**
   * Create form object variables
   */
  private buildForm() {
    const { DEFAULT_LIQUIDATION_RATIO, DEFAULT_BALANCE_RATIO } = this;

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

    // listen form changes
    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      await this.updateFormUi(formUi);
    });

    // listen collateral amount control changes
    const groupFormUi: any = this.form.controls.formUi;
    groupFormUi.controls.amount.valueChanges.subscribe(async (amount: number) => {
      await this.onAmountChange(amount);
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
    // const collateralAdjustment: number = formUi.collateralAdjustment;

    // set oracle
    if (currency) {
      const oracle: string =
        await this.contractsService.symbolToOracle(Engine.UsdcEngine, currency.symbol) ||
        Utils.address0x;

      this.form.controls.formCollateral.patchValue({ oracle });
    } else {
      this.form.controls.formCollateral.patchValue({ oracle: null });
    }

    // set amount
    if (currency && amount > 0) {
      const decimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
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
        liquidationRatio: this.collateralService.percentageToRaw(liquidationRatio).toString(),
        balanceRatio: this.collateralService.percentageToRaw(liquidationRatio + 50).toString()
      });
    } else {
      this.form.controls.formCollateral.patchValue({
        liquidationRatio: null,
        balanceRatio: null
      });
    }

    // update collateral adjustment
    /*
    const MAX_COLLATERAL_ADJUSTMENT = 400;
    const { balanceRatio } = this.form.value.formCollateral;
    const minAdjustment: number = this.collateralService.rawToPercentage(balanceRatio).toNumber();

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
    */

    const collateral: CollateralRequest = this.updateCollateralMockup();
    return collateral;
  }

  /**
   * Autocomplete form for handle an existing loan
   * @param loan Loan
   */
  private async autocompleteForm(id?: string) {
    if (!id) {
      return;
    }

    try {
      this.spinner.show(this.pageId);

      const loan: Loan = this.loan;
      const debtId = loan.id;

      this.form.controls.formCollateral.patchValue({ debtId });

      await this.updateFormUi(this.form.value.formUi);
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide(this.pageId);
    }
  }

  /**
   * Get available currencies for loan and collateral select
   */
  private getCurrencies() {
    if (!this.loan) {
      this.currencies = this.currenciesService.getCurrencies();
      return;
    }

    const { config } = this.chainService;
    const { createCollateralCurrencies } = config.currencies;
    const currencies: CurrencyItem[] = this.currenciesService.getCurrenciesByKey('symbol', createCollateralCurrencies);

    // filter loan currency
    const { currency } = this.loan;
    const loanCurrency = currency.symbol;
    const filteredCurrencies = currencies.filter(({ symbol }) => symbol !== loanCurrency);

    this.currencies = filteredCurrencies;
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

    const { engine } = loan;
    const loanOracle: string = await this.contractsService.symbolToOracle(engine, loan.currency.toString());
    const loanDecimals = this.currenciesService.getCurrencyDecimals('symbol', loan.currency.symbol);
    const loanRate: BN | string = await this.contractsService.getRate(loanOracle, loanDecimals);
    const loanAmount: number = loan.descriptor ? loan.descriptor.totalObligation : loan.amount;
    const loanAmountInRcn: BN = Utils.bn(loanAmount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, loanDecimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(engine, currency.symbol);
    const collateralDecimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(percentage)
        .mul(Utils.bn(loanAmountInRcn))
        .div(Utils.bn(100));

    const rawAmount: number = Number(collateralAmountInRcn) / Number(collateralRate);
    const amount = Math.ceil((rawAmount + Number.EPSILON) * 100) / 100;
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
    if (!currency || !amount || amount <= 0) {
      const EMPTY_COLLATERAL_ADJUSTMENT = '0';
      return this.form.controls.formUi.patchValue({
        collateralAdjustment: EMPTY_COLLATERAL_ADJUSTMENT
      });
    }

    const collateralDecimals = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
    const collateralAmountInWei: BN = Utils.getAmountInWei(amount, collateralDecimals);
    const collateralPercentage = await this.collateralService.calculateCollateralPercentage(
      loan,
      currency,
      collateralAmountInWei
    );

    const collateralAdjustment: number = Math.round(Number(collateralPercentage));
    this.form.controls.formUi.patchValue({ collateralAdjustment });

    return collateralPercentage;
  }

  /**
   * Set the first currency as selected and collateral adjustment = balance
   * ratio
   */
  private async setDefaultCollateralValues() {
    const currency: CurrencyItem = this.currencies[0];
    this.form.controls.formUi.patchValue({
      currency
    });

    const { DEFAULT_BALANCE_RATIO } = this;
    this.form.controls.formUi.patchValue({
      collateralAdjustment: DEFAULT_BALANCE_RATIO
    });

    await this.onCollateralAdjustmentChange();
  }

  /**
   * Update collateral model
   * @return CollateralRequest
   */
  private updateCollateralMockup(): CollateralRequest {
    if (!this.form.valid) {
      return;
    }

    const form = this.form.value;
    const { debtId, oracle, amount, liquidationRatio, balanceRatio } = form.formCollateral;
    const request: CollateralRequest = {
      debtId,
      oracle,
      amount,
      liquidationRatio,
      balanceRatio
    };

    const { currency } = form.formUi;
    const token: string = currency.address;

    const collateral: Collateral = new Collateral(
      null,
      debtId,
      oracle,
      token,
      amount,
      liquidationRatio,
      balanceRatio,
      CollateralStatus.Created
    );

    this.updateCollateralRequest.emit({
      form: request,
      collateral
    });
    return request;
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

  /**
   * Get submit button text according to the loan creation status
   * @return Button text
   */
  get confirmButtonText(): string {
    const tx: Tx = this.collateralPendingTx;
    if (tx === undefined) {
      return 'Confirm';
    }
    if (tx.confirmed) {
      return 'Confirmed';
    }
    return 'Confirming';
  }
}
