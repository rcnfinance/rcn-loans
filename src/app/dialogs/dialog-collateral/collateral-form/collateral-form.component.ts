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
import { CollateralService } from '../../../services/collateral.service';
import { CurrenciesService, CurrencyItem } from '../../../services/currencies.service';

enum DialogType {
  CollateralAdd = 'add',
  CollateralWithdraw = 'withdraw'
}

@Component({
  selector: 'app-collateral-form',
  templateUrl: './collateral-form.component.html',
  styleUrls: ['./collateral-form.component.scss']
})
export class CollateralFormComponent implements OnInit {

  @Input() dialogType: DialogType;
  @Input() loan: Loan;
  @Input() loading: boolean;
  @Input() shortAccount: string;
  @Output() submitAdd = new EventEmitter<BN>();
  @Output() submitWithdraw = new EventEmitter<BN>();

  form: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private eventsService: EventsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.buildForm();

    try {
      await this.completeForm();

      this.spinner.show();
      await this.calculateMaxWithdraw();
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Emitted when form is submitted
   * @param form Form group
   * @fires submitWithdraw
   */
  onSubmit() {
    try {
      const form: FormGroup = this.form;
      const { collateralRatio, balanceRatio, currency } = form.value.formRatios;
      const { entryAmount } = form.value.formUi;
      const { decimals } = new Currency(currency.symbol);

      if (this.loading) {
        return;
      }
      if (collateralRatio < balanceRatio) {
        this.showMessage(`The collateral is too low, make sure it is greater than ${ balanceRatio }%`);
        return;
      }
      if (entryAmount <= 0) {
        this.showMessage(`The collateral amount must be greater than 0`);
        return;
      }

      const entryAmountInWei: BN = Utils.getAmountInWei(entryAmount, decimals);
      const dialogType = this.dialogType;

      if (dialogType === DialogType.CollateralAdd) {
        this.submitAdd.emit(entryAmountInWei);
      } else {
        this.submitWithdraw.emit(entryAmountInWei);
      }
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Set max withdraw amount
   */
  clickMaxWithdraw() {
    const { maxWithdraw } = this.form.value.formRatios;
    this.form.controls.formUi.patchValue({
      entryAmount: maxWithdraw
    });
  }

  private buildForm() {
    this.form = new FormGroup({
      formCollateral: new FormGroup({
        id: new FormControl(null, Validators.required),
        token: new FormControl(null, Validators.required),
        amount: new FormControl(null, Validators.required)
      }),
      formRatios: new FormGroup({
        liquidationRatio: new FormControl(null, Validators.required),
        balanceRatio: new FormControl(null, Validators.required),
        collateralRatio: new FormControl(null, Validators.required),
        currency: new FormControl(null, Validators.required),
        liquidationPrice: new FormControl(null, Validators.required),
        formattedAmount: new FormControl(null, Validators.required),
        maxWithdraw: new FormControl(null, Validators.required)
      }),
      formUi: new FormGroup({
        entryAmount: new FormControl(null, Validators.required)
      })
    });
  }

  private async completeForm() {
    const loan: Loan = this.loan;
    const { id, token, amount, balanceRatio, liquidationRatio }: Collateral = loan.collateral;
    const liquidationPercentage: string =
      this.collateralService.rawToPercentage(liquidationRatio).toString();
    const balancePercentage: string =
      this.collateralService.rawToPercentage(balanceRatio).toString();
    const currency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const collateralPercentage =
      await this.collateralService.calculateCollateralPercentage(loan, currency, amount);

    const decimals: number = new Currency(currency.symbol).decimals;
    const formattedAmount: string = Utils.formatAmount(this.formatAmount(amount, decimals));
    const liquidationPrice: BN = Utils.bn(liquidationPercentage)
        .mul(Utils.bn(amount))
        .div(Utils.bn(collateralPercentage));
    const formattedLiquidationPrice: string =
      Utils.formatAmount(this.formatAmount(liquidationPrice, decimals));

    this.form.controls.formCollateral.patchValue({
      id,
      token,
      amount
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
    const dialogType = this.dialogType;

    if (entryAmount && entryAmount > 0) {
      const decimals: number = new Currency(currency.symbol).decimals;

      let newAmount: string;

      if (dialogType === DialogType.CollateralAdd) {
        newAmount = Utils.getAmountInWei(entryAmount, decimals)
            .add(Utils.bn(amount))
            .toString();
      } else {
        newAmount = Utils.bn(amount)
            .sub(Utils.getAmountInWei(entryAmount, decimals))
            .toString();
      }

      this.form.controls.formCollateral.patchValue({
        amount: newAmount
      });

      const formattedAmount = Utils.formatAmount(newAmount as any / 10 ** decimals);
      const collateralRatio: string =
        await this.collateralService.calculateCollateralPercentage(loan, currency, newAmount);

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
        await this.collateralService.calculateCollateralPercentage(loan, currency, amount);

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
   * Calculate the max withdraw amount
   * @return Max amount to withdraw in wei
   */
  private async calculateMaxWithdraw() {
    const { amount } = this.form.value.formCollateral;
    const { currency, collateralRatio, balanceRatio } = this.form.value.formRatios;
    const decimals: number = new Currency(currency.symbol).decimals;

    const balanceAmount = Utils.bn(balanceRatio)
        .mul(Utils.bn(amount))
        .div(Utils.bn(collateralRatio));

    const maxWithdraw: BN = Utils.bn(amount).sub(balanceAmount);
    const formattedMaxWithdraw =
      maxWithdraw.lte(Utils.bn(0)) ?
      '0' :
      this.formatAmount(maxWithdraw, decimals);

    this.form.controls.formRatios.patchValue({
      maxWithdraw: Utils.formatAmount(formattedMaxWithdraw)
    });

    return maxWithdraw;
  }

  /**
   * Get submit button text
   * @return Button text
   */
  get addButtonText(): string {
    if (!this.loading) {
      return 'Add';
    }
    return 'Adding...';
  }

  /**
   * Get submit button text
   * @return Button text
   */
  get withdrawButtonText(): string {
    if (!this.loading) {
      return 'Withdraw';
    }
    return 'Withdrawing...';
  }
}
