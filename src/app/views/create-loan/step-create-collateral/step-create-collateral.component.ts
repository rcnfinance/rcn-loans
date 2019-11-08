import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from '../../../utils/utils';
import { Currency } from '../../../utils/currencies';
import { Loan } from './../../../models/loan.model';
import { CollateralRequest } from './../../../interfaces/collateral-request';
import { environment } from './../../../../environments/environment';
// App Components
import { DialogGenericErrorComponent } from '../../../dialogs/dialog-generic-error/dialog-generic-error.component';
// App Services
import { ContractsService } from './../../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';
import { Web3Service } from './../../../services/web3.service';
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-step-create-collateral',
  templateUrl: './step-create-collateral.component.html',
  styleUrls: ['./step-create-collateral.component.scss']
})
export class StepCreateCollateralComponent implements OnInit {

  // Static data
  currencies = [];
  account: string;

  // Loan form
  form: FormGroup;
  balanceRatio: FormControl;
  collateralAdjustment: FormControl;
  collateralAsset: FormControl;
  collateralAmount: FormControl;
  liquidationRatio: FormControl;

  // Collateral state
  collateralAmountObserver: any;
  collateralSelectedOracle: any;
  collateralSelectedCurrency: CurrencyItem;
  collateralWasCreated = false;
  @Input() loan: Loan;
  @Input() createPendingTx: Tx;
  @Input() collateralPendingTx: Tx;
  @Output() updateCollateralRequest = new EventEmitter<CollateralRequest>();

  // subscriptions
  txSubscription: boolean;
  subscriptionAccount: Subscription;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.getCurrencies();
    this.createFormControls();
    this.createForm();
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
   * Get available currencies for loan and collateral select
   */
  getCurrencies() {
    this.currencies = this.currenciesService.getCurrencies();
  }

  /**
   * Create form controls and define values
   */
  createFormControls() {
    // Loan form
    this.collateralAdjustment = new FormControl(undefined, Validators.required);
    this.collateralAsset = new FormControl(null);
    this.collateralAmount = new FormControl(null, Validators.required);
    this.liquidationRatio = new FormControl(150, Validators.required);
    this.balanceRatio = new FormControl(200, Validators.required);
  }

  /**
   * Create form object variables
   */
  createForm() {
    this.form = new FormGroup({
      collateralAdjustment: this.collateralAdjustment,
      collateralAsset: this.collateralAsset,
      collateralAmount: this.collateralAmount,
      liquidationRatio: this.liquidationRatio,
      balanceRatio: this.balanceRatio
    });
  }

  /**
   * Change collateral asset and restore form values
   * @param symbol Collateral asset symbol
   */
  async onCollateralAssetChange(symbol) {
    await this.updateSelectedCurrency(symbol);
    const form: FormGroup = this.form;
    if (!form.value.collateralAdjustment) {
      await this.onCollateralRatioChange();
    }

    await this.updateCollateralAmount();
    this.updateRequestCollateralModel();
  }

  /**
   * Calculate the balance ratio
   */
  async onCollateralAmountChange(collateralValue) {
    if (!this.collateralAmountObserver) {
      new Observable(observer => {
        this.collateralAmountObserver = observer;
      }).pipe(debounceTime(300))
        .subscribe(async () => {
          this.spinner.show();
          try {
            await this.calculateCollateralRatio();
          } catch (e) {
            console.error(e);
          } finally {
            this.spinner.hide();
          }
        });
    }

    this.collateralAmountObserver.next(collateralValue);
    this.updateRequestCollateralModel();
  }

  /**
   * Set balance ratio min value and update collateral amount input
   */
  async onLiquidationRatioChange() {
    const currency: string = this.collateralAsset.value;
    if (!currency) {
      return;
    }

    this.updateBalanceRatio();
    this.updateCollateralRatio();
    await this.updateCollateralAmount();
    this.updateRequestCollateralModel();
  }

  /**
   * Calculate the collateral amount
   */
  async onCollateralRatioChange() {
    this.updateCollateralRatio();
    this.spinner.show();
    try {
      await this.updateCollateralAmount();
    } catch (e) {
      console.error(e);
    } finally {
      this.spinner.hide();
    }
    this.updateRequestCollateralModel();
  }

  /**
   * Update collateral ratio slider
   */
  updateCollateralRatio() {
    const form: FormGroup = this.form;
    const balanceRatio: number = form.value.balanceRatio;
    const collateralRatio: number = form.value.collateralAdjustment;

    if (collateralRatio < balanceRatio) {
      this.form.patchValue({
        collateralAdjustment: balanceRatio
      });
    }
  }

  async calculateCollateralRatio() {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const collateralForm: FormGroup = this.form;
    const collateralAmount = new web3.BigNumber(collateralForm.value.collateralAmount);
    const collateralAmountMinLimit = 0;
    const balanceRatioMaxLimit = 5000;

    if (collateralAmount <= collateralAmountMinLimit) {
      this.showMessage('Choose a bigger collateral amount', 'snackbar');
      return false;
    }

    try {
      const loanAmount = loan.currency.fromUnit(loan.amount);
      const loanCurrency = loan.currency.symbol;
      const collateralCurrency = this.collateralSelectedCurrency.symbol;
      const hundredPercent = 100 * 100;

      let loanAmountInCollateral = await this.calculateCollateralAmount(
        loanAmount,
        loanCurrency,
        hundredPercent,
        collateralCurrency
      );
      loanAmountInCollateral = web3.fromWei(loanAmountInCollateral);

      const collateralRatio = (collateralAmount.mul(100)).div(loanAmountInCollateral);

      if (collateralRatio >= balanceRatioMaxLimit) {
        this.showMessage('Choose a smaller collateral amount', 'snackbar');
        return false;
      }

      this.form.patchValue({
        collateralAdjustment: Utils.formatAmount(collateralRatio, 0)
      });
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Update selected oracle
   * @param symbol Currency symbol
   */
  async updateSelectedCurrency(symbol: string) {
    const oracle: string = await this.contractsService.symbolToOracle(symbol);
    const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('symbol', symbol);

    this.collateralSelectedCurrency = currency;
    this.collateralSelectedOracle = oracle;
  }

  /**
   * Update collateral amount input
   */
  async updateCollateralAmount() {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const collateralForm: FormGroup = this.form;
    const collateralRatio: any = new web3.BigNumber(collateralForm.value.collateralAdjustment);
    const collateralRatioMinLimit = 0;
    const collateralRatioMaxLimit = 5000;

    if (collateralRatio <= collateralRatioMinLimit) {
      this.showMessage('Choose a bigger collateral amount', 'snackbar');
      return false;
    }
    if (collateralRatio >= collateralRatioMaxLimit) {
      this.showMessage('Choose a smaller collateral amount', 'snackbar');
      return false;
    }

    try {
      const loanAmount = loan.currency.fromUnit(loan.amount);
      const loanCurrency = loan.currency.symbol;
      const collateralCurrency = this.collateralSelectedCurrency.symbol;

      const amount = await this.calculateCollateralAmount(
        loanAmount,
        loanCurrency,
        collateralRatio.mul(100),
        collateralCurrency
      );

      this.form.patchValue({
        collateralAmount: Utils.formatAmount(web3.fromWei(amount))
      });
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Update balance ratio
   */
  updateBalanceRatio() {
    const form: FormGroup = this.form;
    const liquidationRatio: number = form.value.liquidationRatio;
    const balanceRatio: number = liquidationRatio + 50;

    this.form.patchValue({
      balanceRatio
    });
  }

  /**
   * Calculate required amount in collateral token
   * @param loanAmount Loan amount in rcn
   * @param loanCurrency Loan currency symbol
   * @param collateralRatio Collateral balance ratio
   * @param collateralAsset Collateral currency token symbol
   * @return Collateral amount in collateral asset
   */
  async calculateCollateralAmount(
    loanAmount: number,
    loanCurrency: string,
    collateralRatio: number,
    collateralAsset: string
  ) {
    const web3: any = this.web3Service.web3;
    collateralRatio = new web3.BigNumber(collateralRatio).div(100);

    // calculate amount in rcn
    let collateralAmount = new web3.BigNumber(collateralRatio).mul(loanAmount, 10);
    collateralAmount = collateralAmount.div(100);

    // convert amount to collateral asset
    if (loanCurrency === collateralAsset) {
      collateralAmount = new web3.toWei(collateralAmount);
    } else {
      const fromToken: any = environment.contracts.rcnToken;
      const toToken: any = this.currenciesService.getCurrencyByKey('symbol', collateralAsset).address;
      const cost = await this.contractsService.getPriceConvertFrom(
        fromToken,
        toToken,
        web3.toWei(collateralAmount)
      );
      collateralAmount = cost;
    }

    return collateralAmount;
  }

  /**
   * Set user account address
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
  }

  /**
   * Update request collateral model
   * @return New request collateral model
   */
  private updateRequestCollateralModel() {
    const web3: any = this.web3Service.web3;
    const form: FormGroup = this.form;
    const loan: Loan = this.loan;
    const loanId: string = loan.id;
    const oracle: string = this.collateralSelectedOracle;
    const currency = new Currency(
      this.collateralSelectedCurrency ? this.collateralSelectedCurrency.symbol : 'RCN'
    );
    const collateralToken: string = this.collateralSelectedCurrency.address;
    const collateralAmount: number = form.value.collateralAmount * (10 ** currency.decimals);
    const liquidationRatio: number = new web3.BigNumber(form.value.liquidationRatio).mul(100);
    const balanceRatio: number = new web3.BigNumber(form.value.balanceRatio).mul(100);
    const burnFee: number = new web3.BigNumber(500);
    const rewardFee: number = new web3.BigNumber(500);
    const account: string = this.account;

    try {
      const collateralRequest: CollateralRequest = {
        loanId,
        oracle,
        collateralToken,
        collateralAmount,
        liquidationRatio,
        balanceRatio,
        burnFee,
        rewardFee,
        account
      };

      this.updateCollateralRequest.emit(collateralRequest);
    } catch (e) {
      throw Error('error on update request collateral');
    }
  }

  /**
   * Show dialog or snackbar with a message
   * @param message The message to show in the snackbar
   * @param type UI Format: dialog or snackbar
   */
  private showMessage(message: string, type: 'dialog' | 'snackbar') {
    switch (type) {
      case 'dialog':
        const error: Error = {
          name: 'Error',
          message: message
        };
        this.dialog.open(DialogGenericErrorComponent, {
          data: {
            error
          }
        });
        break;

      case 'snackbar':
        this.snackBar.open(message , null, {
          duration: 4000,
          horizontalPosition: 'center'
        });
        break;

      default:
        console.error(message);
        break;
    }
  }
}
