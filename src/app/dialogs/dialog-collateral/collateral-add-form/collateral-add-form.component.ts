import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from '../../../utils/utils';
import { Currency } from '../../../utils/currencies';
import { environment } from '../../../../environments/environment';
// App models
import { Loan } from '../../../models/loan.model';
import { Collateral } from '../../../models/collateral.model';
// App services
import { Web3Service } from '../../../services/web3.service';
import { ContractsService } from '../../../services/contracts.service';
import { CollateralService } from '../../../services/collateral.service';
import { CurrenciesService } from '../../../services/currencies.service';

@Component({
  selector: 'app-collateral-add-form',
  templateUrl: './collateral-add-form.component.html',
  styleUrls: ['./collateral-add-form.component.scss']
})
export class CollateralAddFormComponent implements OnInit, OnChanges {
  @Input() loan: Loan;
  @Input() collateral: Collateral;
  @Input() loading: boolean;
  @Input() account: string;
  @Output() submitAdd = new EventEmitter<number>();

  form: FormGroup;
  collateralAmount: string;
  collateralAsset: any;
  collateralSymbol: string;
  collateralRate: string;
  loanCurrency: any;
  loanRate: string;
  loanInRcn: string;
  liquidationRatio: number;
  liquidationPrice: string;
  collateralRatio: number;
  balanceRatio: number;
  shortAccount: string;

  estimatedCollateralAmount: string;
  estimatedCollateralRatio: number;

  constructor(
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    try {
      await this.createFormControls();
      this.spinner.show();

      await this.getLoanDetails();
      await this.getCollateralDetails();
    } catch (e) {
      console.error(e);
    } finally {
      this.spinner.hide();
    }
  }

  async ngOnChanges(changes) {
    const web3: any = this.web3Service.web3;
    const { account } = changes;

    if (account && account.currentValue) {
      this.account = web3.toChecksumAddress(account.currentValue);
      await this.loadAccount();
    }
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
    const loan: Loan = this.loan;
    const loanCurrency = this.currenciesService.getCurrencyByKey('symbol', loan.currency.symbol);
    const rcnToken: string = environment.contracts.rcnToken;

    this.loanCurrency = loanCurrency;
    this.loanRate = await this.contractsService.getPriceConvertFrom(
      loanCurrency.address,
      rcnToken,
      10 ** 18
    );
    this.loanInRcn = await this.contractsService.getPriceConvertFrom(
      loanCurrency.address,
      rcnToken,
      loan.amount
    );
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
    const rcnToken: string = environment.contracts.rcnToken;
    this.collateralAmount = Utils.formatAmount(collateralAmount);
    this.collateralAsset = collateralCurrency;
    this.collateralSymbol = collateralCurrency.symbol;
    this.collateralRate = await this.contractsService.getPriceConvertFrom(
      collateralCurrency.address,
      rcnToken,
      10 ** 18
    );
    this.balanceRatio = collateral.balanceRatio / 100;
    this.liquidationRatio = collateral.liquidationRatio / 100;
    this.collateralRatio = this.calculateCollateralRatio();

    const liquidationPrice = await this.calculateLiquidationPrice();
    this.liquidationPrice = Utils.formatAmount(liquidationPrice);
    console.info('liquidation price', Number(liquidationPrice));
    console.info('collateral ratio', Number(this.collateralRatio));
    console.info('liquidation ratio', Number(this.liquidationRatio));
  }

  /**
   * Get short account address
   */
  async loadAccount() {
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
      this.estimatedCollateralRatio = this.collateralRatio;
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
   * @fires submitAdd
   */
  onSubmit(form: FormGroup) {
    const collateralRatio = Number(this.estimatedCollateralRatio);
    const balanceRatio = Number(this.balanceRatio);
    const amount = form.value.amount;

    if (this.loading) {
      return;
    }
    if (collateralRatio < balanceRatio) {
      this.showMessage(`The collateral is too low, make sure it is greater than ${ balanceRatio }%`);
      return;
    }
    if (amount <= 0) {
      this.showMessage(`The collateral amount must be greater than 0`);
      return;
    }

    this.submitAdd.emit(amount);
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
    const amountToAdd: number = form.value.amount || 0;
    const collateralAmount = new web3.BigNumber(this.collateralAmount);

    try {
      const estimated: number = collateralAmount.add(amountToAdd);
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
