import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { timer } from 'rxjs';
import * as BN from 'bn.js';
import { environment } from './../../../../environments/environment';
import { Utils } from './../../../utils/utils';
import { Currency } from './../../../utils/currencies';
// App models
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';
// App services
import { Web3Service } from './../../../services/web3.service';
import { EventsService } from './../../../services/events.service';
import { ContractsService } from './../../../services/contracts.service';
import { CollateralService } from './../../../services/collateral.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';

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
  @Input() account: string;
  @Input() shortLoanId: string;
  @Input() startProgress: boolean;
  @Input() finishProgress: boolean;
  @Output() submitAdd = new EventEmitter<BN>();
  @Output() submitWithdraw = new EventEmitter<BN>();

  explorerAddress: string = environment.network.explorer.address;
  form: FormGroup;
  txCost: string;
  currentAmount: string;

  constructor(
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.buildForm();

    try {
      await this.completeForm();

      this.spinner.show();
      this.calculateMaxWithdraw();
      this.loadTxCost();
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
        this.showMessage(`Please select an amount no greater than the Maximum Withdrawal.`);
        return;
      }
      if (entryAmount <= 0) {
        this.showMessage(`Please select an amount greater than zero.`);
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
    const { currency } = this.form.value.formRatios;
    const decimals: number = new Currency(currency.symbol).decimals;
    const maxWithdraw = this.calculateMaxWithdraw();
    const entryAmount = this.formatAmount(maxWithdraw, decimals);

    this.form.controls.formUi.patchValue({
      entryAmount
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
        currentPrice: new FormControl(null, Validators.required),
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

    // set liquidation price
    const liquidationPrice = await this.collateralService.calculateLiquidationPrice(this.loan, loan.collateral);
    const currentLiquidationPrice = Utils.formatAmount(liquidationPrice, 4);

    // set current price
    const calculateCurrentPrice = await this.collateralService.calculateCurrentPrice(this.loan, loan.collateral);
    const currentPrice = Utils.formatAmount(calculateCurrentPrice, 4);

    this.form.controls.formCollateral.patchValue({
      id,
      token,
      amount
    });

    this.form.controls.formRatios.patchValue({
      liquidationRatio: liquidationPercentage,
      balanceRatio: balancePercentage,
      collateralRatio: collateralPercentage,
      liquidationPrice: currentLiquidationPrice,
      currentPrice: currentPrice,
      currency,
      formattedAmount
    });

    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      try {
        timer(100).subscribe(() => this.spinner.show());
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
        new Currency(currency.symbol).fromUnit(amount),
        4
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
  private calculateMaxWithdraw() {
    const { amount } = this.form.value.formCollateral;
    const { currency, collateralRatio, balanceRatio } = this.form.value.formRatios;
    const decimals: number = new Currency(currency.symbol).decimals;

    const collateralAdjustment: number = Math.floor(Number(collateralRatio));
    const balanceAmount = Utils.bn(balanceRatio)
        .mul(Utils.bn(amount))
        .div(Utils.bn(collateralAdjustment));

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

  private async loadTxCost() {
    this.txCost = null;

    const txCost = (await this.getTxCost()) / 10 ** 18;
    const rawEthUsd = await this.contractsService.latestAnswer();
    const ethUsd = rawEthUsd / 10 ** 8;

    this.txCost = Utils.formatAmount(txCost * ethUsd, 4);
  }

  /**
   * Calculate gas price * estimated gas
   * @return Tx cost
   */
  private async getTxCost() {
    const { collateral } = this.loan;
    const gasPrice = await this.web3Service.web3.eth.getGasPrice();
    const estimatedGas = await this.contractsService.addCollateral(
      collateral.id,
      collateral.token,
      collateral.amount.toString(),
      this.account,
      true
    );
    const gasLimit = Number(estimatedGas) * 110 / 100;
    const txCost = gasLimit * gasPrice;
    return txCost;
  }

  /**
   * Get submit button text
   * @return Button text
   */
  get addButtonText(): string {
    if (!this.loading) {
      return 'Deposit';
    }
    return 'Depositing...';
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
