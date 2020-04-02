import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Utils } from '../../../utils/utils';
import { Currency } from '../../../utils/currencies';
// App models
import { Loan } from '../../../models/loan.model';
import { Collateral } from '../../../models/collateral.model';
// App services
import { EventsService } from '../../../services/events.service';
import { ContractsService } from '../../../services/contracts.service';
import { CollateralService } from '../../../services/collateral.service';
import { CurrenciesService, CurrencyItem } from '../../../services/currencies.service';

@Component({
  selector: 'app-collateral-add-form',
  templateUrl: './collateral-add-form.component.html',
  styleUrls: ['./collateral-add-form.component.scss']
})
export class CollateralAddFormComponent implements OnInit {
  @Input() loan: Loan;
  @Input() loading: boolean;
  @Input() account: string;
  @Output() submitAdd = new EventEmitter<BN>();

  form: FormGroup;
  shortAccount: string | BN;

  constructor(
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private eventsService: EventsService,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.buildForm();

    try {
      this.spinner.show();
      await this.completeForm();
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Emitted when form is submitted
   * @param form Form group
   * @fires submitAdd
   */
  onSubmit() {
    try {
      const form: FormGroup = this.form;
      const { collateralRatio, balanceRatio, currency } = form.value.formRatios;
      const { entryAmount } = form.value.formUi;
      const { amount } = form.value.formCollateral;
      const { decimals } = new Currency(currency.symbol);

      if (this.loading) {
        return;
      }
      if (collateralRatio < balanceRatio) {
        this.showMessage(`The collateral is too low, make sure it is greater than ${ balanceRatio }%`);
        return;
      }
      if (Utils.bn(amount).lte(Utils.bn(0))) {
        this.showMessage(`The collateral amount must be greater than 0`);
        return;
      }

      const entryAmountInWei: BN = Utils.getAmountInWei(entryAmount, decimals);
      this.submitAdd.emit(entryAmountInWei);
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide();
    }
  }

  private buildForm() {
    this.form = new FormGroup({
      formCollateral: new FormGroup({
        id: new FormControl(null, Validators.required),
        token: new FormControl(null, Validators.required),
        amount: new FormControl(null, Validators.required),
        account: new FormControl(null, Validators.required)
      }),
      formRatios: new FormGroup({
        liquidationRatio: new FormControl(null, Validators.required),
        balanceRatio: new FormControl(null, Validators.required),
        collateralRatio: new FormControl(null, Validators.required),
        currency: new FormControl(null, Validators.required),
        liquidationPrice: new FormControl(null, Validators.required),
        formattedAmount: new FormControl(null, Validators.required)
      }),
      formUi: new FormGroup({
        entryAmount: new FormControl(null, Validators.required)
      })
    });
  }

  private async completeForm() {
    const account: string = this.account;
    const loan: Loan = this.loan;
    const { id, token, amount, balanceRatio, liquidationRatio }: Collateral = loan.collateral;
    const liquidationPercentage: string =
      this.collateralService.rawToPercentage(liquidationRatio).toString();
    const balancePercentage: string =
      this.collateralService.rawToPercentage(balanceRatio).toString();
    const currency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const collateralPercentage =
      await this.calculateCollateralPercentage(loan, currency, amount);

    const decimals: number = new Currency(currency.symbol).decimals;
    const formattedAmount: number = this.formatAmount(amount, decimals);
    const liquidationPrice: BN = Utils.bn(liquidationPercentage)
        .mul(Utils.bn(amount))
        .div(Utils.bn(collateralPercentage));
    const formattedLiquidationPrice: number = liquidationPrice as any / 10 ** decimals;

    this.form.controls.formCollateral.patchValue({
      id,
      token,
      amount,
      account
    });

    this.form.controls.formRatios.patchValue({
      liquidationRatio: liquidationPercentage,
      balanceRatio: balancePercentage,
      collateralRatio: collateralPercentage,
      liquidationPrice: formattedLiquidationPrice,
      currency,
      formattedAmount
    });

    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      try {
        this.spinner.show();
        await this.updateFormUi(formUi);
      } catch (err) {
        this.eventsService.trackError(err);
      } finally {
        this.spinner.hide();
      }
    });
  }

  /**
   * Detect changes on the UI and update controls
   * @param formUi Form UI values
   * @return new loan state
   */
  private async updateFormUi(formUi: {
    entryAmount: number
  }) {
    const loan: Loan = this.loan;
    const collateral: Collateral = loan.collateral;

    const { amount } = collateral;
    const { entryAmount } = formUi;
    const { currency } = this.form.value.formRatios;

    if (entryAmount && entryAmount > 0) {
      const decimals: number = new Currency(currency.symbol).decimals;
      const newAmount = Utils.getAmountInWei(entryAmount, decimals)
          .add(Utils.bn(amount))
          .toString();

      this.form.controls.formCollateral.patchValue({
        amount: newAmount
      });

      const formattedAmount = Utils.formatAmount(newAmount as any / 10 ** decimals);
      const collateralRatio: string =
        await this.calculateCollateralPercentage(loan, currency, newAmount);

      this.form.controls.formRatios.patchValue({
        formattedAmount,
        collateralRatio
      });
    } else {
      this.form.controls.formCollateral.patchValue({
        amount
      });

      const originalAmount = Utils.formatAmount(
        new Currency(currency.symbol).fromUnit(amount)
      );
      const originalCollateralRatio: string =
        await this.calculateCollateralPercentage(loan, currency, amount);

      this.form.controls.formRatios.patchValue({
        formattedAmount: originalAmount,
        collateralRatio: originalCollateralRatio
      });
    }
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
   * Return formatted amount
   * @param amount Amount in wei
   * @param decimals Decimals
   * @return Formatted amount
   */
  private formatAmount(amount: number | string | BN, decimals: number) {
    return (amount as number / 10 ** decimals);
  }

  /**
   * Calculate required amount in collateral token
   * @param loan Loan
   * @param currency Collateral currency
   * @param amount Collateral amount in wei
   * @return Collateral percentage
   */
  private async calculateCollateralPercentage(
    loan: Loan,
    currency: CurrencyItem,
    amount: BN | string
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
        .mul(Utils.bn(amount))
        .div(Utils.pow(10, 18));

    const collateralPercentage: BN = Utils.bn(collateralAmountInRcn)
        .mul(Utils.bn(100))
        .div(Utils.bn(loanAmountInRcn));

    const collateralRatio: string = Utils.formatAmount(collateralPercentage);

    return collateralRatio;
  }

  /**
   * Get submit button text
   * @return Button text
   */
  get submitButtonText(): string {
    if (!this.loading) {
      return 'Add';
    }
    return 'Adding...';
  }
}
